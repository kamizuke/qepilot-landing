// Sala del deck · panel privado (/deck-panel.html). Todas las acciones
// exigen la cabecera x-admin-clave igual a DECK_ADMIN_CLAVE (Vercel).
import {
  entorno,
  rest,
  listarBucket,
  hashClave,
  generarClave,
  generarToken,
  generarSalt,
  compararTexto,
  limitador,
  ipDe,
} from "./_comun.js";

const limitado = limitador(60, 10 * 60 * 1000);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const env = entorno();
  const adminClave = process.env.DECK_ADMIN_CLAVE || "";
  if (!env || !adminClave) {
    console.error("deck/admin: faltan variables de entorno (SUPABASE_URL / SUPABASE_SERVICE_ROLE / DECK_ADMIN_CLAVE)");
    return res.status(503).json({ error: "El panel no está configurado todavía." });
  }

  if (limitado(ipDe(req))) {
    return res.status(429).json({ error: "Demasiadas peticiones. Espera unos minutos." });
  }

  const dada = String(req.headers["x-admin-clave"] || "");
  if (!dada || !compararTexto(dada, adminClave)) {
    return res.status(401).json({ error: "Clave del panel incorrecta." });
  }

  const { accion } = req.body || {};

  try {
    if (accion === "resumen") return await resumen(env, res);
    if (accion === "crear_documento") return await crearDocumento(env, req, res);
    if (accion === "crear_enlace") return await crearEnlace(env, req, res);
    if (accion === "estado_enlace") return await estadoEnlace(env, req, res);
    if (accion === "borrar_enlace") return await borrarEnlace(env, req, res);
    return res.status(400).json({ error: "Acción no reconocida." });
  } catch (err) {
    console.error(`deck/admin ${accion} error:`, err?.message || err);
    return res.status(502).json({ error: "No se pudo completar. Revisa los logs de Vercel." });
  }
}

async function resumen(env, res) {
  const [documentos, enlaces, ficheros] = await Promise.all([
    rest(env, "deck_documento?select=id,titulo,archivo,num_paginas,creado_en&order=creado_en.desc"),
    rest(
      env,
      "deck_enlace?select=id,token,destinatario,empresa,nota,activo,creado_en," +
        "deck_documento(id,titulo,num_paginas)," +
        "deck_visita(id,iniciada_en,ultima_actividad,pagina_max,deck_lectura(pagina,ms))" +
        "&order=creado_en.desc"
    ),
    listarBucket(env).catch(() => []),
  ]);

  const lista = (enlaces || []).map((e) => {
    const visitas = e.deck_visita || [];
    let totalMs = 0;
    let paginaMax = 0;
    let ultima = null;
    const porPagina = {};
    for (const v of visitas) {
      paginaMax = Math.max(paginaMax, v.pagina_max || 0);
      if (!ultima || v.iniciada_en > ultima) ultima = v.iniciada_en;
      for (const l of v.deck_lectura || []) {
        totalMs += l.ms;
        porPagina[l.pagina] = (porPagina[l.pagina] || 0) + l.ms;
      }
    }
    return {
      id: e.id,
      token: e.token,
      destinatario: e.destinatario,
      empresa: e.empresa,
      nota: e.nota,
      activo: e.activo,
      creadoEn: e.creado_en,
      documento: e.deck_documento
        ? { id: e.deck_documento.id, titulo: e.deck_documento.titulo, numPaginas: e.deck_documento.num_paginas }
        : null,
      aperturas: visitas.length,
      ultimaApertura: ultima,
      totalMs,
      paginaMax,
      porPagina,
      visitas: visitas
        .map((v) => {
          let ms = 0;
          for (const l of v.deck_lectura || []) ms += l.ms;
          return { iniciadaEn: v.iniciada_en, ms, paginaMax: v.pagina_max || 0 };
        })
        .sort((a, b) => (a.iniciadaEn < b.iniciadaEn ? 1 : -1)),
    };
  });

  return res.status(200).json({ documentos: documentos || [], enlaces: lista, ficheros });
}

async function crearDocumento(env, req, res) {
  const { titulo, archivo } = req.body || {};
  if (
    typeof titulo !== "string" || !titulo.trim() || titulo.length > 200 ||
    typeof archivo !== "string" || !/\.pdf$/i.test(archivo) || archivo.length > 300 ||
    archivo.includes("..")
  ) {
    return res.status(400).json({ error: "Título o fichero no válidos." });
  }
  const filas = await rest(env, "deck_documento", {
    method: "POST",
    body: { titulo: titulo.trim(), archivo },
    headers: { Prefer: "return=representation" },
  });
  return res.status(200).json({ documento: filas?.[0] || null });
}

async function crearEnlace(env, req, res) {
  const { documentoId, destinatario, empresa, nota } = req.body || {};
  if (
    !UUID.test(String(documentoId || "")) ||
    typeof destinatario !== "string" || !destinatario.trim() || destinatario.length > 120
  ) {
    return res.status(400).json({ error: "Faltan el documento o el destinatario." });
  }
  const token = generarToken();
  const clave = generarClave(8);
  const salt = generarSalt();
  const filas = await rest(env, "deck_enlace", {
    method: "POST",
    body: {
      documento_id: documentoId,
      token,
      destinatario: destinatario.trim(),
      empresa: typeof empresa === "string" ? empresa.trim().slice(0, 120) || null : null,
      nota: typeof nota === "string" ? nota.trim().slice(0, 400) || null : null,
      clave_hash: hashClave(clave, salt),
      clave_salt: salt,
    },
    headers: { Prefer: "return=representation" },
  });
  const enlace = filas?.[0];
  if (!enlace) throw new Error("no se pudo crear el enlace");
  // La clave solo viaja aquí, una vez; en la base queda el hash.
  return res.status(200).json({ id: enlace.id, token, clave });
}

async function estadoEnlace(env, req, res) {
  const { enlaceId, activo } = req.body || {};
  if (!UUID.test(String(enlaceId || "")) || typeof activo !== "boolean") {
    return res.status(400).json({ error: "Datos no válidos." });
  }
  await rest(env, `deck_enlace?id=eq.${enlaceId}`, { method: "PATCH", body: { activo } });
  return res.status(200).json({ ok: true });
}

async function borrarEnlace(env, req, res) {
  const { enlaceId } = req.body || {};
  if (!UUID.test(String(enlaceId || ""))) {
    return res.status(400).json({ error: "Datos no válidos." });
  }
  // Borra en cascada sus visitas y lecturas (así se cumple lo prometido:
  // se puede eliminar el rastro de un destinatario cuando se quiera).
  await rest(env, `deck_enlace?id=eq.${enlaceId}`, { method: "DELETE" });
  return res.status(200).json({ ok: true });
}
