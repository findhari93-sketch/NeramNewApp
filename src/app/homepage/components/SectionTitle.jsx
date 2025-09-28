"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

// Section title block with optional subtitle
const SectionTitle = ({ title, subtitle, titleColor, subTitleColor }) => {
  const theme = useTheme();
  const resolvedTitleColor =
    titleColor ?? theme.palette.custom?.violet ?? theme.palette.primary.main;
  const resolvedSubTitleColor = subTitleColor ?? theme.palette.text.primary;

  return (
    <Box className="section-title">
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: resolvedTitleColor }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="subtitle2" sx={{ color: resolvedSubTitleColor }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
};

// Large logo-like title with a smaller subtitle
const LogoTitle = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "2rem",
          color: theme.palette.custom?.violet ?? theme.palette.primary.main,
          mb: "5px",
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          component="p"
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color:
              theme.palette.custom?.lightViolet ?? theme.palette.text.secondary,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </>
  );
};

export { SectionTitle, LogoTitle };
