"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  primary: string;
  badge?: string | null;
  secondary?: string | null;
};

export default function NavLinkText({ primary, badge, secondary }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0.25,
      }}
    >
      {badge ? (
        <Box
          sx={(theme) => ({
            color: theme.palette.warning.main,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.4,
          })}
        >
          {badge.toUpperCase()}
        </Box>
      ) : null}

      <Typography
        variant="body2"
        sx={{ fontWeight: 700, lineHeight: 1 }}
        component="span"
      >
        {primary}
      </Typography>

      {secondary ? (
        <Typography variant="caption" color="text.secondary">
          {secondary}
        </Typography>
      ) : null}
    </Box>
  );
}
