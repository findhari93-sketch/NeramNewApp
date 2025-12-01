import React from "react";
import {
  getBreadcrumbSchema,
  getWebPageSchema,
  renderJsonLd,
} from "@/lib/schema";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema for blog section
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  const webPageSchema = getWebPageSchema({
    name: "Architecture Exam Blog - NATA & JEE Preparation Tips",
    description:
      "Expert articles, guides, and tips for NATA and architecture entrance exam preparation.",
    url: "/blog",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
      />
      {children}
    </>
  );
}
