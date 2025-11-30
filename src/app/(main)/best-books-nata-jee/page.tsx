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
  Divider,
  Paper,
  Rating,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

// Get year range at module level for use in book data
const yearRange = getYearRange(2015);

const books = {
  nata: {
    mathematics: [
      {
        title: "NCERT Mathematics Class 11 & 12",
        author: "NCERT",
        rating: 4.8,
        price: "₹350 (Set of 4)",
        why: "Foundation for all entrance exams. Crystal clear concepts, essential for NATA Math.",
        buyLink: "https://ncert.nic.in/textbook.php",
        mustHave: true,
      },
      {
        title: "R.S. Aggarwal - Senior Secondary School Mathematics",
        author: "R.S. Aggarwal",
        rating: 4.6,
        price: "₹895",
        why: "Comprehensive problem bank with step-by-step solutions. Ideal for practice.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "Objective Mathematics by R.D. Sharma",
        author: "R.D. Sharma",
        rating: 4.5,
        price: "₹750",
        why: "Excellent for MCQ practice. Covers all NATA math topics thoroughly.",
        buyLink: "#",
        mustHave: false,
      },
    ],
    aptitude: [
      {
        title: "NATA & B.Arch Entrance Examination Guide",
        author: "Nimish Madan",
        rating: 4.7,
        price: "₹595",
        why: "Most comprehensive guide for NATA. Covers all sections with practice tests.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "Arihant NATA/B.Arch at a Glance",
        author: "Arihant Experts",
        rating: 4.6,
        price: "₹450",
        why: "Quick revision book with previous year papers and mock tests.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "Architecture Entrance Exam - GKP",
        author: "GKP Publications",
        rating: 4.4,
        price: "₹385",
        why: "Good collection of aptitude questions and architectural awareness.",
        buyLink: "#",
        mustHave: false,
      },
    ],
    drawing: [
      {
        title: "NATA Drawing Skills",
        author: "Er. Somsirsa Chatterjee",
        rating: 4.8,
        price: "₹495",
        why: "Best book for learning drawing from scratch. Step-by-step techniques explained.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "Drawing for B.Arch Entrance Exams",
        author: "Ar. Rohit Kumar",
        rating: 4.5,
        price: "₹425",
        why: "Focuses on composition, perspective, and shading techniques for NATA.",
        buyLink: "#",
        mustHave: false,
      },
    ],
    previous: [
      {
        title: `10 Years NATA Solved Papers (${yearRange})`,
        author: "Disha Publications",
        rating: 4.9,
        price: "₹325",
        why: "Essential for understanding exam pattern and difficulty level.",
        buyLink: "#",
        mustHave: true,
      },
    ],
  },
  jee: {
    mathematics: [
      {
        title: "Cengage Mathematics Complete Set",
        author: "G. Tewani",
        rating: 4.8,
        price: "₹2,450 (Set of 5)",
        why: "Most comprehensive for JEE prep. Theory + Problems + Previous years.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "41 Years IIT-JEE Advanced + JEE Main",
        author: "Disha Publications",
        rating: 4.7,
        price: "₹850",
        why: "Complete collection of past papers with detailed solutions.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "Arihant JEE Main Mathematics",
        author: "Amit M. Agarwal",
        rating: 4.6,
        price: "₹695",
        why: "Chapter-wise practice with topic tests. Great for revision.",
        buyLink: "#",
        mustHave: false,
      },
    ],
    aptitude: [
      {
        title: "Nimish Madan B.Arch Entrance Guide",
        author: "Nimish Madan",
        rating: 4.7,
        price: "₹595",
        why: "Covers both NATA and JEE Paper 2 aptitude comprehensively.",
        buyLink: "#",
        mustHave: true,
      },
      {
        title: "Arihant B.Arch & B.Plan Entrance Guide",
        author: "Arihant Experts",
        rating: 4.6,
        price: "₹525",
        why: "Good for aptitude practice with architectural awareness section.",
        buyLink: "#",
        mustHave: true,
      },
    ],
    drawing: [
      {
        title: "B.Arch Drawing Skills for Digital Medium",
        author: "Er. Somsirsa Chatterjee",
        rating: 4.7,
        price: "₹550",
        why: "Specifically covers digital drawing techniques for JEE Paper 2.",
        buyLink: "#",
        mustHave: true,
      },
    ],
  },
};

export default function BestBooksPage() {
  const [selectedExam, setSelectedExam] = React.useState<"nata" | "jee">(
    "nata"
  );
  const currentYear = getCurrentYear();
  const yearRange = getYearRange(2015);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  // Schema markup
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Best Books for NATA & JEE", url: "/best-books-nata-jee" },
    ],
    siteUrl
  );

  const articleSchema = generateArticleSchema(
    {
      headline: `Best Books for NATA & JEE Paper 2 (B.Arch) ${currentYear}`,
      description:
        "Expert-recommended books for NATA and JEE Paper 2 preparation. Complete guide covering Mathematics, Drawing, Aptitude, and General Knowledge resources.",
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
          title: "Best Books for NATA & JEE Paper 2",
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
            Best Books for Architecture Entrance Exams {currentYear}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
            }}
          >
            Expert-Recommended Books for NATA & JEE Paper 2 (B.Arch)
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant={selectedExam === "nata" ? "contained" : "outlined"}
              onClick={() => setSelectedExam("nata")}
              size="large"
            >
              NATA Books
            </Button>
            <Button
              variant={selectedExam === "jee" ? "contained" : "outlined"}
              onClick={() => setSelectedExam("jee")}
              size="large"
            >
              JEE Paper 2 Books
            </Button>
          </Stack>
        </Box>

        {/* Complete Book List Section */}
        <Card sx={{ mb: 4, boxShadow: 3, p: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: "2rem",
              fontWeight: 600,
              mb: 3,
              color: "neramPurple.main",
            }}
          >
            📚 {selectedExam === "nata" ? "NATA" : "JEE Paper 2"} Complete Book
            List
          </Typography>

          {/* Mathematics Books */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "1.5rem",
                fontWeight: 600,
                mb: 3,
                color: "success.main",
              }}
            >
              Mathematics Books
            </Typography>
            <Grid container spacing={3}>
              {books[selectedExam].mathematics.map((book, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Paper
                    elevation={2}
                    sx={{ p: 3, height: "100%", position: "relative" }}
                  >
                    {book.mustHave && (
                      <Chip
                        label="MUST HAVE"
                        color="error"
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10 }}
                      />
                    )}
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      by {book.author}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={2}
                    >
                      <Rating
                        value={book.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2">({book.rating}/5)</Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight={600}
                      mb={1}
                    >
                      {book.price}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Why this book?</strong> {book.why}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      fullWidth
                      component="a"
                      href={book.buyLink}
                      target="_blank"
                    >
                      Buy Now
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Aptitude Books */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "1.5rem",
                fontWeight: 600,
                mb: 3,
                color: "info.main",
              }}
            >
              General Aptitude & Architectural Awareness Books
            </Typography>
            <Grid container spacing={3}>
              {books[selectedExam].aptitude.map((book, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Paper
                    elevation={2}
                    sx={{ p: 3, height: "100%", position: "relative" }}
                  >
                    {book.mustHave && (
                      <Chip
                        label="MUST HAVE"
                        color="error"
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10 }}
                      />
                    )}
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      by {book.author}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={2}
                    >
                      <Rating
                        value={book.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2">({book.rating}/5)</Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight={600}
                      mb={1}
                    >
                      {book.price}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Why this book?</strong> {book.why}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      fullWidth
                      component="a"
                      href={book.buyLink}
                      target="_blank"
                    >
                      Buy Now
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Drawing Books */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "1.5rem",
                fontWeight: 600,
                mb: 3,
                color: "warning.main",
              }}
            >
              Drawing & Sketching Books
            </Typography>
            <Grid container spacing={3}>
              {books[selectedExam].drawing.map((book, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Paper
                    elevation={2}
                    sx={{ p: 3, height: "100%", position: "relative" }}
                  >
                    {book.mustHave && (
                      <Chip
                        label="MUST HAVE"
                        color="error"
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10 }}
                      />
                    )}
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      by {book.author}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={2}
                    >
                      <Rating
                        value={book.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2">({book.rating}/5)</Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight={600}
                      mb={1}
                    >
                      {book.price}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Why this book?</strong> {book.why}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      fullWidth
                      component="a"
                      href={book.buyLink}
                      target="_blank"
                    >
                      Buy Now
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {selectedExam === "nata" && (
            <>
              <Divider sx={{ my: 4 }} />
              {/* Previous Year Papers */}
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    mb: 3,
                    color: "error.main",
                  }}
                >
                  Previous Year Question Papers
                </Typography>
                <Grid container spacing={3}>
                  {books.nata.previous.map((book, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Paper
                        elevation={2}
                        sx={{ p: 3, height: "100%", position: "relative" }}
                      >
                        <Chip
                          label="MUST HAVE"
                          color="error"
                          size="small"
                          sx={{ position: "absolute", top: 10, right: 10 }}
                        />
                        <Typography variant="h6" fontWeight={600} mb={1}>
                          {book.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={1}
                        >
                          by {book.author}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={2}
                        >
                          <Rating
                            value={book.rating}
                            precision={0.1}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2">
                            ({book.rating}/5)
                          </Typography>
                        </Stack>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight={600}
                          mb={1}
                        >
                          {book.price}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Why this book?</strong> {book.why}
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          fullWidth
                          component="a"
                          href={book.buyLink}
                          target="_blank"
                        >
                          Buy Now
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}
        </Card>

        {/* Study Tips */}
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
              📖 How to Use These Books Effectively
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  For Mathematics:
                </Typography>
                <List>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Start with NCERT - build strong fundamentals first
                  </ListItem>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Solve R.S. Aggarwal after completing each chapter
                  </ListItem>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Practice at least 50 problems per topic
                  </ListItem>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Create formula sheets for quick revision
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  For Aptitude & Drawing:
                </Typography>
                <List>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Read one chapter from aptitude book daily
                  </ListItem>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Practice drawing exercises from book daily (1-2 hours)
                  </ListItem>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Maintain a sketchbook for daily practice
                  </ListItem>
                  <ListItem>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    Revise architectural awareness weekly
                  </ListItem>
                </List>
              </Grid>
            </Grid>
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
              🎁 Free Study Materials
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Download free PDFs, previous year papers, and practice sheets!
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
                href="/nata-previous-year-papers"
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
                href="/free-study-materials"
              >
                Free Study Materials
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Enroll CTA */}
        <Card sx={{ textAlign: "center", boxShadow: 3 }}>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Want Expert Guidance with Your Preparation?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join neramClasses for personalized mentorship and structured
              learning
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/applicationform"
              sx={{ px: 4 }}
            >
              Enroll in Our Coaching Program
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
