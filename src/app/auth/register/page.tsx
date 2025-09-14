"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import Divider from "@mui/material/Divider";
import PhoneAuth from "../../components/shared/PhoneAuth";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import {
  linkEmailPasswordSchema,
  usernameSchema,
} from "../../../lib/auth/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    studentName: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const ep = linkEmailPasswordSchema.safeParse({
        email: form.email,
        password: form.password,
      });
      if (!ep.success)
        throw new Error(ep.error.issues[0]?.message || "Invalid input");
      if (form.username) {
        const un = usernameSchema.safeParse(form.username);
        if (!un.success)
          throw new Error(un.error.issues[0]?.message || "Invalid username");
      }

      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Optionally set displayName with studentName
      if (form.studentName.trim()) {
        await updateProfile(cred.user, {
          displayName: form.studentName.trim(),
        });
      }

      // Seed DB via upsert (include username and student_name if present)
      try {
        const idToken = await cred.user.getIdToken();
        await fetch("/api/users/upsert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            student_name: form.studentName.trim() || undefined,
            username: form.username.trim() || undefined,
          }),
        });
      } catch (e) {
        console.warn("user upsert after register failed", e);
      }

      // Send email verification
      try {
        const actionCodeSettings = {
          url: `${
            window.location.origin
          }/auth/action?email=${encodeURIComponent(form.email)}`,
          handleCodeInApp: true,
        } as const;
        await sendEmailVerification(cred.user, actionCodeSettings);
      } catch (e) {
        console.warn("sendEmailVerification failed", e);
      }
      // Keep user signed in; login page will not auto-redirect until verified
      router.replace(
        `/auth/login?notice=verify_email_sent&email=${encodeURIComponent(
          form.email
        )}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Create your account
      </Typography>
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Full Name (optional)"
          value={form.studentName}
          onChange={(e) =>
            setForm((p) => ({ ...p, studentName: e.target.value }))
          }
          fullWidth
        />
        <TextField
          label="Username (optional)"
          helperText="Lowercase letters, numbers, underscores, dots"
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          {loading ? <CircularProgress size={20} /> : "Sign Up"}
        </Button>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          We’ll email you a verification link to activate your account. Didn’t
          get it? You can resend from the Account page after signing in with
          your method.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}

        <Divider sx={{ my: 2 }}>OR</Divider>
        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center" }}>
          Sign up with phone
        </Typography>
        <PhoneAuth
          onVerified={() => {
            // After phone verification, go to profile setup
            try {
              localStorage.setItem("phone_verified", "1");
            } catch {}
            router.replace("/profile");
          }}
        />
        <Button
          variant="text"
          size="small"
          onClick={() => router.push("/auth/login")}
          sx={{ alignSelf: "center" }}
        >
          Already have an account? Sign in
        </Button>
      </Box>
    </Box>
  );
}
