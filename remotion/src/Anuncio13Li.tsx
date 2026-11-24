// Anuncio 13 para LinkedIn · «Del Excel a Evidran», en cuatro versiones que no parecen el mismo vídeo.
// Misma historia y mismas capturas reales (org de pruebas, 23/11/2026), pero cada versión con su
// estética, su ritmo visual, sus textos y su música:
//   editorial · crema, tipografía fina, tarjeta a la izquierda y paso numerado a la derecha · piano
//   noche     · azul noche, pantalla que se endereza en 3D, rótulo en cápsula abajo · electrónica
//   proceso   · blanco con retícula, barra de 4 pasos arriba y ventana de navegador · marimba
//   cifras    · azul de marca, números grandes a la izquierda, tarjeta a la derecha · cinematográfica
// Todas: 1920×1080, 32 s; el golpe de la música cae a los 8,5 s, cuando todo entra en Evidran.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cierre, FUENTE, TemaCtx, fuentes, suave } from "./Anuncio01";
import { Captura, Resalte } from "./Anuncio12";
import {
  ARCHIVO,
  ESTO_YA_PASO,
  MAPEO,
  PANEL,
  RESALTES_ARCHIVO,
  RESALTES_EYP,
  RESALTES_MAPEO,
  RESALTES_PANEL,
  RESULTADO,
} from "./Anuncio13";

export type Estilo = "editorial" | "noche" | "proceso" | "cifras";
export type Anuncio13LiProps = { estilo: Estilo };

const NAVY = "#15304A";
const AZUL = "#2563EB";
const CREMA = "#F7F6F2";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// 0→1 entre d y d+dur, con la curva suave de la marca.
const ap = (f: number, d: number, dur = 14) => interpolate(f, [d, d + dur], [0, 1], { ...cl, easing: suave });

// ---------- Montaje común (30 fps, 960 fotogramas) ----------
const INICIO = 290; // gancho + archivos sueltos; el rótulo «te lo traes» entra a los 196 y dura 3 s; a los 240 todo se junta
const T = {
  archivo: [290, 95],
  mapeo: [385, 110],
  resultado: [495, 60],
  panel: [555, 110],
  eyp: [665, 125],
  frase: [790, 75],
  cierre: [865, 95],
} as const;
const DURACION = 960;

// ---------- Iconos de línea (24×24, trazo redondeado) ----------
type NombreIcono =
  | "hoja"
  | "carpeta"
  | "documento"
  | "pdf"
  | "correo"
  | "imagen"
  | "subir"
  | "columnas"
  | "check"
  | "calendario"
  | "campana"
  | "historial";
const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  hoja: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </>
  ),
  carpeta: <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
  documento: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  pdf: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h2a1.5 1.5 0 0 1 0 3H8v-3Zm0 3v2" />
    </>
  ),
  correo: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-9 5.7a2 2 0 0 1-2 0L2 7" />
    </>
  ),
  imagen: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3-3a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  subir: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  columnas: <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />,
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </>
  ),
  campana: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0M2 8c0-2.2.7-4.3 2-6M22 8a10 10 0 0 0-2-6" />,
  historial: <path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8M3 3v5h5M12 7v5l4 2" />,
};
const Icono: React.FC<{ n: NombreIcono; t?: number; c?: string; g?: number }> = ({ n, t = 48, c = "currentColor", g = 1.8 }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={g} strokeLinecap="round" strokeLinejoin="round">
    {TRAZOS[n]}
  </svg>
);
// Icono dentro de un círculo de color.
const Insignia: React.FC<{ n: NombreIcono; t: number; fondo: string; c: string; g?: number }> = ({ n, t, fondo, c, g }) => (
  <div style={{ width: t, height: t, borderRadius: t, backgroundColor: fondo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Icono n={n} t={t * 0.5} c={c} g={g} />
  </div>
);

// ---------- Archivos sueltos (los mismos nombres en todas las versiones) ----------
type Archivo = { n: NombreIcono; nombre: string; color: string };
const ARCHIVOS: Archivo[] = [
  { n: "hoja", nombre: "Registro NC 2019-2026.xlsx", color: "#16A34A" },
  { n: "carpeta", nombre: "NC 2023", color: "#D97706" },
  { n: "documento", nombre: "Acciones correctivas 2024 (rev).docx", color: AZUL },
  { n: "pdf", nombre: "Informe NC-2024-012_firmado.pdf", color: "#DC2626" },
  { n: "correo", nombre: "RE: RE: cierre NC-2025-022", color: "#475569" },
  { n: "hoja", nombre: "Seguimiento acciones_v4.xlsx", color: "#16A34A" },
  { n: "carpeta", nombre: "Auditorías › 2025", color: "#D97706" },
  { n: "imagen", nombre: "lote_2302.jpg", color: "#7C3AED" },
];

// ---------- Pantallas: captura real con cámara y subrayados ----------
type Caja = { x: number; y: number; w: number; h: number };
type Foco = { cx: number; cy: number; w: number }; // centro (fracciones de la imagen) y ancho visible
type Paso = { k: keyof typeof T; cap: Captura; res: Resalte[]; de: Foco; a: Foco; icono: NombreIcono };
const PASOS: Paso[] = [
  { k: "archivo", cap: ARCHIVO, res: RESALTES_ARCHIVO, de: { cx: 0.5, cy: 0.5, w: 1 }, a: { cx: 0.47, cy: 0.33, w: 0.9 }, icono: "subir" },
  { k: "mapeo", cap: MAPEO, res: RESALTES_MAPEO, de: { cx: 0.5, cy: 0.3, w: 1 }, a: { cx: 0.495, cy: 0.52, w: 0.93 }, icono: "columnas" },
  {
    k: "resultado",
    cap: RESULTADO,
    res: [{ x: 0.0486, y: 0.536, w: 0.325, h: 0.075, f: 30, d: 10 }],
    de: { cx: 0.5, cy: 0.5, w: 1 },
    a: { cx: 0.3, cy: 0.5, w: 0.58 },
    icono: "check",
  },
  { k: "panel", cap: PANEL, res: RESALTES_PANEL, de: { cx: 0.5, cy: 0.4, w: 1 }, a: { cx: 0.5, cy: 0.45, w: 0.6 }, icono: "calendario" },
  { k: "eyp", cap: ESTO_YA_PASO, res: RESALTES_EYP, de: { cx: 0.55, cy: 0.45, w: 0.9 }, a: { cx: 0.695, cy: 0.42, w: 0.56 }, icono: "campana" },
];

const encuadre = (cap: Captura, caja: { w: number; h: number }, foco: Foco) => {
  const anchoImg = caja.w / foco.w;
  const altoImg = (anchoImg * cap.alto) / cap.ancho;
  const vh = caja.h / altoImg;
  const x = foco.w >= 1 ? -(foco.w - 1) / 2 : Math.min(Math.max(foco.cx - foco.w / 2, 0), 1 - foco.w);
  const y = vh >= 1 ? -(vh - 1) / 2 : Math.min(Math.max(foco.cy - vh / 2, 0), 1 - vh);
  return { x, y, w: foco.w };
};

type Entrada = "fundido" | "desliza" | "inclina" | "sube";
const Vista: React.FC<{
  paso: Paso;
  caja: Caja;
  marcador: string;
  radio?: number;
  sombra?: string;
  entrada?: Entrada;
  navegador?: React.ReactNode;
}> = ({ paso, caja, marcador, radio = 24, sombra = "0 30px 70px rgba(21,48,74,.22)", entrada = "fundido", navegador }) => {
  const f = useCurrentFrame();
  const barra = navegador ? 52 : 0;
  const interior = { w: caja.w, h: caja.h - barra };
  const e0 = encuadre(paso.cap, interior, paso.de);
  const e1 = encuadre(paso.cap, interior, paso.a);
  const t = interpolate(f, [6, 62], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const x = e0.x + (e1.x - e0.x) * t;
  const y = e0.y + (e1.y - e0.y) * t;
  const w = e0.w + (e1.w - e0.w) * t;
  const anchoImg = interior.w / w;
  const altoImg = (anchoImg * paso.cap.alto) / paso.cap.ancho;
  const ent = ap(f, 0, 16);
  const ent3d = ap(f, 0, 34);
  const mov: Record<Entrada, string> = {
    fundido: `scale(${0.985 + 0.015 * ent})`,
    desliza: `translateX(${(1 - ent) * 140}px)`,
    inclina: `perspective(1800px) rotateX(${(1 - ent3d) * 14}deg) rotateY(${(1 - ent3d) * -16}deg) scale(${0.9 + 0.1 * ent3d})`,
    sube: `translateY(${(1 - ent) * 70}px)`,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: caja.x,
        top: caja.y,
        width: caja.w,
        height: caja.h,
        borderRadius: radio,
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: sombra,
        opacity: entrada === "inclina" ? ap(f, 0, 10) : ent,
        transform: mov[entrada],
      }}
    >
      {navegador}
      <div style={{ position: "absolute", left: 0, top: barra, width: interior.w, height: interior.h, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: anchoImg, height: altoImg, left: -x * anchoImg, top: -y * altoImg }}>
          <Img src={staticFile(paso.cap.src)} style={{ width: "100%", height: "100%" }} />
          {paso.res.map((r, i) => {
            const p = interpolate(f, [r.f, r.f + r.d], [0, 1], cl);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${r.x * 100}%`,
                  top: `${r.y * 100}%`,
                  width: `${r.w * p * 100}%`,
                  height: `${r.h * 100}%`,
                  backgroundColor: marcador,
                  mixBlendMode: "multiply",
                  borderRadius: 4,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AvisoDemo: React.FC<{ x: number; y: number; color: string; ancho?: number; alinea?: "left" | "center" | "right" }> = ({ x, y, color, ancho = 600, alinea = "left" }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, textAlign: alinea, fontFamily: FUENTE, fontSize: 22, fontWeight: 500, color, opacity: ap(f, 8) * 0.9 }}>
      Datos de una empresa de demostración
    </div>
  );
};

// Los archivos vuelan al centro y aparece Evidran (local 225–262 dentro del inicio).
const junta = (f: number) => interpolate(f, [222, 250], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
const Isotipo: React.FC<{ cx: number; cy: number; t: number; f: number; halo?: string }> = ({ cx, cy, t, f, halo }) => {
  const a = ap(f, 244, 16);
  const s = interpolate(f, [244, 256, 266], [0.4, 1.12, 1], { ...cl, easing: suave });
  return (
    <div style={{ position: "absolute", left: cx - t / 2, top: cy - t / 2, width: t, height: t, opacity: a, transform: `scale(${s})` }}>
      {halo && (
        <div style={{ position: "absolute", inset: -t * 0.35, borderRadius: "50%", background: `radial-gradient(circle, ${halo} 0%, transparent 65%)` }} />
      )}
      <Img src={staticFile("anuncio12/evidran-isotipo.svg")} style={{ position: "absolute", inset: 0, width: t, height: t }} />
    </div>
  );
};

// =====================================================================
// 1 · EDITORIAL (crema, tipografía fina, piano)
// =====================================================================
const ED = { fondo: CREMA, texto: NAVY, enfasis: AZUL, suave: "#4B6179", chip: "#E3ECFD" };

const EditorialInicio: React.FC = () => {
  const f = useCurrentFrame();
  const salida = 1 - ap(f, 108, 12);
  const lineas: [NombreIcono, string][] = [
    ["hoja", "Años de NC en un Excel."],
    ["carpeta", "Los informes, en carpetas."],
    ["documento", "Las acciones, en Word."],
  ];
  const titulo2 = f >= 196; // 3 s en pantalla, hasta el primer paso
  const j = junta(f);
  return (
    <AbsoluteFill style={{ backgroundColor: ED.fondo, fontFamily: FUENTE, color: ED.texto }}>
      {f < 122 && (
        <div style={{ position: "absolute", left: 200, top: 250, opacity: salida }}>
          {lineas.map(([n, txt], i) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 26, opacity: ap(f, i * 14), transform: `translateX(${(1 - ap(f, i * 14)) * -30}px)` }}>
              <Insignia n={n} t={72} fondo={ED.chip} c={ED.enfasis} />
              <span style={{ fontSize: 52, fontWeight: 500 }}>{txt}</span>
            </div>
          ))}
          <div style={{ marginTop: 60, fontSize: 132, fontWeight: 300, letterSpacing: -4, lineHeight: 1, opacity: ap(f, 56, 16) }}>
            ¿Y ahora, empezar <span style={{ color: ED.enfasis, fontWeight: 750 }}>de cero?</span>
          </div>
        </div>
      )}
      {f >= 118 && (
        <>
          <div style={{ position: "absolute", left: 200, top: 120, fontSize: 64, fontWeight: titulo2 ? 750 : 300, letterSpacing: -1.5, opacity: ap(f, 122) }}>
            {titulo2 ? (
              <>
                No empiezas de cero: <span style={{ color: ED.enfasis }}>te lo traes.</span>
              </>
            ) : (
              "Lo que tu sistema sabe, repartido en archivos."
            )}
          </div>
          {ARCHIVOS.map((a, i) => {
            const col = i % 4;
            const fila = Math.floor(i / 4);
            const x0 = 200 + col * 390;
            const y0 = 420 + fila * 170;
            const x = x0 + (960 - 180 - x0) * j;
            const y = y0 + (640 - 55 - y0) * j;
            const ent = ap(f, 128 + i * 7, 12);
            return (
              <div
                key={a.nombre}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 360,
                  height: 110,
                  borderRadius: 18,
                  backgroundColor: "#fff",
                  boxShadow: "0 14px 36px rgba(21,48,74,.12), 0 0 0 1px rgba(21,48,74,.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "0 24px",
                  opacity: ent * (1 - j),
                  transform: `translateY(${(1 - ent) * 24}px) scale(${1 - 0.8 * j})`,
                }}
              >
                <Insignia n={a.n} t={58} fondo={`${a.color}1A`} c={a.color} />
                <span style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.2 }}>{a.nombre}</span>
              </div>
            );
          })}
          <Isotipo cx={960} cy={640} t={230} f={f} />
        </>
      )}
    </AbsoluteFill>
  );
};

const ED_TEXTOS: Record<Paso["k"], [string, string]> = {
  archivo: ["Súbelo tal cual.", "Excel o CSV, como lo tengas, aunque lleve un título encima."],
  mapeo: ["Evidran propone qué columna va dónde.", "Tú lo revisas y cambias lo que haga falta."],
  resultado: ["Tu histórico, dentro.", "Los 12 expedientes del registro, importados."],
  panel: ["Con su código y su fecha real.", "Cada NC conserva su número y el día en que se abrió."],
  eyp: ["Y te recuerda cómo lo resolvisteis.", "Al abrir una NC parecida, te enseña la anterior y su acción."],
  frase: ["", ""],
  cierre: ["", ""],
};

const EditorialPaso: React.FC<{ paso: Paso; i: number }> = ({ paso, i }) => {
  const f = useCurrentFrame();
  const [titulo, sub] = ED_TEXTOS[paso.k];
  return (
    <AbsoluteFill style={{ backgroundColor: ED.fondo, fontFamily: FUENTE, color: ED.texto }}>
      <Vista paso={paso} caja={{ x: 90, y: 100, w: 1160, h: 860 }} marcador="rgba(116,179,163,0.55)" entrada="sube" />
      <AvisoDemo x={90} y={982} color={ED.suave} />
      <div style={{ position: "absolute", left: 1320, top: 0, width: 520, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 150, fontWeight: 200, color: ED.enfasis, opacity: 0.35 * ap(f, 0), letterSpacing: -6, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
        <div style={{ marginTop: 30, opacity: ap(f, 6), transform: `scale(${0.8 + 0.2 * ap(f, 6)})`, transformOrigin: "left center" }}>
          <Insignia n={paso.icono} t={92} fondo={ED.enfasis} c="#fff" g={2} />
        </div>
        <div style={{ marginTop: 38, fontSize: 60, fontWeight: 750, letterSpacing: -1.5, lineHeight: 1.08, opacity: ap(f, 12), transform: `translateY(${(1 - ap(f, 12)) * 20}px)` }}>
          {titulo}
        </div>
        <div style={{ marginTop: 26, width: 64, height: 4, borderRadius: 2, backgroundColor: ED.enfasis, opacity: ap(f, 20) }} />
        <div style={{ marginTop: 26, fontSize: 32, fontWeight: 500, color: ED.suave, lineHeight: 1.35, opacity: ap(f, 22) }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

const EditorialFrase: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: ED.fondo, fontFamily: FUENTE, color: ED.texto, justifyContent: "center", paddingLeft: 200 }}>
      <div style={{ fontSize: 120, fontWeight: 250, letterSpacing: -4, opacity: ap(f, 0) }}>No empiezas de cero.</div>
      <div style={{ fontSize: 120, fontWeight: 750, letterSpacing: -4, color: ED.enfasis, marginTop: 10, opacity: ap(f, 16), transform: `translateX(${(1 - ap(f, 16)) * 40}px)` }}>
        Empiezas con todo lo que ya&nbsp;sabes.
      </div>
    </AbsoluteFill>
  );
};

// =====================================================================
// 2 · NOCHE (azul noche, 3D, electrónica)
// =====================================================================
const NO = { fondo: "#0B1B2E", texto: "#FFFFFF", enfasis: "#60A5FA", suave: "#94A3B8", claro: "#CBD5E1" };
const fondoNoche = `radial-gradient(ellipse at 50% 25%, #16355C 0%, ${NO.fondo} 62%)`;

const NocheInicio: React.FC = () => {
  const f = useCurrentFrame();
  const salida = 1 - ap(f, 108, 12);
  const j = junta(f);
  return (
    <AbsoluteFill style={{ background: fondoNoche, fontFamily: FUENTE, color: NO.texto }}>
      {f < 122 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: salida }}>
          <div style={{ fontSize: 136, fontWeight: 800, letterSpacing: -4, opacity: ap(f, 0, 18), filter: `blur(${(1 - ap(f, 0, 18)) * 12}px)` }}>¿Esto no nos pasó ya?</div>
          <div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 24, opacity: ap(f, 40), transform: `translateY(${(1 - ap(f, 40)) * 20}px)` }}>
            <div style={{ filter: "drop-shadow(0 0 18px rgba(96,165,250,.8))" }}>
              <Icono n="carpeta" t={64} c={NO.enfasis} g={1.6} />
            </div>
            <span style={{ fontSize: 50, fontWeight: 500, color: NO.claro }}>La respuesta está en una carpeta de 2023.</span>
          </div>
        </AbsoluteFill>
      )}
      {f >= 118 && (
        <>
          {ARCHIVOS.map((a, i) => {
            const col = i % 4;
            const fila = Math.floor(i / 4);
            const x0 = 330 + col * 330;
            const y0 = 170 + fila * 310;
            const x = x0 + (960 - 130 - x0) * j;
            const y = y0 + (500 - 130 - y0) * j;
            const ent = ap(f, 124 + i * 7, 14);
            return (
              <div
                key={a.nombre}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 260,
                  opacity: ent * (1 - j),
                  transform: `scale(${(0.85 + 0.15 * ent) * (1 - 0.7 * j)})`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 150,
                    height: 150,
                    margin: "0 auto",
                    borderRadius: 34,
                    backgroundColor: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(148,197,255,.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 ${30 * ent}px rgba(96,165,250,.25)`,
                  }}
                >
                  <Icono n={a.n} t={76} c={NO.enfasis} g={1.5} />
                </div>
                <div style={{ marginTop: 18, fontSize: 22, fontWeight: 500, color: NO.claro, lineHeight: 1.25 }}>{a.nombre}</div>
              </div>
            );
          })}
          <Isotipo cx={960} cy={500} t={240} f={f} halo="rgba(96,165,250,.45)" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontSize: 58, fontWeight: 750, letterSpacing: -1, opacity: ap(f, 132) }}>
            {f < 196 ? (
              "Todo lo que sabe tu sistema, repartido en carpetas."
            ) : (
              <>
                Tráelo a Evidran. <span style={{ color: NO.enfasis }}>Sin empezar de cero.</span>
              </>
            )}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

const NO_TEXTOS: Record<Paso["k"], string> = {
  archivo: "Tu Excel, tal cual lo tienes.",
  mapeo: "Evidran propone dónde va cada columna.",
  resultado: "Tu histórico, importado.",
  panel: "Con su código y su fecha real.",
  eyp: "Y la próxima vez, te recuerda cómo se resolvió.",
  frase: "",
  cierre: "",
};

const NochePaso: React.FC<{ paso: Paso; i: number }> = ({ paso, i }) => {
  const f = useCurrentFrame();
  const prog = interpolate(f, [0, 30], [i / 5, (i + 1) / 5], { ...cl, easing: suave });
  return (
    <AbsoluteFill style={{ background: fondoNoche, fontFamily: FUENTE, color: NO.texto }}>
      <Vista
        paso={paso}
        caja={{ x: 230, y: 60, w: 1460, h: 770 }}
        marcador="rgba(116,179,163,0.6)"
        entrada="inclina"
        radio={20}
        sombra="0 50px 140px rgba(37,99,235,.35), 0 0 0 1px rgba(148,197,255,.25)"
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "18px 44px 18px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,.06)",
            border: "1px solid rgba(148,197,255,.22)",
            opacity: ap(f, 8),
            transform: `translateY(${(1 - ap(f, 8)) * 30}px)`,
          }}
        >
          <Insignia n={paso.icono} t={76} fondo={AZUL} c="#fff" g={2} />
          <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: -0.5 }}>{NO_TEXTOS[paso.k]}</span>
        </div>
      </div>
      {/* barra de avance fina al pie */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${prog * 100}%`, background: `linear-gradient(90deg, ${AZUL}, ${NO.enfasis})` }} />
      <AvisoDemo x={1220} y={1030} color={NO.suave} ancho={600} alinea="right" />
    </AbsoluteFill>
  );
};

const NocheFrase: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: fondoNoche, fontFamily: FUENTE, color: NO.texto, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ opacity: ap(f, 0), filter: "drop-shadow(0 0 26px rgba(96,165,250,.8))", marginBottom: 40 }}>
        <Icono n="campana" t={110} c={NO.enfasis} g={1.5} />
      </div>
      <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05, opacity: ap(f, 6) }}>Lo que estaba en una carpeta,</div>
      <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05, color: NO.enfasis, opacity: ap(f, 20) }}>ahora te avisa.</div>
    </AbsoluteFill>
  );
};

// =====================================================================
// 3 · PROCESO (blanco con retícula, barra de pasos, ventana de navegador, marimba)
// =====================================================================
const PR = { fondo: "#FFFFFF", texto: NAVY, enfasis: AZUL, suave: "#64748B", linea: "#E2E8F0" };
const fondoProceso = `radial-gradient(circle, #D9E1EC 1.6px, transparent 1.8px) 0 0 / 34px 34px, ${PR.fondo}`;
const ETAPAS: [NombreIcono, string][] = [
  ["subir", "Sube"],
  ["columnas", "Revisa"],
  ["check", "Importa"],
  ["campana", "Aprovecha"],
];
const ETAPA_DE: Record<Paso["k"], number> = { archivo: 0, mapeo: 1, resultado: 2, panel: 2, eyp: 3, frase: 4, cierre: 4 };
const NODO_X = (i: number) => 540 + i * 280;

const Etapas: React.FC<{ activa: number; desde: number; aparece?: number; y?: number }> = ({ activa, desde, aparece = -100, y = 48 }) => {
  const f = useCurrentFrame();
  const avance = interpolate(f, [0, 22], [desde, Math.min(activa, 3)], { ...cl, easing: suave });
  const vis = aparece < 0 ? 1 : ap(f, aparece, 16);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1920, height: 150, opacity: vis, fontFamily: FUENTE }}>
      <div style={{ position: "absolute", left: NODO_X(0), top: 38, width: NODO_X(3) - NODO_X(0), height: 4, borderRadius: 2, backgroundColor: PR.linea }} />
      <div style={{ position: "absolute", left: NODO_X(0), top: 38, width: (NODO_X(3) - NODO_X(0)) * (avance / 3), height: 4, borderRadius: 2, backgroundColor: PR.enfasis }} />
      {ETAPAS.map(([n, txt], i) => {
        const hecha = i < activa;
        const actual = i === activa;
        const on = hecha || actual;
        return (
          <div key={txt} style={{ position: "absolute", left: NODO_X(i) - 40, top: 0, width: 80, textAlign: "center" }}>
            {actual && (
              <div style={{ position: "absolute", left: -10, top: -10, width: 100, height: 100, borderRadius: 100, backgroundColor: "rgba(37,99,235,.14)", transform: `scale(${0.8 + 0.2 * Math.sin(f / 6) ** 2})` }} />
            )}
            <div style={{ position: "relative" }}>
              <Insignia n={hecha ? "check" : n} t={80} fondo={on ? PR.enfasis : "#fff"} c={on ? "#fff" : "#94A3B8"} g={2} />
              {!on && <div style={{ position: "absolute", inset: 0, borderRadius: 80, border: `2px solid ${PR.linea}` }} />}
            </div>
            <div style={{ marginTop: 12, marginLeft: -40, width: 160, fontSize: 24, fontWeight: on ? 700 : 500, color: on ? PR.texto : PR.suave }}>{txt}</div>
          </div>
        );
      })}
    </div>
  );
};

const Navegador: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 52, backgroundColor: "#F1F5F9", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 20px", gap: 10, fontFamily: FUENTE }}>
    {["#F87171", "#FBBF24", "#34D399"].map((c) => (
      <div key={c} style={{ width: 14, height: 14, borderRadius: 14, backgroundColor: c }} />
    ))}
    <div style={{ marginLeft: 24, padding: "6px 22px", borderRadius: 8, backgroundColor: "#fff", border: "1px solid #E2E8F0", fontSize: 20, color: "#475569" }}>app.evidran.com</div>
    <div style={{ marginLeft: "auto", fontSize: 18, color: "#94A3B8" }}>Datos de una empresa de demostración</div>
  </div>
);

const FILAS: string[][] = [
  ["NC-2023-007", "2023-02-14", "Mecanizado", "Casquillos con el diámetro interior fuera de tolerancia en…", "Cerrada"],
  ["NC-2023-019", "2023-05-22", "Compras", "Barras de acero F-1140 recibidas con un certificado de mat…", "Cerrada"],
  ["NC-2023-031", "2023-09-12", "Calidad", "Micrómetro de exteriores con la calibración caducada en us…", "Cerrada"],
  ["NC-2024-004", "2024-01-29", "Expedición", "Ejes entregados con óxido superficial tras un envío de dos…", "Cerrada"],
  ["NC-2024-012", "2024-03-18", "Mecanizado", "Rebabas en el taladro transversal de los ejes ref. 4471", "Cerrada"],
  ["NC-2024-027", "2024-06-11", "Compras", "Dureza por debajo de especificación en bulones tratados po…", "Cerrada"],
  ["NC-2024-038", "2024-09-24", "Mecanizado", "Casquillos con rugosidad fuera de especificación en el tor…", "Cerrada"],
  ["NC-2025-006", "2025-02-03", "Almacén", "Dos referencias de casquillo mezcladas en la misma ubicaci…", "Cerrada"],
];
const COLS = [210, 200, 190, 640, 140];

const ProcesoInicio: React.FC = () => {
  const f = useCurrentFrame();
  // La hoja se encoge y vuela al primer paso (local 222–250).
  const j = junta(f);
  const cx = 960 + (NODO_X(0) - 960) * j;
  const cy = 600 + (88 - 600) * j;
  const s = 1 - 0.94 * j;
  return (
    <AbsoluteFill style={{ background: fondoProceso, fontFamily: FUENTE, color: PR.texto }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: f < 236 ? 70 : 250, textAlign: "center", fontSize: 66, fontWeight: 750, letterSpacing: -1.5, opacity: f < 236 ? 1 - ap(f, 222, 12) : ap(f, 238, 12) }}>
        {f < 120 ? (
          <span style={{ opacity: ap(f, 0) }}>Tienes años de NC en un Excel.</span>
        ) : (
          <span style={{ opacity: ap(f, 120) }}>
            No empieces de cero: <span style={{ color: PR.enfasis }}>tráelo tal cual.</span>
          </span>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: cx - 700,
          top: cy - 330,
          width: 1400,
          height: 660,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 30px 80px rgba(21,48,74,.18), 0 0 0 1px rgba(21,48,74,.08)",
          transform: `scale(${s})`,
          opacity: ap(f, 4, 16) * (1 - ap(f, 244, 8)),
        }}
      >
        <div style={{ height: 64, backgroundColor: "#15803D", color: "#fff", display: "flex", alignItems: "center", gap: 16, padding: "0 26px", fontSize: 26, fontWeight: 650 }}>
          <Icono n="hoja" t={34} c="#fff" g={2} />
          Registro NC 2019-2026.xlsx
        </div>
        <div style={{ display: "flex", backgroundColor: "#F0FDF4", borderBottom: "2px solid #BBF7D0", fontSize: 21, fontWeight: 700, color: "#166534" }}>
          {["Nº de NC", "Fecha de detección", "Área", "Descripción de la no conformidad", "Estado"].map((h, k) => (
            <div key={h} style={{ width: COLS[k], padding: "14px 18px", flexShrink: 0 }}>
              {h}
            </div>
          ))}
        </div>
        {FILAS.map((r, i) => (
          <div key={r[0]} style={{ display: "flex", borderBottom: "1px solid #E5E7EB", fontSize: 21, color: "#1F2937", opacity: ap(f, 14 + i * 7, 8) }}>
            {r.map((c, k) => (
              <div key={k} style={{ width: COLS[k], padding: "15px 18px", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Isotipo cx={960} cy={560} t={220} f={f} halo="rgba(37,99,235,.18)" />
      <Etapas activa={0} desde={0} aparece={236} />
    </AbsoluteFill>
  );
};

const PR_TEXTOS: Record<Paso["k"], string> = {
  archivo: "Sube tu Excel o CSV tal cual.",
  mapeo: "Revisa las columnas que propone Evidran.",
  resultado: "Importa tu histórico.",
  panel: "Cada NC, con su código y su fecha real.",
  eyp: "Y desde ese día, te recuerda lo que ya pasó.",
  frase: "",
  cierre: "",
};

const ProcesoPaso: React.FC<{ paso: Paso; i: number }> = ({ paso }) => {
  const f = useCurrentFrame();
  const activa = ETAPA_DE[paso.k];
  const anterior = paso.k === "archivo" ? 0 : ETAPA_DE[PASOS[PASOS.indexOf(paso) - 1].k];
  return (
    <AbsoluteFill style={{ background: fondoProceso, fontFamily: FUENTE, color: PR.texto }}>
      <Etapas activa={activa} desde={anterior} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 208, textAlign: "center", fontSize: 54, fontWeight: 750, letterSpacing: -1, opacity: ap(f, 4), transform: `translateY(${(1 - ap(f, 4)) * 14}px)` }}>
        {PR_TEXTOS[paso.k]}
      </div>
      <Vista
        paso={paso}
        caja={{ x: 290, y: 300, w: 1340, h: 740 }}
        marcador="rgba(37,99,235,0.22)"
        entrada="fundido"
        radio={16}
        sombra="0 30px 80px rgba(21,48,74,.16), 0 0 0 1px rgba(21,48,74,.10)"
        navegador={<Navegador />}
      />
    </AbsoluteFill>
  );
};

const ProcesoFrase: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: fondoProceso, fontFamily: FUENTE, color: PR.texto }}>
      <Etapas activa={4} desde={3} y={170} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}>
        <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, opacity: ap(f, 10) }}>Sube tu Excel.</div>
        <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, color: PR.enfasis, opacity: ap(f, 24) }}>Tu histórico empieza a&nbsp;trabajar.</div>
      </div>
    </AbsoluteFill>
  );
};

// =====================================================================
// 4 · CIFRAS (azul de marca, números grandes, cinematográfica)
// =====================================================================
const CI = { fondo: AZUL, texto: "#FFFFFF", cifra: "#FDE68A", suave: "#DCE7FD" };
const fondoCifras = `linear-gradient(135deg, #2F6BF0 0%, ${AZUL} 45%, #1D4ED8 100%)`;
const cuenta = (f: number, d: number, n: number, dur = 20) => Math.round(interpolate(f, [d, d + dur], [0, n], { ...cl, easing: Easing.out(Easing.cubic) }));

const CifrasInicio: React.FC = () => {
  const f = useCurrentFrame();
  const salida = 1 - ap(f, 108, 12);
  const giro = interpolate(f, [222, 246], [0, 90], { ...cl, easing: Easing.in(Easing.cubic) });
  const tiles: [NombreIcono, number, string][] = [
    ["hoja", 1, "Excel con todo el registro"],
    ["carpeta", 12, "NC cerradas, con su causa y su acción"],
    ["campana", 0, "avisos cuando algo se repite"],
  ];
  return (
    <AbsoluteFill style={{ background: fondoCifras, fontFamily: FUENTE, color: CI.texto }}>
      {f < 122 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: salida }}>
          <div style={{ display: "flex", gap: 70 }}>
            {["2023", "2024", "2025"].map((a, i) => (
              <div
                key={a}
                style={{
                  fontSize: 210,
                  fontWeight: 900,
                  letterSpacing: -8,
                  color: CI.cifra,
                  opacity: ap(f, i * 12, 8),
                  transform: `scale(${1.35 - 0.35 * ap(f, i * 12, 10)})`,
                }}
              >
                {a}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, fontSize: 66, fontWeight: 750, letterSpacing: -1.5, opacity: ap(f, 44) }}>Tres años de no conformidades.</div>
          <div style={{ marginTop: 6, fontSize: 66, fontWeight: 400, color: CI.suave, opacity: ap(f, 60) }}>En un Excel.</div>
        </AbsoluteFill>
      )}
      {f >= 118 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontSize: 64, fontWeight: 800, letterSpacing: -1.5, opacity: ap(f, 122) }}>
            {f < 196 ? (
              "Lo que sabe tu sistema, en un Excel."
            ) : (
              <>
                Ahora, <span style={{ color: CI.cifra }}>dentro de Evidran.</span>
              </>
            )}
          </div>
          {tiles.map(([n, num, txt], i) => {
            const ent = ap(f, 128 + i * 10, 14);
            return (
              <div
                key={txt}
                style={{
                  position: "absolute",
                  left: 180 + i * 540,
                  top: 330,
                  width: 480,
                  height: 400,
                  borderRadius: 30,
                  padding: 44,
                  backgroundColor: "rgba(255,255,255,.10)",
                  border: "1px solid rgba(255,255,255,.22)",
                  opacity: ent,
                  transform: `perspective(1400px) translateY(${(1 - ent) * 40}px) rotateY(${giro}deg)`,
                }}
              >
                <Icono n={n} t={64} c="#fff" g={1.7} />
                <div style={{ marginTop: 26, fontSize: 150, fontWeight: 900, lineHeight: 1, letterSpacing: -5, color: CI.cifra }}>{cuenta(f, 132 + i * 10, num)}</div>
                <div style={{ marginTop: 18, fontSize: 34, fontWeight: 600, lineHeight: 1.25 }}>{txt}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", opacity: ap(f, 246, 14), transform: `scale(${interpolate(f, [246, 258, 268], [0.7, 1.06, 1], cl)})` }}>
            <Img src={staticFile("anuncio01/evidran-logo-blanco.svg")} style={{ width: 640 }} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

const CI_TEXTOS: Record<Paso["k"], { n: number | string; txt: string; cuenta?: boolean }> = {
  archivo: { n: 1, txt: "archivo, subido tal como lo tienes" },
  mapeo: { n: 12, txt: "columnas, cada una a su campo", cuenta: true },
  resultado: { n: 12, txt: "expedientes importados", cuenta: true },
  panel: { n: "2023", txt: "su fecha real, no la de la importación" },
  eyp: { n: 1, txt: "aviso al abrir la NC: esto ya pasó, y así se resolvió" },
  frase: { n: "", txt: "" },
  cierre: { n: "", txt: "" },
};

const CifrasPaso: React.FC<{ paso: Paso; i: number }> = ({ paso }) => {
  const f = useCurrentFrame();
  const d = CI_TEXTOS[paso.k];
  const num = d.cuenta && typeof d.n === "number" ? cuenta(f, 4, d.n, 24) : d.n;
  return (
    <AbsoluteFill style={{ background: fondoCifras, fontFamily: FUENTE, color: CI.texto }}>
      <div style={{ position: "absolute", left: 110, top: 0, width: 620, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: ap(f, 0) }}>
          <Insignia n={paso.icono} t={86} fondo="rgba(255,255,255,.16)" c="#fff" g={1.9} />
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: typeof d.n === "string" ? 200 : 260,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -10,
            color: CI.cifra,
            opacity: ap(f, 2),
            transform: `translateY(${(1 - ap(f, 2)) * 40}px)`,
          }}
        >
          {num}
        </div>
        <div style={{ marginTop: 14, fontSize: 52, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1, opacity: ap(f, 12), transform: `translateY(${(1 - ap(f, 12)) * 20}px)` }}>
          {d.txt}
        </div>
      </div>
      <Vista
        paso={paso}
        caja={{ x: 800, y: 110, w: 1030, h: 840 }}
        marcador="rgba(253,224,71,0.55)"
        entrada="desliza"
        radio={26}
        sombra="0 40px 110px rgba(10,25,80,.45)"
      />
      <AvisoDemo x={800} y={972} color={CI.suave} />
    </AbsoluteFill>
  );
};

const CifrasFrase: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: fondoCifras, fontFamily: FUENTE, color: CI.texto, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 118, fontWeight: 900, letterSpacing: -4, lineHeight: 1.02, opacity: ap(f, 0), transform: `scale(${1.08 - 0.08 * ap(f, 0)})` }}>Tu histórico,</div>
      <div style={{ fontSize: 118, fontWeight: 900, letterSpacing: -4, lineHeight: 1.02, color: CI.cifra, opacity: ap(f, 16) }}>por fin trabaja para&nbsp;ti.</div>
    </AbsoluteFill>
  );
};

// =====================================================================
// Montaje
// =====================================================================
type Version = {
  musica: string;
  // Desplaza la pista para que su subida caiga en un cambio de plano: >0 la retrasa, <0 la adelanta (fotogramas).
  ajuste: number;
  tema: { fondo: string; texto: string; enfasis: string; secundario: string; logo: string };
  Inicio: React.FC;
  Paso: React.FC<{ paso: Paso; i: number }>;
  Frase: React.FC;
};
const VERSIONES: Record<Estilo, Version> = {
  editorial: {
    musica: "anuncio13/musica-editorial.mp3",
    ajuste: 0, // piano continuo, sin golpe marcado
    tema: { fondo: CREMA, texto: NAVY, enfasis: AZUL, secundario: "#4B6179", logo: "anuncio01/evidran-logo.svg" },
    Inicio: EditorialInicio,
    Paso: EditorialPaso,
    Frase: EditorialFrase,
  },
  noche: {
    musica: "anuncio13/musica-noche.mp3",
    ajuste: 30, // entra el bajo a los 17,5 s de la pista → 18,5 s, «Con su código y su fecha real»
    tema: { fondo: NO.fondo, texto: "#FFFFFF", enfasis: NO.enfasis, secundario: NO.suave, logo: "anuncio01/evidran-logo-blanco.svg" },
    Inicio: NocheInicio,
    Paso: NochePaso,
    Frase: NocheFrase,
  },
  proceso: {
    musica: "anuncio13/musica-proceso.mp3",
    ajuste: 15, // entran palmas y bombo a los 16 s → 16,5 s, «Importa tu histórico»
    tema: { fondo: "#FFFFFF", texto: NAVY, enfasis: AZUL, secundario: "#64748B", logo: "anuncio01/evidran-logo.svg" },
    Inicio: ProcesoInicio,
    Paso: ProcesoPaso,
    Frase: ProcesoFrase,
  },
  cifras: {
    musica: "anuncio13/musica-cifras.mp3",
    ajuste: 0, // golpes repartidos, sin una subida única
    tema: { fondo: AZUL, texto: "#FFFFFF", enfasis: CI.cifra, secundario: CI.suave, logo: "anuncio01/evidran-logo-blanco.svg" },
    Inicio: CifrasInicio,
    Paso: CifrasPaso,
    Frase: CifrasFrase,
  },
};

export const Anuncio13Li: React.FC<Anuncio13LiProps> = ({ estilo }) => {
  const V = VERSIONES[estilo];
  return (
    <TemaCtx.Provider value={V.tema}>
      <AbsoluteFill style={{ backgroundColor: V.tema.fondo }}>
        <style>{fuentes}</style>
        <Sequence from={Math.max(V.ajuste, 0)}>
          <Audio
            src={staticFile(V.musica)}
            startFrom={Math.max(-V.ajuste, 0)}
            volume={(f) => {
              const g = f + Math.max(V.ajuste, 0);
              return interpolate(g, [0, 9, DURACION - 15, DURACION], [0, 1, 1, 0], cl);
            }}
          />
        </Sequence>
        <Sequence from={0} durationInFrames={INICIO}>
          <V.Inicio />
        </Sequence>
        {PASOS.map((p, i) => (
          <Sequence key={p.k} from={T[p.k][0]} durationInFrames={T[p.k][1]}>
            <V.Paso paso={p} i={i} />
          </Sequence>
        ))}
        <Sequence from={T.frase[0]} durationInFrames={T.frase[1]}>
          <V.Frase />
        </Sequence>
        <Sequence from={T.cierre[0]} durationInFrames={T.cierre[1]}>
          <Cierre />
        </Sequence>
      </AbsoluteFill>
    </TemaCtx.Provider>
  );
};

export const DURACION_ANUNCIO13LI = DURACION;
