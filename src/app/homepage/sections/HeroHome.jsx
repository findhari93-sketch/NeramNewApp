"use client";
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function HeroHome() {
  return (
    <Box
      component="section"
      sx={(theme) => ({
        position: "relative",
        bgcolor: "transparent",
        backgroundImage: `${theme.gradients.brand()}, radial-gradient(1000px 400px at 20% -10%, rgba(255,255,255,0.12), transparent), radial-gradient(800px 300px at 80% 10%, rgba(255,255,255,0.08), transparent)`,
        color: theme.palette.white.main,
        py: { xs: 6, md: 10 },
        overflow: "hidden",
      })}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="flex-start">
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
            Welcome to Neram App!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 720 }}>
            Prepare for NATA and JEE B.Arch with curated materials and guided
            applications. Start your application in minutes.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Link href="/applicationform" style={{ textDecoration: "none" }}>
              <Button variant="contained" color="primary" size="large">
                Go to Application Form
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
