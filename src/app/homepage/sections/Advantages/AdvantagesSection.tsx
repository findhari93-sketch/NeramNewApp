"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import AdvantageGrid from "./Components/AdvantageGrid";

export default function AdvantagesSection() {
  return (
    <SectionBackground color="#fff" height="auto">
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: { xs: 3, md: 5 } }}>
            <SectionTitle
              title="Advantages"
              subtitle="Alumnus & Achievements"
              titleColor={undefined}
              subTitleColor={undefined}
            />
          </Box>

          <AdvantageGrid />
        </Box>
      </Container>
    </SectionBackground>
  );
}
