"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";

export default function Clock() {
  // Important: avoid time-based initial render during SSR to prevent hydration mismatches.
  // We start with null (stable on server and client), then set the time after mount.
  const [time, setTime] = useState(null);

  useEffect(() => {
    // Set immediately on mount, then tick every second
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time ? time.getHours() % 12 : 0;
  const minutes = time ? time.getMinutes() : 0;
  const seconds = time ? time.getSeconds() : 0;

  const hourDeg = hours * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <Box
      aria-label="Analog clock"
      role="img"
      sx={{
        position: "relative",
        zIndex: 0,
        width: { xs: "12.5rem", md: "18.6rem" },
        height: { xs: "12.5rem", md: "18.6rem" },
        mx: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        backgroundImage: "url(/images/clock.png)",
        backgroundSize: "cover",
        boxShadow: {
          xs: `0 -20px 20px rgba(255, 255, 255, 0.15), inset 0 -10px 10px rgba(255, 255, 255, 0.15), 0 20px 20px rgba(0, 0, 0, 0.15), inset 0 10px 10px rgba(0, 0, 0, 0.15)`,
          md: `0 -35px 35px rgba(255, 255, 255, 0.15), inset 0 -15px 15px rgba(255, 255, 255, 0.15), 0 35px 35px rgba(0, 0, 0, 0.15), inset 0 15px 15px rgba(0, 0, 0, 0.15)`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          width: { xs: 14, md: 25 },
          height: { xs: 14, md: 25 },
          bgcolor: "#fff",
          borderRadius: "50%",
          zIndex: 960,
        },
      }}
    >
      {/* Hour hand */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: { xs: 8, md: 12 },
          height: { xs: 50, md: 70 },
          bgcolor: "#ff105e",
          borderRadius: "6px 6px 0 0",
          transformOrigin: "bottom center",
          transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
          zIndex: 10,
        }}
      />

      {/* Minute hand */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: { xs: 3, md: 4 },
          height: { xs: 60, md: 100 },
          bgcolor: "#ffffff",
          borderRadius: "6px 6px 0 0",
          transformOrigin: "bottom center",
          transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
          zIndex: 11,
        }}
      />

      {/* Second hand */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: { xs: 2, md: 2 },
          height: { xs: 75, md: 130 },
          bgcolor: "#ffffff",
          borderRadius: "6px 6px 0 0",
          transformOrigin: "bottom center",
          transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
          zIndex: 12,
        }}
      />
    </Box>
  );
}
