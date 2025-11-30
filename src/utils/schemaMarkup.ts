/**
 * Utility functions for generating JSON-LD structured data (Schema.org)
 * for improved SEO and rich search results
 */

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleSchema {
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
  publisherName?: string;
  publisherLogoUrl?: string;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  siteUrl: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: FAQItem[]): object {
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

/**
 * Generate Article schema
 */
export function generateArticleSchema(
  data: ArticleSchema,
  _siteUrl: string
): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
  };

  if (data.imageUrl) {
    schema.image = data.imageUrl;
  }

  if (data.authorName) {
    schema.author = {
      "@type": "Person",
      name: data.authorName,
    };
  }

  if (data.publisherName) {
    schema.publisher = {
      "@type": "Organization",
      name: data.publisherName,
      logo: data.publisherLogoUrl
        ? {
            "@type": "ImageObject",
            url: data.publisherLogoUrl,
          }
        : undefined,
    };
  }

  return schema;
}

/**
 * Generate EducationalOrganization schema for coaching pages
 */
export function generateEducationalOrgSchema(
  name: string,
  description: string,
  url: string,
  logoUrl?: string
): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name,
    description,
    url,
  };

  if (logoUrl) {
    schema.logo = logoUrl;
  }

  return schema;
}

/**
 * Generate Course schema
 */
export function generateCourseSchema(
  name: string,
  description: string,
  providerName: string,
  providerUrl: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: providerName,
      url: providerUrl,
    },
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(
  name: string,
  description: string,
  url: string
): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
  };
}

/**
 * Render schema as JSON-LD script tag (for use in components)
 */
export function renderSchemaScript(schema: object): string {
  return JSON.stringify(schema);
}

/**
 * Generate Alumni Organization schema (EducationalOrganization with alumni list summary)
 */
export function generateAlumniOrganizationSchema(
  orgName: string,
  description: string,
  url: string,
  totalAlumni: number,
  notableAchievements: string[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: orgName,
    description,
    url,
    alumni: {
      "@type": "ItemList",
      name: "Alumni Summary",
      numberOfItems: totalAlumni,
      itemListElement: notableAchievements.map((ach, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: ach,
      })),
    },
  };
}

/**
 * Generate Person schema entries for a subset of alumni (limit to avoid overlarge JSON-LD)
 */
export function generateAlumniPersonSchemas(
  people: Array<{
    name: string;
    year: number;
    exam: string;
    nataScore?: number;
    nataRankIndia?: number;
    jeeRankIndia?: number;
    college: string;
    city: string;
    achievements: string[];
    linkedin?: string;
    instagram?: string;
  }>,
  siteUrl: string
): object[] {
  return people.map((p) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    description: `${p.exam} ${
      p.year
    } alumni of Neram Academy. Achievements: ${p.achievements.join(", ")}`,
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Neram Academy",
      url: siteUrl,
    },
    affiliation: p.college,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.city,
      addressCountry: "IN",
    },
    sameAs: [p.linkedin, p.instagram].filter(Boolean),
    additionalProperty: [
      p.nataScore && {
        "@type": "PropertyValue",
        name: "NATA Score",
        value: p.nataScore,
      },
      p.nataRankIndia && {
        "@type": "PropertyValue",
        name: "NATA India Rank",
        value: p.nataRankIndia,
      },
      p.jeeRankIndia && {
        "@type": "PropertyValue",
        name: "JEE B.Arch India Rank",
        value: p.jeeRankIndia,
      },
    ].filter(Boolean),
  }));
}
