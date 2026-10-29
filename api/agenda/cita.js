// Agenda de demos · página /cita/<token> para que la persona invitada vea,
// cambie o cancele su demo. El token llega en el correo de confirmación.
import { entorno } from "../deck/_comun.js";
import { crearDatos } from "./_datos.js";
import { crearCorreo } from "./_correo.js";
import { crearCitaPublica, ajustesDeEntorno } from "./_acciones.js";

const env = entorno();

export default crearCitaPublica({
  datos: env ? crearDatos(env) : null,
  correo: crearCorreo(),
  ahora: () => new Date(),
  ajustes: ajustesDeEntorno,
});
