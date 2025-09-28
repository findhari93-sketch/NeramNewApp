"use client";
import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import WhatsappCard from "./WhatsappCard";
import { whatsappItems } from "./whatsappData";
import {
  SampleNextArrow,
  SamplePrevArrow,
} from "../../Toppers/Components/arrowsCarousel";

export default function WhatsappCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const handlePrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const handleNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 2 } }}>
      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            {whatsappItems.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  position: "relative",
                  flex: "0 0 90%",
                  "@media (min-width:600px)": { flexBasis: "45%" },
                  "@media (min-width:900px)": { flexBasis: "30%" },
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <WhatsappCard src={item.src} alt={item.alt} />
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
