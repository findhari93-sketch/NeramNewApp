"use client";
import React from "react";
import ApplicationForm from "./components/ApplicationForm";
import TopNavBar from "../components/shared/TopNavBar";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";

export default function Page() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(() => setAuthChecked(true));
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
    <div>
      <TopNavBar backgroundMode="gradient" />
      <ApplicationForm />
    </div>
  );
}
