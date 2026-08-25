import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type KnowledgeRowProps = {
  label: string;
  value: string;
  delay: number;
};

const KnowledgeRow: React.FC<KnowledgeRowProps> = ({label, value, delay}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px 1fr 44px",
        alignItems: "center",
        gap: 22,
        minHeight: 112,
        padding: "0 30px",
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(2, 26, 73, 0.09)",
        boxShadow: "0 14px 32px rgba(2, 26, 73, 0.07)",
        opacity: interpolate(frame, [delay, delay + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(frame, [delay, delay + 18], ["30px 0px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1277EB",
          backgroundColor: "#EAF3FE",
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        ✓
      </div>
      <div>
        <div
          style={{
            color: "#55708F",
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 6,
            color: "#021A49",
            fontSize: 34,
            fontWeight: 760,
          }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          backgroundColor: "#15B8A6",
          boxShadow: "0 0 0 8px rgba(21, 184, 166, 0.10)",
        }}
      />
    </div>
  );
};

export const EvidranKnowledgeBroll: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill
      name="Evidran knowledge B-roll"
      style={{
        overflow: "hidden",
        backgroundColor: "#F7F6F2",
        fontFamily: "Inter Tight, Inter, Arial, sans-serif",
        opacity: interpolate(frame, [durationInFrames - 18, durationInFrames - 1], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.7, 0, 0.84, 0),
        }),
      }}
    >
      <Interactive.Div
        name="Blue corner"
        style={{
          position: "absolute",
          width: 760,
          height: 620,
          right: -180,
          top: -220,
          borderRadius: 120,
          rotate: "-8deg",
          background: "linear-gradient(135deg, #1277EB 0%, #0756C7 100%)",
          opacity: 0.98,
        }}
      />
      <Interactive.Div
        name="Navy corner"
        style={{
          position: "absolute",
          width: 480,
          height: 330,
          left: -260,
          bottom: -170,
          borderRadius: 96,
          rotate: "8deg",
          backgroundColor: "#021A49",
        }}
      />

      <Img
        name="Evidran logo"
        src={staticFile("evidran-logo.png")}
        style={{
          position: "absolute",
          left: 106,
          top: 82,
          width: 330,
          height: "auto",
          opacity: interpolate(frame, [0, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 16], ["0px -22px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      <Interactive.Div
        name="Observation card"
        style={{
          position: "absolute",
          left: 190,
          top: 290,
          width: 440,
          height: 180,
          boxSizing: "border-box",
          padding: "30px 34px",
          borderRadius: 28,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(2, 26, 73, 0.10)",
          boxShadow: "0 22px 60px rgba(2, 26, 73, 0.12)",
          opacity: interpolate(frame, [10, 28, 105, 128], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          translate: interpolate(frame, [10, 28, 105, 128], ["-80px 45px", "0px 0px", "0px 0px", "480px 80px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          rotate: interpolate(frame, [10, 28, 105, 128], ["-10deg", "-4deg", "-4deg", "0deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{color: "#1277EB", fontSize: 22, fontWeight: 800, letterSpacing: 1.6}}>OBSERVACIÓN</div>
        <div style={{marginTop: 18, color: "#021A49", fontSize: 35, fontWeight: 760, lineHeight: 1.18}}>
          Tres unidades con el clip invertido
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Evidence card"
        style={{
          position: "absolute",
          left: 710,
          top: 220,
          width: 400,
          height: 168,
          boxSizing: "border-box",
          padding: "28px 32px",
          borderRadius: 28,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(2, 26, 73, 0.10)",
          boxShadow: "0 22px 60px rgba(2, 26, 73, 0.11)",
          opacity: interpolate(frame, [20, 38, 108, 132], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          translate: interpolate(frame, [20, 38, 108, 132], ["0px -70px", "0px 0px", "0px 0px", "210px 120px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          rotate: interpolate(frame, [20, 38, 108, 132], ["7deg", "3deg", "3deg", "0deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{color: "#15B8A6", fontSize: 22, fontWeight: 800, letterSpacing: 1.6}}>EVIDENCIA</div>
        <div style={{marginTop: 17, color: "#021A49", fontSize: 35, fontWeight: 760, lineHeight: 1.18}}>
          Control final · RV-330
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Cause card"
        style={{
          position: "absolute",
          left: 520,
          top: 590,
          width: 430,
          height: 175,
          boxSizing: "border-box",
          padding: "29px 34px",
          borderRadius: 28,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(2, 26, 73, 0.10)",
          boxShadow: "0 22px 60px rgba(2, 26, 73, 0.11)",
          opacity: interpolate(frame, [30, 48, 111, 136], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          translate: interpolate(frame, [30, 48, 111, 136], ["-30px 90px", "0px 0px", "0px 0px", "380px -110px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          rotate: interpolate(frame, [30, 48, 111, 136], ["-8deg", "-2deg", "-2deg", "0deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{color: "#1277EB", fontSize: 22, fontWeight: 800, letterSpacing: 1.6}}>CAUSA</div>
        <div style={{marginTop: 17, color: "#021A49", fontSize: 35, fontWeight: 760, lineHeight: 1.18}}>
          Información pendiente de analizar
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Typing dots"
        style={{
          position: "absolute",
          left: 1170,
          top: 500,
          width: 280,
          height: 118,
          borderRadius: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 24px 70px rgba(2, 26, 73, 0.16)",
          opacity: interpolate(frame, [42, 58, 105, 128], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
          }),
          scale: interpolate(frame, [42, 58, 105, 128], [0.86, 1, 1, 0.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({damping: 200}),
            output: "perceptual-scale",
          }),
        }}
      >
        <div style={{width: 24, height: 24, borderRadius: 999, backgroundColor: "#1277EB", scale: interpolate(frame, [48, 56, 64, 72], [0.72, 1, 0.72, 0.72], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})}} />
        <div style={{width: 24, height: 24, borderRadius: 999, backgroundColor: "#1277EB", scale: interpolate(frame, [58, 66, 74, 82], [0.72, 1, 0.72, 0.72], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})}} />
        <div style={{width: 24, height: 24, borderRadius: 999, backgroundColor: "#1277EB", scale: interpolate(frame, [68, 76, 84, 92], [0.72, 1, 0.72, 0.72], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)})}} />
      </Interactive.Div>

      <Interactive.Div
        name="Knowledge headline"
        style={{
          position: "absolute",
          left: 118,
          top: 330,
          width: 740,
          opacity: interpolate(frame, [128, 154], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [128, 154], ["-56px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div style={{color: "#1277EB", fontSize: 27, fontWeight: 820, letterSpacing: 3.2, textTransform: "uppercase"}}>
          Del registro al aprendizaje
        </div>
        <div style={{marginTop: 28, color: "#021A49", fontSize: 92, fontWeight: 850, lineHeight: 0.98, letterSpacing: -3.6}}>
          Cada NC genera conocimiento
        </div>
        <div style={{marginTop: 42, display: "flex", gap: 14}}>
          <div style={{padding: "14px 22px", borderRadius: 999, color: "#021A49", backgroundColor: "#E7EEF7", fontSize: 24, fontWeight: 760}}>Detectar</div>
          <div style={{padding: "14px 22px", borderRadius: 999, color: "#021A49", backgroundColor: "#E7EEF7", fontSize: 24, fontWeight: 760}}>Entender</div>
          <div style={{padding: "14px 22px", borderRadius: 999, color: "#FFFFFF", backgroundColor: "#1277EB", fontSize: 24, fontWeight: 760}}>Mejorar</div>
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Knowledge panel"
        style={{
          position: "absolute",
          right: 120,
          top: 216,
          width: 790,
          height: 650,
          boxSizing: "border-box",
          padding: "38px",
          borderRadius: 44,
          backgroundColor: "rgba(239, 245, 252, 0.97)",
          border: "1px solid rgba(18, 119, 235, 0.16)",
          boxShadow: "0 34px 90px rgba(2, 26, 73, 0.18)",
          opacity: interpolate(frame, [108, 138], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [108, 138], ["80px 28px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [108, 138], [0.94, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({damping: 200}),
            output: "perceptual-scale",
          }),
        }}
      >
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30}}>
          <div>
            <div style={{color: "#55708F", fontSize: 22, fontWeight: 800, letterSpacing: 1.8}}>NC · 0142</div>
            <div style={{marginTop: 8, color: "#021A49", fontSize: 43, fontWeight: 820}}>Conocimiento útil</div>
          </div>
          <div style={{width: 104, height: 48, borderRadius: 999, color: "#0B7C70", backgroundColor: "#DDF8F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 820}}>
            ACTIVA
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 18}}>
          <KnowledgeRow label="Evidencia" value="Qué ocurrió y dónde" delay={132} />
          <KnowledgeRow label="Causa" value="Por qué pudo ocurrir" delay={144} />
          <KnowledgeRow label="Acción" value="Cómo evitar que se repita" delay={156} />
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <Composition
      id="EvidranKnowledgeBroll"
      component={EvidranKnowledgeBroll}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
