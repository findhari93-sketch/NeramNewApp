"use client";
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Clock from "./Clock";
import HeroText from "./HeroText";
import HeroWaves from "./HeroWaves";
import SectionBackground from "../../components/SectionBackground";

export default function HeroHome() {
  return (
    <SectionBackground
      type="grad"
      component="section"
      paddingBottomMedium="60px"
      paddingBottomLarge="60px"
      sx={(theme) => ({
        position: "relative",
        height: "auto",
        color: theme.palette.white.main,
        py: { xs: 6, md: 10 },
        overflow: "hidden",
      })}
    >
      <Container maxWidth="lg">
        {/* Clock + Hero text in one row on laptops */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 6 }}
          alignItems={{ xs: "center", md: "flex-start" }}
          sx={{ py: { xs: 6, md: 6 }, width: "100%" }}
        >
          <Box
            sx={{
              flexBasis: { md: "40%" },
              flexGrow: 0,
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Clock />
          </Box>
          <Box sx={{ flexBasis: { md: "60%" }, flexGrow: 1, width: "100%" }}>
            <HeroText />
          </Box>
        </Stack>
      </Container>
      {/* Decorative waves pinned to the bottom of the hero; color defaults to theme.palette.custom.lightPink */}
      <HeroWaves position="bottom" />
    </SectionBackground>
  );
}
