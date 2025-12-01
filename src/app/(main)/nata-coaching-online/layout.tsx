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

// FAQs specific to NATA Coaching Online page
const nataCoachingFAQs: FAQ[] = [
  {
    question: "What makes Neram the best NATA online coaching?",
    answer:
      "Neram Classes stands out with IIT & NIT graduate faculty, 100% live interactive classes on Microsoft-certified platform, personalized drawing feedback, 500+ practice questions, 15+ full-length mock tests, flexible Gulf timezone batches, and proven results - AIR 1 in JEE B.Arch 2024 and 187/200 in NATA 2020. We offer multi-language support (Tamil, Malayalam, Kannada, English) for South Indian students and NRIs.",
  },
  {
    question: "Do you provide live classes or only recorded videos?",
    answer:
      "Neram provides 100% LIVE interactive classes via Microsoft Teams where you can ask questions in real-time, get instant doubt clearing, and participate in discussions. Additionally, all live sessions are recorded and available for lifetime access. We do NOT rely only on pre-recorded videos like many other platforms.",
  },
  {
    question: "How is online drawing practice conducted for NATA?",
    answer:
      "For NATA drawing preparation, students practice on paper/digital tablets and submit scanned images or photos. Our IIT/NIT faculty provides personalized feedback within 24 hours with annotations highlighting proportion errors, composition issues, and improvement areas. We also conduct live drawing demonstration sessions where faculty sketches in real-time explaining techniques.",
  },
  {
    question: "What is included in NATA coaching fees?",
    answer:
      "Neram NATA coaching includes: (1) 6-12 months of live classes (180+ hours), (2) Lifetime access to recorded lectures, (3) 500+ practice questions with solutions, (4) 15+ full-length mock tests, (5) Unlimited drawing submissions and feedback, (6) Previous 10 years NATA papers with video solutions, (7) Study material PDFs, (8) Doubt clearing sessions, (9) Parent-teacher meetings. Check /premium page for detailed pricing.",
  },
  {
    question: "Can UAE/Dubai students join NATA online coaching?",
    answer:
      "Absolutely! Neram has specialized batches for Gulf students (UAE, Dubai, Qatar, Oman, Kuwait, Saudi Arabia, Bahrain) with flexible timings that accommodate Middle East time zones. We provide guidance on NRI eligibility criteria, documentation, and college admission process for Indian students studying abroad. 100+ Gulf students have successfully cleared NATA through Neram and secured seats in NIT, CEPT, SPA, and other top colleges.",
  },
  {
    question: "What is the success rate of Neram NATA students?",
    answer:
      "Neram Classes has maintained a 100% success rate since 2017 - every student who completed the course has scored above NATA qualifying marks (70/200). Our average student score is 125/200. Notable achievements: All India Rank 1 in JEE B.Arch 2024, NATA 187/200 (Rank 1 - 2020), 99.99 percentile in JEE Paper 2, 50+ NIT selections, and placements in CEPT, SPA Delhi, Anna University CEG, and other premier architecture colleges.",
  },
  {
    question: "Do you offer NATA + JEE Paper 2 combined coaching?",
    answer:
      "Yes! Since NATA and JEE Paper 2 (B.Arch) have 60-70% syllabus overlap in Mathematics and Aptitude, Neram offers optimized dual preparation courses. We provide common study material for overlapping topics and separate modules for exam-specific sections. This strategy helps students maximize college options as NATA is accepted by 400+ colleges while JEE Paper 2 is mandatory for NITs and IITs.",
  },
  {
    question: "Is there a free trial or demo class?",
    answer:
      "Yes, Neram offers a FREE demo class where you can experience our live teaching methodology, interact with IIT/NIT faculty, and understand our Microsoft Teams-based platform. Additionally, we provide 10 free sample PDFs, 1 mock test, and admission counseling session. No credit card required for demo registration. Visit /freebooks page or contact us to schedule your free session.",
  },
];

// Course Schema Data for NATA Coaching
const nataCoachingCourse: Course = {
  name: "NATA Comprehensive Online Coaching Program 2025",
  description:
    "Complete NATA preparation course covering Drawing Test, Mathematics, General Aptitude, and Aesthetic Sensitivity. Includes live classes by IIT/NIT architects, 500+ practice questions, 15+ mock tests, personalized feedback, and lifetime doubt support on Microsoft-certified platform.",
  provider: "Neram Classes",
  price: "25000", // Replace with actual price
  priceCurrency: "INR",
  duration: "P6M", // 6 months in ISO 8601 duration format
  mode: ["Online", "Remote"],
  availableLanguage: ["English", "Tamil", "Malayalam", "Kannada", "Hindi"],
};

export default function NATACoachingOnlineLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Generate all schemas
  const courseSchema = getCourseSchema(nataCoachingCourse);
  const faqSchema = getFAQPageSchema(nataCoachingFAQs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "NATA Coaching Online", url: "/nata-coaching-online" },
  ]);
  const webPageSchema = getWebPageSchema({
    title: String(metadata.title),
    description: String(metadata.description),
    url: "/nata-coaching-online",
    datePublished: "2017-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    image: "/images/og/nata-coaching-online.jpg",
  });

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
        key="breadcrumb-schema"
      />

      {/* Course Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(courseSchema)}
        key="course-schema"
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(faqSchema)}
        key="faq-schema"
      />

      {/* WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
        key="webpage-schema"
      />

      {children}
    </>
  );
}
