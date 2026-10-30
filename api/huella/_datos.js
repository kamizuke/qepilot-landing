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
  };
}
