"use client";
import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ParentsContent } from "./data";
import ParentCard from "./ParentCard";
import VideoModal from "./VideoModal";
import {
  SampleNextArrow,
  SamplePrevArrow,
} from "../../Toppers/Components/arrowsCarousel";

export default function ParentsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handlePrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const handleNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handlePlayClick = (url: string) => {
    setVideoUrl(url);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setVideoUrl("");
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 2 } }}>
      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {ParentsContent.map((item, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  flex: "0 0 85%",
                  "@media (min-width:600px)": { flexBasis: "48%" },
                  "@media (min-width:900px)": { flexBasis: "31%" },
                }}
              >
                <ParentCard item={item} onPlayClick={handlePlayClick} />
              </Box>
            ))}
          </Box>
        </Box>
        <SamplePrevArrow onClick={handlePrev} />
        <SampleNextArrow onClick={handleNext} />
      </Box>
      <VideoModal open={open} onClose={handleClose} videoUrl={videoUrl} />
    </Box>
  );
}
