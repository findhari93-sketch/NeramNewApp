import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";

export const metadata = {
  title: "Contact Us - Neram Classes",
  description:
    "Get in touch with Neram Classes. Contact us for queries about NATA, JEE Paper 2 coaching, admissions, refunds, or any other support.",
};

export default function ContactPage() {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            Contact Us
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We&apos;re here to help! Reach out to us for any queries about our
            courses, admissions, technical support, or feedback.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ "& > *": { mb: 4 } }}>
                {/* Email */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <EmailIcon sx={{ color: "primary.main", fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Email Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>General Inquiries:</strong>
                      <br />
                      <Link
                        href="mailto:info@neramclasses.com"
                        color="primary"
                        underline="hover"
                      >
                        info@neramclasses.com
                      </Link>
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Admissions:</strong>
                      <br />
                      <Link
                        href="mailto:admissions@neramclasses.com"
                        color="primary"
                        underline="hover"
                      >
                        admissions@neramclasses.com
                      </Link>
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Support & Refunds:</strong>
                      <br />
                      <Link
                        href="mailto:support@neramclasses.com"
                        color="primary"
                        underline="hover"
                      >
                        support@neramclasses.com
                      </Link>
                    </Typography>
                  </Box>
                </Box>

                {/* Phone */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <PhoneIcon sx={{ color: "primary.main", fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Call Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <Link
                        href="tel:+919876543210"
                        color="primary"
                        underline="hover"
                      >
                        +91 98765 43210
                      </Link>
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <Link
                        href="tel:+919876543211"
                        color="primary"
                        underline="hover"
                      >
                        +91 98765 43211
                      </Link>
                    </Typography>
                  </Box>
                </Box>

                {/* WhatsApp */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <WhatsAppIcon sx={{ color: "#25D366", fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      WhatsApp
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <Link
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        underline="hover"
                      >
                        +91 98765 43210
                      </Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick responses for course inquiries and support
                    </Typography>
                  </Box>
                </Box>

                {/* Business Hours */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <AccessTimeIcon sx={{ color: "primary.main", fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Business Hours
                    </Typography>
                    <Typography variant="body1">
                      <strong>Monday - Saturday:</strong> 9:00 AM - 8:00 PM IST
                    </Typography>
                    <Typography variant="body1">
                      <strong>Sunday:</strong> 10:00 AM - 5:00 PM IST
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      We typically respond within 24 hours
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Office Address & Additional Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                {/* Address */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4 }}>
                  <LocationOnIcon sx={{ color: "primary.main", fontSize: 28, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Our Office
                    </Typography>
                    <Typography variant="body1">
                      Neram Classes
                      <br />
                      [Your Street Address]
                      <br />
                      [City, State - PIN Code]
                      <br />
                      India
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Quick Links */}
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Links
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  <li>
                    <Typography variant="body1">
                      <Link href="/refund-policy" color="primary" underline="hover">
                        Refund & Cancellation Policy
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <Link href="/privacy" color="primary" underline="hover">
                        Privacy Policy
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <Link href="/terms" color="primary" underline="hover">
                        Terms & Conditions
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <Link href="/careers" color="primary" underline="hover">
                        Careers
                      </Link>
                    </Typography>
                  </li>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Social Media */}
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Follow Us
                </Typography>
                <Typography variant="body1" paragraph>
                  Stay updated with the latest NATA/JEE tips, study materials,
                  and announcements on our social media channels.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Link
                    href="https://www.instagram.com/neramclasses"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                  >
                    Instagram
                  </Link>
                  <Link
                    href="https://www.youtube.com/@neramclasses"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                  >
                    YouTube
                  </Link>
                  <Link
                    href="https://www.facebook.com/neramclasses"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                  >
                    Facebook
                  </Link>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Additional Information */}
          <Box sx={{ "& > *": { mb: 3 } }}>
            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
              >
                How Can We Help?
              </Typography>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: "center", height: "100%" }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                      Course Inquiries
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Questions about NATA, JEE Paper 2 courses, batch timings,
                      or curriculum
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: "center", height: "100%" }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                      Technical Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issues with accessing courses, login problems, or platform
                      navigation
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: "center", height: "100%" }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                      Payment & Refunds
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment issues, refund requests, or billing inquiries
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: "center", height: "100%" }}>
                    <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                      Partnerships
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Collaboration opportunities, franchise inquiries, or
                      business partnerships
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={600}
                sx={{ mt: 4 }}
              >
                Registered Business Information
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Business Name:</strong> Neram Classes
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Type:</strong> Educational Services / Online Coaching
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Website:</strong>{" "}
                <Link
                  href="https://neramclasses.com"
                  color="primary"
                  underline="hover"
                >
                  https://neramclasses.com
                </Link>
              </Typography>
            </section>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              For detailed policies, please visit:{" "}
              <Link href="/privacy" color="primary" underline="hover">
                Privacy Policy
              </Link>
              {" | "}
              <Link href="/terms" color="primary" underline="hover">
                Terms & Conditions
              </Link>
              {" | "}
              <Link href="/refund-policy" color="primary" underline="hover">
                Refund Policy
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} Neram Classes. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Footer Section */}
      <Box sx={{ position: "relative", mt: 8 }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </>
  );
}
