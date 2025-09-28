"use client";
import React from "react";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material/styles";

export type SectionBackgroundProps = {
  type?: "grad" | "pink" | "custom"; // grad: theme gradient, pink: theme custom.lightPink, custom: use color prop
  color?: string; // used when type is custom or unspecified
  height?: number | string; // default 750px
  paddingBottomMedium?: number | string; // applied on xs-sm
  paddingBottomLarge?: number | string; // applied on md+
  component?: React.ElementType;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};

export default function SectionBackground({
  type = "custom",
  color,
  height = "auto",
  paddingBottomMedium = 0,
  paddingBottomLarge = 0,
  component = "section",
  sx,
  children,
}: SectionBackgroundProps) {
  const baseSx: SxProps<Theme> = {
    width: "100%",
    height,
    textAlign: "center",
    position: "relative",
    paddingBottom: {
      xs: paddingBottomMedium as any,
      md: paddingBottomLarge as any,
    },
  };

  const bgSx: SxProps<Theme> = (theme) => {
    if (type === "grad") {
      return { backgroundImage: theme.gradients.brand() };
    }
    if (type === "pink") {
      return { backgroundColor: theme.palette.custom?.lightPink ?? "#fdeffd" };
    }
    return { backgroundColor: color ?? theme.palette.grey[200] };
  };

  return (
    <Box component={component} sx={[baseSx, bgSx as any, sx]}>
      {" "}
      {children}{" "}
    </Box>
  );
}
