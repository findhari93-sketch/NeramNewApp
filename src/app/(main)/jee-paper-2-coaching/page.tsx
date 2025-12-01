"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import GridOrig from "@mui/material/Grid";
const Grid: any = GridOrig;
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import QuizIcon from "@mui/icons-material/Quiz";
import LanguageIcon from "@mui/icons-material/Language";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TopNavBar from "@/app/components/shared/TopNavBar";
import Footer from "@/app/components/shared/Footer/footer";
import Link from "next/link";
import Image from "next/image";

// Microsoft Badge Component
const MicrosoftCertifiedBadge = () => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 1,
      background: "linear-gradient(135deg, #0078D4 0%, #00BCF2 100%)",
      borderRadius: 2,
      color: "white",
      fontSize: "0.875rem",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(0,120,212,0.3)",
    }}
  >
    <Image
      src="/brand/microsoft-logo.png"
      alt="Microsoft"
      width={24}
      height={24}
      style={{ filter: "brightness(0) invert(1)" }}
    />
    Microsoft Certified Classroom
  </Box>
);

export default function JEEPaper2CoachingPage() {
  return (
    <>
      <TopNavBar />
      <Box sx={{ bgcolor: "#f9fafb", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              mb: 6,
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <MicrosoftCertifiedBadge />
            </Box>

            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3rem" },
                textAlign: "center",
                mb: 2,
              }}
            >
              Best JEE Paper 2 (B.Arch) Online Coaching 2025
            </Typography>

            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 4,
                opacity: 0.95,
                fontWeight: 400,
                maxWidth: "900px",
                mx: "auto",
              }}
            >
              Crack NIT & IIT Architecture Entrance with Expert Guidance from
              IIT/NIT Graduate Architects • Live Classes • Dual NATA Preparation
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              <Chip
                icon={<EmojiEventsIcon />}
                label="AIR 1 in JEE B.Arch 2024"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<EmojiEventsIcon />}
                label="99.99 Percentile Achievers"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<SchoolIcon />}
                label="50+ NIT Selections"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Box>

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
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
              >
                Enroll Now
              </Button>
              <Button
                component={Link}
                href="/freebooks"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Free Demo Class
              </Button>
            </Box>
          </Paper>

          {/* Key Features Grid */}
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}
          >
            Why Choose Neram for JEE Paper 2 Coaching?
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              {
                icon: <SchoolIcon fontSize="large" color="primary" />,
                title: "IIT & NIT Faculty",
                description:
                  "Learn from architects who cracked JEE themselves. IIT Roorkee, NIT Trichy, SPA Delhi alumni with 10+ years teaching experience.",
              },
              {
                icon: <OndemandVideoIcon fontSize="large" color="primary" />,
                title: "100% Live Interactive Classes",
                description:
                  "Not pre-recorded videos! Real-time doubt clearing, live drawing demonstrations, personalized feedback on Microsoft Teams platform.",
              },
              {
                icon: <QuizIcon fontSize="large" color="primary" />,
                title: "500+ JEE-Level Practice Questions",
                description:
                  "Topic-wise Mathematics questions, Aptitude practice sets, Drawing assignments with detailed solutions and expert feedback within 24 hours.",
              },
              {
                icon: <CheckCircleIcon fontSize="large" color="primary" />,
                title: "20+ Full-Length Mock Tests",
                description:
                  "Exact JEE Paper 2 simulation: CBT for Math/Aptitude + Paper-based Drawing. AI-proctored tests, detailed performance analysis, rank prediction.",
              },
              {
                icon: <LanguageIcon fontSize="large" color="primary" />,
                title: "Dual NATA Preparation",
                description:
                  "60% syllabus overlap means you prepare for both exams simultaneously! Maximize college options - NITs via JEE + 400+ colleges via NATA.",
              },
              {
                icon: <AccessTimeIcon fontSize="large" color="primary" />,
                title: "Flexible Gulf Batches",
                description:
                  "Special batches for UAE, Dubai, Qatar, Oman students. Evening classes (Gulf time), weekend batches, Tamil/Malayalam support available.",
              },
            ].map((feature, index) => (
              <Grid item size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Why JEE Paper 2 Section */}
          <Paper elevation={2} sx={{ p: 4, mb: 6, bgcolor: "#f0f7ff" }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Why Take JEE Paper 2 (B.Arch)?
            </Typography>

            <List>
              {[
                "Mandatory for 31 NIT Architecture Programs (Trichy, Calicut, Bhopal, Hamirpur, Jaipur, Raipur, Patna, etc.)",
                "Only entrance for IIT Roorkee B.Arch (RPAR) - India's top architecture institute",
                "Required for CFTIs (Centrally Funded Technical Institutes) architecture admissions",
                "Easier Mathematics compared to JEE Main Paper 1 - direct NCERT questions (70% weightage)",
                "60% syllabus overlap with NATA - prepare for both with single effort",
                "Conducted twice a year (January & April sessions) - 2 chances to improve score",
                "13 language options including Tamil, Malayalam, Kannada, Hindi for regional students",
                "Lower competition compared to JEE Main Paper 1 - only 1.5 lakh candidates vs 12 lakh",
                "Better career prospects - NIT tag recognized globally for higher studies & placements",
                "Government college fees (₹1-2L/year) vs Private colleges (₹3-8L/year) with similar quality",
              ].map((point, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={point}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Course Batches */}
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}
          >
            Choose Your Batch
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              {
                name: "Foundation Batch (12 Months)",
                duration: "12 Months",
                target: "For Class 11 & Early Starters",
                features: [
                  "250+ hours live classes",
                  "Complete Mathematics NCERT from basics",
                  "Aptitude from scratch - no prerequisites",
                  "Drawing fundamentals: Pencil work, shading, perspective",
                  "NATA + JEE dual preparation",
                  "40+ topic tests + 25 full mocks",
                  "Monthly parent-teacher meetings",
                ],
                price: "₹35,000",
                popular: false,
              },
              {
                name: "Comprehensive Batch (8 Months)",
                duration: "8 Months",
                target: "For Class 12 & Serious Aspirants",
                features: [
                  "180+ hours live intensive classes",
                  "Topic-wise Mathematics mastery (500+ questions)",
                  "Advanced Aptitude: Visual reasoning, sets, logic",
                  "Paper-based drawing practice (100+ assignments)",
                  "Weekly doubt clearing sessions",
                  "20+ JEE simulation mocks",
                  "Rank prediction & college counseling",
                ],
                price: "₹28,000",
                popular: true,
              },
              {
                name: "Crash Course (3 Months)",
                duration: "3 Months",
                target: "For Last-Minute Preparation",
                features: [
                  "100+ hours intensive revision",
                  "High-weightage topics only (80-20 strategy)",
                  "Formula sheets & shortcut techniques",
                  "Speed drawing practice",
                  "15 full-length mocks",
                  "Previous 10 years paper analysis",
                  "Exam day strategies & time management",
                ],
                price: "₹18,000",
                popular: false,
              },
            ].map((batch, index) => (
              <Grid item size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  elevation={batch.popular ? 8 : 2}
                  sx={{
                    height: "100%",
                    position: "relative",
                    border: batch.popular ? "3px solid #667eea" : "none",
                  }}
                >
                  {batch.popular && (
                    <Chip
                      label="MOST POPULAR"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: 16,
                        fontWeight: 700,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      {batch.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      gutterBottom
                      sx={{ mb: 2 }}
                    >
                      {batch.target}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "#667eea", mb: 3 }}
                    >
                      {batch.price}
                    </Typography>

                    <List dense>
                      {batch.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ fontSize: "0.875rem" }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      component={Link}
                      href="/premium"
                      variant={batch.popular ? "contained" : "outlined"}
                      fullWidth
                      sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Success Stories */}
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}
          >
            Our JEE Paper 2 Toppers
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              {
                name: "Aravind Kumar",
                achievement: "AIR 1 in JEE B.Arch 2024",
                college: "IIT Roorkee - B.Arch (RPAR)",
                score: "99.99 Percentile",
                testimonial:
                  "Neram's IIT faculty taught me exam-cracking strategies, not just concepts. The Microsoft Teams platform made learning interactive even from Dubai. The dual NATA+JEE preparation saved 4 months of effort.",
                image: "/images/team/default-avatar.png",
              },
              {
                name: "Priya Menon",
                achievement: "NIT Trichy B.Arch",
                college: "NIT Trichy - Architecture",
                score: "99.87 Percentile (AIR 12)",
                testimonial:
                  "The paper-based drawing practice sessions were game-changers. Faculty reviewed my every sketch with detailed feedback. Mock tests were harder than actual JEE - I felt confident on exam day!",
                image: "/images/team/default-avatar.png",
              },
              {
                name: "Mohammed Ashraf",
                achievement: "NIT Calicut B.Arch",
                college: "NIT Calicut - Architecture",
                score: "99.72 Percentile (AIR 34)",
                testimonial:
                  "Being from Kerala, I needed Malayalam support which Neram provided. The evening batches fit my UAE timezone. 500+ math questions covered every JEE pattern. Highly recommend for Gulf students!",
                image: "/images/team/default-avatar.png",
              },
            ].map((student, index) => (
              <Grid item size={{ xs: 12, md: 4 }} key={index}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={student.image}
                        alt={student.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {student.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        >
                          {student.score}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1, color: "#667eea" }}
                    >
                      {student.college}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      &ldquo;{student.testimonial}&rdquo;
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* JEE vs NATA Comparison */}
          <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
            >
              JEE Paper 2 vs NATA: Why Take Both?
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Aspect
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      JEE Paper 2
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      NATA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Conducting Body",
                      "NTA (National Testing Agency)",
                      "COA (Council of Architecture)",
                    ],
                    [
                      "Frequency",
                      "2 times/year (Jan & Apr)",
                      "2-3 times/year (Apr, Jun, Jul)",
                    ],
                    ["Total Marks", "400 marks", "200 marks"],
                    [
                      "Exam Format",
                      "CBT + Paper Drawing",
                      "CBT + Paper Drawing",
                    ],
                    [
                      "Mathematics",
                      "200 marks (30 questions)",
                      "125 marks (25 questions)",
                    ],
                    [
                      "Drawing",
                      "200 marks (2 paper-based)",
                      "50 marks (2 paper-based)",
                    ],
                    [
                      "Colleges",
                      "31 NITs + IIT Roorkee + CFTIs",
                      "400+ colleges (incl. some NITs)",
                    ],
                    [
                      "Competition",
                      "~1.5 lakh candidates",
                      "~3 lakh candidates",
                    ],
                    [
                      "Difficulty",
                      "Moderate (NCERT-based)",
                      "Easy to Moderate",
                    ],
                  ].map((row, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                          fontWeight: 600,
                        }}
                      >
                        {row[0]}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {row[1]}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {row[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 3,
                fontWeight: 600,
                color: "#667eea",
                textAlign: "center",
              }}
            >
              💡 Pro Tip: Prepare for both exams with Neram&apos;s dual course
              and maximize your college options!
            </Typography>
          </Paper>

          {/* Final CTA */}
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
              Ready to Crack JEE Paper 2 & Secure Your NIT Seat?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, opacity: 0.95, maxWidth: 700, mx: "auto" }}
            >
              Join 5000+ successful students who chose Neram Classes for their
              architecture entrance preparation. Get expert guidance from
              IIT/NIT architects, personalized feedback, and proven results.
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
                  fontSize: "1.1rem",
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
              >
                Enroll Now - Batches Filling Fast
              </Button>
              <Button
                component={Link}
                href="/freebooks"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Book Free Demo Class
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
