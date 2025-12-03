import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com";

const cities = [
  // Tamil Nadu - All 38 districts
  "chennai",
  "coimbatore",
  "madurai",
  "trichy",
  "tiruppur",
  "salem",
  "erode",
  "vellore",
  "thoothukudi",
  "thanjavur",
  "dindigul",
  "nagercoil",
  "kancheepuram",
  "karur",
  "tirunelveli",
  "ariyalur",
  "chengalpattu",
  "cuddalore",
  "dharmapuri",
  "kallakurichi",
  "krishnagiri",
  "mayiladuthurai",
  "nagapattinam",
  "namakkal",
  "perambalur",
  "pudukkottai",
  "ramanathapuram",
  "ranipet",
  "sivaganga",
  "tenkasi",
  "ooty",
  "theni",
  "thiruvallur",
  "thiruvarur",
  "tirupathur",
  "tiruvannamalai",
  "viluppuram",
  "virudhunagar",
  // Karnataka - All 31 districts
  "bangalore",
  "mysore",
  "mangalore",
  "hubli",
  "belgaum",
  "gulbarga",
  "tumkur",
  "davanagere",
  "bellary",
  "shimoga",
  "bagalkote",
  "bengaluru-rural",
  "bidar",
  "chamarajanagar",
  "chikkaballapura",
  "chikkamagaluru",
  "chitradurga",
  "dharwad",
  "gadag",
  "hassan",
  "haveri",
  "kodagu",
  "kolar",
  "koppal",
  "mandya",
  "raichur",
  "ramanagara",
  "udupi",
  "karwar",
  "bijapur",
  "yadgir",
  "vijayanagara",
  // UAE & Gulf Countries - International students (42 cities)
  // UAE
  "dubai",
  "abu-dhabi",
  "sharjah",
  "ajman",
  "ras-al-khaimah",
  "fujairah",
  // Qatar
  "doha",
  "al-wakrah",
  "al-khor",
  "lusail",
  "mesaieed",
  "dukhan",
  "umm-salal",
  // Oman
  "muscat",
  "ruwi",
  "seeb",
  "sohar",
  "salalah",
  "nizwa",
  "ibri",
  "sur",
  // Saudi Arabia
  "riyadh",
  "jeddah",
  "dammam",
  "al-khobar",
  "jubail",
  "yanbu",
  "makkah",
  "madinah",
  "al-ahsa",
  // Kuwait
  "kuwait-city",
  "farwaniya",
  "salmiya",
  "hawally",
  "fahaheel",
  "mangaf",
  "ahmadi",
  // Bahrain
  "manama",
  "muharraq",
  "riffa",
  "sitra",
  "isa-town",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/coaching`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/application`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/applicationform`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/askSeniors`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/freebooks`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/nata-cutoff-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/premium`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/careers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/alumni`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/settings`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // SEO Content Pages - High Priority for Organic Search
    {
      url: `${siteUrl}/nata-coaching-online`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0, // Highest priority - main transactional page
    },
    {
      url: `${siteUrl}/jee-paper-2-coaching`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0, // Highest priority - main transactional page
    },
    {
      url: `${siteUrl}/nata-syllabus-subjects`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95, // High priority - informational page
    },
    {
      url: `${siteUrl}/nata-important-questions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9, // High priority - practice resource page
    },
    // Blog Pages
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85, // High priority - content marketing hub
    },
    {
      url: `${siteUrl}/blog/nata-2025-preparation-strategy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8, // Featured blog post
    },
    {
      url: `${siteUrl}/blog/top-10-drawing-techniques-nata`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8, // Featured blog post
    },
    // City-specific blog posts
    {
      url: `${siteUrl}/blog/best-nata-coaching-chennai-online`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85, // High priority for city SEO
    },
    {
      url: `${siteUrl}/blog/best-nata-coaching-coimbatore-online`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85, // High priority for city SEO
    },
    {
      url: `${siteUrl}/blog/best-nata-coaching-madurai-online`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85, // High priority for city SEO
    },
    {
      url: `${siteUrl}/blog/best-nata-coaching-trichy-online`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85, // High priority for city SEO
    },
    {
      url: `${siteUrl}/nata-preparation-guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/jee-paper-2-preparation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/best-books-nata-jee`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/previous-year-papers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/how-to-score-150-in-nata`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // Legal & Policy Pages
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // City-specific coaching pages - high priority for local SEO
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${siteUrl}/coaching/${city}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Exclude private/auth/profile routes from sitemap
  // (They'll be reachable if a user is logged in, but we don't advertise them to crawlers.)

  return [...routes, ...cityPages];
}
