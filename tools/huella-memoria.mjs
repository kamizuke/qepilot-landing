// Calculadora de huella · datos en memoria para pruebas (tests/huella.test.js)
// y para el servidor local (tools/agenda-local.mjs).
import crypto from "node:crypto";

export function crearDatosHuellaMemoria() {
  const db = { calculos: [], contactos: [] };
  const copia = (o) => JSON.parse(JSON.stringify(o));
  return {
    _db: db,
    async crearCalculo(f) { const x = { id: crypto.randomUUID(), creado_en: new Date().toISOString(), ...f }; db.calculos.push(x); return copia(x); },
    async calculoPorId(id) { const x = db.calculos.find((c) => c.id === id); return x ? copia(x) : null; },
    async crearContacto(f) {
      const x = { id: crypto.randomUUID(), creado_en: new Date().toISOString(), confirmado_en: null, visitas_informe: 0, baja_en: null, ...f };
      db.contactos.push(x);
      return copia(x);
    },
    async contactoPorToken(h) {
      const x = db.contactos.find((c) => c.token_hash === h);
      return x ? copia({ ...x, huella_calculo: db.calculos.find((c) => c.id === x.calculo_id) || null }) : null;
    },
    async editarContacto(id, campos) { Object.assign(db.contactos.find((c) => c.id === id) || {}, campos); },
  };
}
