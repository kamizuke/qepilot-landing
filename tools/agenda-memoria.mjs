// Agenda y seguimiento · datos en memoria con las mismas reglas que las
// funciones SQL de migraciones/agenda-llamadas.sql. Solo para pruebas
// (tests/agenda.test.js) y para el servidor local (tools/agenda-local.mjs).
import crypto from "node:crypto";

function error(codigo) {
  const e = new Error(codigo);
  e.codigo = codigo;
  return e;
}

export function crearDatosMemoria(semilla = {}) {
  const db = {
    config: {
      id: 1,
      horario: { 1: [["10:00", "13:00"], ["16:00", "18:00"]], 2: [["10:00", "13:00"]], 3: [["10:00", "13:00"]], 4: [["10:00", "13:00"]] },
      duracion_min: 30,
      margen_min: 15,
      antelacion_horas: 12,
      dias_vista: 21,
      enlace_reunion: "https://teams.microsoft.com/l/meetup-join/ejemplo",
      ...semilla.config,
    },
    bloqueos: [],
    contactos: [],
    citas: [],
    llamadas: [],
  };
  const id = () => crypto.randomUUID();
  const ahoraIso = () => new Date().toISOString();

  function choque(inicio, fin, margenMin, excepto) {
    const i = new Date(inicio).getTime();
    const f = new Date(fin).getTime();
    const m = margenMin * 60000;
    if (db.citas.some((c) => c.estado === "confirmada" && c.id !== excepto &&
      new Date(c.inicio).getTime() - m < f && new Date(c.fin).getTime() + m > i)) return "hueco_ocupado";
    if (db.bloqueos.some((b) => new Date(b.desde).getTime() < f && new Date(b.hasta).getTime() > i)) return "hueco_bloqueado";
    return null;
  }

  const copia = (o) => JSON.parse(JSON.stringify(o));

  return {
    _db: db,
    async leerConfig() { return copia(db.config); },
    async guardarConfig(campos) { Object.assign(db.config, campos); },
    async listarBloqueos(desde) { return copia(db.bloqueos.filter((b) => b.hasta > desde).sort((a, b) => (a.desde < b.desde ? -1 : 1))); },
    async crearBloqueo(b) { db.bloqueos.push({ id: id(), ...b }); },
    async borrarBloqueo(bid) { db.bloqueos = db.bloqueos.filter((b) => b.id !== bid); },
    async citasConfirmadasDesde(desde) { return copia(db.citas.filter((c) => c.estado === "confirmada" && c.fin > desde)); },
    async citasRecientes(desde) { return copia(db.citas.filter((c) => c.inicio > desde).sort((a, b) => (a.inicio < b.inicio ? -1 : 1))); },
    async citaPorId(cid) { const c = db.citas.find((x) => x.id === cid); return c ? copia(c) : null; },
    async citaPorToken(h) { const c = db.citas.find((x) => x.token_hash === h); return c ? copia(c) : null; },
    async reservar(a) {
      const ch = choque(a.inicio, a.fin, a.margen, null);
      if (ch) throw error(ch);
      if (a.contactoId && !db.contactos.some((c) => c.id === a.contactoId)) throw new Error("violates foreign key");
      const cita = {
        id: id(), inicio: a.inicio, fin: a.fin, nombre: a.nombre, empresa: a.empresa, email: a.email,
        telefono: a.telefono, notas: a.notas, origen: a.origen, contacto_id: a.contactoId, estado: "confirmada",
        token_hash: a.tokenHash, secuencia: 0, creada_en: ahoraIso(), cancelada_en: null, cancelada_por: null,
      };
      db.citas.push(cita);
      if (a.contactoId) {
        db.llamadas.push({ id: id(), contacto_id: a.contactoId, hecha_en: ahoraIso(), resultado: "demo", nota: null, rol: a.rol });
        const c = db.contactos.find((x) => x.id === a.contactoId);
        Object.assign(c, { resultado: "demo", intentos: c.intentos + 1, ultima_llamada: ahoraIso(), volver_en: null, cita_id: cita.id });
      }
      return cita.id;
    },
    async editarCita(cid, campos) { Object.assign(db.citas.find((c) => c.id === cid && c.estado === "confirmada") || {}, campos); },
    async mover(cid, inicio, fin, margen) {
      const ch = choque(inicio, fin, margen, cid);
      if (ch) throw error(ch);
      const c = db.citas.find((x) => x.id === cid && x.estado === "confirmada");
      if (!c) throw error("cita_no_disponible");
      Object.assign(c, { inicio, fin, secuencia: c.secuencia + 1 });
      return c.secuencia;
    },
    async cancelar(cid, por) {
      const c = db.citas.find((x) => x.id === cid && x.estado === "confirmada");
      if (!c) throw error("cita_no_disponible");
      Object.assign(c, { estado: "cancelada", secuencia: c.secuencia + 1, cancelada_en: ahoraIso(), cancelada_por: por });
      const k = db.contactos.find((x) => x.id === c.contacto_id && x.cita_id === cid);
      if (k) Object.assign(k, { resultado: "volver", volver_en: ahoraIso(), cita_id: null });
      return c.secuencia;
    },
    async listarContactos() { return copia(db.contactos); },
    async listarLlamadas() { return copia([...db.llamadas].sort((a, b) => (a.hecha_en < b.hecha_en ? 1 : -1))); },
    async crearContactos(filas) {
      for (const f of filas) {
        db.contactos.push({
          id: id(), persona: null, cargo: null, telefono: null, email: null, web: null, ciudad: null, origen: null,
          notas: null, resultado: null, intentos: 0, ultima_llamada: null, volver_en: null, no_llamar: false,
          cita_id: null, creado_en: ahoraIso(), ...f,
        });
      }
    },
    async editarContacto(cid, campos) { Object.assign(db.contactos.find((c) => c.id === cid) || {}, campos); },
    async borrarContacto(cid) {
      for (const l of db.llamadas) if (l.contacto_id === cid) Object.assign(l, { nota: null, contacto_id: null });
      db.contactos = db.contactos.filter((c) => c.id !== cid);
    },
    async registrarLlamada(cid, resultado, nota, volverEn, rol) {
      const c = db.contactos.find((x) => x.id === cid);
      if (!c) throw error("contacto_no_existe");
      db.llamadas.push({ id: id(), contacto_id: cid, hecha_en: ahoraIso(), resultado, nota, rol });
      Object.assign(c, {
        resultado, intentos: c.intentos + 1, ultima_llamada: ahoraIso(),
        volver_en: resultado === "volver" ? volverEn : null, no_llamar: c.no_llamar || resultado === "no_llamar",
      });
    },
  };
}
