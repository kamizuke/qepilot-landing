import React from "react";
import "./index.css";
import { AbsoluteFill, Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Anuncio01, Anuncio01Props, DURACION_ANUNCIO01 } from "./Anuncio01";
import { Anuncio01Gancho, DURACION_GANCHO } from "./Anuncio01Gancho";
import { Anuncio03, DURACION_ANUNCIO03 } from "./Anuncio03";
import { Anuncio11, DURACION_ANUNCIO11 } from "./Anuncio11";
import { Anuncio12, Anuncio12Props, DURACION_ANUNCIO12, DURACION_ANUNCIO12_LARGO } from "./Anuncio12";
import { Anuncio13, Anuncio13Props, DURACION_ANUNCIO13 } from "./Anuncio13";
import { Anuncio13Li, DURACION_ANUNCIO13LI } from "./Anuncio13Li";
import { Anuncio14, DURACION_ANUNCIO14 } from "./Anuncio14";

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

const Anuncio12Vertical: React.FC<Anuncio12Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio12 tema={tema} formato="4x5" />
    </div>
  </AbsoluteFill>
);

const Anuncio13Vertical: React.FC<Anuncio13Props> = ({ tema }) => (
  <AbsoluteFill style={{ backgroundColor: tema === "azul" ? "#2563EB" : "#F7F6F2", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 1080, height: 1350 }}>
      <Anuncio13 tema={tema} formato="4x5" />
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
      {/* Anuncio 14 solo para LinkedIn: la transición a ISO 9001:2026 / 14001:2026 */}
      <Composition id="Anuncio14" component={Anuncio14} durationInFrames={DURACION_ANUNCIO14} fps={30} width={1920} height={1080} />
      {/* Anuncio 13 solo para LinkedIn: cuatro versiones con estética y música propias */}
      {(["editorial", "noche", "proceso", "cifras"] as const).map((estilo) => (
        <Composition key={estilo} id={`Anuncio13Li-${estilo}`} component={Anuncio13Li} defaultProps={{ estilo }} durationInFrames={DURACION_ANUNCIO13LI} fps={30} width={1920} height={1080} />
      ))}
      {(["crema", "azul"] as const).map((tema) => (
        <React.Fragment key={tema}>
          <Composition id={`Anuncio01-${tema}`} component={Anuncio01} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO01} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio01Gancho-${tema}`} component={Anuncio01Gancho} defaultProps={{ tema }} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio01GanchoVertical-${tema}`} component={Anuncio01GanchoVertical} defaultProps={{ tema }} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio03-${tema}`} component={Anuncio03} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO03} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio03Vertical-${tema}`} component={Anuncio03Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO03} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio11-${tema}`} component={Anuncio11} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO11} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio11Vertical-${tema}`} component={Anuncio11Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO11} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio12-${tema}`} component={Anuncio12} defaultProps={{ tema, formato: "4x5" as const }} durationInFrames={DURACION_ANUNCIO12} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio12Vertical-${tema}`} component={Anuncio12Vertical} defaultProps={{ tema, formato: "4x5" as const }} durationInFrames={DURACION_ANUNCIO12} fps={30} width={1080} height={1920} />
          {/* LinkedIn: vídeo ancho 16:9 */}
          <Composition id={`Anuncio12Ancho-${tema}`} component={Anuncio12} defaultProps={{ tema, formato: "16x9" as const }} durationInFrames={DURACION_ANUNCIO12} fps={30} width={1920} height={1080} />
          <Composition id={`Anuncio12Largo-${tema}`} component={Anuncio12} defaultProps={{ tema, formato: "16x9" as const, largo: true }} durationInFrames={DURACION_ANUNCIO12_LARGO} fps={30} width={1920} height={1080} />
          <Composition id={`Anuncio13-${tema}`} component={Anuncio13} defaultProps={{ tema, formato: "4x5" as const }} durationInFrames={DURACION_ANUNCIO13} fps={30} width={1080} height={1350} />
          <Composition id={`Anuncio13Vertical-${tema}`} component={Anuncio13Vertical} defaultProps={{ tema, formato: "4x5" as const }} durationInFrames={DURACION_ANUNCIO13} fps={30} width={1080} height={1920} />
          <Composition id={`Anuncio13Ancho-${tema}`} component={Anuncio13} defaultProps={{ tema, formato: "16x9" as const }} durationInFrames={DURACION_ANUNCIO13} fps={30} width={1920} height={1080} />
          <Composition id={`Anuncio01Vertical-${tema}`} component={Anuncio01Vertical} defaultProps={{ tema }} durationInFrames={DURACION_ANUNCIO01} fps={30} width={1080} height={1920} />
        </React.Fragment>
      ))}
    </>
  );
};
