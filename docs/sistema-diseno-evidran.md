# Sistema de diseño · Evidran

> Documento de referencia extraído del código real (`index.html` + páginas de
> `public/*.html`, todas sobre `public/plataforma.css`). Sirve como brief de
> diseño para Canva, Figma, o cualquier herramienta externa, y como spec para
> mantener coherencia visual al crear páginas nuevas.
> Fecha: julio 2026.

---

## 1. Personalidad de marca

Evidran es un **copiloto de calidad con criterio experto**, no una app de
formularios ni un chatbot genérico. El diseño tiene que transmitir eso:

- **Sobrio, no corporativo-genérico ni "IA startup".** Cero gradientes morados
  súper-saturados, cero ilustraciones 3D de robots. La seriedad viene de
  mostrar producto real (mockups), no de decoración.
- **Producto por delante del marketing.** Cada afirmación se demuestra con un
  mockup CSS del propio producto (estilo Holded: *mucha imagen, menos texto*).
  Ver [[evidran-landing-positioning]] — regla "mucha imagen, menos texto",
  copy recortado a titular + 1-2 líneas, cada claim con su mockup.
- **Honesto, nunca sobre-promete.** El mismo criterio aplica al diseño: no usar
  trucos visuales que sugieran más de lo que el producto hace (p. ej. no
  simular datos en tiempo real que no existen sin dejarlo claro como mockup).
- **Regla explícita: nunca barras de acento lateral de color** (`border-left`
  coloreado en cards/chips/callouts). Es una muletilla reconocible de UI
  generada por IA y el usuario la rechaza explícitamente. El color de
  categoría se muestra con un **punto de color** (`<i>` circular de 9px,
  patrón `.nchip i` / `.pmdot`), texto en negrita coloreada, badge relleno, o
  icono coloreado — nunca con el borde. Ver [[evidran-no-lateral-color-accents]].

---

## 2. Paleta de color

Definida en `:root` de `index.html`:

| Token | Hex | Uso |
|---|---|---|
| `--blue` | `#2563EB` | Color primario de marca. Eyebrows, enlaces, CTA primario, acentos de foco. |
| `--blue-l` | `#4AA6F5` | Azul claro, para degradados (p. ej. `.step .n`). |
| `--teal` | `#15B8A6` | Secundario. Puntos/energía, "auditoría" en chips de norma. |
| `--green` | `#46DE7E` | Éxito / positivo. Degradados de badges "hot". |
| `--navy` | `#2D5A7B` | Acento oscuro de marca (logo, "amplify" line, wordmark `em`). Nota: hay tensión sin resolver entre el azul brillante + verde del logo y este navy más apagado — ver [[evidran-project]]. |
| `--ink` | `#16202B` | Texto principal, casi-negro azulado. |
| `--ink-soft` | `#4A5563` | Texto secundario/párrafos. |
| `--cream` | `#F7F6F2` | Fondo base de toda la web (no blanco puro). |
| `--cream-d` | `#EDEAE2` | Fondo crema oscurecido (secciones alternas). |
| `--line` | `#DDD8CC` | Bordes neutros — el único borde permitido en cards/chips. |
| `--white` | `#fff` | Cards, dropdowns, superficies elevadas. |

**Colores de sistema/norma** (solo como punto de color en `.nchip i`, nunca
como borde):

| Sistema | Color |
|---|---|
| Calidad (ISO 9001) | `--blue` `#2563EB` |
| Ambiental (ISO 14001) | `#2E7D54` (verde bosque) |
| Seguridad y salud (ISO 45001) | `#B45309` (mostaza/ámbar) |
| Energía (ISO 50001) | `#0E7490` (cian oscuro) |
| Laboratorio (ISO 17025) | `#6D28D9` (púrpura) |
| Acreditación (17020/17065) | `--navy` `#2D5A7B` |
| Automoción / 8D | `#B42318` (rojo) |
| Auditoría | `--teal` `#15B8A6` |

Regla de fondo oscuro: secciones "clímax" (`#memoria`, `#problem`,
`.intel-shot`) usan `--ink` como fondo con texto `--cream`/blanco — es el único
sitio donde se invierte la paleta, reservado para los momentos de mayor peso
narrativo (no decorativo).

---

## 3. Tipografía

- **Familia:** `"Inter Tight"`, con fallback a system-ui (`-apple-system,
  BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- **Pesos usados:** 600 (semibold, texto interactivo/labels), 700 (bold,
  eyebrows/nav), 800 (extrabold, la mayoría de headings/números), y **850**
  para el H1 del hero — más pesado que cualquier otro elemento, es el punto de
  máximo énfasis de la página.
- **Escala (con `clamp()` para fluidez responsive):**
  - H1 hero: `clamp(34px, 5.2vw, 58px)`, peso 850, `max-width: 21ch`.
  - H2 de sección: `clamp(26px, 3.4vw, 38px)`, peso 800.
  - Punch/climax text: `clamp(22px, 3vw, 30px)`, peso 800.
  - Eyebrows (kickers): `12–12.5px`, uppercase, `letter-spacing: 0.12em`, peso
    700, color `--blue`.
  - Micro-labels (badges, campos): `9.5–10.5px`, uppercase, `letter-spacing:
    .06–.09em`, peso 700–800.
  - Body/párrafos: heredado, `line-height: 1.6`, color `--ink-soft`.
- **Tracking:** todos los headings llevan `letter-spacing: -0.02em` (títulos
  apretados); los eyebrows y micro-labels llevan tracking positivo amplio
  (uppercase abierto) — es el contraste tipográfico característico de la web:
  **titulares apretados vs. etiquetas abiertas**.

---

## 4. Espaciado y forma

- **Radio de borde base:** `--radius: 16px` (cards grandes, mockups). Botones
  usan `12px`. Chips/pills usan `999px` (full pill).
- **Contenedor:** `.wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px;
  }` — ancho de columna consistente en toda la web.
- **Ritmo vertical:** `section { padding: 84px 0; }` como base; el hero y
  secciones "climax" ajustan un poco pero se mantienen en ese orden de
  magnitud (nunca bloques apretados <60px).
- **Sombras:** sutiles y cálidas, nunca negras puras — `rgba(22,32,43, .04
  a .16)` (el mismo tono que `--ink`, no gris neutro). Ejemplo: `box-shadow: 0
  3px 10px rgba(22,32,43,.04)` en reposo, `0 10px 22px rgba(22,32,43,.09)` en
  hover, `0 24px 60px rgba(22,32,43,.16)` en dropdowns/menús flotantes.
- **Micro-interacción estándar:** `transform: translateY(-2px)` + aumento de
  sombra en hover para chips/cards clicables. Transición corta, `.12–.15s`.

---

## 5. Componentes clave

- **Botones (`.btn`):** radio 12px, padding `13px 22px`, peso 700, sin borde.
  `.btn-primary` en `--blue` sólido; variante "ghost" con borde `--line` para
  CTAs secundarios.
- **Chips/pills (`.nchip`, `.ch`):** fondo blanco, borde `--line` (nunca
  coloreado), texto en dos pesos (label 600 + valor destacado 800), punto de
  color de 9px como único acento cromático. Variante "hot" usa degradado
  verde→teal de fondo sólido (no borde) para destacar un estado.
- **Mockups de producto (`.mock-bar`, `.doc-*`, `.d-mock`, `.riskmap`,
  `.intel-shot`, etc.):** el componente central de todo el sistema. Son
  reconstrucciones CSS/HTML del propio producto (browser-bar falsa, campos de
  documento, mapas de calor 5×5, mini-gráficos de barras) con **datos
  inventados pero realistas y consistentes entre mockups** (mismos códigos
  NC-2026-014 / NCA-2024-001 / 8D-2026-002, mismas personas M. López / J. Ruiz
  / A. Pérez a lo largo de toda la web). Nunca capturas de pantalla reales en
  la home; sí se usan capturas reales de la app en secciones específicas
  quirúrgicamente elegidas.
- **`.feat-row` / `.rev`:** patrón alterno texto-izquierda/visual-derecha (y
  viceversa con `.rev`) reutilizado en toda la web para "afirmación + prueba
  visual". Es la unidad de composición más repetida del sistema.
- **Eyebrow + heading:** todo bloque narrativo empieza con un eyebrow
  (`.eyebrow`/`.acto-kick`/`.fr-eyebrow`) en azul uppercase antes del H2 —
  patrón consistente de jerarquía.

---

## 6. Iconografía y marcadores

- Sin librería de iconos externa cargada; los pocos iconos son SVG inline
  minimalistas trazo simple (LinkedIn en footer, chevron de dropdown hecho con
  dos bordes rotados `.car`).
- El logo es un SVG inline: burbuja de chat azul + 3 puntos + documento verde
  (30×30 en nav).
- Los "marcadores" de categoría son siempre **puntos circulares de color**
  (`.nchip i`, `.pmdot`), consistente con la regla anti-barra-lateral. Es el
  lenguaje visual heredado de la propia app de producto.

---

## 7. Voz ↔ diseño

El sistema de diseño está subordinado al eje de posicionamiento (ver
[[evidran-landing-positioning]]): Evidran vende **criterio experto y memoria
organizacional**, no velocidad ni IA. Consecuencias de diseño:

- La IA nunca es protagonista visual (nada de chips "✨ AI-powered" brillantes
  ni gradientes morado-rosa típicos de producto IA genérico).
- Los mockups muestran *razonamiento* (causa raíz, plan de acción, revisión
  por dirección), no "magia" — refuerza que el producto piensa como un
  responsable de calidad senior, no que "genera texto".
- Paleta fría y sobria (azul/navy/teal/crema) en vez de paleta cálida-vibrante
  típica de SaaS consumer — coherente con el público objetivo (responsables de
  calidad, auditores, entornos regulados/industriales).

---

## 8. Cómo usar este documento

- **Para Canva/Figma/herramientas externas:** usar la tabla de color (§2) y
  tipografía (§3) tal cual como brand kit; los componentes (§5) como
  referencia de estilo de card/botón/chip al maquetar piezas nuevas
  (redes, PDFs, pitch decks) para que combinen con la web.
- **Para nuevas páginas del sitio:** heredar `public/plataforma.css`, seguir
  el patrón `.feat-row` para nuevas secciones, y respetar la regla §1 de no
  barras laterales de color en ningún componente nuevo.
