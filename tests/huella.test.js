// Pruebas de la calculadora de huella gratuita. Ejecutar: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcular, simular, objetivo, textoCuestionario, tablasMiteco, limpiarEntrada, toneladas } from "../public/huella/calculo.js";
import { COMERCIALIZADORAS } from "../public/huella/comercializadoras.js";
import { crearCalculadora, hashToken, limpiar } from "../api/huella/_acciones.js";
import { crearDatosHuellaMemoria } from "../tools/huella-memoria.mjs";

// Caso validado en la app contra la calculadora oficial (47,24 t en el Excel del MITECO).
const CASO = {
  anio: 2025,
  fijas: [{ combustible: "gas_natural", cantidad: 100800 }],
  vehiculos: [{ combustible: "gasoleo_a", categoria: "n1", cantidad: 2500 }],
  electricidad: [{ comercializadora: "IBERDROLA CLIENTES, S.A.U.", gdo: "no", kwh: 90000 }],
};

test("el cálculo da lo mismo que la app y que la calculadora del MITECO", () => {
  const r = calcular(CASO, COMERCIALIZADORAS);
  assert.equal(toneladas(r.total), "47,2");
  assert.equal(toneladas(r.a1), "24,6");
  assert.equal(toneladas(r.a2), "22,6");
  assert.deepEqual(r.partidas.map((p) => p.factor), [0.182, 2.505, 0.251]);
  assert.deepEqual(tablasMiteco(r).map((t) => t.filas), [
    [["Gas natural (kWhPCS)*", "100800"]],
    [["Furgonetas y furgones (N1)", "B7 (l)", "2500"]],
    [["IBERDROLA CLIENTES, S.A.U.", "No", "90000"]],
  ]);
});

test("garantía de origen, comercializadora desconocida, biomasa y años", () => {
  const renovable = calcular({ ...CASO, electricidad: [{ ...CASO.electricidad[0], gdo: "renovable" }] }, COMERCIALIZADORAS);
  assert.equal(renovable.a2, 0);
  const otra = calcular({ anio: 2025, electricidad: [{ comercializadora: "Inventada SL", gdo: "no", kwh: 1000 }] }, COMERCIALIZADORAS);
  assert.equal(otra.partidas[0].factor, 0.258);
  assert.match(otra.avisos[0], /no está en la lista/);
  const bio = calcular({ anio: 2025, fijas: [{ combustible: "biomasa", cantidad: 1000 }] }, COMERCIALIZADORAS);
  assert.equal(bio.partidas.length, 0);
  assert.match(bio.avisos[0], /elige el tipo/);
  const bio2 = calcular({ anio: 2025, fijas: [{ combustible: "biomasa", detalle: "pellets", cantidad: 1000 }] }, COMERCIALIZADORAS);
  assert.equal(bio2.partidas[0].celdas[0], "Biomasa pellets (kg)**");
  assert.equal(calcular({ anio: 2018, vehiculos: [{ combustible: "gasoleo_a", categoria: "n1", cantidad: 1 }] }, COMERCIALIZADORAS).partidas[0].celdas[1], "Gasóleo (l)");
  assert.equal(calcular({ ...CASO, anio: 2030 }, COMERCIALIZADORAS).partidas.length, 0);
  assert.equal(calcular({ ...CASO, fijas: [{ combustible: "gas_natural", cantidad: 1000, aprox: true }] }, COMERCIALIZADORAS).aproximado, true);
});

test("simulador, objetivo y texto para cuestionarios", () => {
  const { escenarios } = simular(CASO, COMERCIALIZADORAS);
  assert.deepEqual(escenarios.map((e) => [e.titulo, toneladas(e.total)]), [
    ["Electricidad con garantía de origen renovable", "24,6"],
    ["Un 10 % menos de combustible en vehículos", "46,6"],
    ["Un 10 % menos de combustible en instalaciones", "45,4"],
  ]);
  const r = calcular(CASO, COMERCIALIZADORAS);
  const o = objetivo(r, 20);
  assert.equal(o.texto, "Reducir un 20 % las emisiones de la electricidad comprada en 2027 respecto a 2025 (de 22,6 t CO₂e a 18,1 t CO₂e).");
  const t = textoCuestionario(r, "Metal SL");
  assert.match(t, /^Metal SL ha calculado su huella de carbono de 2025/);
  assert.match(t, /v17, 7 de mayo de 2026/);
  assert.match(t, /No incluye el alcance 3/);
  assert.equal(limpiarEntrada({ anio: 1999 }), null);
  assert.deepEqual(limpiarEntrada({ anio: 2025, fijas: [{ combustible: "gas_natural", cantidad: "1.000,5", raro: "x" }] }).fijas, [
    { combustible: "gas_natural", cantidad: 0, detalle: null, aprox: false },
  ]);
});

function montar(agenda) {
  const datos = crearDatosHuellaMemoria(agenda);
  const enviados = [];
  const handler = crearCalculadora({
    datos,
    correo: { remitente: "app@evidran.com", async enviar(m) { enviados.push(m); } },
    comercializadoras: COMERCIALIZADORAS,
    ahora: () => new Date("2026-10-30T10:00:00Z"),
    ajustes: () => ({ base: "https://www.evidran.com", avisos: "demo@evidran.com" }),
    cron: "",
  });
  let ip = 0;
  const llamar = async (body) => {
    const res = { statusCode: 0, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
    await handler({ method: body.metodo || "POST", headers: { "x-forwarded-for": `10.1.0.${++ip}` }, body }, res);
    return res;
  };
  return { datos, enviados, llamar };
}

test("calcular, pedir el informe, confirmar con el enlace y darse de baja", async () => {
  const t = montar();
  assert.equal((await t.llamar({ accion: "calcular", entrada: { anio: 2025 } })).statusCode, 400);
  const c = await t.llamar({ accion: "calcular", entrada: CASO });
  assert.equal(c.statusCode, 200);
  assert.equal(t.datos._db.calculos[0].email, undefined);

  // Sin la casilla del informe o sin correo válido, no se envía nada.
  assert.equal((await t.llamar({ accion: "enviar", calculoId: c.body.id, email: "ana@metal.es", empresa: "Metal SL" })).statusCode, 400);
  assert.equal((await t.llamar({ accion: "enviar", calculoId: c.body.id, email: "mal", empresa: "Metal SL", informe: true })).statusCode, 400);
  // La trampa para robots responde bien pero no guarda ni envía.
  assert.equal((await t.llamar({ accion: "enviar", calculoId: c.body.id, email: "a@a.es", empresa: "X", informe: true, web: "spam" })).body.ok, true);
  assert.equal(t.datos._db.contactos.length, 0);

  const e = await t.llamar({ accion: "enviar", calculoId: c.body.id, email: "ana@metal.es", empresa: "Metal SL", telefono: "", informe: true, novedades: true, llamada: true });
  assert.deepEqual(e.body, { ok: true, correo: true });
  const contacto = t.datos._db.contactos[0];
  assert.equal(contacto.acepta_novedades, true);
  assert.equal(contacto.acepta_llamada, false, "sin teléfono no puede aceptar llamada");
  assert.equal(t.enviados.length, 1);
  assert.match(t.enviados[0].asunto, /Tu informe de huella de carbono de 2025/);
  assert.match(t.enviados[0].html, /47,2 t CO₂e/);
  const token = t.enviados[0].html.match(/\/huella\/informe\/([A-Za-z0-9_-]+)/)[1];
  assert.equal(contacto.token_hash, hashToken(token));

  // Abrir el enlace confirma y avisa una sola vez.
  const i = await t.llamar({ accion: "informe", token });
  assert.equal(i.body.empresa, "Metal SL");
  assert.equal(i.body.entrada.anio, 2025);
  assert.ok(t.datos._db.contactos[0].confirmado_en);
  assert.equal(t.enviados.at(-1).para, "demo@evidran.com");
  assert.match(t.enviados.at(-1).asunto, /Nuevo contacto de la calculadora: Metal SL · 47,2 t/);
  await t.llamar({ accion: "informe", token });
  assert.equal(t.enviados.length, 2);
  assert.equal(t.datos._db.contactos[0].visitas_informe, 2);

  assert.equal((await t.llamar({ accion: "baja", token })).statusCode, 200);
  assert.equal(t.datos._db.contactos[0].acepta_novedades, false);
  assert.equal((await t.llamar({ accion: "informe", token: "x".repeat(22) })).statusCode, 404);
});

async function pedirYConfirmar(t, { telefono = "986 555 777", llamada = true, empresa = "Metal SL" } = {}) {
  const c = await t.llamar({ accion: "calcular", entrada: CASO });
  await t.llamar({ accion: "enviar", calculoId: c.body.id, email: "ana@metal.es", empresa, telefono, informe: true, llamada });
  const token = t.enviados.filter((m) => m.para === "ana@metal.es").at(-1).html.match(/\/huella\/informe\/([A-Za-z0-9_-]+)/)[1];
  await t.llamar({ accion: "informe", token });
  return token;
}

test("quien acepta la llamada pasa a la lista de llamadas al confirmar, a la persona con menos pendientes", async () => {
  const agenda = {
    contactos: [
      { id: "c1", empresa: "Otra", telefono: "986000001", resultado: null, no_llamar: false, setter_id: "s1" },
      { id: "c2", empresa: "Otra 2", telefono: "986000002", resultado: "volver", no_llamar: false, setter_id: "s1" },
    ],
    setters: [{ id: "s1", nombre: "Marta", activo: true }, { id: "s2", nombre: "Luis", activo: true }, { id: "s3", nombre: "Eva", activo: false }],
  };
  const t = montar(agenda);
  await pedirYConfirmar(t);
  const nuevo = agenda.contactos.at(-1);
  assert.equal(nuevo.empresa, "Metal SL");
  assert.equal(nuevo.setter_id, "s2");
  assert.ok(nuevo.caliente_desde);
  assert.match(nuevo.origen, /^Calculadora de huella: 47,2 t CO₂e en 2025; fuente principal: la electricidad comprada \(48 %\)/);
  assert.match(t.enviados.at(-1).html, /Añadido arriba de la lista de llamadas \(asignado a Luis\)/);
  // Volver a abrir el enlace no lo duplica.
  const token = t.enviados[0].html.match(/\/huella\/informe\/([A-Za-z0-9_-]+)/)[1];
  await t.llamar({ accion: "informe", token });
  assert.equal(agenda.contactos.length, 3);
});

test("si su teléfono ya estaba, vuelve arriba; si pidió no ser llamado, se respeta; sin llamada, no entra", async () => {
  const agenda = {
    contactos: [
      { id: "c1", empresa: "Metal", telefono: "+34 986 555 777", resultado: "no_interesa", no_llamar: false, setter_id: "s1", notas: "Llamar en enero" },
      { id: "c2", empresa: "Fuera", telefono: "986 111 222", resultado: "no_llamar", no_llamar: true, setter_id: null },
    ],
    setters: [{ id: "s1", nombre: "Marta", activo: true }],
  };
  let t = montar(agenda);
  await pedirYConfirmar(t);
  assert.equal(agenda.contactos.length, 2);
  assert.equal(agenda.contactos[0].resultado, "volver");
  assert.ok(agenda.contactos[0].caliente_desde);
  assert.match(agenda.contactos[0].notas, /^Llamar en enero\n30\/10\/2026: Calculadora de huella/);
  assert.match(t.enviados.at(-1).html, /Ya estaba en la lista: vuelve arriba \(Marta\)/);

  t = montar(agenda);
  await pedirYConfirmar(t, { telefono: "986111222" });
  assert.equal(agenda.contactos[1].caliente_desde, undefined);
  assert.match(t.enviados.at(-1).html, /«No llamar»: no se ha añadido/);

  t = montar(agenda);
  await pedirYConfirmar(t, { telefono: "986999888", llamada: false });
  assert.equal(agenda.contactos.length, 2);
});

test("el cron borra los contactos sin actividad en 24 meses y nada más", async () => {
  const t = montar();
  await pedirYConfirmar(t, { llamada: false });
  t.datos._db.contactos.push({ ...t.datos._db.contactos[0], id: "viejo", ultima_actividad: "2024-10-29T00:00:00.000Z" });
  t.datos._db.contactos.push({ ...t.datos._db.contactos[0], id: "justo", ultima_actividad: "2024-10-31T00:00:00.000Z" });
  const r = await t.llamar({ metodo: "GET" });
  assert.deepEqual(r.body, { borrados: 1 });
  assert.deepEqual(t.datos._db.contactos.map((c) => c.id).slice(1), ["justo"]);
  assert.equal(t.datos._db.calculos.length, 1, "los cálculos (sin datos personales) se quedan");
  // Con CRON_SECRET, sin la cabecera correcta no hace nada.
  const conClave = crearCalculadora({ datos: t.datos, comercializadoras: COMERCIALIZADORAS, ahora: () => new Date(), ajustes: () => ({}), cron: "x" });
  const res = { status(c) { this.c = c; return this; }, json(b) { this.b = b; return this; } };
  await conClave({ method: "GET", headers: {}, body: {} }, res);
  assert.equal(res.c, 401);
  assert.equal(typeof limpiar, "function");
});
