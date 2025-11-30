"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DownloadIcon from "@mui/icons-material/Download";
import TimerIcon from "@mui/icons-material/Timer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Link from "next/link";
import TopNavBar from "../../components/shared/TopNavBar";
import { getCurrentYear, getYearRange } from "@/utils/dateUtils";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";
import Script from "next/script";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/utils/schemaMarkup";

export default function JEEPaper2PreparationPage() {
  const currentYear = getCurrentYear();
  const yearRange = getYearRange(2015);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  // Schema markup data
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "JEE Paper 2 Preparation", url: "/jee-paper-2-preparation" },
    ],
    siteUrl
  );

  const articleSchema = generateArticleSchema(
    {
      headline: `JEE Main Paper 2 (B.Arch) Preparation Guide ${currentYear}`,
      description:
        "Complete guide to prepare for JEE Main Paper 2 B.Arch exam. Learn preparation strategies, syllabus, best books, and tips to score 99+ percentile.",
      datePublished: "2024-01-01T00:00:00Z",
      dateModified: new Date().toISOString(),
      authorName: "Neram Academy",
      publisherName: "Neram Academy",
      publisherLogoUrl: `${siteUrl}/images/logos/neram-logo.png`,
    },
    siteUrl
  );

  const faqSchema = generateFAQSchema([
    {
      question: "What is the exam pattern for JEE Main Paper 2?",
      answer:
        "JEE Main Paper 2 consists of three parts: Mathematics (25 questions, 100 marks), Aptitude Test (50 questions, 200 marks), and Drawing Test (2 questions, 100 marks). Total duration is 3 hours.",
    },
    {
      question: "Can I prepare for both NATA and JEE Paper 2?",
      answer:
        "Yes! 70-80% syllabus overlaps between NATA and JEE Paper 2. Students can efficiently prepare for both exams simultaneously.",
    },
    {
      question: "What percentile is required for top NITs?",
      answer:
        "For top NITs like NIT Trichy, NIT Calicut, you need 99+ percentile. For other good NITs, 95+ percentile is generally safe.",
    },
    {
      question: "Is JEE Paper 2 easier than JEE Main Paper 1?",
      answer:
        "JEE Paper 2 has different requirements. While Math is from the same syllabus, it requires strong drawing skills and aptitude. Success depends on balanced preparation across all three sections.",
    },
  ]);

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          title: `JEE Paper 2 (B.Arch) Preparation Guide ${currentYear}`,
          showBreadcrumbs: true,
          autoBreadcrumbs: true,
        }}
      />
      <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              mb: 2,
              color: "neramPurple.main",
            }}
          >
            JEE Main Paper 2 (B.Arch) Preparation Guide {currentYear}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
            }}
          >
            Complete Strategy to Score 99+ Percentile in JEE B.Arch
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            <Chip label={`Updated for JEE ${currentYear}`} color="primary" />
            <Chip label="99 Percentile Strategy" color="success" />
            <Chip label="IIT Expert Tips" color="warning" />
            <Chip label="Free Mock Tests" color="info" />
          </Stack>
        </Box>

        {/* About JEE Paper 2 */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              📚 About JEE Main Paper 2 (B.Arch)
            </Typography>
            <Typography variant="body1" paragraph>
              JEE Main Paper 2 is conducted by the National Testing Agency (NTA)
              for admission to Bachelor of Architecture (B.Arch) programs at top
              institutions like IITs, NITs, SPAs, and other government-funded
              technical institutes. This exam tests your aptitude in
              Mathematics, Aptitude Test, and Drawing skills.
            </Typography>
            <Box
              sx={{ bgcolor: "primary.light", p: 3, borderRadius: 2, mt: 2 }}
            >
              <Typography variant="body1" fontWeight={600} mb={2}>
                🎯 Key Exam Details:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      • <strong>Exam Mode:</strong> Computer-Based Test (CBT)
                    </ListItem>
                    <ListItem>
                      • <strong>Total Marks:</strong> 400 marks
                    </ListItem>
                    <ListItem>
                      • <strong>Duration:</strong> 3 hours
                    </ListItem>
                    <ListItem>
                      • <strong>Sessions:</strong> 2 attempts per year (Jan &
                      Apr)
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      • <strong>Negative Marking:</strong> -1 for wrong answer
                    </ListItem>
                    <ListItem>
                      • <strong>Language:</strong> 13 languages available
                    </ListItem>
                    <ListItem>
                      • <strong>Drawing:</strong> Online (on digital tablet)
                    </ListItem>
                    <ListItem>
                      • <strong>Percentile Based:</strong> Relative marking
                      system
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Exam Pattern */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              📋 JEE Paper 2 Exam Pattern {currentYear}
            </Typography>{" "}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={2}
                  sx={{ p: 3, height: "100%", bgcolor: "success.light" }}
                >
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Part I: Mathematics
                  </Typography>
                  <List dense>
                    <ListItem>
                      📊 <strong>Questions:</strong> 30
                    </ListItem>
                    <ListItem>
                      💯 <strong>Marks:</strong> 100
                    </ListItem>
                    <ListItem>
                      ⏱️ <strong>Type:</strong> MCQ (Multiple Choice)
                    </ListItem>
                    <ListItem>
                      ❌ <strong>Negative:</strong> -4 for wrong answer
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={2}
                  sx={{ p: 3, height: "100%", bgcolor: "info.light" }}
                >
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Part II: Aptitude Test
                  </Typography>
                  <List dense>
                    <ListItem>
                      📊 <strong>Questions:</strong> 50
                    </ListItem>
                    <ListItem>
                      💯 <strong>Marks:</strong> 200
                    </ListItem>
                    <ListItem>
                      ⏱️ <strong>Type:</strong> MCQ + Numerical
                    </ListItem>
                    <ListItem>
                      ❌ <strong>Negative:</strong> -4 for wrong MCQ
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={2}
                  sx={{ p: 3, height: "100%", bgcolor: "warning.light" }}
                >
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Part III: Drawing
                  </Typography>
                  <List dense>
                    <ListItem>
                      📊 <strong>Questions:</strong> 2
                    </ListItem>
                    <ListItem>
                      💯 <strong>Marks:</strong> 100
                    </ListItem>
                    <ListItem>
                      ⏱️ <strong>Type:</strong> Descriptive (Digital)
                    </ListItem>
                    <ListItem>
                      ✅ <strong>Negative:</strong> No negative marking
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 2, bgcolor: "error.light", borderRadius: 2 }}>
              <Typography fontWeight={600} color="error.dark">
                ⚠️ Important: Unlike NATA, JEE Paper 2 has NEGATIVE MARKING (-1
                mark per wrong answer). Answer carefully!
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Syllabus */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              📖 Complete JEE Paper 2 Syllabus
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Part I: Mathematics Syllabus
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph fontWeight={600}>
                  High-Weightage Topics (Focus 80% here):
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Sets, Relations & Functions" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Complex Numbers & Quadratic Equations" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Matrices & Determinants" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Permutations & Combinations" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Binomial Theorem" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Sequences & Series" />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Limits, Continuity & Differentiability" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Integral Calculus" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Differential Equations" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Coordinate Geometry (2D & 3D)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Vector Algebra" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Statistics & Probability" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  component={Link}
                  href="/jee-paper-2-mathematics-syllabus"
                  sx={{ mt: 2 }}
                >
                  Download Detailed Math Syllabus PDF
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Part II: Aptitude Test Syllabus
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  The Aptitude Test evaluates your awareness of places, persons,
                  buildings, materials, and objects; texture and visual
                  perception; creative and analytical thinking.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Awareness of Persons, Places & Buildings"
                      secondary="Famous architects, monuments, UNESCO heritage sites, architectural styles, contemporary architecture"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Materials & Objects"
                      secondary="Building materials, their textures, properties, sustainable materials, innovative construction techniques"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Visualizing 3D Objects from 2D Drawings"
                      secondary="Isometric views, orthographic projections, mental rotation, spatial reasoning, sectional views"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Texture & Contrast of Surface"
                      secondary="Understanding textures, patterns, contrast, rhythm in design, visual hierarchy"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Analytical Reasoning"
                      secondary="Mental ability, logical reasoning, pattern recognition, series completion"
                    />
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  component={Link}
                  href="/jee-paper-2-aptitude-study-material"
                  sx={{ mt: 2 }}
                >
                  Download Aptitude Study Material
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Part III: Drawing Test Syllabus
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph color="warning.dark" fontWeight={600}>
                  🎨 Drawing test is conducted ONLINE using a digital drawing
                  tablet (Wacom or similar)
                </Typography>
                <Typography paragraph fontWeight={600} mt={2}>
                  Topics Covered:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Drawing from Memory"
                      secondary="Sketching scenes, objects, or events from everyday life based on memory"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Perspective Drawing"
                      secondary="One-point, two-point, and three-point perspective drawing of buildings and objects"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Composition & Color Application"
                      secondary="Creating balanced compositions using geometric/thematic elements with appropriate colors"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Texture & Shading"
                      secondary="Rendering different materials and surfaces digitally with proper shading techniques"
                    />
                  </ListItem>
                </List>
                <Box
                  sx={{
                    bgcolor: "warning.light",
                    p: 2,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Typography fontWeight={600}>💡 Pro Tip:</Typography>
                  <Typography>
                    Practice digital drawing extensively! Most students lose
                    marks because they're not comfortable with tablets. Use free
                    software like Krita or Sketchbook to practice daily.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Preparation Strategy */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              🎯 Winning Preparation Strategy for 99+ Percentile
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Phase 1: Foundation Building (Months 1-3)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography fontWeight={600} mb={2}>
                  Daily Schedule (8-10 hours):
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mathematics (3-4 hours)"
                      secondary="Complete NCERT Class 11 & 12 thoroughly. Solve all examples and exercises. Focus on conceptual clarity."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Aptitude Building (2-3 hours)"
                      secondary="Read architecture magazines, study famous buildings, practice visualization exercises, solve reasoning questions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Drawing Practice (2-3 hours)"
                      secondary="Learn digital drawing basics, practice sketching on tablet, master perspective drawing fundamentals"
                    />
                  </ListItem>
                </List>
                <Box
                  sx={{ bgcolor: "info.light", p: 2, borderRadius: 2, mt: 2 }}
                >
                  <Typography fontWeight={600}>🎯 Phase 1 Goals:</Typography>
                  <List dense>
                    <ListItem>✅ Complete entire NCERT Math syllabus</ListItem>
                    <ListItem>
                      ✅ Build architectural awareness database (50+ famous
                      buildings)
                    </ListItem>
                    <ListItem>
                      ✅ Master basic perspective drawing on tablet
                    </ListItem>
                    <ListItem>
                      ✅ Solve 1000+ MCQs from NCERT & basic level
                    </ListItem>
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Phase 2: Advanced Problem Solving (Months 4-6)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography fontWeight={600} mb={2}>
                  Daily Schedule (10-12 hours):
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Advanced Mathematics (4-5 hours)"
                      secondary={`Solve previous year JEE Main questions (${yearRange}), practice from Cengage/Arihant, focus on speed & accuracy`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Aptitude Test Practice (3-4 hours)"
                      secondary="Solve mock aptitude tests, practice 3D visualization extensively, study architectural case studies"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Timed Drawing (2-3 hours)"
                      secondary="Practice complete drawings in 60 minutes, work on composition & color, build speed on digital medium"
                    />
                  </ListItem>
                </List>
                <Box
                  sx={{
                    bgcolor: "success.light",
                    p: 2,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Typography fontWeight={600}>🎯 Phase 2 Goals:</Typography>
                  <List dense>
                    <ListItem>✅ Solve 3000+ JEE-level math problems</ListItem>
                    <ListItem>✅ Score 150+ in aptitude mock tests</ListItem>
                    <ListItem>✅ Complete 50+ timed digital drawings</ListItem>
                    <ListItem>✅ Achieve 90%+ accuracy in mathematics</ListItem>
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Phase 3: Mock Tests & Revision (Last 2 Months)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography fontWeight={600} mb={2}>
                  Intensive Mock Test Schedule:
                </Typography>
                <List>
                  <ListItem>
                    • <strong>Week 1-4:</strong> Take 2 full-length mocks per
                    week + analyze thoroughly
                  </ListItem>
                  <ListItem>
                    • <strong>Week 5-6:</strong> Take 3 full-length mocks per
                    week + focused topic revision
                  </ListItem>
                  <ListItem>
                    • <strong>Week 7-8:</strong> Take 4-5 full-length mocks per
                    week + error analysis
                  </ListItem>
                  <ListItem>
                    • <strong>Last Week:</strong> Revise formula sheets,
                    practice drawing themes, light revision only
                  </ListItem>
                </List>
                <Box
                  sx={{
                    bgcolor: "warning.light",
                    p: 2,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Typography fontWeight={600}>
                    🚨 Critical Success Factors:
                  </Typography>
                  <List dense>
                    <ListItem>
                      ⚡ Time management - complete test in 2:45 hours (keep
                      15min buffer)
                    </ListItem>
                    <ListItem>
                      ⚡ Attempt only questions you're confident about (negative
                      marking!)
                    </ListItem>
                    <ListItem>
                      ⚡ Drawing should score minimum 70/100 - this is your USP
                    </ListItem>
                    <ListItem>
                      ⚡ Target 95%+ accuracy in attempted questions
                    </ListItem>
                  </List>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<EmojiEventsIcon />}
                  component={Link}
                  href="/jee-paper-2-mock-test-series"
                  sx={{ mt: 2 }}
                >
                  Start Free Mock Test Series
                </Button>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Score 99 Percentile Strategy */}
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: "success.light" }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "success.dark",
              }}
            >
              🏆 How to Score 99+ Percentile in JEE Paper 2?
            </Typography>
            <Typography paragraph fontWeight={600}>
              Target Score Breakdown for 99+ Percentile (varies by difficulty):
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "white" }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    85-90
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mathematics
                  </Typography>
                  <Typography variant="caption">(out of 100 marks)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "white" }}>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    160-170
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aptitude Test
                  </Typography>
                  <Typography variant="caption">(out of 200 marks)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "white" }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="warning.main"
                  >
                    75-85
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drawing
                  </Typography>
                  <Typography variant="caption">(out of 100 marks)</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 3, bgcolor: "white", borderRadius: 2 }}>
              <Typography fontWeight={600} mb={2}>
                💯 Detailed Scoring Strategy:
              </Typography>
              <List>
                <ListItem>
                  <strong>Mathematics:</strong> Attempt 28-29 questions with
                  95%+ accuracy. Skip very difficult questions to avoid negative
                  marking.
                </ListItem>
                <ListItem>
                  <strong>Aptitude:</strong> Attempt 42-45 questions. Focus on
                  architectural awareness (easier) first, then visualization
                  questions.
                </ListItem>
                <ListItem>
                  <strong>Drawing:</strong> Spend equal time on both questions
                  (60 min each). Focus on composition, perspective accuracy, and
                  clean rendering.
                </ListItem>
              </List>
            </Box>
            <Button
              variant="contained"
              size="large"
              color="success"
              component={Link}
              href="/how-to-score-99-percentile-jee-barch"
              sx={{ mt: 3 }}
            >
              Read Complete 99 Percentile Strategy →
            </Button>
          </CardContent>
        </Card>

        {/* Best Books */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              📚 Best Books for JEE Paper 2 (B.Arch)
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Mathematics:
                </Typography>
                <List>
                  <ListItem>
                    1. <strong>NCERT Class 11 & 12</strong> - Foundation (Must
                    Read)
                  </ListItem>
                  <ListItem>
                    2. <strong>Cengage Mathematics</strong> - Complete JEE
                    Preparation
                  </ListItem>
                  <ListItem>
                    3. <strong>Arihant JEE Main Mathematics</strong> -
                    Chapter-wise Practice
                  </ListItem>
                  <ListItem>
                    4. <strong>41 Years JEE Main Previous Papers</strong> -
                    Disha Publications
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Aptitude Test:
                </Typography>
                <List>
                  <ListItem>
                    1. <strong>Nimish Madan B.Arch Entrance Guide</strong> -
                    Comprehensive
                  </ListItem>
                  <ListItem>
                    2. <strong>Arihant B.Arch & B.Plan Guide</strong> - Complete
                    Package
                  </ListItem>
                  <ListItem>
                    3. <strong>Architecture Entrance Exam</strong> - GKP
                    Publications
                  </ListItem>
                  <ListItem>
                    4. <strong>JEE Main B.Arch Previous Papers</strong> - Disha
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Drawing:
                </Typography>
                <List>
                  <ListItem>
                    1. <strong>B.Arch Drawing Skills</strong> - Er. Somsirsa
                    Chatterjee
                  </ListItem>
                  <ListItem>
                    2. <strong>Drawing for B.Arch Entrance</strong> - Ar. Rohit
                    Kumar
                  </ListItem>
                  <ListItem>
                    3. <strong>Digital Drawing for Architects</strong> -
                    Practice Workbook
                  </ListItem>
                </List>
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/best-books-for-jee-paper-2"
              sx={{ mt: 2 }}
            >
              View Complete Books List with Buy Links →
            </Button>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              ❓ Frequently Asked Questions
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  Is coaching necessary for JEE Paper 2?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  While self-study is possible for Mathematics,{" "}
                  <strong>coaching is highly recommended</strong> for:
                </Typography>
                <List>
                  <ListItem>
                    ✅ Aptitude Test - requires expert guidance on architectural
                    awareness
                  </ListItem>
                  <ListItem>
                    ✅ Digital Drawing Practice - need access to tablets and
                    expert feedback
                  </ListItem>
                  <ListItem>
                    ✅ Strategic Planning - understanding percentile vs marks
                    relationship
                  </ListItem>
                  <ListItem>
                    ✅ Mock Tests - simulating actual exam interface and
                    difficulty
                  </ListItem>
                </List>
                <Typography mt={2}>
                  <strong>neramClasses.com</strong> offers specialized JEE
                  B.Arch coaching with IIT-qualified faculty, digital drawing
                  labs, and 100+ mock tests.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/jee-barch-coaching"
                  sx={{ mt: 2 }}
                >
                  Explore JEE B.Arch Coaching →
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  Can I prepare for JEE Paper 2 and NATA together?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph fontWeight={600}>
                  Yes! 70-80% syllabus overlaps. Smart strategy is to prepare
                  both simultaneously.
                </Typography>
                <Typography fontWeight={600} mt={2} mb={1}>
                  Common Topics:
                </Typography>
                <List dense>
                  <ListItem>✅ Complete Mathematics (100% same)</ListItem>
                  <ListItem>
                    ✅ Drawing Skills (same techniques, different medium)
                  </ListItem>
                  <ListItem>✅ Aptitude & Visualization (80% overlap)</ListItem>
                  <ListItem>✅ Architectural Awareness (fully common)</ListItem>
                </List>
                <Typography fontWeight={600} mt={2} mb={1}>
                  Key Differences:
                </Typography>
                <List dense>
                  <ListItem>
                    • NATA: Paper-based drawing vs JEE: Digital drawing
                  </ListItem>
                  <ListItem>
                    • NATA: No negative marking vs JEE: -1 for wrong answer
                  </ListItem>
                  <ListItem>
                    • NATA: Absolute scoring vs JEE: Percentile-based
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/nata-jee-barch-combined-preparation"
                  sx={{ mt: 2 }}
                >
                  View Combined Study Plan →
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  What percentile is good for IIT/NIT B.Arch admission?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography fontWeight={600} mb={2}>
                  Percentile Requirements (Approximate):
                </Typography>
                <List>
                  <ListItem>
                    <strong>IIT Roorkee/Kharagpur:</strong> 99.5+ percentile
                    (Top 200 rank)
                  </ListItem>
                  <ListItem>
                    <strong>Top NITs (Trichy, Calicut):</strong> 98-99
                    percentile
                  </ListItem>
                  <ListItem>
                    <strong>Good NITs:</strong> 95-98 percentile
                  </ListItem>
                  <ListItem>
                    <strong>SPA Delhi/Bhopal/Vijayawada:</strong> 97-99
                    percentile
                  </ListItem>
                  <ListItem>
                    <strong>State Government Colleges:</strong> 85-95 percentile
                  </ListItem>
                </List>
                <Box
                  sx={{ bgcolor: "info.light", p: 2, borderRadius: 2, mt: 2 }}
                >
                  <Typography fontWeight={600}>💡 Important Note:</Typography>
                  <Typography>
                    Cut-offs vary each year based on difficulty level and number
                    of applicants. Always aim for 99+ percentile to have maximum
                    options.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  How to practice digital drawing for JEE Paper 2?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Digital drawing is the biggest challenge for most students.
                  Here's how to master it:
                </Typography>
                <Typography fontWeight={600} mb={1}>
                  Step-by-Step Approach:
                </Typography>
                <List>
                  <ListItem>
                    <strong>1. Get a Drawing Tablet:</strong> Wacom Intuos Small
                    (₹6000) or XP-Pen Deco 01 (₹4000) - practice daily for 2-3
                    months before exam
                  </ListItem>
                  <ListItem>
                    <strong>2. Use Practice Software:</strong> Krita (free),
                    Sketchbook (free), or Adobe Photoshop - get comfortable with
                    layers, brushes, colors
                  </ListItem>
                  <ListItem>
                    <strong>3. Master Basic Tools:</strong> Pencil, pen, eraser,
                    fill tool, color picker - learn keyboard shortcuts for speed
                  </ListItem>
                  <ListItem>
                    <strong>4. Practice NTA Interface:</strong> Take mock tests
                    on NTA's practice portal to get familiar with actual exam
                    environment
                  </ListItem>
                  <ListItem>
                    <strong>5. Time Yourself:</strong> Complete drawings in 60
                    minutes max - speed comes with practice
                  </ListItem>
                </List>
                <Box
                  sx={{
                    bgcolor: "warning.light",
                    p: 2,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Typography fontWeight={600}>
                    ⚠️ Common Mistakes to Avoid:
                  </Typography>
                  <List dense>
                    <ListItem>
                      ❌ Waiting too long to start digital practice
                    </ListItem>
                    <ListItem>❌ Using mouse instead of stylus/pen</ListItem>
                    <ListItem>❌ Not exploring all tools and features</ListItem>
                    <ListItem>
                      ❌ Overcomplicating drawings - keep it simple and clean
                    </ListItem>
                  </List>
                </Box>
                <Button
                  variant="contained"
                  component={Link}
                  href="/digital-drawing-practice-guide"
                  sx={{ mt: 2 }}
                >
                  Download Digital Drawing Guide →
                </Button>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Free Resources CTA */}
        <Card
          sx={{
            mb: 4,
            boxShadow: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: "2rem", fontWeight: 700, mb: 2 }}
            >
              🎁 Free JEE B.Arch Resources
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, maxWidth: 800, mx: "auto" }}
            >
              Download previous year papers, mock tests, formula sheets, and
              study materials to ace JEE Paper 2!
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "neramPurple.main",
                  "&:hover": { bgcolor: "grey.100" },
                }}
                component={Link}
                href="/jee-paper-2-previous-year-papers"
                startIcon={<DownloadIcon />}
              >
                Previous Year Papers
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
                component={Link}
                href="/jee-paper-2-mock-tests"
              >
                Free Mock Tests
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
                component={Link}
                href="/jee-paper-2-formula-sheet"
              >
                Formula Sheets
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Enroll CTA */}
        <Card sx={{ textAlign: "center", boxShadow: 3 }}>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Crack JEE Paper 2 with 99+ Percentile?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join neramClasses - India's #1 JEE B.Arch coaching with proven
              track record
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/jee-barch-coaching"
              sx={{ px: 4, mr: 2 }}
            >
              Enroll in JEE B.Arch Coaching
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/jee-paper-2-mock-test-series"
              sx={{ px: 4 }}
            >
              Start Free Mock Tests
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Footer Section */}
      <Box sx={{ position: "relative", mt: 8 }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </>
  );
}
