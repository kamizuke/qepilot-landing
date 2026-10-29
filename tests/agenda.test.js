// Pruebas de la agenda de demos y el seguimiento de llamadas.
// Ejecutar: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  madridAUtc,
  partesMadrid,
  huecosLibres,
  validarHorario,
  crearIcs,
  leerCsvContactos,
  claveContacto,
  fechaLarga,
} from "../api/agenda/_logica.js";
import { crearTrabajo, crearCitaPublica, hashToken } from "../api/agenda/_acciones.js";
import { crearDatosMemoria } from "../tools/agenda-memoria.mjs";

// --- Fechas ---
test("madridAUtc acierta en invierno, en verano y en los días de cambio de hora", () => {
  assert.equal(madridAUtc("2026-11-04", "10:00").toISOString(), "2026-11-04T09:00:00.000Z");
  assert.equal(madridAUtc("2026-07-01", "10:00").toISOString(), "2026-07-01T08:00:00.000Z");
  assert.equal(madridAUtc("2026-10-25", "10:00").toISOString(), "2026-10-25T09:00:00.000Z");
  assert.equal(madridAUtc("2026-03-29", "10:00").toISOString(), "2026-03-29T08:00:00.000Z");
  assert.deepEqual(partesMadrid(new Date("2026-11-02T09:30:00Z")), { fecha: "2026-11-02", hora: "10:30", dia: 1 });
});

test("fechaLarga se lee en español y en hora peninsular", () => {
  assert.equal(fechaLarga("2026-11-04T09:00:00Z"), "miércoles 4 de noviembre de 2026, a las 10:00");
});

// --- Huecos ---
const CONFIG = {
  horario: { 1: [["10:00", "11:30"]], 3: [["16:00", "17:00"]] },
  duracion_min: 30,
  margen_min: 15,
  antelacion_horas: 12,
  dias_vista: 8,
};

test("huecosLibres respeta días, antelación, margen y bloqueos", () => {
  // Domingo 1 de noviembre, 20:00 en Madrid.
  const ahora = new Date("2026-11-01T19:00:00Z");
  const todos = huecosLibres({ config: CONFIG, ahora }).map((h) => h.inicio);
  assert.deepEqual(todos, [
    "2026-11-02T09:00:00.000Z", "2026-11-02T09:30:00.000Z", "2026-11-02T10:00:00.000Z",
    "2026-11-04T15:00:00.000Z", "2026-11-04T15:30:00.000Z",
    "2026-11-09T09:00:00.000Z", "2026-11-09T09:30:00.000Z", "2026-11-09T10:00:00.000Z",
  ]);
  // Con una cita a las 10:30 del lunes, el margen de 15 min se come 10:00 y 11:00.
  const conCita = huecosLibres({
    config: CONFIG,
    ahora,
    citas: [{ id: "x", inicio: "2026-11-02T09:30:00Z", fin: "2026-11-02T10:00:00Z" }],
    bloqueos: [{ desde: "2026-11-04T00:00:00Z", hasta: "2026-11-05T00:00:00Z" }],
  }).map((h) => h.inicio);
  assert.deepEqual(conCita.slice(0, 2), ["2026-11-09T09:00:00.000Z", "2026-11-09T09:30:00.000Z"]);
  // Antelación: el lunes a las 9:00 ya no se ofrece el mismo lunes.
  const tarde = huecosLibres({ config: CONFIG, ahora: new Date("2026-11-02T08:00:00Z") }).map((h) => h.inicio);
  assert.equal(tarde[0], "2026-11-04T15:00:00.000Z");
});

test("validarHorario rechaza tramos al revés o que se pisan", () => {
  assert.deepEqual(validarHorario({ 2: [["16:00", "18:00"], ["10:00", "13:00"]] }), { 2: [["10:00", "13:00"], ["16:00", "18:00"]] });
  assert.equal(validarHorario({ 1: [["13:00", "10:00"]] }), null);
  assert.equal(validarHorario({ 1: [["10:00", "12:00"], ["11:00", "13:00"]] }), null);
  assert.equal(validarHorario({ 8: [["10:00", "12:00"]] }), null);
  assert.deepEqual(validarHorario({ 1: [] }), {});
});

// --- Invitación ---
test("crearIcs genera una invitación válida con líneas plegadas", () => {
  const ics = crearIcs({
    cita: { id: "abc", inicio: "2026-11-04T09:00:00Z", fin: "2026-11-04T09:30:00Z", nombre: "Ana Pérez", empresa: "Metal, S.L.", email: "ana@metal.es", secuencia: 2 },
    metodo: "REQUEST",
    organizador: { nombre: "Lissette · Evidran", email: "app@evidran.com" },
    avisos: "demo@evidran.com",
    enlaceReunion: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_muy_largo_que_obliga_a_plegar_la_linea_de_la_descripcion",
    ahora: new Date("2026-11-01T10:00:00Z"),
  });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /METHOD:REQUEST\r\n/);
  assert.match(ics, /DTSTART:20261104T090000Z\r\n/);
  assert.match(ics, /SEQUENCE:2\r\n/);
  assert.match(ics, /SUMMARY:Demo de Evidran · Metal\\, S\.L\.\r\n/);
  for (const linea of ics.split("\r\n")) assert.ok(Buffer.byteLength(linea) <= 75, linea);
  const cancel = crearIcs({
    cita: { id: "abc", inicio: "2026-11-04T09:00:00Z", fin: "2026-11-04T09:30:00Z", nombre: "Ana", email: "ana@metal.es", secuencia: 3 },
    metodo: "CANCEL",
    organizador: { nombre: "Evidran", email: "app@evidran.com" },
  });
  assert.match(cancel, /METHOD:CANCEL\r\n/);
  assert.match(cancel, /STATUS:CANCELLED\r\n/);
});

// --- CSV ---
test("leerCsvContactos entiende la exportación de Apollo y no importa móviles", () => {
  const csv =
    "First Name,Last Name,Title,Company,Email,Mobile Phone,Corporate Phone,Website,City\n" +
    'Ana,Pérez,Responsable de calidad,"Metal, S.L.",ana@metal.es,600111222,+34 986 111 222,metal.es,Vigo\n' +
    ",,,,,,,,\n" +
    "Luis,Gómez,Gerente,,luis@x.es,,,,\n";
  const r = leerCsvContactos(csv);
  assert.equal(r.contactos.length, 1);
  assert.equal(r.sinEmpresa, 1);
  assert.deepEqual(r.contactos[0], {
    empresa: "Metal, S.L.", persona: "Ana Pérez", cargo: "Responsable de calidad", telefono: "+34 986 111 222",
    email: "ana@metal.es", web: "metal.es", ciudad: "Vigo", origen: null,
  });
  const conPuntoYComa = leerCsvContactos("Empresa;Persona;Teléfono\nACME;Eva;986 222 333\n");
  assert.equal(conPuntoYComa.contactos[0].telefono, "986 222 333");
  assert.equal(leerCsvContactos("Nombre,Email\nAna,a@a.es").error, "Falta la columna de la empresa (Empresa o Company).");
  assert.equal(claveContacto({ empresa: "A", telefono: "+34 986 111 222" }), claveContacto({ empresa: "B", telefono: "986111222" }));
});

// --- Endpoints con datos en memoria ---
function respuesta() {
  return {
    statusCode: 0,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

function montar(ahoraIso = "2026-11-01T19:00:00Z") {
  const datos = crearDatosMemoria({ config: CONFIG });
  const enviados = [];
  const deps = {
    datos,
    correo: { remitente: "app@evidran.com", async enviar(m) { enviados.push(m); } },
    ahora: () => new Date(ahoraIso),
    ajustes: () => ({ claveAdmin: "clave-admin", claveSetter: "clave-setter", avisos: "demo@evidran.com", base: "https://evidran.com" }),
  };
  const trabajo = crearTrabajo(deps);
  const cita = crearCitaPublica(deps);
  let ip = 0;
  const llamar = async (handler, clave, body) => {
    const res = respuesta();
    await handler({ method: "POST", headers: { "x-clave": clave, "x-forwarded-for": `10.0.0.${++ip % 250}` }, body }, res);
    return res;
  };
  return {
    datos,
    enviados,
    admin: (body) => llamar(trabajo, "clave-admin", body),
    setter: (body) => llamar(trabajo, "clave-setter", body),
    sinClave: (body) => llamar(trabajo, "mala", body),
    publica: (body) => llamar(cita, "", body),
  };
}

test("la clave decide el rol y la setter no puede tocar lo de Lissette", async () => {
  const t = montar();
  assert.equal((await t.sinClave({ accion: "entrar" })).statusCode, 401);
  assert.equal((await t.setter({ accion: "entrar" })).body.rol, "setter");
  assert.equal((await t.admin({ accion: "entrar" })).body.rol, "admin");
  assert.equal((await t.setter({ accion: "importar", csv: "Empresa\nA" })).statusCode, 403);
  assert.equal((await t.setter({ accion: "guardar_config" })).statusCode, 403);
  const e = await t.setter({ accion: "estado" });
  assert.equal(e.body.config.enlace_reunion, undefined);
});

test("flujo completo: importar, llamar, agendar, choque, cambiar y cancelar", async () => {
  const t = montar();
  const imp = await t.admin({ accion: "importar", csv: "Empresa,Persona,Teléfono\nMetal SL,Ana,986111222\nMetal SL,Ana,+34 986 111 222\nPlast SA,Luis,986333444\n" });
  assert.deepEqual(imp.body, { creados: 2, repetidos: 1, sinEmpresa: 0, recortados: 0 });
  const [ana, luis] = t.datos._db.contactos;

  // Intento sin respuesta: cuenta para el pago.
  assert.equal((await t.setter({ accion: "llamada", contactoId: luis.id, resultado: "no_contesta" })).statusCode, 200);
  // «Demo» solo se anota reservando.
  assert.equal((await t.setter({ accion: "llamada", contactoId: ana.id, resultado: "demo" })).statusCode, 400);

  const { huecos } = (await t.setter({ accion: "huecos" })).body;
  const r = await t.setter({ accion: "reservar", inicio: huecos[0].inicio, nombre: "Ana", empresa: "Metal SL", email: "ana@metal.es", contactoId: ana.id, notas: "9001; Excel" });
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.correo, true);
  assert.equal(t.enviados.length, 2);
  assert.equal(t.enviados[0].para, "ana@metal.es");
  assert.equal(t.enviados[1].para, "demo@evidran.com");
  assert.match(t.enviados[0].html, /teams\.microsoft\.com/);
  const enlace = t.enviados[0].html.match(/https:\/\/evidran\.com\/cita\/([A-Za-z0-9_-]+)/);
  assert.ok(enlace, "el correo lleva el enlace para cambiar o cancelar");
  const token = enlace[1];
  assert.equal(t.datos._db.citas[0].token_hash, hashToken(token));
  assert.equal(t.datos._db.contactos[0].resultado, "demo");

  // Mismo hueco otra vez: ocupado.
  const doble = await t.admin({ accion: "reservar", inicio: huecos[0].inicio, nombre: "Otro", email: "o@o.es" });
  assert.equal(doble.statusCode, 409);

  // Resumen: 2 llamadas de la setter (no contesta + demo).
  const est = (await t.admin({ accion: "estado" })).body;
  assert.equal(est.resumen.llamadasSetter, 2);
  assert.equal(est.resumen.demosProximas, 1);
  assert.equal(est.contactos.find((c) => c.id === luis.id).historial[0].resultado, "no_contesta");

  // La persona ve su cita y la cambia de hora.
  const ver = await t.publica({ token, accion: "ver" });
  assert.equal(ver.body.estado, "confirmada");
  assert.equal(ver.body.email, undefined);
  const otros = (await t.publica({ token, accion: "huecos" })).body.huecos;
  const nuevo = otros.find((h) => h.inicio !== huecos[0].inicio);
  const mov = await t.publica({ token, accion: "mover", inicio: nuevo.inicio });
  assert.equal(mov.statusCode, 200);
  assert.equal(t.datos._db.citas[0].secuencia, 1);
  assert.match(t.enviados.at(-2).asunto, /cambiada/);

  // Y la cancela: el contacto vuelve a «volver a llamar».
  const can = await t.publica({ token, accion: "cancelar" });
  assert.equal(can.statusCode, 200);
  assert.equal(t.enviados.at(-2).metodo, "CANCEL");
  assert.equal(t.datos._db.contactos[0].resultado, "volver");
  assert.equal((await t.publica({ token, accion: "cancelar" })).statusCode, 409);
  assert.equal((await t.publica({ token: "x".repeat(22), accion: "ver" })).statusCode, 404);
});

test("solo se reserva en huecos del horario y con un correo válido", async () => {
  const t = montar();
  assert.equal((await t.admin({ accion: "reservar", inicio: "2026-11-02T08:00:00.000Z", nombre: "A", email: "a@a.es" })).statusCode, 409);
  assert.equal((await t.admin({ accion: "reservar", inicio: "2026-11-02T09:00:00.000Z", nombre: "A", email: "no-es-correo" })).statusCode, 400);
});

test("guardar horario, bloquear un día y cancelar desde el panel", async () => {
  const t = montar();
  assert.equal((await t.admin({ accion: "guardar_config", horario: { 2: [["09:00", "10:00"]] }, duracion_min: 30, margen_min: 0, antelacion_horas: 0, dias_vista: 14, enlace_reunion: "http://inseguro" })).statusCode, 400);
  assert.equal((await t.admin({ accion: "guardar_config", horario: { 2: [["09:00", "10:00"]] }, duracion_min: 30, margen_min: 0, antelacion_horas: 0, dias_vista: 14, enlace_reunion: "" })).statusCode, 200);
  let huecos = (await t.admin({ accion: "huecos" })).body.huecos;
  assert.equal(huecos[0].inicio, "2026-11-03T08:00:00.000Z");
  assert.equal((await t.admin({ accion: "crear_bloqueo", desde: "2026-11-03T00:00", hasta: "2026-11-04T00:00", motivo: "Médico" })).statusCode, 200);
  huecos = (await t.admin({ accion: "huecos" })).body.huecos;
  assert.equal(huecos[0].inicio, "2026-11-10T08:00:00.000Z");
  const r = await t.admin({ accion: "reservar", inicio: huecos[0].inicio, nombre: "Eva", email: "eva@x.es" });
  const c = await t.admin({ accion: "cancelar_cita", id: r.body.id });
  assert.equal(c.statusCode, 200);
  assert.match(t.enviados.at(-2).html, /Tenemos que cancelar/);
  assert.match(t.enviados[0].html, /Te enviaremos el enlace de la videollamada antes de la demo/);
});
