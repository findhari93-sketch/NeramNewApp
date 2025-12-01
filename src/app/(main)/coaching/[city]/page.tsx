import React from "react";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import Link from "next/link";
import {
  getCourseSchema,
  getWebPageSchema,
  getBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/schema";
import { getLocalBusinessSchema } from "@/lib/seoSchemasEnhanced";
import type { Metadata } from "next";

// City data configuration
const cityData: Record<
  string,
  {
    name: string;
    state: string;
    region: string;
    distance?: string;
    famousFor: string;
    examCenters?: string[];
    coordinates?: { latitude: string; longitude: string };
    offlineAddress?: string;
    topColleges?: string[];
  }
> = {
  // Tamil Nadu Cities
  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    region: "Capital of Tamil Nadu",
    famousFor: "IIT Madras, Anna University, and top architecture colleges",
    examCenters: ["Anna University", "SRM Institute", "Sathyabama University"],
    coordinates: { latitude: "13.0827", longitude: "80.2707" },
    offlineAddress: "Neram Classes - Chennai Branch (Contact for details)",
    topColleges: [
      "Anna University CEG",
      "SRM University",
      "Sathyabama Institute",
      "Hindustan University",
    ],
  },
  coimbatore: {
    name: "Coimbatore",
    state: "Tamil Nadu",
    region: "Manchester of South India",
    famousFor: "PSG College of Architecture, Kumaraguru College",
    examCenters: ["PSG College", "Kumaraguru Institute"],
    coordinates: { latitude: "11.0168", longitude: "76.9558" },
    offlineAddress: "Neram Classes - Coimbatore Branch (Contact for details)",
    topColleges: [
      "PSG College of Architecture",
      "Kumaraguru College of Technology",
      "Amrita Vishwa Vidyapeetham",
      "SITRA",
    ],
  },
  madurai: {
    name: "Madurai",
    state: "Tamil Nadu",
    region: "Temple City",
    famousFor: "Thiagarajar College of Engineering",
    examCenters: ["Thiagarajar College of Engineering"],
    coordinates: { latitude: "9.9252", longitude: "78.1198" },
    offlineAddress: "Neram Classes - Madurai Branch (Contact for details)",
    topColleges: [
      "Thiagarajar College of Engineering",
      "Mepco Schlenk Engineering College",
      "Madurai Kamaraj University",
      "Velammal Engineering College",
    ],
  },
  trichy: {
    name: "Trichy",
    state: "Tamil Nadu",
    region: "Rock Fort City",
    famousFor: "NIT Trichy, proximity to top colleges",
    examCenters: ["NIT Trichy", "SASTRA University"],
  },
  tiruppur: {
    name: "Tiruppur",
    state: "Tamil Nadu",
    region: "Knitwear Capital",
    famousFor: "Textile industry hub, growing education sector",
  },
  salem: {
    name: "Salem",
    state: "Tamil Nadu",
    region: "Steel City",
    famousFor: "Periyar University, engineering colleges",
  },
  erode: {
    name: "Erode",
    state: "Tamil Nadu",
    region: "Textile Valley",
    famousFor: "Growing education hub",
  },
  vellore: {
    name: "Vellore",
    state: "Tamil Nadu",
    region: "Education Hub",
    famousFor: "VIT Vellore, top engineering colleges",
    examCenters: ["VIT Vellore"],
  },
  thoothukudi: {
    name: "Thoothukudi",
    state: "Tamil Nadu",
    region: "Pearl City",
    famousFor: "Port city, engineering colleges",
  },
  thanjavur: {
    name: "Thanjavur",
    state: "Tamil Nadu",
    region: "Rice Bowl of Tamil Nadu",
    famousFor: "SASTRA University",
    examCenters: ["SASTRA University"],
  },
  dindigul: {
    name: "Dindigul",
    state: "Tamil Nadu",
    region: "Central Tamil Nadu",
    famousFor: "Growing education sector",
  },
  nagercoil: {
    name: "Nagercoil",
    state: "Tamil Nadu",
    region: "Southernmost tip",
    famousFor: "Engineering colleges, proximity to Kerala",
  },
  kancheepuram: {
    name: "Kancheepuram",
    state: "Tamil Nadu",
    region: "City of Temples",
    famousFor: "SRM University, proximity to Chennai",
    examCenters: ["SRM University"],
  },
  karur: {
    name: "Karur",
    state: "Tamil Nadu",
    region: "Textile Hub",
    famousFor: "Growing education hub",
  },
  tirunelveli: {
    name: "Tirunelveli",
    state: "Tamil Nadu",
    region: "South Tamil Nadu",
    famousFor: "Engineering colleges, medical institutions",
  },
  ariyalur: {
    name: "Ariyalur",
    state: "Tamil Nadu",
    region: "Central Tamil Nadu",
    famousFor: "Industrial hub, growing education sector",
  },
  chengalpattu: {
    name: "Chengalpattu",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Proximity to Chennai, engineering colleges",
  },
  cuddalore: {
    name: "Cuddalore",
    state: "Tamil Nadu",
    region: "Coastal Tamil Nadu",
    famousFor: "Port city, engineering colleges",
  },
  dharmapuri: {
    name: "Dharmapuri",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Agriculture hub, engineering institutions",
  },
  kallakurichi: {
    name: "Kallakurichi",
    state: "Tamil Nadu",
    region: "Eastern Tamil Nadu",
    famousFor: "Emerging education hub",
  },
  krishnagiri: {
    name: "Krishnagiri",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Industrial city, engineering colleges",
  },
  mayiladuthurai: {
    name: "Mayiladuthurai",
    state: "Tamil Nadu",
    region: "Cauvery Delta",
    famousFor: "Temple town, growing education sector",
  },
  nagapattinam: {
    name: "Nagapattinam",
    state: "Tamil Nadu",
    region: "Coastal Tamil Nadu",
    famousFor: "Port town, educational institutions",
  },
  namakkal: {
    name: "Namakkal",
    state: "Tamil Nadu",
    region: "Central Tamil Nadu",
    famousFor: "Transport hub, engineering colleges",
  },
  perambalur: {
    name: "Perambalur",
    state: "Tamil Nadu",
    region: "Central Tamil Nadu",
    famousFor: "Growing education sector",
  },
  pudukkottai: {
    name: "Pudukkottai",
    state: "Tamil Nadu",
    region: "Central Tamil Nadu",
    famousFor: "Heritage town, educational institutions",
  },
  ramanathapuram: {
    name: "Ramanathapuram",
    state: "Tamil Nadu",
    region: "Southern Tamil Nadu",
    famousFor: "Coastal town, engineering colleges",
  },
  ranipet: {
    name: "Ranipet",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Industrial hub, proximity to Vellore",
  },
  sivaganga: {
    name: "Sivaganga",
    state: "Tamil Nadu",
    region: "Southern Tamil Nadu",
    famousFor: "Heritage town, educational institutions",
  },
  tenkasi: {
    name: "Tenkasi",
    state: "Tamil Nadu",
    region: "Southern Tamil Nadu",
    famousFor: "Proximity to Western Ghats, colleges",
  },
  ooty: {
    name: "Ooty",
    state: "Tamil Nadu",
    region: "The Nilgiris",
    famousFor: "Hill station, educational institutions, tourism",
  },
  theni: {
    name: "Theni",
    state: "Tamil Nadu",
    region: "Western Tamil Nadu",
    famousFor: "Agriculture hub, engineering colleges",
  },
  thiruvallur: {
    name: "Thiruvallur",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Proximity to Chennai, growing education sector",
  },
  thiruvarur: {
    name: "Thiruvarur",
    state: "Tamil Nadu",
    region: "Cauvery Delta",
    famousFor: "Temple town, educational institutions",
  },
  tirupathur: {
    name: "Tirupathur",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Industrial area, engineering colleges",
  },
  tiruvannamalai: {
    name: "Tiruvannamalai",
    state: "Tamil Nadu",
    region: "Northern Tamil Nadu",
    famousFor: "Temple city, educational institutions",
  },
  viluppuram: {
    name: "Viluppuram",
    state: "Tamil Nadu",
    region: "Eastern Tamil Nadu",
    famousFor: "Railway junction, engineering colleges",
  },
  virudhunagar: {
    name: "Virudhunagar",
    state: "Tamil Nadu",
    region: "Southern Tamil Nadu",
    famousFor: "Industrial town, educational institutions",
  },

  // Karnataka Cities
  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    region: "Silicon Valley of India",
    famousFor: "BMS College of Architecture, RV College, top institutions",
    examCenters: [
      "BMS College of Architecture",
      "MS Ramaiah",
      "PES University",
    ],
    coordinates: { latitude: "12.9716", longitude: "77.5946" },
    offlineAddress: "Neram Classes - Bangalore Branch (Contact for details)",
    topColleges: [
      "BMS College of Architecture",
      "MS Ramaiah",
      "RV College of Architecture",
      "PES University",
    ],
  },
  mysore: {
    name: "Mysore",
    state: "Karnataka",
    region: "Cultural Capital",
    famousFor: "University of Mysore, heritage architecture",
    examCenters: ["University of Mysore"],
  },
  mangalore: {
    name: "Mangalore",
    state: "Karnataka",
    region: "Coastal City",
    famousFor: "NITK Surathkal, coastal architecture colleges",
    examCenters: ["NITK Surathkal"],
  },
  hubli: {
    name: "Hubli",
    state: "Karnataka",
    region: "North Karnataka Hub",
    famousFor: "BVB College of Engineering",
  },
  belgaum: {
    name: "Belgaum",
    state: "Karnataka",
    region: "Border City",
    famousFor: "KLE Technological University",
  },
  gulbarga: {
    name: "Gulbarga",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Gulbarga University, engineering colleges",
  },
  tumkur: {
    name: "Tumkur",
    state: "Karnataka",
    region: "Education Hub",
    famousFor: "Proximity to Bangalore, engineering colleges",
  },
  davanagere: {
    name: "Davanagere",
    state: "Karnataka",
    region: "Central Karnataka",
    famousFor: "Engineering colleges, education hub",
  },
  bellary: {
    name: "Bellary",
    state: "Karnataka",
    region: "Mining City",
    famousFor: "VTU affiliated colleges",
  },
  shimoga: {
    name: "Shimoga",
    state: "Karnataka",
    region: "Malnad Region",
    famousFor: "Engineering colleges, natural beauty",
  },
  bagalkote: {
    name: "Bagalkote",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Engineering colleges, historical monuments",
  },
  "bengaluru-rural": {
    name: "Bengaluru Rural",
    state: "Karnataka",
    region: "Rural Bengaluru",
    famousFor: "Proximity to Bangalore, educational institutions",
  },
  bidar: {
    name: "Bidar",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Historical city, engineering colleges",
  },
  chamarajanagar: {
    name: "Chamarajanagar",
    state: "Karnataka",
    region: "Southern Karnataka",
    famousFor: "Wildlife, educational institutions",
  },
  chikkaballapura: {
    name: "Chikkaballapura",
    state: "Karnataka",
    region: "Near Bangalore",
    famousFor: "Educational institutions, proximity to tech hub",
  },
  chikkamagaluru: {
    name: "Chikkamagaluru",
    state: "Karnataka",
    region: "Malnad Region",
    famousFor: "Coffee land, engineering colleges",
  },
  chitradurga: {
    name: "Chitradurga",
    state: "Karnataka",
    region: "Central Karnataka",
    famousFor: "Historical fort, educational institutions",
  },
  dharwad: {
    name: "Dharwad",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Karnataka University, engineering colleges",
  },
  gadag: {
    name: "Gadag",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Educational institutions, heritage",
  },
  hassan: {
    name: "Hassan",
    state: "Karnataka",
    region: "South Karnataka",
    famousFor: "Engineering colleges, proximity to tourist spots",
  },
  haveri: {
    name: "Haveri",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Educational institutions",
  },
  kodagu: {
    name: "Kodagu",
    state: "Karnataka",
    region: "Coorg - Hill Station",
    famousFor: "Coffee plantations, tourism, educational institutions",
  },
  kolar: {
    name: "Kolar",
    state: "Karnataka",
    region: "Eastern Karnataka",
    famousFor: "Gold fields, engineering colleges",
  },
  koppal: {
    name: "Koppal",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Educational institutions",
  },
  mandya: {
    name: "Mandya",
    state: "Karnataka",
    region: "Sugar Bowl of Karnataka",
    famousFor: "Engineering colleges, proximity to Mysore",
  },
  raichur: {
    name: "Raichur",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Engineering colleges, historical sites",
  },
  ramanagara: {
    name: "Ramanagara",
    state: "Karnataka",
    region: "Near Bangalore",
    famousFor: "Silk industry, proximity to tech hub",
  },
  udupi: {
    name: "Udupi",
    state: "Karnataka",
    region: "Coastal Karnataka",
    famousFor: "Manipal University, engineering colleges",
    examCenters: ["Manipal Institute of Technology"],
  },
  karwar: {
    name: "Karwar",
    state: "Karnataka",
    region: "Uttara Kannada",
    famousFor: "Coastal city, educational institutions",
  },
  bijapur: {
    name: "Bijapur",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Historical monuments, engineering colleges",
  },
  yadgir: {
    name: "Yadgir",
    state: "Karnataka",
    region: "North Karnataka",
    famousFor: "Educational institutions",
  },
  vijayanagara: {
    name: "Vijayanagara",
    state: "Karnataka",
    region: "Central Karnataka",
    famousFor: "Newest district, educational institutions",
  },

  // UAE & Gulf Countries - International Students
  dubai: {
    name: "Dubai",
    state: "UAE",
    region: "United Arab Emirates",
    famousFor:
      "Home to large Indian community, especially Malayali & Tamil students",
    coordinates: { latitude: "25.2048", longitude: "55.2708" },
    offlineAddress: "Neram Classes - Online Services for UAE Students",
    topColleges: [
      "Heriot-Watt University Dubai",
      "Manipal University Dubai",
      "Amity University Dubai",
      "American University Dubai",
    ],
  },
  "abu-dhabi": {
    name: "Abu Dhabi",
    state: "UAE",
    region: "Capital of UAE",
    famousFor: "Growing Indian expat community, quality education seekers",
    coordinates: { latitude: "24.4539", longitude: "54.3773" },
    offlineAddress: "Neram Classes - Online Services for UAE Students",
    topColleges: [
      "NYU Abu Dhabi",
      "Khalifa University",
      "Paris-Sorbonne University Abu Dhabi",
      "Zayed University",
    ],
  },
  sharjah: {
    name: "Sharjah",
    state: "UAE",
    region: "Cultural Capital of UAE",
    famousFor: "Large Malayali and South Indian population",
    coordinates: { latitude: "25.3463", longitude: "55.4209" },
    offlineAddress: "Neram Classes - Online Services for UAE Students",
    topColleges: [
      "American University of Sharjah",
      "University of Sharjah",
      "Skyline University College",
      "Al Qasimia University",
    ],
  },
  ajman: {
    name: "Ajman",
    state: "UAE",
    region: "Northern Emirates",
    famousFor: "Indian community hub",
  },
  "ras-al-khaimah": {
    name: "Ras Al Khaimah",
    state: "UAE",
    region: "Northern Emirates",
    famousFor: "Growing education sector",
  },
  fujairah: {
    name: "Fujairah",
    state: "UAE",
    region: "East Coast UAE",
    famousFor: "Indian expat families",
  },
  doha: {
    name: "Doha",
    state: "Qatar",
    region: "Capital of Qatar",
    famousFor: "Large Indian diaspora, quality education focus",
  },
  muscat: {
    name: "Muscat",
    state: "Oman",
    region: "Capital of Oman",
    famousFor: "Strong Indian community presence",
  },
  ruwi: {
    name: "Ruwi",
    state: "Oman",
    region: "Commercial Hub of Muscat",
    famousFor: "Indian business community",
  },
  seeb: {
    name: "Seeb",
    state: "Oman",
    region: "Muscat Governorate",
    famousFor: "Indian expat families",
  },
  sohar: {
    name: "Sohar",
    state: "Oman",
    region: "Northern Oman",
    famousFor: "Industrial city, Indian workers",
  },
  salalah: {
    name: "Salalah",
    state: "Oman",
    region: "Southern Oman",
    famousFor: "Tourist destination, Indian community",
  },
  nizwa: {
    name: "Nizwa",
    state: "Oman",
    region: "Interior Oman",
    famousFor: "Historical city",
  },
  ibri: {
    name: "Ibri",
    state: "Oman",
    region: "Al Dhahirah Region",
    famousFor: "Growing expat community",
  },
  sur: {
    name: "Sur",
    state: "Oman",
    region: "Eastern Oman",
    famousFor: "Coastal city",
  },
  "al-wakrah": {
    name: "Al Wakrah",
    state: "Qatar",
    region: "Southern Qatar",
    famousFor: "Growing residential area",
  },
  "al-khor": {
    name: "Al Khor",
    state: "Qatar",
    region: "Northern Qatar",
    famousFor: "Coastal city, expat families",
  },
  lusail: {
    name: "Lusail",
    state: "Qatar",
    region: "Planned City Qatar",
    famousFor: "Modern development, international schools",
  },
  mesaieed: {
    name: "Mesaieed",
    state: "Qatar",
    region: "Industrial City Qatar",
    famousFor: "Industrial hub",
  },
  dukhan: {
    name: "Dukhan",
    state: "Qatar",
    region: "Western Qatar",
    famousFor: "Oil and gas industry",
  },
  "umm-salal": {
    name: "Umm Salal",
    state: "Qatar",
    region: "Central Qatar",
    famousFor: "Residential area",
  },
  riyadh: {
    name: "Riyadh",
    state: "Saudi Arabia",
    region: "Capital of Saudi Arabia",
    famousFor: "Major Indian expat population",
  },
  jeddah: {
    name: "Jeddah",
    state: "Saudi Arabia",
    region: "Western Saudi Arabia",
    famousFor: "Gateway city with diverse Indian community",
  },
  dammam: {
    name: "Dammam",
    state: "Saudi Arabia",
    region: "Eastern Province",
    famousFor: "Oil industry, Indian professionals",
  },
  "al-khobar": {
    name: "Al Khobar",
    state: "Saudi Arabia",
    region: "Eastern Province",
    famousFor: "Business hub, expat community",
  },
  jubail: {
    name: "Jubail",
    state: "Saudi Arabia",
    region: "Eastern Province",
    famousFor: "Industrial city",
  },
  yanbu: {
    name: "Yanbu",
    state: "Saudi Arabia",
    region: "Western Saudi Arabia",
    famousFor: "Industrial port city",
  },
  makkah: {
    name: "Makkah",
    state: "Saudi Arabia",
    region: "Mecca Province",
    famousFor: "Holy city, diverse population",
  },
  madinah: {
    name: "Madinah",
    state: "Saudi Arabia",
    region: "Medina Province",
    famousFor: "Holy city",
  },
  "al-ahsa": {
    name: "Al Ahsa",
    state: "Saudi Arabia",
    region: "Eastern Province",
    famousFor: "Oasis region",
  },
  "kuwait-city": {
    name: "Kuwait City",
    state: "Kuwait",
    region: "Capital of Kuwait",
    famousFor: "Established Indian expat community",
  },
  farwaniya: {
    name: "Farwaniya",
    state: "Kuwait",
    region: "Farwaniya Governorate",
    famousFor: "Large Indian population",
  },
  salmiya: {
    name: "Salmiya",
    state: "Kuwait",
    region: "Hawalli Governorate",
    famousFor: "Commercial area, expat hub",
  },
  hawally: {
    name: "Hawally",
    state: "Kuwait",
    region: "Hawalli Governorate",
    famousFor: "Residential area, Indian community",
  },
  fahaheel: {
    name: "Fahaheel",
    state: "Kuwait",
    region: "Southern Kuwait",
    famousFor: "Industrial area",
  },
  mangaf: {
    name: "Mangaf",
    state: "Kuwait",
    region: "Southern Kuwait",
    famousFor: "Residential area",
  },
  ahmadi: {
    name: "Ahmadi",
    state: "Kuwait",
    region: "Ahmadi Governorate",
    famousFor: "Oil industry hub",
  },
  manama: {
    name: "Manama",
    state: "Bahrain",
    region: "Capital of Bahrain",
    famousFor: "Indian professionals and families",
  },
  muharraq: {
    name: "Muharraq",
    state: "Bahrain",
    region: "Second largest city",
    famousFor: "Historic city, expat community",
  },
  riffa: {
    name: "Riffa",
    state: "Bahrain",
    region: "Southern Governorate",
    famousFor: "Residential area",
  },
  sitra: {
    name: "Sitra",
    state: "Bahrain",
    region: "Industrial area",
    famousFor: "Oil refinery, workers community",
  },
  "isa-town": {
    name: "Isa Town",
    state: "Bahrain",
    region: "Central Bahrain",
    famousFor: "Planned residential city",
  },
};

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = citySlug.toLowerCase();
  const cityInfo = cityData[city];

  if (!cityInfo) {
    return {
      title: "City Not Found",
    };
  }

  return {
    title: `Best NATA & JEE B.Arch Coaching in ${cityInfo.name} | Online Classes | Neram Classes`,
    description: `Top NATA and JEE B.Arch online coaching for students in ${cityInfo.name}, ${cityInfo.state}. Save time with daily 30-60 min classes. Expert faculty, proven results. Join 1000+ successful students.`,
    keywords: [
      `NATA coaching ${cityInfo.name}`,
      `JEE B.Arch coaching ${cityInfo.name}`,
      `architecture coaching ${cityInfo.name}`,
      `online NATA classes ${cityInfo.name}`,
      `best NATA coaching ${cityInfo.name}`,
      `architecture entrance exam ${cityInfo.name}`,
    ],
    openGraph: {
      title: `NATA & JEE B.Arch Coaching in ${cityInfo.name}`,
      description: `Expert online coaching for architecture entrance exams. Perfect for busy school students in ${cityInfo.name}.`,
    },
  };
}

export default async function CityCoachingPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = citySlug.toLowerCase();
  const cityInfo = cityData[city];

  if (!cityInfo) {
    notFound();
  }

  // Check if this is a Gulf country for customized content
  const isGulfCountry = [
    "UAE",
    "Qatar",
    "Oman",
    "Saudi Arabia",
    "Kuwait",
    "Bahrain",
  ].includes(cityInfo.state);

  const pageTitle = `Best NATA & JEE B.Arch Coaching in ${cityInfo.name} | Neram Classes`;
  const pageDescription = `Top NATA and JEE B.Arch online coaching for students in ${cityInfo.name}, ${cityInfo.state}. Save time, study from home, and ace architecture entrance exams with Neram Classes.`;

  // Schema markup for this city page
  const webPageSchema = getWebPageSchema({
    name: pageTitle,
    description: pageDescription,
    url: `/coaching/${city}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Coaching", url: "/coaching" },
      { name: cityInfo.name, url: `/coaching/${city}` },
    ],
  });

  const nataCourseSchema = getCourseSchema({
    name: `NATA Coaching in ${cityInfo.name}`,
    description: `Comprehensive NATA coaching for students in ${cityInfo.name}. Online classes designed for busy school students with flexible timings.`,
    courseMode: "online",
    educationalLevel: "Higher Secondary",
    url: `/coaching/${city}`,
  });

  const jeeCourseSchema = getCourseSchema({
    name: `JEE B.Arch Coaching in ${cityInfo.name}`,
    description: `Expert JEE B.Arch preparation for ${cityInfo.name} students. Daily 30-60 minute online classes that fit your school schedule.`,
    courseMode: "online",
    educationalLevel: "Higher Secondary",
    url: `/coaching/${city}`,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Coaching", url: "/coaching" },
    { name: cityInfo.name, url: `/coaching/${city}` },
  ]);

  // Add LocalBusinessSchema for major cities with coordinates
  const localBusinessSchema = cityInfo.coordinates
    ? getLocalBusinessSchema(cityInfo.name)
    : null;

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(nataCourseSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(jeeCourseSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
      />
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(localBusinessSchema)}
        />
      )}

      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          pt: { xs: 12, sm: 14 },
          pb: 8,
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              mb: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
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
              NATA & JEE B.Arch Coaching in {cityInfo.name}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                mb: 3,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Online Classes Designed for Busy School Students in{" "}
              {cityInfo.region}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundImage:
                      "linear-gradient(45deg, #2b2d4e 30%, #e1148b 90%)",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 999,
                  }}
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/premium" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ px: 4, py: 1.5, fontSize: "1.1rem", borderRadius: 999 }}
                >
                  View Courses
                </Button>
              </Link>
            </Box>
          </Paper>

          {/* Gulf-Specific Content */}
          {isGulfCountry && (
            <Paper
              elevation={2}
              sx={{
                p: { xs: 3, sm: 4 },
                mb: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
                border: "2px solid #e1148b",
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, mb: 3, color: "#2b2d4e" }}
              >
                🌍 Online NATA Coaching for Indian Students in {cityInfo.name},{" "}
                {cityInfo.state}
              </Typography>

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                We specialize in training{" "}
                <strong>Malayali & Tamil students</strong> living in{" "}
                <strong>{cityInfo.name}</strong> and across the Gulf region who
                want to pursue architecture in India&apos;s top colleges. Our
                online classes are designed keeping Gulf time zones in mind,
                with flexible batch timings that work for UAE, Qatar, Oman,
                Saudi Arabia, Kuwait & Bahrain students.
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <AccessTimeIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Gulf-Friendly Timings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Live interactive classes scheduled to match UAE/Gulf
                        time zones. Perfect for students attending international
                        schools in Dubai, Abu Dhabi, Sharjah, Doha, Muscat &
                        other Gulf cities.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <OnlinePredictionIcon
                      color="secondary"
                      sx={{ fontSize: 40 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Taught by IIT/NIT Architects
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Learn from Indian Institute of Technology and National
                        Institute of Technology graduate architects with proven
                        track records of training successful NATA & JEE B.Arch
                        students.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <SchoolIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Affordable Indian Pricing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pay in Indian Rupees at affordable rates - significantly
                        more economical than Gulf-based coaching institutes,
                        while maintaining premium quality education.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <CheckCircleIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Complete Study Material
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Digital study materials, previous year question papers,
                        mock tests, drawing practice sheets, and weekly
                        performance reports - all accessible from anywhere in
                        the world.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  ✨ Perfect for:
                </Typography>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{ lineHeight: 2 }}
                >
                  ✔ Malayalam & Tamil speaking students in Gulf countries
                  <br />
                  ✔ Students planning to return to India for B.Arch admission
                  <br />
                  ✔ Families in Dubai, Sharjah, Abu Dhabi, Doha, Muscat, Riyadh,
                  Jeddah, Kuwait & Bahrain
                  <br />
                  ✔ Students who prefer learning from India-based expert faculty
                  <br />✔ Those seeking consistent daily practice with WhatsApp
                  doubt support
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Why Online Coaching is Best for School Students */}
          <Paper
            elevation={2}
            sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Why Online NATA & JEE B.Arch Coaching is Perfect for{" "}
              {cityInfo.name} Students
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              {isGulfCountry
                ? `We understand that students in ${cityInfo.name} want quality coaching to prepare for architecture entrance exams in India. Our online format eliminates the need for physical coaching centers while providing comprehensive NATA & JEE B.Arch preparation.`
                : `We understand that students in ${cityInfo.name} face a challenging schedule. After attending school from morning till afternoon, then managing homework and assignments, traveling to an offline coaching center becomes exhausting and time-consuming.`}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <AccessTimeIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Save 2-3 Hours Daily
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No travel time means more time for self-study, rest, and
                      other activities. Students can join classes right from
                      home within minutes after school.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <OnlinePredictionIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Consistent Daily Classes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      30-60 minute focused sessions every day. No gaps in
                      learning due to traffic, weather, or health concerns.
                      Consistent practice leads to better results.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Balance School & Coaching
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Perfect for 11th & 12th students who need to maintain
                      their board exam preparation alongside NATA/JEE B.Arch
                      prep. Flexible timing that adapts to your school schedule.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <CheckCircleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      No Syllabus Gaps
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      With regular online classes, there are no breaks or
                      interruptions. Every topic is covered systematically
                      without rushing through the syllabus.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Why Neram Classes is the Best */}
          <Paper
            elevation={2}
            sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Why Neram Classes is the Best Choice for {cityInfo.name} Students
            </Typography>

            <Grid container spacing={2}>
              {[
                {
                  title: "Expert Faculty",
                  desc: "Learn from experienced architects and NATA/JEE B.Arch toppers who understand the exam pattern inside out.",
                },
                {
                  title: "Proven Track Record",
                  desc: "500+ selections in top architecture colleges across India including IITs, NITs, and SPA.",
                },
                {
                  title: "Comprehensive Study Material",
                  desc: "Drawing practice sheets, aptitude questions, previous year papers, and mock tests designed specifically for NATA and JEE B.Arch.",
                },
                {
                  title: "Live Interactive Classes",
                  desc: "Not just recorded videos! Attend live classes where you can ask doubts, get personalized feedback on drawings, and interact with faculty.",
                },
                {
                  title: "Flexible Timings",
                  desc: "Evening batches (6 PM - 8 PM) perfect for school students. Weekend special classes for revision and doubt clearing.",
                },
                {
                  title: "Individual Attention",
                  desc: "Small batch sizes ensure every student gets personalized attention. Regular portfolio reviews and one-on-one mentoring sessions.",
                },
                {
                  title: "Complete NATA & JEE Coverage",
                  desc: "Drawing (2D & 3D), Aesthetic Sensitivity, Logical Reasoning, Mathematics - all sections covered comprehensively.",
                },
                {
                  title: "Regular Mock Tests",
                  desc: "Weekly tests that simulate actual exam conditions. Detailed performance analysis to track your progress.",
                },
              ].map((benefit, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                    }}
                  >
                    <CheckCircleIcon color="success" />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {benefit.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* City-Specific Information */}
          {cityInfo.examCenters && (
            <Paper
              elevation={2}
              sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                NATA & JEE B.Arch Exam Centers in {cityInfo.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Students from {cityInfo.name} typically appear for exams at:
              </Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                {cityInfo.examCenters.map((center, idx) => (
                  <Typography
                    component="li"
                    variant="body1"
                    key={idx}
                    sx={{ mb: 1 }}
                  >
                    {center}
                  </Typography>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                With Neram Classes online coaching, you&apos;ll be fully
                prepared regardless of which exam center you&apos;re assigned
                to!
              </Typography>
            </Paper>
          )}

          {/* About the City */}
          <Paper
            elevation={2}
            sx={{ p: { xs: 3, sm: 4 }, mb: 4, borderRadius: 3 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              About {cityInfo.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cityInfo.name}, located in {cityInfo.state}, is known as the{" "}
              {cityInfo.region}. The city is famous for {cityInfo.famousFor}.
            </Typography>
            <Typography variant="body1">
              Students from {cityInfo.name} have traditionally excelled in
              architecture entrance exams. With Neram Classes online coaching,
              you can continue this legacy while studying conveniently from
              home, saving precious time that would otherwise be spent in
              traffic or commuting to coaching centers.
            </Typography>
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
              Ready to Start Your Architecture Journey?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Join 1000+ students from {cityInfo.name} who are preparing with
              Neram Classes
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
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
                  Start Free Demo Class
                </Button>
              </Link>
              <Link
                href="/nata-cutoff-calculator"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 999,
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Check Cutoff Calculator
                </Button>
              </Link>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

// Generate static params for all cities
export async function generateStaticParams() {
  return Object.keys(cityData).map((city) => ({
    city,
  }));
}
