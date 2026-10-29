// Sala del deck · entrada: comprueba enlace + clave, abre una visita y
// devuelve el pase de sesión y la URL firmada (de corta vida) del PDF.
import {
  entorno,
  rest,
  firmarPdf,
  claveCoincide,
  crearPase,
  limitador,
  ipDe,
} from "./_comun.js";

// Contra fuerza bruta de la clave: 8 intentos por IP+enlace cada 10 min.
const limitado = limitador(8, 10 * 60 * 1000);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const env = entorno();
  if (!env) {
    console.error("deck/acceso: faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE en Vercel");
    return res.status(503).json({ error: "La sala no está disponible ahora mismo." });
  }

  const { token, clave } = req.body || {};
  if (
    typeof token !== "string" || !/^[A-Za-z0-9_-]{10,64}$/.test(token) ||
    typeof clave !== "string" || clave.length < 4 || clave.length > 64
  ) {
    return res.status(400).json({ error: "Datos no válidos." });
  }

  if (limitado(`${ipDe(req)}|${token}`)) {
    return res.status(429).json({ error: "Demasiados intentos. Espera unos minutos." });
  }

  try {
    const filas = await rest(
      env,
      `deck_enlace?token=eq.${encodeURIComponent(token)}` +
        `&select=id,activo,destinatario,empresa,clave_hash,clave_salt,` +
        `deck_documento(id,titulo,archivo,num_paginas)`
    );
    const enlace = Array.isArray(filas) ? filas[0] : null;

    if (!enlace || !enlace.activo || !enlace.deck_documento) {
      // Mismo mensaje exista o no el enlace: no se confirma nada a quien prueba.
      return res.status(404).json({ error: "Este enlace no está disponible." });
    }

    if (!claveCoincide(clave, enlace.clave_salt, enlace.clave_hash)) {
      return res.status(401).json({ error: "Clave incorrecta." });
    }

    const doc = enlace.deck_documento;
    const agente = String(req.headers["user-agent"] || "").slice(0, 300);
    const visitas = await rest(env, "deck_visita", {
      method: "POST",
      body: { enlace_id: enlace.id, agente },
      headers: { Prefer: "return=representation" },
    });
    const visita = Array.isArray(visitas) ? visitas[0] : null;
    if (!visita) throw new Error("no se pudo abrir la visita");

    const pdfUrl = await firmarPdf(env, doc.archivo, 600);
    const pase = crearPase(visita.id, enlace.id, doc.id);

    return res.status(200).json({
      pase,
      pdfUrl,
      titulo: doc.titulo,
      destinatario: enlace.destinatario,
      empresa: enlace.empresa || "",
      numPaginas: doc.num_paginas || null,
    });
  } catch (err) {
    console.error("deck/acceso error:", err?.message || err);
    return res.status(502).json({ error: "La sala no está disponible ahora mismo. Prueba en un minuto." });
  }
}
