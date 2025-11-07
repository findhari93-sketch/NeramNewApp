"use client";
// app/(main)/applications/[id]/page.tsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
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
  Grid as MUIGrid,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
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
      const res = await fetch(`/api/applications/${id}/payment`, {
        method: "POST",
      });
      const payload = await res.json();
      if (payload?.payment_url) window.location.href = payload.payment_url;
    } catch (err) {
      console.error("Failed to create payment", err);
    }
  }

  const categorizeData = (data: Record<string, any>) => {
    const sections: Record<string, Array<[string, any]>> = {
      "Personal Information": [],
      "Course Details": [],
      "Contact Information": [],
      "Address Details": [],
      "Education Details": [],
      "Other Details": [],
    };

    const personalKeys = [
      "studentName",
      "student_name",
      "fatherName",
      "father_name",
      "gender",
      "dob",
      "dateOfBirth",
      "age",
    ];
    const courseKeys = [
      "course",
      "selectedCourse",
      "selected_course",
      "softwareCourse",
      "software_course",
      "batch",
      "program",
    ];
    const contactKeys = [
      "email",
      "phone",
      "mobile",
      "altPhone",
      "alt_phone",
      "instagram",
      "instagramId",
      "instagram_handle",
    ];
    const addressKeys = [
      "address",
      "city",
      "state",
      "country",
      "zipCode",
      "zip_code",
      "pincode",
    ];
    const educationKeys = [
      "school",
      "schoolName",
      "school_name",
      "college",
      "collegeName",
      "college_name",
      "collegeYear",
      "college_year",
      "diploma",
      "diplomaCourse",
      "diploma_course",
      "diplomaYear",
      "diploma_year",
      "diplomaCollege",
      "diploma_college",
      "board",
      "boardYear",
      "board_year",
      "educationType",
      "education_type",
      "classGrade",
      "class_grade",
      "standard",
      "schoolStd",
      "school_std",
      "otherDescription",
      "other_description",
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      let placed = false;

      if (
        personalKeys.some((pk) => lowerKey.includes(pk.toLowerCase())) ||
        lowerKey.includes("name")
      ) {
        sections["Personal Information"].push([key, value]);
        placed = true;
      } else if (courseKeys.some((ck) => lowerKey.includes(ck.toLowerCase()))) {
        sections["Course Details"].push([key, value]);
        placed = true;
      } else if (
        contactKeys.some((ck) => lowerKey.includes(ck.toLowerCase())) ||
        lowerKey.includes("email") ||
        lowerKey.includes("phone")
      ) {
        sections["Contact Information"].push([key, value]);
        placed = true;
      } else if (
        addressKeys.some((ak) => lowerKey.includes(ak.toLowerCase())) ||
        lowerKey.includes("address") ||
        lowerKey.includes("city") ||
        lowerKey.includes("state")
      ) {
        sections["Address Details"].push([key, value]);
        placed = true;
      } else if (
        educationKeys.some((ek) => lowerKey.includes(ek.toLowerCase())) ||
        lowerKey.includes("school") ||
        lowerKey.includes("college") ||
        lowerKey.includes("education")
      ) {
        sections["Education Details"].push([key, value]);
        placed = true;
      }

      if (!placed) {
        sections["Other Details"].push([key, value]);
      }
    }

    return Object.fromEntries(
      Object.entries(sections).filter(([, items]) => items.length > 0)
    );
  };

  const appData = app.data && typeof app.data === "object" ? app.data : {};
  const sections = categorizeData(appData);

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: "text.secondary", mb: 2, fontWeight: 600 }}
        >
          {`Application No: ${applicationNumber}`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={`Status: ${app.status || "Pending"}`}
            color={statusChip.color}
            icon={statusChip.icon}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            label={`Payment: ${app.payment_status || "Pending"}`}
            color={paymentChip.color}
            icon={paymentChip.icon}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <MUIGrid container spacing={3}>
        {Object.entries(sections).map(([sectionTitle, items]) => (
          <MUIGrid size={{ xs: 12, md: 6 }} key={sectionTitle}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "primary.main",
                    fontSize: "1.1rem",
                  }}
                >
                  {sectionTitle}
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {items.map(([key, value]) => (
                    <Box key={key}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          fontSize: "0.7rem",
                        }}
                      >
                        {key.replace(/_/g, " ")}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "text.primary", mt: 0.5 }}
                      >
                        {value !== null && value !== undefined
                          ? String(value)
                          : "—"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </MUIGrid>
        ))}
      </MUIGrid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PaymentIcon />}
          onClick={createPayment}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          Complete Payment
        </Button>
      </Box>
    </Container>
  );
}
