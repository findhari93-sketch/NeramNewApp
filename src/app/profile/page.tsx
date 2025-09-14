"use client";
import React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import TopNavBar from "../components/shared/TopNavBar";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";

export default function ProfilePage() {
  // All hooks must be inside the function and before any return
  const [user, setUser] = React.useState<Record<string, unknown> | null>(null);
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [studentName, setStudentName] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState<string | null>(null);
  const [requireNameSnackOpen, setRequireNameSnackOpen] = React.useState(false);

  React.useEffect(() => {
    // First try a synchronous currentUser read (safe only on client)
    const current = auth.currentUser;
    if (current) {
      setUser(current as unknown as Record<string, unknown>);
      setAuthChecked(true);
    }

    // Listen for auth changes
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setAuthChecked(true);
        return;
      }
      const asObj = u as unknown as Record<string, unknown>;
      setUser(asObj);
      setAuthChecked(true);
    });

    try {
      const pv = localStorage.getItem("phone_verified");
      if (pv && !user) setUser((prev) => prev || { phoneNumber: pv });
    } catch {}

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    // when user or derived name changes, preload the input
    const name =
      typeof user?.displayName === "string"
        ? (user!.displayName as string)
        : typeof user?.email === "string"
        ? (user!.email as string)
        : typeof user?.phoneNumber === "string"
        ? (user!.phoneNumber as string)
        : "";
    setStudentName(typeof name === "string" ? name : "");
  }, [user]);

  // Save Google user details to Supabase on Google login
  React.useEffect(() => {
    if (!user || !authChecked) return;
    // Check if Google provider is present
    const providerData = user.providerData as
      | Array<{ providerId: string }>
      | undefined;
    const isGoogle =
      providerData && providerData.some((p) => p.providerId === "google.com");
    if (!isGoogle) return;

    // Prepare payload
    const payload = {
      uid: (user as any).uid,
      email: (user as any).email,
      displayName: (user as any).displayName,
      phone: (user as any).phoneNumber,
      profile: { photoURL: (user as any).photoURL },
      provider: "google.com",
    };
    // Save to Supabase
    apiClient("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((e) => console.warn("Google user upsert failed", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authChecked, apiClient]);

  if (authChecked && !user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" color="error" gutterBottom>
            401 Unauthorized
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            User not logged in. Please log in to access your profile.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("signOut error", e);
    }
    try {
      localStorage.removeItem("phone_verified");
    } catch {}
    router.push("/");
  };

  const name =
    typeof user?.displayName === "string"
      ? (user!.displayName as string)
      : typeof user?.email === "string"
      ? (user!.email as string)
      : typeof user?.phoneNumber === "string"
      ? (user!.phoneNumber as string)
      : null;

  const photo =
    typeof user?.photoURL === "string" ? (user!.photoURL as string) : null;

  // student name editing state (declared after derived `name`/`photo`)
  // ...existing code...

  // ...existing code...

  const saveStudentName = async () => {
    // client-side validation: not empty and no digits
    const trimmed = (studentName || "").trim();
    if (!trimmed) {
      setSnackMsg("Name cannot be empty");
      setSnackOpen(true);
      return;
    }
    if (/\d/.test(trimmed)) {
      setSnackMsg("Name must not contain numbers");
      setSnackOpen(true);
      return;
    }
    if (!auth.currentUser) {
      setSnackMsg("No authenticated user");
      setSnackOpen(true);
      return;
    }

    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
      // update local user object for immediate UI feedback
      setUser((prev) => {
        const copy = (prev && { ...(prev as Record<string, unknown>) }) || {};
        copy.displayName = trimmed;
        return copy as Record<string, unknown>;
      });
      // also update the application draft in localStorage so forms stay in sync
      try {
        const raw = localStorage.getItem("neram_application_draft_v1");
        const draft = raw ? JSON.parse(raw) : {};
        draft.form = draft.form || {};
        draft.form.studentName = trimmed;
        localStorage.setItem(
          "neram_application_draft_v1",
          JSON.stringify(draft)
        );
        // persist to Supabase user table via API route
        try {
          const payload = {
            uid: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            phone: auth.currentUser?.phoneNumber,
            displayName: trimmed,
            profile: { photoURL: auth.currentUser?.photoURL },
          };
          apiClient("/api/users/upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).catch((e) => console.warn("upsert user failed", e));
        } catch {}
      } catch {}
      setSnackMsg("Saved");
      setSnackOpen(true);
      // Close the persistent prompt since name has been provided
      setRequireNameSnackOpen(false);
      // redirect to home after successful save
      router.push("/");
    } catch (err) {
      console.error("saveStudentName error", err);
      setSnackMsg("Failed to save");
      setSnackOpen(true);
    } finally {
      setSaving(false);
    }
  };

  // safe derived fields to avoid `any` casts in JSX
  const uid = typeof user?.uid === "string" ? (user!.uid as string) : null;
  const emailVerified =
    typeof user?.emailVerified === "boolean"
      ? ((user as Record<string, unknown>).emailVerified as boolean)
      : null;
  const metadataCandidate = user?.metadata;
  const metadata =
    typeof metadataCandidate === "object" && metadataCandidate
      ? (metadataCandidate as Record<string, unknown>)
      : null;
  const createdAt =
    metadata && typeof metadata["creationTime"] === "string"
      ? (metadata["creationTime"] as string)
      : null;
  const lastSignIn =
    metadata && typeof metadata["lastSignInTime"] === "string"
      ? (metadata["lastSignInTime"] as string)
      : null;
  const providerDataCandidate = user?.providerData;
  const providerIds = Array.isArray(providerDataCandidate)
    ? (providerDataCandidate as Array<Record<string, unknown>>)
        .map((p) =>
          typeof p?.providerId === "string" ? (p.providerId as string) : ""
        )
        .filter(Boolean)
    : [];

  // LinkedIn fields removed

  if (!authChecked) {
    return (
      <>
        <TopNavBar backgroundMode="gradient" />
        <Container
          maxWidth="sm"
          sx={{ mt: 6, display: "flex", justifyContent: "center" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 240,
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <TopNavBar backgroundMode="gradient" />
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4 }} elevation={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={photo ?? undefined} sx={{ width: 72, height: 72 }}>
              {!photo && name ? name.charAt(0).toUpperCase() : null}
            </Avatar>
            <Box>
              <Typography variant="h6">{name || "Your account"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Visitor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {typeof user?.email === "string" ? (user!.email as string) : ""}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {typeof user?.phoneNumber === "string"
                  ? (user!.phoneNumber as string)
                  : ""}
              </Typography>
            </Box>
          </Box>

          {/* Student name edit */}
          <Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              onClick={saveStudentName}
              disabled={saving}
            >
              Save
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <List>
            <ListItem>
              <ListItemText primary="UID" secondary={uid ?? "—"} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Email verified"
                secondary={emailVerified !== null ? String(emailVerified) : "—"}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Created" secondary={createdAt ?? "—"} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Last sign-in"
                secondary={lastSignIn ?? "—"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Providers"
                secondary={
                  providerIds.length > 0 ? providerIds.join(", ") : "—"
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Local label"
                secondary={
                  typeof user?.phoneNumber === "string"
                    ? (user!.phoneNumber as string)
                    : "—"
                }
              />
            </ListItem>
            {/* LinkedIn session details removed */}
          </List>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => router.push("/")}>
              Back
            </Button>
            {/* LinkedIn connection chip removed */}
            <Button color="error" variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <Alert severity={snackMsg === "Saved" ? "success" : "error"}>
          {snackMsg ?? ""}
        </Alert>
      </Snackbar>
      {/* Persistent prompt until user provides a non-number name */}
      <Snackbar
        open={requireNameSnackOpen}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Alert severity="info" sx={{ width: "100%" }}>
          You are successfully logged in, please enter student name to store in
          the profile instead of number
        </Alert>
      </Snackbar>
    </>
  );
}
