// Agenda de demos y seguimiento de llamadas · página /llamadas.
// La clave decide el rol: AGENDA_ADMIN_CLAVE (Lissette) o
// AGENDA_SETTER_CLAVE (la persona que llama). Ver docs/agenda-llamadas-manual.md.
import { entorno } from "../deck/_comun.js";
import { crearDatos } from "./_datos.js";
import { crearCorreo } from "./_correo.js";
import { crearTrabajo, ajustesDeEntorno } from "./_acciones.js";

const env = entorno();

export default crearTrabajo({
  datos: env ? crearDatos(env) : null,
  correo: crearCorreo(),
  ahora: () => new Date(),
  ajustes: ajustesDeEntorno,
});
