// Anuncio 1 · versión «gancho»: arranca con un dolor del gremio («error humano»),
// lleva un reloj con el tiempo real de la grabación y enseña a velocidad real el
// momento en que Evidran no acepta «fue un despiste».
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  Anuncio01Props,
  BANDA,
  Cierre,
  Clave,
  Encuadre,
  FUENTE,
  HojaPdf,
  Rotulo,
  TEMAS,
  Tarjeta,
  TemaCtx,
  fuentes,
  suave,
} from "./Anuncio01";

// Hora real (epoch, s) del primer fotograma de cada toma, de sus frames.json.
const T0: Record<string, number> = {
  "anuncio01/A-crear.mp4": 1790328943.184,
  "anuncio01/B-conversacion.mp4": 1790328982.566,
};
// El reloj arranca al pulsar «Nuevo expediente» (segundo 2,8 de la toma A)
// y se para con la última respuesta de Evidran (fin de la toma B).
const CERO = T0["anuncio01/A-crear.mp4"] + 2.8;
const FIN = T0["anuncio01/B-conversacion.mp4"] + 127.6 - CERO;

const ALTO_TARJETA = 1000; // deja 100 px abajo para el reloj
const ANCHO = 1000;

type Tramo = {
  d: number;
  src?: string;
  inicio?: number;
  velocidad?: number;
  claves?: Clave[];
  gancho?: boolean;
  pdf?: boolean;
  cierre?: boolean;
};

const TRAMOS: Tramo[] = [
  // 0 · Gancho: solo texto
  { d: 105, gancho: true },
  // 1 · Panel → «Nuevo expediente»
  { d: 66, src: "anuncio01/A-crear.mp4", inicio: 0.8, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 1 }, { f: 66, x: 0, y: 0, w: 0.72 }] },
  // 2 · Elegir «No Conformidad Interna»
  { d: 60, src: "anuncio01/A-crear.mp4", inicio: 3.0, velocidad: 1, claves: [{ f: 0, x: 0.2, y: 0.08, w: 0.65 }, { f: 60, x: 0.22, y: 0.1, w: 0.6 }] },
  // 3 · Escribir lo que ha pasado (×2,5)
  { d: 134, src: "anuncio01/A-crear.mp4", inicio: 5.3, velocidad: 2.5, claves: [{ f: 0, x: 0, y: 0.3, w: 0.7 }, { f: 36, x: 0, y: 0.575, w: 0.5 }, { f: 134, x: 0, y: 0.575, w: 0.5 }] },
  // 4 · Evidran contesta y pregunta
  { d: 110, src: "anuncio01/A-crear.mp4", inicio: 24.0, velocidad: 1, claves: [{ f: 0, x: 0, y: 0.05, w: 0.48 }, { f: 110, x: 0, y: 0.07, w: 0.46 }] },
  // 5 · Primera respuesta (contención), acelerada
  { d: 90, src: "anuncio01/B-conversacion.mp4", inicio: 0, velocidad: 10, claves: [{ f: 0, x: 0, y: 0.2, w: 0.5 }, { f: 90, x: 0, y: 0.45, w: 0.5 }] },
  // 6 · «Yo creo que fue un despiste…» (velocidad real)
  { d: 120, src: "anuncio01/B-conversacion.mp4", inicio: 31.0, velocidad: 1, claves: [{ f: 0, x: 0, y: 0.575, w: 0.5 }, { f: 120, x: 0, y: 0.575, w: 0.5 }] },
  // 7 · Evidran no lo acepta y repregunta (casi velocidad real)
  { d: 156, src: "anuncio01/B-conversacion.mp4", inicio: 35.5, velocidad: 1.5, claves: [{ f: 0, x: 0, y: 0.5, w: 0.47 }, { f: 60, x: 0, y: 0.52, w: 0.47 }, { f: 156, x: 0, y: 0.5, w: 0.47 }] },
  // 8 · El resto de la conversación, acelerado, sobre el informe
  { d: 150, src: "anuncio01/B-conversacion.mp4", inicio: 43.3, velocidad: 16.8, claves: [{ f: 0, x: 0.41, y: 0.1, w: 0.58 }, { f: 150, x: 0.41, y: 0.36, w: 0.58 }] },
  // 9 · Exportar → PDF
  { d: 75, src: "anuncio01/C-documento-pdf.mp4", inicio: 10.8, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 0.5 }, { f: 75, x: 0, y: 0, w: 0.42 }] },
  // 10 · La hoja del PDF
  { d: 75, pdf: true },
  // 11 · Cierre
  { d: 95, cierre: true },
];
const inicioTramo = (n: number) => TRAMOS.slice(0, n).reduce((a, t) => a + t.d, 0);
const hasta = (n: number) => inicioTramo(n + 1);

const ROTULOS: [number, number, string][] = [
  [1, 2, "Abre una no conformidad."],
  [3, 3, "Cuéntalo con tus palabras."],
  [4, 5, "Evidran te pregunta lo que falta."],
  [6, 6, "Y si dices «fue un despiste»…"],
  [7, 7, "…Evidran busca el fallo del sistema."],
  [8, 8, "Y redacta el informe, campo a campo."],
  [9, 10, "Listo para la auditoría."],
];

// Segundos reales transcurridos en un fotograma global dado.
const relojEn = (frame: number) => {
  for (let n = 0; n < TRAMOS.length; n++) {
    const t = TRAMOS[n];
    const ini = inicioTramo(n);
    if (frame < ini || frame >= ini + t.d) continue;
    if (!t.src || !(t.src in T0)) return n < 1 ? null : FIN;
    const seg = T0[t.src] + t.inicio! + ((frame - ini) / 30) * t.velocidad! - CERO;
    return Math.max(0, Math.min(seg, FIN));
  }
  return FIN;
};

const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const a = (d: number) => interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  const tachado = interpolate(f, [30, 44], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center" }}>
      <div style={{ fontSize: 50, fontWeight: 700, opacity: a(0) * 0.75, letterSpacing: 1 }}>CAUSA RAÍZ:</div>
      <div style={{ position: "relative", marginTop: 18, fontSize: 118, fontWeight: 850, letterSpacing: -3, opacity: a(4), transform: `scale(${0.94 + 0.06 * a(4)})` }}>
        «Error humano»
        <div style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `calc(${tachado}% + 20px)`, backgroundColor: "#E5484D", borderRadius: 6 }} />
      </div>
      <div style={{ marginTop: 70, fontSize: 62, fontWeight: 800, color: tema.enfasis, opacity: a(50), transform: `translateY(${(1 - a(50)) * 20}px)` }}>
        Tu auditor ya se lo sabe.
      </div>
    </AbsoluteFill>
  );
};

export const Anuncio01Gancho: React.FC<Anuncio01Props> = ({ tema }) => (
  <TemaCtx.Provider value={TEMAS[tema]}>
    <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
      <style>{fuentes}</style>
      {TRAMOS.map((t, n) => (
        <Sequence key={n} from={inicioTramo(n)} durationInFrames={t.d}>
          {t.gancho && <Gancho />}
          {t.src && (
            <Tarjeta alto={ALTO_TARJETA}>
              <Encuadre src={t.src} inicio={t.inicio!} velocidad={t.velocidad!} claves={t.claves} duracion={t.d} ancho={ANCHO} />
            </Tarjeta>
          )}
          {t.pdf && <HojaPdf alto={ALTO_TARJETA} />}
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
      <Sequence from={inicioTramo(1)} durationInFrames={hasta(10) - inicioTramo(1)}>
        <RelojGlobal desde={inicioTramo(1)} />
      </Sequence>
    </AbsoluteFill>
  </TemaCtx.Provider>
);

// El reloj se pinta con el fotograma global (el de la Sequence empieza en 0).
const RelojGlobal: React.FC<{ desde: number }> = ({ desde }) => {
  const f = useCurrentFrame();
  return <RelojPuro f={f + desde} />;
};
const RelojPuro: React.FC<{ f: number }> = ({ f }) => {
  const tema = React.useContext(TemaCtx);
  const s = relojEn(f);
  if (s === null) return null;
  const entra = interpolate(f, [inicioTramo(1), inicioTramo(1) + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const parado = s >= FIN - 0.01;
  const mm = Math.floor(s / 60);
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: BANDA + ALTO_TARJETA + 22, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: entra, fontFamily: FUENTE, color: tema.texto }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: parado ? "#15B8A6" : "#E5484D", opacity: parado || Math.floor(f / 15) % 2 === 0 ? 1 : 0.35 }} />
      <div style={{ fontSize: 46, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: 1 }}>
        {mm}:{ss}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.75 }}>
        {parado ? "expediente redactado · tiempo real de esta grabación" : "tiempo real de esta grabación"}
      </div>
    </div>
  );
};

export const DURACION_GANCHO = inicioTramo(TRAMOS.length);
