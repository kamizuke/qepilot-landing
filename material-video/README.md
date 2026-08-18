# Material de vídeo de Evidran

Esta carpeta reúne los recursos de producción y las exportaciones usadas en los vídeos de Evidran.

## Estructura

- `landing/master/`: másteres de edición y póster del vídeo para la landing.
- `landing/web/`: exportaciones reducidas para publicación web.
- `broll/`: B-roll aprobado y listo para usar directamente en CapCut.
- `broll/archivo/`: versiones fuente, imágenes de referencia y fotogramas de revisión.
- `identidad/actual/`: entrada, salida y transición vigentes.
- `identidad/descartes/`: versiones anteriores conservadas como referencia.
- `identidad/fuentes/`: fotogramas maestros utilizados para renderizar la identidad.
- `originales/`: vídeos fuente anteriores a la edición actual.
- `documentos/`: PDF y plantilla de NC empleados en la demostración.

Los generadores y utilidades locales están en `scripts/`. Los recursos publicados por la web siguen en `public/`.

El vídeo de la página «Una NC de principio a fin» se publica en `public/media/` y se genera desde
`landing/web/Nc-evidran-landing-web-720p.mp4` con `scripts/compress_video_web.m` (720p a 1.500 kbps, ~11 MB)
y su póster con `scripts/extract_video_frame.m` en el segundo 37,5.
