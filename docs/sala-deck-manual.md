# Sala del deck — manual

Enlaces privados para compartir el deck de Evidran (o cualquier PDF comercial)
con inversores y clientes, viendo quién lo abre, cuánto tiempo pasa en cada
página y hasta dónde llega. Es el equivalente propio de deckroom.es.

- **Visor** (lo que ve la otra persona): `evidran.com/d/<enlace>` + una clave.
- **Panel** (solo tú): `evidran.com/deck-panel.html` + la clave del panel.

Ninguna de las dos páginas sale en Google (van marcadas como «no indexar»).

---

## Puesta en marcha (una sola vez)

### 1. En Supabase → SQL Editor
Pega entero el contenido de `migraciones/sala-deck.sql` y pulsa **Run**.
Crea las tablas (`deck_documento`, `deck_enlace`, `deck_visita`,
`deck_lectura`), la función del registro de lectura y el almacén `decks`.
Son tablas de la landing, **no de la app**: no van en `_migraciones` ni al
instalador on-premise (el rastro es este manual y ese fichero).

### 2. En Supabase → Storage → decks
Pulsa **Upload file** y sube el PDF del deck. (El almacén es privado:
nadie puede descargarlo por URL directa.)

### 3. En Vercel → proyecto de la landing → Settings → Environment Variables
Añade tres variables (en Production, Preview y Development):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | la URL del proyecto (Supabase → Settings → API → Project URL) |
| `SUPABASE_SERVICE_ROLE` | la clave *service_role* (Supabase → Settings → API keys). **Nunca** la *anon*. |
| `DECK_ADMIN_CLAVE` | una clave larga que inventas tú para el panel (guárdala en el gestor de contraseñas) |

### 4. Commit + Push en GitHub Desktop
Al desplegarse, entra en `evidran.com/deck-panel.html`, escribe la clave del
panel y registra el documento (elige el PDF subido y ponle título).

---

## Uso diario

1. **Panel → Nuevo enlace**: elige el documento, escribe el nombre de la
   persona y el fondo/empresa. Sale el enlace y una clave de 8 letras.
2. **Enlace por email, clave por otro canal** (WhatsApp, por ejemplo).
   La clave solo se muestra una vez: en la base queda cifrada.
3. En **Enlaces y lectura** ves por persona: aperturas, última apertura,
   tiempo total, % leído y el tiempo por página (las barras).
4. **Apagar** corta el acceso al momento (se puede volver a encender).
   **Borrar y olvidar** elimina el enlace y todo su registro de lectura.

Para actualizar el deck sin cambiar los enlaces: sube el PDF nuevo en
Supabase → Storage → decks **con el mismo nombre** (Upload file → marca
«Overwrite»). Todos los enlaces pasan a enseñar la versión nueva.

---

## Qué ve la otra persona

Una página oscura y sobria con el logo de Evidran: pide la clave, y después
el documento página a página (flechas, teclado o deslizar en el móvil), con
su nombre como marca de agua muy suave. No hay botón de descarga. Debajo
del formulario se avisa de que la lectura queda registrada (eso cubre el
deber de información: no hay cookies ni se guarda la IP, solo las páginas
y el tiempo).

## Qué la protege

- Enlace de 22 caracteres aleatorios + clave aparte (con hash scrypt, 8
  intentos por IP cada 10 minutos).
- El PDF vive en un almacén privado; el visor recibe una URL firmada que
  caduca a los 10 minutos.
- Páginas marcadas «noindex»; las tablas con RLS sin políticas (solo el
  servidor con la service key puede leerlas).
- Lo que ninguna herramienta evita (tampoco deckroom): capturas de pantalla.
  La defensa real es saber quién lo tiene y poder apagar su enlace.

## Dónde está cada cosa

| Pieza | Fichero |
|---|---|
| Migración (tablas + RPC + bucket) | `migraciones/sala-deck.sql` |
| Entrada con clave | `api/deck/acceso.js` |
| Registro de lectura | `api/deck/latido.js` |
| Acciones del panel | `api/deck/admin.js` |
| Utilidades comunes | `api/deck/_comun.js` (no es endpoint) |
| Visor | `public/deck.html` |
| Panel | `public/deck-panel.html` |
| Rutas y no-indexar | `vercel.json` |
