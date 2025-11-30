import SnackbarNotice from "../../components/shared/SnackbarNotice";
import HeroHome from "./sections/Hero/HeroHome";
import TopperSection from "./sections/Toppers/TopperSection";
import AchievementsSection from "./sections/Achievements/AchievementsSection";
import ParentsSection from "./sections/Parents/ParentsSection";
import YouTubeSection from "./sections/Youtube/YouTubeSection";
import CardCoursesSection from "./sections/CardCourses/CardCoursesSection";
import AudiowhatsappSection from "./sections/Audio&Whatsapp/AudiowhatsappSection";
import FaqsSection from "./sections/Faqs/FaqsSection";
import TeamSection from "./sections/Team/TeamSection";
import AdvantagesSection from "./sections/Advantages/AdvantagesSection";
import HeroWaves from "./sections/Hero/HeroWaves";
import Footer from "../../components/shared/Footer/footer";
import { Suspense } from "react";
import { getWebSiteSchema, getBreadcrumbSchema, getCourseSchema, renderJsonLd } from "@/lib/schema";

export default function Home() {
  const websiteSchema = getWebSiteSchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" }
  ]);

  // Course schemas for NATA and JEE B.Arch
  const nataCourseSchema = getCourseSchema({
    name: "NATA Coaching - National Aptitude Test in Architecture",
    description: "Comprehensive NATA coaching program covering drawing, aptitude, and aesthetic sensitivity. Available online across India, UAE, Dubai, Oman, Saudi Arabia and offline in Tamil Nadu & Karnataka cities.",
    courseMode: "online/offline",
    educationalLevel: "Higher Secondary",
    url: "/",
  });

  const jeeCourseSchema = getCourseSchema({
    name: "JEE B.Arch Coaching - Joint Entrance Examination",
    description: "Expert JEE B.Arch preparation covering mathematics, aptitude, and drawing. Available online across India, UAE, Dubai, Oman, Saudi Arabia and offline in Trichy, Chennai, Madurai, Coimbatore, Bangalore.",
    courseMode: "online/offline",
    educationalLevel: "Higher Secondary",
    url: "/",
  });

  return (
    <Suspense fallback={null}>
      <div>
        {/* Schema Markup for Homepage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(websiteSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(nataCourseSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={renderJsonLd(jeeCourseSchema)}
        />

        <SnackbarNotice />
        <HeroHome />
        <TopperSection />
        <AchievementsSection />
        <ParentsSection />
        <YouTubeSection />
        <CardCoursesSection />
        <AudiowhatsappSection />
        <FaqsSection />
        <TeamSection />
        <AdvantagesSection />

        <div style={{ position: "relative" }}>
          <HeroWaves position="top" bgcolor="#fff" />
          <Footer />
        </div>
      </div>
    </Suspense>
  );
}
