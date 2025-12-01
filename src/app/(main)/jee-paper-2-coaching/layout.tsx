import { ReactNode } from "react";
import {
  getCourseSchema,
  getFAQPageSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
  renderJsonLd,
  type FAQ,
  type Course,
} from "@/lib/seoSchemasEnhanced";
import { metadata } from "./metadata";

// FAQs specific to JEE Paper 2 Coaching page
const jeeCoachingFAQs: FAQ[] = [
  {
    question: "What is JEE Paper 2 (B.Arch)?",
    answer:
      "JEE Paper 2 is the National Testing Agency (NTA) conducted exam for admission to B.Arch programs in NITs, IITs (RPAR), CFTIs, and other government colleges. It has 3 sections: Mathematics (200 marks), Aptitude (200 marks), and Drawing (200 marks - paper-based). Total 400 marks. Conducted twice a year (January & April sessions). Required for IIT Roorkee B.Arch and all 31 NIT architecture programs.",
  },
  {
    question: "What makes Neram the best JEE Paper 2 coaching?",
    answer:
      "Neram Classes is taught by IIT & NIT graduate architects who have cracked these exams themselves. We provide 100% live interactive classes on Microsoft-certified platform, personalized drawing feedback for paper-based sketching, 500+ JEE-level mathematics questions, 15+ full mock tests, dual NATA preparation (60% syllabus overlap), flexible Gulf batches, and proven results - All India Rank 1 in JEE B.Arch 2024 and 99.99 percentile in JEE Paper 2.",
  },
  {
    question: "What is the difference between JEE Paper 2 and NATA?",
    answer:
      "JEE Paper 2 is conducted by NTA twice/year (Jan & Apr), has 400 marks total, includes 200 marks Mathematics (30Q) + 200 marks Aptitude (50Q) + 200 marks Drawing (2 questions on paper). NATA is conducted by COA 2-3 times/year, has 200 marks, includes MCQ-based test + 2 drawing questions + aesthetic sensitivity. JEE Paper 2 is mandatory for NITs/IITs; NATA is accepted by 400+ colleges. Both have 60% syllabus overlap. Neram offers optimized dual preparation.",
  },
  {
    question: "Can I prepare for both JEE Paper 2 and NATA together?",
    answer:
      "Yes, you should! 60-70% of syllabus overlaps (Mathematics & Aptitude topics are same). Neram's dual preparation course covers: Common study material for Mathematics (Algebra, Trigonometry, Coordinate Geometry, Calculus, 3D), shared Aptitude topics (sets, relations, visual reasoning), separate drawing practice for JEE format (paper-based) vs NATA format (computer-based). This strategy maximizes college options since JEE opens NITs/IITs while NATA opens 400+ colleges including private universities.",
  },
  {
    question: "What is JEE Paper 2 exam pattern 2025?",
    answer:
      "JEE Paper 2 2025 pattern: Duration: 3 hours. Mode: CBT (Mathematics & Aptitude) + Paper-based (Drawing). Section 1 - Mathematics: 30 questions, 200 marks (20 MCQ + 10 Numerical). Section 2 - Aptitude: 50 questions, 200 marks (all MCQ). Section 3 - Drawing: 2 questions, 200 marks (on A4 paper sheets). Total: 400 marks. No negative marking for Drawing; -1 mark for wrong MCQ in Math/Aptitude. Languages: 13 including English, Hindi, Tamil, Malayalam.",
  },
  {
    question: "What is the JEE Paper 2 cutoff for NITs?",
    answer:
      "JEE Paper 2 NIT cutoffs (2024 General category closing ranks): NIT Trichy - 250-350, NIT Calicut - 350-450, NIT Bhopal (MANIT) - 500-650, NIT Hamirpur - 450-600, NIT Raipur - 650-800, NIT Patna - 700-900, NIT Jaipur - 800-1000. For IIT Roorkee RPAR: Top 200 ranks. OBC cutoff is ~30% higher rank, SC/ST is ~70% higher. Minimum JoSAA qualifying marks: General 90/400, OBC 81/400, SC/ST 72/400. Use Neram's JEE Rank Predictor for personalized college predictions.",
  },
  {
    question: "How to score 300+ in JEE Paper 2?",
    answer:
      "To score 300+ in JEE Paper 2: (1) Mathematics 120+ - Master NCERT 11-12, solve 500+ JEE-level problems, focus on Calculus (30 marks), Coordinate Geometry (25 marks), Algebra (25 marks). (2) Aptitude 100+ - Practice visual reasoning, sets/relations, perspective drawing theory. (3) Drawing 80+ - Daily paper-based sketching, master 2-point perspective, shading techniques, composition balance. (4) Attempt 20+ full mocks. (5) Time management: 1.5hr Math, 1hr Aptitude, 30min Drawing. Neram's JEE-focused batch with IIT faculty has produced 99.99 percentile results.",
  },
  {
    question: "Is JEE Paper 2 easier than JEE Main Paper 1?",
    answer:
      "JEE Paper 2 (B.Arch) mathematics is significantly easier than JEE Main Paper 1 (for B.Tech). Paper 2 math is at CBSE Class 11-12 board exam level with direct NCERT questions, while Paper 1 involves complex problem-solving. However, Paper 2 adds Drawing (200 marks) which requires artistic skill and months of practice. Many engineering aspirants shift to architecture finding Paper 2 mathematics manageable but struggle with drawing. With proper coaching, scoring 300+ in Paper 2 is achievable in 6-8 months.",
  },
];

// Course Schema Data for JEE Paper 2 Coaching
const jeeCoachingCourse: Course = {
  name: "JEE Paper 2 (B.Arch) Comprehensive Coaching Program 2025",
  description:
    "Complete JEE Mains Paper 2 preparation for B.Arch admission to NITs, IITs, and CFTIs. Covers Mathematics, Aptitude, and Drawing Test with live classes by IIT/NIT architects, 500+ practice questions, 20+ mock tests, paper-based drawing practice, and dual NATA preparation on Microsoft-certified platform.",
  provider: "Neram Classes",
  price: "28000",
  priceCurrency: "INR",
  duration: "P8M", // 8 months
  mode: ["Online", "Remote"],
  availableLanguage: ["English", "Tamil", "Malayalam", "Kannada", "Hindi"],
};

export default function JEECoachingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Generate all schemas
  const courseSchema = getCourseSchema(jeeCoachingCourse);
  const faqSchema = getFAQPageSchema(jeeCoachingFAQs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "JEE Paper 2 Coaching", url: "/jee-paper-2-coaching" },
  ]);
  const webPageSchema = getWebPageSchema({
    title: String(metadata.title),
    description: String(metadata.description),
    url: "/jee-paper-2-coaching",
    datePublished: "2024-01-15",
    dateModified: new Date().toISOString().split("T")[0],
  });

  return (
    <>
      {/* Inject JSON-LD schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(courseSchema)}
        key="course-schema"
      />
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
