"use client";
import React from "react";
import Box from "@mui/material/Box";
import AchievementCard from "./AchievementCard";
import { AchievementLogos } from "./data";

export default function AchieveLogos() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
        },
        gap: { xs: 3, md: 4 },
        justifyItems: "center",
        alignItems: "start",
      }}
    >
      {AchievementLogos.map((item, idx) => (
        <Box key={idx}>
          <AchievementCard
            href={item.href}
            alt={item.alt}
            bigName={item.bigName}
            smallName={item.smallName}
          />
        </Box>
      ))}
    </Box>
  );
}
