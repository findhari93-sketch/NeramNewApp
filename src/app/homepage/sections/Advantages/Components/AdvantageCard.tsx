"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import type { AdvantageItem } from "./data";

type Props = {
  advantage: AdvantageItem;
};

export default function AdvantageCard({ advantage }: Props) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: { xs: "row", lg: "column" },
        textAlign: { xs: "left", lg: "center" },
        my: { xs: 3, lg: 0 },
        px: { xs: 0, lg: 2 },
      }}
    >
      <Box
        sx={{
          mr: { xs: 4, lg: 0 },
          mb: { xs: 0, lg: 2 },
          flexShrink: 0,
        }}
      >
        <Image
          src={advantage.imageUrl}
          alt={advantage.altText}
          width={80}
          height={80}
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
          }}
        />
      </Box>

      <Typography
        variant="body1"
        sx={{
          fontSize: "1rem",
          fontWeight: 700,
          color: theme.palette.custom?.violet ?? theme.palette.primary.main,
          mt: { xs: 0, lg: 2 },
          whiteSpace: "pre-line",
        }}
      >
        {advantage.name}
      </Typography>
    </Box>
  );
}
