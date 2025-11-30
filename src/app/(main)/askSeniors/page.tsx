"use client";

import React, { useState } from "react";
import { Container, Box } from "@mui/material";
import Hero from "./comps/Hero";
import CollegeScroll from "./comps/CollegeScroll";
import VideoSection from "./comps/VideoSection";
import ParticipatingGuests from "./comps/ParticipatingGuests";
import RegisterModal from "./comps/RegisterModal";
import {
  getWebPageSchema,
  getBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/schema";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";

export default function AskSeniorsPage() {
  const [open, setOpen] = useState(false);

  const webPageSchema = getWebPageSchema({
    name: "Ask Seniors - Architecture Exam Guidance",
    description:
      "Connect with senior students and get guidance for NATA and architecture entrance exams",
    url: "/askSeniors",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Ask Seniors", url: "/askSeniors" },
    ],
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Ask Seniors", url: "/askSeniors" },
  ]);

  return (
    <>
      {/* Schema Markup for Ask Seniors Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
      />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Hero onRegister={() => setOpen(true)} />
        <CollegeScroll />
        <VideoSection />
        <ParticipatingGuests />
        <RegisterModal open={open} onClose={() => setOpen(false)} />
      </Container>

      {/* Footer Section */}
      <Box sx={{ position: "relative", mt: 8 }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </>
  );
}
