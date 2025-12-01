"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import GridOrig from "@mui/material/Grid";
const Grid: any = GridOrig;
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TopNavBar from "@/app/components/shared/TopNavBar";
import Footer from "@/app/components/shared/Footer/footer";
import Link from "next/link";

export default function NATAQuestionsPage() {
  const mathTopics = [
    {
      topic: "Calculus",
      questions: 100,
      difficulty: "Medium-High",
      weightage: "6-7 Q",
    },
    {
      topic: "Coordinate Geometry",
      questions: 90,
      difficulty: "Medium",
      weightage: "5-6 Q",
    },
    {
      topic: "Trigonometry",
      questions: 80,
      difficulty: "Easy-Medium",
      weightage: "4-5 Q",
    },
    {
      topic: "Algebra",
      questions: 70,
      difficulty: "Medium",
      weightage: "3-4 Q",
    },
    {
      topic: "3D Geometry",
      questions: 50,
      difficulty: "Medium",
      weightage: "2-3 Q",
    },
    {
      topic: "Statistics & Probability",
      questions: 40,
      difficulty: "Easy",
      weightage: "2-3 Q",
    },
  ];

  const aptitudeTopics = [
    {
      topic: "Visual Reasoning",
      questions: 60,
      difficulty: "Medium",
      weightage: "20-25 marks",
    },
    {
      topic: "Sets & Relations",
      questions: 40,
      difficulty: "Easy-Medium",
      weightage: "8-10 marks",
    },
    {
      topic: "Logical Reasoning",
      questions: 50,
      difficulty: "Medium",
      weightage: "15-18 marks",
    },
    {
      topic: "Proportion & Symmetry",
      questions: 35,
      difficulty: "Medium",
      weightage: "12-15 marks",
    },
  ];

  const yearwisePapers = [
    {
      year: "2024",
      parts: "Part A + B + C",
      questions: "50 MCQ + 2 Drawing",
      difficulty: "Moderate",
    },
    {
      year: "2023",
      parts: "Part A + B + C",
      questions: "50 MCQ + 2 Drawing",
      difficulty: "Moderate-High",
    },
    {
      year: "2022",
      parts: "Part A + B + C",
      questions: "50 MCQ + 2 Drawing",
      difficulty: "Moderate",
    },
    {
      year: "2021",
      parts: "Part A + B",
      questions: "50 MCQ + 2 Drawing",
      difficulty: "Easy-Moderate",
    },
    {
      year: "2020",
      parts: "Part A + B",
      questions: "50 MCQ + 2 Drawing",
      difficulty: "Moderate",
    },
  ];

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
              NATA Important Questions & Previous Year Papers
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 800, mx: "auto" }}
            >
              500+ Practice Questions with Solutions • Topic-wise Classification
              • Previous 10 Years Papers • Free PDF Downloads
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
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
                Download Question Bank PDF
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/premium"
                sx={{
                  borderColor: "#667eea",
                  color: "#667eea",
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "#764ba2",
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                Get Personalized Practice
              </Button>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 6 }}>
            <strong>New for 2025:</strong> All practice questions now include
            video solutions by IIT/NIT faculty, difficulty ratings, and time
            benchmarks!
          </Alert>

          {/* Mathematics Questions */}
          <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Mathematics Topic-wise Questions (430+ Questions)
            </Typography>

            <Grid container spacing={3}>
              {mathTopics.map((item, index) => (
                <Grid item size={{ xs: 12, md: 6 }} key={index}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.topic}
                        </Typography>
                        <Chip
                          label={item.weightage}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip
                          label={`${item.questions} Questions`}
                          size="small"
                        />
                        <Chip
                          label={item.difficulty}
                          size="small"
                          color={
                            item.difficulty.includes("Easy")
                              ? "success"
                              : item.difficulty.includes("High")
                              ? "error"
                              : "warning"
                          }
                        />
                      </Box>
                      <Button
                        component={Link}
                        href="/freebooks"
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<DownloadIcon />}
                      >
                        Download {item.topic} Questions
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, p: 3, bgcolor: "#f0f7ff", borderRadius: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                <CheckCircleIcon
                  fontSize="small"
                  sx={{ mr: 1, verticalAlign: "middle", color: "success.main" }}
                />
                All questions include: Detailed step-by-step solutions, NCERT
                reference, difficulty level, expected time
              </Typography>
            </Box>
          </Paper>

          {/* Aptitude Questions */}
          <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              General Aptitude Questions (185+ Questions)
            </Typography>

            <Grid container spacing={3}>
              {aptitudeTopics.map((item, index) => (
                <Grid item size={{ xs: 12, md: 6 }} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.topic}
                        </Typography>
                        <Chip
                          label={item.weightage}
                          color="secondary"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip
                          label={`${item.questions} Questions`}
                          size="small"
                        />
                        <Chip
                          label={item.difficulty}
                          size="small"
                          color="warning"
                        />
                      </Box>
                      <Button
                        component={Link}
                        href="/freebooks"
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<DownloadIcon />}
                      >
                        Download {item.topic} Questions
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Previous Year Papers */}
          <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              NATA Previous Year Papers (2020-2024)
            </Typography>

            <Grid container spacing={2}>
              {yearwisePapers.map((paper, index) => (
                <Grid item size={{ xs: 12, md: 6 }} key={index}>
                  <Card sx={{ bgcolor: index === 0 ? "#f0f7ff" : "#fafafa" }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 800, color: "#667eea" }}
                        >
                          NATA {paper.year}
                        </Typography>
                        {index === 0 && (
                          <Chip label="Latest" color="error" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        <strong>Parts:</strong> {paper.parts}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Questions:</strong> {paper.questions}
                      </Typography>
                      <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                        <strong>Difficulty:</strong> {paper.difficulty}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          component={Link}
                          href="/freebooks"
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<DownloadIcon />}
                        >
                          Question Paper
                        </Button>
                        <Button
                          component={Link}
                          href="/freebooks"
                          variant="outlined"
                          size="small"
                          fullWidth
                        >
                          Solutions
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Alert severity="success" sx={{ mt: 3 }}>
              <strong>Bonus:</strong> Get access to 2015-2019 papers + detailed
              video solutions when you enroll in any Neram course!
            </Alert>
          </Paper>

          {/* Drawing Practice Assignments */}
          <Paper elevation={2} sx={{ p: 4, mb: 6, bgcolor: "#fff5f0" }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              NATA Drawing Test Practice Assignments (50+ Assignments)
            </Typography>

            <Grid container spacing={3}>
              {[
                {
                  category: "Basic Objects",
                  count: 15,
                  topics: "Cube, Cylinder, Cone, Sphere in perspective",
                },
                {
                  category: "Architectural Elements",
                  count: 12,
                  topics: "Buildings, Facades, Staircases, Windows",
                },
                {
                  category: "Nature & Landscape",
                  count: 10,
                  topics: "Trees, Gardens, Water bodies, Mountains",
                },
                {
                  category: "Human Figures & Activities",
                  count: 8,
                  topics: "Human proportions, Sports, Daily life scenes",
                },
                {
                  category: "Abstract & Themes",
                  count: 5,
                  topics: "Emotions, Seasons, Time, Movement",
                },
              ].map((item, index) => (
                <Grid item size={{ xs: 12, md: 6 }} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      border: "2px solid #f97316",
                      borderRadius: 2,
                      bgcolor: "white",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 1, color: "#f97316" }}
                    >
                      {item.category}
                    </Typography>
                    <Chip
                      label={`${item.count} Assignments`}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {item.topics}
                    </Typography>
                    <Button
                      component={Link}
                      href="/premium"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 2, borderColor: "#f97316", color: "#f97316" }}
                    >
                      Get Expert Feedback
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography
              variant="body2"
              sx={{ mt: 3, fontWeight: 600, textAlign: "center" }}
            >
              📝 Submit your drawings to Neram faculty for personalized feedback
              within 24 hours!
            </Typography>
          </Paper>

          {/* Practice Strategy */}
          <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Smart Practice Strategy for NATA
            </Typography>

            <Grid container spacing={3}>
              {[
                {
                  phase: "Phase 1: Foundation (Weeks 1-4)",
                  tasks: [
                    "Complete NCERT Math examples & exercises",
                    "Practice 100 easy-level questions",
                    "Learn basic drawing techniques (shading, perspective)",
                    "15 basic object drawings",
                  ],
                },
                {
                  phase: "Phase 2: Practice (Weeks 5-12)",
                  tasks: [
                    "Solve 300+ medium-level questions",
                    "Attempt 5 previous year papers",
                    "30+ drawing assignments with feedback",
                    "Take 10 topic-wise tests",
                  ],
                },
                {
                  phase: "Phase 3: Mastery (Weeks 13-20)",
                  tasks: [
                    "100 high-difficulty questions",
                    "15 full-length mock tests",
                    "Speed drawing practice (25 min/drawing)",
                    "Revision of weak topics",
                  ],
                },
                {
                  phase: "Phase 4: Final Prep (Last 2 Weeks)",
                  tasks: [
                    "Solve last 5 years papers in exam mode",
                    "Formula revision & shortcuts",
                    "10 drawing assignments at exam pace",
                    "Exam day strategies & time management",
                  ],
                },
              ].map((item, index) => (
                <Grid item size={{ xs: 12, md: 6 }} key={index}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 2, color: "#667eea" }}
                      >
                        {item.phase}
                      </Typography>
                      {item.tasks.map((task, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <CheckCircleIcon
                            color="success"
                            fontSize="small"
                            sx={{ mt: 0.5 }}
                          />
                          <Typography variant="body2">{task}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* CTA */}
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
              Ready to Start Practicing?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, opacity: 0.95, maxWidth: 700, mx: "auto" }}
            >
              Get access to 500+ questions with video solutions, previous 10
              years papers, personalized drawing feedback, and expert doubt
              clearing from IIT/NIT faculty.
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
                Enroll Now - Get Full Question Bank
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
                Download Free Sample Papers
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
