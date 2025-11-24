"use client";
import React from "react";
import Box from "@mui/material/Box";
import Image from "next/image";

type LogoProps = {
  sx?: any;
};

function NeramLogo({ sx }: LogoProps) {
  // Extract height from sx if provided, otherwise use default
  const height = sx?.height || 32;

  return (
    <Box sx={sx}>
      <Image
        src="/brand/neramclasses-logo.svg"
        alt="Online NATA Coaching center in coimbatore"
        width={120}
        height={40}
        priority
        style={{
          width: "auto",
          height: typeof height === "number" ? `${height}px` : height,
        }}
      />
    </Box>
  );
}

function MobileLogo({ sx }: LogoProps) {
  return (
    <Box
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.171)",
        padding: "0.5rem",
        color: "#fff !important",
        borderRadius: "5px",
        letterSpacing: "0.5px",
        fontFamily: "Roboto, sans-serif",
        cursor: "pointer",
        transition: "0.1s ease-in",
        "&:hover": {
          backgroundColor: "#fff",
          color: "#54285c !important",
        },
        ...sx,
      }}
    >
      <Box component="b">neram</Box>Classes
    </Box>
  );
}

export { NeramLogo, MobileLogo };
