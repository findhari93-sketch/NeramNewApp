"use client";
import React from "react";
import IconButton from "@mui/material/IconButton";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";

export type ArrowProps = {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function SampleNextArrow({ onClick, className, style }: ArrowProps) {
  return (
    <IconButton
      onClick={onClick}
      className={className}
      sx={{
        position: "absolute",
        top: "50%",
        right: 8,
        transform: "translateY(-50%)",
        bgcolor: "rgba(0,0,0,0.5)",
        color: "#fff",
        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
      }}
      style={style}
      aria-label="Next"
    >
      <ChevronRightRounded />
    </IconButton>
  );
}

export function SamplePrevArrow({ onClick, className, style }: ArrowProps) {
  return (
    <IconButton
      onClick={onClick}
      className={className}
      sx={{
        position: "absolute",
        top: "50%",
        left: 8,
        transform: "translateY(-50%)",
        bgcolor: "rgba(0,0,0,0.5)",
        color: "#fff",
        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
      }}
      style={style}
      aria-label="Previous"
    >
      <ChevronLeftRounded />
    </IconButton>
  );
}
