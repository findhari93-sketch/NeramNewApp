"use client";
import React from "react";
import { styled, keyframes, useTheme } from "@mui/material/styles";

// Animation for the wave motion
const moveForever = keyframes`
  0% { transform: translate3d(-90px, 0, 0); }
  100% { transform: translate3d(85px, 0, 0); }
`;

// SVG wrapper positioned to hug the section edge
const HeroWavesSvg = styled("svg")(({ position }) => ({
  display: "block",
  width: "100%",
  height: 60,
  position: "absolute",
  left: 0,
  right: 0,
  bottom: position === "top" ? "auto" : 0,
  top: position === "top" ? 0 : "auto",
  transform: position === "top" ? "scaleY(-1)" : "none",
  pointerEvents: "none",
}));

// Apply animations to the <use> elements inside each group
const WaveGroup = styled("g")(() => ({
  "& use": {
    animation: `${moveForever} 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite`,
  },
  "&.wave1 use": {
    animationDelay: "-2s",
    animationDuration: "7s",
  },
  "&.wave2 use": {
    animationDelay: "-3s",
    animationDuration: "10s",
  },
  "&.wave3 use": {
    animationDelay: "-4s",
    animationDuration: "13s",
  },
  "&.wave4 use": {
    animationDelay: "-5s",
    animationDuration: "20s",
  },
}));

export default function HeroWaves({ position = "bottom", bgcolor }) {
  const theme = useTheme();
  const fillColor = bgcolor ?? theme.palette.custom?.lightPink ?? "#fdeffd";
  return (
    <HeroWavesSvg
      viewBox="0 24 150 28"
      className="hero-waves"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      position={position}
      role="img"
      aria-hidden
    >
      <defs>
        <path
          id="wave-path"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        />
      </defs>

      <WaveGroup className="wave1">
        <use
          fill="rgba(255,255,255,0.10)"
          x="50"
          xlinkHref="#wave-path"
          y="1"
        />
      </WaveGroup>
      <WaveGroup className="wave2">
        <use
          fill="rgba(255,255,255,0.20)"
          x="50"
          xlinkHref="#wave-path"
          y="-2"
        />
      </WaveGroup>
      <WaveGroup className="wave3">
        <use fill={fillColor} x="50" xlinkHref="#wave-path" y="7" />
      </WaveGroup>
    </HeroWavesSvg>
  );
}
