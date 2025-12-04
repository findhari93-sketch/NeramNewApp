import { Metadata } from "next";
import { getCanonicalUrl } from "./canonical";

/**
 * Generate metadata with proper canonical URL
 */
export function generateCanonicalMetadata(
  pathname: string,
  additionalMetadata?: Partial<Metadata>
): Metadata {
  const canonicalUrl = getCanonicalUrl(pathname);

  return {
    ...additionalMetadata,
    alternates: {
      canonical: canonicalUrl,
      ...additionalMetadata?.alternates,
    },
  };
}
