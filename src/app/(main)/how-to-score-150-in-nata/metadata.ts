import { Metadata } from "next";
import { getCurrentYear } from "@/utils/dateUtils";

const currentYear = getCurrentYear();

export const metadata: Metadata = {
  title: `How to Score 150+ in NATA ${currentYear}? Proven Strategies & Tips`,
  description: `Learn how to score 150+ marks in NATA ${currentYear}. Section-wise strategies for Drawing (70+), MCQ (60+), and Aptitude (20+). Expert tips from toppers.`,
  keywords: [
    "how to score 150 in nata",
    "nata scoring strategy",
    `nata ${currentYear} preparation`,
    "nata high score tips",
    "how to get 150+ in nata",
    "nata topper strategy",
    "nata section wise strategy",
    "nata drawing tips",
    "nata time management",
    "nata exam strategy",
  ],
  openGraph: {
    title: `How to Score 150+ in NATA ${currentYear}?`,
    description:
      "Proven strategies to score 150+ in NATA. Section-wise preparation tips, time management, and scoring techniques from toppers.",
    type: "article",
    images: [
      {
        url: "/images/score-150-nata.jpg",
        width: 1200,
        height: 630,
        alt: `How to Score 150+ in NATA ${currentYear}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Score 150+ in NATA ${currentYear} - Complete Strategy`,
    description:
      "Master NATA with proven strategies. Learn section-wise preparation and time management tips.",
    images: ["/images/score-150-nata.jpg"],
  },
  alternates: {
    canonical: "https://neramclasses.com/how-to-score-150-in-nata",
  },
};
