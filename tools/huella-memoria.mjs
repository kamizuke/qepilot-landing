// Calculadora de huella · datos en memoria para pruebas (tests/huella.test.js)
// y para el servidor local (tools/agenda-local.mjs). `agenda` es el _db de
// agenda-memoria.mjs: así el paso a la lista de llamadas se ve en /llamadas.
import crypto from "node:crypto";

export function crearDatosHuellaMemoria(agenda = { contactos: [], setters: [] }) {
  const db = { calculos: [], contactos: [], agenda };
  const copia = (o) => JSON.parse(JSON.stringify(o));
  return {
    _db: db,
    async crearCalculo(f) { const x = { id: crypto.randomUUID(), creado_en: new Date().toISOString(), ...f }; db.calculos.push(x); return copia(x); },
    async calculoPorId(id) { const x = db.calculos.find((c) => c.id === id); return x ? copia(x) : null; },
    async crearContacto(f) {
      const ahora = new Date().toISOString();
      const x = { id: crypto.randomUUID(), creado_en: ahora, ultima_actividad: ahora, confirmado_en: null, visitas_informe: 0, baja_en: null, ...f };
      db.contactos.push(x);
      return copia(x);
    },
    async contactoPorToken(h) {
      const x = db.contactos.find((c) => c.token_hash === h);
      return x ? copia({ ...x, huella_calculo: db.calculos.find((c) => c.id === x.calculo_id) || null }) : null;
    },
    async editarContacto(id, campos) { Object.assign(db.contactos.find((c) => c.id === id) || {}, campos); },
    async borrarAntiguos(antes) {
      const n = db.contactos.length;
      db.contactos = db.contactos.filter((c) => !(c.ultima_actividad < antes));
      return n - db.contactos.length;
    },
    async contactosLlamadas() { return copia(agenda.contactos); },
    async settersActivos() { return copia((agenda.setters || []).filter((x) => x.activo).map(({ id, nombre }) => ({ id, nombre }))); },
    async crearContactoLlamadas(f) {
      agenda.contactos.push({
        id: crypto.randomUUID(), persona: null, cargo: null, web: null, ciudad: null, notas: null, resultado: null, intentos: 0,
        ultima_llamada: null, volver_en: null, no_llamar: false, cita_id: null, creado_en: new Date().toISOString(), setter_id: null, ...f,
      });
    },
    async editarContactoLlamadas(id, campos) { Object.assign(agenda.contactos.find((c) => c.id === id) || {}, campos); },
  };
}
