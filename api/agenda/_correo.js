// Agenda · envío de correos por el SMTP de Evidran (el mismo de la app).
//
// Variables de entorno (Vercel, proyecto de la landing):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  — iguales que en la app
//   SMTP_FROM            remitente (si falta, SMTP_USER)
//   AGENDA_AVISOS_EMAIL  dónde le llegan a Lissette los avisos de demos
import nodemailer from "nodemailer";

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
    async enviar({ para, asunto, html, ics, metodo, responderA }) {
      await transporter.sendMail({
        from: { name: "Lissette · Evidran", address: remitente },
        to: para,
        replyTo: responderA || undefined,
        subject: asunto,
        html,
        icalEvent: ics ? { method: metodo || "REQUEST", filename: "demo-evidran.ics", content: ics } : undefined,
      });
    },
  };
}
