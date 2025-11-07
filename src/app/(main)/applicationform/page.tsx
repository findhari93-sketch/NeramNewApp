"use client";
import React, { Suspense } from "react";
import ApplicationForm from "./components/ApplicationForm";
import { auth } from "../../../lib/firebase";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

function ApplicationFormPageInner() {
  const router = useRouter();
  const [authState, setAuthState] = React.useState<{
    checked: boolean;
    user: User | null;
  }>({
    checked: false,
    user: null,
  });

  // Use the user argument from onAuthStateChanged to react immediately
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({ checked: true, user });

      // Redirect immediately if no user, avoiding separate effect
      if (!user) {
        try {
          const next = encodeURIComponent(window.location.pathname);
          router.replace(`/auth/login?notice=login_required&next=${next}`);
        } catch {
          router.replace(`/auth/login?notice=login_required`);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Show spinner during auth check or redirect
  if (!authState.checked || !authState.user) {
    return (
      <Container sx={{ textAlign: "center" }}>
        <CircularProgress />
        {authState.checked && !authState.user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Redirecting to login...
          </Typography>
        )}
      </Container>
    );
  }

  return <ApplicationForm />;
}

export default function Page() {
  // Wrap in Suspense with proper fallback for hooks like useSearchParams
  return (
    <Suspense
      fallback={
        <Container sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <ApplicationFormPageInner />
    </Suspense>
  );
}
