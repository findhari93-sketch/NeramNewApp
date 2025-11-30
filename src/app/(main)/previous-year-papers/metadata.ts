import { Metadata } from "next";
import { getYearRange } from "@/utils/dateUtils";

const yearRange = getYearRange(2015);

export const metadata: Metadata = {
  title: `NATA & JEE Paper 2 Previous Year Papers PDF Download (${yearRange})`,
  description: `Download free NATA and JEE Paper 2 previous year question papers with solutions. Access papers from ${yearRange} with detailed answer keys and analysis.`,
  keywords: [
    "nata previous year questions pdf download",
    "jee paper 2 previous papers",
    "nata question papers with solutions",
    "jee barch previous year papers",
    "nata old papers download",
    "jee paper 2 solved papers",
    "nata test papers pdf",
    "architecture entrance previous papers",
    "nata sample papers",
    "jee paper 2 mock test",
  ],
  openGraph: {
    title: `NATA & JEE Paper 2 Previous Year Papers (${yearRange})`,
    description:
      "Free download NATA and JEE Paper 2 previous year question papers with solutions. Complete collection from 2015 to 2024.",
    type: "article",
    images: [
      {
        url: "/images/previous-year-papers.jpg",
        width: 1200,
        height: 630,
        alt: `NATA and JEE Paper 2 Previous Year Papers ${yearRange}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `NATA & JEE Paper 2 Previous Papers (${yearRange})`,
    description:
      "Download free previous year question papers with solutions. Complete collection with answer keys.",
    images: ["/images/previous-year-papers.jpg"],
  },
  alternates: {
    canonical: "https://neramclasses.com/previous-year-papers",
  },
};
