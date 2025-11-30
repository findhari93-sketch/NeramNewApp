import type { Metadata } from "next";

const title = "Neram Academy Alumni (2016-2025) – NATA & JEE B.Arch Toppers";
const description =
  "Explore Neram Academy alumni from 2016–2025: India Rank 1 in JEE B.Arch (2024), NATA 2020 rank 1 (score 187), NIT, CEPT & Anna University selections. Search by year, exam, college and connect on LinkedIn or Instagram.";
const url =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com") + "/alumni";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    siteName: "Neram Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  keywords: [
    "neram alumni",
    "nata toppers",
    "jee b.arch rank 1",
    "architecture entrance results",
    "cept selection",
    "nit architecture selection",
    "anna university architecture",
    "nata 187 score",
    "jee b.arch 2024 topper",
    "architecture coaching results",
    "neram academy students",
  ],
};

export default metadata;
