// Calculadora de huella gratuita · lo que hace el endpoint. Recibe sus
// dependencias (datos, correo, reloj, ajustes) para poder probarse sin
// Supabase ni SMTP: tests/huella.test.js y tools/agenda-local.mjs.
import crypto from "node:crypto";
import { limitador, ipDe, generarToken } from "../deck/_comun.js";
import { escaparHtml, emailValido, texto, soloDigitos, partesMadrid } from "../agenda/_logica.js";
import { calcular, limpiarEntrada, toneladas, porBloque, porcentaje } from "../../public/huella/calculo.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

const PIE =
  'Recibes este correo porque has pedido el informe en evidran.com/huella. Usamos tus datos para enviarte el informe y, solo si lo marcaste, para lo que autorizaste. Más información en <a href="https://www.evidran.com/privacidad.html">evidran.com/privacidad.html</a>.';

export function correoInforme({ empresa, r, enlace }) {
  const boton = `<a href="${escaparHtml(enlace)}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Ver mi informe</a>`;
  const parrafos = [
    "Hola:",
    `Aquí tienes el informe de huella de carbono de ${r.anio} de <strong>${escaparHtml(empresa)}</strong>: <strong>${toneladas(r.total)} t CO₂e</strong> (alcance 1: ${toneladas(r.a1)} t; alcance 2: ${toneladas(r.a2)} t).`,
    boton,
    "Incluye cuánto bajaría con algunos cambios, un objetivo para tu sistema ISO 14001 ya redactado, un texto para los cuestionarios de tus clientes y las cifras listas para la calculadora del MITECO.",
    "El enlace es personal. Desde el informe puedes guardarlo en PDF.",
    "Un saludo,<br>El equipo de Evidran<br>evidran.com",
  ];
  return {
    asunto: `Tu informe de huella de carbono de ${r.anio}`,
    html:
      `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#16202B;max-width:560px">` +
      parrafos.map((p) => `<p style="margin:0 0 14px">${p}</p>`).join("") +
      `<p style="margin:22px 0 0;font-size:12px;color:#5B6675">${PIE}</p></div>`,
  };
}

const LLAMADAS = {
  nuevo: (p) => `Añadido arriba de la lista de llamadas${p.setter ? ` (asignado a ${p.setter})` : " (sin asignar)"}`,
  reactivado: (p) => `Ya estaba en la lista: vuelve arriba${p.setter ? ` (${p.setter})` : ""}`,
  no_llamar: () => "Estaba marcado como «No llamar»: no se ha añadido",
  error: () => "No se pudo añadir a la lista de llamadas: añádelo a mano",
};

export function correoAvisoContacto({ c, r, llamadas }) {
  const principal = porBloque(r)[0];
  const filas = [
    ["Empresa", c.empresa],
    ["Correo", c.email],
    ["Teléfono", c.telefono || "—"],
    ["Huella", `${toneladas(r.total)} t CO₂e en ${r.anio} (alcance 1: ${toneladas(r.a1)} t; alcance 2: ${toneladas(r.a2)} t)`],
    ["Fuente principal", principal ? `${principal.ambito} (${porcentaje(principal.kg, r.total)} %)` : "—"],
    ["Estimado", r.aproximado ? "Sí, en parte" : "No"],
    ["Acepta novedades", c.acepta_novedades ? "Sí" : "No"],
    ["Acepta que le llamen", c.acepta_llamada ? "Sí" : "No"],
  ];
  if (llamadas) filas.push(["Lista de llamadas", LLAMADAS[llamadas.estado](llamadas)]);
  return {
    asunto: `Nuevo contacto de la calculadora: ${c.empresa} · ${toneladas(r.total)} t`,
    html:
      `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16202B"><p style="margin:0 0 12px;font-weight:bold">Nuevo contacto de la calculadora de huella</p>` +
      `<table style="border-collapse:collapse;font-size:14px">${filas
        .map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#5B6675">${k}</td><td style="padding:4px 0">${escaparHtml(v)}</td></tr>`)
        .join("")}</table></div>`,
  };
}

export function crearCalculadora(deps) {
  const limitado = limitador(60, 10 * 60 * 1000);
  const limiteEnvios = limitador(6, 10 * 60 * 1000);

  return async function handler(req, res) {
    if (!deps.datos) return res.status(503).json({ error: "La calculadora no está disponible ahora mismo." });
    const ip = ipDe(req);
    if (limitado(ip)) return res.status(429).json({ error: "Demasiadas peticiones. Espera unos minutos." });
    // Cron semanal de Vercel (vercel.json). Solo borra lo que ya debía borrarse,
    // así que no hace falta clave; si existe CRON_SECRET, se exige.
    if (req.method === "GET") {
      if (deps.cron && req.headers.authorization !== `Bearer ${deps.cron}`) return res.status(401).json({ error: "No autorizado." });
      try {
        return res.status(200).json({ borrados: await limpiar(deps) });
      } catch (err) {
        console.error("huella limpieza error:", err?.message || err);
        return res.status(502).json({ error: "No se pudo limpiar." });
      }
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    const body = req.body || {};
    try {
      switch (body.accion) {
        case "calcular":
          return await accionCalcular(deps, body, res);
        case "enviar":
          if (limiteEnvios(ip)) return res.status(429).json({ error: "Demasiados envíos seguidos. Espera unos minutos." });
          return await accionEnviar(deps, body, res);
        case "informe":
          return await accionInforme(deps, body, res);
        case "baja":
          return await accionBaja(deps, body, res);
        default:
          return res.status(400).json({ error: "Acción no reconocida." });
      }
    } catch (err) {
      console.error(`huella ${body.accion} error:`, err?.message || err);
      return res.status(502).json({ error: "No se pudo completar. Inténtalo de nuevo en un momento." });
    }
  };
}

// Guarda el cálculo sin datos personales; sirve para contar y para el informe.
async function accionCalcular(deps, body, res) {
  const entrada = limpiarEntrada(body.entrada);
  if (!entrada) return res.status(400).json({ error: "Revisa el año." });
  const r = calcular(entrada, deps.comercializadoras);
  if (!r.partidas.length) return res.status(400).json({ error: "Escribe al menos un consumo." });
  const fila = await deps.datos.crearCalculo({ anio: r.anio, entrada, total_kg: r.total, a1_kg: r.a1, a2_kg: r.a2 });
  return res.status(200).json({ id: fila.id });
}

async function accionEnviar(deps, body, res) {
  // Trampa para robots: un campo que una persona no ve ni rellena.
  if (body.web) return res.status(200).json({ ok: true, correo: true });
  if (!UUID.test(String(body.calculoId || ""))) return res.status(400).json({ error: "Vuelve a calcular la huella." });
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const empresa = texto(body.empresa, 160);
  const telefono = texto(body.telefono, 40);
  if (!emailValido(email) || !empresa) return res.status(400).json({ error: "Escribe tu correo y el nombre de la empresa." });
  if (body.informe !== true) return res.status(400).json({ error: "Marca la casilla para recibir el informe." });
  const calculo = await deps.datos.calculoPorId(body.calculoId);
  if (!calculo) return res.status(400).json({ error: "Vuelve a calcular la huella." });

  const token = generarToken();
  await deps.datos.crearContacto({
    calculo_id: calculo.id,
    email,
    empresa,
    telefono,
    acepta_novedades: body.novedades === true,
    acepta_llamada: body.llamada === true && !!telefono,
    token_hash: hashToken(token),
  });
  const r = calcular(calculo.entrada, deps.comercializadoras);
  const enlace = `${deps.ajustes().base}/huella/informe/${token}`;
  let correo = false;
  if (deps.correo) {
    try {
      await deps.correo.enviar({ para: email, ...correoInforme({ empresa, r, enlace }), responderA: deps.ajustes().avisos || undefined });
      correo = true;
    } catch (err) {
      console.error("huella correo del informe falló:", err?.code || err?.responseCode || "sin código");
    }
  }
  return res.status(200).json({ ok: true, correo });
}

// Abrir el enlace confirma el correo; la primera vez avisa a Lissette.
async function accionInforme(deps, body, res) {
  if (!TOKEN.test(String(body.token || ""))) return res.status(404).json({ error: "Este enlace no es válido." });
  const c = await deps.datos.contactoPorToken(hashToken(body.token));
  if (!c || !c.huella_calculo) return res.status(404).json({ error: "Este enlace no es válido." });
  const primera = !c.confirmado_en;
  const ahora = deps.ahora().toISOString();
  await deps.datos.editarContacto(c.id, {
    confirmado_en: c.confirmado_en || ahora,
    visitas_informe: (c.visitas_informe || 0) + 1,
    ultima_actividad: ahora,
  });
  const r = calcular(c.huella_calculo.entrada, deps.comercializadoras);
  // Doble confirmación hecha: si pidió que le llamaran, pasa a la lista de la setter.
  let llamadas = null;
  if (primera && c.acepta_llamada && c.telefono && !c.baja_en) {
    try {
      llamadas = await pasarALlamadas(deps, c, r);
    } catch (err) {
      console.error("huella paso a llamadas falló:", err?.message || err);
      llamadas = { estado: "error" };
    }
  }
  const avisos = deps.ajustes().avisos;
  if (primera && avisos && deps.correo) {
    try {
      await deps.correo.enviar({ para: avisos, ...correoAvisoContacto({ c, r, llamadas }) });
    } catch (err) {
      console.error("huella aviso falló:", err?.code || err?.responseCode || "sin código");
    }
  }
  return res.status(200).json({
    empresa: c.empresa,
    entrada: c.huella_calculo.entrada,
    novedades: c.acepta_novedades && !c.baja_en,
  });
}

async function accionBaja(deps, body, res) {
  if (!TOKEN.test(String(body.token || ""))) return res.status(404).json({ error: "Este enlace no es válido." });
  const c = await deps.datos.contactoPorToken(hashToken(body.token));
  if (!c) return res.status(404).json({ error: "Este enlace no es válido." });
  const ahora = deps.ahora().toISOString();
  await deps.datos.editarContacto(c.id, { acepta_novedades: false, acepta_llamada: false, baja_en: ahora, ultima_actividad: ahora });
  return res.status(200).json({ ok: true });
}

// Borra los contactos de la calculadora sin actividad en 24 meses (lo que
// promete la política de privacidad). Los cálculos no tienen datos personales.
export async function limpiar(deps) {
  const limite = new Date(deps.ahora());
  limite.setUTCMonth(limite.getUTCMonth() - 24);
  return deps.datos.borrarAntiguos(limite.toISOString());
}

const PENDIENTE = (c) => !c.no_llamar && (!c.resultado || ["volver", "no_contesta", "no_esta"].includes(c.resultado));

// Lo añade a la lista de llamadas como contacto caliente. Si su teléfono ya
// estaba, lo sube arriba (salvo que pidiera no ser llamado). Si es nuevo, va a
// la persona activa con menos pendientes.
export async function pasarALlamadas(deps, c, r) {
  const ahora = deps.ahora().toISOString();
  const principal = porBloque(r)[0];
  const resumen =
    `Calculadora de huella: ${toneladas(r.total)} t CO₂e en ${r.anio}` +
    (principal ? `; fuente principal: ${principal.ambito} (${porcentaje(principal.kg, r.total)} %)` : "") +
    ". Pidió que le llamaran.";
  const [lista, activos] = await Promise.all([deps.datos.contactosLlamadas(), deps.datos.settersActivos()]);
  const nombre = (id) => activos.find((x) => x.id === id)?.nombre || null;
  const tel = soloDigitos(c.telefono).slice(-9);
  const existente = tel.length === 9 ? lista.find((x) => soloDigitos(x.telefono).slice(-9) === tel) : null;
  if (existente) {
    if (existente.no_llamar) return { estado: "no_llamar" };
    const [y, m, d] = partesMadrid(new Date(ahora)).fecha.split("-");
    await deps.datos.editarContactoLlamadas(existente.id, {
      caliente_desde: ahora,
      resultado: "volver",
      volver_en: ahora,
      notas: [existente.notas, `${d}/${m}/${y}: ${resumen}`].filter(Boolean).join("\n"),
    });
    return { estado: "reactivado", setter: nombre(existente.setter_id) };
  }
  let setterId = null;
  if (activos.length) {
    const carga = (id) => lista.filter((x) => x.setter_id === id && PENDIENTE(x)).length;
    setterId = activos.reduce((mejor, x) => (carga(x.id) < carga(mejor.id) ? x : mejor), activos[0]).id;
  }
  await deps.datos.crearContactoLlamadas({
    empresa: c.empresa,
    telefono: c.telefono,
    email: c.email,
    origen: resumen,
    caliente_desde: ahora,
    setter_id: setterId,
  });
  return { estado: "nuevo", setter: nombre(setterId) };
}
