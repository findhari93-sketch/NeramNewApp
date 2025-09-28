"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

type ArrowSide = "left" | "right";

type BaseArrowProps = {
  onClick?: () => void;
  side: ArrowSide;
  defaultSrc: string;
  hoverSrc: string;
  size?: number; // px
};

const toPublic = (p: string) => (p && !p.startsWith("/") ? `/${p}` : p);

/**
 * Generic MUI arrow with image swap on hover.
 * Places itself absolutely at vertical center on the requested side.
 */
export function CarouselArrow({
  onClick,
  side,
  defaultSrc,
  hoverSrc,
  size = 50,
}: BaseArrowProps) {
  const [hover, setHover] = useState(false);
  const src = hover ? hoverSrc : defaultSrc;

  return (
    <IconButton
      aria-label={side === "left" ? "Previous" : "Next"}
      onClick={onClick}
      disableRipple
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: side === "left" ? 8 : "auto",
        right: side === "right" ? 8 : "auto",
        zIndex: 2,
        p: 0,
        bgcolor: "transparent",
        "&:hover": { bgcolor: "transparent" },
      }}
    >
      <Box
        component="img"
        src={toPublic(src)}
        alt={side === "left" ? "Previous" : "Next"}
        sx={{
          height: size,
          width: "auto",
          display: "block",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "scale(1.04)" },
        }}
      />
    </IconButton>
  );
}

/**
 * Preset arrows using your assets under public/images.
 * Note: file names with spaces must be URL-encoded (%20).
 */
export function SamplePrevArrow({
  onClick,
  size,
}: {
  onClick?: () => void;
  size?: number;
}) {
  return (
    <CarouselArrow
      onClick={onClick}
      side="left"
      size={size}
      defaultSrc="/images/img/iconset/nav/Separated/SVG/Asset%206.svg"
      hoverSrc="/images/img/iconset/nav/Separated/SVG/Asset%207.svg"
    />
  );
}

export function SampleNextArrow({
  onClick,
  size,
}: {
  onClick?: () => void;
  size?: number;
}) {
  return (
    <CarouselArrow
      onClick={onClick}
      side="right"
      size={size}
      defaultSrc="/images/img/iconset/nav/Separated/SVG/Asset%205.svg"
      hoverSrc="/images/img/iconset/nav/Separated/SVG/Asset%204.svg"
    />
  );
}
