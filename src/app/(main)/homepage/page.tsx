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

export default function Home() {
  return (
    <Suspense fallback={null}>
      <div>
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
