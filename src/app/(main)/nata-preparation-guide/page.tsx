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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DownloadIcon from "@mui/icons-material/Download";
import Link from "next/link";
import TopNavBar from "../../components/shared/TopNavBar";
import { Metadata } from "next";
import { getCurrentYear, getYearRange } from "@/utils/dateUtils";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";
import Script from "next/script";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/utils/schemaMarkup";

export default function NATAPreparationGuidePage() {
  const currentYear = getCurrentYear();
  const yearRange = getYearRange(2015);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  // Schema markup data
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "NATA Preparation Guide", url: "/nata-preparation-guide" },
    ],
    siteUrl
  );

  const articleSchema = generateArticleSchema(
    {
      headline: `Complete NATA Preparation Guide ${currentYear}`,
      description:
        "Step-by-step guide to prepare for NATA exam. Learn effective strategies, best books, study plans, and tips to score 150+ in NATA.",
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
      question: "How long does it take to prepare for NATA?",
      answer:
        "Ideally 6-12 months of focused preparation is recommended for NATA. Complete beginners should start 12 months before the exam, while those with drawing experience can prepare in 6-8 months.",
    },
    {
      question: "Can I prepare for both NATA and JEE Paper 2 together?",
      answer:
        "Yes! 70-80% syllabus overlaps between NATA and JEE Paper 2. You can prepare for both simultaneously by focusing on common topics in Mathematics, Drawing, and Aptitude.",
    },
    {
      question: "What are the best books for NATA preparation?",
      answer:
        "Essential books include: Arihant NATA/B.Arch Guide, NCERT Mathematics (11th & 12th), R.S. Aggarwal for Aptitude, and specialized drawing books for sketching and perspective.",
    },
    {
      question: "Is coaching necessary for NATA?",
      answer:
        "While self-study is possible, coaching provides structured guidance, regular practice, expert feedback on drawings, and time management skills crucial for NATA success.",
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
          title: `NATA Preparation Guide ${currentYear}`,
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
            How to Prepare for NATA {currentYear}?
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
            }}
          >
            Complete Step-by-Step NATA Preparation Strategy to Score 150+
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            <Chip label={`Updated for ${currentYear}`} color="primary" />
            <Chip label="Expert Tips" color="success" />
            <Chip label="150+ Score Strategy" color="warning" />
            <Chip label="Free Resources" color="info" />
          </Stack>
        </Box>

        {/* What is NATA Section */}
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
              📚 What is NATA?
            </Typography>
            <Typography variant="body1" paragraph>
              The National Aptitude Test in Architecture (NATA) is a
              national-level entrance exam conducted by the Council of
              Architecture (COA) for admission to undergraduate B.Arch programs
              in India. NATA evaluates candidates on their drawing skills,
              observation skills, sense of proportion, aesthetic sensitivity,
              and critical thinking ability.
            </Typography>
            <Box
              sx={{ bgcolor: "primary.light", p: 2, borderRadius: 2, mt: 2 }}
            >
              <Typography variant="body1" fontWeight={600}>
                🎯 Key Exam Details:
              </Typography>
              <List dense>
                <ListItem>
                  • <strong>Exam Mode:</strong> Computer-Based Test (CBT) +
                  Drawing Test
                </ListItem>
                <ListItem>
                  • <strong>Total Marks:</strong> 200 (125 for Part A + 75 for
                  Part B)
                </ListItem>
                <ListItem>
                  • <strong>Duration:</strong> 3 hours (Part A: 2 hours, Part B:
                  1 hour)
                </ListItem>
                <ListItem>
                  • <strong>Attempts:</strong> Multiple attempts per year
                  (typically 2 tests)
                </ListItem>
                <ListItem>
                  • <strong>Minimum Score:</strong> 70 marks (25 in Part B
                  mandatory)
                </ListItem>
              </List>
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
              📋 NATA Exam Pattern {currentYear}
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontSize: "1.4rem", fontWeight: 600, mb: 2, mt: 3 }}
            >
              Part A: Mathematics & General Aptitude (125 marks)
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Mathematics (40 questions)"
                  secondary="Algebra, Calculus, Coordinate Geometry, 3D Geometry, Statistics"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="General Aptitude (40 questions)"
                  secondary="Objects & Textures, Architectural Awareness, Building & Environment, Visualizing 3D from 2D"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h4"
              sx={{ fontSize: "1.4rem", fontWeight: 600, mb: 2 }}
            >
              Part B: Drawing Test (75 marks)
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Drawing Test (2 questions)"
                  secondary="Perspective Drawing, Drawing from Memory, Composition, Color & Texture, 2D/3D Sketching"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Step-by-Step Preparation Strategy */}
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
              🎯 Step-by-Step NATA Preparation Strategy
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 1: Understand the Syllabus (Week 1)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Start by thoroughly understanding the NATA syllabus. Download
                  the official COA syllabus and create a checklist of all
                  topics.
                </Typography>
                <List dense>
                  <ListItem>
                    • Download official NATA syllabus from COA website
                  </ListItem>
                  <ListItem>
                    • Categorize topics into Mathematics, General Aptitude, and
                    Drawing
                  </ListItem>
                  <ListItem>• Identify your strong and weak areas</ListItem>
                  <ListItem>
                    • Create a priority list based on weightage and difficulty
                  </ListItem>
                </List>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  component={Link}
                  href="/resources/nata-syllabus"
                  sx={{ mt: 2 }}
                >
                  Download NATA Syllabus PDF
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 2: Gather Study Materials (Week 1-2)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph fontWeight={600}>
                  📚 Essential Books for NATA:
                </Typography>
                <List dense>
                  <ListItem>
                    <strong>Mathematics:</strong> R.S. Aggarwal, NCERT Class XI
                    & XII
                  </ListItem>
                  <ListItem>
                    <strong>General Aptitude:</strong> Nimish Madan, Arihant
                    NATA Guide
                  </ListItem>
                  <ListItem>
                    <strong>Drawing:</strong> Nata Drawing Skills by Er.
                    Somsirsa Chatterjee
                  </ListItem>
                  <ListItem>
                    <strong>Practice:</strong> Previous Year NATA Question
                    Papers ({yearRange})
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/best-books-for-nata"
                  sx={{ mt: 2 }}
                >
                  View Complete Books List →
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 3: Create a Study Timetable (Ongoing)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Allocate time based on your current preparation level:
                </Typography>
                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography fontWeight={600} mb={1}>
                    ⏰ Daily Study Schedule (6-8 hours):
                  </Typography>
                  <List dense>
                    <ListItem>
                      • <strong>Mathematics:</strong> 2 hours (theory + problem
                      solving)
                    </ListItem>
                    <ListItem>
                      • <strong>General Aptitude:</strong> 2 hours (MCQs +
                      visualization)
                    </ListItem>
                    <ListItem>
                      • <strong>Drawing Practice:</strong> 2-3 hours (MUST DO
                      DAILY)
                    </ListItem>
                    <ListItem>
                      • <strong>Revision & Mock Tests:</strong> 1-2 hours
                    </ListItem>
                  </List>
                </Box>
                <Typography variant="body2" color="error" fontWeight={600}>
                  ⚠️ Golden Rule: Never skip daily drawing practice! Consistency
                  is key for Part B.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 4: Master Mathematics (2-3 months)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph fontWeight={600}>
                  🎯 High-Weightage Topics:
                </Typography>
                <List dense>
                  <ListItem>
                    ✅ Coordinate Geometry (2D & 3D) - Most Important
                  </ListItem>
                  <ListItem>
                    ✅ Trigonometry & Inverse Trigonometric Functions
                  </ListItem>
                  <ListItem>
                    ✅ Calculus (Differentiation & Integration)
                  </ListItem>
                  <ListItem>✅ Vectors & 3D Geometry</ListItem>
                  <ListItem>✅ Permutations & Combinations</ListItem>
                  <ListItem>✅ Matrices & Determinants</ListItem>
                </List>
                <Box
                  sx={{
                    bgcolor: "success.light",
                    p: 2,
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Typography fontWeight={600}>💡 Pro Tips:</Typography>
                  <List dense>
                    <ListItem>
                      • Focus on NCERT first, then move to advanced books
                    </ListItem>
                    <ListItem>• Solve at least 50 questions per topic</ListItem>
                    <ListItem>
                      • Practice speed - aim for 1.5 minutes per question
                    </ListItem>
                    <ListItem>
                      • Create formula sheets for quick revision
                    </ListItem>
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 5: Build General Aptitude Skills (2-3 months)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  General Aptitude tests your observation, visualization, and
                  architectural awareness:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Architectural Awareness"
                      secondary="Study famous buildings, architects, architectural styles, and current trends. Follow architecture magazines and websites."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Visualizing 3D from 2D"
                      secondary="Practice mental rotation, isometric views, orthographic projections. Use online 3D modeling tools for practice."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Objects & Textures"
                      secondary="Observe everyday objects, their textures, patterns, and relationships. Practice identifying materials and surfaces."
                    />
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/nata-general-aptitude-study-material"
                  sx={{ mt: 2 }}
                >
                  Download GA Study Material →
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 6: Master Drawing Skills (4-6 months - MOST CRITICAL)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph color="error" fontWeight={600}>
                  🎨 Drawing carries 75 marks and is MANDATORY to clear (minimum
                  25 marks required)
                </Typography>

                <Typography variant="h6" fontWeight={600} mt={2} mb={1}>
                  Daily Drawing Practice Routine:
                </Typography>
                <List dense>
                  <ListItem>
                    <strong>Week 1-4:</strong> Basic sketching, lines, curves,
                    shading techniques
                  </ListItem>
                  <ListItem>
                    <strong>Week 5-8:</strong> 2D objects, perspective basics,
                    proportion
                  </ListItem>
                  <ListItem>
                    <strong>Week 9-12:</strong> 3D objects, one-point &
                    two-point perspective
                  </ListItem>
                  <ListItem>
                    <strong>Week 13-16:</strong> Composition, color theory,
                    texture rendering
                  </ListItem>
                  <ListItem>
                    <strong>Week 17-24:</strong> Timed practice, past year
                    questions, mock tests
                  </ListItem>
                </List>

                <Box
                  sx={{
                    bgcolor: "warning.light",
                    p: 2,
                    borderRadius: 2,
                    mt: 3,
                  }}
                >
                  <Typography fontWeight={600} mb={1}>
                    🚀 How to Increase Drawing Speed:
                  </Typography>
                  <List dense>
                    <ListItem>
                      • Practice with timer - start with 45 mins, reduce to 30
                      mins
                    </ListItem>
                    <ListItem>
                      • Use reference images but practice from memory
                    </ListItem>
                    <ListItem>
                      • Learn shortcuts for common elements (trees, people,
                      cars)
                    </ListItem>
                    <ListItem>
                      • Master quick shading techniques (hatching,
                      cross-hatching)
                    </ListItem>
                    <ListItem>
                      • Keep your tools organized and within reach
                    </ListItem>
                  </List>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DownloadIcon />}
                  component={Link}
                  href="/2d-sketching-study-sheet"
                  sx={{ mt: 2 }}
                >
                  Download 2D Sketching Study Sheet
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 7: Solve Previous Year Papers (Last 2 months)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Previous year papers are your best resource to understand exam
                  pattern and difficulty level.
                </Typography>
                <List dense>
                  <ListItem>
                    • Solve papers from {yearRange} (at least 10 years)
                  </ListItem>
                  <ListItem>
                    • Time yourself strictly - simulate real exam conditions
                  </ListItem>
                  <ListItem>• Analyze your mistakes and weak areas</ListItem>
                  <ListItem>
                    • Identify repeated topics and question patterns
                  </ListItem>
                  <ListItem>
                    • Focus on Part B drawing questions - practice all themes
                  </ListItem>
                </List>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  component={Link}
                  href="/nata-previous-year-papers"
                  sx={{ mt: 2 }}
                >
                  Download Previous Year Papers ({yearRange})
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Step 8: Take Mock Tests (Last 1 month)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Mock tests help you build exam temperament and improve time
                  management.
                </Typography>
                <List dense>
                  <ListItem>
                    • Take at least 15-20 full-length mock tests
                  </ListItem>
                  <ListItem>
                    • Use online test platforms for CBT practice
                  </ListItem>
                  <ListItem>
                    • Practice drawing on A3 sheets within time limit
                  </ListItem>
                  <ListItem>• Review your performance after each test</ListItem>
                  <ListItem>
                    • Maintain an error log and revise regularly
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  component={Link}
                  href="/nata-mock-test-series"
                  sx={{ mt: 2 }}
                >
                  Start Free Mock Tests →
                </Button>
              </AccordionDetails>
            </Accordion>
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
                  Is coaching necessary for NATA?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Coaching is <strong>not mandatory</strong> but highly
                  recommended for drawing preparation. While you can self-study
                  Mathematics and General Aptitude using books, coaching helps
                  in:
                </Typography>
                <List dense>
                  <ListItem>
                    ✅ Getting expert feedback on your drawings
                  </ListItem>
                  <ListItem>
                    ✅ Learning professional techniques and shortcuts
                  </ListItem>
                  <ListItem>
                    ✅ Access to quality study material and mock tests
                  </ListItem>
                  <ListItem>✅ Staying motivated and disciplined</ListItem>
                </List>
                <Typography mt={2}>
                  <strong>neramClasses.com</strong> offers both online and
                  offline coaching with personalized mentorship and unlimited
                  drawing practice sessions.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/applicationform"
                  sx={{ mt: 2 }}
                >
                  Enroll in NATA Coaching →
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  How much time is required to crack NATA from zero?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  The time required depends on your current skill level:
                </Typography>
                <List>
                  <ListItem>
                    <strong>Complete Beginner:</strong> 8-12 months of dedicated
                    preparation
                  </ListItem>
                  <ListItem>
                    <strong>Some Drawing Skills:</strong> 6-8 months
                  </ListItem>
                  <ListItem>
                    <strong>Good at Math & Drawing:</strong> 4-6 months
                  </ListItem>
                  <ListItem>
                    <strong>Crash Course:</strong> 3 months (minimum, very
                    intensive)
                  </ListItem>
                </List>
                <Box
                  sx={{ bgcolor: "info.light", p: 2, borderRadius: 2, mt: 2 }}
                >
                  <Typography fontWeight={600}>
                    💡 Recommended: Start at least 6 months before the exam for
                    comfortable preparation and 150+ score target.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  What should I study first for NATA?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph fontWeight={600}>
                  Priority Order:
                </Typography>
                <List>
                  <ListItem>
                    <strong>1. Drawing Skills (Start from Day 1):</strong> This
                    requires the most time to develop. Start daily practice
                    immediately, even if you're a beginner.
                  </ListItem>
                  <ListItem>
                    <strong>2. Mathematics:</strong> Begin with topics you're
                    weak in. Focus on Coordinate Geometry and Calculus first.
                  </ListItem>
                  <ListItem>
                    <strong>3. General Aptitude:</strong> Start after 1 month of
                    preparation. This requires continuous learning and
                    observation.
                  </ListItem>
                </List>
                <Typography mt={2} color="error" fontWeight={600}>
                  ⚠️ Never delay drawing practice - it takes the longest to
                  master!
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  How to score 150+ in NATA?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph fontWeight={600}>
                  Score Breakdown for 150+ target:
                </Typography>
                <List>
                  <ListItem>
                    • <strong>Mathematics:</strong> 50-55 marks (out of 62.5)
                  </ListItem>
                  <ListItem>
                    • <strong>General Aptitude:</strong> 45-50 marks (out of
                    62.5)
                  </ListItem>
                  <ListItem>
                    • <strong>Drawing:</strong> 55-60 marks (out of 75)
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
                  <Typography fontWeight={600} mb={1}>
                    🎯 Scoring Strategy:
                  </Typography>
                  <List dense>
                    <ListItem>
                      • Mathematics: Solve 35-40 questions correctly (skip
                      difficult ones)
                    </ListItem>
                    <ListItem>
                      • General Aptitude: Target 30-35 correct answers (focus on
                      architectural awareness)
                    </ListItem>
                    <ListItem>
                      • Drawing: Score 70-75% by mastering composition,
                      perspective, and rendering
                    </ListItem>
                    <ListItem>
                      • Time Management: Don&apos;t spend more than 90 seconds
                      per MCQ
                    </ListItem>
                    <ListItem>
                      • Accuracy &gt; Speed: No negative marking, but guess
                      intelligently
                    </ListItem>
                  </List>
                </Box>
                <Button
                  variant="contained"
                  component={Link}
                  href="/how-to-score-150-in-nata"
                  sx={{ mt: 2 }}
                >
                  Read Complete Scoring Strategy →
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>
                  How to prepare NATA + JEE B.Arch together?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Good news! 70-80% syllabus overlaps between NATA and JEE Paper
                  2. You can prepare both simultaneously.
                </Typography>
                <Typography fontWeight={600} mb={1}>
                  Common Topics:
                </Typography>
                <List dense>
                  <ListItem>✅ All Mathematics topics (100% overlap)</ListItem>
                  <ListItem>✅ Drawing skills (techniques are same)</ListItem>
                  <ListItem>✅ Aptitude & Reasoning (80% overlap)</ListItem>
                </List>
                <Typography fontWeight={600} mt={2} mb={1}>
                  Additional for JEE Paper 2:
                </Typography>
                <List dense>
                  <ListItem>• Physics (Class 11-12 syllabus)</ListItem>
                  <ListItem>• Chemistry (Class 11-12 syllabus)</ListItem>
                  <ListItem>• Aptitude Test Part 2 (specific to JEE)</ListItem>
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
              🎁 Free NATA Resources
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, maxWidth: 800, mx: "auto" }}
            >
              Download our comprehensive study materials, previous year papers,
              and practice sheets to supercharge your preparation!
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
                href="/nata-previous-year-papers"
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
                href="/2d-sketching-study-sheet"
              >
                Drawing Study Sheets
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
                href="/nata-formula-sheet"
              >
                Formula Sheets
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card sx={{ textAlign: "center", boxShadow: 3 }}>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Start Your NATA Journey?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join India's #1 NATA coaching platform with 5000+ successful
              students
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/applicationform"
              sx={{ px: 4 }}
            >
              Enroll Now - Limited Seats Available
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
