"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SectionBackground from "../../components/SectionBackground";
import { SectionTitle } from "../../components/SectionTitle";
import VideosGrid from "./Components/VideosGrid";

const CHANNEL_HANDLE = "@neramclassesnata";
const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID as
  | string
  | undefined;

export default function YouTubeSection() {
  return (
    <SectionBackground type="custom" color="#fff" height="auto">
      <Container maxWidth="lg">
        <Box sx={{ mt: 2 }}>
          <SectionTitle
            title="Our content quality speaks"
            subtitle="Follow us on youtube and IG"
            titleColor={undefined}
            subTitleColor={undefined}
          />
        </Box>
        <VideosGrid />
        <Box sx={{ my: 5 }}>
          <Button
            variant="contained"
            onClick={() =>
              window.open(
                CHANNEL_ID
                  ? `https://www.youtube.com/channel/${CHANNEL_ID}`
                  : `https://www.youtube.com/${CHANNEL_HANDLE}`,
                "_blank"
              )
            }
          >
            View Our YouTube Channel
          </Button>
        </Box>
      </Container>
    </SectionBackground>
  );
}
