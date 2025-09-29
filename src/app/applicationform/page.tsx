"use client";
import React, { Suspense } from "react";
import ApplicationForm from "./components/ApplicationForm";
import TopNavBar from "../components/shared/TopNavBar";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";

function ApplicationFormPageInner() {
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
      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          visible: true,
          title: "Application Form",
          autoBreadcrumbs: true,
          segmentLabelMap: {
            applicationform: "Application Form",
            auth: "Auth",
            profile: "Profile",
          },
          showBreadcrumbs: true,
          actions: [],
          showBackButton: true,
          onBack: () => router.back(),
        }}
      />
      <ApplicationForm />
    </div>
  );
}

export default function Page() {
  // Wrap in Suspense so hooks like useSearchParams in children can bail out safely
  return (
    <Suspense fallback={null}>
      <ApplicationFormPageInner />
    </Suspense>
  );
}
