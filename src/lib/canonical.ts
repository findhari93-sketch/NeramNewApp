/**
 * Generate canonical URL for SEO
 * Strips query parameters and ensures proper formatting
 */
export function getCanonicalUrl(
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL ||
    "https://neramclasses.com"
): string {
  // Remove trailing slash unless it's the root path
  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // Ensure baseUrl doesn't have trailing slash
  const cleanBase = baseUrl.replace(/\/$/, "");

  return `${cleanBase}${cleanPath}`;
}

/**
 * Check if URL should be redirected (old URLs, duplicates, etc.)
 */
export function shouldRedirect(pathname: string): {
  redirect: boolean;
  target?: string;
} {
  // Generate current year for dynamic application form URL
  const currentYear = new Date().getFullYear();

  // Map of old URLs to their canonical equivalents
  const redirectMap: Record<string, string> = {
    // === City/Location URLs (redirect to homepage) ===
    "/pudukkottai-url": "/",
    "/tamilnadu-url": "/",
    "/cochin-url": "/",
    "/aat-url": "/",
    "/vizag-url": "/",
    "/salem-url": "/",
    "/bangalore-url": "/",
    "/hyderabad-url": "/",
    "/delhi-url": "/",
    "/erode-url": "/",
    "/tirunelveli-url": "/",
    "/malapuram-url": "/",
    "/ooty-url": "/",
    "/perambur-url": "/",
    "/andhrapradesh-url": "/",

    // === Coaching/Exam URLs ===
    "/nata-online-url": "/nata-coaching-online",
    "/online-coaching-url": "/nata-coaching-online",
    "/jee-paper-2-url": "/jee-paper-2-coaching",
    "/nata-question-url": "/nata-important-questions",
    "/nata-aptitude-url": "/nata-important-questions",
    "/nata-drawing-url": "/nata-coaching-online",
    "/nata-paper-2-url": "/jee-paper-2-coaching",
    "/nata-app-url": "/",
    "/uceed-url": "/",
    "/nift-url": "/",
    "/nid-url": "/",

    // === Application Form URLs ===
    "/Application-form-Nata-Coaching": "/applicationform",
    [`/NATA_Application_Form_${currentYear}`]: "/applicationform",
    "/test-page/Application-form-Nata-Coaching.html": "/applicationform",
    "/blog/Application-form-Nata-Coaching.html": "/applicationform",
    "/about/Application-form-Nata-Coaching.html": "/applicationform",

    // === Materials/Books URLs ===
    "/Free-Nata-Class-books-online-registration": "/freebooks",
    "/Free-NATA-study-Materials.html": "/freebooks",
    "/materials": "/freebooks",
    "/NATA_Free_Books": "/freebooks",
    "/about/Free-NATA-study-Materials.html": "/freebooks",
    "/NATA-coaching-centers-nearby/Free-NATA-study-Materials.html":
      "/freebooks",
    "/NATA_Coaching_center_near_me_address/Free-NATA-study-Materials.html":
      "/freebooks",
    "/nata-cutoff-calculator/Free-NATA-study-Materials.html": "/freebooks",
    "/wp-admin/Free-Nata-Class-books-online-registration.html": "/freebooks",
    "/register/Free-Nata-Class-books-online-registration.html": "/freebooks",

    // === Syllabus URLs ===
    "/JEE_B.arch_Syllabus": "/nata-syllabus-subjects",
    "/NATA_Best_Architecture_Colleges": "/",

    // === FAQ URLs ===
    "/FAQs-nata-exam-questions": "/nata-important-questions",

    // === Contact URLs ===
    "/contact-neram-nata-coaching.html": "/contact",
    "/contact/contact-neram-nata-coaching.html": "/contact",
    "/wp-admin/contact-neram-nata-coaching.html": "/contact",
    "/test-page/contact-neram-nata-coaching.html": "/contact",
    "/blog/contact-neram-nata-coaching.html": "/contact",
    "/about/contact-neram-nata-coaching.html": "/contact",
    "/contact/index.html": "/contact",

    // === About/Team URLs ===
    "/team-url": "/",
    "/about": "/",

    // === NATA Coaching Centers URLs ===
    "/NATA-coaching-centers-nearby": "/",
    "/NATA_Coaching_center_near_me_address": "/",
    "/NATA-coaching-centers-nearby/NATA-coaching-centers-nearby.html": "/",
    "/NATA-coaching-centers-nearby/draw.html": "/",
    "/NATA-coaching-centers-nearby/1000": "/",
    "/register/NATA-coaching-centers-nearby.html": "/",
    "/wp-admin/NATA-coaching-centers-nearby.html": "/",
    "/about/NATA-coaching-centers-nearby.html": "/",

    // === Index/Home duplicates ===
    "/index.html": "/",

    // === Draw.html files ===
    "/about/draw.html": "/",
    "/wp-admin/draw.html": "/",

    // === Test page URLs ===
    "/test-page/index.html": "/",
    "/test-page/": "/",

    // === Special characters in URLs ===
    "/&": "/",
    "/$": "/",

    // === Deep nested paths ===
    "/members/user/activity/course/assets/img/whatsapp/2021/Free-NATA-study-Materials.html":
      "/freebooks",
    "/members/user/activity/course/assets/img/whatsapp/2021/index.html": "/",
    "/members/user/forums/assets/img/whatsapp/2021/assets/img/whatsapp/draw.html":
      "/",
  };

  const target = redirectMap[pathname];
  if (target) {
    return { redirect: true, target };
  }

  // Handle dynamic year-based application form URLs
  const appFormYearMatch = pathname.match(/^\/NATA_Application_Form_(\d{4})$/);
  if (appFormYearMatch) {
    return { redirect: true, target: "/applicationform" };
  }

  return { redirect: false };
}
