"use client";
import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import TeamCard from "./TeamCard";
import { teamMembers } from "./data";
import {
  SampleNextArrow,
  SamplePrevArrow,
} from "../../Toppers/Components/arrowsCarousel";

export default function TeamCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const handlePrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const handleNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 2 }, pb: 5 }}>
      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {teamMembers.map((member, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  flex: "0 0 85%",
                  "@media (min-width:600px)": { flexBasis: "48%" },
                  "@media (min-width:900px)": { flexBasis: "31%" },
                }}
              >
                <TeamCard member={member} />
              </Box>
            ))}
          </Box>
        </Box>
        <SamplePrevArrow onClick={handlePrev} />
        <SampleNextArrow onClick={handleNext} />
      </Box>
    </Box>
  );
}
