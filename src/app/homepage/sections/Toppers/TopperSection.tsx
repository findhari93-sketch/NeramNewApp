"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import TopperCarousel from "./Components/Carousel";
import { Wave7 } from "../../components/Waves";

export default function TopperSection() {
  return (
    <>
      <SectionBackground
        type="pink"
        component="section"
        sx={{
          position: "relative",
          py: { xs: 6, md: 8 },
          // No extra bottom padding since wave renders outside this section
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <SectionTitle
              title="JEE / NATA Toppers"
              subtitle="They Climbed to success & We continue to be Ladders"
              titleColor={undefined}
              subTitleColor={undefined}
            />
          </Box>
          <TopperCarousel />
        </Container>
      </SectionBackground>
      {/* Bottom wave transition outside the section with white background */}
      <Box sx={{ bgcolor: "common.white", lineHeight: 0 }}>
        <Wave7 sx={{ width: "100%" }} />
      </Box>
    </>
  );
}
