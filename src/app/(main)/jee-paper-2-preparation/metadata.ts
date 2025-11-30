import { Metadata } from "next";
import { getCurrentYear } from "@/utils/dateUtils";

const currentYear = getCurrentYear();

export const metadata: Metadata = {
  title: `JEE Main Paper 2 (B.Arch) Preparation Guide ${currentYear} | Complete Strategy`,
  description: `Complete JEE Paper 2 B.Arch preparation guide ${currentYear}. Learn Mathematics, Aptitude, and Drawing strategies to score 99+ percentile. Free study materials and previous papers.`,
  keywords: [
    "jee paper 2 preparation",
    "jee barch preparation",
    "jee main paper 2 strategy",
    `jee paper 2 ${currentYear}`,
    "jee barch coaching",
    "how to prepare for jee barch",
    "jee paper 2 syllabus",
    "jee architecture entrance",
    "jee paper 2 books",
    "jee barch study plan",
  ],
  openGraph: {
    title: `JEE Main Paper 2 (B.Arch) Preparation Guide ${currentYear}`,
    description:
      "Master JEE Paper 2 with complete preparation strategy. Mathematics, Aptitude, Drawing guide to score 99+ percentile. Expert tips and resources.",
    type: "article",
    images: [
      {
        url: "/images/jee-paper-2-preparation.jpg",
        width: 1200,
        height: 630,
        alt: `JEE Paper 2 Preparation Guide ${currentYear}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `JEE Paper 2 B.Arch Preparation Guide ${currentYear}`,
    description:
      "Complete JEE Main Paper 2 preparation strategy. Mathematics, Aptitude, Drawing tips to achieve 99+ percentile.",
    images: ["/images/jee-paper-2-preparation.jpg"],
  },
  alternates: {
    canonical: "https://neramclasses.com/jee-paper-2-preparation",
  },
};
