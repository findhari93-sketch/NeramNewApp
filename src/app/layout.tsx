import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Handlee,
  Roboto,
  Bakbak_One,
  Poppins,
  Suez_One,
} from "next/font/google";
import ThemeRegistry from "./ThemeRegistry";
import { SessionProvider } from "@/contexts/SessionContext";
import ProfileGuard from "./components/shared/ProfileGuard";
import ChatBubbles from "../components/ChatBubbles";
import SnackbarNotice from "./components/shared/SnackbarNotice";
import { getOrganizationSchema, renderJsonLd } from "@/lib/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Additional fonts via next/font (preferred over <link> for performance)
const handlee = Handlee({
  variable: "--font-handlee",
  subsets: ["latin"],
  weight: "400",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
});

const bakbakOne = Bakbak_One({
  variable: "--font-bakbak-one",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const suezOne = Suez_One({
  variable: "--font-suez-one",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

// SEO: Canonical URLs
// - Root layout sets canonical to "/" for homepage
// - Individual pages should use generateCanonicalMetadata() from @/lib/metadataHelpers
// - Middleware strips query parameters (e.g., ?trk=...) via 301 redirects
// - Old URLs (e.g., /pudukkottai-url, *.html) redirect to canonical versions
// - This prevents duplicate content issues in Google Search Console

export const metadata: Metadata = {
  title:
    "Neram Classes - Best NATA & JEE B.Arch Coaching | Microsoft Certified Online Classes",
  description:
    "Top-ranked NATA & JEE B.Arch coaching by IIT/NIT architects. Microsoft certified online classes across India, UAE, Dubai, Qatar. Offline coaching in Trichy, Chennai, Bangalore, Coimbatore. AIR 1 results. 500+ practice questions. Enroll now!",
  metadataBase: new URL(siteUrl),
  openGraph: {
    url: siteUrl,
    siteName: "Neram Classes",
    type: "website",
    title:
      "Neram Classes - Best NATA & JEE B.Arch Coaching | Microsoft Certified",
    description:
      "IIT/NIT faculty, Live classes, 99.99 percentile results. Microsoft certified platform. Online coaching for India, UAE, Dubai. Offline in Tamil Nadu & Karnataka.",
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    // Primary keywords
    "best nata coaching",
    "best jee paper 2 coaching",
    "nata coaching online",
    "jee b arch coaching online",
    "microsoft certified nata coaching",

    // Exam-specific keywords
    "NATA coaching",
    "JEE B.Arch coaching",
    "JEE Paper 2 coaching",
    "architecture entrance exam",
    "NATA preparation",
    "JEE B.Arch preparation",
    "architecture exam coaching",
    "nata syllabus",
    "jee paper 2 syllabus",

    // Feature keywords
    "IIT NIT faculty coaching",
    "live online architecture classes",
    "nata drawing coaching",
    "nata mathematics coaching",
    "dual nata jee preparation",

    // Online location keywords
    "NATA coaching online India",
    "JEE B.Arch online coaching",
    "architecture coaching UAE",
    "NATA coaching Dubai",
    "architecture exam coaching Qatar",
    "NATA coaching Oman",
    "NATA coaching Saudi Arabia",
    "online architecture classes",
    "nata coaching for gulf students",

    // Tamil Nadu cities
    "NATA coaching Trichy",
    "JEE B.Arch coaching Chennai",
    "NATA classes Madurai",
    "architecture coaching Coimbatore",
    "NATA coaching Tiruppur",
    "architecture entrance coaching Tamil Nadu",
    "nata coaching bangalore",

    // Karnataka cities
    "NATA coaching Bangalore",
    "JEE B.Arch coaching Karnataka",
    "architecture coaching Bangalore",

    // Results keywords
    "nata toppers coaching",
    "jee paper 2 air 1",
    "99 percentile jee coaching",
    "nata 180+ score coaching",

    // General
    "best NATA coaching",
    "top architecture coaching institute",
    "NATA exam preparation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const organizationSchema = getOrganizationSchema();

  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-757750634"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-757750634');
            `,
          }}
        />
        {/* Organization Schema - Site-wide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(organizationSchema)}
        />
        {recaptchaKey && (
          <script
            src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaKey}`}
            async
            defer
          />
        )}
        {/* Inline script to hide reCAPTCHA badge immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Function to hide reCAPTCHA badge
                function hideRecaptchaBadge() {
                  const badges = document.querySelectorAll('.grecaptcha-badge, [class*="grecaptcha-badge"]');
                  badges.forEach(function(badge) {
                    if (badge) {
                      badge.style.visibility = 'hidden';
                      badge.style.opacity = '0';
                      badge.style.display = 'none';
                      badge.style.width = '0';
                      badge.style.height = '0';
                      badge.style.position = 'absolute';
                      badge.style.overflow = 'hidden';
                      badge.style.zIndex = '-9999';
                    }
                  });
                }

                // Run immediately
                hideRecaptchaBadge();

                // Run after DOM is loaded
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', hideRecaptchaBadge);
                } else {
                  hideRecaptchaBadge();
                }

                // Run after window is fully loaded
                window.addEventListener('load', hideRecaptchaBadge);

                // Use MutationObserver to catch dynamically added badges
                var observer = new MutationObserver(function(mutations) {
                  hideRecaptchaBadge();
                });

                // Start observing when DOM is ready
                if (document.body) {
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true
                  });
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true
                    });
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${handlee.variable} ${roboto.variable} ${bakbakOne.variable} ${poppins.variable} ${suezOne.variable}`}
      >
        <ThemeRegistry>
          <SessionProvider enableTracking={true} autoTrackNavigation={true}>
            <ProfileGuard>{children}</ProfileGuard>
            <ChatBubbles />
            <SnackbarNotice />
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
