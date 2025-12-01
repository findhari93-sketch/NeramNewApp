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
  <Paper
    elevation={2}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 1,
      background: "linear-gradient(135deg, #00BCF2 0%, #0078D4 100%)",
      color: "#fff",
      borderRadius: 2,
    }}
  >
    <Image
      src="/brand/microsoft-logo.png" // Add Microsoft logo to public/brand/
      alt="Microsoft Certified"
      width={24}
      height={24}
    />
    <Typography variant="body2" fontWeight={600}>
      Microsoft Certified Classroom
    </Typography>
  </Paper>
);

// Features Data
const features = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    title: "IIT & NIT Graduate Faculty",
    description:
      "Learn from practicing architects who graduated from IIT Roorkee, NIT Trichy, SPA Delhi, and Anna University CEG",
  },
  {
    icon: <OndemandVideoIcon sx={{ fontSize: 40 }} />,
    title: "Live + Recorded Classes",
    description:
      "Interactive live sessions on Microsoft Teams + lifetime access to 200+ hours of recorded lectures",
  },
  {
    icon: <QuizIcon sx={{ fontSize: 40 }} />,
    title: "500+ Practice Questions",
    description:
      "Comprehensive question bank with solutions, 15+ full-length mock tests, and previous year paper analysis",
  },
  {
    icon: <LanguageIcon sx={{ fontSize: 40 }} />,
    title: "Multi-Language Support",
    description:
      "Classes available in English, Tamil, Malayalam & Kannada for South Indian students and NRIs",
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
    title: "Flexible Gulf Timings",
    description:
      "Special batches for UAE, Qatar, Oman, Kuwait & Saudi Arabia students with timezone-friendly schedules",
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
    title: "Proven Track Record",
    description:
      "AIR 1 in JEE B.Arch 2024 | NATA 187/200 (Rank 1 - 2020) | 100% success rate | 50+ NIT selections",
  },
];

// Why Choose Neram Data
const whyChoosePoints = [
  "Personalized feedback on every drawing submission from expert architects",
  "Dedicated doubt-clearing sessions 6 days a week via Microsoft Teams",
  "Digital drawing tablet integration for realistic CBT exam practice",
  "Chapter-wise tests + monthly comprehensive assessments",
  "NATA + JEE Paper 2 dual preparation (70% syllabus overlap optimized)",
  "Free access to 10 years NATA previous papers with video solutions",
  "Mock interview prep for NATA counseling and college admissions",
  "Parent-teacher meetings and monthly progress reports",
  "Scholarship programs for economically weaker students (20% fee waiver)",
  "Lifetime alumni support group with 5000+ architecture students network",
];

// Batch Types
const batches = [
  {
    name: "Foundation Batch",
    duration: "12 Months",
    start: "July 2025",
    ideal: "Class 11 students starting early",
    features: [
      "Basics to advanced coverage",
      "Weekly tests",
      "Recorded lectures",
    ],
  },
  {
    name: "Comprehensive Batch",
    duration: "6 Months",
    start: "December 2025",
    ideal: "Class 12 students",
    features: ["Complete syllabus", "15+ mocks", "Live doubt sessions"],
    popular: true,
  },
  {
    name: "Crash Course",
    duration: "3 Months",
    start: "January 2026",
    ideal: "Quick revision & practice",
    features: ["High-weightage topics", "Daily practice", "Fast-track prep"],
  },
];

// Success Stories
const toppers = [
  {
    name: "Aravind Kumar",
    score: "AIR 1 - JEE B.Arch 2024",
    college: "IIT Roorkee (B.Arch)",
    image: "/images/team/student1.jpg", // Placeholder
    testimonial:
      "Neram's personalized approach helped me master drawing techniques. The Microsoft Teams platform made learning seamless.",
  },
  {
    name: "Priya Menon",
    score: "NATA 187/200 (2020)",
    college: "CEPT Ahmedabad",
    image: "/images/team/student2.jpg",
    testimonial:
      "Faculty from IIT gave real-world architecture insights. Mock tests were harder than actual NATA, which boosted my confidence.",
  },
  {
    name: "Mohammed Ashraf (Dubai)",
    score: "NATA 156/200",
    college: "NIT Trichy",
    image: "/images/team/student3.jpg",
    testimonial:
      "As a UAE student, flexible timings and Malayalam-speaking faculty made all the difference. Highly recommend for Gulf students!",
  },
];

const NATACoachingOnlinePage = () => {
  return (
    <>
      <TopNavBar />

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          py: { xs: 6, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <MicrosoftCertifiedBadge />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "3.5rem" },
              fontWeight: 800,
              mt: 3,
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Best NATA Coaching Online in India
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.8rem" },
              fontWeight: 400,
              mb: 4,
              opacity: 0.95,
            }}
          >
            By IIT & NIT Graduate Architects | 100% Live Classes | Proven
            Results
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
              component={Link}
              href="/premium"
              sx={{
                bgcolor: "#fffb01",
                color: "#000",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ffed00" },
              }}
            >
              Enroll Now - NATA 2025
            </Button>

            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/freebooks"
              sx={{
                borderColor: "#fff",
                color: "#fff",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "#fffb01",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Download Free Study Material
            </Button>
          </Box>

          {/* Trust Badges */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              mt: 5,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontSize: "2.5rem", fontWeight: 800 }}
              >
                5000+
              </Typography>
              <Typography variant="body2">Students Trained</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontSize: "2.5rem", fontWeight: 800 }}
              >
                100%
              </Typography>
              <Typography variant="body2">Success Rate</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontSize: "2.5rem", fontWeight: 800 }}
              >
                50+
              </Typography>
              <Typography variant="body2">NIT Selections</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{ fontSize: "2.5rem", fontWeight: 800 }}
              >
                7 Years
              </Typography>
              <Typography variant="body2">Since 2017</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          Why Neram is the Best NATA Online Coaching
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "translateY(-8px)" },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box sx={{ color: "primary.main", mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
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
      </Container>

      {/* Why Choose Neram - Detailed Points */}
      <Box sx={{ bgcolor: "#f5f5f5", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4 }}
          >
            10 Reasons to Choose Neram Classes for NATA Preparation
          </Typography>

          <Grid container spacing={2}>
            {whyChoosePoints.map((point, idx) => (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <CheckCircleIcon color="success" />
                  <Typography variant="body1">{point}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Course Batches */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 6 }}
        >
          NATA 2025 Coaching Batches
        </Typography>

        <Grid container spacing={4}>
          {batches.map((batch, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={batch.popular ? 8 : 3}
                sx={{
                  height: "100%",
                  position: "relative",
                  border: batch.popular ? "3px solid #fffb01" : "none",
                }}
              >
                {batch.popular && (
                  <Chip
                    label="MOST POPULAR"
                    color="primary"
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                      bgcolor: "#fffb01",
                      color: "#000",
                      fontWeight: 700,
                    }}
                  />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom fontWeight={700}>
                    {batch.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Duration: {batch.duration} | Starts: {batch.start}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: "italic", mb: 2 }}
                  >
                    Ideal for: {batch.ideal}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {batch.features.map((feature, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    fullWidth
                    variant={batch.popular ? "contained" : "outlined"}
                    component={Link}
                    href="/premium"
                    sx={{ mt: 2 }}
                  >
                    View Details & Pricing
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Success Stories */}
      <Box sx={{ bgcolor: "#f9f9f9", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 6 }}
          >
            Our NATA Toppers - Real Results
          </Typography>

          <Grid container spacing={4}>
            {toppers.map((topper, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Card elevation={3}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "primary.main",
                      }}
                    >
                      {topper.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {topper.name}
                    </Typography>
                    <Chip
                      label={topper.score}
                      color="success"
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {topper.college}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        mt: 2,
                        color: "text.secondary",
                      }}
                    >
                      &quot;{topper.testimonial}&quot;
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              component={Link}
              href="/alumni"
              size="large"
            >
              View All 500+ Success Stories
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Start Your NATA 2025 Journey Today
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join 5000+ students from India, UAE, Qatar & Gulf countries
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            ✅ Free demo class | ✅ Money-back guarantee | ✅ Flexible payment
            plans
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/premium"
            sx={{
              bgcolor: "#fffb01",
              color: "#000",
              px: 5,
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 700,
              "&:hover": { bgcolor: "#ffed00" },
            }}
          >
            Enroll in NATA Coaching - Limited Seats
          </Button>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default NATACoachingOnlinePage;
