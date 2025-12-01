import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com";

export const metadata: Metadata = {
  title: "Best NATA Coaching Online 2025 | IIT/NIT Faculty | Neram Classes",
  description:
    "Top NATA online coaching by IIT & NIT architects. 100% live classes, Microsoft-certified platform, 500+ practice questions, 100% success rate. For India, UAE, Qatar students. Enroll now!",

  keywords: [
    // Primary keywords
    "nata coaching online",
    "best nata coaching",
    "nata online classes",
    "nata coaching 2025",
    "online nata coaching india",

    // Feature-based keywords
    "live nata coaching",
    "nata coaching by iit faculty",
    "nata coaching by nit architects",
    "microsoft certified nata coaching",

    // Location-based keywords
    "nata coaching online from india",
    "nata online classes for uae students",
    "nata coaching online dubai",
    "nata coaching online qatar",
    "nata coaching online gulf",

    // Long-tail keywords
    "best online coaching for nata exam",
    "nata preparation online classes",
    "architecture entrance coaching online",
    "nata drawing test online coaching",

    // Comparison keywords
    "nata coaching fees online",
    "nata online coaching vs offline",
    "top nata coaching institutes india",
  ],

  authors: [{ name: "Neram Classes" }],
  creator: "Neram Classes",
  publisher: "Neram Classes",

  alternates: {
    canonical: `${siteUrl}/nata-coaching-online`,
  },

  openGraph: {
    title: "Best NATA Coaching Online 2025 - IIT/NIT Faculty | Neram Classes",
    description:
      "Premier NATA online coaching with 100% live classes by IIT/NIT architects. Microsoft-certified platform, 15+ mock tests, personalized feedback. 100% success rate. Enroll now!",
    url: `${siteUrl}/nata-coaching-online`,
    siteName: "Neram Classes",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: `${siteUrl}/images/og/nata-coaching-online.jpg`, // Create this image
        width: 1200,
        height: 630,
        alt: "Neram NATA Online Coaching - Microsoft Certified Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Best NATA Coaching Online 2025 | IIT/NIT Faculty",
    description:
      "Top NATA online coaching by IIT & NIT architects. Live classes, Microsoft platform, 500+ questions, 100% success rate.",
    images: [`${siteUrl}/images/og/nata-coaching-online.jpg`],
    creator: "@neramclasses",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Neram NATA Coaching",
    "msapplication-TileColor": "#667eea",
  },
};
