"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import { Wave9 } from "../../components/Waves";
import FaqAccordion from "./Components/FaqAccordion";

export default function FaqsSection() {
  return (
    <>
      <SectionBackground type="grad" height="auto">
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Box sx={{ mb: { xs: 3, md: 5 } }}>
              <SectionTitle
                title="Faqs"
                subtitle="Frequently asked questions about NATA"
                titleColor="#fff"
                subTitleColor="#FFFB01"
              />
            </Box>

            <Box sx={{ mb: { xs: 4, md: 5 } }}>
              <FaqAccordion />
            </Box>

            <Box sx={{ textAlign: "center", pb: { xs: 4, md: 6 } }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#FF105E",
                  color: "#fff",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "#E60E54",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(255, 16, 94, 0.3)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                More Faqs
              </Button>
            </Box>
          </Box>
        </Container>
        <Wave9 />
      </SectionBackground>
    </>
  );
}
