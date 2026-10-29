# Llamadas y demos — manual

Agenda de demos propia y seguimiento de las llamadas de la setter, sin
herramientas externas (ni Calendly ni hojas compartidas). Vive en la web,
igual que la sala del deck.

- **Página de trabajo**: `evidran.com/llamadas`. La usan la setter y Lissette,
  cada una con su clave. La clave decide lo que ve cada una.
- **Página de la persona invitada**: `evidran.com/cita/<enlace>`. Le llega en
  el correo de confirmación para cambiar la hora o cancelar.

Ninguna de las dos sale en Google (van marcadas como «no indexar»).

---

## Quién hace qué

| | Setter | Lissette |
|---|---|---|
| Ver a quién llamar y anotar cada intento | Sí | Sí |
| Leer el guion (pestaña Guion y chuleta en cada ficha) | Sí | Sí |
| Agendar demos en los huecos libres | Sí | Sí |
| Corregir los datos de una demo y reenviar la invitación | Sí | Sí |
| Corregir datos de un contacto y añadir notas | Sí | Sí |
| Ver el resumen (llamadas, demos, resultados) | Sí | Sí |
| Cargar contactos (CSV de Apollo) y descargar la lista | — | Sí |
| Borrar un contacto | — | Sí |
| Cancelar una demo | — | Sí |
| Horario, duración, margen, enlace de Teams y bloqueos | — | Sí |

La persona invitada puede cambiar la hora o cancelar desde su correo.

## Varias personas que llaman

Cada persona tiene **su propia clave**, **su lista** y **su recuento**:

1. **Ajustes → Personas que llaman → Crear su clave.** La clave (12
   caracteres) se ve una sola vez: cópiala y pásala por un canal distinto al
   del enlace. En la base solo queda su huella.
2. **Asigna contactos:** al cargar el CSV («Asignar los contactos nuevos a»:
   una persona o «Repartir entre las personas activas»), con **Repartir los sin
   asignar**, o uno a uno desde la ficha («Quién la llama»).
3. Cada persona solo ve **sus contactos, sus demos y sus llamadas**, y no puede
   tocar los de otra. En tu **Resumen → Por persona** ves las llamadas de cada
   una (lo que cuenta para su pago), las de hoy y sus demos.
4. **Desactivar** corta el acceso al momento (lo anotado se queda). **Nueva
   clave** anula la anterior.

La clave común antigua (`AGENDA_SETTER_CLAVE`) sigue funcionando y ve solo
los contactos **sin asignar**. Cuando todas las personas tengan su clave,
puedes borrar esa variable en Vercel para cerrarla.

## Cómo funciona

1. **Lissette carga los contactos** (pestaña Contactos → Cargar contactos)
   con el CSV exportado de Apollo. Entiende las columnas de Apollo
   (*Company*, *First Name*, *Last Name*, *Title*, *Corporate Phone*,
   *Email*, *Website*, *City*) y las de una hoja en español (*Empresa*,
   *Persona*, *Cargo*, *Teléfono*…). Los **móviles no se cargan**: se llama al
   teléfono de la empresa. Los repetidos (mismo teléfono) se saltan.
2. **La setter abre la pestaña Llamar**. Ve, por orden: a quién le pidieron
   llamar hoy, los que aún no se han llamado y los que no contestaron otro
   día (hasta 3 intentos por contacto).
3. **En la ficha de cada contacto** escribe una nota y pulsa el resultado.
   Cada pulsación es un intento y **cuenta para el pago**.
   - «Volver a llamar» pide día y hora; ese día vuelve a salir arriba.
   - «No llamar» lo saca para siempre de la lista.
   - «Demo agendada» abre la agenda: elige día y hora entre los huecos libres,
     confirma el correo de la persona y reserva.
4. **Al reservar**, salen dos correos desde el SMTP de Evidran:
   - a la persona: confirmación, enlace de Teams, invitación de calendario
     (se añade a Outlook, Google o iPhone con un clic) y enlace para cambiar o
     cancelar;
   - a Lissette (`AGENDA_AVISOS_EMAIL`): aviso con todos los datos y la misma
     invitación, para tenerla en su calendario.
5. **Si un dato de la demo está mal** (por ejemplo, el correo), en Agenda →
   «Corregir datos». Si cambia el correo, la invitación sale a la dirección
   nueva y el enlace del correo anterior deja de funcionar. «Reenviar
   invitación» la vuelve a mandar sin cambiar nada (útil si dice que no le ha
   llegado).
6. **Si la persona cambia la hora o cancela**, os llega a las dos el aviso con
   la invitación actualizada. Si cancela, el contacto vuelve a «Volver a
   llamar» para que la setter busque otro momento.

Dos personas no pueden quedarse el mismo hueco: la base de datos lo impide
aunque reserven en el mismo segundo. Entre demos se deja el margen que
marques en Ajustes.

La página se refresca sola cada minuto, así que Lissette ve en directo lo que
va anotando la setter.

---

## Puesta en marcha (una sola vez)

### 1. En Supabase → SQL Editor
Pega entero el contenido de `migraciones/agenda-llamadas.sql` y pulsa
**Run**. Crea las tablas (`agenda_config`, `agenda_bloqueo`, `agenda_cita`,
`seg_contacto`, `seg_llamada`) y sus funciones. Es repetible sin riesgo.
Son tablas de la landing, **no de la app**: no van en `_migraciones` ni al
instalador on-premise.

Si la sala del deck aún no está puesta en marcha, pega también
`migraciones/sala-deck.sql`.

### 2. En Vercel → proyecto de la landing → Settings → Environment Variables

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | la URL del proyecto (la misma que la sala del deck) |
| `SUPABASE_SERVICE_ROLE` | la clave *service_role* (la misma que la sala del deck) |
| `AGENDA_ADMIN_CLAVE` | una clave larga para ti (gestor de contraseñas) |
| `AGENDA_SETTER_CLAVE` | otra clave distinta para la setter |
| `AGENDA_AVISOS_EMAIL` | dónde quieres los avisos de demos (p. ej. `demo@evidran.com`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | **copia los valores del proyecto de la app** en Vercel |

Para quitarle el acceso a la setter: cambia `AGENDA_SETTER_CLAVE` y vuelve a
desplegar. Su clave antigua deja de funcionar.

### 3. Commit + Push en GitHub Desktop (repositorio qepilot-landing)

### 4. En `evidran.com/llamadas` con tu clave
1. **Ajustes**: revisa el horario (por defecto, de lunes a jueves de 10:00 a
   13:00 y de 16:00 a 18:00), la duración, el margen y **pega el enlace fijo de
   Teams**. Guarda.
2. **Contactos → Cargar contactos**: sube el CSV.
3. **Prueba**: agenda una demo a tu propio correo, mira que llegan la
   invitación y el aviso, y cancélala desde el enlace del correo.

---

## Probar en el ordenador sin tocar nada real

```bash
node tools/agenda-local.mjs
```

Abre `http://localhost:5188/llamadas` con las claves `admin-local` o
`setter-local`. Los datos son de ejemplo y se pierden al pararlo; los correos
no salen, se ven en `http://localhost:5188/_correos`.

Pruebas automáticas: `npm test`.

## Qué la protege

- Dos claves distintas (Lissette y setter), 10 intentos fallidos por IP cada
  10 minutos.
- El enlace de cada cita es aleatorio y en la base solo se guarda su huella
  (sha256): quien vea la base no puede cambiar citas.
- Tablas con RLS sin políticas: solo el servidor con la service key las lee.
- Borrar un contacto borra sus datos y las notas de sus llamadas; el intento
  queda, sin datos personales, para que el recuento del pago no cambie.

## Lo que no hace (todavía)

- **Recordatorio el día antes**: no sale solo. Se puede añadir con una tarea
  programada.
- **No mira tu calendario**: si tienes otra cita, bloquéala en Agenda →
  Bloquear la agenda.
- **Enlace de Teams único por demo**: usa el enlace fijo de Ajustes (con sala
  de espera activada en Teams).

## Dónde está cada cosa

| Pieza | Fichero |
|---|---|
| Migración (tablas + funciones) | `migraciones/agenda-llamadas.sql` |
| Página de trabajo | `public/llamadas.html` |
| Página de la persona invitada | `public/cita.html` |
| Endpoint de la página de trabajo | `api/agenda/trabajo.js` |
| Endpoint de la persona invitada | `api/agenda/cita.js` |
| Acciones (validación, huecos, correos) | `api/agenda/_acciones.js` |
| Lógica pura (horas, huecos, invitación, CSV, textos de correo) | `api/agenda/_logica.js` |
| Acceso a Supabase | `api/agenda/_datos.js` |
| Envío de correo | `api/agenda/_correo.js` |
| Pruebas | `tests/agenda.test.js` |
| Servidor local y datos de ejemplo | `tools/agenda-local.mjs`, `tools/agenda-memoria.mjs` |
| Rutas y no-indexar | `vercel.json` |
