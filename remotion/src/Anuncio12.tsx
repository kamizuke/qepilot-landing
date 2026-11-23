// Anuncio 12 · «Todo tu sistema de gestión, en un solo sitio».
// Lo desperdigado (NC en Excel, aspectos ambientales, requisitos legales, auditorías,
// riesgos, correos, fotos en el móvil) se junta en Evidran. No es solo calidad:
// es todo el sistema de gestión.
// Dos formatos: 4:5 (Meta Ads, y su versión 9:16) y 16:9 (LinkedIn).
// Pantallas: capturas reales de la org demo Metalúrgica Duero (las de la portada).
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cierre, FUENTE, TEMAS, TemaCtx, fuentes, suave } from "./Anuncio01";

export type Anuncio12Props = { tema: "crema" | "azul"; formato: "4x5" | "16x9" };

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
const MAQUETAS: Record<Anuncio12Props["formato"], Maqueta> = {
  "4x5": { banda: 250, rotuloFuente: 64, x: 40, y: 250, w: 1000, h: 1000, avisoFuente: 28, ganchoFuente: 50, ganchoGrande: 122, fraseFuente: 84 },
  "16x9": { banda: 200, rotuloFuente: 66, x: 200, y: 200, w: 1520, h: 800, avisoFuente: 26, ganchoFuente: 54, ganchoGrande: 140, fraseFuente: 100 },
};
const MaquetaCtx = React.createContext<Maqueta>(MAQUETAS["4x5"]);
const useMaqueta = () => React.useContext(MaquetaCtx);
const FormatoCtx = React.createContext<Anuncio12Props["formato"]>("4x5");

// ---------- Rótulo de la franja superior ----------
const Rotulo: React.FC<{ texto: string; duracion: number }> = ({ texto, duracion }) => {
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
type Clave = { f: number; x: number; y: number; w: number };
type Captura = { src: string; ancho: number; alto: number };
const ENTREVISTA: Captura = { src: "anuncio12/evidran-entrevista-2026-10.webp", ancho: 2560, alto: 1290 };
const MIDIA: Captura = { src: "anuncio12/evidran-mi-dia-2026-10.webp", ancho: 2560, alto: 1600 };
const PLAN: Captura = { src: "anuncio12/evidran-plan-2026-10.webp", ancho: 2560, alto: 1600 };
const FIRMA: Captura = { src: "anuncio12/evidran-firma-2026-10.webp", ancho: 1520, alto: 1390 };

const Pantalla: React.FC<{ cap: Captura; claves: Clave[]; aparece?: boolean }> = ({ cap, claves, aparece }) => {
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
      <Img
        src={staticFile(cap.src)}
        style={{ position: "absolute", width: anchoImg, height: altoImg, left: -cam("x") * anchoImg, top: -cam("y") * altoImg, opacity: op }}
      />
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
        {linea("Los aspectos ambientales, en otro.", 12)}
        {linea("Los requisitos legales, en una carpeta.", 24)}
        {linea("Las acciones, en el correo.", 36)}
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: m.ganchoGrande,
          fontWeight: 850,
          letterSpacing: -3,
          lineHeight: 1.02,
          color: tema.enfasis,
          opacity: a(60),
          transform: `scale(${0.94 + 0.06 * a(60)})`,
        }}
      >
        ¿Dónde está todo?
      </div>
    </AbsoluteFill>
  );
};

// ---------- Lo desperdigado (genérico, sin marcas) ----------
type Tipo = "xlsx" | "correo" | "carpeta" | "docx" | "foto" | "nota" | "pdf" | "chat";
type Pieza = { tipo: Tipo; titulo: string };
const PIEZAS: Pieza[] = [
  { tipo: "xlsx", titulo: "Registro NC 2026_v7_FINAL.xlsx" },
  { tipo: "correo", titulo: "RE: RE: RV: acción correctiva lote 214" },
  { tipo: "carpeta", titulo: "Auditoría interna › evidencias (2)" },
  { tipo: "docx", titulo: "Requisitos legales 2026 (revisar).docx" },
  { tipo: "pdf", titulo: "Evaluación de riesgos_firmada.pdf" },
  { tipo: "chat", titulo: "Javi (Mantenimiento)" },
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
        {["acta_reunion (1).pdf", "foto_lote_FINAL2.jpg", "Nueva carpeta", "copia de copia.xlsx"].map((n) => (
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
        Plazo acción 3: ¿viernes?
        <br />
        Preguntar a Javi
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

// Las piezas entran amontonándose; a partir de JUNTA vuelan al centro y
// aparece la tarjeta de Evidran, que crece hasta el tamaño de la pantalla.
const JUNTA = 135;
const Desperdigado: React.FC = () => {
  const f = useCurrentFrame();
  const m = useMaqueta();
  const formato = React.useContext(FormatoCtx);
  const cx = m.x + m.w / 2;
  const cy = m.y + m.h / 2;
  const crece = interpolate(f, [JUNTA + 22, JUNTA + 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
  const logo = interpolate(f, [JUNTA + 30, JUNTA + 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const anchoT = interpolate(crece, [0, 1], [220, m.w]);
  const altoT = interpolate(crece, [0, 1], [220, m.h]);
  return (
    <AbsoluteFill>
      {PIEZAS.map((p, i) => {
        const [x, y, giro] = SITIOS[formato][i];
        const ini = i * 9;
        const entra = interpolate(f, [ini, ini + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
        const j0 = JUNTA + i * 3;
        const va = interpolate(f, [j0, j0 + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
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
      {f >= JUNTA + 22 && (
        <div
          style={{
            position: "absolute",
            left: cx - anchoT / 2,
            top: cy - altoT / 2,
            width: anchoT,
            height: altoT,
            borderRadius: 28,
            backgroundColor: "#fff",
            boxShadow: "0 30px 70px rgba(21,48,74,.22), 0 0 0 1px rgba(21,48,74,.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img src={staticFile("anuncio12/evidran-logo.svg")} style={{ width: 460, opacity: logo, transform: `scale(${0.9 + 0.1 * logo})` }} />
        </div>
      )}
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

const Aviso: React.FC = () => {
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
type Tramo = { d: number; gancho?: boolean; caos?: boolean; cap?: Captura; claves?: Encuadres; aparece?: boolean; frase?: boolean; cierre?: boolean };
// Encuadre quieto los primeros 30 fotogramas y movimiento hasta el fotograma `fin`.
const mov = (de: Omit<Clave, "f">, a: Omit<Clave, "f">, fin: number): Clave[] => [
  { f: 0, ...de },
  { f: 30, ...de },
  { f: fin, ...a },
];
const TRAMOS: Tramo[] = [
  { d: 110, gancho: true },
  // Archivos sueltos que se amontonan y luego se juntan en Evidran
  { d: JUNTA + 75, caos: true },
  // La entrevista y el informe, en el mismo sitio
  {
    d: 110,
    cap: ENTREVISTA,
    aparece: true,
    claves: { "4x5": mov({ x: 0, y: 0, w: 0.5 }, { x: 0.42, y: 0, w: 0.5 }, 100), "16x9": mov({ x: 0, y: 0, w: 0.95 }, { x: 0.4, y: 0.12, w: 0.6 }, 100) },
  },
  // Mi día: lo que vence, venga de donde venga
  {
    d: 115,
    cap: MIDIA,
    claves: { "4x5": mov({ x: 0.19, y: 0, w: 0.6 }, { x: 0.205, y: 0.2, w: 0.5 }, 105), "16x9": mov({ x: 0.19, y: 0, w: 0.81 }, { x: 0.2, y: 0.3, w: 0.8 }, 105) },
  },
  // Plan de mejora: acciones de NC, auditorías, riesgos y cambios, juntas
  {
    d: 115,
    cap: PLAN,
    claves: { "4x5": mov({ x: 0.2, y: 0.06, w: 0.55 }, { x: 0.42, y: 0.12, w: 0.55 }, 105), "16x9": mov({ x: 0.2, y: 0.05, w: 0.8 }, { x: 0.2, y: 0.3, w: 0.8 }, 105) },
  },
  // Aprobado y firmado, con sitio para lo que llegue después (acta, albarán…)
  {
    d: 110,
    cap: FIRMA,
    claves: { "4x5": mov({ x: 0.07, y: 0.17, w: 0.48 }, { x: 0.035, y: 0.12, w: 0.56 }, 100), "16x9": mov({ x: 0.05, y: 0.15, w: 0.7 }, { x: 0.02, y: 0.14, w: 0.96 }, 100) },
  },
  { d: 95, frase: true },
  { d: 95, cierre: true },
];
const inicioTramo = (n: number) => TRAMOS.slice(0, n).reduce((a, t) => a + t.d, 0);

// Rótulos: [desde (fotograma absoluto), duración, texto]
const T1 = inicioTramo(1);
const ROTULOS: [number, number, string][] = [
  [T1, JUNTA, "Tu sistema de gestión, en diez sitios."],
  [T1 + JUNTA, 75, "Con Evidran, en uno solo."],
  [inicioTramo(2), TRAMOS[2].d, "La NC se escribe aquí, no en Word."],
  [inicioTramo(3), TRAMOS[3].d, "Todo lo que vence, de un vistazo."],
  [inicioTramo(4), TRAMOS[4].d, "Acciones de NC, auditorías y riesgos, juntas."],
  [inicioTramo(5), TRAMOS[5].d, "Firmado y archivado, en el expediente."],
];

export const Anuncio12: React.FC<Anuncio12Props> = ({ tema, formato }) => (
  <TemaCtx.Provider value={TEMAS[tema]}>
    <MaquetaCtx.Provider value={MAQUETAS[formato]}>
      <FormatoCtx.Provider value={formato}>
        <AbsoluteFill style={{ backgroundColor: TEMAS[tema].fondo }}>
          <style>{fuentes}</style>
          {/* Música: ElevenLabs Music v2.5 vía Higgsfield (23/11/2026), 32 s, instrumental.
              Sube de intensidad hacia los 8,5 s, cuando todo se junta en Evidran. */}
          <Audio
            src={staticFile("anuncio12/musica.mp3")}
            volume={(f) =>
              interpolate(f, [0, 9, DURACION_ANUNCIO12 - 15, DURACION_ANUNCIO12], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
          {TRAMOS.map((t, n) => (
            <Sequence key={n} from={inicioTramo(n)} durationInFrames={t.d}>
              {t.gancho && <Gancho />}
              {t.caos && <Desperdigado />}
              {t.cap && (
                <>
                  <Pantalla cap={t.cap} claves={t.claves![formato]} aparece={t.aparece} />
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

export const DURACION_ANUNCIO12 = inicioTramo(TRAMOS.length);
