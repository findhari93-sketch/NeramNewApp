"use client";
import React from "react";
import Box from "@mui/material/Box";
import AdvantageCard from "./AdvantageCard";
import { advantagesData } from "./data";

export default function AdvantageGrid() {
  return (
    <Box
      sx={{
        display: { xs: "block", lg: "flex" },
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: { lg: 3 },
        py: 5,
      }}
    >
      {advantagesData.map((advantage, index) => (
        <Box
          key={index}
          sx={{
            flex: { lg: 1 },
            maxWidth: { lg: "20%" },
          }}
        >
          <AdvantageCard advantage={advantage} />
        </Box>
      ))}
    </Box>
  );
}
