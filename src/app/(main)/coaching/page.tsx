import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Link from "next/link";
import {
  getWebPageSchema,
  getBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/schema";
import type { Metadata } from "next";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";

export const metadata: Metadata = {
  title:
    "NATA & JEE B.Arch Coaching Centers - Tamil Nadu & Karnataka | Neram Classes",
  description:
    "Find the best NATA and JEE B.Arch online coaching for your city in Tamil Nadu and Karnataka. Expert architecture entrance exam preparation with flexible online classes.",
  keywords: [
    "NATA coaching Tamil Nadu",
    "JEE B.Arch coaching Karnataka",
    "architecture coaching centers",
    "online architecture coaching India",
  ],
};

const cities = {
  tamilNadu: [
    { slug: "chennai", name: "Chennai", region: "Capital City" },
    {
      slug: "coimbatore",
      name: "Coimbatore",
      region: "Manchester of South India",
    },
    { slug: "madurai", name: "Madurai", region: "Temple City" },
    { slug: "trichy", name: "Trichy", region: "Rock Fort City" },
    { slug: "tiruppur", name: "Tiruppur", region: "Knitwear Capital" },
    { slug: "salem", name: "Salem", region: "Steel City" },
    { slug: "erode", name: "Erode", region: "Textile Valley" },
    { slug: "vellore", name: "Vellore", region: "Education Hub" },
    { slug: "thoothukudi", name: "Thoothukudi", region: "Pearl City" },
    { slug: "thanjavur", name: "Thanjavur", region: "Rice Bowl" },
    { slug: "dindigul", name: "Dindigul", region: "Central TN" },
    { slug: "nagercoil", name: "Nagercoil", region: "Southernmost" },
    { slug: "kancheepuram", name: "Kancheepuram", region: "City of Temples" },
    { slug: "karur", name: "Karur", region: "Textile Hub" },
    { slug: "tirunelveli", name: "Tirunelveli", region: "South TN" },
    { slug: "ariyalur", name: "Ariyalur", region: "Central TN" },
    { slug: "chengalpattu", name: "Chengalpattu", region: "Near Chennai" },
    { slug: "cuddalore", name: "Cuddalore", region: "Port City" },
    { slug: "dharmapuri", name: "Dharmapuri", region: "Northern TN" },
    { slug: "kallakurichi", name: "Kallakurichi", region: "Eastern TN" },
    { slug: "krishnagiri", name: "Krishnagiri", region: "Industrial City" },
    { slug: "mayiladuthurai", name: "Mayiladuthurai", region: "Cauvery Delta" },
    { slug: "nagapattinam", name: "Nagapattinam", region: "Coastal TN" },
    { slug: "namakkal", name: "Namakkal", region: "Transport Hub" },
    { slug: "perambalur", name: "Perambalur", region: "Central TN" },
    { slug: "pudukkottai", name: "Pudukkottai", region: "Heritage Town" },
    { slug: "ramanathapuram", name: "Ramanathapuram", region: "Southern TN" },
    { slug: "ranipet", name: "Ranipet", region: "Industrial Hub" },
    { slug: "sivaganga", name: "Sivaganga", region: "Heritage Town" },
    { slug: "tenkasi", name: "Tenkasi", region: "Western TN" },
    { slug: "ooty", name: "Ooty", region: "The Nilgiris" },
    { slug: "theni", name: "Theni", region: "Western TN" },
    { slug: "thiruvallur", name: "Thiruvallur", region: "Near Chennai" },
    { slug: "thiruvarur", name: "Thiruvarur", region: "Cauvery Delta" },
    { slug: "tirupathur", name: "Tirupathur", region: "Northern TN" },
    { slug: "tiruvannamalai", name: "Tiruvannamalai", region: "Temple City" },
    { slug: "viluppuram", name: "Viluppuram", region: "Railway Junction" },
    { slug: "virudhunagar", name: "Virudhunagar", region: "Industrial Town" },
  ],
  karnataka: [
    { slug: "bangalore", name: "Bangalore", region: "Silicon Valley" },
    { slug: "mysore", name: "Mysore", region: "Cultural Capital" },
    { slug: "mangalore", name: "Mangalore", region: "Coastal City" },
    { slug: "hubli", name: "Hubli", region: "North Karnataka Hub" },
    { slug: "belgaum", name: "Belgaum", region: "Border City" },
    { slug: "gulbarga", name: "Gulbarga", region: "North Karnataka" },
    { slug: "tumkur", name: "Tumkur", region: "Education Hub" },
    { slug: "davanagere", name: "Davanagere", region: "Central Karnataka" },
    { slug: "bellary", name: "Bellary", region: "Mining City" },
    { slug: "shimoga", name: "Shimoga", region: "Malnad Region" },
    { slug: "bagalkote", name: "Bagalkote", region: "North Karnataka" },
    {
      slug: "bengaluru-rural",
      name: "Bengaluru Rural",
      region: "Rural Bengaluru",
    },
    { slug: "bidar", name: "Bidar", region: "North Karnataka" },
    { slug: "chamarajanagar", name: "Chamarajanagar", region: "Southern KA" },
    {
      slug: "chikkaballapura",
      name: "Chikkaballapura",
      region: "Near Bangalore",
    },
    { slug: "chikkamagaluru", name: "Chikkamagaluru", region: "Coffee Land" },
    { slug: "chitradurga", name: "Chitradurga", region: "Central KA" },
    { slug: "dharwad", name: "Dharwad", region: "University City" },
    { slug: "gadag", name: "Gadag", region: "North Karnataka" },
    { slug: "hassan", name: "Hassan", region: "South Karnataka" },
    { slug: "haveri", name: "Haveri", region: "North Karnataka" },
    { slug: "kodagu", name: "Kodagu", region: "Coorg Hills" },
    { slug: "kolar", name: "Kolar", region: "Gold Fields" },
    { slug: "koppal", name: "Koppal", region: "North Karnataka" },
    { slug: "mandya", name: "Mandya", region: "Sugar Bowl" },
    { slug: "raichur", name: "Raichur", region: "North Karnataka" },
    { slug: "ramanagara", name: "Ramanagara", region: "Silk City" },
    { slug: "udupi", name: "Udupi", region: "Manipal City" },
    { slug: "karwar", name: "Karwar", region: "Uttara Kannada" },
    { slug: "bijapur", name: "Bijapur", region: "Historical City" },
    { slug: "yadgir", name: "Yadgir", region: "North Karnataka" },
    { slug: "vijayanagara", name: "Vijayanagara", region: "Newest District" },
  ],
  gulf: [
    // UAE
    { slug: "dubai", name: "Dubai", region: "UAE" },
    { slug: "abu-dhabi", name: "Abu Dhabi", region: "UAE Capital" },
    { slug: "sharjah", name: "Sharjah", region: "UAE" },
    { slug: "ajman", name: "Ajman", region: "UAE" },
    { slug: "ras-al-khaimah", name: "Ras Al Khaimah", region: "UAE" },
    { slug: "fujairah", name: "Fujairah", region: "UAE" },
    // Qatar
    { slug: "doha", name: "Doha", region: "Qatar" },
    { slug: "al-wakrah", name: "Al Wakrah", region: "Qatar" },
    { slug: "al-khor", name: "Al Khor", region: "Qatar" },
    { slug: "lusail", name: "Lusail", region: "Qatar" },
    { slug: "mesaieed", name: "Mesaieed", region: "Qatar" },
    { slug: "dukhan", name: "Dukhan", region: "Qatar" },
    { slug: "umm-salal", name: "Umm Salal", region: "Qatar" },
    // Oman
    { slug: "muscat", name: "Muscat", region: "Oman" },
    { slug: "ruwi", name: "Ruwi", region: "Oman" },
    { slug: "seeb", name: "Seeb", region: "Oman" },
    { slug: "sohar", name: "Sohar", region: "Oman" },
    { slug: "salalah", name: "Salalah", region: "Oman" },
    { slug: "nizwa", name: "Nizwa", region: "Oman" },
    { slug: "ibri", name: "Ibri", region: "Oman" },
    { slug: "sur", name: "Sur", region: "Oman" },
    // Saudi Arabia
    { slug: "riyadh", name: "Riyadh", region: "Saudi Arabia" },
    { slug: "jeddah", name: "Jeddah", region: "Saudi Arabia" },
    { slug: "dammam", name: "Dammam", region: "Saudi Arabia" },
    { slug: "al-khobar", name: "Al Khobar", region: "Saudi Arabia" },
    { slug: "jubail", name: "Jubail", region: "Saudi Arabia" },
    { slug: "yanbu", name: "Yanbu", region: "Saudi Arabia" },
    { slug: "makkah", name: "Makkah", region: "Saudi Arabia" },
    { slug: "madinah", name: "Madinah", region: "Saudi Arabia" },
    { slug: "al-ahsa", name: "Al Ahsa", region: "Saudi Arabia" },
    // Kuwait
    { slug: "kuwait-city", name: "Kuwait City", region: "Kuwait" },
    { slug: "farwaniya", name: "Farwaniya", region: "Kuwait" },
    { slug: "salmiya", name: "Salmiya", region: "Kuwait" },
    { slug: "hawally", name: "Hawally", region: "Kuwait" },
    { slug: "fahaheel", name: "Fahaheel", region: "Kuwait" },
    { slug: "mangaf", name: "Mangaf", region: "Kuwait" },
    { slug: "ahmadi", name: "Ahmadi", region: "Kuwait" },
    // Bahrain
    { slug: "manama", name: "Manama", region: "Bahrain" },
    { slug: "muharraq", name: "Muharraq", region: "Bahrain" },
    { slug: "riffa", name: "Riffa", region: "Bahrain" },
    { slug: "sitra", name: "Sitra", region: "Bahrain" },
    { slug: "isa-town", name: "Isa Town", region: "Bahrain" },
  ],
};

export default function CoachingPage() {
  const webPageSchema = getWebPageSchema({
    name: "NATA & JEE B.Arch Coaching Centers - Tamil Nadu & Karnataka",
    description:
      "Find the best NATA and JEE B.Arch online coaching for your city in Tamil Nadu and Karnataka. Expert architecture entrance exam preparation.",
    url: "/coaching",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Coaching", url: "/coaching" },
    ],
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Coaching", url: "/coaching" },
  ]);

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
      />

      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          pt: { xs: 12, sm: 14 },
          pb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              mb: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
                background: "linear-gradient(45deg, #2b2d4e 30%, #e1148b 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NATA & JEE B.Arch Coaching Centers
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
              Find the best online architecture coaching for your city
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select your city to discover how Neram Classes can help you ace
              NATA & JEE B.Arch with convenient online classes designed for busy
              school students
            </Typography>
          </Paper>

          {/* Tamil Nadu Cities */}
          <Paper
            elevation={2}
            sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Tamil Nadu Cities
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {cities.tamilNadu.map((city) => (
                <Grid item xs={12} sm={6} md={4} key={city.slug}>
                  <Link
                    href={`/coaching/${city.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        p: 2,
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: 2,
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {city.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {city.region}
                        </Typography>
                      </Box>
                    </Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Karnataka Cities */}
          <Paper
            elevation={2}
            sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Karnataka Cities
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {cities.karnataka.map((city) => (
                <Grid item xs={12} sm={6} md={4} key={city.slug}>
                  <Link
                    href={`/coaching/${city.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        p: 2,
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: 2,
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {city.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {city.region}
                        </Typography>
                      </Box>
                    </Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Gulf Countries - UAE, Qatar, Oman, Saudi, Kuwait, Bahrain */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 5%, #fff 5%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                UAE & Gulf Countries
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Online NATA & JEE B.Arch coaching for Indian students in UAE,
              Qatar, Oman, Saudi Arabia, Kuwait & Bahrain. Gulf-friendly timings
              • Live classes by IIT/NIT architects • Perfect for Malayali &
              Tamil students abroad
            </Typography>
            <Grid container spacing={2}>
              {cities.gulf.map((city) => (
                <Grid item xs={12} sm={6} md={4} key={city.slug}>
                  <Link
                    href={`/coaching/${city.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        p: 2,
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: 2,
                        textTransform: "none",
                        borderColor: "secondary.main",
                        "&:hover": {
                          borderColor: "secondary.dark",
                          bgcolor: "secondary.50",
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {city.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {city.region}
                        </Typography>
                      </Box>
                    </Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #2b2d4e 0%, #e1148b 100%)",
              color: "white",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Can't Find Your City?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              We offer online coaching for students across India and
              internationally!
            </Typography>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "#2b2d4e",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: 999,
                  "&:hover": { bgcolor: "#f8f9fa" },
                }}
              >
                Start Your Free Trial
              </Button>
            </Link>
          </Paper>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box sx={{ position: "relative" }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </>
  );
}
