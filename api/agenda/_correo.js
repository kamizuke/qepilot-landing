// Agenda · envío de correos por el SMTP de Evidran (el mismo de la app).
//
// Variables de entorno (Vercel, proyecto de la landing):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  — iguales que en la app
//   SMTP_FROM            remitente (si falta, SMTP_USER)
//   AGENDA_AVISOS_EMAIL  dónde le llegan a Lissette los avisos de demos
import nodemailer from "nodemailer";
import { textoDeHtml, documentoHtml } from "./_logica.js";

// El mensaje tal cual sale: HTML completo + texto plano + invitación de
// calendario. Separado del envío para poder probarlo sin SMTP.
export function montarMensaje({ remitente, para, asunto, html, ics, metodo, responderA }) {
  return {
    from: { name: "Evidran", address: remitente },
    to: para,
    replyTo: responderA || undefined,
    subject: asunto,
    text: textoDeHtml(html),
    html: documentoHtml(html, asunto),
    icalEvent: ics ? { method: metodo || "REQUEST", filename: "demo-evidran.ics", content: ics } : undefined,
  };
}

export function crearCorreo() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const remitente = process.env.SMTP_FROM || user;
  if (!host || !remitente.includes("@")) return null;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
  return {
    remitente,
    async enviar(datos) {
      await transporter.sendMail(montarMensaje({ remitente, ...datos }));
    },
  };
}
