// Enhanced Schema Markup for Neram Classes SEO
// Comprehensive JSON-LD generators for all page types

export interface FAQ {
  question: string;
  answer: string;
}

export interface Course {
  name: string;
  description: string;
  provider: string;
  price: string;
  priceCurrency: string;
  duration: string;
  mode: string[];
  availableLanguage: string[];
}

// ============================================
// ORGANIZATION SCHEMA (Site-wide)
// ============================================
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Neram Classes",
    alternateName: "Neram Academy",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/brand/neram-logo.png`,
    description:
      "Premier online NATA and JEE B.Arch coaching institute by IIT & NIT graduate architects. Microsoft certified classroom serving students across India, UAE, Qatar, Oman, Kuwait & Bahrain.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Tamil Nadu, Karnataka, Kerala",
      addressLocality:
        "Bangalore, Chennai, Coimbatore, Trichy, Madurai, Cochin",
    },
    areaServed: [
      {
        "@type": "Country",
        name: "India",
      },
      {
        "@type": "Country",
        name: "United Arab Emirates",
      },
      {
        "@type": "Country",
        name: "Qatar",
      },
      {
        "@type": "Country",
        name: "Oman",
      },
      {
        "@type": "Country",
        name: "Saudi Arabia",
      },
      {
        "@type": "Country",
        name: "Kuwait",
      },
      {
        "@type": "Country",
        name: "Bahrain",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English", "Tamil", "Malayalam", "Kannada", "Hindi"],
    },
    sameAs: [
      "https://www.instagram.com/neramclasses",
      "https://www.facebook.com/neramclasses",
      "https://www.youtube.com/neramclasses",
      "https://www.linkedin.com/company/neramclasses",
    ],
    founder: {
      "@type": "Person",
      name: "Neram Classes Founders",
      description: "Alumni from IIT, NIT, SPA Delhi, Anna University",
    },
    foundingDate: "2017",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: "50+",
    },
    slogan: "Building Future Architects - One Concept at a Time",
  };
}

// ============================================
// LOCAL BUSINESS SCHEMA (For city pages & coaching pages)
// ============================================
export function getLocalBusinessSchema(cityName?: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com";

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}${
      cityName ? `/coaching/${cityName.toLowerCase()}` : ""
    }#localbusiness`,
    name: `Neram Classes ${cityName ? `- ${cityName}` : ""}`,
    description: `Online NATA and JEE B.Arch coaching ${
      cityName ? `for ${cityName} students` : "across India and Gulf countries"
    }. Microsoft certified live classes by IIT/NIT architects.`,
    image: `${baseUrl}/brand/neram-logo.png`,
    url: cityName ? `${baseUrl}/coaching/${cityName.toLowerCase()}` : baseUrl,
    telephone: "+91-XXXXXXXXXX", // Replace with actual number
    priceRange: "₹₹",
    address: cityName
      ? {
          "@type": "PostalAddress",
          addressLocality: cityName,
          addressCountry:
            cityName === "Dubai" || cityName === "UAE" ? "AE" : "IN",
        }
      : {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
    geo:
      cityName === "Chennai"
        ? {
            "@type": "GeoCoordinates",
            latitude: "13.0827",
            longitude: "80.2707",
          }
        : undefined,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    areaServed:
      cityName || "India, UAE, Qatar, Oman, Kuwait, Saudi Arabia, Bahrain",
    serviceType: "Architecture Entrance Exam Coaching",
    availableLanguage: ["English", "Tamil", "Malayalam", "Kannada", "Hindi"],
    paymentAccepted: "UPI, Card, Net Banking, International Cards",
    currenciesAccepted: "INR, AED",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "NATA & JEE B.Arch Courses",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: "NATA Comprehensive Course",
            description:
              "Complete NATA preparation with drawing, aptitude & mathematics",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: "JEE Paper 2 (B.Arch) Course",
            description:
              "JEE Mains Paper 2 preparation for architecture entrance",
          },
        },
      ],
    },
  };
}

// ============================================
// COURSE SCHEMA (For coaching pages)
// ============================================
export function getCourseSchema(courseData: Course) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com";

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseData.name,
    description: courseData.description,
    provider: {
      "@type": "Organization",
      name: courseData.provider,
      url: baseUrl,
      logo: `${baseUrl}/brand/neram-logo.png`,
    },
    offers: {
      "@type": "Offer",
      price: courseData.price,
      priceCurrency: courseData.priceCurrency,
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/premium`,
      category: "Education",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: courseData.mode,
      duration: courseData.duration,
      inLanguage: courseData.availableLanguage,
      instructor: {
        "@type": "Person",
        name: "IIT & NIT Graduate Architects",
        description:
          "Experienced architecture professionals from premier institutes",
      },
    },
    educationalLevel: "Higher Secondary",
    about: "Architecture Entrance Exam Preparation",
    teaches:
      "NATA Drawing, Mathematics, Aptitude, Aesthetic Sensitivity, JEE B.Arch",
    timeRequired: courseData.duration,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "500",
      bestRating: "5",
    },
  };
}

// ============================================
// FAQ PAGE SCHEMA (Homepage + info pages)
// ============================================
export function getFAQPageSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

// ============================================
// WEBPAGE SCHEMA
// ============================================
export function getWebPageSchema(pageData: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramclasses.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageData.title,
    description: pageData.description,
    url: `${baseUrl}${pageData.url}`,
    datePublished: pageData.datePublished || "2017-01-01",
    dateModified:
      pageData.dateModified || new Date().toISOString().split("T")[0],
    image: pageData.image
      ? `${baseUrl}${pageData.image}`
      : `${baseUrl}/brand/neram-logo.png`,
    publisher: {
      "@type": "Organization",
      name: "Neram Classes",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/brand/neram-logo.png`,
      },
    },
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      url: baseUrl,
      name: "Neram Classes",
    },
  };
}

// ============================================
// HELPER: Render JSON-LD script
// ============================================
export function renderJsonLd(schemaObject: any) {
  return {
    __html: JSON.stringify(schemaObject),
  };
}

// ============================================
// COMPREHENSIVE FAQ LIST FOR HOMEPAGE
// ============================================
export const NATA_JEE_FAQS: FAQ[] = [
  {
    question: "What is NATA exam?",
    answer:
      "NATA (National Aptitude Test in Architecture) is a national-level entrance exam conducted by the Council of Architecture (COA) for admission to B.Arch programs in India. It tests drawing skills, aesthetic sensitivity, mathematics, and general aptitude. NATA is conducted 2-3 times per year and is accepted by 400+ architecture colleges across India.",
  },
  {
    question: "Is coaching required for NATA?",
    answer:
      "While self-study is possible, coaching significantly improves NATA scores, especially for drawing and aesthetic sensitivity sections. Neram Classes provides structured guidance from IIT/NIT architects, personalized feedback on drawings, 500+ practice questions, and proven strategies that helped students achieve 180+ scores. Our Microsoft-certified online platform makes coaching accessible from anywhere in India, UAE, Qatar, and Gulf countries.",
  },
  {
    question: "What are the subjects in NATA exam?",
    answer:
      "NATA 2025 has two parts: Part A (MCQ-based) covers Mathematics (25 questions) and General Aptitude (25 questions). Part B (Drawing Test) includes 2 drawing questions testing observation, sketching, and spatial understanding. Part C tests Aesthetic Sensitivity through image-based MCQs. Total marks: 200 (125 for Part A, 50 for Part B, 25 for Part C).",
  },
  {
    question: "How many times can I attempt NATA?",
    answer:
      "There is NO LIMIT on NATA attempts. You can take NATA multiple times until you secure admission. NATA is conducted 2-3 times per year (usually April, June, and sometimes July). Your best score across all attempts is considered for college admissions. Many students retake NATA to improve their scores for better college options.",
  },
  {
    question: "What is the NATA eligibility criteria?",
    answer:
      "For NATA 2025: (1) Pass 10+2 or equivalent with Mathematics as a subject. (2) Minimum 50% aggregate in PCM for general category (45% for reserved categories). (3) No age limit. (4) NRI and foreign students are eligible. State board, CBSE, ICSE - all boards accepted. For JEE Paper 2, eligibility is similar but managed by NTA.",
  },
  {
    question: "Can I take both NATA and JEE Paper 2?",
    answer:
      "Yes, you can and SHOULD attempt both NATA and JEE Paper 2 (B.Arch). There is 60-70% syllabus overlap. NATA is accepted by 400+ colleges including NITs, while JEE Paper 2 is mandatory for IIT architecture programs (RPAR). Neram's dual preparation course covers both exams efficiently with shared study material for mathematics and aptitude, separate drawing practice for each exam pattern.",
  },
  {
    question: "What is the difference between NATA and JEE Paper 2?",
    answer:
      "NATA is conducted by Council of Architecture (COA) 2-3 times/year, has 200 marks, and includes drawing test + MCQs. JEE Paper 2 is conducted by NTA twice/year (January & April), has 400 marks, and tests Mathematics (200), Aptitude (200), and Drawing (200 - done on paper). NATA is for most architecture colleges; JEE Paper 2 is required for NITs, IITs, and CFTIs. Many students take both for maximum college options.",
  },
  {
    question: "How can I prepare for NATA from UAE/Dubai?",
    answer:
      "Neram Classes offers specialized online NATA coaching for UAE, Dubai, Qatar, Oman, Kuwait, Saudi Arabia, and Bahrain students. Our Microsoft Teams-based platform provides: (1) Live classes with flexible Gulf timezone options. (2) Recorded sessions for revision. (3) NRI eligibility guidance and documentation support. (4) Digital drawing tablet integration for practice. (5) Tamil/Malayalam-speaking faculty for Indian expat families. 100+ Gulf students successfully enrolled in Indian architecture colleges through Neram.",
  },
  {
    question: "What is the NATA cutoff for NIT architecture?",
    answer:
      "NIT architecture cutoffs vary by institute and category. General category cutoffs: NIT Trichy (125-135), NIT Calicut (120-130), NIT Hamirpur (110-120), MANIT Bhopal (105-115). OBC cutoff is ~10 marks lower, SC/ST ~20-30 marks lower. Minimum NATA qualifying score is 70/200 (COA requirement). However, for admission, scores of 110+ (General) and 90+ (Reserved) are competitive. Use Neram's NATA Cutoff Calculator for personalized prediction.",
  },
  {
    question: "How to score 150+ in NATA?",
    answer:
      "To score 150+ in NATA: (1) Target 60+ in Mathematics (practice 500+ questions). (2) Score 40+ in General Aptitude (focus on logical reasoning & spatial). (3) Achieve 40+ in Drawing (daily sketching practice). (4) Master time management (2 minutes/MCQ). (5) Attempt 15+ mock tests. (6) Get expert feedback on drawings. Neram's structured approach with IIT/NIT faculty guidance has helped 50+ students cross 150 mark, with our top scorer achieving 187/200.",
  },
  {
    question: "What are the best architecture colleges in India?",
    answer:
      "Top architecture colleges: (1) IIT RPAR (Roorkee) - AIR 1-50 in JEE. (2) CEPT University Ahmedabad - NATA cutoff ~140. (3) SPA Delhi/Bhopal/Vijayawada - NATA 130+. (4) NIT Trichy - NATA 125+. (5) Anna University CEG Chennai - TNEA + NATA. (6) Jadavpur University Kolkata - JEE Paper 2. (7) BMS College Bangalore. All accept NATA/JEE scores. Neram alumni are placed in 50+ top colleges including 8 NITs and 3 SPAs.",
  },
  {
    question: "Is NATA exam easy or difficult?",
    answer:
      "NATA difficulty is moderate compared to JEE Mains, but the drawing section requires consistent practice and skill development. Mathematics is Class 11-12 CBSE level. Aptitude tests logical thinking and visual reasoning. Drawing tests observation and sketching ability. With 6-month structured preparation and expert coaching, scoring 120-140 is achievable for most students. Without guidance, many struggle with Part B (Drawing) which carries 50 marks.",
  },
  {
    question: "What is NATA exam pattern 2025?",
    answer:
      "NATA 2025 exam pattern: Duration: 3 hours. Mode: Computer-based test (MCQ) + Paper-based drawing test. Part A (MCQ): Mathematics 25Q + General Aptitude 25Q = 125 marks. Part B (Drawing): 2 drawing questions on A4 sheets = 50 marks. Part C: Aesthetic Sensitivity MCQ = 25 marks. Total: 200 marks. Negative marking: 1 mark deducted for wrong MCQ answers. Drawing is assessed for proportion, composition, color use, and creativity.",
  },
  {
    question: "What is the NATA registration fee?",
    answer:
      "NATA 2025 registration fee: ₹2,000 for General/OBC candidates, ₹1,000 for SC/ST candidates. For NRI/Foreign candidates: USD 200. Fee includes application, examination, and result processing. Late fee: Additional ₹5,000 if applying after deadline. JEE Paper 2 fee: ₹650 (General), ₹325 (Reserved). Payment modes: Credit/Debit card, Net banking, UPI, Paytm. Application correction fee: ₹500. Register early to avoid late fees.",
  },
  {
    question: "When is NATA exam date 2025?",
    answer:
      "NATA 2025 exam dates (tentative): First Test: April 12-15, 2025. Second Test: June 7-10, 2025. Third Test: July 19-22, 2025 (if conducted). Registration opens 6 weeks before each test. Admit card released 1 week before exam. Results declared within 7-10 days. For JEE Paper 2: January session (Jan 24-31, 2025) and April session (April 4-12, 2025). Always check official COA and NTA websites for confirmed dates.",
  },
  {
    question: "What is the best online coaching for NATA?",
    answer:
      "Best online NATA coaching should offer: (1) Live interactive classes (not just recordings). (2) Faculty from IIT/NIT with architecture background. (3) Personalized drawing feedback. (4) 500+ practice questions and 15+ mock tests. (5) Doubt clearing sessions. (6) Microsoft-certified platform for reliability. Neram Classes provides all these plus flexible Gulf timezone classes, Tamil/Malayalam support, 100% success rate, and proven toppers (AIR 1 in JEE 2024, NATA 187/200 in 2020). Check student reviews and trial classes before enrolling.",
  },
  {
    question: "Can I get architecture admission without NATA?",
    answer:
      "For most B.Arch colleges, NATA is mandatory as per COA regulations. However, alternatives exist: (1) JEE Paper 2 is accepted by NITs, IITs, and many state colleges. (2) Some state universities conduct separate exams (Tamil Nadu has TNEA, Kerala has KEAM). (3) Few private colleges have management quota (not recommended). (4) Foreign universities don't require NATA. Bottom line: NATA or JEE Paper 2 is essential for 95% of Indian architecture colleges. Taking both maximizes your options.",
  },
  {
    question: "What is NATA qualifying marks?",
    answer:
      "NATA qualifying marks set by Council of Architecture: Minimum 70 out of 200 marks. However, 70 marks only makes you eligible; it does NOT guarantee admission. For actual college admission: Government colleges (NITs, SPAs): 110-140 required. Top private colleges (CEPT, BMS): 100-130 required. Average private colleges: 80-100 accepted. Reserved category cutoffs are 10-30 marks lower. Each college sets its own cutoff based on seat availability and applicant pool.",
  },
  {
    question: "How is NATA drawing test evaluated?",
    answer:
      "NATA Drawing test marking criteria: (1) Relevance to theme (10 marks) - Understanding question requirement. (2) Composition (10 marks) - Layout, balance, focal point. (3) Proportions (10 marks) - Accurate size relationships. (4) Detailing (10 marks) - Texture, depth, finishing. (5) Creativity (10 marks) - Unique interpretation, artistic expression. Total: 50 marks per drawing. Evaluators are trained architects. Common mistakes: Poor time management, light sketches, no shading, repetitive ideas. Practice with expert feedback is crucial.",
  },
  {
    question: "What books are best for NATA preparation?",
    answer:
      "Best NATA books: Mathematics: (1) NCERT Class 11-12 (Mandatory). (2) R.S. Aggarwal Objective Mathematics. (3) Pearson NATA Guide. Drawing: (1) Robertson's Drawing & Perspective. (2) Ernest Norling's Perspective Drawing. (3) Nata Made Easy Drawing Book. Aptitude: (1) R.S. Aggarwal Logical Reasoning. (2) Arihant NATA Guide. Previous Papers: (1) Disha NATA 10 Years Papers. (2) Neram Classes Previous Paper Analysis (Free). Focus on NCERT for mathematics - 60% questions are direct from NCERT.",
  },
];


