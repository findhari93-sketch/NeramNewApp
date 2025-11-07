"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import ParentsCarousel from "./Components/ParentsCarousel";
import { Wave2 } from "../../components/Waves";

export default function ParentsSection() {
  return (
    <>
      <SectionBackground
        type="pink"
        height="auto"
        paddingBottomLarge={0}
        sx={{ pt: { xs: 5, md: 3 } }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 3, md: 5 } }}>
            <SectionTitle
              title="Also Parents does"
              subtitle="Alumnus & Achievements"
              titleColor={undefined}
              subTitleColor={undefined}
            />
          </Box>
          <Box sx={{ pb: { xs: 5, md: 0 } }}>
            <ParentsCarousel />
          </Box>
        </Container>
      </SectionBackground>
      <Wave2 />
    </>
  );
}
