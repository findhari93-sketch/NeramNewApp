"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  url: string;
  title: string;
  year?: string;
  miniTitle?: string;
};

export default function AudioCard({ url, title, year, miniTitle }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Box
        component="iframe"
        src={url}
        title={title}
        height={100}
        width={290}
        allow="encrypted-media"
        sx={{
          border: "2px solid #88206d",
          borderRadius: "16px",
          boxShadow:
            "0 -10px 15px rgb(255 255 255 / 100%), inset 0 -10px 15px rgb(255 255 255 / 100%), 0 10px 15px rgb(0 0 0 / 40%), inset 0 15px 10px rgb(0 0 0 / 40%)",
        }}
      />
      <Box sx={{ mt: 1 }}>
        {miniTitle ? (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {miniTitle}
          </Typography>
        ) : null}
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {year ? (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {year}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
