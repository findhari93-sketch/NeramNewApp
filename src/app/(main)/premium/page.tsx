"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

  if (validating) {
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
        <Typography>Verifying...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Paper sx={{ maxWidth: 600, p: 4, textAlign: "center" }}>
        <CheckCircleOutlineIcon
          sx={{ fontSize: 80, color: "success.main", mb: 2 }}
        />
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Thank you for your payment. Your account has been upgraded to premium.
        </Typography>
        {tokenValid && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You now have access to all premium features and courses.
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button variant="contained" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/applicationform")}
          >
            View My Application
          </Button>
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
