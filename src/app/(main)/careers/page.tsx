"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ChatIcon from "@mui/icons-material/Chat";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import GroupsIcon from "@mui/icons-material/Groups";
import TopNavBar from "../../components/shared/TopNavBar";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";
import Script from "next/script";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
} from "@/utils/schemaMarkup";

// Job listings data
const jobOpenings = [
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    department: "Creative",
    type: "Full-time",
    experience: "0-2 years",
    education: "Any degree or No degree required",
    skills: [
      "Adobe Photoshop",
      "Illustrator",
      "Figma",
      "Canva",
      "Creative thinking",
    ],
    responsibilities: [
      "Design engaging graphics for social media, website, and marketing materials",
      "Create educational content visuals for NATA/JEE preparation materials",
      "Develop brand assets and maintain visual consistency",
      "Collaborate with content team for video thumbnails and promotional designs",
    ],
    perks: [
      "Skill development",
      "Creative freedom",
      "Flexible hours",
      "Learning opportunities",
    ],
  },
  {
    id: "video-editor",
    title: "Video Editor",
    department: "Creative",
    type: "Full-time",
    experience: "0-3 years",
    education: "Any degree or No degree required - Skills matter!",
    skills: [
      "Adobe Premiere Pro",
      "After Effects",
      "DaVinci Resolve",
      "Video storytelling",
    ],
    responsibilities: [
      "Edit educational videos for online courses and YouTube content",
      "Create engaging promotional videos and student testimonials",
      "Add animations, graphics, and effects to enhance video quality",
      "Maintain video library and ensure consistent branding",
    ],
    perks: [
      "Latest editing software",
      "Portfolio building",
      "Creative projects",
      "Skill training",
    ],
  },
  {
    id: "content-creator",
    title: "Content Creator / Writer",
    department: "Content",
    type: "Full-time / Part-time",
    experience: "Freshers welcome",
    education: "Any background - Passion for writing required",
    skills: [
      "Writing",
      "SEO basics",
      "Social media",
      "Creative thinking",
      "Research",
    ],
    responsibilities: [
      "Create blog posts, study guides, and educational content",
      "Write social media posts and engaging captions",
      "Research trending topics in architecture entrance exams",
      "Develop content calendars and maintain consistency",
    ],
    perks: [
      "Byline credit",
      "Flexible schedule",
      "Writing portfolio",
      "SEO training",
    ],
  },
  {
    id: "web-developer",
    title: "Web Developer (CS Major)",
    department: "Technology",
    type: "Full-time",
    experience: "0-2 years or Fresh Graduates",
    education: "Computer Science/IT or Self-taught developers",
    skills: ["React", "Next.js", "JavaScript", "TypeScript", "Node.js", "Git"],
    responsibilities: [
      "Develop and maintain website features and functionality",
      "Build interactive tools (calculators, practice tests, etc.)",
      "Optimize website performance and SEO",
      "Collaborate on new tech features and integrations",
    ],
    perks: [
      "Real project experience",
      "Modern tech stack",
      "Mentorship",
      "Remote options",
    ],
  },
  {
    id: "photographer",
    title: "Photographer",
    department: "Creative",
    type: "Full-time / Freelance",
    experience: "Freshers with portfolio welcome",
    education: "No degree required - Show us your work!",
    skills: [
      "Photography",
      "Photo editing",
      "Lighting",
      "Composition",
      "Adobe Lightroom",
    ],
    responsibilities: [
      "Photograph classes, events, and student achievements",
      "Create compelling visuals for marketing campaigns",
      "Document student projects and architectural drawings",
      "Maintain photo library and deliver edited images",
    ],
    perks: [
      "Equipment provided",
      "Portfolio growth",
      "Event coverage",
      "Creative freedom",
    ],
  },
  {
    id: "videographer",
    title: "Videographer",
    department: "Creative",
    type: "Full-time / Freelance",
    experience: "0-2 years",
    education: "No formal education required",
    skills: ["Videography", "Camera operation", "Lighting", "Audio recording"],
    responsibilities: [
      "Film educational content, classes, and student testimonials",
      "Capture events, seminars, and webinars",
      "Operate cameras, lighting, and audio equipment professionally",
      "Work with editing team to deliver final videos",
    ],
    perks: [
      "Professional equipment",
      "Diverse projects",
      "Skill development",
      "Team collaboration",
    ],
  },
  {
    id: "artist-illustrator",
    title: "Artist / Illustrator",
    department: "Creative",
    type: "Full-time / Part-time",
    experience: "Freshers with portfolio",
    education: "Any background - Talent is what counts",
    skills: [
      "Drawing",
      "Sketching",
      "Digital illustration",
      "Creativity",
      "Attention to detail",
    ],
    responsibilities: [
      "Create illustrations for study materials and content",
      "Develop visual explanations for architectural concepts",
      "Design infographics and educational diagrams",
      "Support NATA/JEE drawing content development",
    ],
    perks: [
      "Creative projects",
      "Portfolio development",
      "Flexible work",
      "Skill enhancement",
    ],
  },
  {
    id: "math-tutor",
    title: "Mathematics Faculty",
    department: "Education",
    type: "Full-time / Part-time",
    experience: "0-3 years teaching experience",
    education: "Graduate in Mathematics/Engineering",
    skills: [
      "Mathematics (11th-12th CBSE)",
      "Teaching",
      "Problem solving",
      "Communication",
    ],
    responsibilities: [
      "Teach Mathematics for NATA and JEE Paper 2 students",
      "Prepare study materials and practice questions",
      "Conduct doubt clearing sessions",
      "Track student progress and provide feedback",
    ],
    perks: [
      "Teaching experience",
      "Student interaction",
      "Material development",
      "Growth opportunities",
    ],
  },
  {
    id: "architect",
    title: "Architect",
    department: "Education & Content",
    type: "Full-time / Part-time",
    experience: "0-3 years",
    education: "B.Arch or pursuing final year",
    skills: [
      "Architectural design",
      "AutoCAD",
      "SketchUp",
      "Revit Architecture (Advantage)",
      "Teaching aptitude",
    ],
    responsibilities: [
      "Create architectural content for NATA/JEE B.Arch preparation",
      "Develop drawing tutorials and design exercises",
      "Guide students on architectural concepts and portfolio development",
      "Prepare study materials on design thinking and spatial planning",
    ],
    perks: [
      "Work with architecture students",
      "Content creation experience",
      "Flexible schedule",
      "Professional growth",
    ],
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  const handleApplyClick = (jobId: string) => {
    setSelectedJob(jobId);
    setApplyDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setApplyDialogOpen(false);
    setSelectedJob(null);
  };

  const selectedJobData = jobOpenings.find((job) => job.id === selectedJob);

  // Schema markup
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Careers", url: "/careers" },
    ],
    siteUrl
  );

  const webPageSchema = generateWebPageSchema(
    "Careers at Neram Academy - Jobs in Pudukkottai",
    "Join Neram Academy in Pudukkottai, Tamil Nadu. We are hiring Graphic Designers, Video Editors, Content Creators, Developers, Photographers, and more. No degree required for many roles.",
    `${siteUrl}/careers`
  );

  // Generate JobPosting schema for each position
  const jobSchemas = jobOpenings.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `${job.responsibilities.join(". ")}. Skills: ${job.skills.join(
      ", "
    )}.`,
    identifier: {
      "@type": "PropertyValue",
      name: "Neram Academy",
      value: job.id,
    },
    datePosted: "2025-11-30",
    employmentType: job.type.includes("Full-time") ? "FULL_TIME" : "PART_TIME",
    hiringOrganization: {
      "@type": "EducationalOrganization",
      name: "Neram Academy",
      sameAs: siteUrl,
      logo: `${siteUrl}/images/logos/neram-logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Neram Academy",
        addressLocality: "Pudukkottai",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: 15000,
        maxValue: 40000,
        unitText: "MONTH",
      },
    },
    experienceRequirements: {
      "@type": "OccupationalExperienceRequirements",
      monthsOfExperience: 0,
    },
    educationRequirements: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: job.education,
    },
  }));

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Script
        id="job-postings-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchemas) }}
      />

      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          title: "Careers at Neram Academy",
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
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Join Our Team in Pudukkottai 🚀
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
            }}
          >
            Build Your Career in EdTech • No Degree Required for Many Roles
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ gap: 1, mb: 4 }}
          >
            <Chip
              icon={<LocationOnIcon />}
              label="Pudukkottai, Tamil Nadu"
              color="primary"
              size="medium"
            />
            <Chip icon={<WorkIcon />} label="8+ Open Positions" size="medium" />
            <Chip
              icon={<GroupsIcon />}
              label="Freshers Welcome"
              color="success"
              size="medium"
            />
          </Stack>
        </Box>

        {/* Why Join Section */}
        <Card sx={{ mb: 6, bgcolor: "background.paper" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: "2rem",
                fontWeight: 600,
                mb: 3,
                textAlign: "center",
              }}
            >
              Why Work With Us?
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, textAlign: "center", bgcolor: "#f8f9ff" }}
                >
                  <SchoolIcon
                    sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Learn & Grow
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continuous skill development and training opportunities
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, textAlign: "center", bgcolor: "#fff8f0" }}
                >
                  <StarIcon
                    sx={{ fontSize: 48, color: "warning.main", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    No Barriers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Many roles don&apos;t require formal degrees - skills matter
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, textAlign: "center", bgcolor: "#f0fff4" }}
                >
                  <GroupsIcon
                    sx={{ fontSize: 48, color: "success.main", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Great Team
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Work with passionate educators and creative professionals
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, textAlign: "center", bgcolor: "#fef2f2" }}
                >
                  <WorkIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Real Impact
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Help thousands of students achieve their architecture dreams
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Job Openings */}
        <Typography
          variant="h3"
          sx={{ fontSize: "2rem", fontWeight: 600, mb: 4, textAlign: "center" }}
        >
          Current Openings in Pudukkottai
        </Typography>

        <Stack spacing={3}>
          {jobOpenings.map((job) => (
            <Card key={job.id} sx={{ "&:hover": { boxShadow: 6 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {job.title}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{ gap: 1 }}
                    >
                      <Chip
                        label={job.department}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip label={job.type} size="small" />
                      <Chip
                        label={job.experience}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleApplyClick(job.id)}
                    sx={{ minWidth: 120 }}
                  >
                    Apply Now
                  </Button>
                </Box>

                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>View Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                        >
                          Education Required:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.education}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                        >
                          Key Skills:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          sx={{ gap: 1 }}
                        >
                          {job.skills.map((skill, idx) => (
                            <Chip
                              key={idx}
                              label={skill}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                        >
                          Responsibilities:
                        </Typography>
                        <List dense>
                          {job.responsibilities.map((resp, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircleIcon
                                  fontSize="small"
                                  color="success"
                                />
                              </ListItemIcon>
                              <ListItemText primary={resp} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                        >
                          Perks & Benefits:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          sx={{ gap: 1 }}
                        >
                          {job.perks.map((perk, idx) => (
                            <Chip
                              key={idx}
                              label={perk}
                              size="small"
                              color="success"
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Contact Section */}
        <Card sx={{ mt: 6, bgcolor: "primary.main", color: "white" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              fontWeight={600}
              gutterBottom
              textAlign="center"
            >
              Ready to Join Us?
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Reach out to us through any of these channels. We&apos;re
              available 24/7!
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <WhatsAppIcon
                    sx={{ fontSize: 48, color: "#25D366", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    WhatsApp
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    href="https://wa.me/919176137043?text=Hi%2C%20I%27m%20interested%20in%20career%20opportunities%20at%20Neram%20Academy"
                    target="_blank"
                    startIcon={<WhatsAppIcon />}
                  >
                    Message Us
                  </Button>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <EmailIcon
                    sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Email
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    href="mailto:neramclassroom@gmail.com?subject=Career%20Opportunity%20Inquiry"
                    startIcon={<EmailIcon />}
                  >
                    Send Email
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    neramclassroom@gmail.com
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <ChatIcon
                    sx={{ fontSize: 48, color: "secondary.main", mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Live Chat
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    startIcon={<ChatIcon />}
                  >
                    Start Chat
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Available 24/7
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            fontWeight={600}
            gutterBottom
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Frequently Asked Questions
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                Do I really not need a degree for some roles?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Absolutely! For creative roles like Graphic Designer, Video
                Editor, Photographer, Artist, and Content Creator, we care about
                your skills and portfolio, not your educational certificates.
                Show us what you can do!
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                I&apos;m a complete beginner. Can I still apply?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Yes! We welcome freshers who are eager to learn. We provide
                training and mentorship for the right candidates. If you have
                passion and willingness to learn, we want to hear from you.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                Is this position only in Pudukkottai?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Currently, most positions are based in Pudukkottai, Tamil Nadu.
                However, for some roles like Content Creator or Developer, we
                may offer remote or hybrid work options depending on the role
                and your location.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                What is the salary range?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Salary depends on the role, experience, and skills. For
                freshers, it typically ranges from ₹15,000 to ₹25,000 per month.
                Experienced candidates can expect ₹25,000 to ₹40,000+ based on
                expertise. We also offer performance bonuses and growth
                opportunities.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>How do I apply?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Click &quot;Apply Now&quot; on any job listing, or reach out
                directly via WhatsApp, Email, or Live Chat. Share your
                resume/portfolio and tell us why you&apos;re interested.
                We&apos;ll get back to you within 48 hours!
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Location Info */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Our Office:</strong> Neram Academy, Pudukkottai, Tamil Nadu,
            India • Easily accessible by public transport • Friendly work
            environment
          </Typography>
        </Alert>
      </Container>

      {/* Apply Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Apply for {selectedJobData?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="success">
              We&apos;d love to hear from you! Choose your preferred contact
              method below.
            </Alert>

            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<WhatsAppIcon />}
              href={`https://wa.me/919176137043?text=Hi%2C%20I%27m%20interested%20in%20applying%20for%20${selectedJobData?.title}%20position%20at%20Neram%20Academy`}
              target="_blank"
            >
              Apply via WhatsApp
            </Button>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<EmailIcon />}
              href={`mailto:neramclassroom@gmail.com?subject=Application%20for%20${selectedJobData?.title}&body=Dear%20Hiring%20Team%2C%0A%0AI%20am%20interested%20in%20applying%20for%20the%20${selectedJobData?.title}%20position.%0A%0A[Please%20attach%20your%20resume%20and%20share%20details%20about%20your%20experience]`}
            >
              Apply via Email
            </Button>

            <Divider>OR</Divider>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Use our 24/7 live chat support at the bottom right of this page to
              connect with our HR team instantly!
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 8 }}>
        <HeroWaves bgcolor="#f5f5f5" />
        <Footer />
      </Box>
    </>
  );
}
