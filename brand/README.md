# Logotipos de Evidran

Esta carpeta (`/brand`) guarda los **archivos maestros** del logo tal y como los entregó el
diseño. No se publican en la web: son la fuente de la que se derivan todos los formatos.

| Archivo | Para qué sirve |
|---|---|
| `EVIDRAN.ai` | Original de Illustrator. Editable. |
| `EVIDRAN.eps` | Vectorial para imprenta / proveedores. |
| `EVIDRAN.pdf` | Vectorial para documentos e imprenta. |
| `EVIDRAN.svg` | Vectorial para web (fuente de las variantes). |
| `EVIDRAN.png` | 5000 × 1568 px, fondo transparente. |
| `EVIDRAN.jpg` | 5000 × 1568 px, fondo blanco (para donde no se admita PNG). |

## Archivos listos para la web (`/public`)

Todo lo de `/public` sí se publica. Rutas tal y como quedan en evidran.com:

| Ruta pública | Uso |
|---|---|
| `/brand/evidran-logo.svg` | Logo completo (símbolo + EVIDRAN). **Preferente en web.** |
| `/brand/evidran-isotipo.svg` | Solo el símbolo (bocadillo + documento). Cuadrado. |
| `/brand/evidran-wordmark.svg` | Solo la palabra EVIDRAN. |
| `/brand/evidran-logo-1600.png` `-800` `-400` | Logo completo en PNG transparente, por si hace falta rasterizado (email, Word, plataformas que no admiten SVG). |
| `/brand/evidran-isotipo-512.png` | Símbolo en PNG transparente (avatares, LinkedIn, perfiles). |
| `/brand/evidran-og.png` | 1200 × 630 sobre crema de marca. Para `og:image` / previsualización al compartir. |
| `/favicon.svg`, `/favicon.ico`, `/favicon-16.png` … `-512.png` | Icono de pestaña. |
| `/apple-touch-icon.png` | 180 × 180, fondo blanco (iOS no admite transparencia). |

Los SVG derivados llevan los colores **en línea** (sin `<style>` ni clases `.st0`), así que
se pueden pegar directamente dentro del HTML sin que choquen con los estilos de la página.

## Colores de marca (tomados del logo)

- Azul principal `#1277EB`
- Tinta / navy `#021A49`
- Degradado verde de las líneas: `#33DF9D` → `#14B2BA`

## Cómo regenerar los derivados

Si cambia el logo maestro, se sustituyen los archivos de esta carpeta y se vuelven a generar
los derivados: los SVG recortando el `viewBox` del maestro (símbolo `53 43 450 450`, palabra
`577 185 1067 157`, completo `68 70 1576 398`) y los PNG/favicon redimensionando
`EVIDRAN.png` con Lanczos (recorte del símbolo: `155, 126, 1314 × 1314`).

## Reglas de uso

- No estirar ni recolorear el logo. Si hace falta una versión monocroma, se pide al diseño.
- En fondos oscuros no hay versión en negativo todavía: usar el símbolo o pedir la variante.
- A tamaños muy pequeños (16 px) el trazo del símbolo queda fino; el navegador elegirá el de
  32 px del `.ico` siempre que pueda.
