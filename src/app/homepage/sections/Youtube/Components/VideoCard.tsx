"use client";
import React from "react";
import Box from "@mui/material/Box";

type Props = {
  thumbUrl: string;
  title: string;
  onClick: () => void;
};

export default function VideoCard({ thumbUrl, title, onClick }: Props) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        p: 1,
        borderRadius: 1,
        boxShadow: 1,
        cursor: "pointer",
        aspectRatio: "16 / 9",
        "&:hover": { boxShadow: 3 },
      }}
      aria-label={title}
      role="button"
    >
      <Box
        component="img"
        src={thumbUrl}
        alt={title}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 1,
        }}
      />
    </Box>
  );
}
