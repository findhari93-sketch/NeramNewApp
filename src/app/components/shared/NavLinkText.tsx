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
  const trimmed = badge?.trim();
  const isFree = (trimmed ?? "").toLowerCase() === "free";
  const toTitleCase = (s: string) =>
    s
      .split(/\s+/)
      .map((w) =>
        w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w
      )
      .join(" ");
  const displayBadge = trimmed
    ? isFree
      ? "FREE"
      : toTitleCase(trimmed)
    : null;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0.25,
        textTransform: "none",
      }}
    >
      {displayBadge ? (
        <Box
          sx={(theme) => ({
            color: theme.palette.highlight.main,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.4,
            textTransform: "none",
          })}
        >
          {displayBadge}
        </Box>
      ) : null}

      <Typography
        variant="body2"
        sx={(theme) => ({
          fontWeight: 700,
          lineHeight: 1,
          color: theme.palette.white.main,
        })}
        component="span"
      >
        {primary}
      </Typography>

      {secondary ? (
        <Typography variant="caption">{secondary}</Typography>
      ) : null}
    </Box>
  );
}
