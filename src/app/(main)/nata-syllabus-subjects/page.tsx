"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import GridOrig from "@mui/material/Grid";
const Grid: any = GridOrig;
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TopNavBar from "@/app/components/shared/TopNavBar";
import Footer from "@/app/components/shared/Footer/footer";
import Link from "next/link";

export default function NATASyllabusPage() {
  const [expanded, setExpanded] = useState<string | false>("mathematics");

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <>
      <TopNavBar />
      <Box sx={{ bgcolor: "#f9fafb", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3rem" },
                color: "#1e293b",
              }}
            >
              NATA Syllabus 2025: Complete Subject-wise Guide
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 800, mx: "auto" }}
            >
              Detailed chapter-wise breakdown, weightage analysis, important
              topics, and study plans to score 150+ in NATA 2025
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              component={Link}
              href="/freebooks"
              sx={{
                bgcolor: "#667eea",
                px: 4,
                py: 1.5,
                fontWeight: 700,
                "&:hover": { bgcolor: "#764ba2" },
              }}
            >
              Download Free NATA Syllabus PDF
            </Button>
          </Box>

          {/* Exam Pattern Overview */}
          <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              NATA 2025 Exam Pattern Overview
            </Typography>

            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 4 }}>
                <Card sx={{ bgcolor: "#f0f7ff", height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#667eea" }}
                    >
                      Part A: MCQ Test
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Mathematics: 25 questions (25 marks)
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • General Aptitude: 25 questions (100 marks)
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Mode: Computer-based Test (CBT)
                    </Typography>
                    <Typography variant="body2">
                      • Total: <strong>125 marks</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <Card sx={{ bgcolor: "#fff5f0", height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#f97316" }}
                    >
                      Part B: Drawing Test
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • 2 Drawing Questions
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Mode: Paper-based (A4 sheets)
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Tools: Pencils, colors, shading
                    </Typography>
                    <Typography variant="body2">
                      • Total: <strong>50 marks</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <Card sx={{ bgcolor: "#f0fdf4", height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#16a34a" }}
                    >
                      Part C: Aesthetic Sensitivity
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • 25 Image-based MCQs
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Topics: Texture, Color, Design
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Mode: Computer-based Test (CBT)
                    </Typography>
                    <Typography variant="body2">
                      • Total: <strong>25 marks</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>Total NATA Marks: 200</strong> | Duration: 3 hours |
              Negative Marking: -1 mark for wrong MCQ | Qualifying Marks: 70/200
            </Alert>
          </Paper>

          {/* Mathematics Syllabus */}
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Detailed Subject-wise Syllabus
          </Typography>

          <Accordion
            expanded={expanded === "mathematics"}
            onChange={handleChange("mathematics")}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Part A: Mathematics (25 marks)
                </Typography>
                <Chip label="High Weightage" color="error" size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Chapter/Topic
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Weightage</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Important Sub-topics
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        chapter: "Algebra",
                        weightage: "3-4 Q",
                        topics:
                          "Sets, Relations, Functions, Quadratic equations, Logarithms, Sequences & Series",
                        difficulty: "Medium",
                      },
                      {
                        chapter: "Trigonometry",
                        weightage: "4-5 Q",
                        topics:
                          "Trigonometric ratios, Identities, Equations, Heights & Distances, Inverse functions",
                        difficulty: "Easy-Medium",
                      },
                      {
                        chapter: "Coordinate Geometry",
                        weightage: "5-6 Q",
                        topics:
                          "Straight lines, Circles, Parabola, Ellipse, Hyperbola, Distance formula",
                        difficulty: "Medium",
                      },
                      {
                        chapter: "Calculus",
                        weightage: "6-7 Q",
                        topics:
                          "Limits, Continuity, Differentiation, Applications of derivatives, Integration, Areas",
                        difficulty: "Medium-High",
                      },
                      {
                        chapter: "3D Geometry",
                        weightage: "2-3 Q",
                        topics:
                          "3D coordinates, Direction cosines, Lines & Planes in 3D",
                        difficulty: "Medium",
                      },
                      {
                        chapter: "Statistics & Probability",
                        weightage: "2-3 Q",
                        topics:
                          "Mean, Median, Mode, Standard Deviation, Permutations, Combinations",
                        difficulty: "Easy",
                      },
                      {
                        chapter: "Matrices & Determinants",
                        weightage: "1-2 Q",
                        topics:
                          "Matrix operations, Determinant properties, Inverse of matrix",
                        difficulty: "Easy-Medium",
                      },
                    ].map((row, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.chapter}
                        </TableCell>
                        <TableCell>{row.weightage}</TableCell>
                        <TableCell sx={{ fontSize: "0.875rem" }}>
                          {row.topics}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.difficulty}
                            size="small"
                            color={
                              row.difficulty.includes("Easy")
                                ? "success"
                                : row.difficulty.includes("High")
                                ? "error"
                                : "warning"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="success" sx={{ mt: 3 }}>
                <strong>Pro Tip:</strong> 70% questions are direct NCERT
                formula-based. Master NCERT Class 11-12 examples & exercises
                first!
              </Alert>
            </AccordionDetails>
          </Accordion>

          {/* General Aptitude Syllabus */}
          <Accordion
            expanded={expanded === "aptitude"}
            onChange={handleChange("aptitude")}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Part A: General Aptitude (100 marks)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  {
                    topic: "Sets & Relations",
                    weightage: "8-10 marks",
                    subtopics: [
                      "Set operations (Union, Intersection, Complement)",
                      "Venn diagrams and applications",
                      "Types of relations (Reflexive, Symmetric, Transitive)",
                      "Equivalence relations",
                    ],
                  },
                  {
                    topic: "Visual & Spatial Reasoning",
                    weightage: "20-25 marks",
                    subtopics: [
                      "Pattern recognition and completion",
                      "Mirror images and water images",
                      "Paper folding and cutting",
                      "3D visualization from 2D drawings",
                      "Counting figures and embedded shapes",
                    ],
                  },
                  {
                    topic: "Logical Reasoning",
                    weightage: "15-18 marks",
                    subtopics: [
                      "Analogies and classifications",
                      "Series completion (number, letter, figure)",
                      "Coding-decoding",
                      "Blood relations",
                      "Direction sense",
                      "Ranking and arrangement",
                    ],
                  },
                  {
                    topic: "Proportion & Symmetry",
                    weightage: "12-15 marks",
                    subtopics: [
                      "Ratios and proportions in design",
                      "Golden ratio applications",
                      "Symmetry in nature and architecture",
                      "Scale and proportion of human figures",
                      "Balance and composition principles",
                    ],
                  },
                  {
                    topic: "Perspective Drawing Theory",
                    weightage: "10-12 marks",
                    subtopics: [
                      "1-point, 2-point, 3-point perspective",
                      "Vanishing points and horizon line",
                      "Foreshortening concepts",
                      "Depth and distance perception",
                    ],
                  },
                  {
                    topic: "Objects & Texture",
                    weightage: "8-10 marks",
                    subtopics: [
                      "Identifying textures (wood, metal, glass, fabric)",
                      "Object rotation and transformation",
                      "Material properties in design",
                      "Surface characteristics",
                    ],
                  },
                  {
                    topic: "Building Elements",
                    weightage: "8-10 marks",
                    subtopics: [
                      "Basic architectural elements (doors, windows, columns)",
                      "Building materials identification",
                      "Structural components understanding",
                      "Architectural styles recognition",
                    ],
                  },
                ].map((topic, index) => (
                  <Grid item size={{ xs: 12, md: 6 }} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, mb: 1, color: "#667eea" }}
                        >
                          {topic.topic}
                        </Typography>
                        <Chip
                          label={topic.weightage}
                          size="small"
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {topic.subtopics.map((sub, idx) => (
                            <Typography
                              component="li"
                              variant="body2"
                              key={idx}
                              sx={{ mb: 0.5 }}
                            >
                              {sub}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Drawing Test Syllabus */}
          <Accordion
            expanded={expanded === "drawing"}
            onChange={handleChange("drawing")}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Part B: Drawing Test (50 marks)
                </Typography>
                <Chip label="Practice Intensive" color="warning" size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                Two drawing questions testing artistic expression, observation,
                and spatial understanding. Each drawing is evaluated on 5
                parameters:
              </Typography>

              <Grid container spacing={3}>
                {[
                  {
                    criteria: "Relevance to Theme",
                    marks: "10 marks",
                    description:
                      "Understanding the question and creating appropriate visual response. Avoid off-topic drawings.",
                  },
                  {
                    criteria: "Composition",
                    marks: "10 marks",
                    description:
                      "Balanced arrangement, focal point, rule of thirds, visual flow. Frame your drawing well.",
                  },
                  {
                    criteria: "Proportion & Scale",
                    marks: "10 marks",
                    description:
                      "Accurate size relationships between elements. Human figure = 8 heads. Object proportions realistic.",
                  },
                  {
                    criteria: "Detailing & Finishing",
                    marks: "10 marks",
                    description:
                      "Texture rendering, shading quality, line weight variation. Avoid incomplete drawings.",
                  },
                  {
                    criteria: "Creativity & Originality",
                    marks: "10 marks",
                    description:
                      "Unique interpretation, artistic expression, innovative ideas. Stand out from generic drawings.",
                  },
                ].map((item, index) => (
                  <Grid item size={{ xs: 12, md: 6 }} key={index}>
                    <Paper sx={{ p: 3, bgcolor: "#fafafa" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.criteria}
                        </Typography>
                        <Chip label={item.marks} color="primary" size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Common Drawing Question Types:
                </Typography>
                <Grid container spacing={2}>
                  {[
                    "Draw a scene from your daily life (kitchen, market, playground)",
                    "Architectural elements (building facade, staircase, window details)",
                    "Natural elements (tree, landscape, garden, water body)",
                    "Objects in perspective (furniture, vehicles, household items)",
                    "Human activities (sports, work, celebration)",
                    "Abstract themes (emotions, seasons, time, movement)",
                  ].map((type, index) => (
                    <Grid item size={{ xs: 12, md: 6 }} key={index}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <CheckCircleIcon
                          color="success"
                          fontSize="small"
                          sx={{ mt: 0.5 }}
                        />
                        <Typography variant="body2">{type}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <strong>Time Management:</strong> Allocate 25 minutes per
                drawing. First 5 mins = rough sketch, next 15 mins =
                detailing/shading, last 5 mins = finishing touches.
              </Alert>
            </AccordionDetails>
          </Accordion>

          {/* Aesthetic Sensitivity Syllabus */}
          <Accordion
            expanded={expanded === "aesthetic"}
            onChange={handleChange("aesthetic")}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Part C: Aesthetic Sensitivity (25 marks)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                25 image-based multiple choice questions testing visual
                awareness and design understanding:
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    topic: "Texture Identification",
                    questions: "5-6 questions",
                    examples:
                      "Wood grain, metal finish, fabric weave, stone texture, glass properties",
                  },
                  {
                    topic: "Color Theory",
                    questions: "4-5 questions",
                    examples:
                      "Primary/secondary/tertiary colors, complementary colors, warm/cool colors, color harmony",
                  },
                  {
                    topic: "Architectural Styles",
                    questions: "4-5 questions",
                    examples:
                      "Gothic, Modern, Contemporary, Traditional Indian, Colonial, Art Deco",
                  },
                  {
                    topic: "Design Principles",
                    questions: "3-4 questions",
                    examples:
                      "Symmetry, balance, rhythm, proportion, emphasis, unity, contrast",
                  },
                  {
                    topic: "Form & Space",
                    questions: "3-4 questions",
                    examples:
                      "2D to 3D conversion, spatial relationships, positive/negative space",
                  },
                  {
                    topic: "Visual Elements",
                    questions: "2-3 questions",
                    examples:
                      "Line, shape, form, pattern, gradient, shadow analysis",
                  },
                ].map((item, index) => (
                  <Grid item size={{ xs: 12, md: 6 }} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          {item.topic}
                        </Typography>
                        <Chip
                          label={item.questions}
                          size="small"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {item.examples}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <strong>Preparation Tip:</strong> Study architecture books,
                observe building designs, understand color wheel, practice
                identifying textures. 20+ marks easily achievable!
              </Alert>
            </AccordionDetails>
          </Accordion>

          {/* Study Plans */}
          <Paper elevation={2} sx={{ p: 4, mt: 6, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              NATA Preparation Timeline: Study Plans
            </Typography>

            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: "100%", border: "2px solid #667eea" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#667eea" }}
                    >
                      12-Month Plan (Ideal)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Months 1-4:</strong> Complete NCERT Math, Aptitude
                      basics, Drawing fundamentals
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Months 5-8:</strong> Practice 500+ questions, 50+
                      drawings, topic tests
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Months 9-11:</strong> Revision, 25 full mocks,
                      weak area improvement
                    </Typography>
                    <Typography variant="body2">
                      <strong>Month 12:</strong> Final revision, previous
                      papers, exam strategies
                    </Typography>
                    <Button
                      component={Link}
                      href="/premium"
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Join 12-Month Batch
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: "100%", border: "2px solid #f97316" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#f97316" }}
                    >
                      6-Month Plan (Recommended)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Months 1-2:</strong> Fast-track Math NCERT,
                      Aptitude core topics, Drawing basics
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Months 3-4:</strong> 300+ practice questions, 30+
                      drawings, weekly tests
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Month 5:</strong> 15 full mocks, detailed
                      analysis, gap filling
                    </Typography>
                    <Typography variant="body2">
                      <strong>Month 6:</strong> Revision + previous papers +
                      formula sheets
                    </Typography>
                    <Button
                      component={Link}
                      href="/premium"
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 2,
                        bgcolor: "#f97316",
                        "&:hover": { bgcolor: "#ea580c" },
                      }}
                    >
                      Join 6-Month Batch
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: "100%", border: "2px solid #16a34a" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 2, color: "#16a34a" }}
                    >
                      3-Month Plan (Intensive)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Month 1:</strong> High-weightage Math topics
                      (Calculus, Coordinate Geometry), Basic Drawing
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Month 2:</strong> Aptitude practice, 20+ drawings,
                      10 topic tests
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Month 3:</strong> 15 full mocks, previous 5 years
                      papers, shortcuts
                    </Typography>
                    <Typography variant="body2">
                      <strong>Daily:</strong> 8-10 hours focused study required
                    </Typography>
                    <Button
                      component={Link}
                      href="/premium"
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 2,
                        bgcolor: "#16a34a",
                        "&:hover": { bgcolor: "#15803d" },
                      }}
                    >
                      Join Crash Course
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* CTA Section */}
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 5,
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Master NATA Syllabus with Expert Guidance
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, opacity: 0.95, maxWidth: 700, mx: "auto" }}
            >
              Get chapter-wise video lectures, 500+ practice questions,
              personalized drawing feedback, and 20+ mock tests from IIT/NIT
              faculty. Start your NATA preparation today!
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                component={Link}
                href="/premium"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "#764ba2",
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
              >
                Enroll in NATA Course
              </Button>
              <Button
                component={Link}
                href="/freebooks"
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Download Free Study Material
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
