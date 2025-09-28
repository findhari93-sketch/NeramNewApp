"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

export type NeramBadgeProps = {
  content: React.ReactNode;
  width?: number | string;
  height?: number | string;
  color?: string;
  fontSize?: number | string;
  shadow?: string;
  bgColor?: string;
};

export default function NeramBadges({
  content,
  width = 75,
  height = 75,
  color,
  fontSize = 35,
  shadow = "5px 4px 9px 0px rgba(0,0,0,0.4)",
  bgColor,
}: NeramBadgeProps) {
  const theme = useTheme();
  const textColor = color ?? theme.palette.highlight?.main ?? "#fffb01";
  const background = bgColor ?? theme.palette.primary.main;
  return (
    <Box
      sx={{
        width,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: textColor,
        fontWeight: 700,
        fontSize,
        borderRadius: "50%",
        bgcolor: background,
        boxShadow: shadow,
      }}
    >
      <Typography
        component="span"
        sx={{ fontWeight: 700, fontSize: "inherit", color: "inherit" }}
      >
        {content}
      </Typography>
    </Box>
  );
}
