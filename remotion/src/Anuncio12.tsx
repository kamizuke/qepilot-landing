// Anuncio 12 · «Todo tu sistema de gestión, en un solo sitio».
// Lo desperdigado (NC en Excel, aspectos ambientales, requisitos legales, auditorías,
// riesgos, correos, fotos en el móvil) se junta en Evidran. No es solo calidad:
// es todo el sistema de gestión.
// Dos formatos: 4:5 (Meta Ads, y su versión 9:16) y 16:9 (LinkedIn).
// Pantallas: capturas reales de la org demo Metalúrgica Duero (las de la portada).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cierre, FUENTE, TEMAS, TemaCtx, fuentes, suave } from "./Anuncio01";

// `largo`: versión de LinkedIn de 48 s que añade la parte de sistema integrado (ISO 14001).
export type Anuncio12Props = { tema: "crema" | "azul"; formato: "4x5" | "16x9"; largo?: boolean };

// ---------- Maquetación por formato ----------
type Maqueta = {
  banda: number; // alto de la franja del rótulo
  rotuloFuente: number;
  x: number; // tarjeta de pantalla
  y: number;
  w: number;
  h: number;
  avisoFuente: number;
  ganchoFuente: number;
  ganchoGrande: number;
  fraseFuente: number;
};
export const MAQUETAS: Record<Anuncio12Props["formato"], Maqueta> = {
  "4x5": { banda: 250, rotuloFuente: 64, x: 40, y: 250, w: 1000, h: 1000, avisoFuente: 28, ganchoFuente: 50, ganchoGrande: 122, fraseFuente: 84 },
  "16x9": { banda: 200, rotuloFuente: 66, x: 200, y: 200, w: 1520, h: 800, avisoFuente: 26, ganchoFuente: 54, ganchoGrande: 140, fraseFuente: 100 },
};
export const MaquetaCtx = React.createContext<Maqueta>(MAQUETAS["4x5"]);
export const useMaqueta = () => React.useContext(MaquetaCtx);
export const FormatoCtx = React.createContext<Anuncio12Props["formato"]>("4x5");

// ---------- Rótulo de la franja superior ----------
export const Rotulo: React.FC<{ texto: string; duracion: number }> = ({ texto, duracion }) => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const m = useMaqueta();
  const entra = interpolate(f, [2, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  const sale = interpolate(f, [duracion - 6, duracion], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 0,
        height: m.banda,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: entra * sale,
        transform: `translateY(${(1 - entra) * 24}px)`,
        color: tema.texto,
        fontFamily: FUENTE,
        fontWeight: 800,
        fontSize: m.rotuloFuente,
        lineHeight: 1.1,
        letterSpacing: -1.2,
      }}
    >
      {texto}
    </div>
  );
};

// ---------- Pantalla fija con movimiento de cámara ----------
// x, y: esquina superior izquierda del encuadre en fracciones de la imagen; w: fracción del ancho visible.
export type Clave = { f: number; x: number; y: number; w: number };
// `video`: la pantalla es una grabación (segundo donde empieza y velocidad), no una captura fija.
export type Captura = { src: string; ancho: number; alto: number; video?: { inicio: number; velocidad: number } };
const ENTREVISTA: Captura = { src: "anuncio12/evidran-entrevista-2026-10.webp", ancho: 2560, alto: 1290 };
const MIDIA: Captura = { src: "anuncio12/evidran-mi-dia-2026-11.webp", ancho: 2560, alto: 1600 };
// «Esto ya pasó»: mientras se escribe la NC-2026-056, la tarjeta ámbar avisa de que se parece a una
// NC de junio y dice con qué acción se cerró (org de pruebas, 23/11/2026).
const CASOS: Captura = { src: "anuncio12/evidran-esto-ya-paso-2026-11.webp", ancho: 2560, alto: 1600 };
// Inteligencia: causas raíz agrupadas y el objetivo 6.2 que Evidran propone a partir de ellas.
const CAUSAS: Captura = { src: "anuncio12/evidran-causas-2026-10.webp", ancho: 2008, alto: 1114 };
// Versión larga (org de pruebas, 23/11/2026):
// NC-2026-020, NC ambiental ISO 14001 escrita en conversación; el informe ya dice el aspecto afectado.
const NC_AMBIENTAL: Captura = { src: "anuncio12/evidran-nc-ambiental-2026-11.webp", ancho: 2560, alto: 1600 };
// Plan de mejora con una acción de calidad, una ambiental y una de seguridad juntas
// (filas reordenadas en pantalla para la captura; los datos no se tocaron).
const PLAN: Captura = { src: "anuncio12/evidran-plan-mejora-2026-11.webp", ancho: 2560, alto: 1600 };
// Revisión por la dirección: el resumen que redacta Evidran cuenta las NC por norma (9001, 14001, 45001).
const ACTA: Captura = { src: "anuncio12/evidran-acta-direccion-2026-11.webp", ancho: 2560, alto: 1600 };

// Subrayado de rotulador sobre una línea de la captura, para que se vea qué frase importa.
// x, y, w, h en fracciones de la imagen; se dibuja de izquierda a derecha entre `f` y `f + d`.
export type Resalte = { x: number; y: number; w: number; h: number; f: number; d: number };
const MARCADOR = "rgba(116,179,163,0.55)";
// Líneas medidas sobre la captura de 2560×1600 (título del aviso y la acción con que se cerró).
const RESALTES_CASOS: Resalte[] = [
  { x: 0.4395, y: 0.2085, w: 0.4705, h: 0.0225, f: 54, d: 10 },
  { x: 0.4395, y: 0.2297, w: 0.1755, h: 0.0215, f: 64, d: 5 },
  { x: 0.7045, y: 0.2535, w: 0.231, h: 0.023, f: 73, d: 9 },
  { x: 0.4395, y: 0.2772, w: 0.5023, h: 0.023, f: 82, d: 11 },
  { x: 0.4395, y: 0.3022, w: 0.0547, h: 0.0215, f: 93, d: 3 },
];
// «Gestión de residuos — segregación incorrecta:» en el informe de la NC ambiental.
const RESALTES_NC_AMBIENTAL: Resalte[] = [
  { x: 0.6348, y: 0.6469, w: 0.1238, h: 0.0231, f: 80, d: 9 },
  { x: 0.6348, y: 0.6731, w: 0.1328, h: 0.0231, f: 90, d: 9 },
];
// Las tres acciones del plan: mantenimiento (calidad), aceite usado (medio ambiente), humos (seguridad).
const RESALTES_PLAN: Resalte[] = [
  { x: 0.4773, y: 0.6556, w: 0.2055, h: 0.0175, f: 76, d: 10 },
  { x: 0.4941, y: 0.8025, w: 0.1621, h: 0.0175, f: 88, d: 8 },
  { x: 0.4668, y: 0.8994, w: 0.0977, h: 0.0175, f: 98, d: 6 },
];
// La frase del resumen que cuenta las NC de cada norma sin contar dos veces las multisistema.
const RESALTES_ACTA: Resalte[] = [
  { x: 0.3691, y: 0.6638, w: 0.2539, h: 0.0213, f: 74, d: 10 },
  { x: 0.3445, y: 0.6944, w: 0.468, h: 0.0213, f: 86, d: 16 },
  { x: 0.2363, y: 0.7244, w: 0.3059, h: 0.0213, f: 104, d: 10 },
];
// El objetivo recomendado (captura de 2008×1114).
const RESALTES_CAUSAS: Resalte[] = [
  { x: 0.5996, y: 0.5637, w: 0.3357, h: 0.0431, f: 66, d: 8 },
  { x: 0.5996, y: 0.6068, w: 0.2351, h: 0.0395, f: 74, d: 6 },
  { x: 0.5996, y: 0.6463, w: 0.3108, h: 0.0431, f: 80, d: 7 },
  { x: 0.5996, y: 0.6894, w: 0.0518, h: 0.0395, f: 87, d: 3 },
];

export const Pantalla: React.FC<{ cap: Captura; claves: Clave[]; aparece?: boolean; resaltes?: Resalte[] }> = ({ cap, claves, aparece, resaltes }) => {
  const f = useCurrentFrame();
  const m = useMaqueta();
  const fs = claves.map((k) => k.f);
  const cam = (k: "x" | "y" | "w") =>
    interpolate(f, fs, claves.map((c) => c[k]), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
  const anchoImg = m.w / cam("w");
  const altoImg = (anchoImg * cap.alto) / cap.ancho;
  const op = aparece ? interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: m.x,
        top: m.y,
        width: m.w,
        height: m.h,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 30px 70px rgba(21,48,74,.22), 0 0 0 1px rgba(21,48,74,.10)",
        backgroundColor: "#fff",
      }}
    >
      {cap.video ? (
        <div style={{ position: "absolute", width: anchoImg, height: altoImg, left: -cam("x") * anchoImg, top: -cam("y") * altoImg, opacity: op }}>
          <OffthreadVideo
            src={staticFile(cap.src)}
            startFrom={Math.round(cap.video.inicio * 30)}
            playbackRate={cap.video.velocidad}
            muted
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ) : (
        <div style={{ position: "absolute", width: anchoImg, height: altoImg, left: -cam("x") * anchoImg, top: -cam("y") * altoImg, opacity: op }}>
          <Img src={staticFile(cap.src)} style={{ width: "100%", height: "100%" }} />
          {(resaltes ?? []).map((r, i) => {
            const p = interpolate(f, [r.f, r.f + r.d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${r.x * 100}%`,
                  top: `${r.y * 100}%`,
                  width: `${r.w * p * 100}%`,
                  height: `${r.h * 100}%`,
                  backgroundColor: MARCADOR,
                  mixBlendMode: "multiply",
                  borderRadius: 4,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

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
        {linea("Las NC, en un Excel.", 0)}
        {linea("Los aspectos ambientales, en otro.", 22)}
        {linea("Los requisitos legales, en una carpeta.", 44)}
        {linea("Las acciones, en el correo.", 66)}
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: m.ganchoGrande,
          fontWeight: 850,
          letterSpacing: -3,
          lineHeight: 1.02,
          color: tema.enfasis,
          opacity: a(96),
          transform: `scale(${0.94 + 0.06 * a(96)})`,
        }}
      >
        ¿Dónde está todo?
      </div>
    </AbsoluteFill>
  );
};

// ---------- Lo desperdigado (genérico, sin marcas) ----------
type Tipo = "xlsx" | "correo" | "carpeta" | "docx" | "foto" | "nota" | "pdf" | "chat";
// `lineas`: lo que se ve dentro de una carpeta; `nota`: el texto del pósit (con \n).
export type Pieza = { tipo: Tipo; titulo: string; lineas?: string[]; nota?: string };
const PIEZAS: Pieza[] = [
  { tipo: "xlsx", titulo: "Registro NC 2026_v7_FINAL.xlsx" },
  { tipo: "correo", titulo: "RE: RE: RV: acción correctiva lote 214" },
  { tipo: "carpeta", titulo: "Auditoría interna › evidencias (2)" },
  { tipo: "docx", titulo: "Requisitos legales 2026 (revisar).docx" },
  { tipo: "pdf", titulo: "Evaluación de riesgos_firmada.pdf" },
  { tipo: "chat", titulo: "Pablo (Mantenimiento)" },
  { tipo: "xlsx", titulo: "Aspectos ambientales_matriz.xlsx" },
  { tipo: "foto", titulo: "IMG_4471.jpg" },
  { tipo: "nota", titulo: "" },
];
// Posición [x, y, giro] de cada pieza, en el mismo orden, por formato.
const SITIOS: Record<Anuncio12Props["formato"], [number, number, number][]> = {
  "4x5": [
    [40, 285, -4],
    [575, 300, 3],
    [50, 640, 2],
    [570, 615, -3],
    [35, 960, -2],
    [585, 955, 4],
    [300, 440, 2],
    [330, 560, -1],
    [395, 800, 5],
  ],
  "16x9": [
    [210, 225, -4],
    [720, 210, 3],
    [230, 560, 2],
    [1240, 235, -2],
    [480, 720, -3],
    [1000, 715, 4],
    [1250, 560, 3],
    [720, 450, -1],
    [1530, 420, 6],
  ],
};
const W_PIEZA = 460;
const H_PIEZA = 290;

const ETIQUETA: Record<Tipo, [string, string]> = {
  xlsx: ["XLSX", "#1F7A4D"],
  correo: ["Correo", "#3B5B8C"],
  carpeta: ["Carpeta", "#B7791F"],
  docx: ["DOCX", "#2B579A"],
  foto: ["Foto", "#6B7280"],
  nota: ["", "#000"],
  pdf: ["PDF", "#B42318"],
  chat: ["Mensaje", "#2F855A"],
};

const Raya: React.FC<{ w: string; h?: number; c?: string }> = ({ w, h = 16, c = "#E5E8EC" }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: c }} />
);

const Cuerpo: React.FC<{ p: Pieza }> = ({ p }) => {
  if (p.tipo === "xlsx") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", margin: 18, border: "1px solid #D7DCE1" }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            style={{ height: 34, borderRight: "1px solid #D7DCE1", borderBottom: "1px solid #D7DCE1", backgroundColor: i < 5 ? "#E8F3EC" : i === 13 ? "#FDE68A" : "#fff" }}
          />
        ))}
      </div>
    );
  }
  if (p.tipo === "foto") {
    return (
      <div style={{ margin: 18, height: 190, borderRadius: 10, background: "linear-gradient(135deg,#8A9099,#4B5563)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, border: "26px solid #C9CED6", boxSizing: "border-box" }} />
      </div>
    );
  }
  if (p.tipo === "chat") {
    return (
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, fontSize: 24, fontWeight: 600, color: "#1F2937" }}>
        <div style={{ alignSelf: "flex-start", backgroundColor: "#EEF0F3", padding: "10px 16px", borderRadius: 16 }}>¿Me reenvías la foto de la pieza?</div>
        <div style={{ alignSelf: "flex-end", backgroundColor: "#DCF2E3", padding: "10px 16px", borderRadius: 16 }}>Te la mandé el martes…</div>
      </div>
    );
  }
  if (p.tipo === "carpeta") {
    return (
      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12, fontSize: 22, fontWeight: 600, color: "#4B5563" }}>
        {(p.lineas ?? ["acta_reunion (1).pdf", "foto_lote_FINAL2.jpg", "Nueva carpeta", "copia de copia.xlsx"]).map((n) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 20, borderRadius: 4, backgroundColor: "#F2C94C" }} />
            {n}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <Raya w="88%" />
      <Raya w="72%" />
      <Raya w="80%" />
      <Raya w="56%" />
      <Raya w="76%" />
    </div>
  );
};

const PiezaVista: React.FC<{ p: Pieza }> = ({ p }) => {
  if (p.tipo === "nota") {
    return (
      <div
        style={{
          width: 290,
          height: 270,
          backgroundColor: "#FDE68A",
          boxShadow: "0 24px 50px rgba(21,48,74,.25)",
          padding: 30,
          boxSizing: "border-box",
          fontFamily: FUENTE,
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1.25,
          color: "#3F3A1E",
          fontStyle: "italic",
        }}
      >
        {(p.nota ?? "Plazo acción 3: ¿viernes?\nPreguntar a Pablo").split("\n").map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    );
  }
  const [etiqueta, color] = ETIQUETA[p.tipo];
  return (
    <div
      style={{
        width: W_PIEZA,
        height: H_PIEZA,
        backgroundColor: "#fff",
        borderRadius: 18,
        boxShadow: "0 24px 60px rgba(21,48,74,.22), 0 0 0 1px rgba(21,48,74,.12)",
        overflow: "hidden",
        fontFamily: FUENTE,
      }}
    >
      <div style={{ height: 58, backgroundColor: "#F1F3F5", display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
        <div style={{ backgroundColor: color, color: "#fff", fontSize: 18, fontWeight: 800, padding: "5px 10px", borderRadius: 7, letterSpacing: 0.5 }}>{etiqueta}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.titulo}</div>
      </div>
      <Cuerpo p={p} />
    </div>
  );
};

// ---------- El círculo de Evidran (el mismo de la portada, sección «flujo») ----------
const DIAM_HUB: Record<Anuncio12Props["formato"], number> = { "4x5": 180, "16x9": 230 };
export const Hub: React.FC<{ cx: number; cy: number; escala: number }> = ({ cx, cy, escala }) => {
  const f = useCurrentFrame();
  const formato = React.useContext(FormatoCtx);
  const d = DIAM_HUB[formato];
  const anillo = d / 2 + 2;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - d / 2,
        top: cy - d / 2,
        width: d,
        height: d,
        transform: `scale(${escala})`,
        opacity: Math.min(1, escala * 1.5),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: "50%",
          background: "conic-gradient(from 200deg,rgba(74,166,245,.55),rgba(20,178,186,.55),rgba(51,223,157,.55),rgba(74,166,245,.55))",
          WebkitMaskImage: `radial-gradient(circle,transparent ${anillo}px,#000 ${anillo + 1}px)`,
          maskImage: `radial-gradient(circle,transparent ${anillo}px,#000 ${anillo + 1}px)`,
          transform: `rotate(${f * 0.86}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 18px 50px rgba(37,99,235,.18),0 0 0 1px #e4e9f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img src={staticFile("anuncio12/evidran-isotipo.svg")} style={{ width: d * 0.4, height: d * 0.4 }} />
      </div>
    </div>
  );
};

// Las piezas entran amontonándose; a partir de JUNTA vuelan al centro y se
// funden en el círculo de Evidran, donde arranca la escena del flujo.
export const JUNTA = 135;
export const Desperdigado: React.FC<{ piezas?: Pieza[] }> = ({ piezas = PIEZAS }) => {
  const f = useCurrentFrame();
  const m = useMaqueta();
  const formato = React.useContext(FormatoCtx);
  const cx = m.x + m.w / 2;
  const cy = m.y + m.h / 2;
  const crece = interpolate(f, [JUNTA + 16, JUNTA + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill>
      {piezas.map((p, i) => {
        const [x, y, giro] = SITIOS[formato][i];
        const ini = i * 9;
        const entra = interpolate(f, [ini, ini + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
        const j0 = JUNTA + i * 2;
        const va = interpolate(f, [j0, j0 + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
        const ancho = p.tipo === "nota" ? 290 : W_PIEZA;
        const alto = p.tipo === "nota" ? 270 : H_PIEZA;
        // Leve deriva mientras están quietas, para que la escena respire.
        const deriva = Math.sin((f + i * 17) / 40) * 4;
        const dx = (cx - (x + ancho / 2)) * va;
        const dy = (cy - (y + alto / 2)) * va + (1 - entra) * 70 + deriva * (1 - va);
        const escala = (0.88 + 0.12 * entra) * (1 - 0.85 * va);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              opacity: entra * (1 - interpolate(va, [0.7, 1], [0, 1], { extrapolateLeft: "clamp" })),
              transform: `translate(${dx}px, ${dy}px) rotate(${giro * (1 - va)}deg) scale(${escala})`,
            }}
          >
            <PiezaVista p={p} />
          </div>
        );
      })}
      {f >= JUNTA + 16 && <Hub cx={cx} cy={cy} escala={crece} />}
    </AbsoluteFill>
  );
};

// ---------- Todo entra por un sitio, sale ordenado (portada, sección «flujo») ----------
type NodoFlujo = { t: string; s: string; ic: React.ReactNode };
const ENTRA: NodoFlujo[] = [
  { t: "Hallazgo de auditoría", s: "interna, de cliente o de certificación", ic: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9.5 3h5v3h-5zM9 13l2 2 4-4" /></> },
  { t: "Reclamación de cliente", s: "con la pieza ya de vuelta", ic: <><path d="M4 5h16v11H9l-5 4z" /><path d="M12 8v3.2M12 13.4v.1" /></> },
  { t: "Lo que te cuentan en el pasillo", s: "y el viernes, de memoria", ic: <><path d="M3 5h11v7H7l-4 3z" /><path d="M14 9h7v7l-3-2h-6v-2" /></> },
  { t: "Proveedor que vuelve a fallar", s: "otra vez el mismo lote", ic: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></> },
  { t: "Indicador fuera de objetivo", s: "y nadie sabe desde cuándo", ic: <><path d="M4 4v16h16" /><path d="M7 8l4 4 3-3 5 5" /></> },
];
const SALE: NodoFlujo[] = [
  { t: "Un expediente que se defiende", s: "causa, decisión y evidencia, ante el auditor", ic: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-4.5" /></> },
  { t: "Acciones con dueño y plazo", s: "y la verificación de que funcionó", ic: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9h16M8 3v4M16 3v4M9 14.5l2 2 4-4" /></> },
  { t: "Las causas que se repiten", s: "y el objetivo que sale de ellas", ic: <><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M20 4v5h-5M4 20v-5h5" /></> },
  { t: "La respuesta para dirección", s: "sin tener que pedir un informe", ic: <><path d="M4 20h16" /><rect x="6" y="12" width="3" height="6" /><rect x="11" y="8" width="3" height="10" /><rect x="16" y="4" width="3" height="14" /></> },
];
// Cuándo aparece cada nodo (fotograma de la escena): primero lo que entra, luego lo que sale.
const T_ENTRA = (i: number) => 2 + i * 5;
const T_SALE = (j: number) => 36 + j * 6;
const PERIODO_PULSO = 26;

const Icono: React.FC<{ ic: React.ReactNode; tam: number; sale?: boolean }> = ({ ic, tam, sale }) => (
  <div
    style={{
      flex: "none",
      width: tam,
      height: tam,
      borderRadius: tam * 0.28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: sale ? "linear-gradient(135deg,#e6faf3,#e3f4fb)" : "#fff",
      border: `1.5px solid ${sale ? "#cdeee6" : "#dddcd5"}`,
      color: sale ? "#0f8f86" : "#4a5563",
    }}
  >
    <svg viewBox="0 0 24 24" width={tam * 0.54} height={tam * 0.54} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {ic}
    </svg>
  </div>
);

const Nodo: React.FC<{ n: NodoFlujo; sale?: boolean; ancho: number; alto: number; fT: number; fS: number; icono: number }> = ({ n, sale, ancho, alto, fT, fS, icono }) => (
  <div
    style={{
      width: ancho,
      height: alto,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 20px 0 16px",
      borderRadius: 18,
      backgroundColor: sale ? "#fff" : "#FBFAF7",
      border: "1.5px solid #dddcd5",
      boxShadow: sale ? "0 10px 30px rgba(22,32,43,.10)" : "none",
      fontFamily: FUENTE,
    }}
  >
    <Icono ic={n.ic} tam={icono} sale={sale} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: fT, fontWeight: 650, color: "#16202b", lineHeight: 1.2, letterSpacing: -0.3 }}>{n.t}</div>
      <div style={{ fontSize: fS, color: "#56616d", lineHeight: 1.3, marginTop: 3 }}>{n.s}</div>
    </div>
  </div>
);

// Punto de una curva de Bézier cúbica.
const bez = (p: number[], c1: number[], c2: number[], q: number[], t: number) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * q[k]);
};
// Pulso que recorre un cable una y otra vez a partir del fotograma `desde`.
const pulsoT = (f: number, desde: number, fase: number) => (f < desde ? -1 : (((f - desde + fase) % PERIODO_PULSO) + PERIODO_PULSO) % PERIODO_PULSO / PERIODO_PULSO);
const op01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });

const Flujo: React.FC = () => {
  const f = useCurrentFrame();
  const m = useMaqueta();
  const tema = React.useContext(TemaCtx);
  const formato = React.useContext(FormatoCtx);
  const azul = tema.fondo === TEMAS.azul.fondo;
  const cx = m.x + m.w / 2;
  const cy = m.y + m.h / 2;
  const cableIn = azul ? "rgba(255,255,255,.45)" : "#c9d3de";
  const cableOut = azul ? "rgba(160,240,220,.75)" : "#9fd8cf";
  const pulsoIn = azul ? "#ffffff" : "#4aa6f5";
  const pulsoOut = azul ? "#33df9d" : "#14b2ba";
  const etiqueta: React.CSSProperties = { fontFamily: FUENTE, fontSize: 21, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: tema.secundario };

  if (formato === "16x9") {
    const d = DIAM_HUB[formato];
    const r = d / 2 + 16;
    const anchoN = 530;
    const altoN = 108;
    const hueco = 20;
    const xIn = cx - d / 2 - 120 - anchoN;
    const xOut = cx + d / 2 + 120;
    const yIn0 = cy - (ENTRA.length * altoN + (ENTRA.length - 1) * hueco) / 2 + 22;
    const yOut0 = cy - (SALE.length * altoN + (SALE.length - 1) * hueco) / 2 + 22;
    const cable = (y: number, sale: boolean) => {
      const dy = Math.max(-r * 0.55, Math.min(r * 0.55, (y - cy) * 0.4));
      const hx = Math.sqrt(r * r - dy * dy);
      const p = sale ? [cx + hx, cy + dy] : [xIn + anchoN, y];
      const q = sale ? [xOut, y] : [cx - hx, cy + dy];
      const k = (q[0] - p[0]) * 0.55;
      return { p, c1: [p[0] + k, p[1]], c2: [q[0] - k, q[1]], q };
    };
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {ENTRA.map((_, i) => {
            const y = yIn0 + i * (altoN + hueco) + altoN / 2;
            const c = cable(y, false);
            const o = op01(f, T_ENTRA(i) + 3, T_ENTRA(i) + 10);
            const t = pulsoT(f, T_ENTRA(i) + 8, i * 5);
            const pt = t >= 0 ? bez(c.p, c.c1, c.c2, c.q, t) : null;
            return (
              <g key={`i${i}`} opacity={o}>
                <path d={`M${c.p} C${c.c1} ${c.c2} ${c.q}`} fill="none" stroke={cableIn} strokeWidth={2.2} />
                <circle cx={c.p[0]} cy={c.p[1]} r={5} fill="#fff" stroke={cableIn} strokeWidth={2} />
                {pt && <circle cx={pt[0]} cy={pt[1]} r={6.5} fill={pulsoIn} opacity={Math.sin(Math.PI * t)} />}
              </g>
            );
          })}
          {SALE.map((_, j) => {
            const y = yOut0 + j * (altoN + hueco) + altoN / 2;
            const c = cable(y, true);
            const o = op01(f, T_SALE(j) - 4, T_SALE(j) + 4);
            const t = pulsoT(f, T_SALE(j), j * 6);
            const pt = t >= 0 ? bez(c.p, c.c1, c.c2, c.q, t) : null;
            return (
              <g key={`o${j}`} opacity={o}>
                <path d={`M${c.p} C${c.c1} ${c.c2} ${c.q}`} fill="none" stroke={cableOut} strokeWidth={2.2} />
                <circle cx={c.q[0]} cy={c.q[1]} r={5} fill="#fff" stroke={cableOut} strokeWidth={2} />
                {pt && <circle cx={pt[0]} cy={pt[1]} r={6.5} fill={pulsoOut} opacity={Math.sin(Math.PI * t)} />}
              </g>
            );
          })}
        </svg>
        <div style={{ ...etiqueta, position: "absolute", left: xIn, width: anchoN, textAlign: "right", top: yIn0 - 44, opacity: op01(f, 0, 8) }}>Lo que ocurre</div>
        <div style={{ ...etiqueta, position: "absolute", left: xOut, top: yOut0 - 44, opacity: op01(f, T_SALE(0) - 6, T_SALE(0) + 2) }}>Lo que queda</div>
        {ENTRA.map((n, i) => {
          const a = op01(f, T_ENTRA(i), T_ENTRA(i) + 12);
          return (
            <div key={n.t} style={{ position: "absolute", left: xIn, top: yIn0 + i * (altoN + hueco), opacity: a, transform: `translateX(${(1 - a) * -50}px)` }}>
              <Nodo n={n} ancho={anchoN} alto={altoN} fT={27} fS={19} icono={54} />
            </div>
          );
        })}
        {SALE.map((n, j) => {
          const a = op01(f, T_SALE(j), T_SALE(j) + 12);
          return (
            <div key={n.t} style={{ position: "absolute", left: xOut, top: yOut0 + j * (altoN + hueco), opacity: a, transform: `translateX(${(1 - a) * 50}px)` }}>
              <Nodo n={n} sale ancho={anchoN} alto={altoN} fT={27} fS={19} icono={54} />
            </div>
          );
        })}
        <Hub cx={cx} cy={cy} escala={1} />
        <div style={{ position: "absolute", left: cx - 200, width: 400, top: cy + d / 2 + 34, textAlign: "center", fontFamily: FUENTE, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: tema.texto }}>EVIDRAN</div>
      </AbsoluteFill>
    );
  }

  // 4:5 — como la portada en móvil: lo que ocurre arriba (etiquetas), Evidran en medio, lo que queda abajo.
  const d = DIAM_HUB[formato];
  const topHub = cy - d / 2;
  const finHub = cy + d / 2;
  const vlink = (y0: number, y1: number, desde: number, color: string, pulso: string) => {
    const t = pulsoT(f, desde, 0);
    return (
      <div style={{ position: "absolute", left: cx - 1.5, top: y0, width: 3, height: y1 - y0, backgroundColor: color, opacity: op01(f, desde - 8, desde) }}>
        {t >= 0 && (
          <div style={{ position: "absolute", left: -5, top: t * (y1 - y0) - 6, width: 13, height: 13, borderRadius: "50%", backgroundColor: pulso, opacity: Math.sin(Math.PI * t) }} />
        )}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <div style={{ ...etiqueta, position: "absolute", left: 0, right: 0, textAlign: "center", top: 285, opacity: op01(f, 0, 8) }}>Lo que ocurre</div>
      <div style={{ position: "absolute", left: m.x + 10, width: m.w - 20, top: 330, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
        {ENTRA.map((n, i) => {
          const a = op01(f, T_ENTRA(i), T_ENTRA(i) + 12);
          return (
            <div
              key={n.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 18px 7px 8px",
                borderRadius: 100,
                backgroundColor: "#FBFAF7",
                border: "1.5px solid #dddcd5",
                fontFamily: FUENTE,
                fontSize: 25,
                fontWeight: 600,
                color: "#16202b",
                opacity: a,
                transform: `translateY(${(1 - a) * -20}px)`,
              }}
            >
              <Icono ic={n.ic} tam={40} />
              {n.t}
            </div>
          );
        })}
      </div>
      {vlink(560, topHub - 18, T_ENTRA(4) + 6, cableIn, pulsoIn)}
      <Hub cx={cx} cy={cy} escala={1} />
      {vlink(finHub + 18, 905, T_SALE(0) - 2, cableOut, pulsoOut)}
      <div style={{ ...etiqueta, position: "absolute", left: 0, right: 0, textAlign: "center", top: 920, opacity: op01(f, T_SALE(0) - 6, T_SALE(0) + 2) }}>Lo que queda</div>
      <div style={{ position: "absolute", left: m.x + 10, width: m.w - 20, top: 962, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {SALE.map((n, j) => {
          const a = op01(f, T_SALE(j), T_SALE(j) + 12);
          return (
            <div key={n.t} style={{ opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
              <Nodo n={n} sale ancho={(m.w - 20 - 16) / 2} alto={128} fT={25} fS={19} icono={50} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Frase final ----------
const Frase: React.FC = () => {
  const f = useCurrentFrame();
  const tema = React.useContext(TemaCtx);
  const m = useMaqueta();
  const formato = React.useContext(FormatoCtx);
  const a = (d: number) => interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  return (
    <AbsoluteFill
      style={{ backgroundColor: tema.fondo, justifyContent: "center", alignItems: "center", fontFamily: FUENTE, color: tema.texto, textAlign: "center", padding: "0 80px" }}
    >
      <div style={{ fontSize: m.fraseFuente, fontWeight: 850, letterSpacing: -2, lineHeight: 1.08, opacity: a(0) }}>
        {formato === "4x5" ? (
          <>
            Todo tu sistema
            <br />
            de gestión,
          </>
        ) : (
          "Todo tu sistema de gestión,"
        )}
        <br />
        <span style={{ color: tema.enfasis }}>en un solo sitio.</span>
      </div>
    </AbsoluteFill>
  );
};

export const Aviso: React.FC = () => {
  const tema = React.useContext(TemaCtx);
  const m = useMaqueta();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: m.y + m.h + 22,
        textAlign: "center",
        fontFamily: FUENTE,
        fontSize: m.avisoFuente,
        fontWeight: 600,
        color: tema.texto,
        opacity: 0.7,
      }}
    >
      Datos de una empresa de demostración
    </div>
  );
};

// ---------- Montaje (30 fps) ----------
type Encuadres = Record<Anuncio12Props["formato"], Clave[]>;
type Tramo = { d: number; gancho?: boolean; caos?: boolean; cap?: Captura; claves?: Encuadres; aparece?: boolean; resaltes?: Resalte[]; flujo?: boolean; frase?: boolean; cierre?: boolean };
// Encuadre quieto los primeros 30 fotogramas y movimiento hasta el fotograma `fin`.
export const mov = (de: Omit<Clave, "f">, a: Omit<Clave, "f">, fin: number): Clave[] => [
  { f: 0, ...de },
  { f: 30, ...de },
  { f: fin, ...a },
];
const GANCHO: Tramo = { d: 150, gancho: true };
// Archivos sueltos que se amontonan y luego vuelan al círculo de Evidran
const CAOS: Tramo = { d: JUNTA + 40, caos: true };
// El esquema de la portada: lo que ocurre entra por un sitio y sale ordenado
const FLUJO: Tramo = { d: 100, flujo: true };
// La entrevista y el informe, en el mismo sitio
const T_ENTREVISTA: Tramo = {
  d: 100,
  cap: ENTREVISTA,
  aparece: true,
  claves: { "4x5": mov({ x: 0, y: 0, w: 0.5 }, { x: 0.42, y: 0, w: 0.5 }, 92), "16x9": mov({ x: 0, y: 0, w: 0.95 }, { x: 0.4, y: 0.12, w: 0.6 }, 92) },
};
// Mi día: lo que vence, venga de donde venga
const T_MIDIA: Tramo = {
  d: 105,
  cap: MIDIA,
  claves: { "4x5": mov({ x: 0.19, y: 0, w: 0.6 }, { x: 0.205, y: 0.2, w: 0.5 }, 98), "16x9": mov({ x: 0.19, y: 0, w: 0.81 }, { x: 0.2, y: 0.3, w: 0.8 }, 98) },
};
// «Esto ya pasó»: la NC que se está escribiendo (izquierda la conversación, derecha el informe)
// y, encima, el aviso. Se acerca a la tarjeta y se subraya a qué se parece y cómo se cerró.
const T_CASOS: Tramo = {
  d: 112,
  cap: CASOS,
  resaltes: RESALTES_CASOS,
  claves: {
    "4x5": [
      { f: 0, x: 0.405, y: 0, w: 0.595 },
      { f: 18, x: 0.405, y: 0, w: 0.595 },
      { f: 56, x: 0.437, y: 0.01, w: 0.505 },
    ],
    "16x9": [
      { f: 0, x: 0, y: 0, w: 1 },
      { f: 18, x: 0, y: 0, w: 1 },
      { f: 56, x: 0.42, y: 0.13, w: 0.565 },
    ],
  },
};
// Inteligencia: de las causas que se repiten sale un objetivo 6.2 propuesto
const T_CAUSAS: Tramo = {
  d: 95,
  cap: CAUSAS,
  resaltes: RESALTES_CAUSAS,
  claves: {
    "4x5": [
      { f: 0, x: 0, y: 0, w: 0.55 },
      { f: 18, x: 0, y: 0, w: 0.55 },
      { f: 66, x: 0.56, y: 0.24, w: 0.42 },
    ],
    "16x9": [
      { f: 0, x: 0.01, y: 0.01, w: 1 },
      { f: 18, x: 0.01, y: 0.01, w: 1 },
      { f: 66, x: 0.56, y: 0.52, w: 0.44 },
    ],
  },
};
const FRASE: Tramo = { d: 68, frase: true };
const CIERRE: Tramo = { d: 95, cierre: true };

// Solo la versión larga (16:9); el 4:5 repite el encuadre para que el tipo cuadre.
const ambos = (c: Clave[]): Encuadres => ({ "4x5": c, "16x9": c });
const T_NC_AMBIENTAL: Tramo = {
  d: 120,
  cap: NC_AMBIENTAL,
  resaltes: RESALTES_NC_AMBIENTAL,
  claves: ambos(mov({ x: 0, y: 0, w: 1 }, { x: 0.44, y: 0.39, w: 0.52 }, 76)),
};
const T_PLAN: Tramo = {
  d: 120,
  cap: PLAN,
  resaltes: RESALTES_PLAN,
  claves: ambos(mov({ x: 0, y: 0, w: 1 }, { x: 0.205, y: 0.34, w: 0.78 }, 72)),
};
const T_ACTA: Tramo = {
  d: 125,
  cap: ACTA,
  resaltes: RESALTES_ACTA,
  claves: ambos(mov({ x: 0, y: 0, w: 1 }, { x: 0.225, y: 0.3, w: 0.74 }, 70)),
};

type Version = { tramos: Tramo[]; rotulos: [number, number, string][]; musica: string; retraso: number };
const inicioEn = (tramos: Tramo[], n: number) => tramos.slice(0, n).reduce((a, t) => a + t.d, 0);

// Corta (33 s, Meta y LinkedIn)
const TRAMOS: Tramo[] = [GANCHO, CAOS, FLUJO, T_ENTREVISTA, T_MIDIA, T_CASOS, T_CAUSAS, FRASE, CIERRE];
const inicioTramo = (n: number) => inicioEn(TRAMOS, n);
const DURACION_TOTAL = inicioTramo(TRAMOS.length);
const T1 = inicioTramo(1);
const CORTA: Version = {
  tramos: TRAMOS,
  // La pista dura 32 s (960 fotogramas): se retrasa lo justo para que acabe con el vídeo
  // y su golpe (8,5 s de la pista) caiga cuando todo se junta en Evidran.
  musica: "anuncio12/musica.mp3",
  retraso: DURACION_TOTAL - 960,
  rotulos: [
    [T1, JUNTA, "Tu sistema de gestión, en\u00a0diez\u00a0sitios."],
    [T1 + JUNTA, 40 + 30, "Con Evidran, en uno solo."],
    [inicioTramo(2) + 30, TRAMOS[2].d - 30, "Todo entra por un sitio. Sale\u00a0ordenado."],
    // Dolor: la plantilla en blanco y redactar la NC
    [inicioTramo(3), TRAMOS[3].d, "La NC se escribe en una\u00a0conversación."],
    // Dolor: que lo vencido lo descubra el auditor
    [inicioTramo(4), TRAMOS[4].d, "Lo vencido lo ves tú, no\u00a0el\u00a0auditor."],
    // Dolor: «esto ya nos pasó» y nadie encuentra cómo se resolvió
    [inicioTramo(5), TRAMOS[5].d, "¿Ya os pasó? Te recuerda cómo se\u00a0resolvió."],
    // Dolor: inventarse los objetivos de calidad para la auditoría
    [inicioTramo(6), TRAMOS[6].d, "Y te propone objetivos con\u00a0tus\u00a0datos."],
  ],
};

// Larga (48 s, LinkedIn 16:9): calidad primero y, cuando sube la música, el sistema integrado.
const TRAMOS_LARGO: Tramo[] = [
  GANCHO,
  CAOS,
  { ...FLUJO, d: 115 },
  { ...T_ENTREVISTA, d: 115 },
  T_NC_AMBIENTAL, // empieza en el fotograma 555 (18,5 s), justo cuando sube la música
  T_MIDIA,
  { ...T_CASOS, d: 120 },
  T_PLAN,
  T_CAUSAS,
  T_ACTA,
  { ...FRASE, d: 80 },
  { ...CIERRE, d: 120 },
];
const iL = (n: number) => inicioEn(TRAMOS_LARGO, n);
const dL = (n: number) => TRAMOS_LARGO[n].d;
const LARGA: Version = {
  tramos: TRAMOS_LARGO,
  // Pista de 48 s (ElevenLabs Music v2.5 vía Higgsfield, 23/11/2026): acento a los 8,5 s y subida
  // fuerte a los 17,5 s. Con 1 s de retraso, el acento cae en «Con Evidran, en uno solo» y la
  // subida, al entrar la NC ambiental.
  musica: "anuncio12/musica-larga.mp3",
  retraso: 30,
  rotulos: [
    [T1, JUNTA, "Tu sistema de gestión, en\u00a0diez\u00a0sitios."],
    [T1 + JUNTA, 40 + 30, "Con Evidran, en uno solo."],
    [iL(2) + 30, dL(2) - 30, "Todo entra por un sitio. Sale\u00a0ordenado."],
    [iL(3), dL(3), "La NC se escribe en una\u00a0conversación."],
    [iL(4), dL(4), "¿También la 14001? En el mismo\u00a0sitio."],
    [iL(5), dL(5), "Lo vencido lo ves tú, no\u00a0el\u00a0auditor."],
    [iL(6), dL(6), "¿Ya os pasó? Te recuerda cómo se\u00a0resolvió."],
    [iL(7), dL(7), "Calidad, medio ambiente y seguridad: un\u00a0solo\u00a0plan."],
    [iL(8), dL(8), "Y te propone objetivos con\u00a0tus\u00a0datos."],
    [iL(9), dL(9), "Y te redacta la revisión por la\u00a0dirección."],
  ],
};

export const Anuncio12: React.FC<Anuncio12Props> = ({ tema, formato, largo }) => {
  const v = largo ? LARGA : CORTA;
  const total = inicioEn(v.tramos, v.tramos.length);
  return (
  <TemaCtx.Provider value={TEMAS[tema]}>
    <MaquetaCtx.Provider value={MAQUETAS[formato]}>
      <FormatoCtx.Provider value={formato}>
        <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
          <style>{fuentes}</style>
          {/* Música: ElevenLabs Music v2.5 vía Higgsfield (23/11/2026), instrumental. */}
          <Sequence from={v.retraso}>
            <Audio
              src={staticFile(v.musica)}
              volume={(f) =>
                interpolate(f, [0, 9, total - v.retraso - 15, total - v.retraso], [0, 1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              }
            />
          </Sequence>
          {v.tramos.map((t, n) => (
            <Sequence key={n} from={inicioEn(v.tramos, n)} durationInFrames={t.d}>
              {t.gancho && <Gancho />}
              {t.caos && <Desperdigado />}
              {t.flujo && <Flujo />}
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
          {v.rotulos.map(([desde, d, texto]) => (
            <Sequence key={texto} from={desde} durationInFrames={d}>
              <Rotulo texto={texto} duracion={d} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </FormatoCtx.Provider>
    </MaquetaCtx.Provider>
  </TemaCtx.Provider>
  );
};

export const DURACION_ANUNCIO12 = DURACION_TOTAL;
export const DURACION_ANUNCIO12_LARGO = inicioEn(TRAMOS_LARGO, TRAMOS_LARGO.length);
