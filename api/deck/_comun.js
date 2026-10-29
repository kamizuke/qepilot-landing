// Sala del deck · utilidades compartidas de los endpoints /api/deck/*.
// Los ficheros que empiezan por "_" no se publican como endpoint en Vercel.
//
// Variables de entorno necesarias (Vercel → Settings → Environment Variables):
//   SUPABASE_URL           p. ej. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE  service_role key (solo vive en el servidor)
//   DECK_ADMIN_CLAVE       clave del panel /deck-panel.html (la inventas tú)
import crypto from "node:crypto";

export function entorno() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const srk = process.env.SUPABASE_SERVICE_ROLE || "";
  if (!url || !srk) return null;
  return { url, srk };
}

// --- Supabase REST (PostgREST) con la service key ---
export async function rest(env, ruta, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${env.url}/rest/v1/${ruta}`, {
    method,
    headers: {
      apikey: env.srk,
      Authorization: `Bearer ${env.srk}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status} en ${ruta.split("?")[0]}: ${detalle.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  const texto = await res.text();
  return texto ? JSON.parse(texto) : null;
}

export async function rpc(env, nombre, args) {
  return rest(env, `rpc/${nombre}`, { method: "POST", body: args });
}

// --- Storage: URL firmada de corta vida para que el visor cargue el PDF ---
export async function firmarPdf(env, archivo, segundos = 600) {
  const res = await fetch(
    `${env.url}/storage/v1/object/sign/decks/${encodeURIComponent(archivo).replace(/%2F/g, "/")}`,
    {
      method: "POST",
      headers: {
        apikey: env.srk,
        Authorization: `Bearer ${env.srk}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: segundos }),
    }
  );
  if (!res.ok) throw new Error(`Storage sign ${res.status}`);
  const data = await res.json();
  return `${env.url}/storage/v1${data.signedURL}`;
}

export async function listarBucket(env) {
  const res = await fetch(`${env.url}/storage/v1/object/list/decks`, {
    method: "POST",
    headers: {
      apikey: env.srk,
      Authorization: `Bearer ${env.srk}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 200, sortBy: { column: "created_at", order: "desc" } }),
  });
  if (!res.ok) throw new Error(`Storage list ${res.status}`);
  const filas = await res.json();
  // Supabase devuelve también "carpetas" (id null); nos quedamos con ficheros.
  return (Array.isArray(filas) ? filas : [])
    .filter((f) => f && f.id && /\.pdf$/i.test(f.name))
    .map((f) => f.name);
}

// --- Claves de acceso de los enlaces (scrypt con sal propia) ---
export function hashClave(clave, salt) {
  return crypto.scryptSync(clave.normalize("NFKC"), salt, 32).toString("hex");
}

export function claveCoincide(clave, salt, hashGuardado) {
  const a = Buffer.from(hashClave(clave, salt), "hex");
  const b = Buffer.from(hashGuardado, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Alfabeto sin caracteres confusos (sin 0/O, 1/l/I…).
const ALFABETO_CLAVE = "abcdefghjkmnpqrstuvwxyz23456789";
export function generarClave(largo = 8) {
  const bytes = crypto.randomBytes(largo);
  let out = "";
  for (let i = 0; i < largo; i++) out += ALFABETO_CLAVE[bytes[i] % ALFABETO_CLAVE.length];
  return out;
}

export function generarToken() {
  return crypto.randomBytes(16).toString("base64url");
}

export function generarSalt() {
  return crypto.randomBytes(16).toString("hex");
}

// --- Pase de sesión del visor: HMAC firmado, caduca solo ---
// Secreto derivado de la service key: una variable de entorno menos.
function secreto() {
  const env = entorno();
  return crypto.createHash("sha256").update(`sala-deck|${env ? env.srk : ""}`).digest();
}

export function crearPase(visitaId, enlaceId, documentoId, horas = 6) {
  const exp = Date.now() + horas * 3600 * 1000;
  const cuerpo = `${visitaId}.${enlaceId}.${documentoId}.${exp}`;
  const firma = crypto.createHmac("sha256", secreto()).update(cuerpo).digest("base64url");
  return `v1.${cuerpo}.${firma}`;
}

export function leerPase(pase) {
  if (typeof pase !== "string" || pase.length > 400) return null;
  const partes = pase.split(".");
  if (partes.length !== 6 || partes[0] !== "v1") return null;
  const [, visitaId, enlaceId, documentoId, expTxt, firma] = partes;
  const cuerpo = `${visitaId}.${enlaceId}.${documentoId}.${expTxt}`;
  const esperada = crypto.createHmac("sha256", secreto()).update(cuerpo).digest("base64url");
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const exp = Number(expTxt);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  return { visitaId, enlaceId, documentoId };
}

export function compararTexto(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// --- Límite de intentos en memoria (por instancia), como en asistente.js ---
export function limitador(max, ventanaMs) {
  const mapa = new Map();
  return (claveLimite) => {
    const ahora = Date.now();
    const rec = mapa.get(claveLimite);
    if (!rec || ahora - rec.inicio > ventanaMs) {
      mapa.set(claveLimite, { inicio: ahora, n: 1 });
      if (mapa.size > 5000) mapa.clear();
      return false;
    }
    rec.n += 1;
    return rec.n > max;
  };
}

export function ipDe(req) {
  return ((req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim() || "?";
}
