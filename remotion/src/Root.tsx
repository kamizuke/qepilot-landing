import React from "react";
import "./index.css";
import { AbsoluteFill, Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Anuncio01, Anuncio01Props, DURACION_ANUNCIO01 } from "./Anuncio01";
import { Anuncio01Gancho, DURACION_GANCHO } from "./Anuncio01Gancho";

// 9:16 (historias y reels): la pieza 4:5 centrada sobre fondo crema.
const Anuncio01GanchoVertical: React.FC<Anuncio01Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio01Gancho tema={tema} />
    </div>
  </AbsoluteFill>
);

const Anuncio01Vertical: React.FC<Anuncio01Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio01 tema={tema} />
    </div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {(["crema", "azul"] as const).map((tema) => (
        <React.Fragment key={tema}>
          <Composition id={`Anuncio01-${tema}`} component={Anuncio01} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO01} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio01Gancho-${tema}`} component={Anuncio01Gancho} defaultProps={{ tema }} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio01GanchoVertical-${tema}`} component={Anuncio01GanchoVertical} defaultProps={{ tema }} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio01Vertical-${tema}`} component={Anuncio01Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO01} fps={30} width={1080} height={1920} />
        </React.Fragment>
      ))}
    </>
  );
};
