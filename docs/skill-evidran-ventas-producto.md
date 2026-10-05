# PROMPT MAESTRO · EVIDRAN

> Documento fuente de verdad sobre el producto **Evidran**. Está pensado para
> alimentar una skill que **cree y mejore la landing de ventas y los guiones de
> venta**. Todo lo descrito aquí está verificado contra el documento canónico de la
> app (`ochod-demo/docs/evidran-funcionalidades.md`, rev. 2026-10-05) y contra el
> código: no contiene funcionalidades imaginarias. Si una funcionalidad no aparece
> en este documento, **no existe todavía** — no la prometas. La sección 15 lista lo
> que expresamente NO hace.
>
> Sincronizado: 2026-10-05. En la próxima sincronización, mira primero la cabecera de
> cambios del documento canónico y actualiza solo lo nuevo.

---

## 1. Qué es Evidran (en una frase)

**Evidran es el copiloto de calidad por IA que documenta no conformidades,
acciones, riesgos y auditorías mediante una conversación, con el criterio de un
responsable de calidad experimentado, y convierte cada expediente cerrado en
memoria de la organización: consultable y reutilizable.**

Tú le cuentas qué ha pasado con tus palabras; Evidran te entrevista como lo haría un
responsable de calidad senior (no acepta «error humano» como causa raíz, separa
corrección de acción correctiva), redacta el informe formal campo a campo, y el
sistema entero —plan, riesgos, auditorías, revisión por la dirección— bebe de esos
mismos datos.

Lema que se mantiene: **«Evidran no sustituye el criterio del responsable de
calidad. Lo amplifica.»**

Categoría: **software de gestión de calidad asistido por IA (QMS / no conformidades
/ mejora continua / sistemas de gestión)** para organizaciones certificadas,
acreditadas o en proceso de certificarse.

---

## 2. Marca y dominios (reglas inquebrantables)

- El producto se llama **Evidran**. Siempre. En la UI se estiliza "Evi**dran**".
- App: **app.evidran.com** · Landing comercial: **evidran.com**.
- **Nunca** reintroducir nombres antiguos (QEPilot, OCHO·D / OCHOD): están
  descatalogados. Si aparecen en algún sitio, son un error a corregir.
- Idioma de producto y de venta: **español de España**, tuteo, tono de compañero
  de calidad con experiencia (cercano pero riguroso). Nada de jerga de auditor
  acartonada ni de promesas grandilocuentes de "IA mágica".
- **Respeto al equipo de calidad:** el criterio es del equipo; la IA es la que no
  sabe y pregunta. Nunca insinúes que el responsable de calidad no sabe hacer su
  trabajo.
- **La IA no es el titular.** Se vende el criterio experto y el conocimiento que
  queda; la IA es «el cómo». No escribas «Evidran aprende» ni «el sistema que
  aprende»: di **memoria consultable y reutilizable**.

---

## 3. A quién va dirigido (ICP — perfil de cliente ideal)

**Usuario principal:** la persona que "lleva la calidad". A menudo un único
responsable que también gestiona medioambiente y/o PRL, con poco tiempo, mucha
presión de auditoría y herramientas pobres (Word, Excel, carpetas, correo).
«Alto nivel» se lee como **exigencia**, no como tamaño: OEM/TISAX, ENAC,
multinorma.

Segmentos:
- **Pymes industriales y de fabricación** multinorma: ISO 9001, 14001, 45001,
  50001.
- **Proveedores de automoción**: informes **8D** (genérico y formato OEM/SCAR) y NC
  de producto **IATF 16949**.
- **Aeroespacial, defensa y espacio**: NC de producto **EN 9100 (AS9100D)** y NCR
  **ECSS-Q-ST-10-09C** (ESA y primes).
- **Industria alimentaria** certificada en **IFS Food**.
- **Empresas con ISO/IEC 27001 o con etiqueta TISAX** (habitual en la cadena de
  automoción). Ver el disclaimer de §8.1 antes de escribir nada sobre TISAX.
- **Laboratorios de ensayo y calibración** (ISO/IEC 17025, ENAC), **entidades de
  inspección** (ISO/IEC 17020) y **de certificación de producto** (ISO/IEC 17065)
  acreditadas. A laboratorios de automoción/homologación UNECE les interesa además
  la **Vigilancia normativa** (§7.21), que se puede contratar suelta.
- **Sistemas menos frecuentes** ya cubiertos: antisoborno (ISO 37001), ecodiseño
  (ISO 14006) e innovación (ISO 56001).
- **Empresas en proceso de certificación** que necesitan montar el sistema ordenado
  desde el primer día.
- **Auditores y consultores** con varias empresas cliente: tienen su propio espacio
  de informes de auditoría y un puente directo con cada cliente (§7.19–7.20).
- **Organizaciones que no permiten datos en la nube** (automoción/TISAX, defensa,
  centros tecnológicos): instalación **on-premise** con IA local opcional (§7.25).

Comprador / decisor: gerencia, dirección de calidad, o el propio responsable de
calidad cuando tiene autonomía de compra. En on-premise entra también IT.

---

## 4. El problema que resolvemos (dolores reales)

1. **Documentar una no conformidad es lento y tedioso.** Plantillas distintas por
   norma, redacción formal, campos que el auditor mirará.
2. **La causa raíz se hace mal.** Se queda en "error humano", "despiste" o "falta
   de formación" — causas que una certificadora rechaza.
3. **Las auditorías dan miedo.** Faltan trazas, fechas, responsables, evidencias,
   firmas, o la respuesta a un hallazgo no ataca la causa.
4. **Todo vive en piezas sueltas.** NC en Word, plan en Excel, riesgos en otra
   hoja, auditorías en el correo: nada cruza con nada.
5. **Los plazos dependen de la memoria de alguien.** Acciones que vencen sin que
   nadie se entere, eficacia que nunca se verifica.
6. **La Revisión por la Dirección (9.3) es un suplicio anual** de recopilar
   números y redactar el acta.
7. **El conocimiento se pierde.** "Esto ya nos pasó" pero nadie encuentra cómo se
   resolvió la última vez, ni por qué se decidió lo que se decidió. Cuando alguien
   se va, se lo lleva.
8. **Planta y calidad no se hablan bien.** Quien ve el problema no sabe
   documentarlo; quien lo documenta no estaba allí.

---

## 5. La propuesta de valor (el "porqué Evidran")

Orden de prioridad acordado: **criterio experto primero, conocimiento reutilizable
segundo**, la IA nunca en el titular.

- **Hablar en vez de rellenar.** Cuentas lo que pasó y Evidran hace el resto.
- **Criterio de responsable de calidad senior.** Sugiere la causa sistémica
  probable, no acepta causas pobres, separa corrección de acción correctiva, adapta
  la profundidad a la gravedad y los plazos de eficacia al tipo de acción.
- **Listo para auditoría desde el primer expediente.** Estructura de su norma,
  firma verificable del responsable, traza que no se borra, evidencias, Word/PDF
  con la identidad del cliente.
- **Un sistema conectado, no piezas sueltas.** NC, plan de mejora y objetivos,
  riesgos y aspectos, auditorías internas y externas, cambios planificados y
  revisión por la dirección comparten los mismos datos.
- **Te avisa antes de que pase.** Estado del sistema cada mañana con su regla y
  resumen diario por email: nada depende de que alguien se acuerde.
- **Cada expediente deja conocimiento.** Casos anteriores buscables, memoria de
  decisiones con su porqué, patrones y lecciones que el usuario confirma.
- **Una herramienta, 17 tipos de expediente.** Cada organización activa solo los
  que usa.

---

## 6. Cómo funciona (recorrido del producto)

1. **Acceso.** Email/contraseña o **«Entrar con Microsoft»** por dominio de
   correo. Un usuario puede pertenecer a varias organizaciones.
2. **Panel de calidad.** Veredicto del sistema, «Necesita tu atención», tabla de
   expedientes con semáforo; durante el primer mes, «Puesta en marcha».
3. **Nuevo expediente → elegir tipo** (de los 17 que la organización tenga
   activos). Desde el móvil, **captura rápida** o escaneo del **QR** de la máquina.
4. **Entrevista conversacional.** Chat a un lado, **documento formal redactándose en
   vivo** al otro. Se pegan emails o hallazgos literales, se adjuntan fotos.
5. **Evidencias, estados y aprobación.** Adjuntos privados; el responsable
   **aprueba y firma** (o devuelve con indicaciones).
6. **Exportar.** Copiar, PDF o Word, con logo, pie y código de formato del cliente.
7. **Seguimiento.** Acciones al Plan de mejora cuando lo merecen; riesgos,
   auditorías, cambios y simulacros en sus pantallas; avisos por email.
8. **Aprovechar los datos.** Inteligencia del sistema, Casos anteriores, Decisiones
   y lecciones, Copiloto, y el acta 9.3 del ejercicio.

Menú de la app agrupado por el ciclo PHVA: **Tu día a día** (Panel, Inteligencia
del sistema) · **Planificar** (Riesgos y oportunidades, Cambios planificados,
Vigilancia normativa si se tiene) · **Comprobar** (Auditorías con Auditoría interna
y Calendario, Revisión por la dirección, Casos anteriores) · **Mejorar** (Plan de
mejora continua) · **Utilidades** (Perfil de empresa, Puntos QR, Trazabilidad del
sistema, Descargas).

---

## 7. Catálogo completo de funcionalidades (verificado en código)

### 7.1 Entrevista guiada por IA
- Conversación en español, tuteo, **1–2 preguntas por turno**, sin repreguntar lo
  ya dicho.
- **Extrae datos de emails o del hallazgo literal del auditor** pegados, y de
  **fotos adjuntas** (las describe técnicamente y las incorpora como evidencia).
- **Autocompleta lo administrativo** (fecha de detección = hoy).
- **Sugiere la hipótesis de causa sistémica** para que el usuario confirme o
  matice.
- **Nunca acepta «error humano / despiste / falta de formación» como causa raíz
  final**: redirige al fallo de sistema o de control.
- **Corrección vs. acción correctiva**, y **bifurcación puntual / sistémica** (si
  es puntual no exige causa raíz).
- **Eficacia adaptada** al tipo de acción (software → inmediato; formación → 1–2
  meses; cambio organizativo → ~3 meses).
- **Eficacia precipitada:** si se da por eficaz una acción implantada hoy o ayer,
  Evidran retiene ese resultado y pregunta una vez si prefiere esperar.
- **Vocabulario propio por norma** (aspecto y requisito legal en 14001; peligro,
  jerarquía preventiva y Delt@ en 45001; IDEn y línea de base en 50001;
  imparcialidad en 17020/17065; informes emitidos en 17025; ocurrencia + no
  detección en 8D…).
- **Contextualizada con el perfil de la organización** y su **país** (acreditador,
  referencias de norma, variante de español).
- **Lecciones vigentes de la organización inyectadas** en la entrevista: propone
  causas y acciones apoyándose en lo que ya se aprendió («esto ya os pasó con…»).
- **Avisa si el relato no cuadra con el tipo abierto** (una vez, sin parar la
  conversación) y ofrece cambiar de tipo.
- **Sugerencia de avance de estado en un clic**; **guardado "en curso"** cuando el
  cierre depende del tiempo; **pausa de la entrevista** si el usuario pide que no
  le pregunte más (sigue anotando).
- **Expediente sin entrevista:** quien prefiera escribir apaga el chat; al terminar
  puede pedir **«Revisar con Evidran»**.
- Coloquial en el chat, **formal en los campos del informe**.

### 7.2 Tipos de expediente (cada uno con su lógica de norma)
**Diecisiete tipos de expediente**, cada uno con su entrevista, su lenguaje
normativo y su informe propios. Cada organización **activa solo los que usa**, así
el selector no se llena de normas ajenas.

**Sistemas de gestión**
1. **NC Interna · UNE-EN ISO 9001:2015 (10.2):** flujo adaptativo puntual / con
   acción correctiva.
2. **NC Ambiental · UNE-EN ISO 14001:2015 (10.2):** aspecto ambiental, requisito
   legal, evaluación de impacto, comunicación a la administración.
3. **NC Seguridad y Salud · UNE-EN ISO 45001:2023 (10.2):** peligro, consecuencia
   potencial, nivel de riesgo, jerarquía preventiva, notificación a la autoridad
   laboral.
4. **NC Energética · UNE-EN ISO 50001:2018 (10.2):** uso significativo de la
   energía, IDEn frente a línea de base, impacto en kWh/€/CO₂.
5. **NC Antisoborno · ISO 37001:** protege la identidad del denunciante, registra
   hechos y no acusaciones, y marca las decisiones legales «PENDIENTE — valorar con
   asesoría jurídica». Evidran no hace de asesor legal.
6. **NC de Ecodiseño · ISO 14006:** requisito ambiental ausente de las entradas del
   diseño, revisión sin criterio ambiental, ciclo de vida no evaluado.
7. **NC de Innovación · ISO 56001:** fase del proceso saltada, cartera sin revisar,
   propiedad intelectual sin proteger, compromiso con un socio incumplido. Una
   iniciativa que no sale NO es una NC.
8. **Incidente / NC de Seguridad de la Información · ISO/IEC 27001 / TISAX:** tipo
   de incidente, dimensión (confidencialidad, integridad, disponibilidad) y
   gravedad; pregunta siempre por datos personales, información de terceros y
   prototipos. Un incidente contenido con los controles previstos no es una NC.
   **Ver disclaimer §8.1.**

**Producto y cliente**
9. **8D Cliente:** contención 24 h, D4 en doble rama (ocurrencia y no detección),
   prevención de recurrencia. **Dos plantillas: genérica y OEM/SCAR.**
10. **NC de Producto · IATF 16949 (automoción):** contención con clasificación al
    100 %, disposición con autoridad, concesión del cliente, control del retrabajo
    y la reparación, chatarra controlada, notificación al cliente, AMFE / plan de
    control / PPAP si les afecta; la vía correctiva exige punto de escape,
    extensión y poka-yoke.
11. **NC de Producto · EN 9100 (AS9100D), aeroespacial y defensa:** disposición con
    autoridad, aprobación de la autoridad de diseño o del cliente, notificación si
    hubo producto entregado, chatarra y piezas sospechosas de falsificación,
    factores humanos.
12. **NCR de Producto Espacial · ECSS-Q-ST-10-09C:** el comité de revisión (NRB)
    clasifica en **mayor o menor**; la menor la cierra el NRB interno, la mayor se
    notifica al cliente, la dispone el NRB del cliente y puede exigir waiver (RFW).
13. **NC de Producto Alimentario · IFS Food:** lotes y caducidad, naturaleza de la
    desviación (biológica, química, física, alérgenos, etiquetado, calidad), riesgo
    para el consumidor, fallo de una medida de control del APPCC (exige revisar el
    plan), bloqueo por trazabilidad, disposición, aviso a clientes y decisión de
    retirada. No incluye el plan APPCC ni el simulacro de retirada.

**Entidades acreditadas y auditoría**
14. **Trabajo No Conforme · UNE-EN ISO/IEC 17025:2017 (7.10 + 8.7):** significación,
    extensión, informes ya emitidos, notificación a clientes, reanudación.
15. **Trabajo de Inspección No Conforme · UNE-EN ISO/IEC 17020:2012 (8.7).**
16. **Trabajo de Certificación No Conforme · UNE-EN ISO/IEC 17065:2012 (7.11 +
    8.7).**
    En 17025, 17020 y 17065 Evidran cubre la **capa de gestión** (NC, acciones,
    mejora, respuesta a hallazgos), **no la competencia técnica** de ensayos,
    inspecciones o esquemas de certificación.
17. **Respuesta a Hallazgo de Auditoría (certificadoras / ENAC):** conserva el
    hallazgo literal, causa raíz, extensión, plan de acción y evidencias.

**Lo que NO calcula todavía:** en IATF 16949, ECSS e IFS Food los expedientes
cuentan en Inteligencia y en objetivos como cualquier otro, pero **no hay
indicadores de desempeño de producto propios** (concesiones, escapes, NCR mayores,
waivers). EN 9100 sí tiene bloque «Desempeño aeroespacial» (§7.9). No lo prometas
para las demás.

### 7.3 El documento
- **Doble panel**: chat y documento en vivo; **barra «Documento %»** que mide qué
  falta de verdad.
- **Edición manual campo a campo**, con resaltado de lo recién rellenado y de lo
  «PENDIENTE».
- **Exportar**: copiar, **PDF** limpio y **Word (.docx)** en los 17 tipos (también
  OEM/SCAR), que se ve igual en Word, LibreOffice y Pages. Pie con autor, cargo y
  fecha.
- **Identidad documental (white-label del documento):** los Word y PDF salen con
  **el logo, el pie y el código de formato por tipo de documento del cliente**
  (p. ej. «F-PG-08»). Incluido en todos los planes.
- **Colores de la aplicación:** el cliente elige dos colores de una paleta acotada
  de trece, todas con contraste medido. El logotipo de Evidran y los colores con
  significado (semáforo, normas) se quedan.
- **Campos propios por organización:** hasta 20 casilleros del cliente (texto,
  fecha, número, lista, sí/no), en pantalla, Word, PDF, CSV y puerta de cierre. La
  IA puede proponerlos desde el formato antiguo del cliente.
- **Cambiar de tipo sin perder lo avanzado:** traducción determinista, con vista
  previa de qué se conserva, qué queda sin destino y qué pedirá el nuevo tipo; lo
  que no tiene destino queda en la traza del documento.

### 7.4 Evidencias
- **PDF, Word, Excel e imágenes** (JPG, PNG, WebP, GIF, HEIC), **15 MB por archivo**,
  5 GB por organización (ampliable), sin tope de adjuntos por expediente.
- **Privadas**, con enlaces de descarga firmados y temporales.
- Desde el móvil, **foto con la cámara**, comprimida antes de subir.

### 7.5 Numeración consecutiva (opcional por organización)
- **NC-AAAA-NNN**, reinicia cada año, contador atómico en base de datos. También
  **OBJ-** (objetivos), **CAM-** (cambios) y **AUD-** (informes de auditor).
- Si el cliente usa su propia codificación, se respeta.

### 7.6 Ciclo de vida, aprobación y firma
- Estados **abierto / en curso / cerrado**, con **puerta de cierre**: no se cierra
  si faltan los campos que exige su tipo (una NC puntual cierra con el núcleo; una
  sistémica exige causa, acción y verificación).
- **Aprobar y firmar:** cerrar es aprobar. La firma recoge **nombre y cargo** del
  responsable, la fecha y una **huella SHA-256 del contenido**; el expediente queda
  en solo lectura y la app **verifica la huella** al abrirlo. ISO 9001 no exige
  firma electrónica: pide que conste quién aprueba (7.5.2 y 10.2.2), y esto lo
  cubre sin depender de un tercero.
- **La firma es del responsable de calidad**: miembros y técnicos **envían a
  aprobación** (el expediente se congela) y el responsable **firma o devuelve con
  indicaciones**. La regla la impone la base de datos, con test en CI.
- **Documento firmado fuera** (Adobe Sign, DocuSign, FNMT…): se exporta el PDF, se
  firma donde ya firmen y se sube; Evidran comprueba que lleva la huella del
  expediente y avisa si firma una versión anterior. Detecta firma digital
  incrustada, **no la valida**.
- **Traza que no se borra:** reaperturas registradas; si el contenido cambia tras
  la firma, la firma se **anula de forma explícita**. Firmas, reaperturas,
  anulaciones y borrados quedan en la **Trazabilidad del sistema** (§7.23).
- **Traspaso técnico → calidad («Completar con calidad»):** el técnico describe el
  hecho y pasa la NC a «Por desarrollar»; calidad la asume o pide a Evidran un
  **primer borrador de causa y acción** (hipótesis a revisar, nunca un cierre). El
  técnico sigue aportando. Aviso **anti-huérfanas** si nadie la recoge.
- **Hilo de preguntas de vuelta:** calidad pregunta al técnico («¿en qué turno
  pasó?») sin traspasar la NC; él responde desde la suya.
- **Aviso al operario cuando su expediente se cierra** (en la app, opcional por
  organización, desactivado por defecto): evidencia de comunicación interna (7.4) y
  toma de conciencia (7.3).
- **Control de concurrencia** (avisa si otro guardó antes), **chincheta** para
  fijar un expediente arriba, **eliminar** con confirmación.

### 7.7 Panel de calidad
- KPIs: abiertas, vencidas, antigüedad media, cerradas este mes; desglose por tipo
  y por área/proceso.
- Tabla con **semáforo de vencimiento** (rojo vencida / ámbar ≤7 días / verde /
  gris sin fecha), ordenada por urgencia.
- **Veredicto del sistema** compacto (§7.9).
- **«Necesita tu atención»**: en aprobación, devueltos, por desarrollar, preguntas
  sin responder.
- **Puesta en marcha** (primeros 30 días): cuatro hitos que se marcan solos con
  datos reales (primer expediente, riesgo, acción del Plan, auditoría en el
  calendario).
- **Importar CSV** del histórico con mapeo de columnas («¿Vienes de Excel?»).

### 7.8 Casos anteriores (buscador de «esto ya nos pasó»)
- Búsqueda **por palabra clave** (no semántica) en causa raíz, descripción y
  solución, tolerante a acentos, con filtros por área y tipo.
- **Precedentes al abrir un expediente:** «Ya hubo N NC con esta causa en este
  proceso; en NC-… la acción que funcionó fue…» (solo cita acciones con eficacia
  verificada).

### 7.9 Inteligencia del sistema (cuadro de mando 9.1)
- **Veredicto del sistema** (sin IA, regla fija que se enseña): «bajo control»,
  «necesita atención» o «en riesgo». «En riesgo» exige algo más de 30 días vencido.
  Debajo, los **frentes** que piden decisión hoy: expedientes y acciones vencidos,
  riesgos críticos sin tratamiento, auditorías internas fuera de fecha, hallazgos
  sin decidir, fechas de auditoría sin confirmar, simulacros fuera de fecha,
  cambios planificados, pendientes de aprobación y por desarrollar.
- **Salud del sistema:** cinco tarjetas con datos reales (Expedientes, Plan,
  Riesgos, Auditoría interna, Auditorías externas).
- **Próximos hitos** y el Copiloto acoplado.
- **Ritmo del ciclo de mejora:** eficacia de las NC, tiempos de implantación, lag
  de detección y **reaperturas tras la firma**.
- **Hallazgos automáticos (deterministas, sin IA):** acciones cerradas fuera de
  plazo, vencidas, concentración por área, carga acumulándose; cada uno con su dato.
- **Causas raíz clasificadas por IA** en taxonomía cerrada (formación, método,
  proveedor, equipo, medición, planificación, comunicación, factor externo, otra);
  el usuario puede **corregirla a mano** y Evidran no la vuelve a pisar.
- **Objetivo recomendado por sistema de gestión** cuando un sistema acumula foco,
  citando su apartado 6.2 (17065 y 17020 sin cláusula, porque no la tienen).
- **Desempeño ambiental** (con actividad 14001) y **Desempeño aeroespacial** (con NC
  EN 9100).
- Gráficos a 6 meses, indicadores del plan, estado de la matriz; vista previa con
  datos de ejemplo si hay menos de 8 expedientes, etiquetada como ejemplo.
- **Copiar cada panel** como tabla o imagen para un informe.

### 7.10 Decisiones y lecciones (memoria de decisiones · ISO 9001 7.1.6)
- **Timeline de las decisiones que la organización ya registra** sin darse cuenta:
  hallazgos descartados con motivo, acciones canceladas o verificadas, estrategias
  de riesgo, NC cerradas con su causa, actas 9.3. Sin captura nueva y sin IA.
- **El porqué a posteriori:** notas append-only; nada se edita ni se borra. Al
  cancelar una acción o aceptar un riesgo aparece una cajita opcional de «¿por qué?».
- **Memoria en contexto:** en el triage, «ya descartasteis un hallazgo muy parecido
  de este auditor: motivo».
- **Patrones** detectados sin IA: causa recurrente, «eficacia de papel» (la causa
  reaparece tras verificar), criterio contradictorio y riesgo ciego (proceso con NC
  y sin riesgo en la matriz). El usuario los **confirma como lección** o los
  descarta con motivo.
- **Borrador de procedimiento** desde un patrón confirmado (≥3 ocurrencias):
  propuesta editable en Word, **nunca publicada automáticamente**.
- **Pack de conocimiento para incorporaciones:** dossier Word (sin IA) con las
  lecciones vigentes por proceso y las decisiones clave con su porqué.

### 7.11 Transición 2026 (ISO 9001 e ISO 14001)
- Cada organización trabaja con **su edición** (2015 o 2026); la etiqueta cambia en
  toda la app y en la IA.
- Requisitos nuevos de la 2026 con **detección de evidencia** en el propio sistema
  («Evidencia detectada» no certifica).
- **Envío al Plan en un clic** con la marca [Transición 2026].
- Activar la edición 2026 lo hace **solo el responsable**, con declaración
  registrada; reversible.
- ISO 14001:2026 (abril 2026) e ISO 9001:2026 (16 sep 2026) publicadas y activables;
  los certificados 2015 caducan en 2029.

### 7.12 Auditorías: bandeja de hallazgos
- **Subir el informe de una auditoría externa** (PDF, Word o Excel): la IA detecta
  los hallazgos y el usuario marca cuáles importa (con aviso de contrastarlos con el
  original). El informe queda archivado.
- **Triage en tres salidas:** convertir en expediente · enviar al plan de mejora ·
  descartar con motivo obligatorio.
- **Avisos de corrección del auditor** con diff antes/después.

### 7.13 Auditoría interna (9.2)
- **Programa anual por proceso**, multinorma, con semáforo y selector de ejercicio.
- **Checklist propuesta por IA** (8–15 puntos) que el auditor revisa y edita; Sí /
  No / N.A. con comentario; todo autoguardado.
- **Catálogo de requisitos subido por la organización** (p. ej. VDA ISA para TISAX)
  y **Requisitos propios** (inventario legal, requisitos de contrato o de cliente en
  Excel, CSV, Word o PDF): la checklist se apoya en esa lista literal. Evidran **no
  identifica ni propone legislación** ni cita catálogos de memoria.
- **IFS Food:** puntuación A/B/C/D/Mayor por ítem (KO solo A, B o D) y **porcentaje
  orientativo** según el sistema de puntuación oficial; la lista de requisitos la
  sube la organización.
- **Hallazgos** desde un «No» o a mano, con sugerencia de norma y apartado; entran
  en la misma bandeja de triage.
- **Informe imprimible en PDF** con la identidad documental del cliente.

### 7.14 Calendario de auditorías
- Programa interno + **auditorías externas** (certificadora, cliente, proveedor) en
  una agenda anual. Vistas **Lista / Mes / Año**, color por norma.
- **Fecha planificada vs confirmada:** aviso en pantalla y por email cuando una
  fecha sin confirmar se acerca.
- **Compartir** una auditoría por Teams, WhatsApp, correo o SMS (texto plano, dice
  si la fecha está confirmada). **Imprimir en una hoja A4** con la identidad del
  cliente y fecha de impresión.

### 7.15 Revisión por la dirección (9.3, pantalla propia)
- **Un acta por ejercicio**, archivada por años; datos del 1 de enero al 31 de
  diciembre del ejercicio revisado.
- **La IA redacta desde estadísticas agregadas** (no expedientes completos) con las
  entradas 9.3.2: NC por tipo/área/proceso, eficacia, auditorías internas,
  **objetivos y grado de cumplimiento**, plan de mejora, riesgos y oportunidades,
  cambios planificados, tendencias y recomendaciones. Las limitaciones de datos se
  declaran en el texto.
- **Borrador → aprobada:** aprobar congela el acta (lo impone la base de datos);
  reabrir queda registrado. **Foto congelada de las entradas** y traza de versiones.
- **Word y PDF** con la identidad del cliente.
- **Declaración de cumplimiento legal ambiental** (14001 · 9.1.2): **la declara la
  dirección**; Evidran no evalúa requisitos legales.
- Solo el responsable genera, edita y aprueba.

### 7.16 Plan de mejora continua y objetivos (6.2 + 10)
- Una tabla para acciones de **cuatro orígenes**: de NC, de auditoría, de riesgos y
  manuales (más las de cambios y de transición).
- **Objetivos estratégicos medibles** (OBJ-AAAA-NNN): indicador, meta, valor actual
  y **grado de logro** = acciones vinculadas con eficacia verificada.
- **Alta asistida por IA** (máx. 3 preguntas, incluida «¿cuándo se comprobará que ha
  funcionado?») o ficha en blanco. La IA nunca rellena el resultado de la eficacia.
- Estados propuesta → planificada → en curso → implantada → verificada /
  cancelada; semáforo, filtros por ejercicio, **bitácora append-only**, evidencias.
- Cinco tarjetas resumen (objetivos, vivas, vencidas, % ejecutadas, % con eficacia
  verificada).

### 7.17 Riesgos, oportunidades y aspectos ambientales (6.1 · 14001 6.1.2)
- **Matriz 5×5** probabilidad × impacto, inherente y residual; semáforo para
  riesgos, rampa azul para oportunidades.
- Estrategias por tipo (evitar · mitigar · transferir · aceptar / explotar ·
  potenciar · compartir · aceptar); **acción de tratamiento al Plan** en un clic.
- **«🔁 Reevaluar»** cuando todas las acciones están verificadas: cierra el bucle
  6.1 ↔ 10.2.
- **Entradas asistidas:** sugerencias deterministas desde las NC y **entrevista de
  riesgos con IA** que propone (nunca guarda sola), con foco por proceso y lenguaje
  de seguridad de la información si la organización tiene 27001/TISAX.
- **Aspectos ambientales** como tercer tipo: frecuencia × severidad, condición
  normal/anómala/emergencia, ciclo de vida, significancia automática o forzada.
- **Documento «Criterios de evaluación»** generado de las mismas reglas que aplica
  la app.
- **Simulacros de emergencia (14001 y 45001 · 8.2):** planificar → resultado →
  acción correctiva; escenarios desde los aspectos de emergencia; aviso de fecha
  sin confirmar; informe imprimible.

### 7.18 Cambios planificados (ISO 9001 · 6.3)
- Un cambio (método, equipo, software, proveedor, instalación) se **planifica antes
  de hacerlo**: qué y para qué, a qué afecta, riesgos, tareas, cómo se sabrá que
  funcionó. Código CAM-AAAA-NNN. Alta asistida por IA o ficha en blanco.
- Preguntas propias de **45001, IATF 16949 y 17025** (aviso de comunicar cambios del
  alcance acreditado).
- **Aprobación con firma del responsable**; tocar lo aprobado anula la firma.
- **Vigilancia de NC tras implantarlo:** compara las NC del proceso antes y después.
- Entra en el veredicto, los hitos y el acta 9.3.

### 7.19 Espacio del auditor / consultor
- Cartera de auditorías y **editor de informe profesional** (normas, alcance,
  equipo, criterios, metodología, resumen, dictamen).
- **Hallazgos tipados** (NC mayor, menor, observación, oportunidad, punto fuerte).
- **Copiloto del auditor:** sugiere norma + apartado, redacta en forma objetiva **sin
  añadir hechos**. Con catálogo propio subido (p. ej. VDA ISA), solo elige
  identificadores de esa lista.
- **Informe en Word/PDF** con numeración AUD-AAAA-NNN y logo del auditor.
- Normas auditables: 9001, 14001, 45001, 17025, 17065, 17020, 37001, 14006, EN 9100,
  IATF 16949, ISO 56001, ISO/IEC 27001 y TISAX (50001 no, en este módulo).

### 7.20 Puente auditor ↔ cliente
- La empresa comparte un **código EVD-XXXXXXXX**; el auditor **deposita** hallazgos
  e informes **sin entrar nunca al panel del cliente**.
- Llegan a la bandeja de triage; reenvío sin duplicados; si un hallazgo ya
  convertido llega corregido, se avisa.
- **Informe del auditor archivado** en la empresa, versionado.

### 7.21 Vigilancia normativa (módulo aparte, contratable suelto)
- Para laboratorios y entidades acreditadas, sobre todo **automoción /
  homologación UNECE**: un robot revisa los **reglamentos UNECE a diario** y la
  **vigencia de las normas del alcance cada semana** (ISO Open Data, OIML y BOE).
- Cambios clasificados por impacto con % de confianza, cruzados con el **alcance de
  acreditación** (el PDF se procesa en el navegador), análisis con IA del documento
  oficial a petición.
- Una norma **sin fuente automatizable no se da por vigente**: queda en revisión
  manual.
- **Evidencias de vigilancia continua para ENAC** exportables; aviso diario propio.
- Una organización puede tener **solo Vigilancia**.

### 7.22 Copiloto (chat de sistema) y conexión MCP
- **Copiloto:** pregunta en lenguaje natural por el estado del sistema («tengo una
  auditoría en tres semanas, ¿estoy listo?») y responde **con datos reales** y
  enlace al registro. **Solo lectura**: no crea ni cierra nada.
- Consulta NC abiertas, acciones, objetivos, riesgos, hallazgos de la bandeja y
  decisiones («¿por qué se canceló X?»).
- **Conexión MCP:** el cliente conecta **su propio agente de IA** (Claude Code,
  Cursor, VS Code…) al estado de su organización, **solo lectura**, con token que se
  muestra una vez y se puede revocar. Mismo aislamiento que la app.

### 7.23 Avisos, administración y plataforma
- **Resumen diario por email**, de lunes a viernes: expedientes, acciones, auditorías
  internas, riesgos por reevaluar, NC huérfanas, fechas sin confirmar. Regla
  anti-ruido y opt-out.
- **Roles:** **Responsable** (ve todo, firma, configura), **Miembro** (documenta y
  envía a aprobación), **Técnico de captura** (solo sus propias NC, desde el móvil).
  Aislamiento del técnico y reserva de la firma en la base de datos, con tests en CI.
- **Gestor de usuarios delegado** (p. ej. IT da de alta, calidad gestiona su gente).
- **Alta por invitación** (individual o CSV) y **acceso con Microsoft** por dominio.
- **Multi-organización**; perfil de empresa propuesto por IA desde la web pública
  (revisión humana obligatoria).
- **Trazabilidad del sistema:** registro append-only de firmas, reaperturas,
  anulaciones y borrados, escrito por la base de datos, exportable a CSV.
- **Descargas:** todos los CSV en un sitio, por ejercicio, con «descargar todo» en
  ZIP.
- **Guía de bienvenida**, ayuda «?» por pantalla y pistas del primer mes.
- **Cuentas de prueba** con tope y caducidad; al caducar, solo lectura.

### 7.24 App de campo (móvil)
- **Instalable desde el navegador** (PWA, sin tiendas), barra inferior al alcance
  del pulgar.
- **Captura rápida:** describir + proceso + tipo y el expediente se crea al momento;
  el detalle se completa después.
- **Dictado por voz** con el teclado del móvil (el audio no sale a ningún proveedor
  de IA).
- **Foto de evidencia** comprimida, **ubicación opcional**.
- **QR por máquina o zona:** se escanea y se abre la captura ya rellena.
- **Sin cobertura:** la captura queda en cola y se envía sola al volver la red.

### 7.25 On-premise
- **Misma base de código que el SaaS**, instalada en los servidores del cliente
  (Docker); cada función nueva llega en la siguiente actualización.
- **Modos de IA a elegir:** **local con Ollama** (sin ninguna salida a internet),
  **híbrido** (solo salida a la API de Anthropic, datos en casa del cliente) o **sin
  IA** (gestión completa, asistentes desactivados).
- Licencia anual firmada; sin tope de usuarios ni técnicos.
- Copias, TLS y servidor son responsabilidad del cliente; Vigilancia normativa y el
  espacio auditor no van por defecto.

### 7.26 Seguridad y privacidad (argumentos de venta válidos)
- **Datos aislados por organización** en la base de datos (RLS), con tests de
  seguridad en CI.
- La IA recibe **solo lo necesario** (el acta 9.3, con estadísticas agregadas).
- **Evidencias privadas** con enlaces firmados y temporales; clave de IA y prompts
  **en el servidor**.
- **Conexión cifrada (TLS)** y **datos alojados en Europa**. NO es cifrado de
  extremo a extremo: el contenido se procesa en el servidor para la IA. No lo
  insinúes.
- Firma verificable, traza que no se borra, roles impuestos en la base de datos.
- Documentación de seguridad (DPA, subencargados, backups, respuesta a incidentes,
  divulgación responsable, security.txt): página /seguridad.html.

---

## 8. Normas y marcos cubiertos
**Sistemas de gestión:** ISO 9001 · ISO 14001 · ISO 45001 · ISO 50001 ·
ISO/IEC 27001 (y TISAX, ver §8.1) · ISO 37001 · ISO 14006 · ISO 56001.
**Producto y cliente:** 8D (genérico y formato OEM) · IATF 16949 · EN 9100
(AS9100D) · ECSS-Q-ST-10-09C · IFS Food.
**Entidades acreditadas:** ISO/IEC 17025 · ISO/IEC 17020 · ISO/IEC 17065 (capa de
gestión) · respuesta a auditorías de certificación y acreditación (ENAC).
**Por cláusula, además de 10.2:** 4.4 (mapa de procesos) · 6.1 / 6.1.2 (riesgos y
aspectos) · 6.2 (objetivos) · 6.3 (cambios) · 7.1.6 (conocimiento) · 7.3 / 7.4
(toma de conciencia, comunicación) · 7.5.2 (aprobación) · 8.2 (emergencias) · 9.1
(análisis) · 9.2 (auditoría interna) · 9.3 (revisión por la dirección).

Forma corta para la web: **«Diecisiete tipos de expediente, cada uno con su
norma.»** (Verificado en `src/docTypes.js`, 5 oct 2026; si se añade un tipo,
actualizar la cifra aquí y en la web.) Designación completa en titulares y blog
(UNE-EN ISO 9001:2015; 45001 es :2023).

### 8.1 TISAX: qué hace Evidran y qué NO (disclaimer obligatorio)
TISAX no es una norma ISO: es el **intercambio de resultados de evaluación** de
la industria automovilística (ENX), contra el catálogo **VDA ISA**. Nunca lo
escribas como «norma TISAX» ni como «certificación TISAX».

**Lo que SÍ hace Evidran para una empresa con TISAX (o que lo prepara):**
- Documenta **incidentes y NC de seguridad de la información** con su entrevista
  propia (dimensión CIA, datos personales, información de terceros, prototipos).
- **Auditoría interna contra el catálogo VDA ISA que sube la propia
  organización** (Excel del portal ENX): Evidran lo lee entero y exacto y monta
  la checklist sobre él. **No cita el catálogo de memoria**: sin catálogo
  cargado, no propone apartados TISAX.
- Matriz de riesgos con lenguaje de seguridad (activo, amenaza, vulnerabilidad,
  control) cuando la organización tiene activado ese sistema.
- **On-premise con IA local (Ollama)** para políticas que no permiten datos en la
  nube: los datos y las consultas no salen de la red del cliente.

**Lo que NO hace (dilo si preguntan, y no lo insinúes nunca):**
- **No emite, garantiza ni acelera la etiqueta TISAX.** La evaluación la hace un
  proveedor de auditoría acreditado por ENX; Evidran no lo es ni lo sustituye.
- **No hace la autoevaluación VDA ISA** ni calcula niveles de madurez.
- **No implanta ni gestiona los controles técnicos** (accesos, cifrado,
  protección física de prototipos, gestión de activos): ayuda a gestionar las NC,
  incidentes, auditorías y acciones del sistema.
- **No sustituye a un SGSI** ni al responsable de seguridad de la información.
- **Evidran no tiene certificación ISO/IEC 27001 ni SOC 2 propias** a fecha de
  hoy (ver /seguridad.html). No escribas nada que lo sugiera.

Frase segura para copy: *«Para empresas con ISO/IEC 27001 o TISAX: incidentes y
no conformidades de seguridad de la información, y auditoría interna contra tu
catálogo VDA ISA. La evaluación TISAX la sigue haciendo tu auditor.»*

---

## 9. Diferenciadores (por qué elegir Evidran y no Word/Excel u otro QMS)
1. **Conversacional, no formularios.** Hablas; el informe se escribe solo.
2. **Criterio de calidad de verdad.** No acepta causas pobres; piensa en sistema,
   extensión y eficacia, y no deja cerrar sin lo que exige la norma.
3. **17 tipos de expediente en una herramienta**, activables por organización.
4. **Un sistema conectado:** NC → plan y objetivos → riesgos → auditorías → cambios
   → acta 9.3, con los mismos datos.
5. **Firma verificable y traza que no se borra**, impuestas en la base de datos.
6. **Te avisa:** veredicto del sistema con su regla y resumen diario por email.
7. **Memoria de la organización:** casos anteriores, decisiones con su porqué,
   lecciones y pack para incorporaciones.
8. **Planta conectada:** app de campo, QR por máquina, captura sin cobertura,
   traspaso técnico → calidad.
9. **Puente con el auditor externo** sin darle acceso al panel.
10. **Vigilancia normativa** para entidades acreditadas.
11. **Abierto a tu IA (MCP)** y **on-premise con IA local**, poco habitual en el
    sector.
12. **El documento es del cliente:** logo, pie y código de formato propios.

---

## 10. Mensajes y ángulos de venta (usar como materia prima, no como dogma)
- Hero actual de evidran.com: **«Tu tiempo es para mejorar. No para rellenar
  plantillas.»**
- «Evidran no sustituye el criterio del responsable de calidad. Lo amplifica.»
- «Cuenta qué ha pasado. Del informe me encargo yo.»
- «La causa raíz que tu auditor aceptará.»
- «La próxima no conformidad no empezará de cero.»
- «Cuando alguien se va, el conocimiento se queda.»
- «Tu Revisión por la Dirección, redactada a partir de tus propios datos.»
- «Que ninguna acción se te pase de plazo sin que te enteres.»
- «Quien ve el problema lo cuenta desde la máquina; calidad lo recibe.»

> ⚠️ **No inventes métricas concretas** (porcentajes de ahorro de tiempo, número de
> clientes, ROI) salvo que se te proporcionen como dato real.

---

## 11. Objeciones frecuentes y respuestas
- *«Ya tengo plantillas en Word / Excel.»* → Las plantillas no te entrevistan, no
  evitan causas pobres, no te avisan ni cruzan datos. Y tu histórico se importa
  desde Excel; tus documentos siguen saliendo con tu logo y tu código de formato.
- *«Ya uso ChatGPT.»* → ChatGPT no conoce tu sistema, no guarda la traza, no firma,
  no te avisa de lo que vence ni lleva el plan y los riesgos. Evidran trabaja con
  tus datos y tu norma.
- *«¿La IA se inventa cosas?»* → No decide ni inventa datos: redacta a partir de lo
  que cuentas, marca lo que propone, y los hallazgos y porcentajes son cálculos
  sobre tus datos. Aprueba y firma una persona.
- *«¿Mis datos están seguros?»* → Aislados por empresa en la base de datos,
  evidencias privadas, la IA recibe lo mínimo, alojamiento en Europa. Y si tu
  política no admite nube, on-premise con IA local.
- *«¿Tenéis ISO 27001 o SOC 2?»* → Aún no, y preferimos decirlo. Lo que sí hay está
  documentado en /seguridad.html.
- *«Llevo varias normas.»* → Una herramienta para los 17 tipos, y activas solo los
  que usas.
- *«¿Con Evidran tengo el TISAX?»* → No. Evidran ordena tus incidentes, NC y
  auditorías internas contra tu catálogo VDA ISA; la evaluación y la etiqueta las
  da un auditor acreditado por ENX. (§8.1)
- *«Somos un laboratorio acreditado.»* → Cubre la capa de gestión (TNC, acciones,
  hallazgos ENAC) y, si quieres, la vigilancia normativa; la competencia técnica es
  tuya.
- *«En planta no van a escribir.»* → Captura rápida, dictado con el teclado del
  móvil y QR en la máquina; calidad completa después.
- *«Soy yo solo para todo.»* → Justo para eso está pensado.
- *«¿Y si dejo Evidran?»* → Te llevas tus datos: todos los CSV desde Descargas y cada
  documento en Word/PDF.

---

## 12. Glosario (para hablar con propiedad en la landing y los guiones)
- **NC:** no conformidad. **AC:** acción correctiva. **TNC:** trabajo no conforme
  (laboratorio). **8D:** metodología de resolución en 8 disciplinas (automoción).
- **Causa raíz:** el porqué sistémico real (no el síntoma). **5 porqués:** técnica
  para llegar a ella. **No detección:** por qué no se paró antes.
- **Extensión:** si el problema afecta a otros procesos/áreas/sedes.
- **Verificación de eficacia:** comprobar que la acción funcionó.
- **Revisión por la Dirección (9.3):** reunión anual que evalúa el sistema.
  **Objetivos de calidad (6.2):** metas medibles. **Cambios planificados (6.3).**
  **Conocimientos de la organización (7.1.6).**
- **Riesgo inherente / residual:** antes y después del tratamiento. **Aspecto
  ambiental significativo** (14001 · 6.1.2).
- **ENAC:** entidad de acreditación. **OEM:** fabricante (cliente en automoción).
- **TISAX:** intercambio de resultados de evaluación de seguridad de la información
  en automoción (ENX), contra el catálogo **VDA ISA**. No es una norma ISO ni una
  certificación. **NRB:** comité de revisión de no conformidades (ECSS). **APPCC:**
  análisis de peligros y puntos de control crítico (IFS).
- **On-premise:** instalado en los servidores del cliente. **MCP:** protocolo para
  conectar un agente de IA a los datos de una aplicación.

---

## 13. Tono y estilo para la comunicación de venta
- Cercano, directo, en segunda persona (tuteo). Lenguaje de alguien que ha
  sufrido una auditoría, no de un folleto corporativo.
- Concreto y honesto: beneficios verificables, cero humo de "IA revolucionaria".
- Rigor técnico cuando toca (usa bien la terminología del glosario), sin acartonar.
- Frases cortas. Verbos de acción. Una idea por bloque.
- Diseño de la web: nada de barras de color laterales como acento.

---

## 14. INSTRUCCIONES PARA LA SKILL

Cuando se te pida **crear o mejorar la landing de ventas** o **un guion de
venta**, usa este documento como única fuente de verdad sobre el producto y:

1. **No prometas funcionalidades que no estén en las secciones 6–8**, y respeta la
   sección 15. Si te piden algo fuera de alcance, dilo y propón cómo encajarlo con
   lo que sí existe.
2. **Respeta marca y tono** (secciones 2 y 13). Nunca uses nombres antiguos.
3. **Ancla cada beneficio a una funcionalidad real** (sección 7). Evita métricas
   inventadas (sección 10).
4. **Adapta el mensaje al segmento** (sección 3).
5. **TISAX:** aplica siempre §8.1.

### Estructura recomendada de landing (evidran.com)
1. **Hero:** promesa + subtítulo de criterio + CTA («Pide una demo» / prueba de 30
   días).
2. **El problema** (sección 4, en lenguaje del cliente).
3. **Cómo funciona:** la entrevista (6, 7.1).
4. **La plataforma conectada:** estado del sistema y módulos (7.6–7.18, 7.24).
5. **Memoria de la organización** (7.8–7.10).
6. **Entornos y normas** (3 y 8) como prueba de alcance.
7. **Confianza:** firma, roles, seguridad, on-premise, vigilancia (7.6, 7.21, 7.23, 7.25, 7.26).
8. **Objeciones** convertidas en FAQ (sección 11).
9. **CTA final** + a quién sirve.

### Estructura recomendada de guion de venta (demo/llamada)
1. **Apertura + descubrimiento:** ¿qué normas llevas?, ¿cuántas NC al año?, ¿cómo
   las documentas hoy?, ¿qué te dijo el último auditor?, ¿quién reporta en planta?
2. **Conexión con el dolor** (sección 4) según lo que responda.
3. **Demo en vivo:** crear una NC hablando → ver el documento redactarse → causa
   raíz bien hecha → enviar a aprobación y firmar → exportar Word con su logo.
4. **El «momento ajá»:** veredicto del sistema + Inteligencia + Casos anteriores /
   Decisiones + acta 9.3.
5. **Encaje por segmento** (8D/IATF, EN 9100/ECSS, IFS, 27001/TISAX, acreditadas,
   multinorma, auditor/consultor, on-premise).
6. **Rebatir objeciones** (sección 11).
7. **Cierre:** siguiente paso concreto (organización de prueba y primer expediente
   real).

---

## 15. Lo que Evidran NO hace (no lo prometas)
- **Copiloto y MCP son de solo lectura:** no crean, editan ni cierran nada. Sin
  OAuth en MCP (no conecta con el conector web de claude.ai).
- **No evalúa requisitos legales** ni identifica legislación: trabaja con la lista
  que trae la organización; la evaluación de cumplimiento la declara la dirección.
- **No cita catálogos de memoria** (VDA ISA, IFS): los sube la organización.
- **Búsqueda por palabra clave, no semántica**; sin RAG sobre el histórico.
- **Sin indicadores de desempeño de producto** en IATF, ECSS e IFS (§7.2). No
  calcula la cobertura de requisitos auditados ni el % de conformidad por auditoría.
- **No hace la competencia técnica** en 17025/17020/17065.
- **TISAX:** ver §8.1. **Sin ISO 27001 ni SOC 2 propias.**
- **No es cifrado de extremo a extremo.**
- **App móvil solo como PWA** (no en App Store / Google Play); offline solo la
  captura de texto.
- **No valida firmas digitales externas:** detecta que el PDF lleva firma y que
  corresponde al expediente.
- **No publica procedimientos automáticamente** ni cierra expedientes sola.

---

_Mantener sincronizado con `ochod-demo/docs/evidran-funcionalidades.md`. Si se
añade una funcionalidad o un tipo de expediente, actualizar las secciones 7, 8, 9 y
15 antes de usar este prompt para vender algo que aún no existe._
