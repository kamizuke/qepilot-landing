# Propuesta · Web de ventas v3 — "La organización que aprende"

> Fecha: 2026-07-22. Evoluciona (no sustituye) `estrategia-copy-web.md`.
> Pilar nuevo acordado: **Evidran no vende IA ni no conformidades. Vende la
> capacidad de que una organización aprenda de todo lo que le ocurre y convierta
> ese conocimiento en ventaja competitiva.**
> Inspiración estructural: factorial.es (producto amplio → menú con desplegables).

---

## 1. Qué cambia y por qué

La web actual ya no vende velocidad: vende criterio experto ("no sustituye tu
criterio, lo amplifica") y el ciclo completo. Eso sigue siendo verdad, pero se
queda un escalón por debajo del producto real: hoy Evidran tiene auditoría
interna, calendario, firma con huella, roles con aprobación, white-label,
vigilancia normativa, app de campo, copiloto, MCP y on-premise. **Ya no es un
copiloto con extras: es una plataforma.** Y una plataforma no se cuenta con una
landing lineal de un solo hilo.

Tres movimientos:

1. **Eje de mensaje**: de "criterio en la entrada, inteligencia en la salida" a
   su consecuencia final — **memoria organizacional**. Cada expediente hace más
   inteligente a la empresa. La IA baja a segundo plano (es el *cómo*, nunca el
   *qué*).
2. **Arquitectura**: de landing única a **plataforma navegable** con menú
   desplegable estilo Factorial (Plataforma / Soluciones / Recursos), donde cada
   módulo tiene su sitio y, con el tiempo, su página.
3. **Altura del target**: de "pyme con una persona para todo" a **organizaciones
   que se examinan** — certificadas, acreditadas, con auditorías que no
   perdonan. Ver §4: "alto nivel" = exigencia, no tamaño.

---

## 2. El eje

### Frase canónica (pitch, hero de referencia, demo)

> **Evidran convierte cada incidente, auditoría y acción de mejora en
> conocimiento reutilizable, para que tu organización decida mejor, aprenda más
> rápido y mejore de forma continua.**

### La transformación (el gráfico central de la nueva web)

```
La mayoría del software:   Incidente → Documento → Archivo → Olvido

Evidran:                   Incidente → Investigación → Causa raíz → Acciones
                           → Verificación → Conocimiento reutilizable
                           → Tendencias → Mejora continua
```

Cada expediente hace más inteligente a la organización. Ese contraste merece ser
un **visual propio (CSS animado)**, probablemente el del hero.

### Qué NO decimos nunca

- No abrimos titulares con "IA", "GPT", "automatización", "chatbot".
- No vendemos "hacemos no conformidades" (feature, no plataforma).
- No competimos por velocidad ("ahorra tiempo" es coda, no promesa).

Vocabulario que sí: conocimiento, memoria, decisiones, aprendizaje,
trazabilidad, mejora continua, inteligencia organizacional. La IA aparece
después, con su sección propia (§6.5) y en los badges de los mockups (eso es
enseñar el producto tal cual es, no venderla).

### Dónde queda la IA

Una sección a mitad de página lo dice sin rodeos:

> **La IA no es el producto.** Es lo que hace que capturar conocimiento cueste
> minutos: te entrevista, interpreta, redacta, clasifica y propone. El valor no
> está en la conversación — está en lo que queda cuando termina.

Esto nos separa limpiamente de "otra web con IA": nadie que vende IA dice esto.

---

## 3. Regla de honestidad: qué podemos afirmar hoy

El pilar "memoria organizacional" es potente pero hay que anclarlo. Preguntas
del análisis estratégico, contrastadas con el producto real:

| Pregunta | ¿Se puede afirmar hoy? | Con qué |
|---|---|---|
| ¿Qué causas raíz se repiten de verdad? | **Sí** | Taxonomía de causas (Tendencias) |
| ¿Esto ya nos pasó? ¿Cómo se resolvió? | **Sí** | Historial (búsqueda causa+descripción+solución) |
| ¿Qué acciones han funcionado? | **Sí** (matizado) | Plan de mejora: eficacia verificada, tasa de eficacia |
| ¿Qué áreas/procesos concentran las NC? | **Sí** | Hallazgos deterministas de Tendencias |
| ¿Qué procesos acumulan mayor riesgo? | **Sí** | Matriz 6.1 + cobertura por proceso |
| ¿Estoy listo para la auditoría? | **Sí** | Copiloto (consulta datos reales, enlaza registros) |
| ¿Qué proveedores generan más incidencias? | **No** (solo % de causa "proveedor", no ranking por proveedor) | — no prometer |
| ¿Qué auditorías detectan siempre lo mismo? | **No** (no hay análisis cruzado de auditorías) | — no prometer |
| Búsqueda semántica sobre el histórico (RAG) | **No** (pendiente Fase 2 del producto) | — no prometer |

Regla: la lista de "preguntas que tu organización puede responder" en la web usa
**solo las seis primeras**. Las otras son roadmap: se venden cuando existan.

---

## 4. "Empresas de alto nivel": qué significa aquí

No podemos fingir ser SAP: el producto está diseñado para equipos de calidad
ligeros, y eso es una virtud. La lectura honesta de "alto nivel" es **nivel de
exigencia**, no plantilla: automoción con OEM y TISAX, laboratorios y entidades
ENAC, certificados multi-norma con auditorías que no perdonan.

Y ahí tenemos señales enterprise **reales** que hoy la web casi no cuenta:

- **Aprobación y firma del responsable** con huella SHA-256, verificación al
  abrir, reglas reforzadas en base de datos (no en la interfaz) y tests de
  seguridad en CI. Compatible con firma externa (Adobe Sign, FNMT…).
- **Roles con aislamiento en BD** (responsable / miembro / técnico de captura).
- **Identidad documental white-label**: los Word/PDF salen con el logo, pie y
  código de formato del cliente.
- **On-premise**: misma base de código en los servidores del cliente, con IA
  local (Ollama) sin salida a internet — argumento TISAX/defensa.
- **Vigilancia normativa** con evidencia de vigilancia continua para ENAC.
- **Conexión MCP**: el agente de IA del propio cliente consulta su sistema
  (solo lectura). Nadie del sector lo ofrece.
- Aislamiento por organización a nivel de BD, rate-limit real, RLS testeada.

Esto pide una **sección de confianza técnica en la home** (§6.7) y, en fase
posterior, páginas /seguridad y /on-premise (el contenido ya existe en
`docs/seguridad/` del repo de la app).

Lo que cambia de tono: fuera "Diseñado para la realidad de las pymes. No para
departamentos de calidad de veinte personas" como bandera central. Nuevo marco:
**"Para organizaciones que se examinan."** Sirve igual para la pyme certificada
que para el proveedor TISAX — y no expulsa a nadie.

---

## 5. Arquitectura de navegación (estilo Factorial)

Menú superior con desplegables. En Fase 1 los ítems apuntan a anclas de la home
y a páginas existentes; en fases posteriores se convierten en páginas propias.

### PLATAFORMA (mega-menú, 3 columnas = el recorrido del conocimiento)

**Capturar con criterio** *(el conocimiento entra bien)*
- No conformidades y 8D — 9 tipos de expediente, cada uno con su norma
- La entrevista — hablas, el informe se redacta en vivo
- Auditorías — bandeja de hallazgos, auditoría interna 9.2, calendario anual
- App de campo — QR por punto de control, foto, offline
- Puente auditor ↔ empresa — hallazgos que llegan ya estructurados

**Gobernar el ciclo** *(nada se pierde por el camino)*
- Plan de mejora continua 10.2 — todas las acciones, eficacia verificada
- Riesgos y oportunidades 6.1 — matriz viva, inherente → residual
- Avisos y plazos — la herramienta se acuerda por ti
- Aprobación y firma — huella SHA-256, roles, traza que no se borra
- Identidad documental — tus informes con tu marca

**Aprender de todo** *(el conocimiento vuelve como decisión)*
- Inteligencia y tendencias — causas que se repiten, hallazgos con dato
- Historial — la memoria de calidad de tu organización, buscable
- Revisión por la Dirección 9.3 — el acta desde tus datos, archivada por años
- Copiloto — pregúntale a tu sistema; responde con datos reales
- Conexión MCP — tu propio agente de IA, conectado a tu calidad

*Pie del menú:* Vigilancia normativa (módulo) · On-premise · Seguridad

### SOLUCIONES

- **Industria multi-norma** (9001 + 14001 + 45001 + 50001)
- **Automoción** — 8D/OEM, reclamaciones de cliente, on-premise/TISAX
- **Laboratorios · ISO/IEC 17025** — TNC, ENAC, vigilancia normativa
- **Inspección y certificación · 17020/17065** — capa de gestión de la acreditación
- **Auditores y consultores** → /auditores.html (ya existe)
- **En proceso de certificación** — monta el sistema ordenado desde el día uno

### RECURSOS

- Blog (ya existe) · Evidran por dentro (/producto.html) · Seguridad y privacidad

### Resto de la barra

Precios (fase 4, decisión pendiente) · Iniciar sesión · **Pide una demo** (primario)

---

## 6. La home nueva, bloque a bloque

Orden narrativo: **problema de conocimiento → transformación → plataforma en
3 actos → memoria (clímax) → la IA en su sitio → exigencia → segmentos →
comparativa → FAQ → CTA.**

### 6.1 Hero

Tres opciones; recomendada la A.

**Opción A (recomendada)** — la transformación como promesa:
- Eyebrow: `El sistema de conocimiento de calidad`
- H1: **Cada problema resuelto hace más inteligente a tu empresa.**
- Sub: "Evidran convierte no conformidades, auditorías y acciones de mejora en
  conocimiento reutilizable: causas que se repiten, acciones que funcionaron,
  decisiones con base real. Y documentarlo cuesta una conversación, no una tarde."
- Visual: **la cadena de transformación animada** (archivo → olvido vs
  investigación → mejora continua), con el mock de la entrevista demovido al
  acto "Capturar" (§6.4).
- Se mantiene la coda: "No sustituye tu criterio. Lo amplifica." (encaja
  perfecto con el eje nuevo).

**Opción B** — la memoria como identidad:
- H1: **Tu sistema de gestión, con memoria.**
- Sub: "Lo que hoy se resuelve y se archiva, en Evidran se investiga, se
  verifica y queda disponible para la próxima vez."

**Opción C** — el dolor como gancho:
- H1: **Deja de resolver dos veces el mismo problema.**
- Sub: la frase canónica de §2.

Por qué A: es la única que nombra a la *organización* (no al usuario ni al
documento), que es exactamente el salto de altura que buscamos; B es la mejor
reserva para campañas; C es agresiva y funciona mejor como asunto de email.

CTAs del hero: **"Pide una demo"** (primario — coherente con subir de nivel) +
"Pruébalo gratis — 30 días, sin tarjeta" (secundario, el self-service no se
toca). *Decisión a validar: hoy el primario es el alta self-service.*

### 6.2 El problema — el conocimiento fragmentado

Sustituye al bloque oscuro actual de "falta de tiempo". Copy base:

> **El conocimiento de calidad de tu empresa está repartido en sitios que no
> hablan entre sí.** Informes de auditoría. No conformidades. 8D. Hojas de
> Excel. Carpetas de red. Correos. Y la cabeza de quien lleva veinte años en la
> casa.
>
> Cada incidente se resuelve. Casi ninguno se reutiliza.
>
> **Punch:** La organización mejora mucho menos de lo que podría.

(El dolor "falta de tiempo" no se tira: baja al acto Capturar, donde la
entrevista lo resuelve.)

### 6.3 La transformación

La doble cadena de §2 a pantalla completa (si no va en el hero, va aquí). Una
línea de cierre: "Un expediente es la puerta de entrada. Lo que construyes es la
memoria de tu organización."

### 6.4 La plataforma en 3 actos

Reordena TODO lo que ya existe (mockups incluidos) bajo tres cabeceras que son
las mismas del mega-menú — así menú y página cuentan la misma historia:

1. **Capturar con criterio** — mock de la entrevista (el actual del hero),
   chips de normas, perfil de organización, app de campo/QR, puente auditor y
   subida de informe PDF. Mensaje: nada entra como texto suelto; entra
   estructurado, con causa de verdad, venga de planta, del auditor o de un PDF.
2. **Gobernar el ciclo** — feat-rows actuales: matriz 6.1, auditoría interna
   9.2, plan de mejora, avisos. Mensaje: entre que el dato entra y la decisión
   sale, el sistema vigila por ti.
3. **Aprender de todo** — transición al clímax (§6.6).

### 6.5 La IA, en su sitio

Sección corta (media pantalla), tras el acto 1 o entre el 2 y el 3:

> **La IA no es el producto.**
> Es lo que hace que capturar conocimiento cueste minutos: te entrevista como un
> responsable senior, no acepta "error humano", extrae los datos de un email o
> una foto, clasifica causas y propone objetivos. La IA propone; tú dispones.
> **El valor no está en la conversación: está en lo que queda cuando termina.**

### 6.6 CLÍMAX · La memoria de tu organización (sección oscura)

Evolución de la actual sección "Inteligencia". Dos piezas:

**a) Las preguntas.** "Hoy, responder esto cuesta días de rebuscar. En Evidran,
segundos:" — con las 6 preguntas afirmables de §3, cada una enlazando a su
módulo (taxonomía de causas / historial / plan / tendencias / matriz /
copiloto).

**b) Los visuales.** El `intel-shot` actual (42 % fuera de plazo, causas
Formación 37 %…) + **mockup nuevo de Historial**: búsqueda "fuga aceite
proveedor" → 2 expedientes cerrados con su causa y su solución ("esto ya nos
pasó: así se resolvió"). + El copiloto con su pregunta de auditoría.

Cierre del bloque:

> Los clientes creen que compran software. En realidad están construyendo un
> activo: cada expediente, cada auditoría, cada acción enseña a Evidran cómo
> funciona tu organización. **Con el tiempo deja de ser una herramienta: es tu
> sistema de conocimiento de calidad.**

### 6.7 Nivel de exigencia (nueva sección de confianza)

Para el target de alto nivel, con lo de §4: firma con huella y verificación,
roles reforzados en BD, white-label documental, on-premise con IA local,
vigilancia normativa ENAC, conexión MCP, aislamiento por organización.
Titular propuesto: **"Construido para organizaciones que se examinan."**
Formato: grid de 6 tarjetas sobrias (sin humo, cada una con su hecho técnico).

### 6.8 Segmentos

Tarjetas por solución (las del menú Soluciones), que en Fase 3 enlazan a sus
páginas. Sustituye a la sección ICP actual de "pymes".

### 6.9 Comparativa, reencuadrada

La tabla actual es buena; cambia el marco: columnas **"Software que archiva"**
vs **"Sistema que aprende"**. Se añade una fila: "El conocimiento | Se va con
las personas | Queda en la organización, buscable". El bloque "¿Y frente a las
suites ISO?" se conserva tal cual (ya juega la partida de profundidad vs
anchura, que es coherente con el eje).

### 6.10 FAQ

Se conservan las actuales y se añaden:
- "¿Esto es otro chatbot con mis datos?" → No: la IA captura; el valor es el
  registro estructurado, las tendencias y el historial que quedan. Sin IA,
  Evidran sigue funcionando como sistema de gestión (cierto incluso on-premise
  en modo sin IA).
- "¿Qué pasa con mi conocimiento si me voy de Evidran?" → Exportas todo: CSV,
  Word, PDF. El conocimiento es tuyo.
- "¿Podéis trabajar sin nube?" → On-premise, misma aplicación, IA local
  opcional, licencia anual.

### 6.11 CTA final

> **Dentro de un año, tu sistema puede ser una carpeta más grande — o una
> organización que aprende.**
> Cada expediente que documentas hoy es una respuesta que tendrás mañana.
> [Pide una demo] [Empieza gratis]
> "No sustituye tu criterio. Lo amplifica."

### 6.12 Metadatos y marca

- `<title>`: "Evidran — El sistema de gestión que aprende · Calidad, auditorías
  y mejora continua" (mantiene keywords de categoría).
- Tagline del footer: de "El copiloto de calidad por IA" a **"El sistema de
  conocimiento de calidad"**.

---

## 7. Visuales y capturas

**Criterio general (recomendado):** la home sigue con mockups CSS (nítidos,
coherentes, retina, datos controlados — y ya establecimos consistencia
NC-2026-014 / M. López / J. Ruiz); las **capturas reales entran en las páginas
de plataforma** (Fase 2), donde el visitante ya quiere ver el producto de
verdad.

**Mockups CSS nuevos para la home (Fase 1):**
1. La **cadena de transformación** animada (hero o §6.3).
2. **Historial / memoria**: búsqueda con 2 resultados resueltos (causa +
   solución + fecha). Es EL mockup del eje nuevo y hoy no existe.
3. **Firma y aprobación**: bloque de firma con nombre, cargo, fecha y huella
   SHA-256 (sección exigencia).

**Capturas reales a sacar (Fase 2) — sí, hacen falta.** Con una organización
demo bien poblada (datos coherentes con los mockups, sin datos de cliente):
1. **Tendencias completa** — hallazgos + gráficas 6 meses + reparto de causas +
   objetivo recomendado. La prueba visual del clímax.
2. **Historial** con una búsqueda resuelta.
3. **Editor doble panel** con la barra "Documento %" avanzada y campos vivos.
4. **Calendario de auditorías, vista Año** — visualmente única, huele a
   plataforma seria.
5. **Matriz 5×5 real** con toggle inherente/residual.
6. **Revisión 9.3** con el selector de ejercicio (¡archivo por años = memoria!).
7. **Vigilancia normativa · Estado** (para su página de módulo).
8. **Móvil**: captura rápida + escaneo QR (con marco de teléfono).
9. **Panel de calidad** con la NC fijada con chincheta y semáforos.

---

## 8. Fases de trabajo

### Fase 1 — La home cuenta la historia nueva *(el grueso del copy)*
- Hero nuevo (opción A) + cadena de transformación (mockup CSS nuevo).
- Problema reescrito (conocimiento fragmentado).
- Reordenar los bloques existentes en los 3 actos; sección "La IA no es el
  producto"; clímax "Memoria" con el mockup nuevo de Historial; sección
  "Nivel de exigencia"; comparativa reencuadrada; FAQ nuevas; CTA final;
  title/description/footer.
- **Nav v1 con desplegables** (Plataforma / Soluciones / Recursos) apuntando a
  anclas y páginas existentes. Versión móvil en acordeón.
- Nada se tira: mockups y secciones actuales se reubican, no se rehacen.

### Fase 2 — Páginas de plataforma + capturas reales
- Poblar la org demo y sacar las 9 capturas de §7.
- Primeras 3 páginas (por impacto): **Inteligencia y memoria**, **Auditorías**
  (bandeja + interna + calendario), **Riesgos + Plan de mejora**. Después:
  captura/entrevista, app de campo, firma, vigilancia, MCP, white-label.
- `producto.html` pasa a ser el índice del tour o se absorbe.

### Fase 3 — Soluciones por segmento
- /automocion (8D, OEM, on-premise TISAX), /laboratorios (17025 + vigilancia),
  /inspeccion-certificacion (17020/17065), /sin-certificar. /auditores ya existe.
- Cada una con su dato de entrada, su norma de ejemplo y su CTA.

### Fase 4 — Confianza de alto nivel y conversión
- /seguridad (aprovechando `docs/seguridad/` del repo de la app) y /on-premise.
- Precios (retomar la propuesta dolor→plan: Starter / Professional / Business).
- Voz de cliente real cuando exista (nunca inventada).

### Transversal
- Sincronizar `producto.md` de la skill evidran-ventas: la copia empaquetada
  sigue sin recoger la mayoría del producto actual (auditoría interna,
  calendario, firma/aprobación, roles, white-label, PWA/campo, copiloto,
  vigilancia, MCP, on-premise, plan de mejora, riesgos…). El brief bueno es
  `ochod-demo/docs/evidran-funcionalidades.md`.

---

## 9. Reglas que siguen vigentes (de estrategia-copy-web.md)

1. Cada frase trazable a una funcionalidad real (ver tabla de §3).
2. Cero métricas inventadas.
3. Voz: español de España, tuteo, compañero de calidad con experiencia.
4. La IA propone, la persona dispone — siempre explícito.
5. Marca: Evidran, siempre. Sin acentos laterales de color en el diseño.
