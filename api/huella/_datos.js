// Calculadora de huella gratuita · acceso a Supabase (service key, solo
// servidor). Se cambia por unos datos en memoria en las pruebas y en local.
import { rest } from "../deck/_comun.js";

export function crearDatosHuella(env) {
  return {
    async crearCalculo(fila) {
      const filas = await rest(env, "huella_calculo", { method: "POST", body: fila, headers: { Prefer: "return=representation" } });
      return filas?.[0];
    },
    async calculoPorId(id) {
      const filas = await rest(env, `huella_calculo?id=eq.${id}&select=*`);
      return filas?.[0] || null;
    },
    async crearContacto(fila) {
      const filas = await rest(env, "huella_contacto", { method: "POST", body: fila, headers: { Prefer: "return=representation" } });
      return filas?.[0];
    },
    async contactoPorToken(hash) {
      const filas = await rest(env, `huella_contacto?token_hash=eq.${hash}&select=*,huella_calculo(*)`);
      return filas?.[0] || null;
    },
    async editarContacto(id, campos) {
      await rest(env, `huella_contacto?id=eq.${id}`, { method: "PATCH", body: campos });
    },
    // Borra los contactos sin actividad desde antes de `antesIso`; devuelve cuántos.
    async borrarAntiguos(antesIso) {
      const filas = await rest(env, `huella_contacto?ultima_actividad=lt.${encodeURIComponent(antesIso)}&select=id`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      });
      return (filas || []).length;
    },

    // --- Lista de llamadas (tablas de la agenda) ---
    async contactosLlamadas() {
      return (await rest(env, "seg_contacto?select=id,telefono,resultado,no_llamar,setter_id,notas&limit=5000")) || [];
    },
    async settersActivos() {
      return (await rest(env, "seg_setter?activo=eq.true&select=id,nombre&order=creado_en.asc")) || [];
    },
    async crearContactoLlamadas(fila) {
      await rest(env, "seg_contacto", { method: "POST", body: fila });
    },
    async editarContactoLlamadas(id, campos) {
      await rest(env, `seg_contacto?id=eq.${id}`, { method: "PATCH", body: campos });
    },
  };
}
