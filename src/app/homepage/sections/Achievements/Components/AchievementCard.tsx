"use client";
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const toPublic = (p: string) => (p && !p.startsWith("/") ? `/${p}` : p);

type Props = {
  href: string;
  alt: string;
  bigName: string;
  smallName: string;
};

export default function AchievementCard({
  href,
  alt,
  bigName,
  smallName,
}: Props) {
  return (
    <Stack spacing={0.5} alignItems="center" sx={{ textAlign: "center" }}>
      <Box
        component="img"
        src={toPublic(href)}
        alt={alt}
        sx={{ height: 52, mb: 1 }}
      />
      <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
        {bigName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {smallName}
      </Typography>
    </Stack>
  );
}
