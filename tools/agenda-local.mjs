// Agenda y seguimiento · servidor local para probar /llamadas y /cita/<token>
// sin Supabase ni SMTP: datos en memoria y correos que no salen (se ven en
// http://localhost:5188/_correos).
//   node tools/agenda-local.mjs
// Claves de prueba: «admin-local» (Lissette) y «setter-local» (setter).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crearTrabajo, crearCitaPublica } from "../api/agenda/_acciones.js";
import { crearDatosMemoria } from "./agenda-memoria.mjs";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const PUERTO = Number(process.env.PORT) || 5188;

const datos = crearDatosMemoria();
await datos.crearContactos([
  { empresa: "Mecanizados del Miño, S.L.", persona: "Ana Pérez", cargo: "Responsable de calidad", telefono: "+34 986 000 101", ciudad: "Tui", web: "mecanizadosmino.example", origen: "ISO 9001; 45 empleados" },
  { empresa: "Plásticos Atlántico", persona: "Luis Gómez", cargo: "Técnico de calidad", telefono: "+34 986 000 102", ciudad: "Vigo", origen: "ISO 9001 + 14001" },
  { empresa: "Conservas Ría Baixa", persona: "Marta Rey", cargo: "Calidad y medioambiente", telefono: "+34 986 000 103", ciudad: "Cangas", origen: "IFS Food" },
  { empresa: "Talleres Arousa", persona: null, cargo: null, telefono: "+34 986 000 104", ciudad: "Vilagarcía", origen: "ISO 9001; automoción" },
]);

const correos = [];
const deps = {
  datos,
  correo: { remitente: "app@evidran.com", async enviar(m) { correos.unshift({ ...m, enviadoEn: new Date().toISOString() }); } },
  ahora: () => new Date(),
  ajustes: () => ({ claveAdmin: "admin-local", claveSetter: "setter-local", avisos: "demo@evidran.com", base: `http://localhost:${PUERTO}` }),
};
const trabajo = crearTrabajo(deps);
const cita = crearCitaPublica(deps);

const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".webp": "image/webp" };

function adaptar(res) {
  return {
    status(c) { res.statusCode = c; return this; },
    json(b) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(b)); return this; },
  };
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/agenda/trabajo" || url.pathname === "/api/agenda/cita") {
    let cuerpo = "";
    for await (const trozo of req) cuerpo += trozo;
    req.body = cuerpo ? JSON.parse(cuerpo) : {};
    return (url.pathname.endsWith("trabajo") ? trabajo : cita)(req, adaptar(res));
  }
  if (url.pathname === "/_correos") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(
      "<meta charset=utf-8><body style='font-family:sans-serif;max-width:760px;margin:20px auto'><h1>Correos (no salen)</h1>" +
        correos.map((c) => `<hr><p><b>Para:</b> ${c.para} · <b>Asunto:</b> ${c.asunto} · ${c.metodo || ""}</p>${c.html}<details><summary>.ics</summary><pre>${(c.ics || "").replace(/</g, "&lt;")}</pre></details>`).join("") +
        "</body>"
    );
  }
  let ruta = url.pathname === "/llamadas" ? "/llamadas.html" : url.pathname.startsWith("/cita/") ? "/cita.html" : url.pathname;
  if (ruta === "/") ruta = "/llamadas.html";
  const fichero = path.join(raiz, path.normalize(decodeURIComponent(ruta)).replace(/^(\.\.[/\\])+/, ""));
  if (!fichero.startsWith(raiz) || !fs.existsSync(fichero) || fs.statSync(fichero).isDirectory()) {
    res.statusCode = 404;
    return res.end("No encontrado");
  }
  res.setHeader("Content-Type", TIPOS[path.extname(fichero)] || "application/octet-stream");
  fs.createReadStream(fichero).pipe(res);
}).listen(PUERTO, () => console.log(`Agenda local en http://localhost:${PUERTO}/llamadas`));
