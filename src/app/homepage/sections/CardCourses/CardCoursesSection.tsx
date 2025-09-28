"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import { Wave8, Wave9 } from "../../components/Waves";
import CourseCard from "./Components/CourseCard";
import { courseCards } from "./Components/data";

export default function CardCoursesSection() {
  return (
    <>
      <SectionBackground type="grad" height="auto" paddingBottomMedium={0}>
        <Wave8 />
        <Container maxWidth="lg">
          <Box sx={{ mb: 2 }}>
            <SectionTitle
              title="Course Details"
              subtitle="Year Long | Crash course"
              titleColor="#FFFB01"
              subTitleColor="#fff"
            />
          </Box>

          <Box sx={{ height: "100%", my: 4 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 3,
                justifyItems: "center",
              }}
            >
              {courseCards.map((c, i) => (
                <CourseCard
                  key={i}
                  image={c.image}
                  description={c.description}
                  buttonText={c.buttonText}
                  knowMore={c.knowMore}
                  footerText={c.footerText}
                  gradientKey={c.gradientKey}
                  index={c.index}
                />
              ))}
            </Box>
          </Box>
        </Container>
        <Wave9 />
      </SectionBackground>
    </>
  );
}
