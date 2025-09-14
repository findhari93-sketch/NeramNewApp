import TopNavBar from "./components/shared/TopNavBar";
import SnackbarNotice from "./components/shared/SnackbarNotice";
import HeroHome from "./homepage/sections/HeroHome";

export default function Home() {
  return (
    <div>
      <TopNavBar />
      <SnackbarNotice />
      <HeroHome />
    </div>
  );
}
