// Agenda y seguimiento · lo que hacen los dos endpoints. Reciben sus
// dependencias (datos, correo, reloj, ajustes) para poder probarse sin
// Supabase ni SMTP: tools/agenda-local.mjs y tests/agenda.test.js.
import crypto from "node:crypto";
import { compararTexto, limitador, ipDe, generarToken } from "../deck/_comun.js";
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
} from "./_logica.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;
const LOCAL = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/;

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function ajustesDeEntorno() {
  return {
    claveAdmin: process.env.AGENDA_ADMIN_CLAVE || "",
    claveSetter: process.env.AGENDA_SETTER_CLAVE || "",
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

    const dada = String(req.headers["x-clave"] || "");
    let rol = null;
    if (dada && compararTexto(dada, a.claveAdmin)) rol = "admin";
    else if (dada && a.claveSetter && compararTexto(dada, a.claveSetter)) rol = "setter";
    if (!rol) {
      if (fallosClave(ip)) return res.status(429).json({ error: "Demasiados intentos. Espera unos minutos." });
      return res.status(401).json({ error: "Clave incorrecta." });
    }

    const body = req.body || {};
    const accion = body.accion;
    const soloAdmin = ["importar", "borrar_contacto", "guardar_config", "crear_bloqueo", "borrar_bloqueo", "cancelar_cita"];
    if (soloAdmin.includes(accion) && rol !== "admin") {
      return res.status(403).json({ error: "Esta acción no está disponible con tu clave." });
    }

    try {
      switch (accion) {
        case "entrar":
          return res.status(200).json({ rol });
        case "estado":
          return await estado(deps, rol, res);
        case "huecos": {
          const { huecos } = await calcularHuecos(deps);
          return res.status(200).json({ huecos });
        }
        case "reservar":
          return await reservar(deps, rol, body, res);
        case "llamada":
          return await llamada(deps, rol, body, res);
        case "editar_contacto":
          return await editarContacto(deps, rol, body, res);
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
          return await editarCita(deps, rol, body, res);
        case "cancelar_cita":
          return await cancelarCita(deps, body, res);
        default:
          return res.status(400).json({ error: "Acción no reconocida." });
      }
    } catch (err) {
      return fallo(res, err, accion);
    }
  };
}

async function estado(deps, rol, res) {
  const ahora = deps.ahora();
  const hace30 = new Date(ahora.getTime() - 30 * 86400000).toISOString();
  const [config, contactos, llamadas, citas, bloqueos] = await Promise.all([
    deps.datos.leerConfig(),
    deps.datos.listarContactos(),
    deps.datos.listarLlamadas(),
    deps.datos.citasRecientes(hace30),
    rol === "admin" ? deps.datos.listarBloqueos(ahora.toISOString()) : Promise.resolve([]),
  ]);

  const porContacto = new Map();
  for (const l of llamadas) {
    if (!l.contacto_id) continue;
    if (!porContacto.has(l.contacto_id)) porContacto.set(l.contacto_id, []);
    porContacto.get(l.contacto_id).push({ hechaEn: l.hecha_en, resultado: l.resultado, nota: l.nota, rol: l.rol });
  }

  const hoy = partesMadrid(ahora).fecha;
  const resumen = { llamadasSetter: 0, llamadasSetterHoy: 0, llamadasAdmin: 0, porResultado: {}, porDia: {} };
  for (const l of llamadas) {
    if (l.rol === "setter") {
      resumen.llamadasSetter++;
      const dia = partesMadrid(new Date(l.hecha_en)).fecha;
      if (dia === hoy) resumen.llamadasSetterHoy++;
      resumen.porDia[dia] = (resumen.porDia[dia] || 0) + 1;
    } else resumen.llamadasAdmin++;
    resumen.porResultado[l.resultado] = (resumen.porResultado[l.resultado] || 0) + 1;
  }
  const confirmadas = citas.filter((c) => c.estado === "confirmada");
  resumen.demosProximas = confirmadas.filter((c) => new Date(c.fin) > ahora).length;
  resumen.demosHechas = confirmadas.filter((c) => new Date(c.fin) <= ahora).length;
  resumen.demosCanceladas = citas.length - confirmadas.length;

  return res.status(200).json({
    rol,
    ahora: ahora.toISOString(),
    resultados: RESULTADOS,
    config:
      rol === "admin"
        ? config
        : config && { duracion_min: config.duracion_min, margen_min: config.margen_min },
    contactos: contactos.map((c) => ({ ...c, historial: porContacto.get(c.id) || [] })),
    citas,
    bloqueos,
    resumen,
  });
}

async function reservar(deps, rol, body, res) {
  const nombre = texto(body.nombre, 120);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!nombre || !emailValido(email)) {
    return res.status(400).json({ error: "Faltan el nombre o un correo válido de la persona." });
  }
  const contactoId = body.contactoId ? String(body.contactoId) : null;
  if (contactoId && !UUID.test(contactoId)) return res.status(400).json({ error: "Contacto no válido." });

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
  });
  const correo = await notificar(deps, "nueva", cita, { config, token });
  return res.status(200).json({ ok: true, id: cita.id, correo });
}

async function llamada(deps, rol, body, res) {
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
  await deps.datos.registrarLlamada(contactoId, resultado, textoLargo(body.nota, 600), volverEn, rol);
  return res.status(200).json({ ok: true });
}

async function editarContacto(deps, rol, body, res) {
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Contacto no válido." });
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
async function editarCita(deps, rol, body, res) {
  const id = String(body.id || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Cita no válida." });
  const cita = await deps.datos.citaPorId(id);
  if (!cita || cita.estado !== "confirmada" || new Date(cita.fin) <= deps.ahora()) {
    return res.status(409).json({ error: MENSAJES.cita_no_disponible });
  }
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
    const quien = rol === "admin" ? "administración" : "la setter";
    correo = await notificar(deps, "nueva", { ...cita, ...campos }, { config, token, quien, tipoAviso: "reenvio" });
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
