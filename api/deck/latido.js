// Sala del deck · latido de lectura: el visor manda cada pocos segundos
// cuánto tiempo lleva en cada página. Sin IP, sin cookies: solo la visita.
import { entorno, rpc, rest, leerPase, limitador, ipDe } from "./_comun.js";

const limitado = limitador(240, 10 * 60 * 1000); // sobra para 1 lector real

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const env = entorno();
  if (!env) return res.status(503).end();

  if (limitado(ipDe(req))) return res.status(429).end();

  // sendBeacon manda texto plano; req.body puede llegar como string.
  let cuerpo = req.body;
  if (typeof cuerpo === "string") {
    try { cuerpo = JSON.parse(cuerpo); } catch { cuerpo = null; }
  }
  const { pase, eventos, numPaginas } = cuerpo || {};

  const datos = leerPase(pase);
  if (!datos) return res.status(401).end();

  const lista = Array.isArray(eventos) ? eventos.slice(0, 60) : [];
  const limpios = lista
    .filter(
      (e) =>
        e &&
        Number.isInteger(e.pagina) && e.pagina >= 1 && e.pagina <= 500 &&
        Number.isFinite(e.ms) && e.ms > 0
    )
    .map((e) => ({ pagina: e.pagina, ms: Math.min(Math.round(e.ms), 600000) }));

  try {
    if (limpios.length > 0) {
      await rpc(env, "deck_registrar_lectura", {
        p_visita: datos.visitaId,
        p_eventos: limpios,
      });
    }
    // El visor comunica una vez el total de páginas; se guarda si falta.
    if (Number.isInteger(numPaginas) && numPaginas >= 1 && numPaginas <= 500) {
      await rest(env, `deck_documento?id=eq.${datos.documentoId}&num_paginas=is.null`, {
        method: "PATCH",
        body: { num_paginas: numPaginas },
      });
    }
    return res.status(204).end();
  } catch (err) {
    console.error("deck/latido error:", err?.message || err);
    return res.status(502).end();
  }
}
