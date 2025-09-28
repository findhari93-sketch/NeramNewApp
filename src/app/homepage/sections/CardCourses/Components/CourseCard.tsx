"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";

export type CourseCardProps = {
  image: string;
  description: string;
  buttonText: string;
  knowMore: string;
  footerText: string;
  index?: number;
  gradientKey: "yellowGreen" | "blueViolet" | "pinkRed";
};

export default function CourseCard({
  image,
  description,
  buttonText,
  knowMore,
  footerText,
  index = 0,
  gradientKey,
}: CourseCardProps) {
  const theme = useTheme();
  const gradient =
    theme.palette.gradients?.[gradientKey] ?? theme.gradients.brand();
  return (
    <Box
      sx={{
        position: "relative",
        maxWidth: 275,
        width: "100%",
        backgroundColor: "#fff",
        boxShadow:
          "0 0 20px rgba(0,0,0,0.14), -8px 10px 17px 0 rgba(0,0,0,0.38)",
        borderRadius: "10px",
        mt: { xs: 6, md: 10 },
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        pb: 0,
        overflow: "visible",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow:
            "0 12px 28px rgba(0,0,0,0.20), 0 8px 16px rgba(0,0,0,0.12)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -6,
          borderRadius: 10,
          backgroundImage: gradient,
          filter: "blur(18px)",
          opacity: 0,
          transition: "opacity 200ms ease",
          zIndex: 0,
          pointerEvents: "none",
        },
        "&:hover::before": {
          opacity: 0.35,
        },
      }}
    >
      {/* Floating image */}
      <Box
        component="img"
        src={image}
        alt="course"
        sx={{
          width: "auto",
          height: 173,
          position: "absolute",
          left: 0,
          right: 0,
          mx: "auto",
          top: index === 1 ? -138 : -104,
          transform: index === 1 ? "scale(0.75)" : "none",
        }}
      />

      {/* Body */}
      <Box sx={{ p: 2, mt: 9 }}>
        {index === 1 ? (
          <Box
            component="img"
            src="/images/logos/NERAM-LIVE.svg"
            alt="NERAM LIVE"
            sx={{
              width: { xs: 125, md: 130 },
              height: "auto",
              position: "relative",
              bottom: 28,
            }}
          />
        ) : null}

        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "20px",
            color: "var(--black900)",
            width: "90%",
            textAlign: "center",
            my: 2,
            mx: "auto",
          }}
        >
          {description}
        </Typography>

        <Link
          href="/NATA_Application_Form_2025"
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="contained"
            sx={{
              py: 1,
              px: 5,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 600,
              backgroundImage: gradient,
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              transition:
                "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
                filter: "brightness(1.06)",
              },
            }}
          >
            {buttonText}
          </Button>
        </Link>

        <Box sx={{ my: 2 }}>
          <Link
            href="/NATA_Application_Form_2025"
            style={{ textDecoration: "underline" }}
          >
            {knowMore}
          </Link>
        </Box>
      </Box>

      {/* Footer strip */}
      <Box
        sx={{
          borderRadius: "0 0 10px 10px",
          height: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          backgroundImage: gradient,
          mt: "auto",
          width: "100%",
        }}
      >
        {footerText}
      </Box>
    </Box>
  );
}
