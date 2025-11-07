"use client";

import React, { useState } from "react";
import { Container } from "@mui/material";
import Hero from "./comps/Hero";
import CollegeScroll from "./comps/CollegeScroll";
import VideoSection from "./comps/VideoSection";
import ParticipatingGuests from "./comps/ParticipatingGuests";
import RegisterModal from "./comps/RegisterModal";

export default function AskSeniorsPage() {
  const [open, setOpen] = useState(false);
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Hero onRegister={() => setOpen(true)} />
      <CollegeScroll />
      <VideoSection />
      <ParticipatingGuests />
      <RegisterModal open={open} onClose={() => setOpen(false)} />
    </Container>
  );
}
