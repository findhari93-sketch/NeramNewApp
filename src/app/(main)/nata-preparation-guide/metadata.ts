import { Metadata } from "next";
import { getCurrentYear } from "@/utils/dateUtils";

const currentYear = getCurrentYear();

export const metadata: Metadata = {
  title: `How to Prepare for NATA ${currentYear}? Complete Step-by-Step Guide | neramClasses`,
  description: `Complete NATA preparation guide ${currentYear} with step-by-step strategy to score 150+. Learn mathematics, drawing skills, general aptitude tips. Download free study materials & previous year papers.`,
  keywords: [
    "how to prepare for nata",
    "nata preparation tips",
    "nata preparation strategy",
    "how to crack nata",
    "nata study plan",
    `nata preparation guide ${currentYear}`,
    "step by step nata preparation",
    "how to score 150 in nata",
    "nata exam preparation",
    "best way to prepare for nata",
  ],
  openGraph: {
    title: `How to Prepare for NATA ${currentYear}? Complete Preparation Guide`,
    description:
      "Master NATA with our complete preparation strategy. Step-by-step guide covering Mathematics, Drawing, General Aptitude. Score 150+ with expert tips.",
    type: "article",
    images: [
      {
        url: "/images/nata-preparation-guide.jpg",
        width: 1200,
        height: 630,
        alt: `NATA Preparation Guide ${currentYear}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `How to Prepare for NATA ${currentYear}? Complete Guide`,
    description:
      "Step-by-step NATA preparation strategy to score 150+. Free resources, study materials, and expert tips.",
    images: ["/images/nata-preparation-guide.jpg"],
  },
  alternates: {
    canonical: "https://neramclasses.com/nata-preparation-guide",
  },
};
