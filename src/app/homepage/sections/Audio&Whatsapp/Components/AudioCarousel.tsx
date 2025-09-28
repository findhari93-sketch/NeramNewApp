"use client";
import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import AudioCard from "./AudioCard";
import { audioItems } from "./audioData";
import {
  SampleNextArrow,
  SamplePrevArrow,
} from "../../Toppers/Components/arrowsCarousel";

export default function AudioCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 4500, stopOnInteraction: false })]
  );

  const handlePrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const handleNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 2 } }}>
      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {audioItems.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  position: "relative",
                  flex: "0 0 85%",
                  "@media (min-width:600px)": { flexBasis: "48%" },
                  "@media (min-width:900px)": { flexBasis: "31%" },
                }}
              >
                <AudioCard
                  url={item.url}
                  title={item.title}
                  year={item.year}
                  miniTitle={item.miniTitle}
                />
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
