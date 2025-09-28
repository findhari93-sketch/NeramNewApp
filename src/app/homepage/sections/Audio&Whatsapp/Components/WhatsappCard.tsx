"use client";
import React from "react";
import Box from "@mui/material/Box";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
};

export default function WhatsappCard({ src, alt }: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 320,
        mx: "auto",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        border: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.16)",
        },
      }}
    >
      <Image
        src={src}
        alt={alt ?? "Whatsapp screenshot"}
        width={320}
        height={480}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </Box>
  );
}
