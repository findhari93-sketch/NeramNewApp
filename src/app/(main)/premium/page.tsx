"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import SafeSearchParams from "@/components/SafeSearchParams";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  getProductSchema,
  getBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/schema";
import apiFetch from "@/lib/apiClient";
import Footer from "../../components/shared/Footer/footer";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";

function PremiumContent({
  searchParams,
  router,
}: {
  searchParams: any;
  router: any;
}) {
  const token = searchParams?.get("token") || null;
  const [validating, setValidating] = React.useState(!!token);
  const [tokenValid, setTokenValid] = React.useState(false);
  const [authChecking, setAuthChecking] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authChecking && !isLoggedIn) {
      router.push("/auth/login?next=/premium");
    }
  }, [authChecking, isLoggedIn, router]);

  React.useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }

    (async () => {
      try {
        const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
        const data = JSON.parse(jsonStr);

        if (data.expiresAt && Date.now() < data.expiresAt) {
          setTokenValid(true);
        }
      } catch {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    })();
  }, [token]);

  if (authChecking || validating) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>{authChecking ? "Verifying login..." : "Verifying..."}</Typography>
      </Box>
    );
  }

  // Additional check: if not logged in, don't render content
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 650,
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          borderRadius: 3,
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Success Animation Circle */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            bgcolor: "success.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
            boxShadow: "0 8px 24px rgba(76, 175, 80, 0.3)",
            animation: "scaleIn 0.5s ease-out",
            "@keyframes scaleIn": {
              "0%": { transform: "scale(0)" },
              "50%": { transform: "scale(1.1)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "white" }} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            mb: 2,
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Payment Successful!
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Thank you for your payment.
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: "success.main", fontWeight: 600 }}
        >
          Your account has been upgraded to premium.
        </Typography>

        {tokenValid && (
          <Paper
            elevation={0}
            sx={{
              bgcolor: "success.50",
              p: 2,
              mb: 4,
              border: "1px solid",
              borderColor: "success.200",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              color="success.dark"
              sx={{ fontWeight: 500 }}
            >
              ✨ You now have access to all premium features, study materials,
              and live classes!
            </Typography>
          </Paper>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/premium/welcome")}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            }}
          >
            Get Started →
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/applications")}
            sx={{ py: 1.5, px: 4 }}
          >
            View My Application
          </Button>
        </Box>

        <Button
          variant="text"
          size="small"
          onClick={async () => {
            try {
              const res = await apiFetch("/api/payments/invoice");
              if (!res.ok) throw new Error("Failed to download invoice");
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Invoice_${Date.now()}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (e) {
              console.error("Invoice download failed:", e);
              alert("Failed to download invoice. Please try again.");
            }
          }}
          sx={{
            textTransform: "none",
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          📄 Download Invoice
        </Button>

        <Box
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            gutterBottom
          >
            Next Steps:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check your email for account credentials and class schedule
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default function PremiumPage() {
  const router = useRouter();
  const productSchema = getProductSchema({
    name: "Neram Classes Premium Subscription",
    description:
      "Get access to all premium features, courses, and study materials for architecture entrance exam preparation",
    price: "999",
    currency: "INR",
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Premium", url: "/premium" },
  ]);

  return (
    <>
      {/* Schema Markup for Premium Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(productSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
      />
      <SafeSearchParams>
        {(searchParams) => (
          <PremiumContent searchParams={searchParams} router={router} />
        )}
      </SafeSearchParams>

      {/* Footer Section */}
      <Box sx={{ position: "relative" }}>
        <HeroWaves position="top" bgcolor="#fff" />
        <Footer />
      </Box>
    </>
  );
}
