import { ReactNode } from "react";
import {
  getFAQPageSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
  renderJsonLd,
  type FAQ,
} from "@/lib/seoSchemasEnhanced";
import { metadata } from "./metadata";

const questionsFAQs: FAQ[] = [
  {
    question: "Where can I find NATA previous year question papers?",
    answer:
      "Neram Classes provides free NATA previous year question papers from 2010-2024 with detailed solutions. Download PDFs from our website or access them in your student dashboard. We also offer video solutions for complex questions, topic-wise classification, and difficulty-level marking for targeted practice.",
  },
  {
    question: "How many questions should I practice for NATA?",
    answer:
      "For scoring 120+ in NATA, practice minimum 500 questions: Mathematics (300+ questions covering all chapters), Aptitude (150+ questions for visual reasoning, sets, logic), Drawing (50+ assignments with feedback). Neram provides 500+ curated questions with solutions, difficulty levels, and time benchmarks. Practice 20-30 questions daily for 3-6 months.",
  },
  {
    question: "Are NATA questions repeated from previous years?",
    answer:
      "While exact questions are not repeated, NATA follows similar patterns and difficulty levels. 40-50% of questions test the same concepts with different numbers or scenarios. Practicing previous papers helps you understand question patterns, time management, and frequently tested topics. Focus on concepts rather than memorizing answers.",
  },
  {
    question: "What are the most important topics in NATA Mathematics?",
    answer:
      "High-weightage NATA Mathematics topics: (1) Calculus - 6-7 questions (Differentiation, Integration, Applications). (2) Coordinate Geometry - 5-6 questions (Circles, Parabola, Straight Lines). (3) Trigonometry - 4-5 questions (Identities, Heights & Distances). (4) Algebra - 3-4 questions (Quadratic Equations, Logarithms, Sequences). Practice 100+ questions in each high-weightage topic.",
  },
  {
    question: "How to practice NATA Drawing questions at home?",
    answer:
      "NATA Drawing practice strategy: (1) Start with basic objects (cube, cylinder, cone). (2) Progress to complex scenes (buildings, landscapes, human figures). (3) Practice 2-point perspective daily. (4) Time yourself: 25 minutes per drawing. (5) Use HB, 2B, 4B pencils for shading. (6) Submit scanned drawings to Neram for expert feedback within 24 hours. Practice 3-5 drawings weekly for 3 months minimum.",
  },
];

export default function NATAQuestionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const faqSchema = getFAQPageSchema(questionsFAQs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "NATA Important Questions", url: "/nata-important-questions" },
  ]);
  const webPageSchema = getWebPageSchema({
    title: String(metadata.title),
    description: String(metadata.description),
    url: "/nata-important-questions",
    datePublished: "2024-01-15",
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
