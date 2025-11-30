"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link";
import TopNavBar from "../../components/shared/TopNavBar";
import { getCurrentYear, getYearRange } from "@/utils/dateUtils";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";
import Script from "next/script";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/utils/schemaMarkup";

const nataPapers = [
  { year: 2024, test1: true, test2: true, solutions: true, downloadLink: "#" },
  { year: 2023, test1: true, test2: true, solutions: true, downloadLink: "#" },
  { year: 2022, test1: true, test2: false, solutions: true, downloadLink: "#" },
  { year: 2021, test1: true, test2: true, solutions: true, downloadLink: "#" },
  {
    year: 2020,
    test1: true,
    test2: false,
    solutions: false,
    downloadLink: "#",
  },
  { year: 2019, test1: true, test2: true, solutions: true, downloadLink: "#" },
  { year: 2018, test1: true, test2: false, solutions: true, downloadLink: "#" },
  {
    year: 2017,
    test1: true,
    test2: false,
    solutions: false,
    downloadLink: "#",
  },
  { year: 2016, test1: true, test2: false, solutions: true, downloadLink: "#" },
  {
    year: 2015,
    test1: true,
    test2: false,
    solutions: false,
    downloadLink: "#",
  },
];

const jeePapers = [
  { year: 2024, session: "Jan & Apr", solutions: true, downloadLink: "#" },
  { year: 2023, session: "Jan & Apr", solutions: true, downloadLink: "#" },
  { year: 2022, session: "Jun & Jul", solutions: true, downloadLink: "#" },
  { year: 2021, session: "Feb & Mar", solutions: true, downloadLink: "#" },
  { year: 2020, session: "Jan", solutions: false, downloadLink: "#" },
  { year: 2019, session: "Jan & Apr", solutions: true, downloadLink: "#" },
  { year: 2018, session: "Apr", solutions: true, downloadLink: "#" },
  { year: 2017, session: "Apr", solutions: false, downloadLink: "#" },
  { year: 2016, session: "Apr", solutions: true, downloadLink: "#" },
  { year: 2015, session: "Apr", solutions: false, downloadLink: "#" },
];

export default function PreviousYearPapersPage() {
  const [selectedExam, setSelectedExam] = React.useState<"nata" | "jee">(
    "nata"
  );
  const yearRange = getYearRange(2015);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  // Schema markup
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Previous Year Papers", url: "/previous-year-papers" },
    ],
    siteUrl
  );

  const articleSchema = generateArticleSchema(
    {
      headline:
        "NATA & JEE Paper 2 Previous Year Question Papers with Solutions",
      description:
        "Download free NATA and JEE Paper 2 previous year question papers with solutions. Access papers from 2015-2024 with detailed answer keys.",
      datePublished: "2024-01-01T00:00:00Z",
      dateModified: new Date().toISOString(),
      authorName: "Neram Academy",
      publisherName: "Neram Academy",
      publisherLogoUrl: `${siteUrl}/images/logos/neram-logo.png`,
    },
    siteUrl
  );

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

      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          title: "Previous Year Question Papers",
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
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              mb: 2,
              color: "neramPurple.main",
            }}
          >
            NATA & JEE Paper 2 Previous Year Papers
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
            }}
          >
            Download Free PDFs with Solutions ({yearRange})
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: 1, mb: 4 }}
          >
            <Chip
              label="10 Years Papers"
              color="primary"
              icon={<VerifiedIcon />}
            />
            <Chip
              label="With Solutions"
              color="success"
              icon={<VerifiedIcon />}
            />
            <Chip label="Free Download" color="info" icon={<DownloadIcon />} />
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant={selectedExam === "nata" ? "contained" : "outlined"}
              onClick={() => setSelectedExam("nata")}
              size="large"
            >
              NATA Papers
            </Button>
            <Button
              variant={selectedExam === "jee" ? "contained" : "outlined"}
              onClick={() => setSelectedExam("jee")}
              size="large"
            >
              JEE Paper 2
            </Button>
          </Stack>
        </Box>

        {/* Importance Alert */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography fontWeight={600} mb={1}>
            🎯 Why Previous Year Papers are ESSENTIAL:
          </Typography>
          <List dense>
            <ListItem>
              ✅ Understand actual exam pattern and difficulty level
            </ListItem>
            <ListItem>
              ✅ Identify frequently asked topics and question types
            </ListItem>
            <ListItem>
              ✅ Practice time management under exam conditions
            </ListItem>
            <ListItem>
              ✅ Build confidence by solving real exam questions
            </ListItem>
            <ListItem>
              ✅ Predict probable questions for upcoming exams
            </ListItem>
          </List>
        </Alert>

        {/* Papers List */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                fontSize: "2rem",
                fontWeight: 600,
                mb: 3,
                color: "neramPurple.main",
              }}
            >
              📄 {selectedExam === "nata" ? "NATA" : "JEE Main Paper 2"}{" "}
              Previous Year Papers ({yearRange})
            </Typography>

            {selectedExam === "nata" ? (
              <Grid container spacing={3}>
                {nataPapers.map((paper) => (
                  <Grid item xs={12} md={6} key={paper.year}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        "&:hover": { boxShadow: 6 },
                        transition: "all 0.3s",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color="primary"
                        >
                          NATA {paper.year}
                        </Typography>
                        {paper.year >= 2022 && (
                          <Chip label="NEW" color="success" size="small" />
                        )}
                      </Stack>
                      <List dense sx={{ mb: 2 }}>
                        <ListItem>
                          📝 Test 1:{" "}
                          {paper.test1 ? "Available" : "Not Available"}
                          {paper.test1 && (
                            <Chip
                              label="PDF"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </ListItem>
                        {paper.test2 && (
                          <ListItem>
                            📝 Test 2: Available
                            <Chip
                              label="PDF"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          ✅ Solutions:{" "}
                          {paper.solutions ? "Available" : "Coming Soon"}
                          {paper.solutions && (
                            <Chip
                              label="PDF"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </ListItem>
                      </List>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={paper.downloadLink}
                        target="_blank"
                      >
                        Download {paper.year} Papers
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {jeePapers.map((paper) => (
                  <Grid item xs={12} md={6} key={paper.year}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        "&:hover": { boxShadow: 6 },
                        transition: "all 0.3s",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color="primary"
                        >
                          JEE Main {paper.year}
                        </Typography>
                        {paper.year >= 2023 && (
                          <Chip label="NEW" color="success" size="small" />
                        )}
                      </Stack>
                      <List dense sx={{ mb: 2 }}>
                        <ListItem>📅 Sessions: {paper.session}</ListItem>
                        <ListItem>
                          📝 All Shifts Available
                          <Chip
                            label="PDF"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                        <ListItem>
                          ✅ Solutions:{" "}
                          {paper.solutions ? "Available" : "Coming Soon"}
                          {paper.solutions && (
                            <Chip
                              label="PDF"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </ListItem>
                      </List>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={paper.downloadLink}
                        target="_blank"
                      >
                        Download {paper.year} Papers
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Download All Button */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" mb={2}>
                Download Complete Set ({yearRange})
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                sx={{ px: 4 }}
              >
                Download All {selectedExam === "nata" ? "NATA" : "JEE Paper 2"}{" "}
                Papers (Zip File)
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* How to Use Papers */}
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
              📖 How to Effectively Use Previous Year Papers
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Stage 1: Analysis Mode (First 2-3 Papers)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <strong>1. Don't attempt yet</strong> - First just read
                    through the papers
                  </ListItem>
                  <ListItem>
                    <strong>2. Identify patterns</strong> - Note which topics
                    appear frequently
                  </ListItem>
                  <ListItem>
                    <strong>3. Check difficulty</strong> - Understand the level
                    of questions asked
                  </ListItem>
                  <ListItem>
                    <strong>4. Analyze drawing questions</strong> - See what
                    themes and topics are popular
                  </ListItem>
                  <ListItem>
                    <strong>5. Create a priority list</strong> - Focus on
                    high-frequency topics first
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Stage 2: Topic-wise Practice (Next 3-4 Papers)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <strong>1. Solve topic-wise</strong> - Pick one topic (e.g.,
                    Coordinate Geometry) and solve those questions from all
                    papers
                  </ListItem>
                  <ListItem>
                    <strong>2. No time limit yet</strong> - Focus on accuracy
                    and understanding
                  </ListItem>
                  <ListItem>
                    <strong>3. Check solutions</strong> - Understand the
                    approach for each question
                  </ListItem>
                  <ListItem>
                    <strong>4. Make notes</strong> - Write down important
                    formulas and tricks used
                  </ListItem>
                  <ListItem>
                    <strong>5. Practice drawing themes</strong> - Recreate all
                    drawing questions without time pressure
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  Stage 3: Full Mock Tests (Last 3-4 Papers)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <strong>1. Simulate exam conditions</strong> - Set timer for
                    exact exam duration
                  </ListItem>
                  <ListItem>
                    <strong>2. No breaks</strong> - Attempt complete paper in
                    one sitting
                  </ListItem>
                  <ListItem>
                    <strong>3. Follow exam rules</strong> - No looking at notes
                    or solutions
                  </ListItem>
                  <ListItem>
                    <strong>4. Mark honestly</strong> - Calculate your score
                    accurately
                  </ListItem>
                  <ListItem>
                    <strong>5. Detailed analysis</strong> - Identify mistakes,
                    time wasters, and areas for improvement
                  </ListItem>
                </List>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography fontWeight={600}>
                    ⚠️ Save the most recent 2-3 papers for final revision. Take
                    them 1-2 weeks before your actual exam.
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Topic-wise Analysis */}
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
              📊 Topic-wise Question Analysis (Last 5 Years)
            </Typography>
            <Typography paragraph color="text.secondary">
              Based on previous year papers, here's how questions are
              distributed:
            </Typography>

            {selectedExam === "nata" ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: "success.light" }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Mathematics Topics
                    </Typography>
                    <List dense>
                      <ListItem>🔹 Coordinate Geometry: 20-25%</ListItem>
                      <ListItem>🔹 Calculus: 15-20%</ListItem>
                      <ListItem>🔹 Trigonometry: 12-15%</ListItem>
                      <ListItem>🔹 Algebra: 10-12%</ListItem>
                      <ListItem>🔹 3D Geometry: 10-12%</ListItem>
                      <ListItem>🔹 Statistics & Probability: 8-10%</ListItem>
                      <ListItem>🔹 Others: 15-18%</ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: "info.light" }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      General Aptitude Topics
                    </Typography>
                    <List dense>
                      <ListItem>🔹 Visualizing 3D: 25-30%</ListItem>
                      <ListItem>🔹 Architectural Awareness: 20-25%</ListItem>
                      <ListItem>🔹 Objects & Textures: 15-20%</ListItem>
                      <ListItem>🔹 Building Awareness: 15-18%</ListItem>
                      <ListItem>🔹 Logical Reasoning: 10-12%</ListItem>
                      <ListItem>🔹 Others: 10-12%</ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: "warning.light" }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Drawing Test Themes (Most Common)
                    </Typography>
                    <List dense>
                      <ListItem>🎨 Market scenes / Street views (30%)</ListItem>
                      <ListItem>
                        🎨 Building facades / Architecture (25%)
                      </ListItem>
                      <ListItem>🎨 Nature & Landscape (20%)</ListItem>
                      <ListItem>🎨 Geometric compositions (15%)</ListItem>
                      <ListItem>🎨 Abstract themes (10%)</ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, bgcolor: "success.light" }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Mathematics
                    </Typography>
                    <List dense>
                      <ListItem>🔹 Calculus: 22-25%</ListItem>
                      <ListItem>🔹 Coordinate Geometry: 18-20%</ListItem>
                      <ListItem>🔹 Algebra: 15-18%</ListItem>
                      <ListItem>🔹 Trigonometry: 12-15%</ListItem>
                      <ListItem>🔹 Vectors & 3D: 12-15%</ListItem>
                      <ListItem>🔹 Others: 15-18%</ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, bgcolor: "info.light" }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Aptitude Test
                    </Typography>
                    <List dense>
                      <ListItem>🔹 Visualization: 30-35%</ListItem>
                      <ListItem>🔹 Arch. Awareness: 25-30%</ListItem>
                      <ListItem>🔹 Logical Reasoning: 15-20%</ListItem>
                      <ListItem>🔹 Textures & Objects: 15-18%</ListItem>
                      <ListItem>🔹 Others: 10-12%</ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, bgcolor: "warning.light" }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Drawing Themes
                    </Typography>
                    <List dense>
                      <ListItem>🎨 Memory Drawing: 35-40%</ListItem>
                      <ListItem>🎨 Perspective: 30-35%</ListItem>
                      <ListItem>🎨 Composition: 20-25%</ListItem>
                      <ListItem>🎨 Texture & Color: 10-15%</ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Additional Resources */}
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
              🎁 More Free Resources
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Download study materials, mock tests, and formula sheets
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
                startIcon={<DownloadIcon />}
                component={Link}
                href="/free-study-materials"
              >
                Study Materials
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
                href="/mock-test-series"
              >
                Mock Tests
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
                href="/formula-sheets"
              >
                Formula Sheets
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card sx={{ textAlign: "center", boxShadow: 3 }}>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Need Help with Your Preparation?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join neramClasses for expert guidance, personalized study plans,
              and mock tests
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/applicationform"
              sx={{ px: 4 }}
            >
              Enroll Now - Limited Seats
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
