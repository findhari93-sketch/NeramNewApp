"use client";
import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { TopperList } from "./studentsListData";
import { SampleNextArrow, SamplePrevArrow } from "./arrowsCarousel";

const toPublicPath = (p: string) => (p && !p.startsWith("/") ? `/${p}` : p);

// Minimal badge replacement; swap with your own component if available
const Badge = ({ content }: { content: string }) => (
  <Box
    sx={{
      position: "absolute",
      left: "53%",
      top: "65%",
      transform: "translate(-50%, -50%)",
      bgcolor: "rgba(0,0,0,0.7)",
      color: "#fff",
      px: 1,
      py: 0.25,
      borderRadius: 1,
      fontSize: 12,
      fontWeight: 700,
    }}
  >
    {content}
  </Box>
);

function TopperCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const handlePrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const handleNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <Box sx={{ width: "100%", px: { xs: 1, md: 2 } }}>
      {/* Relative wrapper to position arrows over the viewport */}
      <Box sx={{ position: "relative" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {TopperList.map((item, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  flex: "0 0 85%",
                  "@media (min-width:600px)": { flexBasis: "48%" },
                  "@media (min-width:900px)": { flexBasis: "31%" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      height: "15rem",
                      transform: "scale(0.76)",
                      transformOrigin: "bottom",
                      mb: 1.5,
                    }}
                  >
                    <Box
                      component="img"
                      src={toPublicPath(item.circle.circle)}
                      alt={item.circle.alt}
                      loading={item.circle.loading}
                      sx={{
                        borderRadius: "50%",
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 200,
                        height: 200,
                        transform: "translate(-50%, -50%)",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      component="img"
                      src={toPublicPath(item.person.studentimage)}
                      alt={item.person.studentimagealt}
                      loading={item.person.loading}
                      sx={{
                        filter: "drop-shadow(12px 12px 15px rgba(0,0,0,0.56))",
                        position: "absolute",
                        top: "38%",
                        left: "50%",
                        transform: "translate(-50%, -50%) scale(0.49)",
                        borderRadius: "50rem",
                        transition:
                          "transform 250ms cubic-bezier(0.4,0,0.2,1), border-radius 250ms cubic-bezier(0.4,0,0.2,1), top 250ms cubic-bezier(0.4,0,0.2,1)",
                        width: 400,
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translate(-50%, -50%) scale(0.5)",
                          top: "40%",
                          borderRadius: "1rem",
                        },
                      }}
                    />
                    <Badge content={item.person.badge} />
                  </Box>

                  <Box sx={{ textAlign: "center", mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {item.content.primary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.content.secondary}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <span>
                        {item.content.tertiary_name}
                        <b style={{ marginLeft: 8 }}>
                          {item.content.tertiary_clg}
                        </b>
                      </span>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Arrows pinned to sides */}
        <SamplePrevArrow onClick={handlePrev} />
        <SampleNextArrow onClick={handleNext} />
      </Box>
    </Box>
  );
}

export default TopperCarousel;
