// Anuncio 1 de Meta Ads · «Cuéntalo como lo contarías».
// Guion: ochod-demo/lanzamiento/26-meta-ads/02-guiones-y-textos.md (anuncio 1).
// Tomas grabadas en la org demo Inyectados Rívora (public/anuncio01/).
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const NAVY = "#15304A";
export const AZUL = "#2563EB";
export const CREMA = "#F7F6F2";
const CREMA_ = CREMA;
export const FUENTE = "Archivo, Arial, sans-serif";
export const suave = Easing.bezier(0.16, 1, 0.3, 1);

// Dos temas para la prueba A/B de color: mismo anuncio, solo cambia el fondo y el texto.
type Tema = { fondo: string; texto: string; enfasis: string; secundario: string; logo: string };
export const TEMAS: Record<"crema" | "azul", Tema> = {
  crema: { fondo: CREMA_, texto: NAVY, enfasis: "#2563EB", secundario: "#4B6179", logo: "anuncio01/evidran-logo.svg" },
  azul: { fondo: "#2563EB", texto: "#FFFFFF", enfasis: "#FFFFFF", secundario: "#DCE7FD", logo: "anuncio01/evidran-logo-blanco.svg" },
};
export const TemaCtx = React.createContext<Tema>(TEMAS.crema);
export type Anuncio01Props = { tema: "crema" | "azul" };

export const fuentes = `
@font-face{font-family:Archivo;font-weight:100 900;src:url(${staticFile("anuncio01/archivo-latin-500.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215;}
@font-face{font-family:Archivo;font-weight:100 900;src:url(${staticFile("anuncio01/archivo-latin-ext-500.woff2")}) format("woff2");}
`;

// Encuadre: acerca la toma (1920×2400, mismo 4:5 que el lienzo) a un rectángulo
// de la pantalla original, expresado en fracciones (0–1) del ancho y el alto.
type Rect = { x: number; y: number; w: number };
export type Clave = Rect & { f: number };
export const Encuadre: React.FC<{
  src: string;
  inicio: number; // segundos de la toma donde empieza
  velocidad: number;
  de?: Rect;
  a?: Rect;
  claves?: Clave[]; // alternativa a de/a: encuadres en fotogramas concretos
  duracion: number; // fotogramas de la escena
  ancho?: number; // ancho de la tarjeta en px
}> = ({ src, inicio, velocidad, de, a, claves, duracion, ancho = TARJETA_W }) => {
  const f = useCurrentFrame();
  const ks: Clave[] = claves ?? [{ f: 0, ...de! }, { f: duracion, ...a! }];
  const fs = ks.map((k) => k.f);
  const cam = (k: keyof Rect) =>
    ks.length === 1
      ? ks[0][k]
      : interpolate(f, fs, ks.map((c) => c[k]), {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });
  const x = cam("x");
  const y = cam("y");
  const w = cam("w");
  // La tarjeta mide TARJETA_W × TARJETA_H; la toma es 4:5 (ancho 1, alto 1.25).
  const anchoVideo = ancho / w;
  const altoVideo = anchoVideo * 1.25;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <div
        style={{
          position: "absolute",
          width: anchoVideo,
          height: altoVideo,
          left: -x * anchoVideo,
          top: -y * altoVideo,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(inicio * 30)}
          playbackRate={velocidad}
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Marco de la pantalla: tarjeta blanca con sombra, separada del texto.
export const BANDA = 250; // alto de la franja de texto de arriba
const TARJETA_W = 1000;
const TARJETA_H = 1350 - BANDA - 40;
export const Tarjeta: React.FC<{ children: React.ReactNode; alto?: number }> = ({ children, alto = TARJETA_H }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      top: BANDA,
      width: TARJETA_W,
      height: alto,
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: "0 30px 70px rgba(21,48,74,.22), 0 0 0 1px rgba(21,48,74,.10)",
      backgroundColor: "#fff",
    }}
  >
    {children}
  </div>
);

// Rótulo: texto oscuro en la franja crema de arriba, fuera de la pantalla.
// La última palabra clave en azul para que se lea como mensaje, no como interfaz.
export const Rotulo: React.FC<{ texto: string; duracion: number }> = ({ texto, duracion }) => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const entra = interpolate(f, [2, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  const sale = interpolate(f, [duracion - 6, duracion], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 0,
        height: BANDA,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: entra * sale,
        transform: `translateY(${(1 - entra) * 24}px)`,
        color: tema.texto,
        fontFamily: FUENTE,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.1,
        letterSpacing: -1.2,
      }}
    >
      {texto}
    </div>
  );
};

// La hoja del PDF entra por abajo sobre fondo crema.
export const HojaPdf: React.FC<{ alto?: number }> = ({ alto = 1060 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: BANDA }}>
      <div
        style={{
          width: alto * 0.8,
          height: alto,
          transform: `translateY(${(1 - p) * 900}px) rotate(${(1 - p) * 4}deg)`,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(8,24,44,.28)",
          backgroundColor: "#fff",
        }}
      >
        <Img src={staticFile("anuncio01/pdf.png")} style={{ width: "100%" }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: BANDA + 26,
          right: 140,
          opacity: interpolate(f, [16, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          backgroundColor: AZUL,
          color: "#fff",
          fontFamily: FUENTE,
          fontWeight: 800,
          fontSize: 34,
          padding: "10px 22px",
          borderRadius: 999,
        }}
      >
        PDF
      </div>
    </AbsoluteFill>
  );
};

export const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const a = (d: number) =>
    interpolate(f, [d, d + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE }}>
      <Img
        src={staticFile(tema.logo)}
        style={{ width: 620, opacity: a(0), transform: `translateY(${(1 - a(0)) * 30}px)` }}
      />
      <div
        style={{
          marginTop: 70,
          color: tema.texto,
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: "center",
          opacity: a(10),
          letterSpacing: -0.5,
        }}
      >
        Evidran no sustituye tu criterio.
        <br />
        <span style={{ color: tema.enfasis, fontWeight: 850 }}>Lo amplifica.</span>
      </div>
      <div style={{ marginTop: 70, color: tema.secundario, fontSize: 40, fontWeight: 600, opacity: a(22) }}>
        evidran.com
      </div>
    </AbsoluteFill>
  );
};

// Escenas (30 fps). Ritmo pausado: los pasos de pantalla van a velocidad real
// y solo se acelera lo que es espera o escritura. Total ≈ 34 s.
type Tramo = {
  d: number; // fotogramas
  src?: string;
  inicio?: number;
  velocidad?: number;
  claves?: Clave[];
  pdf?: boolean;
  cierre?: boolean;
};
const TRAMOS: Tramo[] = [
  // 1 · El dolor: la plantilla de Word vacía
  { d: 90, src: "anuncio01/word.mp4", inicio: 0, velocidad: 1, claves: [{ f: 0, x: 0.1, y: 0.08, w: 0.8 }, { f: 90, x: 0.14, y: 0.1, w: 0.72 }] },
  // 2a · Panel → «Nuevo expediente» (velocidad real)
  { d: 66, src: "anuncio01/A-crear.mp4", inicio: 0.8, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 1 }, { f: 66, x: 0, y: 0, w: 0.72 }] },
  // 2b · Elegir «No Conformidad Interna» (velocidad real)
  { d: 60, src: "anuncio01/A-crear.mp4", inicio: 3.0, velocidad: 1, claves: [{ f: 0, x: 0.2, y: 0.08, w: 0.65 }, { f: 60, x: 0.22, y: 0.1, w: 0.6 }] },
  // 2c · Escribir lo que ha pasado (×2)
  { d: 168, src: "anuncio01/A-crear.mp4", inicio: 5.3, velocidad: 2, claves: [{ f: 0, x: 0, y: 0.3, w: 0.7 }, { f: 40, x: 0, y: 0.575, w: 0.5 }, { f: 168, x: 0, y: 0.575, w: 0.5 }] },
  // 2d · Evidran contesta y pregunta (velocidad real, sin la espera)
  { d: 135, src: "anuncio01/A-crear.mp4", inicio: 24.0, velocidad: 1, claves: [{ f: 0, x: 0, y: 0.05, w: 0.48 }, { f: 135, x: 0, y: 0.07, w: 0.46 }] },
  // 3 · El informe se rellena (conversación completa acelerada)
  { d: 255, src: "anuncio01/B-conversacion.mp4", inicio: 0, velocidad: 15, claves: [{ f: 0, x: 0.41, y: 0.1, w: 0.58 }, { f: 255, x: 0.41, y: 0.36, w: 0.58 }] },
  // 4a · Exportar → PDF (velocidad real)
  { d: 75, src: "anuncio01/C-documento-pdf.mp4", inicio: 10.8, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 0.5 }, { f: 75, x: 0, y: 0, w: 0.42 }] },
  // 4b · La hoja del PDF
  { d: 80, pdf: true },
  // 5 · Cierre
  { d: 105, cierre: true },
];
const inicioTramo = (n: number) => TRAMOS.slice(0, n).reduce((a, t) => a + t.d, 0);
const hasta = (n: number) => inicioTramo(n + 1);

// Rótulos: [primer tramo, último tramo, texto, arriba]
const ROTULOS: [number, number, string, boolean][] = [
  [0, 0, "¿Otra no conformidad por rellenar?", false],
  [1, 2, "Abre una no conformidad.", true],
  [3, 3, "Cuéntalo con tus palabras.", true],
  [4, 4, "Evidran te pregunta lo\u00a0que\u00a0falta.", true],
  [5, 5, "Y redacta el informe, campo\u00a0a\u00a0campo.", false],
  [6, 7, "Listo para la auditoría.", false],
];

export const Anuncio01: React.FC<Anuncio01Props> = ({ tema }) => (
  <TemaCtx.Provider value={TEMAS[tema]}>
  <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
    <style>{fuentes}</style>
    {TRAMOS.map((t, n) => (
      <Sequence key={n} from={inicioTramo(n)} durationInFrames={t.d}>
        {t.src && (
          <Tarjeta>
            <Encuadre src={t.src} inicio={t.inicio!} velocidad={t.velocidad!} claves={t.claves} duracion={t.d} />
          </Tarjeta>
        )}
        {t.pdf && <HojaPdf />}
        {t.cierre && <Cierre />}
      </Sequence>
    ))}
    {ROTULOS.map(([a, b, texto]) => {
      const from = inicioTramo(a);
      const d = hasta(b) - from;
      return (
        <Sequence key={texto} from={from} durationInFrames={d}>
          <Rotulo texto={texto} duracion={d} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
  </TemaCtx.Provider>
);

export const DURACION_ANUNCIO01 = inicioTramo(TRAMOS.length);
