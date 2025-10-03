"use client";

import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TopNavBar from "./components/shared/TopNavBar";
import HeroWaves from "./homepage/sections/Hero/HeroWaves";
import Footer from "./components/shared/Footer/footer";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        color: "white",
        backgroundImage:
          "url('/images/SVG/Asset6.svg'), linear-gradient(295deg, #2b2d4e 1.557%, #e1148b 101.349%)",
        backgroundBlendMode: "multiply",
        backgroundRepeat: "repeat, no-repeat",
        backgroundSize: "auto, cover",
        backgroundPosition: "top left, center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          visible: true,
          title: "Page not found",
          autoBreadcrumbs: false,
          showBreadcrumbs: false,
          showBackButton: true,
        }}
      />

      {/* Spacer to offset fixed bars */}
      <Box sx={{ pt: { xs: "110px", md: "120px" } }} />

      <Container component="main" sx={{ flex: "1 0 auto", py: 6 }}>
        <Stack
          spacing={3}
          alignItems="center"
          textAlign="center"
          sx={{ maxWidth: 720, mx: "auto" }}
        >
          <Image
            src="/images/notfoundneram.svg"
            alt="Not found"
            width={300}
            height={220}
            style={{ height: "auto", width: "100%", maxWidth: 320 }}
            priority
          />
          <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1.2 }}>
            Coming soon
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            The page you tried to open isn’t available yet. We’re working on it.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component={Link}
              href="/"
              variant="contained"
              color="primary"
            >
              Go to Home
            </Button>
            <Button
              component={Link}
              href="/nata-cutoff-calculator"
              variant="outlined"
              color="inherit"
            >
              Try NATA Calculator
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Box sx={{ position: "relative", mt: "auto" }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </Box>
  );
}
