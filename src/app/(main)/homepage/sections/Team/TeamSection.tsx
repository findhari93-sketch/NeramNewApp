"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import { Wave10 } from "../../components/Waves";
import TeamCarousel from "./Components/TeamCarousel";

export default function TeamSection() {
  return (
    <>
      <SectionBackground type="pink" height="auto">
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Box sx={{ mb: { xs: 3, md: 5 } }}>
              <SectionTitle
                title="Introducing our Team"
                subtitle="Meet the people who Teach Awesome stuffs"
                titleColor={undefined}
                subTitleColor={undefined}
              />
            </Box>

            <TeamCarousel />
          </Box>
        </Container>
        <Wave10 />
      </SectionBackground>
    </>
  );
}
