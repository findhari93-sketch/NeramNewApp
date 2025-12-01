import React from "react";
import { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Grid as GridOrig } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const Grid = GridOrig as any;

export const metadata: Metadata = {
  title:
    "NATA & Architecture Exam Blog - Tips, Study Guides & Updates | Neram Classes",
  description:
    "Expert articles on NATA preparation, architecture entrance exams, study strategies, drawing techniques, and career guidance. Stay updated with latest exam patterns and tips.",
  keywords: [
    "nata blog",
    "architecture exam blog",
    "nata preparation tips",
    "drawing techniques for nata",
    "architecture entrance exam guide",
    "nata study strategies",
    "architecture career guidance",
    "nata exam updates",
    "architecture colleges blog",
    "nata success stories",
  ],
  openGraph: {
    title: "NATA & Architecture Exam Blog | Neram Classes",
    description:
      "Expert articles, tips, and guides for NATA and architecture entrance exam preparation.",
    type: "website",
  },
};

// Sample blog posts - will be replaced with dynamic content from CMS/database
const blogPosts = [
  {
    slug: "nata-2025-preparation-strategy",
    title: "NATA 2025: Complete Preparation Strategy for Top Scores",
    excerpt:
      "Discover the ultimate preparation strategy for NATA 2025 with expert tips on mathematics, drawing, and aptitude sections.",
    category: "Preparation",
    date: "2024-11-15",
    readTime: "8 min read",
    image: "/images/blog/nata-preparation.jpg",
    featured: true,
  },
  {
    slug: "top-10-drawing-techniques-nata",
    title: "Top 10 Drawing Techniques Every NATA Aspirant Should Master",
    excerpt:
      "Master these essential drawing techniques to excel in the NATA drawing section and boost your overall score.",
    category: "Drawing",
    date: "2024-11-10",
    readTime: "6 min read",
    image: "/images/blog/drawing-techniques.jpg",
    featured: true,
  },
  {
    slug: "nata-mathematics-chapter-wise-weightage",
    title: "NATA Mathematics: Chapter-wise Weightage Analysis",
    excerpt:
      "Complete breakdown of NATA mathematics section with chapter-wise weightage, important topics, and preparation tips.",
    category: "Mathematics",
    date: "2024-11-05",
    readTime: "10 min read",
    image: "/images/blog/math-weightage.jpg",
    featured: false,
  },
  {
    slug: "architecture-career-opportunities-india",
    title: "Career Opportunities in Architecture: 2025 Guide",
    excerpt:
      "Explore diverse career paths after B.Arch, salary expectations, and growth opportunities in the architecture field.",
    category: "Career",
    date: "2024-10-28",
    readTime: "7 min read",
    image: "/images/blog/career-opportunities.jpg",
    featured: false,
  },
  {
    slug: "nata-vs-jee-paper-2-comparison",
    title: "NATA vs JEE Paper 2: Which Exam Should You Choose?",
    excerpt:
      "Detailed comparison of NATA and JEE Paper 2 to help you make an informed decision about your architecture entrance exam.",
    category: "Guidance",
    date: "2024-10-20",
    readTime: "9 min read",
    image: "/images/blog/nata-vs-jee.jpg",
    featured: false,
  },
  {
    slug: "time-management-nata-exam",
    title: "Time Management Strategies for NATA Exam Day",
    excerpt:
      "Master time management with proven strategies to complete all sections efficiently and maximize your NATA score.",
    category: "Preparation",
    date: "2024-10-12",
    readTime: "5 min read",
    image: "/images/blog/time-management.jpg",
    featured: false,
  },
  // City-Specific Blog Posts
  {
    slug: "best-nata-coaching-chennai-online",
    title: "Best Online NATA Coaching in Chennai 2025 | IIT/NIT Faculty",
    excerpt:
      "Top-rated online NATA coaching classes in Chennai by IIT/NIT architect faculty. Join 500+ Chennai students. Free trial class available.",
    category: "City Guide",
    date: "2024-11-28",
    readTime: "12 min read",
    image: "/images/blog/chennai-coaching.jpg",
    featured: false,
  },
  {
    slug: "best-nata-coaching-coimbatore-online",
    title: "Best Online NATA Coaching in Coimbatore 2025 | Top Rated Classes",
    excerpt:
      "Premium online NATA coaching in Coimbatore by IIT/NIT architects. Join 300+ Coimbatore students. PSG, Kumaraguru college admission guidance. Free trial!",
    category: "City Guide",
    date: "2024-11-27",
    readTime: "11 min read",
    image: "/images/blog/coimbatore-coaching.jpg",
    featured: false,
  },
  {
    slug: "best-nata-coaching-madurai-online",
    title:
      "Best Online NATA Coaching in Madurai 2025 | Top Architecture Classes",
    excerpt:
      "Premier online NATA coaching in Madurai by IIT/NIT architects. Join 250+ Temple City students. TCE, Mepco admission guidance. Free trial class!",
    category: "City Guide",
    date: "2024-11-26",
    readTime: "10 min read",
    image: "/images/blog/madurai-coaching.jpg",
    featured: false,
  },
  {
    slug: "best-nata-coaching-trichy-online",
    title:
      "Best Online NATA Coaching in Trichy 2025 | Top Architecture Classes",
    excerpt:
      "Elite online NATA coaching in Trichy by IIT/NIT architects. Join 200+ Trichy students. NIT, SASTRA admission guidance. Free demo class available!",
    category: "City Guide",
    date: "2024-11-25",
    readTime: "10 min read",
    image: "/images/blog/trichy-coaching.jpg",
    featured: false,
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              mb: 2,
            }}
          >
            Architecture Exam Blog
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.95, maxWidth: "800px" }}>
            Expert insights, preparation strategies, and updates for NATA, JEE
            Paper 2, and architecture entrance exams
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              Featured Articles
            </Typography>
            <Grid container spacing={4}>
              {featuredPosts.map((post) => (
                <Grid item xs={12} md={6} key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 240,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "white", textAlign: "center", px: 2 }}
                        >
                          Featured Post
                        </Typography>
                      </CardMedia>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Chip
                          label={post.category}
                          size="small"
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{ mb: 2, fontWeight: 600 }}
                        >
                          {post.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {post.excerpt}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            color: "text.secondary",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarTodayIcon fontSize="small" />
                            <Typography variant="caption">
                              {new Date(post.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="caption">
                              {post.readTime}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All Posts */}
        <Box>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            Latest Articles
          </Typography>
          <Grid container spacing={3}>
            {regularPosts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 180,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        opacity: 0.8,
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        color="secondary"
                        sx={{ mb: 1.5 }}
                      />
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ mb: 1.5, fontWeight: 600 }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {post.excerpt}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          color: "text.secondary",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CalendarTodayIcon fontSize="small" />
                          <Typography variant="caption">
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="caption">
                            {post.readTime}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Categories Section */}
        <Box sx={{ mt: 8, p: 4, bgcolor: "background.paper", borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Browse by Category
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {[
              "Preparation",
              "Drawing",
              "Mathematics",
              "Career",
              "Guidance",
              "Exam Updates",
              "Success Stories",
            ].map((category) => (
              <Chip
                key={category}
                label={category}
                variant="outlined"
                sx={{
                  fontSize: "1rem",
                  py: 2.5,
                  px: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "primary.main", color: "white" },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
}
