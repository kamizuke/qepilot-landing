# Grabación automática de la app para anuncios

Usado el 25/09/2026 para el anuncio 1 de Meta Ads. Navegador sin ventana (Playwright) a
1280×1600 con escala 2 → fotogramas 2560×3200 (4:5), unos 13–19 por segundo.

1. `npm i playwright-core` aquí dentro (Chromium ya está en ~/Library/Caches/ms-playwright).
2. Primera vez: `VISIBLE=1 node servidor.js` y Lissette inicia sesión (la sesión queda en `perfil/`).
   Después, `node servidor.js` sin ventana.
3. Se manda código por POST a 127.0.0.1:8787: `c1.js` (cursor visible), `grab2.js`
   (grabación por capturas; el screencast de CDP recorta la imagen, no usarlo),
   `a.js`/`h.js`/`c.js` (tomas del anuncio 1). Cambiar `__dirname_grab` por la ruta real.
4. Fotogramas → MP4 con el ffmpeg de Screen Studio usando `frames.json` (duración real de cada uno).
5. Montaje: `src/Anuncio01.tsx`.

No borra datos: los expedientes creados para el anuncio los elimina Lissette a mano.
