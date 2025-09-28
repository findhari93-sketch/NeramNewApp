import TopNavBar from "./components/shared/TopNavBar";
import SnackbarNotice from "./components/shared/SnackbarNotice";
import HeroHome from "./homepage/sections/Hero/HeroHome";
import TopperSection from "./homepage/sections/Toppers/TopperSection";
import AchievementsSection from "./homepage/sections/Achievements/AchievementsSection";
import ParentsSection from "./homepage/sections/Parents/ParentsSection";
import YouTubeSection from "./homepage/sections/Youtube/YouTubeSection";
import CardCoursesSection from "./homepage/sections/CardCourses/CardCoursesSection";
import AudiowhatsappSection from "./homepage/sections/Audio&Whatsapp/AudiowhatsappSection";
import FaqsSection from "./homepage/sections/Faqs/FaqsSection";
import TeamSection from "./homepage/sections/Team/TeamSection";
import AdvantagesSection from "./homepage/sections/Advantages/AdvantagesSection";
import HeroWaves from "./homepage/sections/Hero/HeroWaves";
import Footer from "./components/shared/Footer/footer";

export default function Home() {
  return (
    <div>
      <TopNavBar />
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
  );
}
