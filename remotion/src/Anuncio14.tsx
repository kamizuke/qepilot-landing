// Anuncio 14 · «Transición 2026» (solo LinkedIn, 16:9, 44 s, sin locución).
// Para quien tiene que pasar su certificado a ISO 9001:2026 (y, si la tiene, a ISO 14001:2026):
// la transición la va a hacer igual; con Evidran la hace una vez y sobre sus datos.
// Estética propia, distinta de 12, 13 y las cuatro versiones de 13Li: papel de norma, números de
// apartado en monoespaciada, verde azulado y ámbar, cabecera de documento arriba. Pista con
// tic-tac al principio que cambia a los 15,5 s, cuando entra Evidran.
// Capturas reales de la org de pruebas (24/11/2026), retocadas en pantalla como «Metalúrgica Duero».
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Cierre, FUENTE, TemaCtx, fuentes, suave } from "./Anuncio01";

const PAPEL = "#F6F5F0";
const TINTA = "#1E2A2F";
const GRIS = "#5D6B70";
const VERDE = "#0F766E";
const VERDE_CLARO = "#CDEDE6";
const AMBAR = "#B45309";
const AMBAR_CLARO = "#FDE7B0";
const MONO = "Menlo, 'SF Mono', Consolas, monospace";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ap = (f: number, d: number, dur = 14) => interpolate(f, [d, d + dur], [0, 1], { ...cl, easing: suave });

// ---------- Montaje (30 fps) ----------
// Sin locución (24/11: se probó con voz de ElevenLabs y no había ninguna con acento de España
// fiable). Ningún rótulo dura menos de ~3 s; la línea de ChatGPT, unos 4 s.
const E = {
  gancho: [0, 150],
  cambios: [150, 150],
  dolor: [300, 165],
  giro: [465, 75],
  detecta: [540, 180],
  clic: [720, 160],
  plan: [880, 150],
  medioambiente: [1030, 105],
  frase: [1135, 90],
  cierre: [1225, 100],
} as const;
export const DURACION_ANUNCIO14 = 1325;
// Desplaza la pista (fotogramas): >0 la retrasa, <0 la adelanta. Medida (pista de 55 s): el tic-tac
// dura hasta los 15 s; retrasada 0,5 s, el cambio cae a los 15,5 s, justo cuando entra Evidran. La
// pista sigue más allá del final del vídeo: se funde en el último segundo.
const AJUSTE_MUSICA = 15;

// ---------- Iconos de línea ----------
type NombreIcono = "reloj" | "clima" | "balanza" | "personas" | "cambio" | "lupa" | "lista" | "hoja" | "chat" | "datos" | "check";
const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  reloj: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  clima: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  balanza: (
    <>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </>
  ),
  personas: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  cambio: <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />,
  lupa: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  lista: <path d="M11 6h10M11 12h10M11 18h10M3 6l1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />,
  hoja: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  chat: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  datos: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};
const Icono: React.FC<{ n: NombreIcono; t?: number; c?: string; g?: number }> = ({ n, t = 48, c = "currentColor", g = 1.7 }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={g} strokeLinecap="round" strokeLinejoin="round">
    {TRAZOS[n]}
  </svg>
);
// Icono en un cuadrado redondeado (no círculo: es la forma de esta pieza).
const Sello: React.FC<{ n: NombreIcono; t: number; fondo?: string; c?: string }> = ({ n, t, fondo = VERDE_CLARO, c = VERDE }) => (
  <div style={{ width: t, height: t, borderRadius: t * 0.26, backgroundColor: fondo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Icono n={n} t={t * 0.52} c={c} />
  </div>
);

// ---------- Fondo de papel con renglones finos ----------
const Papel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: PAPEL,
      backgroundImage: "repeating-linear-gradient(180deg, transparent 0 59px, rgba(30,42,47,.045) 59px 60px)",
      fontFamily: FUENTE,
      color: TINTA,
    }}
  >
    {children}
  </AbsoluteFill>
);

// Cabecera de documento: referencia a la izquierda, página a la derecha.
const Cabecera: React.FC<{ ref_: string; pag: string }> = ({ ref_, pag }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 160, right: 160, top: 48, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: GRIS, opacity: ap(f, 0, 10) }}>
      <span>{ref_}</span>
      <span>{pag}</span>
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, height: 1, backgroundColor: "rgba(30,42,47,.18)" }} />
    </div>
  );
};

// ---------- 1 · Gancho: 2015 → 2026 ----------
const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const gira = interpolate(f, [34, 50], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const alto = 230;
  return (
    <Papel>
      <Cabecera ref_="NORMA · EDICIÓN" pag="01" />
      <div style={{ position: "absolute", left: 160, top: 300, display: "flex", alignItems: "flex-end", gap: 0, opacity: ap(f, 0) }}>
        <span style={{ fontSize: alto, fontWeight: 800, letterSpacing: -8, lineHeight: 1 }}>ISO 9001:&nbsp;</span>
        <div style={{ height: alto, overflow: "hidden", position: "relative", width: 560 }}>
          <div style={{ transform: `translateY(${-gira * alto}px)` }}>
            <div style={{ height: alto, fontSize: alto, fontWeight: 800, letterSpacing: -8, lineHeight: 1, color: "#9AA5A8" }}>2015</div>
            <div style={{ height: alto, fontSize: alto, fontWeight: 800, letterSpacing: -8, lineHeight: 1, color: VERDE }}>2026</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 166, top: 610, fontSize: 60, fontWeight: 600, letterSpacing: -1, opacity: ap(f, 56, 16), transform: `translateY(${(1 - ap(f, 56, 16)) * 20}px)` }}>
        Ya está publicada. Tu certificado pasará a la nueva edición.
      </div>
      <div style={{ position: "absolute", left: 166, top: 720, display: "flex", alignItems: "center", gap: 18, fontSize: 38, color: GRIS, opacity: ap(f, 80, 16) }}>
        <Icono n="reloj" t={42} c={GRIS} />
        El calendario exacto te lo marca tu certificadora.
      </div>
    </Papel>
  );
};

// ---------- 2 · Qué cambia ----------
const CAMBIOS: { apdo: string; txt: string; n: NombreIcono }[] = [
  { apdo: "4.1", txt: "El cambio climático, valorado en el contexto", n: "clima" },
  { apdo: "6.1.2 · 6.1.3", txt: "Riesgos y oportunidades, por separado", n: "balanza" },
  { apdo: "5.1.1 · 7.3", txt: "Cultura de calidad y comportamiento ético", n: "personas" },
  { apdo: "6.3", txt: "Los cambios del sistema, planificados y revisados", n: "cambio" },
];
const Cambios: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Papel>
      <Cabecera ref_="ISO 9001:2026 · QUÉ CAMBIA" pag="02" />
      <div style={{ position: "absolute", left: 160, top: 210, fontSize: 72, fontWeight: 800, letterSpacing: -2, opacity: ap(f, 0) }}>
        Lo que pide <span style={{ color: VERDE }}>de nuevo</span>, entre otras cosas:
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 370 }}>
        {CAMBIOS.map((c, i) => {
          const a = ap(f, 14 + i * 12, 14);
          return (
            <div
              key={c.apdo}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34,
                height: 136,
                borderBottom: "1px solid rgba(30,42,47,.16)",
                opacity: a,
                transform: `translateY(${(1 - a) * 26}px)`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 34, color: VERDE, width: 290, flexShrink: 0 }}>{c.apdo}</span>
              <Sello n={c.n} t={78} />
              <span style={{ fontSize: 50, fontWeight: 600, letterSpacing: -0.5 }}>{c.txt}</span>
            </div>
          );
        })}
      </div>
    </Papel>
  );
};

// ---------- 3 · El dolor y la objeción ----------
const Dolor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Papel>
      <Cabecera ref_="ISO 9001:2026 · POR DÓNDE EMPIEZO" pag="03" />
      <div style={{ position: "absolute", left: 160, right: 160, top: 320, opacity: ap(f, 0) }}>
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1 }}>
          ¿Leer la norma y comparar a mano
          <br />
          qué tenéis ya y qué falta?
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 640, display: "flex", alignItems: "center", gap: 30, opacity: ap(f, 46, 16), transform: `translateY(${(1 - ap(f, 46, 16)) * 20}px)` }}>
        <Sello n="chat" t={92} fondo="#E7E5DE" c={GRIS} />
        <div style={{ fontSize: 52, lineHeight: 1.25 }}>
          <span style={{ color: GRIS }}>ChatGPT te explica la norma.</span>
          <br />
          <span style={{ fontWeight: 800 }}>No sabe qué tiene ya hecho tu sistema.</span>
        </div>
      </div>
    </Papel>
  );
};

// ---------- 4 · Giro: entra Evidran ----------
const Giro: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 12, 20], [0.5, 1.08, 1], { ...cl, easing: suave });
  return (
    <AbsoluteFill style={{ backgroundColor: VERDE, fontFamily: FUENTE, color: "#fff", justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        <div style={{ width: 150, height: 150, borderRadius: 40, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: ap(f, 0, 10), transform: `scale(${s})` }}>
          <Img src={staticFile("anuncio12/evidran-isotipo.svg")} style={{ width: 104, height: 104 }} />
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, opacity: ap(f, 8) }}>
          Evidran lo comprueba
          <br />
          <span style={{ color: VERDE_CLARO }}>contra tus datos.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Pantalla real con cámara, subrayados y fundido a otra captura ----------
type Captura = { src: string; ancho: number; alto: number };
const C9001: Captura = { src: "anuncio14/transicion-9001.webp", ancho: 2560, alto: 1600 };
const C9001_PLAN: Captura = { src: "anuncio14/transicion-9001-plan.webp", ancho: 2560, alto: 1600 };
const C14001: Captura = { src: "anuncio14/transicion-14001.webp", ancho: 2560, alto: 1600 };
const CPLAN: Captura = { src: "anuncio14/plan-transicion.webp", ancho: 2560, alto: 1600 };

type Foco = { f: number; cx: number; cy: number; w: number };
type Marca = { x: number; y: number; w: number; h: number; f: number; c: string; d?: number };
const CAJA = { x: 160, y: 130, w: 1600, h: 690 };

const encuadre = (cap: Captura, foco: Omit<Foco, "f">) => {
  const anchoImg = CAJA.w / foco.w;
  const altoImg = (anchoImg * cap.alto) / cap.ancho;
  const vh = CAJA.h / altoImg;
  const x = foco.w >= 1 ? -(foco.w - 1) / 2 : Math.min(Math.max(foco.cx - foco.w / 2, 0), 1 - foco.w);
  const y = vh >= 1 ? -(vh - 1) / 2 : Math.min(Math.max(foco.cy - vh / 2, 0), 1 - vh);
  return { x, y, w: foco.w };
};

const Pantalla: React.FC<{
  cap: Captura;
  focos: Foco[];
  marcas: Marca[];
  despues?: { cap: Captura; f: number; marcas: Marca[] };
  cursor?: { de: [number, number]; a: [number, number]; f0: number; f1: number; clic: number };
}> = ({ cap, focos, marcas, despues, cursor }) => {
  const f = useCurrentFrame();
  const fs = focos.map((k) => k.f);
  const es = focos.map((k) => encuadre(cap, k));
  const op = { ...cl, easing: Easing.inOut(Easing.cubic) };
  const x = focos.length > 1 ? interpolate(f, fs, es.map((e) => e.x), op) : es[0].x;
  const y = focos.length > 1 ? interpolate(f, fs, es.map((e) => e.y), op) : es[0].y;
  const w = focos.length > 1 ? interpolate(f, fs, es.map((e) => e.w), op) : es[0].w;
  const anchoImg = CAJA.w / w;
  const altoImg = (anchoImg * cap.alto) / cap.ancho;
  const ent = ap(f, 0, 16);
  const pintar = (ms: Marca[]) =>
    ms.map((m, i) => {
      const p = interpolate(f, [m.f, m.f + (m.d ?? 12)], [0, 1], cl);
      return (
        <div
          key={i}
          style={{ position: "absolute", left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${m.w * p * 100}%`, height: `${m.h * 100}%`, backgroundColor: m.c, mixBlendMode: "multiply", borderRadius: 3 }}
        />
      );
    });
  const fundido = despues ? interpolate(f, [despues.f, despues.f + 8], [0, 1], cl) : 0;
  let cur: React.ReactNode = null;
  if (cursor) {
    const t = interpolate(f, [cursor.f0, cursor.f1], [0, 1], op);
    const cx = cursor.de[0] + (cursor.a[0] - cursor.de[0]) * t;
    const cy = cursor.de[1] + (cursor.a[1] - cursor.de[1]) * t;
    const pulsa = interpolate(f, [cursor.clic, cursor.clic + 4, cursor.clic + 8], [1, 0.82, 1], cl);
    const onda = interpolate(f, [cursor.clic, cursor.clic + 16], [0, 1], cl);
    cur = (
      <div style={{ position: "absolute", left: `${cx * 100}%`, top: `${cy * 100}%`, opacity: ap(f, cursor.f0 - 6, 8) * (1 - ap(f, cursor.clic + 22, 8)) }}>
        {f >= cursor.clic && (
          <div style={{ position: "absolute", left: -40 * onda, top: -40 * onda, width: 80 * onda, height: 80 * onda, borderRadius: "50%", border: `3px solid ${VERDE}`, opacity: 1 - onda }} />
        )}
        <svg width={46} height={46} viewBox="0 0 24 24" style={{ transform: `scale(${pulsa})`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.3))" }}>
          <path d="M4 2.5v17l4.6-4.4 3 6.6 3-1.4-3-6.4h6.4Z" fill={TINTA} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: CAJA.x,
        top: CAJA.y,
        width: CAJA.w,
        height: CAJA.h,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: "0 0 0 1px rgba(30,42,47,.14), 0 24px 60px rgba(30,42,47,.16)",
        opacity: ent,
        transform: `translateY(${(1 - ent) * 30}px)`,
      }}
    >
      <div style={{ position: "absolute", width: anchoImg, height: altoImg, left: -x * anchoImg, top: -y * altoImg }}>
        <Img src={staticFile(cap.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {pintar(marcas)}
        {despues && (
          <div style={{ position: "absolute", inset: 0, opacity: fundido }}>
            <Img src={staticFile(despues.cap.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            {pintar(despues.marcas)}
          </div>
        )}
        {cur}
      </div>
    </div>
  );
};

// Rótulo inferior: etiqueta en monoespaciada + frase; puede cambiar a mitad de plano.
type Texto = { f: number; etiqueta: string; frase: React.ReactNode; nota?: string; icono: NombreIcono; color?: string };
const Rotulo: React.FC<{ textos: Texto[] }> = ({ textos }) => {
  const f = useCurrentFrame();
  const i = textos.reduce((acc, t, k) => (f >= t.f ? k : acc), 0);
  const t = textos[i];
  const a = ap(f, t.f + 4, 14);
  const col = t.color ?? VERDE;
  return (
    <div key={i} style={{ position: "absolute", left: 160, right: 160, top: 862, display: "flex", alignItems: "center", gap: 30, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
      <Sello n={t.icono} t={96} fondo={col === VERDE ? VERDE_CLARO : AMBAR_CLARO} c={col} />
      <div>
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: col, marginBottom: 8 }}>{t.etiqueta}</div>
        <div style={{ fontSize: 52, fontWeight: 750, letterSpacing: -1, lineHeight: 1.05 }}>{t.frase}</div>
        {t.nota && <div style={{ fontSize: 26, color: GRIS, marginTop: 10 }}>{t.nota}</div>}
      </div>
    </div>
  );
};

const AvisoDemo: React.FC = () => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", right: 160, top: 836, fontSize: 20, color: GRIS, opacity: ap(f, 8) * 0.85 }}>Datos de una empresa de demostración</div>;
};

const VERDE_M = "rgba(15,118,110,.20)";
const AMBAR_M = "rgba(245,158,11,.38)";

// ---------- 5 · Detecta lo que ya tienes y marca lo que falta ----------
const Detecta: React.FC = () => (
  <Papel>
    <Cabecera ref_="ISO 9001:2026 · TUS DATOS" pag="04" />
    <Pantalla
      cap={C9001}
      focos={[
        { f: 0, cx: 0.5, cy: 0.45, w: 1 },
        { f: 60, cx: 0.5, cy: 0.7, w: 0.6 },
      ]}
      marcas={[
        { x: 0.243, y: 0.508, w: 0.352, h: 0.034, f: 48, c: VERDE_M },
        { x: 0.243, y: 0.634, w: 0.332, h: 0.034, f: 60, c: VERDE_M },
        { x: 0.243, y: 0.864, w: 0.322, h: 0.034, f: 104, c: AMBAR_M },
      ]}
    />
    <AvisoDemo />
    <Rotulo
      textos={[
        { f: 0, etiqueta: "EVIDENCIA DETECTADA", icono: "lupa", frase: "Lo que ya tienes, encontrado en tus registros.", nota: "No certifica nada: la evidencia la validas tú al firmar." },
        { f: 96, etiqueta: "PENDIENTE", icono: "reloj", color: AMBAR, frase: "Y lo que falta, marcado requisito a requisito." },
      ]}
    />
  </Papel>
);

// ---------- 6 · Un clic: el hueco pasa al Plan ----------
const Clic: React.FC = () => (
  <Papel>
    <Cabecera ref_="ISO 9001:2026 · 6.3" pag="05" />
    <Pantalla
      cap={C9001}
      focos={[
        { f: 0, cx: 0.5, cy: 0.7, w: 0.6 },
        { f: 30, cx: 0.51, cy: 0.88, w: 0.6 },
      ]}
      marcas={[{ x: 0.243, y: 0.906, w: 0.145, h: 0.03, f: 22, c: AMBAR_M }]}
      cursor={{ de: [0.62, 0.78], a: [0.33, 0.92], f0: 26, f1: 50, clic: 54 }}
      despues={{ cap: C9001_PLAN, f: 60, marcas: [{ x: 0.243, y: 0.872, w: 0.316, h: 0.034, f: 66, c: VERDE_M }, { x: 0.243, y: 0.906, w: 0.535, h: 0.026, f: 74, c: VERDE_M, d: 16 }] }}
    />
    <AvisoDemo />
    <Rotulo
      textos={[
        { f: 0, etiqueta: "ENVIAR AL PLAN", icono: "lista", frase: "Un clic, y el hueco pasa a tu Plan de mejora." },
        { f: 62, etiqueta: "EN EL PLAN", icono: "check", frase: "Cuando la acción quede implantada, el requisito queda listo." },
      ]}
    />
  </Papel>
);

// ---------- 7 · El Plan, con el resto de tu sistema ----------
const Plan: React.FC = () => (
  <Papel>
    <Cabecera ref_="PLAN DE MEJORA CONTINUA" pag="06" />
    <Pantalla
      cap={CPLAN}
      focos={[
        { f: 0, cx: 0.625, cy: 0.5, w: 0.82 },
        { f: 70, cx: 0.61, cy: 0.78, w: 0.76 },
      ]}
      marcas={[
        { x: 0.719, y: 0.424, w: 0.098, h: 0.032, f: 20, c: VERDE_M },
        { x: 0.394, y: 0.951, w: 0.345, h: 0.049, f: 66, c: VERDE_M },
        { x: 0.75, y: 0.962, w: 0.175, h: 0.038, f: 76, c: VERDE_M },
      ]}
    />
    <AvisoDemo />
    <Rotulo
      textos={[
        { f: 0, etiqueta: "ORIGEN · TRANSICIÓN 2026", icono: "lista", frase: "Las acciones de la transición, junto al resto de tu sistema." },
        { f: 60, etiqueta: "RESPONSABLE Y PLAZO", icono: "personas", frase: "Con responsable y fecha, como cualquier otra acción." },
      ]}
    />
  </Papel>
);

// ---------- 8 · ¿También la 14001? ----------
const MedioAmbiente: React.FC = () => (
  <Papel>
    <Cabecera ref_="ISO 14001:2026 · MEDIO AMBIENTE" pag="07" />
    <Pantalla
      cap={C14001}
      focos={[
        { f: 0, cx: 0.6, cy: 0.42, w: 0.78 },
        { f: 70, cx: 0.58, cy: 0.45, w: 0.7 },
      ]}
      marcas={[
        { x: 0.235, y: 0.278, w: 0.09, h: 0.03, f: 14, c: VERDE_M },
        { x: 0.353, y: 0.362, w: 0.252, h: 0.03, f: 30, c: VERDE_M },
        { x: 0.311, y: 0.489, w: 0.193, h: 0.03, f: 42, c: AMBAR_M },
        { x: 0.353, y: 0.597, w: 0.275, h: 0.03, f: 54, c: VERDE_M },
      ]}
    />
    <AvisoDemo />
    <Rotulo textos={[{ f: 0, etiqueta: "SI TAMBIÉN TIENES LA 14001", icono: "hoja", frase: "ISO 14001:2026, en el mismo panel." }]} />
  </Papel>
);

// ---------- 9 · Frase ----------
const Frase: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Papel>
      <div style={{ position: "absolute", left: 160, right: 160, top: 330 }}>
        <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -2, color: GRIS, opacity: ap(f, 0) }}>La transición vas a hacerla igual.</div>
        <div style={{ fontSize: 100, fontWeight: 850, letterSpacing: -3, lineHeight: 1.05, marginTop: 24, opacity: ap(f, 20, 16), transform: `translateY(${(1 - ap(f, 20, 16)) * 24}px)` }}>
          Hazla una vez, <span style={{ color: VERDE }}>sobre tus datos.</span>
        </div>
      </div>
    </Papel>
  );
};

const TEMA = { fondo: PAPEL, texto: TINTA, enfasis: VERDE, secundario: GRIS, logo: "anuncio01/evidran-logo.svg" };

export const Anuncio14: React.FC = () => {
  const escenas: [keyof typeof E, React.FC][] = [
    ["gancho", Gancho],
    ["cambios", Cambios],
    ["dolor", Dolor],
    ["giro", Giro],
    ["detecta", Detecta],
    ["clic", Clic],
    ["plan", Plan],
    ["medioambiente", MedioAmbiente],
    ["frase", Frase],
    ["cierre", Cierre],
  ];
  return (
    <TemaCtx.Provider value={TEMA}>
      <AbsoluteFill style={{ backgroundColor: PAPEL }}>
        <style>{fuentes}</style>
        <Sequence from={Math.max(AJUSTE_MUSICA, 0)}>
          <Audio
            src={staticFile("anuncio14/musica.mp3")}
            startFrom={Math.max(-AJUSTE_MUSICA, 0)}
            volume={(f) => {
              const g = f + Math.max(AJUSTE_MUSICA, 0);
              return interpolate(g, [0, 9, DURACION_ANUNCIO14 - 30, DURACION_ANUNCIO14], [0, 1, 1, 0], cl);
            }}
          />
        </Sequence>
        {escenas.map(([k, C]) => (
          <Sequence key={k} from={E[k][0]} durationInFrames={E[k][1]}>
            <C />
          </Sequence>
        ))}
      </AbsoluteFill>
    </TemaCtx.Provider>
  );
};
