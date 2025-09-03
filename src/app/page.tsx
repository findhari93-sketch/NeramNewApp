import Button from "@mui/material/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Neram App!</h1>
      <Link href="/applicationform">
        <Button variant="contained" color="primary">
          Go to Application Form
        </Button>
      </Link>
    </div>
  );
}
