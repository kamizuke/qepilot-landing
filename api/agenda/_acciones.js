// Agenda y seguimiento · lo que hacen los dos endpoints. Reciben sus
// dependencias (datos, correo, reloj, ajustes) para poder probarse sin
// Supabase ni SMTP: tools/agenda-local.mjs y tests/agenda.test.js.
import crypto from "node:crypto";
import { compararTexto, limitador, ipDe, generarToken, generarClave } from "../deck/_comun.js";
import { RESERVA } from "./_datos.js";
import {
  RESULTADOS,
  partesMadrid,
  madridAUtc,
  huecosLibres,
  validarHorario,
  crearIcs,
  texto,
  textoLargo,
  emailValido,
  leerCsvContactos,
  claveContacto,
  correoConfirmacion,
  correoCambio,
  correoCancelacion,
  correoAviso,
  escaparHtml,
} from "./_logica.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;
const LOCAL = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/;

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

// Huella de la clave de cada persona que llama. Las claves las genera el
// panel (12 caracteres aleatorios), así que basta un HMAC con secreto propio.
export function huellaClave(clave, secreto) {
  return crypto.createHmac("sha256", `agenda-setter|${secreto}`).update(String(clave)).digest("hex");
}

export function ajustesDeEntorno() {
  return {
    claveAdmin: process.env.AGENDA_ADMIN_CLAVE || "",
    claveSetter: process.env.AGENDA_SETTER_CLAVE || "",
    secreto: process.env.SUPABASE_SERVICE_ROLE || "",
    avisos: process.env.AGENDA_AVISOS_EMAIL || "",
    base: (process.env.AGENDA_URL_BASE || "https://evidran.com").replace(/\/+$/, ""),
  };
}

const MENSAJES = {
  hueco_ocupado: "Ese hueco se acaba de ocupar. Elige otro.",
  hueco_bloqueado: "Ese rato está bloqueado en la agenda. Elige otro.",
  cita_no_disponible: "Esta demo ya no está activa.",
  contacto_no_existe: "Ese contacto ya no existe. Recarga la página.",
};

// Quién entra: Lissette (admin), la clave común antigua de setter
// (setterId null, ve los contactos sin asignar) o una persona con su clave.
async function identificar(deps, a, dada) {
  if (!dada) return null;
  if (compararTexto(dada, a.claveAdmin)) return { rol: "admin", setterId: null, nombre: "Administración" };
  if (a.claveSetter && compararTexto(dada, a.claveSetter)) return { rol: "setter", setterId: null, nombre: "Setter" };
  if (dada.length < 10 || dada.length > 64) return null;
  const s = await deps.datos.setterPorHash(huellaClave(dada, a.secreto));
  return s && s.activo ? { rol: "setter", setterId: s.id, nombre: s.nombre } : null;
}

// Una persona que llama solo toca sus contactos y sus demos.
function esSuyo(quien, fila) {
  return quien.rol === "admin" || (fila && (fila.setter_id || null) === quien.setterId);
}

const NO_ES_TUYO = "Ese contacto no está en tu lista.";

function fallo(res, err, donde) {
  if (err?.codigo && MENSAJES[err.codigo]) return res.status(409).json({ error: MENSAJES[err.codigo], codigo: err.codigo });
  console.error(`agenda ${donde} error:`, err?.message || err);
  return res.status(502).json({ error: "No se pudo completar. Inténtalo de nuevo en un momento." });
}

async function calcularHuecos(deps, excepto = null) {
  const ahora = deps.ahora();
  const desde = ahora.toISOString();
  const [config, citas, bloqueos] = await Promise.all([
    deps.datos.leerConfig(),
    deps.datos.citasConfirmadasDesde(desde),
    deps.datos.listarBloqueos(desde),
  ]);
  return { config, huecos: config ? huecosLibres({ config, citas, bloqueos, ahora, excepto }) : [] };
}

// Correo a la persona y aviso interno (AGENDA_AVISOS_EMAIL), con la invitación de calendario.
// Si falla, la cita ya está hecha: se devuelve false y la pantalla lo dice.
async function notificar(deps, tipo, cita, { config, token, porLaPersona, quien, tipoAviso } = {}) {
  const correo = deps.correo;
  if (!correo) return false;
  const a = deps.ajustes();
  const enlaceReunion = config?.enlace_reunion || null;
  const enlaceGestion = token ? `${a.base}/cita/${token}` : `${a.base}/`;
  const metodo = tipo === "cancelada" ? "CANCEL" : "REQUEST";
  const ics = crearIcs({
    cita,
    metodo,
    organizador: { nombre: "Evidran", email: correo.remitente },
    avisos: a.avisos,
    enlaceReunion,
    ahora: deps.ahora(),
  });
  const paraPersona =
    tipo === "nueva"
      ? correoConfirmacion({ cita, enlaceReunion, enlaceGestion })
      : tipo === "cambio"
        ? correoCambio({ cita, enlaceReunion, enlaceGestion })
        : correoCancelacion({ cita, porLaPersona });
  let ok = true;
  try {
    await correo.enviar({ para: cita.email, ...paraPersona, ics, metodo, responderA: a.avisos });
  } catch (err) {
    ok = false;
    console.error(`agenda correo ${tipo} a la persona falló:`, err?.code || err?.responseCode || "sin código");
  }
  if (a.avisos) {
    try {
      await correo.enviar({ para: a.avisos, ...correoAviso({ tipo: tipoAviso || tipo, cita, quien }), ics, metodo });
    } catch (err) {
      console.error(`agenda aviso ${tipo} falló:`, err?.code || err?.responseCode || "sin código");
    }
  }
  return ok;
}

// ============================================================
// /api/agenda/trabajo — la página /llamadas (setter y Lissette)
// ============================================================
export function crearTrabajo(deps) {
  const limitado = limitador(300, 10 * 60 * 1000);
  const fallosClave = limitador(10, 10 * 60 * 1000);

  return async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    const a = deps.ajustes();
    if (!deps.datos || !a.claveAdmin) {
      console.error("agenda/trabajo: faltan variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE / AGENDA_ADMIN_CLAVE)");
      return res.status(503).json({ error: "La agenda no está configurada todavía." });
    }
    const ip = ipDe(req);
    if (limitado(ip)) return res.status(429).json({ error: "Demasiadas peticiones. Espera unos minutos." });

    const body = req.body || {};
    const accion = body.accion;
    try {
      const quien = await identificar(deps, a, String(req.headers["x-clave"] || ""));
      if (!quien) {
        if (fallosClave(ip)) return res.status(429).json({ error: "Demasiados intentos. Espera unos minutos." });
        return res.status(401).json({ error: "Clave incorrecta." });
      }
      const rol = quien.rol;
      const soloAdmin = ["importar", "borrar_contacto", "guardar_config", "crear_bloqueo", "borrar_bloqueo", "cancelar_cita",
        "crear_setter", "editar_setter", "nueva_clave_setter", "asignar", "repartir", "quedarme"];
      if (soloAdmin.includes(accion) && rol !== "admin") {
        return res.status(403).json({ error: "Esta acción no está disponible con tu clave." });
      }

      switch (accion) {
        case "entrar":
          return res.status(200).json({ rol, nombre: quien.nombre });
        case "estado":
          return await estado(deps, quien, res);
        case "huecos": {
          const { huecos } = await calcularHuecos(deps);
          return res.status(200).json({ huecos });
        }
        case "reservar":
          return await reservar(deps, quien, body, res);
        case "llamada":
          return await llamada(deps, quien, body, res);
        case "editar_contacto":
          return await editarContacto(deps, quien, body, res);
        case "importar":
          return await importar(deps, body, res);
        case "borrar_contacto":
          if (!UUID.test(String(body.id || ""))) return res.status(400).json({ error: "Contacto no válido." });
          await deps.datos.borrarContacto(body.id);
          return res.status(200).json({ ok: true });
        case "guardar_config":
          return await guardarConfig(deps, body, res);
        case "crear_bloqueo":
          return await crearBloqueo(deps, body, res);
        case "borrar_bloqueo":
          if (!UUID.test(String(body.id || ""))) return res.status(400).json({ error: "Bloqueo no válido." });
          await deps.datos.borrarBloqueo(body.id);
          return res.status(200).json({ ok: true });
        case "editar_cita":
          return await editarCita(deps, quien, body, res);
        case "cancelar_cita":
          return await cancelarCita(deps, body, res);
        case "crear_setter":
          return await crearSetter(deps, body, res);
        case "editar_setter":
          return await editarSetter(deps, body, res);
        case "nueva_clave_setter":
          return await nuevaClaveSetter(deps, body, res);
        case "asignar":
          return await asignar(deps, body, res);
        case "repartir":
          return await repartir(deps, res);
        case "quedarme":
          return await quedarme(deps, body, res);
        default:
          return res.status(400).json({ error: "Acción no reconocida." });
      }
    } catch (err) {
      return fallo(res, err, accion);
    }
  };
}

async function estado(deps, quien, res) {
  const rol = quien.rol;
  const ahora = deps.ahora();
  const hace30 = new Date(ahora.getTime() - 30 * 86400000).toISOString();
  const [config, todosContactos, llamadas, todasCitas, bloqueos, setters] = await Promise.all([
    deps.datos.leerConfig(),
    deps.datos.listarContactos(),
    deps.datos.listarLlamadas(),
    deps.datos.citasRecientes(hace30),
    rol === "admin" ? deps.datos.listarBloqueos(ahora.toISOString()) : Promise.resolve([]),
    deps.datos.listarSetters(),
  ]);
  const nombres = new Map(setters.map((x) => [x.id, x.nombre]));
  const quienLlamo = (l) => (l.rol === "admin" ? "administración" : l.setter_id ? nombres.get(l.setter_id) || "Setter" : "Setter (clave común)");

  const porContacto = new Map();
  for (const l of llamadas) {
    if (!l.contacto_id) continue;
    if (!porContacto.has(l.contacto_id)) porContacto.set(l.contacto_id, []);
    porContacto.get(l.contacto_id).push({ hechaEn: l.hecha_en, resultado: l.resultado, nota: l.nota, rol: l.rol, quien: quienLlamo(l) });
  }

  // Lo que cuenta: para una persona, solo sus llamadas; para Lissette, todas.
  const propias = rol === "admin" ? llamadas : llamadas.filter((l) => l.rol === "setter" && (l.setter_id || null) === quien.setterId);
  const contactos = rol === "admin" ? todosContactos : todosContactos.filter((c) => esSuyo(quien, c));
  const citas = rol === "admin" ? todasCitas : todasCitas.filter((c) => esSuyo(quien, c));

  const hoy = partesMadrid(ahora).fecha;
  const resumen = { llamadasSetter: 0, llamadasSetterHoy: 0, llamadasAdmin: 0, porResultado: {}, porDia: {} };
  const porPersona = new Map();
  for (const l of propias) {
    if (l.rol === "setter") {
      resumen.llamadasSetter++;
      const dia = partesMadrid(new Date(l.hecha_en)).fecha;
      if (dia === hoy) resumen.llamadasSetterHoy++;
      resumen.porDia[dia] = (resumen.porDia[dia] || 0) + 1;
      const k = l.setter_id || "comun";
      if (!porPersona.has(k)) porPersona.set(k, { id: l.setter_id || null, nombre: quienLlamo(l), llamadas: 0, hoy: 0, demos: 0 });
      const p = porPersona.get(k);
      p.llamadas++;
      if (dia === hoy) p.hoy++;
      if (l.resultado === "demo") p.demos++;
    } else resumen.llamadasAdmin++;
    resumen.porResultado[l.resultado] = (resumen.porResultado[l.resultado] || 0) + 1;
  }
  const confirmadas = citas.filter((c) => c.estado === "confirmada");
  resumen.demosProximas = confirmadas.filter((c) => new Date(c.fin) > ahora).length;
  resumen.demosHechas = confirmadas.filter((c) => new Date(c.fin) <= ahora).length;
  resumen.demosCanceladas = citas.length - confirmadas.length;
  if (rol === "admin") {
    for (const x of setters) if (!x.reservado && !porPersona.has(x.id)) porPersona.set(x.id, { id: x.id, nombre: x.nombre, llamadas: 0, hoy: 0, demos: 0 });
    resumen.porPersona = [...porPersona.values()].sort((a, b) => b.llamadas - a.llamadas);
  }

  return res.status(200).json({
    rol,
    yo: { nombre: quien.nombre, setterId: quien.setterId },
    ahora: ahora.toISOString(),
    resultados: RESULTADOS,
    config:
      rol === "admin"
        ? config
        : config && { duracion_min: config.duracion_min, margen_min: config.margen_min },
    setters: rol === "admin" ? setters : [],
    contactos: contactos.map((c) => ({ ...c, historial: porContacto.get(c.id) || [] })),
    citas: citas.map((c) => ({ ...c, reservadaPor: c.origen === "admin" ? "administración" : c.origen === "web" ? "la propia persona" : c.setter_id ? nombres.get(c.setter_id) || "Setter" : "Setter (clave común)" })),
    bloqueos,
    resumen,
  });
}

async function reservar(deps, quien, body, res) {
  const rol = quien.rol;
  const nombre = texto(body.nombre, 120);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!nombre || !emailValido(email)) {
    return res.status(400).json({ error: "Faltan el nombre o un correo válido de la persona." });
  }
  const contactoId = body.contactoId ? String(body.contactoId) : null;
  if (contactoId && !UUID.test(contactoId)) return res.status(400).json({ error: "Contacto no válido." });
  if (contactoId && !esSuyo(quien, await deps.datos.contactoPorId(contactoId))) return res.status(403).json({ error: NO_ES_TUYO });

  const { config, huecos } = await calcularHuecos(deps);
  const hueco = huecos.find((h) => h.inicio === String(body.inicio || ""));
  if (!hueco) return res.status(409).json({ error: MENSAJES.hueco_ocupado, codigo: "hueco_ocupado" });

  const token = generarToken();
  const cita = {
    inicio: hueco.inicio,
    fin: hueco.fin,
    nombre,
    empresa: texto(body.empresa, 160),
    email,
    telefono: texto(body.telefono, 40),
    notas: textoLargo(body.notas, 1500),
    origen: rol,
    secuencia: 0,
  };
  cita.id = await deps.datos.reservar({
    ...cita,
    margen: config.margen_min,
    contactoId,
    tokenHash: hashToken(token),
    rol,
    setterId: quien.setterId,
  });
  const correo = await notificar(deps, "nueva", cita, { config, token, quien: rol === "admin" ? "ti" : quien.nombre });
  return res.status(200).json({ ok: true, id: cita.id, correo });
}

async function llamada(deps, quien, body, res) {
  const contactoId = String(body.contactoId || "");
  const resultado = String(body.resultado || "");
  if (!UUID.test(contactoId) || !RESULTADOS[resultado] || resultado === "demo") {
    return res.status(400).json({ error: "Datos de la llamada no válidos." });
  }
  let volverEn = null;
  if (resultado === "volver" && body.volverEn) {
    const m = LOCAL.exec(String(body.volverEn));
    if (!m) return res.status(400).json({ error: "Fecha para volver a llamar no válida." });
    volverEn = madridAUtc(m[1], m[2]).toISOString();
  }
  // «Info por correo»: el correo al que enviarla (se guarda en el contacto).
  let email = null;
  if (resultado === "info" && typeof body.email === "string" && body.email.trim()) {
    email = body.email.trim();
    if (!emailValido(email)) return res.status(400).json({ error: "El correo no parece válido." });
  }
  const contacto = await deps.datos.contactoPorId(contactoId);
  if (!esSuyo(quien, contacto)) return res.status(403).json({ error: NO_ES_TUYO });
  const nota = textoLargo(body.nota, 600);
  await deps.datos.registrarLlamada(contactoId, resultado, nota, volverEn, quien.rol, quien.setterId);
  let aviso = null;
  if (resultado === "info") {
    if (email && email !== contacto.email) await deps.datos.editarContacto(contactoId, { email });
    aviso = await avisarInfo(deps, { ...contacto, email: email || contacto.email }, nota, quien);
  }
  return res.status(200).json({ ok: true, aviso });
}

// Aviso para enviar la información a mano (la setter no envía correos).
async function avisarInfo(deps, c, nota, quien) {
  const a = deps.ajustes();
  if (!deps.correo || !a.avisos) return false;
  const filas = [
    ["Empresa", c.empresa],
    ["Persona", [c.persona, c.cargo].filter(Boolean).join(" · ") || "—"],
    ["Correo", c.email || "— (no lo dio)"],
    ["Teléfono", c.telefono || "—"],
    ["Nota de la llamada", nota || "—"],
    ["Anotado por", quien.rol === "admin" ? "ti" : quien.nombre],
  ];
  try {
    await deps.correo.enviar({
      para: a.avisos,
      asunto: `Enviar información: ${c.empresa}`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16202B"><p style="margin:0 0 12px;font-weight:bold">Han pedido información por correo</p>` +
        `<table style="border-collapse:collapse;font-size:14px">${filas
          .map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#5B6675;vertical-align:top">${k}</td><td style="padding:4px 0;white-space:pre-wrap">${escaparHtml(v)}</td></tr>`)
          .join("")}</table>` +
        `<p style="margin:16px 0 0"><a href="${escaparHtml(a.base)}/llamadas">Abrir la lista de llamadas</a></p></div>`,
    });
    return true;
  } catch (err) {
    console.error("agenda aviso de info falló:", err?.code || err?.responseCode || "sin código");
    return false;
  }
}

async function editarContacto(deps, quien, body, res) {
  const rol = quien.rol;
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Contacto no válido." });
  if (!esSuyo(quien, await deps.datos.contactoPorId(id))) return res.status(403).json({ error: NO_ES_TUYO });
  const c = body.campos || {};
  const campos = {};
  const limites = { persona: 120, cargo: 120, telefono: 40 };
  if (rol === "admin") Object.assign(limites, { empresa: 160, web: 200, ciudad: 80, origen: 300 });
  for (const [k, max] of Object.entries(limites)) if (k in c) campos[k] = texto(c[k], max);
  if ("notas" in c) campos.notas = textoLargo(c.notas, 2000);
  if ("email" in c) {
    const e = typeof c.email === "string" ? c.email.trim() : "";
    if (e && !emailValido(e)) return res.status(400).json({ error: "El correo no parece válido." });
    campos.email = e || null;
  }
  if ("empresa" in campos && !campos.empresa) return res.status(400).json({ error: "La empresa no puede quedar vacía." });
  if (!Object.keys(campos).length) return res.status(400).json({ error: "No hay cambios." });
  await deps.datos.editarContacto(id, campos);
  return res.status(200).json({ ok: true });
}

async function importar(deps, body, res) {
  if (typeof body.csv !== "string" || body.csv.length > 2_000_000) {
    return res.status(400).json({ error: "Pega el contenido del CSV (máximo 2 MB)." });
  }
  const leido = leerCsvContactos(body.csv);
  if (leido.error) return res.status(400).json({ error: leido.error });
  const existentes = new Set((await deps.datos.listarContactos()).map(claveContacto));
  const nuevos = [];
  let repetidos = 0;
  for (const c of leido.contactos) {
    const k = claveContacto(c);
    if (existentes.has(k)) {
      repetidos++;
      continue;
    }
    existentes.add(k);
    nuevos.push(c);
  }
  // Asignar: "" = sin asignar, un id = a esa persona, "repartir" = entre las activas.
  const asignarA = String(body.asignar || "");
  if (asignarA) {
    const activas = (await deps.datos.listarSetters()).filter((x) => x.activo).map((x) => x.id);
    if (asignarA === "repartir") {
      if (!activas.length) return res.status(400).json({ error: "No hay personas activas entre las que repartir." });
      nuevos.forEach((c, i) => (c.setter_id = activas[i % activas.length]));
    } else {
      if (!activas.includes(asignarA)) return res.status(400).json({ error: "Esa persona no existe o está desactivada." });
      nuevos.forEach((c) => (c.setter_id = asignarA));
    }
  } else nuevos.forEach((c) => (c.setter_id = null));
  for (let i = 0; i < nuevos.length; i += 500) await deps.datos.crearContactos(nuevos.slice(i, i + 500));
  return res.status(200).json({
    creados: nuevos.length,
    repetidos,
    sinEmpresa: leido.sinEmpresa,
    recortados: leido.recortados,
  });
}

async function guardarConfig(deps, body, res) {
  const horario = validarHorario(body.horario);
  if (!horario) return res.status(400).json({ error: "El horario no es válido: revisa que cada tramo empiece antes de acabar y no se pisen." });
  const entero = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : null);
  const duracion = entero(body.duracion_min, 15, 120);
  const margen = entero(body.margen_min, 0, 60);
  const antelacion = entero(body.antelacion_horas, 0, 168);
  const dias = entero(body.dias_vista, 1, 90);
  if ([duracion, margen, antelacion, dias].includes(null)) {
    return res.status(400).json({ error: "Revisa la duración, el margen, la antelación y los días a la vista." });
  }
  const enlace = typeof body.enlace_reunion === "string" ? body.enlace_reunion.trim() : "";
  if (enlace && (!/^https:\/\/\S+$/.test(enlace) || enlace.length > 600)) {
    return res.status(400).json({ error: "El enlace de la videollamada debe empezar por https://" });
  }
  await deps.datos.guardarConfig({
    horario,
    duracion_min: duracion,
    margen_min: margen,
    antelacion_horas: antelacion,
    dias_vista: dias,
    enlace_reunion: enlace || null,
  });
  return res.status(200).json({ ok: true });
}

async function crearBloqueo(deps, body, res) {
  const d = LOCAL.exec(String(body.desde || ""));
  const h = LOCAL.exec(String(body.hasta || ""));
  if (!d || !h) return res.status(400).json({ error: "Indica desde y hasta." });
  const desde = madridAUtc(d[1], d[2]);
  const hasta = madridAUtc(h[1], h[2]);
  if (!(hasta > desde) || hasta - desde > 400 * 86400000) {
    return res.status(400).json({ error: "El final del bloqueo debe ser posterior al inicio." });
  }
  await deps.datos.crearBloqueo({ desde: desde.toISOString(), hasta: hasta.toISOString(), motivo: texto(body.motivo, 120) });
  return res.status(200).json({ ok: true });
}

// Corregir los datos de una demo próxima (p. ej. un correo mal escrito).
// Si cambia el correo, o se pide reenviar, sale de nuevo la invitación con
// un enlace «cambiar o cancelar» nuevo: el anterior deja de funcionar.
async function editarCita(deps, quien, body, res) {
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Cita no válida." });
  const cita = await deps.datos.citaPorId(id);
  if (!cita || cita.estado !== "confirmada" || new Date(cita.fin) <= deps.ahora()) {
    return res.status(409).json({ error: MENSAJES.cita_no_disponible });
  }
  if (!esSuyo(quien, cita)) return res.status(403).json({ error: "Esa demo no es tuya." });
  const c = body.campos || {};
  const campos = {};
  if ("nombre" in c) {
    campos.nombre = texto(c.nombre, 120);
    if (!campos.nombre) return res.status(400).json({ error: "El nombre no puede quedar vacío." });
  }
  if ("empresa" in c) campos.empresa = texto(c.empresa, 160);
  if ("telefono" in c) campos.telefono = texto(c.telefono, 40);
  if ("notas" in c) campos.notas = textoLargo(c.notas, 1500);
  if ("email" in c) {
    const e = typeof c.email === "string" ? c.email.trim() : "";
    if (!emailValido(e)) return res.status(400).json({ error: "El correo no parece válido." });
    campos.email = e;
  }
  const cambiaEmail = "email" in campos && campos.email.toLowerCase() !== String(cita.email).toLowerCase();
  const reenviar = cambiaEmail || body.reenviar === true;
  let token = null;
  if (reenviar) {
    token = generarToken();
    campos.token_hash = hashToken(token);
    campos.secuencia = (cita.secuencia || 0) + 1;
  }
  if (!Object.keys(campos).length) return res.status(400).json({ error: "No hay cambios." });
  await deps.datos.editarCita(id, campos);
  if (cambiaEmail && cita.contacto_id) {
    await deps.datos.editarContacto(cita.contacto_id, { email: campos.email }).catch(() => {});
  }
  let correo = null;
  if (reenviar) {
    const config = await deps.datos.leerConfig();
    const por = quien.rol === "admin" ? "administración" : quien.nombre;
    correo = await notificar(deps, "nueva", { ...cita, ...campos }, { config, token, quien: por, tipoAviso: "reenvio" });
  }
  return res.status(200).json({ ok: true, reenviada: reenviar, correo });
}

async function cancelarCita(deps, body, res) {
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Cita no válida." });
  const cita = await deps.datos.citaPorId(id);
  if (!cita || cita.estado !== "confirmada") return res.status(409).json({ error: MENSAJES.cita_no_disponible });
  cita.secuencia = await deps.datos.cancelar(id, "administración");
  const config = await deps.datos.leerConfig();
  const correo = new Date(cita.fin) > deps.ahora()
    ? await notificar(deps, "cancelada", cita, { config, porLaPersona: false, quien: "ti" })
    : true;
  return res.status(200).json({ ok: true, correo });
}

// --- Personas que llaman (solo Lissette) ---
async function crearSetter(deps, body, res) {
  const nombre = texto(body.nombre, 80);
  if (!nombre) return res.status(400).json({ error: "Escribe el nombre de la persona." });
  const clave = generarClave(12);
  const fila = await deps.datos.crearSetter({ nombre, clave_hash: huellaClave(clave, deps.ajustes().secreto) });
  // La clave solo viaja aquí, una vez; en la base queda su huella.
  return res.status(200).json({ id: fila.id, nombre, clave });
}

async function esReservado(deps, id) {
  return (await deps.datos.listarSetters()).some((x) => x.id === id && x.reservado);
}

async function editarSetter(deps, body, res) {
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Persona no válida." });
  if (await esReservado(deps, id)) return res.status(400).json({ error: "Esa fila es la tuya: no se edita." });
  const campos = {};
  if (typeof body.activo === "boolean") campos.activo = body.activo;
  if ("nombre" in body) {
    campos.nombre = texto(body.nombre, 80);
    if (!campos.nombre) return res.status(400).json({ error: "El nombre no puede quedar vacío." });
  }
  if (!Object.keys(campos).length) return res.status(400).json({ error: "No hay cambios." });
  await deps.datos.editarSetter(id, campos);
  return res.status(200).json({ ok: true });
}

async function nuevaClaveSetter(deps, body, res) {
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Persona no válida." });
  if (await esReservado(deps, id)) return res.status(400).json({ error: "Esa fila es la tuya: no tiene clave." });
  const clave = generarClave(12);
  await deps.datos.editarSetter(id, { clave_hash: huellaClave(clave, deps.ajustes().secreto) });
  return res.status(200).json({ clave });
}

async function asignar(deps, body, res) {
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter((x) => UUID.test(x)) : [];
  if (!ids.length || ids.length > 5000) return res.status(400).json({ error: "No hay contactos que asignar." });
  const setterId = body.setterId ? String(body.setterId) : null;
  if (setterId && !(await deps.datos.listarSetters()).some((x) => x.id === setterId && x.activo)) {
    return res.status(400).json({ error: "Esa persona no existe o está desactivada." });
  }
  await deps.datos.asignarContactos(ids, setterId);
  return res.status(200).json({ ok: true, asignados: ids.length });
}

// «Me lo quedo»: Lissette se reserva contactos para llamarlos ella. Se
// asignan a una fila propia (desactivada, sin clave), así que ninguna setter
// los ve y no entran en repartos.
async function quedarme(deps, body, res) {
  const ids = Array.isArray(body.ids) ? body.ids.map(String).filter((x) => UUID.test(x)) : [];
  if (!ids.length || ids.length > 5000) return res.status(400).json({ error: "No hay contactos que quedarte." });
  let fila = (await deps.datos.listarSetters()).find((x) => x.reservado);
  if (!fila) fila = await deps.datos.crearSetter({ nombre: "Administración", clave_hash: RESERVA, activo: false });
  await deps.datos.asignarContactos(ids, fila.id);
  return res.status(200).json({ ok: true, asignados: ids.length });
}

// Reparte entre las personas activas los contactos sin asignar que aún
// están pendientes (sin llamar o por volver a llamar).
async function repartir(deps, res) {
  const activas = (await deps.datos.listarSetters()).filter((x) => x.activo).map((x) => x.id);
  if (!activas.length) return res.status(400).json({ error: "No hay personas activas entre las que repartir." });
  const libres = (await deps.datos.listarContactos()).filter(
    (c) => !c.setter_id && !c.no_llamar && (!c.resultado || ["volver", "no_contesta", "no_esta"].includes(c.resultado))
  );
  const grupos = new Map(activas.map((id) => [id, []]));
  libres.forEach((c, i) => grupos.get(activas[i % activas.length]).push(c.id));
  for (const [id, lista] of grupos) if (lista.length) await deps.datos.asignarContactos(lista, id);
  return res.status(200).json({ ok: true, repartidos: libres.length });
}

// ============================================================
// /api/agenda/cita — la página /cita/<token> de la persona invitada
// ============================================================
export function crearCitaPublica(deps) {
  const limitado = limitador(60, 10 * 60 * 1000);

  return async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    if (!deps.datos) return res.status(503).json({ error: "La agenda no está disponible ahora mismo." });
    if (limitado(ipDe(req))) return res.status(429).json({ error: "Demasiadas peticiones. Espera unos minutos." });

    const { token, accion, inicio } = req.body || {};
    if (!TOKEN.test(String(token || ""))) return res.status(404).json({ error: "Este enlace no es válido." });

    try {
      const cita = await deps.datos.citaPorToken(hashToken(token));
      if (!cita) return res.status(404).json({ error: "Este enlace no es válido." });
      const ahora = deps.ahora();
      const pasada = new Date(cita.inicio) <= ahora;
      const activa = cita.estado === "confirmada" && !pasada;

      if (accion === "ver") {
        const config = activa ? await deps.datos.leerConfig() : null;
        return res.status(200).json({
          nombre: cita.nombre,
          empresa: cita.empresa,
          inicio: cita.inicio,
          fin: cita.fin,
          estado: cita.estado,
          pasada,
          enlaceReunion: config?.enlace_reunion || null,
        });
      }
      if (!activa) {
        return res.status(409).json({ error: pasada ? "Esta demo ya pasó." : "Esta demo ya está cancelada." });
      }
      if (accion === "huecos") {
        const { huecos } = await calcularHuecos(deps, cita.id);
        return res.status(200).json({ huecos });
      }
      if (accion === "mover") {
        const { config, huecos } = await calcularHuecos(deps, cita.id);
        const hueco = huecos.find((h) => h.inicio === String(inicio || ""));
        if (!hueco) return res.status(409).json({ error: MENSAJES.hueco_ocupado });
        cita.secuencia = await deps.datos.mover(cita.id, hueco.inicio, hueco.fin, config.margen_min);
        cita.inicio = hueco.inicio;
        cita.fin = hueco.fin;
        const correo = await notificar(deps, "cambio", cita, { config, token, quien: "la propia persona" });
        return res.status(200).json({ ok: true, inicio: cita.inicio, correo });
      }
      if (accion === "cancelar") {
        cita.secuencia = await deps.datos.cancelar(cita.id, "la propia persona");
        const config = await deps.datos.leerConfig();
        const correo = await notificar(deps, "cancelada", cita, { config, porLaPersona: true, quien: "la propia persona" });
        return res.status(200).json({ ok: true, correo });
      }
      return res.status(400).json({ error: "Acción no reconocida." });
    } catch (err) {
      return fallo(res, err, `cita ${accion}`);
    }
  };
}
