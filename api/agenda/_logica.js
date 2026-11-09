// Agenda de demos y seguimiento de llamadas · lógica pura (sin red ni base).
// Horas en Europe/Madrid (hora peninsular); en la base todo va en UTC.

export const ZONA = "Europe/Madrid";

export const RESULTADOS = {
  demo: "Demo agendada",
  volver: "Volver a llamar",
  info: "Info por correo",
  no_contesta: "No contesta",
  no_esta: "No está la persona",
  no_interesa: "No interesa",
  herramienta_propia: "Ya tienen o desarrollan la suya",
  no_encaja: "No encaja",
  no_llamar: "No llamar",
  erroneo: "Teléfono erróneo",
};

// --- Fechas en hora de Madrid ---
const DIAS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
const fmtPartes = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  weekday: "short",
});

export function partesMadrid(fecha) {
  const p = Object.fromEntries(fmtPartes.formatToParts(fecha).map((x) => [x.type, x.value]));
  return { fecha: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}`, dia: DIAS[p.weekday] };
}

function desfaseMs(ms) {
  const minuto = ms - (((ms % 60000) + 60000) % 60000);
  const p = partesMadrid(new Date(minuto));
  const [y, m, d] = p.fecha.split("-").map(Number);
  const [h, mi] = p.hora.split(":").map(Number);
  return Date.UTC(y, m - 1, d, h, mi) - minuto;
}

// «2026-11-04» + «10:00» de Madrid → Date (UTC). Dos pasadas para acertar
// el desfase los días de cambio de hora.
export function madridAUtc(fecha, hora) {
  const [y, m, d] = fecha.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  const ingenuo = Date.UTC(y, m - 1, d, h, mi);
  const primera = ingenuo - desfaseMs(ingenuo);
  return new Date(ingenuo - desfaseMs(primera));
}

function sumarDias(fecha, n) {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function diaSemana(fecha) {
  const [y, m, d] = fecha.split("-").map(Number);
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1;
}

const fmtLarga = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const fmtCorta = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA,
  weekday: "long",
  day: "numeric",
  month: "long",
});

// «martes, 4 de noviembre de 2026» → «martes 4 de noviembre de 2026, 10:00»
export function fechaLarga(fecha) {
  const d = new Date(fecha);
  return `${fmtLarga.format(d).replace(",", "")}, a las ${partesMadrid(d).hora}`;
}

export function fechaCorta(fecha) {
  const d = new Date(fecha);
  return `${fmtCorta.format(d).replace(",", "")}, ${partesMadrid(d).hora}`;
}

// --- Horario y huecos ---
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Devuelve el horario limpio o null si no es válido.
export function validarHorario(horario) {
  if (!horario || typeof horario !== "object" || Array.isArray(horario)) return null;
  const limpio = {};
  for (const [dia, tramos] of Object.entries(horario)) {
    if (!/^[1-7]$/.test(dia) || !Array.isArray(tramos) || tramos.length > 4) return null;
    const lista = [];
    for (const t of tramos) {
      if (!Array.isArray(t) || t.length !== 2 || !HORA.test(t[0]) || !HORA.test(t[1]) || t[0] >= t[1]) return null;
      lista.push([t[0], t[1]]);
    }
    lista.sort((a, b) => (a[0] < b[0] ? -1 : 1));
    for (let i = 1; i < lista.length; i++) if (lista[i][0] < lista[i - 1][1]) return null;
    if (lista.length) limpio[dia] = lista;
  }
  return limpio;
}

function seSolapan(aIni, aFin, bIni, bFin) {
  return aIni < bFin && aFin > bIni;
}

// Huecos libres desde ahora (+ antelación) hasta dias_vista. Misma regla
// de choque que agenda_choque() en la base: la cita ocupa su rato más el
// margen por delante y por detrás.
export function huecosLibres({ config, citas = [], bloqueos = [], ahora = new Date(), excepto = null }) {
  const dur = config.duracion_min * 60000;
  const margen = config.margen_min * 60000;
  const minimo = ahora.getTime() + config.antelacion_horas * 3600000;
  const ocupadas = citas
    .filter((c) => c.id !== excepto)
    .map((c) => [new Date(c.inicio).getTime() - margen, new Date(c.fin).getTime() + margen]);
  const cerradas = bloqueos.map((b) => [new Date(b.desde).getTime(), new Date(b.hasta).getTime()]);
  const hoy = partesMadrid(ahora).fecha;
  const huecos = [];
  for (let i = 0; i <= config.dias_vista; i++) {
    const fecha = sumarDias(hoy, i);
    for (const [ini, fin] of config.horario?.[String(diaSemana(fecha))] || []) {
      const finMs = madridAUtc(fecha, fin).getTime();
      for (let t = madridAUtc(fecha, ini).getTime(); t + dur <= finMs; t += dur) {
        if (t < minimo) continue;
        const tf = t + dur;
        if (ocupadas.some(([a, b]) => seSolapan(t, tf, a, b))) continue;
        if (cerradas.some(([a, b]) => seSolapan(t, tf, a, b))) continue;
        huecos.push({ inicio: new Date(t).toISOString(), fin: new Date(tf).toISOString() });
      }
    }
  }
  return huecos;
}

export function minutosDe(cita) {
  return Math.round((new Date(cita.fin) - new Date(cita.inicio)) / 60000);
}

// --- Invitación de calendario (.ics, RFC 5545) ---
function textoIcs(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function fechaIcs(fecha) {
  return new Date(fecha).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Líneas de 75 octetos como máximo, sin partir un carácter UTF-8.
function plegar(linea) {
  const trozos = [];
  let actual = "";
  let bytes = 0;
  for (const ch of linea) {
    const b = Buffer.byteLength(ch);
    const limite = trozos.length ? 74 : 75;
    if (bytes + b > limite) {
      trozos.push(actual);
      actual = "";
      bytes = 0;
    }
    actual += ch;
    bytes += b;
  }
  trozos.push(actual);
  return trozos.join("\r\n ");
}

function organizadorIcs(organizador, avisos) {
  const cn = `CN="${organizador.nombre.replace(/"/g, "")}"`;
  if (!avisos || avisos === organizador.email) return `ORGANIZER;${cn}:mailto:${organizador.email}`;
  return `ORGANIZER;${cn};SENT-BY="mailto:${organizador.email}":mailto:${avisos}`;
}

export function crearIcs({ cita, metodo, organizador, avisos, enlaceReunion, ahora = new Date() }) {
  const cancelada = metodo === "CANCEL";
  const descripcion = [
    `Demo de Evidran (${minutosDe(cita)} minutos).`,
    enlaceReunion ? `Enlace de la videollamada: ${enlaceReunion}` : "El enlace de la videollamada llegará por correo.",
  ].join("\n");
  const lineas = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Evidran//Agenda de demos//ES",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    `METHOD:${cancelada ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:${cita.id}@evidran.com`,
    `SEQUENCE:${cita.secuencia || 0}`,
    `DTSTAMP:${fechaIcs(ahora)}`,
    `DTSTART:${fechaIcs(cita.inicio)}`,
    `DTEND:${fechaIcs(cita.fin)}`,
    `SUMMARY:${textoIcs(cita.empresa ? `Demo de Evidran · ${cita.empresa}` : "Demo de Evidran")}`,
    `DESCRIPTION:${textoIcs(descripcion)}`,
    `LOCATION:${textoIcs(enlaceReunion || "Videollamada")}`,
    // Las respuestas «Sí / No / Quizás» del calendario van al organizador. El
    // correo sale de app@ (nadie lo lee), así que el organizador es el buzón de
    // avisos y app@ figura como quien la envía en su nombre (SENT-BY).
    organizadorIcs(organizador, avisos),
    // RSVP=TRUE: Gmail y Outlook muestran los botones para responder.
    cita.email
      ? `ATTENDEE;CN="${String(cita.nombre).replace(/"/g, "")}";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=${cancelada ? "FALSE" : "TRUE"}:mailto:${cita.email}`
      : null,
  ];
  lineas.push(`STATUS:${cancelada ? "CANCELLED" : "CONFIRMED"}`, "TRANSP:OPAQUE", "END:VEVENT", "END:VCALENDAR");
  return lineas.filter(Boolean).map(plegar).join("\r\n") + "\r\n";
}

// --- Validaciones ---
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

export function texto(v, max) {
  if (typeof v !== "string") return null;
  const t = v.trim().replace(/\s+/g, " ");
  return t ? t.slice(0, max) : null;
}

export function textoLargo(v, max) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export function emailValido(v) {
  return typeof v === "string" && v.length <= 200 && EMAIL.test(v.trim());
}

// Solo páginas de empresa de LinkedIn. Devuelve la dirección limpia o null.
export function urlLinkedinEmpresa(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || t.length > 300) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) return null;
    const m = /^\/(company|school|showcase)\/([^/]+)/i.exec(u.pathname);
    return m ? `https://www.linkedin.com/${m[1].toLowerCase()}/${m[2]}` : null;
  } catch {
    return null;
  }
}

export function soloDigitos(tel) {
  return String(tel || "").replace(/\D/g, "");
}

// --- Importar contactos desde CSV (exportación de Apollo o una hoja) ---
function normalizar(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Por orden de preferencia. Los móviles («mobile phone», «home phone»)
// no se importan a propósito: se llama al teléfono de la empresa.
const COLUMNAS = {
  empresa: ["empresa", "company", "company name", "company name for emails", "organizacion", "organization", "account name"],
  persona: ["persona", "nombre", "name", "full name", "contacto", "nombre completo"],
  nombre: ["first name", "nombre de pila"],
  apellido: ["last name", "apellido", "apellidos"],
  cargo: ["cargo", "title", "job title", "puesto"],
  telefono: ["telefono", "telefono empresa", "corporate phone", "company phone", "work direct phone", "phone", "tel"],
  email: ["email", "correo", "e mail", "correo electronico"],
  web: ["web", "website", "sitio web", "pagina web", "company website"],
  linkedin: ["linkedin empresa", "company linkedin url", "company linkedin", "pagina linkedin", "linkedin"],
  ciudad: ["ciudad", "city", "localidad", "company city"],
  origen: ["origen", "motivo", "notas", "notes"],
};

function filasCsv(textoCsv) {
  const primera = textoCsv.split(/\r?\n/, 1)[0] || "";
  const sep = (primera.match(/;/g) || []).length > (primera.match(/,/g) || []).length ? ";" : ",";
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < textoCsv.length; i++) {
    const ch = textoCsv[i];
    if (comillas) {
      if (ch === '"' && textoCsv[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (ch === '"') comillas = false;
      else campo += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === sep) {
      fila.push(campo);
      campo = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && textoCsv[i + 1] === "\n") i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += ch;
  }
  if (campo !== "" || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((c) => c.trim() !== ""));
}

export function leerCsvContactos(textoCsv, max = 2000) {
  const filas = filasCsv(String(textoCsv || "").replace(/^﻿/, ""));
  if (filas.length < 2) return { error: "La lista necesita una fila de títulos y al menos un contacto." };
  const cab = filas[0].map(normalizar);
  const indice = {};
  for (const [campo, nombres] of Object.entries(COLUMNAS)) {
    for (const n of nombres) {
      const i = cab.indexOf(n);
      if (i >= 0) {
        indice[campo] = i;
        break;
      }
    }
  }
  if (indice.empresa === undefined) return { error: "Falta la columna de la empresa (Empresa o Company)." };
  const valor = (f, campo) => (indice[campo] === undefined ? "" : String(f[indice[campo]] ?? "").trim());
  const contactos = [];
  let sinEmpresa = 0;
  for (const f of filas.slice(1, max + 1)) {
    const empresa = texto(valor(f, "empresa"), 160);
    if (!empresa) {
      sinEmpresa++;
      continue;
    }
    const persona = texto(valor(f, "persona"), 120) || texto(`${valor(f, "nombre")} ${valor(f, "apellido")}`, 120);
    const email = valor(f, "email");
    contactos.push({
      empresa,
      persona,
      cargo: texto(valor(f, "cargo"), 120),
      telefono: texto(valor(f, "telefono"), 40),
      email: emailValido(email) ? email.trim() : null,
      web: texto(valor(f, "web"), 200),
      linkedin_empresa: urlLinkedinEmpresa(valor(f, "linkedin")),
      ciudad: texto(valor(f, "ciudad"), 80),
      origen: texto(valor(f, "origen"), 300),
    });
  }
  return { contactos, sinEmpresa, recortados: Math.max(0, filas.length - 1 - max) };
}

// Clave para no cargar dos veces el mismo contacto.
export function claveContacto(c) {
  const tel = soloDigitos(c.telefono);
  if (tel.length >= 9) return `t:${tel.slice(-9)}`;
  return `e:${normalizar(c.empresa)}|${normalizar(c.persona || "")}`;
}

// --- Correos ---
export function escaparHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Enlace de la videollamada de UNA demo (cada una lleva el suyo). Vacío → null;
// si no es una dirección https válida → undefined (error para quien lo pegó).
export function enlaceReunionValido(v) {
  if (v == null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return null;
  if (t.length > 600) return undefined;
  try {
    const u = new URL(t);
    return u.protocol === "https:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}

// Versión en texto plano de un correo HTML de la agenda. Los filtros de spam
// desconfían de los correos que solo traen HTML; los de la app ya la llevan.
export function textoDeHtml(html) {
  return String(html ?? "")
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, url, txt) => {
      const visible = txt.replace(/<[^>]+>/g, "").trim();
      return !visible || visible === url ? url : `${visible} (${url})`;
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/td>/gi, " ")
    .replace(/<\/(tr|li)>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|table)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// HTML completo (doctype, idioma y codificación): un fragmento suelto también
// resta puntos en algunos filtros.
export function documentoHtml(cuerpo, asunto) {
  if (/^\s*<!doctype/i.test(cuerpo)) return cuerpo;
  return (
    `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${escaparHtml(asunto || "Evidran")}</title></head>` +
    `<body style="margin:0;padding:16px;background:#ffffff">${cuerpo}</body></html>`
  );
}

function envolver(parrafos, pie) {
  const cuerpo = parrafos
    .map((p) => `<p style="margin:0 0 14px">${p}</p>`)
    .join("");
  return (
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#16202B;max-width:560px">` +
    `${cuerpo}` +
    (pie ? `<p style="margin:22px 0 0;font-size:12px;color:#5B6675">${pie}</p>` : "") +
    `</div>`
  );
}

const PIE_PRIVACIDAD =
  'Recibes este correo porque se ha reservado una demo de Evidran a tu nombre. Usamos tus datos solo para gestionar esta cita. Más información en <a href="https://evidran.com/privacidad.html">evidran.com/privacidad.html</a>.';

function lineaReunion(enlaceReunion) {
  return enlaceReunion
    ? `Enlace de la videollamada (Microsoft Teams): <a href="${escaparHtml(enlaceReunion)}">${escaparHtml(enlaceReunion)}</a>`
    : "Te enviaremos el enlace de la videollamada antes de la demo.";
}

export function correoConfirmacion({ cita, enlaceReunion, enlaceGestion }) {
  const cuando = fechaLarga(cita.inicio);
  return {
    asunto: `Demo de Evidran: ${fechaCorta(cita.inicio)}`,
    html: envolver(
      [
        `Hola, ${escaparHtml(cita.nombre)}:`,
        `Queda confirmada la demo de Evidran el <strong>${escaparHtml(cuando)}</strong> (hora peninsular). Dura ${minutosDe(cita)} minutos.`,
        lineaReunion(enlaceReunion),
        "En la demo verás cómo se registra una no conformidad contándola con tus palabras, y te dejamos montada la prueba gratis de 30 días, sin tarjeta. Si tienes a mano un caso real reciente, mejor.",
        `Si necesitas cambiar la hora o no puedes asistir: <a href="${escaparHtml(enlaceGestion)}">cambiar o cancelar la demo</a>.`,
        "Un saludo,<br>El equipo de Evidran<br>evidran.com",
      ],
      PIE_PRIVACIDAD
    ),
  };
}

export function correoCambio({ cita, enlaceReunion, enlaceGestion }) {
  const cuando = fechaLarga(cita.inicio);
  return {
    asunto: `Demo de Evidran cambiada: ${fechaCorta(cita.inicio)}`,
    html: envolver(
      [
        `Hola, ${escaparHtml(cita.nombre)}:`,
        `La demo de Evidran pasa al <strong>${escaparHtml(cuando)}</strong> (hora peninsular).`,
        lineaReunion(enlaceReunion),
        `Si necesitas volver a cambiarla: <a href="${escaparHtml(enlaceGestion)}">cambiar o cancelar la demo</a>.`,
        "Un saludo,<br>El equipo de Evidran<br>evidran.com",
      ],
      PIE_PRIVACIDAD
    ),
  };
}

export function correoCancelacion({ cita, porLaPersona }) {
  const cuando = fechaLarga(cita.inicio);
  return {
    asunto: "Demo de Evidran cancelada",
    html: envolver(
      [
        `Hola, ${escaparHtml(cita.nombre)}:`,
        porLaPersona
          ? `Queda cancelada la demo del ${escaparHtml(cuando)}. Si quieres buscar otro momento, responde a este correo.`
          : `Tenemos que cancelar la demo del ${escaparHtml(cuando)}. Disculpa las molestias; te escribiremos para buscar otro momento.`,
        "Un saludo,<br>El equipo de Evidran<br>evidran.com",
      ],
      PIE_PRIVACIDAD
    ),
  };
}

const ORIGENES = { setter: "la setter", admin: "ti", web: "la propia persona" };

// Aviso interno a Lissette.
export function correoAviso({ tipo, cita, quien }) {
  const titulo = {
    nueva: "Nueva demo",
    sin_invitacion: "Nueva demo (invitación sin enviar)",
    enviada: "Invitación enviada",
    cambio: "Demo cambiada",
    cancelada: "Demo cancelada",
    reenvio: "Invitación reenviada",
  }[tipo];
  const filas = [
    ["Cuándo", fechaLarga(cita.inicio)],
    ["Empresa", cita.empresa || "—"],
    ["Persona", cita.nombre],
    ["Correo", cita.email || "—"],
    ["Teléfono", cita.telefono || "—"],
    ["Notas", cita.notas || "—"],
    [{ cancelada: "Cancelada por", reenvio: "Reenviada por", enviada: "Enviada por", cambio: "Cambiada por" }[tipo] || "Reservada por", quien || ORIGENES[cita.origen] || cita.origen],
  ];
  if (tipo === "sin_invitacion") filas.push(["Invitación", "No se ha enviado a la persona. Envíala desde la Agenda cuando toque."]);
  if (tipo === "cancelada" && cita.invitacion_pendiente) filas.push(["Invitación", "No se le había enviado: a la persona no le llega aviso."]);
  const tabla = filas
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 14px 4px 0;color:#5B6675;vertical-align:top">${k}</td><td style="padding:4px 0;white-space:pre-wrap">${escaparHtml(v)}</td></tr>`
    )
    .join("");
  return {
    asunto: `${titulo}: ${cita.empresa || cita.nombre} · ${fechaCorta(cita.inicio)}`,
    html:
      `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#16202B">` +
      `<p style="margin:0 0 12px;font-weight:bold">${titulo}</p>` +
      `<table style="border-collapse:collapse;font-size:14px">${tabla}</table>` +
      `<p style="margin:16px 0 0"><a href="https://evidran.com/llamadas">Abrir la agenda</a></p></div>`,
  };
}
