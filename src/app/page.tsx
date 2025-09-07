import Button from "@mui/material/Button";
import Link from "next/link";
import TopNavBar from "./components/shared/TopNavBar";
import SnackbarNotice from "./components/shared/SnackbarNotice";

export default function Home() {
  return (
    <div>
      <TopNavBar />
      <SnackbarNotice />
      <div style={{ padding: 24 }}>
        <h1>Welcome to Neram App!</h1>
        <Link href="/applicationform">
          <Button variant="contained" color="primary">
            Go to Application Form
          </Button>
        </Link>
      </div>
    </div>
  );
}
