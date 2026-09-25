// Anuncio 3 de Meta Ads · «Auditoría en 21 días»: el copiloto responde qué falta.
// Guion: ochod-demo/lanzamiento/26-meta-ads/02-guiones-y-textos.md (anuncio 3).
// Toma grabada en la org demo Inyectados Rívora (public/anuncio03/K-copiloto.mp4).
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  Anuncio01Props,
  BANDA,
  Cierre,
  Clave,
  Encuadre,
  FUENTE,
  Rotulo,
  TEMAS,
  Tarjeta,
  TemaCtx,
  fuentes,
  suave,
} from "./Anuncio01";

const SRC = "anuncio03/K-copiloto.mp4";
const ALTO_TARJETA = 1000;
const ANCHO = 1000;
const PANEL: Clave = { f: 0, x: 0.56, y: 0.64, w: 0.44 };

type Tramo = { d: number; inicio?: number; velocidad?: number; claves?: Clave[]; gancho?: boolean; cierre?: boolean };

const TRAMOS: Tramo[] = [
  // 0 · Gancho
  { d: 105, gancho: true },
  // 1 · Panel → abrir el Copiloto
  { d: 90, inicio: 1.0, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 1 }, { f: 40, x: 0, y: 0, w: 1 }, { ...PANEL, f: 90 }] },
  // 2 · Escribir la pregunta (×2)
  { d: 113, inicio: 4.0, velocidad: 2, claves: [{ ...PANEL, f: 0 }, { ...PANEL, f: 113 }] },
  // 3 · «Evidran está pensando…» (la espera real, unos 20 s, se corta)
  { d: 45, inicio: 11.5, velocidad: 1, claves: [{ ...PANEL, f: 0 }, { ...PANEL, f: 45 }] },
  // 4 · El principio de la respuesta, para leerlo
  { d: 105, inicio: 53.3, velocidad: 1, claves: [{ f: 0, x: 0.66, y: 0.655, w: 0.34 }, { f: 105, x: 0.66, y: 0.655, w: 0.34 }] },
  // 5 · Bajar leyendo la respuesta (×2)
  { d: 108, inicio: 56.8, velocidad: 2, claves: [{ f: 0, x: 0.66, y: 0.655, w: 0.34 }, { f: 108, x: 0.66, y: 0.66, w: 0.34 }] },
  // 6 · Los enlaces y el clic
  { d: 135, inicio: 64.5, velocidad: 1, claves: [{ f: 0, x: 0.66, y: 0.66, w: 0.34 }, { f: 60, x: 0.62, y: 0.7, w: 0.38 }, { f: 135, x: 0.62, y: 0.7, w: 0.38 }] },
  // 7 · Se abre el expediente exacto
  { d: 84, inicio: 69.0, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 1 }, { f: 84, x: 0.4, y: 0.04, w: 0.6 }] },
  // 8 · Cierre
  { d: 95, cierre: true },
];
const inicioTramo = (n: number) => TRAMOS.slice(0, n).reduce((a, t) => a + t.d, 0);
const hasta = (n: number) => inicioTramo(n + 1);

const ROTULOS: [number, number, string][] = [
  [1, 2, "Pregúntale a Evidran."],
  [3, 3, "No adivina: consulta tus datos."],
  [4, 5, "Te dice qué falta, con tus datos reales."],
  [6, 7, "Un clic y estás en el expediente."],
];

const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const a = (d: number) => interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  // Cuenta atrás de 30 a 21 días.
  const dias = Math.round(interpolate(f, [6, 34], [30, 21], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave }));
  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center" }}>
      <div style={{ fontSize: 56, fontWeight: 700, opacity: a(0) * 0.8, letterSpacing: 1 }}>AUDITORÍA EN</div>
      <div style={{ marginTop: 6, fontSize: 210, fontWeight: 850, letterSpacing: -6, lineHeight: 1, opacity: a(2), fontVariantNumeric: "tabular-nums" }}>
        {dias} días
      </div>
      <div style={{ marginTop: 70, fontSize: 66, fontWeight: 800, color: tema.enfasis, opacity: a(48), transform: `translateY(${(1 - a(48)) * 20}px)` }}>
        ¿Sabes qué te falta?
      </div>
    </AbsoluteFill>
  );
};

const Aviso: React.FC = () => {
  const tema = React.useContext(TemaCtx);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: BANDA + ALTO_TARJETA + 30, textAlign: "center", fontFamily: FUENTE, fontSize: 28, fontWeight: 600, color: tema.texto, opacity: 0.7 }}>
      Datos de una empresa de demostración
    </div>
  );
};

export const Anuncio03: React.FC<Anuncio01Props> = ({ tema }) => (
  <TemaCtx.Provider value={TEMAS[tema]}>
    <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
      <style>{fuentes}</style>
      {TRAMOS.map((t, n) => (
        <Sequence key={n} from={inicioTramo(n)} durationInFrames={t.d}>
          {t.gancho && <Gancho />}
          {t.claves && (
            <>
              <Tarjeta alto={ALTO_TARJETA}>
                <Encuadre src={SRC} inicio={t.inicio!} velocidad={t.velocidad!} claves={t.claves} duracion={t.d} ancho={ANCHO} />
              </Tarjeta>
              <Aviso />
            </>
          )}
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

export const DURACION_ANUNCIO03 = inicioTramo(TRAMOS.length);
