"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  List,
  ListItem,
  Paper,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import TimerIcon from "@mui/icons-material/Timer";
import Link from "next/link";
import TopNavBar from "../../components/shared/TopNavBar";
import { getCurrentYear } from "@/utils/dateUtils";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";
import Script from "next/script";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/utils/schemaMarkup";

export default function ScoreImprovementPage() {
  const currentYear = getCurrentYear();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  // Schema markup
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "How to Score 150 in NATA", url: "/how-to-score-150-in-nata" },
    ],
    siteUrl
  );

  const articleSchema = generateArticleSchema(
    {
      headline: `How to Score 150+ in NATA ${currentYear}`,
      description:
        "Proven strategies and tips to score 150+ marks in NATA exam. Learn section-wise preparation, time management, and scoring techniques.",
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
      question: "Is scoring 150+ in NATA difficult?",
      answer:
        "Scoring 150+ is achievable with structured preparation. Around 15-20% of students score above 150. Focus on Drawing (70+), MCQ (60+), and General Aptitude (20+).",
    },
    {
      question: "How much time is needed to reach 150+ score?",
      answer:
        "With dedicated practice, 6-8 months is sufficient. Focus 60% time on drawing, 30% on MCQs, and 10% on aptitude. Daily 4-5 hours of practice recommended.",
    },
    {
      question: "Which section should I focus on most?",
      answer:
        "Prioritize Drawing (100 marks) - aim for 70+. Then Mathematics and Physics (90 marks combined) - target 60+. Finally General Aptitude (35 marks) - secure 20+.",
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
          title: "Score 150+ in NATA - Complete Strategy",
          showBreadcrumbs: true,
          autoBreadcrumbs: true,
        }}
      />
      <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>
        {/* Hero */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "3.5rem" },
              fontWeight: 700,
              mb: 2,
              color: "neramPurple.main",
            }}
          >
            How to Score 150+ in NATA {currentYear}?
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
            }}
          >
            Proven Strategy Used by 500+ Top Scorers
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            <Chip
              label="150+ Score Guaranteed"
              color="success"
              icon={<EmojiEventsIcon />}
            />
            <Chip label="Expert Strategy" color="primary" />
            <Chip label="Topic-wise Targets" color="warning" />
          </Stack>
        </Box>

        {/* Target Breakdown */}
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: "success.light" }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "2rem",
                fontWeight: 600,
                mb: 3,
                color: "success.dark",
                textAlign: "center",
              }}
            >
              🎯 150+ Score Breakdown
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "white",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="success.main"
                    mb={1}
                  >
                    50-55
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    Mathematics
                  </Typography>
                  <Typography variant="caption">(out of 62.5 marks)</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Attempt: 35-38 questions
                  </Typography>
                  <Typography variant="body2">Target Accuracy: 95%+</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "white",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="info.main"
                    mb={1}
                  >
                    45-50
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    General Aptitude
                  </Typography>
                  <Typography variant="caption">(out of 62.5 marks)</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Attempt: 30-35 questions
                  </Typography>
                  <Typography variant="body2">Target Accuracy: 90%+</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "white",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="warning.main"
                    mb={1}
                  >
                    55-60
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    Drawing Test
                  </Typography>
                  <Typography variant="caption">(out of 75 marks)</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Must score: 70-75%
                  </Typography>
                  <Typography variant="body2">
                    Focus: Composition & Perspective
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography fontWeight={600}>
                💯 Total Target: 150-165 marks (out of 200) = Top 5% percentile
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Mathematics Strategy */}
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
              🧮 Mathematics: How to Score 50-55/62.5
            </Typography>

            <Typography variant="h6" fontWeight={600} mb={2}>
              High-Scoring Topics (Focus 80% effort here):
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "success.light" }}>
                  <Typography fontWeight={600} mb={1}>
                    Must-Master Topics:
                  </Typography>
                  <List dense>
                    <ListItem>
                      ✅ Coordinate Geometry 2D (12-15 questions)
                    </ListItem>
                    <ListItem>
                      ✅ Trigonometry & Inverse (8-10 questions)
                    </ListItem>
                    <ListItem>
                      ✅ Calculus - Differentiation (6-8 questions)
                    </ListItem>
                    <ListItem>
                      ✅ Vectors & 3D Geometry (5-7 questions)
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, bgcolor: "info.light" }}>
                  <Typography fontWeight={600} mb={1}>
                    Moderate Priority:
                  </Typography>
                  <List dense>
                    <ListItem>
                      • Matrices & Determinants (3-5 questions)
                    </ListItem>
                    <ListItem>
                      • Permutations & Combinations (3-4 questions)
                    </ListItem>
                    <ListItem>• Integration (3-4 questions)</ListItem>
                    <ListItem>
                      • Statistics & Probability (2-3 questions)
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{ bgcolor: "warning.light", p: 3, borderRadius: 2, mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                ⚡ Speed & Accuracy Formula:
              </Typography>
              <List>
                <ListItem>
                  <strong>Easy Questions (20-25):</strong> Solve in 1 minute
                  each → 100% accuracy target
                </ListItem>
                <ListItem>
                  <strong>Medium Questions (12-15):</strong> Solve in 2 minutes
                  each → 95% accuracy target
                </ListItem>
                <ListItem>
                  <strong>Difficult Questions (3-5):</strong> Skip or
                  intelligent guess → Don&apos;t waste time
                </ListItem>
              </List>
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography fontWeight={600}>
                  ⚠️ Golden Rule: Never spend more than 2.5 minutes on any
                  single question! Skip and move on.
                </Typography>
              </Alert>
            </Box>

            <Typography variant="h6" fontWeight={600} mb={2}>
              Daily Practice Routine:
            </Typography>
            <List>
              <ListItem>
                📅 <strong>Month 1-2:</strong> Complete NCERT + R.S. Aggarwal
                (theory + basic problems)
              </ListItem>
              <ListItem>
                📅 <strong>Month 3-4:</strong> Solve 50 problems per topic
                (focus on high-weightage topics)
              </ListItem>
              <ListItem>
                📅 <strong>Month 5-6:</strong> Solve previous year NATA
                questions + timed practice
              </ListItem>
              <ListItem>
                📅 <strong>Last Month:</strong> Full-length mock tests +
                revision of formulas
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* General Aptitude Strategy */}
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
              🧠 General Aptitude: How to Score 45-50/62.5
            </Typography>

            <Typography variant="h6" fontWeight={600} mb={2}>
              Scoring Strategy by Sub-section:
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, bgcolor: "info.light" }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    📐 Visualizing 3D from 2D (30-35%)
                  </Typography>
                  <List dense>
                    <ListItem>
                      <strong>Target:</strong> 12-14 correct out of 15-16
                      questions
                    </ListItem>
                    <ListItem>
                      <strong>Practice:</strong> Solve 500+ visualization MCQs
                    </ListItem>
                    <ListItem>
                      <strong>Tools:</strong> Use online 3D modeling apps
                      (Tinkercad, SketchUp)
                    </ListItem>
                    <ListItem>
                      <strong>Focus:</strong> Isometric views, orthographic
                      projections, mental rotation
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, bgcolor: "success.light" }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    🏛️ Architectural Awareness (25-30%)
                  </Typography>
                  <List dense>
                    <ListItem>
                      <strong>Target:</strong> 10-12 correct out of 12-14
                      questions
                    </ListItem>
                    <ListItem>
                      <strong>Study:</strong> 100 famous buildings + architects
                    </ListItem>
                    <ListItem>
                      <strong>Resources:</strong> Architecture magazines,
                      Wikipedia, YouTube
                    </ListItem>
                    <ListItem>
                      <strong>Focus:</strong> UNESCO sites, Indian heritage,
                      modern architects
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, bgcolor: "warning.light" }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    🎨 Objects, Textures & Materials (20-25%)
                  </Typography>
                  <List dense>
                    <ListItem>
                      <strong>Target:</strong> 8-10 correct out of 10-12
                      questions
                    </ListItem>
                    <ListItem>
                      <strong>Practice:</strong> Observe everyday objects,
                      materials, patterns
                    </ListItem>
                    <ListItem>
                      <strong>Study:</strong> Building materials, textures,
                      surface finishes
                    </ListItem>
                    <ListItem>
                      <strong>Tip:</strong> Take photos of textures, create a
                      reference folder
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, bgcolor: "error.light" }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    🧩 Logical Reasoning (15-20%)
                  </Typography>
                  <List dense>
                    <ListItem>
                      <strong>Target:</strong> 6-8 correct out of 8-10 questions
                    </ListItem>
                    <ListItem>
                      <strong>Practice:</strong> CAT/MAT reasoning questions
                    </ListItem>
                    <ListItem>
                      <strong>Topics:</strong> Series, patterns, analogies,
                      coding-decoding
                    </ListItem>
                    <ListItem>
                      <strong>Speed:</strong> Solve in 1 minute per question max
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{ bgcolor: "primary.light", p: 3, borderRadius: 2, mt: 3 }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                💡 Pro Tips for General Aptitude:
              </Typography>
              <List>
                <ListItem>
                  ✅ Study architectural awareness from <strong>Day 1</strong> -
                  it takes time to build
                </ListItem>
                <ListItem>
                  ✅ Practice 3D visualization daily (even 15 minutes) -
                  consistency is key
                </ListItem>
                <ListItem>
                  ✅ Create flashcards for famous buildings, architects,
                  materials
                </ListItem>
                <ListItem>
                  ✅ Follow architecture Instagram accounts, Pinterest boards
                </ListItem>
                <ListItem>
                  ✅ Watch documentaries on famous buildings and architects
                </ListItem>
              </List>
            </Box>
          </CardContent>
        </Card>

        {/* Drawing Strategy */}
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
              🎨 Drawing Test: How to Score 55-60/75
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>
                🚨 CRITICAL: You MUST score minimum 25/75 in drawing to clear
                NATA, even if you score 100% in other sections!
              </Typography>
            </Alert>

            <Typography variant="h6" fontWeight={600} mb={2}>
              Scoring Breakdown (How Drawing is Evaluated):
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography fontWeight={600} mb={1}>
                    Question 1: (35-40 marks)
                  </Typography>
                  <List dense>
                    <ListItem>• Composition & Layout: 10-12 marks</ListItem>
                    <ListItem>• Perspective & Proportion: 8-10 marks</ListItem>
                    <ListItem>• Detailing: 6-8 marks</ListItem>
                    <ListItem>• Shading & Depth: 6-8 marks</ListItem>
                    <ListItem>• Overall Impact: 5-7 marks</ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography fontWeight={600} mb={1}>
                    Question 2: (35-40 marks)
                  </Typography>
                  <List dense>
                    <ListItem>• Color Application: 10-12 marks</ListItem>
                    <ListItem>• Creativity & Theme: 8-10 marks</ListItem>
                    <ListItem>• Composition: 6-8 marks</ListItem>
                    <ListItem>• Texture Rendering: 6-8 marks</ListItem>
                    <ListItem>• Cleanliness: 5-7 marks</ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{ bgcolor: "warning.light", p: 3, borderRadius: 2, mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                ⏱️ Time Management for Drawing:
              </Typography>
              <List>
                <ListItem>
                  <strong>Question 1 (60 minutes):</strong>
                </ListItem>
                <List dense sx={{ pl: 4 }}>
                  <ListItem>• Planning & rough sketch: 5 minutes</ListItem>
                  <ListItem>• Main outline drawing: 20 minutes</ListItem>
                  <ListItem>• Detailing: 20 minutes</ListItem>
                  <ListItem>• Shading & finishing: 15 minutes</ListItem>
                </List>
                <ListItem>
                  <strong>Question 2 (60 minutes):</strong>
                </ListItem>
                <List dense sx={{ pl: 4 }}>
                  <ListItem>• Planning composition: 5 minutes</ListItem>
                  <ListItem>• Basic drawing: 15 minutes</ListItem>
                  <ListItem>• Color application: 25 minutes</ListItem>
                  <ListItem>• Textures & final touches: 15 minutes</ListItem>
                </List>
              </List>
            </Box>

            <Typography variant="h6" fontWeight={600} mb={2}>
              6-Month Drawing Mastery Plan:
            </Typography>
            <List>
              <ListItem>
                <strong>Month 1-2: Basics (2 hours/day)</strong>
              </ListItem>
              <List dense sx={{ pl: 4 }}>
                <ListItem>
                  ✏️ Line work, curves, shading techniques (hatching,
                  cross-hatching)
                </ListItem>
                <ListItem>
                  ✏️ Basic shapes - cube, cylinder, cone, sphere (with shading)
                </ListItem>
                <ListItem>✏️ Simple objects from reference</ListItem>
                <ListItem>✏️ One-point perspective basics</ListItem>
              </List>

              <ListItem>
                <strong>Month 3-4: Intermediate (2-3 hours/day)</strong>
              </ListItem>
              <List dense sx={{ pl: 4 }}>
                <ListItem>✏️ Two-point perspective buildings</ListItem>
                <ListItem>
                  ✏️ Drawing common objects (furniture, vehicles, trees, people)
                </ListItem>
                <ListItem>
                  ✏️ Composition practice - arranging multiple elements
                </ListItem>
                <ListItem>✏️ Color theory & application basics</ListItem>
              </List>

              <ListItem>
                <strong>
                  Month 5-6: Advanced & Timed Practice (3-4 hours/day)
                </strong>
              </ListItem>
              <List dense sx={{ pl: 4 }}>
                <ListItem>
                  ✏️ Previous year NATA drawing questions (all themes)
                </ListItem>
                <ListItem>
                  ✏️ Timed practice - complete drawings in 60 minutes
                </ListItem>
                <ListItem>✏️ Memory drawing practice</ListItem>
                <ListItem>✏️ Mock tests with peer/teacher evaluation</ListItem>
              </List>
            </List>

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography fontWeight={600} mb={1}>
                🎯 Drawing Score Formula:
              </Typography>
              <Typography>
                <strong>
                  55-60/75 = Good composition (20) + Accurate perspective (15) +
                  Clean rendering (15) + Creative theme (10)
                </strong>
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Common Mistakes */}
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: "error.light" }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "1.8rem",
                fontWeight: 600,
                mb: 3,
                color: "error.dark",
              }}
            >
              ⚠️ Common Mistakes That Cost You 10-20 Marks
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography fontWeight={600} mb={1}>
                  Mathematics Mistakes:
                </Typography>
                <List dense>
                  <ListItem>
                    ❌ Spending too much time on difficult questions
                  </ListItem>
                  <ListItem>❌ Not revising formulas before exam</ListItem>
                  <ListItem>❌ Making calculation errors due to rush</ListItem>
                  <ListItem>❌ Not attempting easy questions first</ListItem>
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography fontWeight={600} mb={1}>
                  General Aptitude Mistakes:
                </Typography>
                <List dense>
                  <ListItem>
                    ❌ Not studying architectural awareness seriously
                  </ListItem>
                  <ListItem>
                    ❌ Rushing through visualization questions
                  </ListItem>
                  <ListItem>❌ Ignoring current architecture trends</ListItem>
                  <ListItem>❌ Not practicing enough MCQs</ListItem>
                </List>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography fontWeight={600} mb={1}>
                  Drawing Mistakes:
                </Typography>
                <List dense>
                  <ListItem>
                    ❌ Starting without planning - poor composition
                  </ListItem>
                  <ListItem>
                    ❌ Wrong perspective - most common mistake
                  </ListItem>
                  <ListItem>
                    ❌ Overdetailing one part, leaving rest incomplete
                  </ListItem>
                  <ListItem>❌ Using too many colors - messy look</ListItem>
                  <ListItem>❌ Not practicing timed drawings enough</ListItem>
                  <ListItem>❌ Ignoring shading - flat drawings</ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Last Week Strategy */}
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
              📅 Last Week Before NATA - Final Push Strategy
            </Typography>
            <List>
              <ListItem>
                <strong>Day 7-6:</strong> Take 2 full-length mock tests. Analyze
                mistakes thoroughly.
              </ListItem>
              <ListItem>
                <strong>Day 5-4:</strong> Revise all formulas, architectural
                awareness notes. Light drawing practice.
              </ListItem>
              <ListItem>
                <strong>Day 3:</strong> Solve previous year paper under timed
                conditions.
              </ListItem>
              <ListItem>
                <strong>Day 2:</strong> Revise formula sheets only. Practice 2-3
                drawing themes.
              </ListItem>
              <ListItem>
                <strong>Day 1 (Before Exam):</strong> NO HEAVY STUDY. Just go
                through formula sheets. Relax, sleep well.
              </ListItem>
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography fontWeight={600}>
                💡 Keep your drawing tools ready (pencils, colors, ruler,
                eraser) and organized the night before!
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Success Stories CTA */}
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
              🏆 Join 500+ Students Who Scored 150+
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, maxWidth: 800, mx: "auto" }}
            >
              Get personalized guidance, mock tests, and drawing feedback from
              expert mentors at neramClasses
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "neramPurple.main",
                "&:hover": { bgcolor: "grey.100" },
              }}
              component={Link}
              href="/applicationform"
            >
              Enroll in NATA Coaching - Limited Seats
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
