"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import TopNavBar from "../../components/shared/TopNavBar";
import { forgotPasswordSchema } from "../../../lib/auth/validation";
import { sendPasswordReset } from "../../../lib/auth/firebaseAuth";
import { friendlyFirebaseError } from "../../../lib/firebaseErrorMessages";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams?.get("email")?.trim() ?? "", [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const parsed = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(parsed.data.email);
      const message = `If ${parsed.data.email} is registered, we've sent a password reset link. Please check your inbox and spam folder.`;
      setSuccess(message);
      setSnackOpen(true);
    } catch (err) {
      setError(friendlyFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavBar backgroundMode="transparent" />
      <Box
        sx={(theme) => ({
          backgroundImage: theme.gradients.brand(),
          minHeight: { xs: "100dvh", sm: "100vh" },
          display: "flex",
          justifyContent: "center",
          alignItems: { xs: "flex-start", sm: "center" },
          p: { xs: 2, sm: 4 },
        })}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: { xs: "100%", sm: 420 },
            bgcolor: "background.paper",
            boxShadow: { xs: 3, sm: 6 },
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Reset your password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the email associated with your account and we will send you instructions to reset your password.
          </Typography>
          <TextField
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
            autoComplete="email"
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ py: 1.25 }}
          >
            {loading ? <CircularProgress size={20} /> : "Send reset link"}
          </Button>
          <Button
            variant="text"
            onClick={() => {
              const qp = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
              router.push(`/auth/login${qp}`);
            }}
          >
            Back to login
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          Password reset email sent
        </MuiAlert>
      </Snackbar>
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
