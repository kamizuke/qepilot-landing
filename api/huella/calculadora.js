// Calculadora de huella gratuita · evidran.com/huella y su informe.
// Ver docs/huella-calculadora-manual.md.
import { entorno } from "../deck/_comun.js";
import { crearCorreo } from "../agenda/_correo.js";
import { ajustesDeEntorno } from "../agenda/_acciones.js";
import { crearDatosHuella } from "./_datos.js";
import { crearCalculadora } from "./_acciones.js";
import { COMERCIALIZADORAS } from "../../public/huella/comercializadoras.js";

const env = entorno();

export default crearCalculadora({
  datos: env ? crearDatosHuella(env) : null,
  correo: crearCorreo(),
  comercializadoras: COMERCIALIZADORAS,
  ahora: () => new Date(),
  ajustes: ajustesDeEntorno,
  cron: process.env.CRON_SECRET || "",
});
