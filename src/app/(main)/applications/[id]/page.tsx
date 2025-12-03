"use client";
// app/(main)/applications/[id]/page.tsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import apiFetch from "@/lib/apiClient";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Tooltip,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
const MUIGrid: any = Grid;
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
  CalendarMonth as CalendarMonthIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AssignmentTurnedIn as AssignmentIcon,
} from "@mui/icons-material";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ApplicationDetail({ params }: Props) {
  const [app, setApp] = useState<any>(null);
  const [id, setId] = useState<string>("");
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Unwrap params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          router.replace(
            `/auth/login?message=${encodeURIComponent(
              "you must login to visit this page"
            )}`
          );
          return;
        }

        const res = await fetch(`/api/applications/${id}`);
        const json = await res.json().catch(() => null);
        if (mounted) setApp(json);
      } catch {
        if (mounted) setApp(null);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, router]);

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

  if (!app)
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

  async function createPayment() {
    try {
      if (!id) return;
      // GET request - fetches admin-generated token from database (no auth required)
      const res = await fetch(`/api/applications/${id}/payment-token`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Payment token fetch failed:", json);
        alert(
          json?.hint ||
            json?.error ||
            "Unable to start payment. Please contact support."
        );
        return;
      }

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
  }

  const appData = app.data && typeof app.data === "object" ? app.data : {};

  const readValue = (obj: Record<string, any>, path: string) => {
    if (!path) return null;
    if (path.includes(".")) {
      return path.split(".").reduce<any>((acc, key) => {
        if (acc && typeof acc === "object") return acc[key];
        return undefined;
      }, obj);
    }
    return obj[path];
  };

  const resolveField = (keys: string[]) => {
    for (const key of keys) {
      const value = readValue(appData, key);
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return null;
  };

  const SECTION_CONFIG: Array<{
    title: string;
    icon: React.ReactNode;
    fields: Array<{
      label: string;
      keys: string[];
      format?: (val: any) => string;
    }>;
  }> = [
    {
      title: "Applicant Snapshot",
      icon: <PersonIcon fontSize="small" />,
      fields: [
        { label: "Student Name", keys: ["student_name", "studentName"] },
        { label: "Email", keys: ["email", "contact.email"] },
        { label: "Phone", keys: ["phone", "contact.phone"] },
        { label: "City", keys: ["city", "contact.city"] },
        { label: "State", keys: ["state", "contact.state"] },
        {
          label: "Date of Birth",
          keys: ["dob", "dateOfBirth"],
          format: (val) => new Date(val).toLocaleDateString("en-IN"),
        },
      ],
    },
    {
      title: "Course Preferences",
      icon: <AssignmentIcon fontSize="small" />,
      fields: [
        {
          label: "Selected Course",
          keys: ["selected_course", "selectedCourse", "course"],
        },
        { label: "Program", keys: ["program"] },
        { label: "Batch", keys: ["batch"] },
        {
          label: "Attempt Year",
          keys: ["nata_attempt_year", "nataAttemptYear"],
        },
        {
          label: "Software Course",
          keys: ["software_course", "softwareCourse"],
        },
      ],
    },
    {
      title: "Parent / Guardian",
      icon: <PhoneIcon fontSize="small" />,
      fields: [
        { label: "Father Name", keys: ["father_name", "fatherName"] },
        {
          label: "Guardian Contact",
          keys: ["alternate_phone", "altPhone", "guardian_phone"],
        },
        {
          label: "Instagram Handle",
          keys: ["instagram_handle", "instagramId"],
        },
      ],
    },
    {
      title: "Education Details",
      icon: <SchoolIcon fontSize="small" />,
      fields: [
        { label: "Education Type", keys: ["education_type", "educationType"] },
        {
          label: "School / College",
          keys: ["school_name", "college_name", "school", "college"],
        },
        { label: "Board", keys: ["board"] },
        { label: "Year", keys: ["board_year", "college_year", "school_year"] },
        { label: "Diploma", keys: ["diploma_course", "diplomaCourse"] },
      ],
    },
  ];

  const sectionBlocks = SECTION_CONFIG.map((section) => {
    const resolvedFields = section.fields
      .map((field) => {
        const value = resolveField(field.keys);
        if (!value) return null;
        return {
          label: field.label,
          value: field.format ? field.format(value) : value,
        };
      })
      .filter(Boolean) as Array<{ label: string; value: React.ReactNode }>;

    return resolvedFields.length > 0
      ? { ...section, fields: resolvedFields }
      : null;
  }).filter(Boolean) as Array<{
    title: string;
    icon: React.ReactNode;
    fields: Array<{ label: string; value: React.ReactNode }>;
  }>;

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

  const statusChip = getStatusChip(app.status);
  const paymentChip = getPaymentChip(app.payment_status);

  const applicationNumber =
    app?.application_no ??
    app?.applicationNumber ??
    app?.application_id ??
    app?.id ??
    "#";

  // Check if application is approved
  const normalized = String(app.status || "pending").toLowerCase();
  const isApproved =
    normalized.includes("approve") || normalized.includes("accept");

  // Check if payment is completed
  const paymentStatus = String(app.payment_status || "").toLowerCase();
  const isPaid =
    paymentStatus === "paid" ||
    paymentStatus === "completed" ||
    paymentStatus === "success";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Card
          sx={{
            background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
            color: "#fff",
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                  Application Number
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {applicationNumber}
                </Typography>
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  <Chip
                    label={`Status: ${app.status || "Pending"}`}
                    color={statusChip.color}
                    icon={statusChip.icon}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                  <Chip
                    label={`Payment: ${app.payment_status || "Pending"}`}
                    color={paymentChip.color}
                    icon={paymentChip.icon}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </Stack>
              </Box>
              <Stack direction="row" spacing={3}>
                {[
                  {
                    label: "Submitted",
                    value: app.created_at || app.submitted_at || app.createdAt,
                    icon: <CalendarMonthIcon fontSize="small" />,
                  },
                  {
                    label: "Approval",
                    value: app.approved_at || app.approvedAt,
                    icon: <CheckCircleIcon fontSize="small" />,
                  },
                ].map((stat) => (
                  <Box key={stat.label} textAlign="right">
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {stat.label}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {stat.icon}
                      <Typography sx={{ fontWeight: 600 }}>
                        {stat.value
                          ? new Date(stat.value).toLocaleDateString("en-IN")
                          : "—"}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <MUIGrid container spacing={2}>
          {sectionBlocks.length === 0 && (
            <MUIGrid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary">
                    We couldn’t find structured data for this application.
                  </Typography>
                </CardContent>
              </Card>
            </MUIGrid>
          )}
          {sectionBlocks.map((section) => (
            <MUIGrid size={{ xs: 12, md: 6 }} key={section.title}>
              <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.light",
                        width: 32,
                        height: 32,
                        color: "primary.dark",
                      }}
                    >
                      {section.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {section.fields.map((field) => (
                      <Box key={field.label}>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", letterSpacing: 0.4 }}
                        >
                          {field.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {field.value || "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </MUIGrid>
          ))}
        </MUIGrid>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            mt: 4,
            gap: 1,
          }}
        >
          {isPaid ? (
            <Box sx={{ textAlign: "right" }}>
              <Chip
                label="Payment Completed ✓"
                color="success"
                icon={<CheckCircleIcon />}
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  px: 2,
                  py: 1.5,
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" paragraph>
                Your payment has been successfully processed.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push("/premium/welcome")}
                >
                  View Premium Access
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={async () => {
                    try {
                      const res = await apiFetch('/api/payments/invoice');
                      if (!res.ok) throw new Error('Failed to download invoice');
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Invoice_${Date.now()}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (e) {
                      console.error('Invoice download failed:', e);
                      alert('Failed to download invoice. Please try again.');
                    }
                  }}
                >
                  Download Invoice
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Tooltip
                title={
                  isApproved
                    ? "Proceed to Razorpay secure checkout"
                    : "Approval pending. Payment will be enabled once admin approves."
                }
              >
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={createPayment}
                    disabled={!isApproved}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: isApproved ? 2 : 0,
                      "&:hover": {
                        boxShadow: isApproved ? 4 : 0,
                      },
                    }}
                  >
                    Complete Payment
                  </Button>
                </span>
              </Tooltip>
              {!isApproved && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", textAlign: "right" }}
                >
                  Wait for admin approval or contact 9176137043 for reminder
                </Typography>
              )}
            </>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
