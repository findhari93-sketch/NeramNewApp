"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import AudioCarousel from "./Components/AudioCarousel";
import WhatsappCarousel from "./Components/WhatsappCarousel";

export default function AudiowhatsappSection() {
  return (
    <SectionBackground type="pink" height="auto">
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <SectionTitle
            title="Alumnus Review about NATA Coaching in Neram"
            subtitle="Calls From Happy Students/Parents"
            titleColor={undefined}
            subTitleColor={undefined}
          />
          <Box sx={{ mt: { xs: 2, md: 3 } }}>
            <AudioCarousel />
          </Box>

          <Box component="hr" sx={{ my: 5, borderColor: "rgba(0,0,0,0.1)" }} />

          <SectionTitle
            title="Whatsapp image"
            subtitle="Calls From Happy Students/Parents"
            titleColor={undefined}
            subTitleColor={undefined}
          />
          <Box sx={{ mt: { xs: 2, md: 3 } }}>
            <WhatsappCarousel />
          </Box>
        </Box>
      </Container>
    </SectionBackground>
  );
}
