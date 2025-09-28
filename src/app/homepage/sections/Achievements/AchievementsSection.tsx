"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import AchieveLogos from "./Components/AchieveLogos";
import Wave1 from "../../components/Waves";

export default function AchievementsSection() {
  return (
    <>
      <SectionBackground
        type="custom"
        color="#fff"
        height="auto"
        sx={{ py: { xs: 4, md: 6 } }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 3, md: 5 } }}>
            <SectionTitle
              title="Our Students Loves Us"
              subtitle="Alumnus & Achievements"
              titleColor={undefined}
              subTitleColor={undefined}
            />
          </Box>
          <AchieveLogos />
        </Container>
      </SectionBackground>
      {/* Bottom wave */}
      <Box sx={{ bgcolor: "common.white", lineHeight: 0 }}>
        <Wave1 sx={{ width: "100%" }} />
      </Box>
    </>
  );
}
