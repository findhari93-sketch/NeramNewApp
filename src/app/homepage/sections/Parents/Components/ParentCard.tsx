"use client";
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

const toPublic = (p: string) => (p && !p.startsWith("/") ? `/${p}` : p);

type Props = {
  item: {
    imagelink: string;
    imagealt: string;
    imageloading?: "lazy" | "eager";
    buttonlink: string;
    description: string;
    identity: string;
    clgname: string;
  };
  onPlayClick: (url: string) => void;
};

export default function ParentCard({ item, onPlayClick }: Props) {
  return (
    <Stack
      spacing={1.25}
      alignItems="center"
      sx={{ textAlign: "center", mt: 4 }}
    >
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <Box
          component="img"
          src={toPublic(item.imagelink)}
          alt={item.imagealt}
          loading={item.imageloading}
          sx={{ maxWidth: 150, height: "auto", display: "block" }}
        />
        <IconButton
          onClick={() => onPlayClick(item.buttonlink)}
          sx={{ position: "absolute", right: 0, bottom: 8, p: 0 }}
          aria-label="Play video"
        >
          <Box
            component="img"
            src={toPublic("images/img/iconset/nav/ic-play.svg")}
            alt="Play"
            sx={{ height: 55 }}
          />
        </IconButton>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ px: { xs: 2, md: 5 }, lineHeight: 1.6 }}
      >
        {item.description}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {item.identity}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.clgname}
      </Typography>
    </Stack>
  );
}
