# Calculadora de huella gratuita — manual

Herramienta gratuita para captar contactos: calcula la huella de carbono de
una empresa (alcances 1 y 2) con los factores oficiales del MITECO, sin crear
cuenta. Propuesta completa: doc «Calculadora de huella gratuita para captar
contactos» (https://claude.ai/artifact/8Jc596SZZvbDNaHX3gtnDb). Fase 1
(calculadora e informe) y las dos primeras partes de la fase 2 (borrado a los
24 meses y paso a la lista de llamadas).

- **Calculadora**: `evidran.com/huella` (pública, sale en Google).
- **Informe**: `evidran.com/huella/informe/<enlace>`, que llega por correo
  (no sale en Google).

## Cómo funciona

1. La persona escribe sus consumos: combustibles de instalaciones,
   vehículos, maquinaria y electricidad (comercializadora y kWh). Puede marcar
   cada dato como «aproximado».
2. Pulsa **Calcular mi huella**: ve el total, el reparto entre alcance 1 y 2
   y el desglose por fuente. El cálculo se guarda **sin datos personales**.
3. Para el informe completo deja correo y empresa (teléfono opcional) y marca
   las casillas: informe (obligatoria), novedades y aviso anual (opcional),
   que le llamen (opcional, solo con teléfono).
4. Le llega un correo con **Ver mi informe**. Abrir el enlace confirma el
   correo y te llega un aviso a `AGENDA_AVISOS_EMAIL` (demo@evidran.com) con
   la empresa, la huella, la fuente principal y lo que ha autorizado.
5. El informe trae: resultado y desglose con factores, **qué pasa si** (luz
   con garantía de origen renovable, un 10 % menos en vehículos, un 10 % menos
   en instalaciones), **objetivo ISO 14001** con porcentaje y año editables,
   **texto para cuestionarios** y **cifras para la calculadora del MITECO**
   con botón de copiar. Se guarda en PDF con el botón de la página (imprimir
   del navegador). Si aceptó novedades, puede darse de baja desde ahí.

6. **Paso a la lista de llamadas.** Al confirmar el correo, si aceptó que le
   llamen y dejó teléfono, entra en `/llamadas` como **contacto caliente**:
   sale arriba del todo («Pidieron que les llamaras (calculadora de huella)»)
   con la nota «Calculadora de huella: 47,2 t CO₂e en 2025; fuente principal…».
   Si es nuevo, se asigna a la persona activa con menos pendientes (sin
   personas, queda sin asignar). Si su teléfono ya estaba en la lista, vuelve
   arriba y la nota se añade a sus notas; si estaba en «No llamar», no se toca.
   Deja de estar destacado en cuanto se anota una llamada. El aviso a
   demo@evidran.com dice qué ha pasado.
7. **Borrado a los 24 meses.** Cada lunes a las 4:00 (UTC) un cron de Vercel
   borra los contactos de la calculadora sin actividad en 24 meses, como dice
   la política de privacidad. Los cálculos no tienen datos personales y se
   quedan. Si se define `CRON_SECRET` en Vercel, el cron la usa; si no, no
   hace falta (solo borra lo que ya debía borrarse).

El cálculo da exactamente lo mismo que el apartado de huella de la app (caso
de prueba: 47,2 t, validado contra el Excel del MITECO con un 0,085 %).

## Puesta en marcha

1. **Supabase → SQL Editor:** pega entero `migraciones/huella-calculadora.sql`
   y después `migraciones/huella-fase2.sql`, y pulsa **Run** en cada uno.
   Crean `huella_calculo` y `huella_contacto` (tablas de la web, no de la app),
   la última actividad de cada contacto y el «contacto caliente» de la lista
   de llamadas.
2. **Vercel:** no hace falta ninguna variable nueva; usa las de la agenda
   (Supabase, SMTP, `AGENDA_AVISOS_EMAIL`, `AGENDA_URL_BASE`).
3. **Commit + Push** del repositorio qepilot-landing.
4. **Revisa la política de privacidad** (`privacidad.html`): debe cubrir esta
   finalidad (enviar el informe, avisos si se aceptan, llamada si se acepta) y
   el plazo de conservación (24 meses sin actividad).
5. Prueba con datos reales de una empresa y tu propio correo.

## Mantenimiento: factores nuevos

Cuando el vigía de la app avise de una calculadora nueva del MITECO, se
regeneran los factores en la app (`scripts/huella-factores-miteco.py`) y se
copian a la web:

```bash
node tools/copiar-factores-huella.mjs
```

Después, Commit + Push en los dos repositorios.

## Lo que queda para la fase 2

- «Guárdalo para seguir luego».
- Envío del aviso anual a quien lo aceptó.
- Alta de prueba de Evidran con el cálculo ya cargado.

Cambio respecto a la propuesta: el escenario «pasar de gasóleo a gas natural»
se cambió por «un 10 % menos en instalaciones», porque necesita conversiones
de litros a kWh que la calculadora oficial no trae. El «modo rápido» de la
fase 1 es marcar cada dato como aproximado.

## Dónde está cada cosa

| Pieza | Fichero |
|---|---|
| Página de la calculadora | `public/huella.html` |
| Página del informe | `public/huella-informe.html` |
| Cálculo (navegador y servidor) | `public/huella/calculo.js` |
| Factores oficiales (copiados de la app) | `public/huella/factoresOficiales.js`, `public/huella/comercializadoras.js` |
| Endpoint | `api/huella/calculadora.js` |
| Acciones y textos de los correos | `api/huella/_acciones.js` |
| Acceso a Supabase | `api/huella/_datos.js` |
| Migraciones | `migraciones/huella-calculadora.sql`, `migraciones/huella-fase2.sql` |
| Pruebas | `tests/huella.test.js` |
| Copiar factores | `tools/copiar-factores-huella.mjs` |
| Servidor local | `tools/agenda-local.mjs` (`/huella`, correos en `/_correos`) |
| Rutas, no-indexar y cron semanal | `vercel.json`, `public/sitemap.xml` |
