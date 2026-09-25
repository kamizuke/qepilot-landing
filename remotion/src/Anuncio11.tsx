// Anuncio 11 de Meta Ads · objeción «si ya uso ChatGPT, ¿esto qué hace?».
// La calidad no se queda repartida en ventanas de chat: vive en Evidran.
// Tomas grabadas en la org demo Inyectados Rívora (public/anuncio11/).
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

const ALTO_TARJETA = 1000;
const ANCHO = 1000;
const L = "anuncio11/L-cerebro.mp4";
const M = "anuncio11/M-copiloto.mp4";
const PANEL: Clave = { f: 0, x: 0.56, y: 0.64, w: 0.44 };

type Tramo = {
  d: number;
  src?: string;
  inicio?: number;
  velocidad?: number;
  claves?: Clave[];
  gancho?: boolean;
  ventanas?: boolean;
  frase?: boolean;
  cierre?: boolean;
};

const TRAMOS: Tramo[] = [
  { d: 110, gancho: true },
  { d: 120, ventanas: true },
  // Panel de calidad: cada NC con estado, responsable y plazo
  { d: 135, src: L, inicio: 0.5, velocidad: 1, claves: [{ f: 0, x: 0, y: 0, w: 1 }, { f: 135, x: 0.19, y: 0.2, w: 0.81 }] },
  // Casos anteriores: buscar «clip» y ver causa y solución
  { d: 212, src: L, inicio: 5.8, velocidad: 1.3, claves: [{ f: 0, x: 0.08, y: 0, w: 0.92 }, { f: 60, x: 0.18, y: 0.07, w: 0.62 }, { f: 212, x: 0.18, y: 0.07, w: 0.62 }] },
  // Copiloto: la pregunta (×2)
  { d: 120, src: M, inicio: 1.5, velocidad: 2, claves: [{ f: 0, x: 0.3, y: 0.3, w: 0.7 }, { ...PANEL, f: 40 }, { ...PANEL, f: 120 }] },
  // Copiloto: la respuesta, para leerla (la espera de unos 16 s se corta; se entra ya en la lista de lo vencido)
  { d: 150, src: M, inicio: 29.5, velocidad: 1, claves: [{ f: 0, x: 0.66, y: 0.655, w: 0.34 }, { f: 150, x: 0.66, y: 0.655, w: 0.34 }] },
  { d: 90, frase: true },
  { d: 95, cierre: true },
];
const inicioTramo = (n: number) => TRAMOS.slice(0, n).reduce((a, t) => a + t.d, 0);
const hasta = (n: number) => inicioTramo(n + 1);

const ROTULOS: [number, number, string][] = [
  [1, 1, "Tu calidad, repartida en conversaciones sueltas."],
  [2, 2, "En Evidran, cada NC en su sitio."],
  [3, 3, "¿Ya os pasó? Mira cómo se resolvió."],
  [4, 4, "Pregúntale qué hay pendiente."],
  [5, 5, "Evidran se acuerda por ti."],
];

const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const a = (d: number) => interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center", padding: "0 70px" }}>
      <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.2, opacity: a(0) * 0.85 }}>
        Esa NC que redactaste
        <br />
        con ChatGPT en marzo…
      </div>
      <div style={{ marginTop: 60, fontSize: 118, fontWeight: 850, letterSpacing: -3, lineHeight: 1.02, color: tema.enfasis, opacity: a(40), transform: `scale(${0.94 + 0.06 * a(40)})` }}>
        ¿En qué ventana está?
      </div>
    </AbsoluteFill>
  );
};

// Ventanas de chat genéricas (sin marca) que se van amontonando.
const TITULOS = [
  "NC rebaba · borrador",
  "Causa raíz clip RV-330",
  "8D reclamación cliente",
  "Nueva conversación",
  "¿Cómo redacto la eficacia?",
  "Acta revisión dirección",
  "NC proveedor anodizado",
  "Nueva conversación",
];
const Ventanas: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {TITULOS.map((t, i) => {
        const ini = i * 9;
        const p = interpolate(f, [ini, ini + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
        const x = 30 + ((i * 197) % 500);
        const y = BANDA + 20 + ((i * 131) % 560);
        const giro = ((i % 3) - 1) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 520,
              height: 360,
              opacity: p,
              transform: `translateY(${(1 - p) * 60}px) rotate(${giro}deg) scale(${0.9 + 0.1 * p})`,
              backgroundColor: "#fff",
              borderRadius: 18,
              boxShadow: "0 24px 60px rgba(21,48,74,.22), 0 0 0 1px rgba(21,48,74,.12)",
              overflow: "hidden",
              fontFamily: FUENTE,
            }}
          >
            <div style={{ height: 52, backgroundColor: "#EEF0F3", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
              {["#E5484D", "#F5A524", "#30A46C"].map((c) => (
                <div key={c} style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: c }} />
              ))}
              <div style={{ marginLeft: 12, fontSize: 22, fontWeight: 700, color: "#3B4A5A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ alignSelf: "flex-end", width: "62%", height: 40, borderRadius: 14, backgroundColor: "#DDE3EA" }} />
              <div style={{ width: "86%", height: 18, borderRadius: 9, backgroundColor: "#E7EAEE" }} />
              <div style={{ width: "74%", height: 18, borderRadius: 9, backgroundColor: "#E7EAEE" }} />
              <div style={{ width: "80%", height: 18, borderRadius: 9, backgroundColor: "#E7EAEE" }} />
              <div style={{ alignSelf: "flex-end", width: "48%", height: 40, borderRadius: 14, backgroundColor: "#DDE3EA" }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Frase: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const a = (d: number) => interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center", padding: "0 80px" }}>
      <div style={{ fontSize: 84, fontWeight: 850, letterSpacing: -2, lineHeight: 1.08, opacity: a(0) }}>
        Tu calidad no cabe en una ventana de&nbsp;chat.
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

export const Anuncio11: React.FC<Anuncio01Props> = ({ tema }) => (
  <TemaCtx.Provider value={TEMAS[tema]}>
    <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
      <style>{fuentes}</style>
      {TRAMOS.map((t, n) => (
        <Sequence key={n} from={inicioTramo(n)} durationInFrames={t.d}>
          {t.gancho && <Gancho />}
          {t.ventanas && <Ventanas />}
          {t.src && (
            <>
              <Tarjeta alto={ALTO_TARJETA}>
                <Encuadre src={t.src} inicio={t.inicio!} velocidad={t.velocidad!} claves={t.claves} duracion={t.d} ancho={ANCHO} />
              </Tarjeta>
              <Aviso />
            </>
          )}
          {t.frase && <Frase />}
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

export const DURACION_ANUNCIO11 = inicioTramo(TRAMOS.length);
