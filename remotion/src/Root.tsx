import React from "react";
import "./index.css";
import { AbsoluteFill, Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Anuncio01, Anuncio01Props, DURACION_ANUNCIO01 } from "./Anuncio01";
import { Anuncio01Gancho, DURACION_GANCHO } from "./Anuncio01Gancho";
import { Anuncio03, DURACION_ANUNCIO03 } from "./Anuncio03";
import { Anuncio11, DURACION_ANUNCIO11 } from "./Anuncio11";

// 9:16 (historias y reels): la pieza 4:5 centrada sobre fondo crema.
const Anuncio01GanchoVertical: React.FC<Anuncio01Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio01Gancho tema={tema} />
    </div>
  </AbsoluteFill>
);

const Anuncio03Vertical: React.FC<Anuncio01Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio03 tema={tema} />
    </div>
  </AbsoluteFill>
);

const Anuncio11Vertical: React.FC<Anuncio01Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio11 tema={tema} />
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
          <Composition id={`Anuncio03-${tema}`} component={Anuncio03} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO03} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio03Vertical-${tema}`} component={Anuncio03Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO03} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio11-${tema}`} component={Anuncio11} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO11} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio11Vertical-${tema}`} component={Anuncio11Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO11} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio01Vertical-${tema}`} component={Anuncio01Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO01} fps={30} width={1080} height={1920} />
        </React.Fragment>
      ))}
    </>
  );
};
