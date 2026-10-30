// Agenda y seguimiento · acceso a Supabase (service key, solo servidor).
// Toda la lectura/escritura pasa por aquí para que las acciones se puedan
// probar con unos datos en memoria (tools/agenda-local.mjs).
import { rest, rpc } from "../deck/_comun.js";

const ERRORES = /(hueco_ocupado|hueco_bloqueado|cita_no_disponible|contacto_no_existe)/;

// Los errores propios de las funciones SQL llegan dentro del texto de
// PostgREST; se convierten en un código que las acciones entienden.
async function conCodigo(promesa) {
  try {
    return await promesa;
  } catch (err) {
    const m = String(err?.message || "").match(ERRORES);
    if (m) {
      const e = new Error(m[1]);
      e.codigo = m[1];
      throw e;
    }
    throw err;
  }
}

const CAMPOS_CITA = "id,inicio,fin,nombre,empresa,email,telefono,notas,origen,contacto_id,estado,secuencia,creada_en,cancelada_en,cancelada_por,setter_id";

export function crearDatos(env) {
  return {
    async leerConfig() {
      const filas = await rest(env, "agenda_config?id=eq.1&select=*");
      return filas?.[0] || null;
    },
    async guardarConfig(campos) {
      await rest(env, "agenda_config?id=eq.1", {
        method: "PATCH",
        body: { ...campos, actualizado_en: new Date().toISOString() },
      });
    },

    async listarBloqueos(desdeIso) {
      return (await rest(env, `agenda_bloqueo?hasta=gt.${encodeURIComponent(desdeIso)}&select=id,desde,hasta,motivo&order=desde.asc`)) || [];
    },
    async crearBloqueo(b) {
      await rest(env, "agenda_bloqueo", { method: "POST", body: b });
    },
    async borrarBloqueo(id) {
      await rest(env, `agenda_bloqueo?id=eq.${id}`, { method: "DELETE" });
    },

    async citasConfirmadasDesde(desdeIso) {
      return (
        (await rest(
          env,
          `agenda_cita?estado=eq.confirmada&fin=gt.${encodeURIComponent(desdeIso)}&select=${CAMPOS_CITA}&order=inicio.asc`
        )) || []
      );
    },
    async citasRecientes(desdeIso) {
      return (
        (await rest(env, `agenda_cita?inicio=gt.${encodeURIComponent(desdeIso)}&select=${CAMPOS_CITA}&order=inicio.asc&limit=500`)) || []
      );
    },
    async citaPorId(id) {
      const filas = await rest(env, `agenda_cita?id=eq.${id}&select=${CAMPOS_CITA}`);
      return filas?.[0] || null;
    },
    async citaPorToken(tokenHash) {
      const filas = await rest(env, `agenda_cita?token_hash=eq.${tokenHash}&select=${CAMPOS_CITA}`);
      return filas?.[0] || null;
    },
    async reservar(a) {
      return conCodigo(
        rpc(env, "agenda_reservar", {
          p_inicio: a.inicio,
          p_fin: a.fin,
          p_margen_min: a.margen,
          p_nombre: a.nombre,
          p_empresa: a.empresa,
          p_email: a.email,
          p_telefono: a.telefono,
          p_notas: a.notas,
          p_origen: a.origen,
          p_contacto: a.contactoId,
          p_token_hash: a.tokenHash,
          p_rol: a.rol,
          // Solo se manda si hay persona: así la llamada vale también para
          // la versión de la función anterior a la sección 14 de la migración.
          ...(a.setterId ? { p_setter: a.setterId } : {}),
        })
      );
    },
    async editarCita(id, campos) {
      await rest(env, `agenda_cita?id=eq.${id}&estado=eq.confirmada`, { method: "PATCH", body: campos });
    },
    async mover(id, inicio, fin, margen) {
      return conCodigo(rpc(env, "agenda_mover", { p_id: id, p_inicio: inicio, p_fin: fin, p_margen_min: margen }));
    },
    async cancelar(id, por) {
      return conCodigo(rpc(env, "agenda_cancelar", { p_id: id, p_por: por }));
    },

    async listarContactos() {
      return (
        (await rest(
          env,
          "seg_contacto?select=id,empresa,persona,cargo,telefono,email,web,ciudad,origen,notas,resultado,intentos,ultima_llamada,volver_en,no_llamar,cita_id,creado_en,setter_id,caliente_desde&order=creado_en.asc&limit=5000"
        )) || []
      );
    },
    async listarLlamadas() {
      return (await rest(env, "seg_llamada?select=id,contacto_id,hecha_en,resultado,nota,rol,setter_id&order=hecha_en.desc&limit=20000")) || [];
    },
    async crearContactos(filas) {
      if (!filas.length) return;
      await rest(env, "seg_contacto", { method: "POST", body: filas });
    },
    async editarContacto(id, campos) {
      await rest(env, `seg_contacto?id=eq.${id}`, { method: "PATCH", body: campos });
    },
    async borrarContacto(id) {
      await rpc(env, "seg_borrar_contacto", { p_id: id });
    },
    async registrarLlamada(contactoId, resultado, nota, volverEn, rol, setterId = null) {
      return conCodigo(
        rpc(env, "seg_registrar_llamada", {
          p_contacto: contactoId,
          p_resultado: resultado,
          p_nota: nota,
          p_volver_en: volverEn,
          p_rol: rol,
          ...(setterId ? { p_setter: setterId } : {}),
        })
      );
    },
    async contactoPorId(id) {
      const filas = await rest(env, `seg_contacto?id=eq.${id}&select=id,setter_id`);
      return filas?.[0] || null;
    },
    async asignarContactos(ids, setterId) {
      for (let i = 0; i < ids.length; i += 200) {
        await rest(env, `seg_contacto?id=in.(${ids.slice(i, i + 200).join(",")})`, { method: "PATCH", body: { setter_id: setterId } });
      }
    },

    async listarSetters() {
      return (await rest(env, "seg_setter?select=id,nombre,activo,creado_en&order=creado_en.asc")) || [];
    },
    async setterPorHash(hash) {
      const filas = await rest(env, `seg_setter?clave_hash=eq.${hash}&select=id,nombre,activo`);
      return filas?.[0] || null;
    },
    async crearSetter(fila) {
      const filas = await rest(env, "seg_setter", { method: "POST", body: fila, headers: { Prefer: "return=representation" } });
      return filas?.[0];
    },
    async editarSetter(id, campos) {
      await rest(env, `seg_setter?id=eq.${id}`, { method: "PATCH", body: campos });
    },
  };
}
