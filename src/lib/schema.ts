/**
 * Schema Markup Utilities for Neram Classes
 * Provides JSON-LD structured data for better AI and search engine readability
 */

import { Organization, WebSite, BreadcrumbList, WebPage, Product, Offer, Book, QAPage, ItemList, SoftwareApplication, Person, ProfilePage, CollectionPage, Course, WithContext } from 'schema-dts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://neramclasses.com';
const siteName = 'Neram Classes';
const siteDescription = 'Premier NATA & JEE B.Arch coaching institute offering online classes across India, UAE, Dubai, Oman, Saudi Arabia, and offline coaching in Trichy, Chennai, Madurai, Coimbatore, Bangalore, Tiruppur across Tamil Nadu and Karnataka. Expert architecture entrance exam preparation.';

/**
 * Base Organization schema for Neram Classes with location targeting
 */
export function getOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: '250',
      height: '60',
    },
    sameAs: [
      // Add your social media URLs here
      // 'https://www.facebook.com/neramclasses',
      // 'https://www.instagram.com/neramclasses',
      // 'https://www.youtube.com/neramclasses',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@neramclasses.com',
      areaServed: [
        // Online coverage
        { '@type': 'Country', name: 'India' },
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'Oman' },
        { '@type': 'Country', name: 'Saudi Arabia' },
        // Offline locations in Tamil Nadu
        { '@type': 'City', name: 'Trichy', addressRegion: 'Tamil Nadu', addressCountry: 'India' },
        { '@type': 'City', name: 'Chennai', addressRegion: 'Tamil Nadu', addressCountry: 'India' },
        { '@type': 'City', name: 'Madurai', addressRegion: 'Tamil Nadu', addressCountry: 'India' },
        { '@type': 'City', name: 'Coimbatore', addressRegion: 'Tamil Nadu', addressCountry: 'India' },
        { '@type': 'City', name: 'Tiruppur', addressRegion: 'Tamil Nadu', addressCountry: 'India' },
        // Offline locations in Karnataka
        { '@type': 'City', name: 'Bangalore', addressRegion: 'Karnataka', addressCountry: 'India' },
      ],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Trichy',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'India',
    },
  };
}

/**
 * WebSite schema for the homepage
 */
export function getWebSiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Breadcrumb schema generator
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url?: string }>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${siteUrl}${item.url}` }),
    })),
  };
}

/**
 * WebPage schema generator
 */
export function getWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: Array<{ name: string; url?: string }>;
}): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}${options.url}`,
    name: options.name,
    description: options.description,
    url: `${siteUrl}${options.url}`,
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
    about: {
      '@id': `${siteUrl}/#organization`,
    },
    ...(options.breadcrumbs && {
      breadcrumb: getBreadcrumbSchema(options.breadcrumbs),
    }),
  };
}

/**
 * Product schema for premium subscriptions
 */
export function getProductSchema(options: {
  name: string;
  description: string;
  price: string;
  currency?: string;
  availability?: string;
  validThrough?: string;
}): WithContext<Product> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description,
    offers: {
      '@type': 'Offer',
      price: options.price,
      priceCurrency: options.currency || 'INR',
      availability: options.availability || 'https://schema.org/InStock',
      ...(options.validThrough && { priceValidUntil: options.validThrough }),
      seller: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    provider: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

/**
 * Book schema for free books
 */
export function getBookSchema(options: {
  name: string;
  author?: string;
  description?: string;
  isbn?: string;
  url?: string;
}): WithContext<Book> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: options.name,
    ...(options.author && { author: { '@type': 'Person', name: options.author } }),
    ...(options.description && { description: options.description }),
    ...(options.isbn && { isbn: options.isbn }),
    ...(options.url && { url: `${siteUrl}${options.url}` }),
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

/**
 * QAPage schema for Ask Seniors
 */
export function getQAPageSchema(options: {
  question: string;
  answer?: string;
  url: string;
}): WithContext<QAPage> {
  const schema: WithContext<QAPage> = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    '@id': `${siteUrl}${options.url}`,
    mainEntity: {
      '@type': 'Question',
      name: options.question,
      ...(options.answer && {
        acceptedAnswer: {
          '@type': 'Answer',
          text: options.answer,
        },
      }),
    },
  };
  return schema;
}

/**
 * ItemList schema for collections
 */
export function getItemListSchema(options: {
  name: string;
  description?: string;
  items: Array<{ name: string; url?: string; description?: string }>;
}): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: options.name,
    ...(options.description && { description: options.description }),
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { url: `${siteUrl}${item.url}` }),
      ...(item.description && { description: item.description }),
    })),
  };
}

/**
 * SoftwareApplication schema for tools/calculators
 */
export function getSoftwareApplicationSchema(options: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    description: options.description,
    url: `${siteUrl}${options.url}`,
    applicationCategory: options.applicationCategory || 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    provider: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

/**
 * Person schema for user profiles
 */
export function getPersonSchema(options: {
  name: string;
  email?: string;
  description?: string;
  image?: string;
}): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: options.name,
    ...(options.email && { email: options.email }),
    ...(options.description && { description: options.description }),
    ...(options.image && { image: options.image }),
  };
}

/**
 * ProfilePage schema
 */
export function getProfilePageSchema(options: {
  name: string;
  description: string;
  url: string;
  person?: ReturnType<typeof getPersonSchema>;
}): WithContext<ProfilePage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteUrl}${options.url}`,
    name: options.name,
    description: options.description,
    url: `${siteUrl}${options.url}`,
    ...(options.person && { mainEntity: options.person }),
  };
}

/**
 * CollectionPage schema for resource collections
 */
export function getCollectionPageSchema(options: {
  name: string;
  description: string;
  url: string;
}): WithContext<CollectionPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}${options.url}`,
    name: options.name,
    description: options.description,
    url: `${siteUrl}${options.url}`,
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
  };
}

/**
 * Course schema for educational programs
 */
export function getCourseSchema(options: {
  name: string;
  description: string;
  provider?: string;
  courseMode?: string;
  educationalLevel?: string;
  url?: string;
}): WithContext<Course> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: options.name,
    description: options.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: options.provider || siteName,
      '@id': `${siteUrl}/#organization`,
    },
    ...(options.url && { url: `${siteUrl}${options.url}` }),
    ...(options.courseMode && { courseMode: options.courseMode }),
    ...(options.educationalLevel && { educationalLevel: options.educationalLevel }),
    inLanguage: 'en',
    availableLanguage: ['en', 'ta', 'hi'],
    teaches: options.name.includes('NATA')
      ? 'Architecture aptitude and design skills for NATA entrance exam'
      : 'Architecture and mathematics skills for JEE B.Arch entrance exam',
  };
}

/**
 * Helper function to render JSON-LD script tag
 * Returns an object with __html property for use with dangerouslySetInnerHTML
 */
export function renderJsonLd(schema: any) {
  return {
    __html: JSON.stringify(schema),
  };
}
