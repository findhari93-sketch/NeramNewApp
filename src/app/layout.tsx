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

export const metadata: Metadata = {
  title:
    "Neram Classes - NATA & JEE B.Arch Coaching | Online & Offline in Tamil Nadu, Karnataka, UAE",
  description:
    "Premier NATA & JEE B.Arch coaching offering online classes across India, UAE, Dubai, Oman, Saudi Arabia and offline coaching in Trichy, Chennai, Madurai, Coimbatore, Bangalore, Tiruppur. Expert architecture entrance exam preparation with proven results.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    url: siteUrl,
    siteName: "Neram Classes",
    type: "website",
    title:
      "Neram Classes - NATA & JEE B.Arch Coaching | Tamil Nadu, Karnataka, UAE",
    description:
      "Premier NATA & JEE B.Arch coaching offering online classes across India, UAE, Dubai, Oman, Saudi Arabia and offline coaching in Trichy, Chennai, Madurai, Coimbatore, Bangalore, Tiruppur.",
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    // Exam-specific keywords
    "NATA coaching",
    "JEE B.Arch coaching",
    "architecture entrance exam",
    "NATA preparation",
    "JEE B.Arch preparation",
    "architecture exam coaching",
    // Online location keywords
    "NATA coaching online India",
    "JEE B.Arch online coaching",
    "architecture coaching UAE",
    "NATA coaching Dubai",
    "architecture exam coaching Oman",
    "NATA coaching Saudi Arabia",
    "online architecture classes",
    // Tamil Nadu cities
    "NATA coaching Trichy",
    "JEE B.Arch coaching Chennai",
    "NATA classes Madurai",
    "architecture coaching Coimbatore",
    "NATA coaching Tiruppur",
    "architecture entrance coaching Tamil Nadu",
    // Karnataka cities
    "NATA coaching Bangalore",
    "JEE B.Arch coaching Karnataka",
    "architecture coaching Bangalore",
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
