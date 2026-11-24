// Anuncio 13 · «Del Excel a Evidran». Objeción: «ya tengo mi sistema funcionando en documentos».
// No hay que empezar de cero: el histórico de NC se importa tal cual está (Excel o CSV), entra
// con su código y su fecha real, y desde ese día Evidran lo usa: al abrir una NC parecida,
// avisa de que ya pasó y de con qué acción se cerró.
// Pantallas: capturas reales de la org de pruebas (Metalúrgica Duero en pantalla), 23/11/2026.
// Registro importado: remotion/public/anuncio13/registro-nc-2023-2025.csv (12 NC de prueba).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cierre, FUENTE, TEMAS, TemaCtx, fuentes, suave } from "./Anuncio01";
import {
  Anuncio12Props,
  Aviso,
  Captura,
  Clave,
  Desperdigado,
  FormatoCtx,
  JUNTA,
  MAQUETAS,
  MaquetaCtx,
  Pantalla,
  Pieza,
  Resalte,
  Rotulo,
  mov,
  useMaqueta,
} from "./Anuncio12";

export type Anuncio13Props = { tema: Anuncio12Props["tema"]; formato: Anuncio12Props["formato"] };
type Formato = Anuncio12Props["formato"];

// ---------- Capturas ----------
// Paso 2 del importador: «Tal cual lo tengas…» (solo la ventana, 1440×924).
export const ARCHIVO: Captura = { src: "anuncio13/imp-archivo.webp", ancho: 1440, alto: 924 };
// Paso 3: Evidran ha propuesto qué columna va a cada campo; a la derecha, lo que ha leído de la hoja.
export const MAPEO: Captura = { src: "anuncio13/imp-mapeo.webp", ancho: 1440, alto: 1290 };
// Paso 4: «12 expedientes importados correctamente.»
export const RESULTADO: Captura = { src: "anuncio13/imp-resultado.webp", ancho: 1440, alto: 386 };
// Panel, pestaña Histórico, ordenado por apertura: fecha real del hecho y etiqueta «Histórico».
export const PANEL: Captura = { src: "anuncio13/panel-historico.webp", ancho: 2560, alto: 1600 };
// NC-2026-057 recién abierta: «Esto ya pasó · Se parece a NC-2023-007… Esa NC se cerró con la acción…».
export const ESTO_YA_PASO: Captura = { src: "anuncio13/nc-esto-ya-paso.webp", ancho: 2560, alto: 988 };

// Subrayados medidos sobre cada captura (fracciones de la imagen).
export const RESALTES_ARCHIVO: Resalte[] = [{ x: 0.0299, y: 0.2608, w: 0.8806, h: 0.0314, f: 40, d: 16 }];
// Lo que Evidran ha leído de la hoja (columna «Vista previa»).
export const RESALTES_MAPEO: Resalte[] = [
  { x: 0.7278, y: 0.3496, w: 0.1035, h: 0.0233, f: 58, d: 5 },
  { x: 0.7278, y: 0.4147, w: 0.0944, h: 0.0233, f: 64, d: 5 },
  { x: 0.7278, y: 0.4798, w: 0.1493, h: 0.0233, f: 70, d: 5 },
  { x: 0.7278, y: 0.6062, w: 0.0944, h: 0.0233, f: 76, d: 5 },
  { x: 0.7278, y: 0.7372, w: 0.2229, h: 0.0233, f: 82, d: 7 },
];
// La fecha de apertura de las primeras NC: la del hecho, no la de la importación.
export const RESALTES_PANEL: Resalte[] = [
  { x: 0.3859, y: 0.3156, w: 0.0555, h: 0.0169, f: 62, d: 6 },
  { x: 0.3859, y: 0.3975, w: 0.0359, h: 0.0338, f: 69, d: 5 },
  { x: 0.3859, y: 0.4875, w: 0.0359, h: 0.0338, f: 75, d: 5 },
  { x: 0.3859, y: 0.5775, w: 0.0359, h: 0.0338, f: 81, d: 5 },
];
// «Se parece a NC-2023-007» y la acción con que se cerró. La fecha que enseña la tarjeta es la
// de la importación (fallo de la app ya avisado), por eso no se subraya ni se cita en el rótulo.
export const RESALTES_EYP: Resalte[] = [
  { x: 0.4418, y: 0.3411, w: 0.1367, h: 0.0344, f: 62, d: 9 },
  { x: 0.8391, y: 0.3846, w: 0.1133, h: 0.0324, f: 76, d: 7 },
  { x: 0.4402, y: 0.4231, w: 0.3695, h: 0.0324, f: 84, d: 14 },
];

// ---------- Lo que el sistema ya sabe, repartido ----------
const PIEZAS13: Pieza[] = [
  { tipo: "xlsx", titulo: "Registro NC 2019-2026.xlsx" },
  { tipo: "correo", titulo: "RE: RE: cierre NC-2025-022" },
  { tipo: "carpeta", titulo: "NC 2023", lineas: ["NC-2023-007 casquillos.docx", "informe_lote2302.pdf", "fotos CNC 3", "Nueva carpeta"] },
  { tipo: "docx", titulo: "Acciones correctivas 2024 (rev).docx" },
  { tipo: "pdf", titulo: "Informe NC-2024-012_firmado.pdf" },
  { tipo: "carpeta", titulo: "Auditorías › 2025", lineas: ["informe_auditoria_ext.pdf", "hallazgos_v2.xlsx", "plan acciones.docx", "copia de copia.xlsx"] },
  { tipo: "xlsx", titulo: "Seguimiento acciones_v4.xlsx" },
  { tipo: "foto", titulo: "lote_2302.jpg" },
  { tipo: "nota", titulo: "", nota: "¿Esto no nos\npasó ya?\nMirar NC 2023" },
];

// ---------- Gancho ----------
const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const m = useMaqueta();
  const a = (d: number) => interpolate(f, [d, d + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  const linea = (texto: string, d: number) => (
    <div style={{ opacity: a(d) * 0.85, transform: `translateY(${(1 - a(d)) * 18}px)` }}>{texto}</div>
  );
  return (
    <AbsoluteFill
      style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center", padding: "0 60px" }}
    >
      <div style={{ fontSize: m.ganchoFuente, fontWeight: 700, lineHeight: 1.3 }}>
        {linea("Años de NC en un Excel.", 0)}
        {linea("Los informes, en carpetas.", 18)}
        {linea("Las acciones, en Word.", 36)}
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: m.ganchoGrande,
          fontWeight: 850,
          letterSpacing: -3,
          lineHeight: 1.02,
          color: tema.enfasis,
          opacity: a(62),
          transform: `scale(${0.94 + 0.06 * a(62)})`,
        }}
      >
        ¿Y ahora empezar de cero?
      </div>
    </AbsoluteFill>
  );
};

// ---------- Frase final ----------
const Frase: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const m = useMaqueta();
  const a = (d: number) => interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill
      style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center", padding: "0 80px" }}
    >
      <div style={{ fontSize: m.fraseFuente, fontWeight: 850, letterSpacing: -2, lineHeight: 1.08 }}>
        <div style={{ opacity: a(0) }}>No empiezas de cero.</div>
        <div style={{ opacity: a(16), color: tema.enfasis, marginTop: 18 }}>Empiezas con todo lo que ya&nbsp;sabes.</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Montaje (30 fps) ----------
type Encuadres = Record<Formato, Clave[]>;
type Tramo = { d: number; gancho?: boolean; caos?: boolean; cap?: Captura; claves?: Encuadres; aparece?: boolean; resaltes?: Resalte[]; frase?: boolean; cierre?: boolean };

const GANCHO: Tramo = { d: 120, gancho: true };
const CAOS: Tramo = { d: JUNTA + 15, caos: true };
const T_ARCHIVO: Tramo = {
  d: 95,
  cap: ARCHIVO,
  aparece: true,
  resaltes: RESALTES_ARCHIVO,
  claves: { "4x5": mov({ x: 0, y: 0, w: 0.7 }, { x: 0.02, y: 0.17, w: 0.6 }, 60), "16x9": mov({ x: 0, y: 0, w: 1 }, { x: 0.02, y: 0.13, w: 0.9 }, 60) },
};
const T_MAPEO: Tramo = {
  d: 110,
  cap: MAPEO,
  resaltes: RESALTES_MAPEO,
  // 4:5: la columna de la hoja y la vista previa; 16:9: también el campo de Evidran.
  claves: { "4x5": mov({ x: 0, y: 0, w: 0.95 }, { x: 0.345, y: 0.225, w: 0.61 }, 56), "16x9": mov({ x: 0, y: 0, w: 1 }, { x: 0.03, y: 0.22, w: 0.93 }, 56) },
};
const T_RESULTADO: Tramo = {
  d: 60,
  cap: RESULTADO,
  resaltes: [{ x: 0.0486, y: 0.536, w: 0.325, h: 0.075, f: 30, d: 10 }],
  // Se acerca a «12 expedientes importados correctamente.», centrado en vertical.
  claves: {
    "4x5": [
      { f: 0, x: 0, y: -1.366, w: 1 },
      { f: 40, x: 0.02, y: -0.527, w: 0.55 },
    ],
    "16x9": [
      { f: 0, x: 0, y: -0.483, w: 1 },
      { f: 40, x: 0.02, y: -0.187, w: 0.7 },
    ],
  },
};
const T_PANEL: Tramo = {
  d: 120,
  cap: PANEL,
  resaltes: RESALTES_PANEL,
  claves: { "4x5": mov({ x: 0.1, y: 0, w: 0.6 }, { x: 0.205, y: 0.2, w: 0.5 }, 58), "16x9": mov({ x: 0, y: 0, w: 1 }, { x: 0.197, y: 0.22, w: 0.6 }, 58) },
};
const T_EYP: Tramo = {
  d: 135,
  cap: ESTO_YA_PASO,
  resaltes: RESALTES_EYP,
  claves: {
    "4x5": mov({ x: 0.2, y: -0.2, w: 0.6 }, { x: 0.425, y: -0.2, w: 0.56 }, 58),
    "16x9": mov({ x: 0.13, y: 0, w: 0.74 }, { x: 0.42, y: 0.24, w: 0.56 }, 58),
  },
};
const FRASE: Tramo = { d: 75, frase: true };
const CIERRE: Tramo = { d: 95, cierre: true };

const TRAMOS: Tramo[] = [GANCHO, CAOS, T_ARCHIVO, T_MAPEO, T_RESULTADO, T_PANEL, T_EYP, FRASE, CIERRE];
const inicio = (n: number) => TRAMOS.slice(0, n).reduce((a, t) => a + t.d, 0);
const dur = (n: number) => TRAMOS[n].d;
const DURACION_TOTAL = inicio(TRAMOS.length);
const T1 = inicio(1);

// [desde, duración, texto]. Cada rótulo, el dolor o el valor de ese momento.
const ROTULOS: [number, number, string][] = [
  // Dolor: lo que el sistema sabe está repartido y no se aprovecha
  [T1, JUNTA, "Lo que tu sistema sabe, en carpetas."],
  // Objeción: «tendría que empezar de cero»
  [T1 + JUNTA, dur(1) - JUNTA, "No empiezas de cero: te lo traes."],
  [inicio(2), dur(2), "Súbelo tal cual: Excel o CSV."],
  [inicio(3), dur(3), "Evidran propone qué columna va dónde."],
  [inicio(4), dur(4), "Tu histórico, dentro."],
  [inicio(5), dur(5), "Con su código y su fecha real."],
  // Valor: lo que estaba en una carpeta avisa cuando se repite
  [inicio(6), dur(6), "Y te recuerda cómo lo resolvisteis."],
];

export const Anuncio13: React.FC<Anuncio13Props> = ({ tema, formato }) => (
  <TemaCtx.Provider value={TEMAS[tema]}>
    <MaquetaCtx.Provider value={MAQUETAS[formato]}>
      <FormatoCtx.Provider value={formato}>
        <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
          <style>{fuentes}</style>
          {/* Misma pista que el anuncio 12 (ElevenLabs Music v2.5 vía Higgsfield, 32 s): su golpe
              de los 8,5 s cae cuando los archivos se juntan en Evidran. */}
          <Audio
            src={staticFile("anuncio12/musica.mp3")}
            volume={(f) =>
              interpolate(f, [0, 9, DURACION_TOTAL - 15, DURACION_TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            }
          />
          {TRAMOS.map((t, n) => (
            <Sequence key={n} from={inicio(n)} durationInFrames={t.d}>
              {t.gancho && <Gancho />}
              {t.caos && <Desperdigado piezas={PIEZAS13} />}
              {t.cap && (
                <>
                  <Pantalla cap={t.cap} claves={t.claves![formato]} aparece={t.aparece} resaltes={t.resaltes} />
                  <Aviso />
                </>
              )}
              {t.frase && <Frase />}
              {t.cierre && <Cierre />}
            </Sequence>
          ))}
          {ROTULOS.map(([desde, d, texto]) => (
            <Sequence key={texto} from={desde} durationInFrames={d}>
              <Rotulo texto={texto} duracion={d} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </FormatoCtx.Provider>
    </MaquetaCtx.Provider>
  </TemaCtx.Provider>
);

export const DURACION_ANUNCIO13 = DURACION_TOTAL;
