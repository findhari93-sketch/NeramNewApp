"use client";
// app/(main)/applications/page.tsx
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import apiClient from "../../../lib/apiClient";
import { getAuth } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import GridOrig from "@mui/material/Grid";
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

// Alias Grid to match other files' Grid2-style sizing usage
const Grid: any = GridOrig;

function ApplicationsPageContent() {
  const [apps, setApps] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  // Whether we were redirected after submitting an application
  const [submittedBanner, setSubmittedBanner] = useState(
    Boolean(searchParams?.get("submitted") === "1")
  );

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          // redirect to login with message
          router.replace(
            `/auth/login?message=${encodeURIComponent(
              "you must login to visit this page"
            )}`
          );
          return;
        }

        // If user just submitted, wait a bit for database to commit
        if (searchParams?.get("submitted") === "1") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const res = await apiClient("/api/applications");
        const json = await res.json().catch(() => []);
        if (mounted) setApps(json || []);
      } catch {
        if (mounted) setApps([]);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  // Loading state
  if (checkingAuth)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );

  // Helper: status chips (application status)
  const getStatusChip = (status: string) => {
    const normalized = String(status || "pending").toLowerCase();
    if (normalized.includes("approve") || normalized.includes("accept")) {
      return {
        color: "success" as const,
        icon: <CheckCircleIcon fontSize="small" />,
      };
    }
    if (normalized.includes("reject") || normalized.includes("decline")) {
      return { color: "error" as const, icon: <ErrorIcon fontSize="small" /> };
    }
    return {
      color: "warning" as const,
      icon: <PendingIcon fontSize="small" />,
    };
  };

  // Helper: payment chips
  const getPaymentChip = (status: string) => {
    const normalized = String(status || "pending").toLowerCase();
    if (normalized.includes("paid") || normalized.includes("complete")) {
      return {
        color: "success" as const,
        icon: <CheckCircleIcon fontSize="small" />,
      };
    }
    if (normalized.includes("fail") || normalized.includes("cancel")) {
      return { color: "error" as const, icon: <ErrorIcon fontSize="small" /> };
    }
    return {
      color: "default" as const,
      icon: <PaymentIcon fontSize="small" />,
    };
  };

  // Helper: create payment handler
  const createPayment = async (appId: string) => {
    try {
      if (!appId) return;
      // GET request - fetches admin-generated token from database
      const res = await fetch(`/api/applications/${appId}/payment-token`);

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Payment token fetch failed:", json);
        alert(
          json?.hint ||
            json?.error ||
            "Unable to start payment. Please contact support."
        );
        return;
      }

      const json = await res.json();

      if (json?.payUrl) {
        window.location.href = json.payUrl;
        return;
      }

      if (json?.token) {
        const origin = window.location.origin.replace(/\/$/, "");
        window.location.href = `${origin}/pay?v=${json.token}&type=razorpay`;
        return;
      }

      console.error("No payment URL or token in response", json);
      alert("Payment link not available. Please contact admin.");
    } catch (err) {
      console.error("Failed to start payment", err);
      alert("Error starting payment. Please try again or contact support.");
    }
  };

  // Empty state
  if (!apps || apps.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Submitted Applications
        </Typography>
        {submittedBanner && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSubmittedBanner(false)}
          >
            Application submitted successfully!
          </Alert>
        )}
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No applications yet
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Start a new application to see it listed here once submitted.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link as any}
              href="/applicationform"
              endIcon={<ArrowForwardIcon />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Start Application
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {submittedBanner && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSubmittedBanner(false)}
        >
          Application submitted successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {apps.map((app) => {
          const studentName =
            app?.data?.studentName ??
            app?.data?.student_name ??
            app?.profile?.student_name ??
            "(no name)";
          const statusChip = getStatusChip(app?.status);
          const paymentChip = getPaymentChip(app?.payment_status);
          const submittedAt = app?.submitted_at
            ? new Date(app.submitted_at).toLocaleString()
            : "-";
          const course =
            app?.data?.selectedCourse ?? app?.data?.selected_course ?? "—";

          // Check if application is approved
          const normalized = String(app.status || "pending").toLowerCase();
          const isApproved =
            normalized.includes("approve") || normalized.includes("accept");

          return (
            <Grid key={app.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardActionArea
                  component={Link as any}
                  href={`/applications/${app.id}`}
                  sx={{ p: 2, flexGrow: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {studentName}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}
                  >
                    <Chip
                      label={`Status: ${app.status || "Pending"}`}
                      color={statusChip.color}
                      icon={statusChip.icon}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Payment: ${app.payment_status || "Pending"}`}
                      color={paymentChip.color}
                      icon={paymentChip.icon}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Submitted:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {submittedAt}
                      </Box>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Course:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {String(course)}
                      </Box>
                    </Typography>
                  </Box>
                </CardActionArea>
                <CardActions
                  sx={{
                    justifyContent: "flex-end",
                    px: 2,
                    pb: 2,
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Tooltip
                    title={
                      isApproved
                        ? "Proceed to payment"
                        : "Approval pending. Payment will be enabled once admin approves."
                    }
                  >
                    <span>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<PaymentIcon />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          createPayment(app.id);
                        }}
                        disabled={!isApproved}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Complete Payment
                      </Button>
                    </span>
                  </Tooltip>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component={Link as any}
                    href={`/applications/${app.id}`}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      }
    >
      <ApplicationsPageContent />
    </Suspense>
  );
}
