"use client";
import React from "react";
import TopNavBar from "../components/shared/TopNavBar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function ApplicationPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(() => {
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (authChecked && !auth.currentUser) {
      try {
        const next = encodeURIComponent(window.location.pathname);
        router.replace(`/auth/login?notice=login_required&next=${next}`);
      } catch {
        router.replace(`/auth/login?notice=login_required`);
      }
    }
  }, [authChecked, router]);

  if (authChecked && !auth.currentUser) {
    return (
      <Container sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }
  return (
    <>
      <TopNavBar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Application</Typography>
        <Typography>Placeholder for the application page.</Typography>
      </Container>
    </>
  );
}
