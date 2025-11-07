"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function StepHeader({ title, steps }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 1.5,
      }}
    >
      <Typography sx={{ fontSize: 18, color: "#7c1fa0", fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#7c1fa0" }}>{steps}</Typography>
    </Box>
  );
}
