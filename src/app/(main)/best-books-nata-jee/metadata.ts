import { Metadata } from "next";
import { getCurrentYear } from "@/utils/dateUtils";

const currentYear = getCurrentYear();

export const metadata: Metadata = {
  title: `Best Books for NATA & JEE Paper 2 ${currentYear} | Expert Recommendations`,
  description: `Top recommended books for NATA and JEE Paper 2 preparation ${currentYear}. Complete guide covering Mathematics, Drawing, Aptitude, and GK books with PDF downloads.`,
  keywords: [
    "best book for nata",
    "best book for jee paper 2",
    "nata preparation books",
    "jee barch books",
    "architecture entrance books",
    `nata books ${currentYear}`,
    "drawing books for nata",
    "mathematics books for nata",
    "nata study material pdf",
    "jee paper 2 study material",
  ],
  openGraph: {
    title: `Best Books for NATA & JEE Paper 2 ${currentYear}`,
    description:
      "Expert-recommended books for NATA and JEE Paper 2. Complete list covering Mathematics, Drawing, Aptitude with buy/download links.",
    type: "article",
    images: [
      {
        url: "/images/best-books-nata-jee.jpg",
        width: 1200,
        height: 630,
        alt: `Best Books for NATA and JEE Paper 2 ${currentYear}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Best Books for NATA & JEE Paper 2 ${currentYear}`,
    description:
      "Top recommended books for architecture entrance exams. Mathematics, Drawing, Aptitude resources.",
    images: ["/images/best-books-nata-jee.jpg"],
  },
  alternates: {
    canonical: "https://neramclasses.com/best-books-nata-jee",
  },
};
