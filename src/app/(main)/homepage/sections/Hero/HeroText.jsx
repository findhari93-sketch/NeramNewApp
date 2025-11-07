"use client";
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useTheme } from "@mui/material/styles";
import { HilightBtn, MyButton } from "../../../../components/shared/Buttons";
import { useRouter } from "next/navigation";

// MUI version of ClockText, ClockSubText, NormalText
const textSx = {
  fontFamily: "var(--font-handlee), Handlee, cursive",
  fontWeight: 700,
  color: "rgba(255,255,255,0.8)",
  fontSize: { xs: 20, md: 24 },
  lineHeight: { xs: "30px", md: undefined },
  mb: { xs: 1.25, md: 0 },
  textAlign: { xs: "center", md: "left" },
  letterSpacing: { xs: "1px", md: 0 },
  px: { xs: 1, md: 0 }, // 45px
};

const subTextSx = {
  fontFamily: "var(--font-handlee), Handlee, cursive",
  color: "rgba(255,255,255,0.8)",
  fontSize: { xs: 15, md: 17 },
  textAlign: { xs: "center", md: "justify" },
  lineHeight: { xs: "24px", md: "27px" },
  mb: { xs: 3.75, md: 3.125 }, // 30px / 25px
  px: { xs: 1, md: 0 },
};

const subHeadlineSx = {
  fontFamily: "var(--font-poppins), Poppins, sans-serif",
  color: "rgba(255,255,255,0.85)",
  fontWeight: 500,
  fontSize: { xs: 16, md: 18 },
  lineHeight: { xs: "26px", md: "28px" },
  mt: 1,
  mb: { xs: 1.5, md: 2 },
  textAlign: { xs: "center", md: "left" },
  px: { xs: 5.625, md: 0 },
};

export default function HeroText() {
  const theme = useTheme();
  const router = useRouter();

  const highlightSx = {
    color: theme.palette.custom?.yellow ?? "#FFFB01",
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    letterSpacing: 0,
    display: "inline",
  };

  const underlineSx = {
    color: "#fff",
    borderBottom: "4px solid #ff105e",
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    letterSpacing: 0,
    display: "inline",
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography component="h1" variant="h5" sx={textSx}>
        <Box component="span" sx={highlightSx}>
          India’s 1
          <Box
            component="sup"
            sx={{
              fontSize: "0.6em",
              lineHeight: 0,
              verticalAlign: "super",
              ml: 0.25,
            }}
          >
            st
          </Box>
        </Box>{" "}
        AI-Powered App for{" "}
        <Box component="span" sx={underlineSx}>
          NATA Coaching
        </Box>
      </Typography>

      <Stack
        id="Social"
        direction="row"
        spacing={1}
        sx={{
          mt: 1.5,
          justifyContent: { xs: "center", md: "flex-start" },
          alignItems: "center",
          color: "white",
        }}
      >
        <Typography component="span" sx={{ opacity: 0.9 }}>
          Follow Us :
        </Typography>
        <Tooltip title="Youtube Channel">
          <IconButton
            href="https://www.youtube.com/@neramclassesnata"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            sx={{ color: "var(--yellow)" }}
          >
            <YouTubeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Official Instagram Handle">
          <IconButton
            href="https://www.instagram.com/neramclassrooms/"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            sx={{ color: "var(--yellow)" }}
          >
            <InstagramIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography component="h2" variant="subtitle1" sx={subTextSx}>
        We are team of talented practicing architects from IITs & NITs developed
        this From AI study tools to exclusive practice resources – everything
        you need to crack architecture entrance exams, in one place.
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          justifyContent: { xs: "center", md: "flex-start" },
          alignItems: "center",
        }}
      >
        <Tooltip title="B.Arch Exam Cutoff calculation">
          <Box>
            <HilightBtn
              onClick={() => router.push("/nata-cutoff-calculator")}
              variant="contained"
              size="large"
            >
              Calculator
            </HilightBtn>
          </Box>
        </Tooltip>
        <Tooltip title="NATA Students Meetup Registration Form">
          <Box>
            <MyButton
              onClick={() => (window.location.href = "/applicationform")}
              variant="contained"
              size="large"
            >
              Join Class
            </MyButton>
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
}
