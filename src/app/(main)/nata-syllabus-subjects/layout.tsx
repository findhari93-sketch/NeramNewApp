import { ReactNode } from "react";
import {
  getFAQPageSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
  renderJsonLd,
  type FAQ,
} from "@/lib/seoSchemasEnhanced";
import { metadata } from "./metadata";

// FAQs specific to NATA Syllabus page
const nataSyllabusFAQs: FAQ[] = [
  {
    question: "What is the complete NATA 2025 syllabus?",
    answer:
      "NATA 2025 syllabus has 3 parts: Part A (125 marks) - Mathematics (25Q covering Algebra, Calculus, Coordinate Geometry, Trigonometry, 3D, Statistics) + General Aptitude (25Q covering Sets, Visual Reasoning, Logical Reasoning). Part B (50 marks) - Drawing Test (2 questions testing observation, composition, shading, perspective). Part C (25 marks) - Aesthetic Sensitivity (image-based MCQs on design, texture, color). Download complete PDF from Neram Classes website.",
  },
  {
    question: "Which NATA chapters have the highest weightage?",
    answer:
      "High weightage NATA topics: Mathematics - Calculus (15-18 marks), Coordinate Geometry (12-15 marks), Trigonometry (10-12 marks), Algebra (8-10 marks). Aptitude - Sets & Relations (8-10 marks), Visual Reasoning (8-10 marks), Logical Reasoning (6-8 marks). Drawing - Perspective & Proportion (20 marks), Composition & Detailing (15 marks), Creativity & Aesthetic (15 marks). Focus 60% study time on these topics for 120+ score.",
  },
  {
    question: "Is NCERT enough for NATA Mathematics?",
    answer:
      "Yes, NCERT Class 11-12 Mathematics is sufficient for 70-80% of NATA mathematics questions. Most questions are direct formula-based or single-step applications from NCERT. However, for scoring 60+ in mathematics, supplement NCERT with: (1) R.S. Aggarwal for problem variety, (2) Previous NATA papers for exam pattern, (3) Neram's 500+ practice questions for speed & accuracy. Master NCERT examples, exercises, and miscellaneous problems thoroughly first.",
  },
  {
    question: "How to prepare for NATA Drawing Test?",
    answer:
      "NATA Drawing preparation strategy: (1) Daily practice - Sketch 2-3 objects for 30 minutes. (2) Master basics - Shading (hatching, cross-hatching, stippling), Proportion (human figure 8 heads, object ratios), Perspective (1-point, 2-point, 3-point). (3) Composition - Rule of thirds, focal point, balance. (4) Speed - Complete drawing in 25 minutes. (5) Get expert feedback on every sketch. (6) Practice previous year NATA drawing questions. Neram provides personalized drawing feedback within 24 hours.",
  },
  {
    question: "What is Aesthetic Sensitivity in NATA?",
    answer:
      "Aesthetic Sensitivity (Part C, 25 marks) tests visual understanding through 25 image-based MCQs covering: (1) Texture identification in materials, (2) Color harmony & contrast, (3) Building elements & architectural styles, (4) Design principles (symmetry, balance, rhythm), (5) Form & space relationships, (6) 2D & 3D visualization. No drawing required, only selecting correct MCQ option based on images shown. Prepare by studying architecture books, observing buildings, understanding design vocabulary. 20+ marks easily achievable with basic preparation.",
  },
  {
    question: "Can I cover NATA syllabus in 3 months?",
    answer:
      "Yes, but requires disciplined daily study: Month 1 - Complete Mathematics NCERT (6 chapters), Aptitude basics, Drawing fundamentals (shading, proportion). Month 2 - 300+ Math practice questions, Visual reasoning, 50+ drawing assignments. Month 3 - Revision + 15 full mock tests + weak area improvement. Study 6-8 hours daily. Prioritize high-weightage topics (Calculus, Coordinate Geometry). For working students or those from non-math backgrounds, 6-month preparation is ideal. Neram's 3-month crash course covers 80% syllabus using 80-20 strategy.",
  },
];

export default function NATASyllabusLayout({
  children,
}: {
  children: ReactNode;
}) {
  const faqSchema = getFAQPageSchema(nataSyllabusFAQs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "NATA Syllabus & Subjects", url: "/nata-syllabus-subjects" },
  ]);
  const webPageSchema = getWebPageSchema({
    title: String(metadata.title),
    description: String(metadata.description),
    url: "/nata-syllabus-subjects",
    datePublished: "2024-01-10",
    dateModified: new Date().toISOString().split("T")[0],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(faqSchema)}
        key="faq-schema"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
        key="breadcrumb-schema"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
        key="webpage-schema"
      />
      {children}
    </>
  );
}
