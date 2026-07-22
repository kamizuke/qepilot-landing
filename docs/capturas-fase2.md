# Capturas reales · Fase 2

> Guía para sacar las capturas de la app que sustituirán (o acompañarán) a los
> mockups CSS en las páginas de plataforma. Requiere una **organización demo
> bien poblada** en app.evidran.com — nunca datos de cliente.

## Preparar la organización demo

Antes de capturar, poblar una org "Industrias Meridia S.L." (o similar) con
datos **coherentes con los mockups de la web** para que web y capturas cuenten
la misma historia:

- Expedientes: `NC-2026-014` (instrucción turno noche, M. López, vencida),
  `NCA-2024-001` (sondas pH, J. Ruiz, cerrada), `8D-2026-002` (proveedor
  embalaje), `NC-2024-031` (fuga aceite retén, cerrada, causa proveedor),
  `8D-2022-006` (rezume retén, cerrada, causa par de apriete) + ~15 más para
  superar el umbral de significancia (8) y dar volumen a Tendencias.
- Personas: M. López, J. Ruiz, A. Pérez. Áreas: Producción (concentrada ~35 %),
  Almacén, Compras.
- Causas repartidas para que la taxonomía pinte: formación ~37 %, método ~21 %,
  proveedor ~16 %, medición ~11 %.
- Plan de mejora con 4-6 acciones (1 verificada, 2 pendientes, 1 vencida) y
  bitácora en al menos una.
- Riesgos: R-04 (proveedor único elastómero, inherente 12 → residual 6,
  acciones verificadas → nudge reevaluar) y R-07 en tratamiento; 1 oportunidad.
- Auditoría interna: programa 2026 con 4 procesos (2 realizadas con hallazgos,
  1 en curso con checklist medio marcada, 1 planificada). Calendario con el
  seguimiento AENOR en octubre (confirmada) y una interna sin confirmar.
- Revisión 9.3 generada del año en curso; si hay actas de años anteriores,
  mejor (enseña el archivo por ejercicios).

## Las 9 capturas (dónde va cada una)

| # | Pantalla | Qué debe verse | Destino |
|---|---|---|---|
| 1 | **Tendencias completa** | Hallazgos deterministas + gráficas 6 meses + reparto de causas + objetivo recomendado 6.2 | inteligencia.html (sección tendencias) |
| 2 | **Historial** | Búsqueda "retén" con 2 resultados resueltos (causa + solución visibles) | inteligencia.html #historial |
| 3 | **Editor doble panel** | Chat + documento en vivo, barra "Documento %" avanzada, un campo recién rellenado resaltado | Home #capturar (sustituye o acompaña al mock) |
| 4 | **Calendario · vista Año** | 12 mini-meses con días coloreados por norma + leyenda | auditorias.html #calendario |
| 5 | **Matriz 5×5 real** | Toggle inherente/residual, R-04 en ambas vistas, segmentador riesgos/oportunidades | riesgos-plan.html #matriz |
| 6 | **Revisión 9.3** | Acta generada + selector de ejercicio con años anteriores | inteligencia.html #revision |
| 7 | **Vigilancia normativa · Estado** | Salud del monitor, versión vigente por reglamento, un cambio real con impacto | futura página del módulo (fase posterior) |
| 8 | **Móvil · captura rápida + QR** | Frame de teléfono: escaneo del QR y captura pre-rellena; foto con cámara | Home #campo / futura página app de campo |
| 9 | **Panel de calidad** | KPIs, semáforo, NC fijada con chincheta | producto.html / home |

## Criterios

- **Resolución**: ventana a 1440×900, captura retina (2x). Móvil: 375 px con
  frame de iPhone.
- **Formato**: WebP (como `equipo-calidad2.webp`), peso < 200 KB por captura.
- **Sin datos reales** de ningún cliente; los nombres/códigos, los de arriba.
- **Idioma y fechas**: todo en 2026, coherente con la web.
- Guardarlas en `public/capturas/` con nombres descriptivos
  (`tendencias.webp`, `historial.webp`…).

## Cómo se integran

En las páginas de plataforma, cada captura sustituye al mockup CSS equivalente
dentro del mismo `.fr-visual` (un `<img>` con `loading="lazy"`, `width/height`
y `alt` descriptivo), o se añade como visual secundario si el mockup animado
aporta más que la captura estática. Decidir caso a caso al verlas.
