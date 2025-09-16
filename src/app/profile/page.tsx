"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import GridOrig from "@mui/material/Grid";
const Grid: any = GridOrig;
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import { Controller, useForm } from "react-hook-form";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import TopNavBar from "../components/shared/TopNavBar";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";
import ProfileCard from "./components/ProfileCard";
import ProfilePictureCard from "./components/ProfilePictureCard";

export default function ProfilePage() {
  // All hooks must be inside the function and before any return
  const [user, setUser] = React.useState<Record<string, unknown> | null>(() => {
    try {
      const cur =
        (auth && (auth.currentUser as unknown as Record<string, unknown>)) ||
        null;
      if (!cur) return null;
      const uid =
        typeof (cur as any).uid === "string" ? (cur as any).uid : null;
      if (!uid) return cur as Record<string, unknown>;
      const raw = localStorage.getItem(`avatar-cache:${uid}`);
      if (!raw) return cur as Record<string, unknown>;
      try {
        const parsed = JSON.parse(raw) as Record<string, any>;
        const photo = parsed.dataUrl || parsed.url || null;
        if (photo)
          return { ...(cur as Record<string, unknown>), photoURL: photo };
      } catch {
        return cur as Record<string, unknown>;
      }
      return cur as Record<string, unknown>;
    } catch {
      return null;
    }
  });
  // (Removed unused initialPhoto state; we now write a global cache key below when we save cache.)
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [studentName, setStudentName] = React.useState<string>("");
  // Keep a ref of the last derived name to avoid re-setting state when
  // the same value is produced repeatedly by effects that mutate `user`.
  const lastDerivedNameRef = React.useRef<string | null>(null);

  const deriveAndSetName = (u: Record<string, unknown> | null | undefined) => {
    const name =
      typeof u?.displayName === "string"
        ? (u!.displayName as string)
        : typeof u?.email === "string"
        ? (u!.email as string)
        : typeof u?.phoneNumber === "string"
        ? (u!.phoneNumber as string)
        : "";
    const next = typeof name === "string" ? name : "";
    if (lastDerivedNameRef.current === next) return;
    lastDerivedNameRef.current = next;
    setTimeout(() => setStudentName(next), 0);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_saving, setSaving] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState<string | null>(null);
  const [requireNameSnackOpen, setRequireNameSnackOpen] = React.useState(false);

  // Drawer/edit state + form (single shared drawer for page)
  const [drawer, setDrawer] = React.useState<{
    open: boolean;
    title?: string;
    fields?: Array<any>;
    values?: Record<string, any>;
    userId?: string | null;
  }>({ open: false });

  const [snack, setSnack] = React.useState<{
    open: boolean;
    message?: string;
    severity?: "success" | "error" | "info";
  }>({ open: false });

  const { control, handleSubmit, reset } = useForm<Record<string, any>>({
    defaultValues: {},
  });

  // Field schemas for drawer (examples)
  const profileFields = [
    {
      name: "student_name",
      label: "Student Name",
      type: "text",
      required: true,
    },
    { name: "bio", label: "Bio", type: "multiline" },
    { name: "dob", label: "Date of Birth", type: "date" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "interests", label: "Interests", type: "chips" },
  ];

  const accountFields = [
    { name: "username", label: "Username", type: "text", required: true },
  ];

  const contactFields = [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "zip_code", label: "Zip Code", type: "text" },
  ];

  const educationFields = [
    { name: "education_type", label: "Education Type", type: "text" },
    { name: "school_name", label: "School/College Name", type: "text" },
    { name: "board", label: "Board / Course", type: "text" },
    { name: "board_year", label: "Board Year", type: "text" },
    { name: "nata_attempt_year", label: "NATA attempt Year", type: "text" },
  ];

  const openEditDrawer = (params: {
    title: string;
    fields: any[];
    values?: Record<string, any>;
  }) => {
    setDrawer({
      open: true,
      title: params.title,
      fields: params.fields,
      values: params.values ?? {},
      userId: (user as any)?.uid ?? null,
    });
    reset(params.values ?? {});
  };

  const closeDrawer = () => {
    setDrawer({ open: false });
    reset({});
  };

  const updateUserFields = async (
    userId: string | null | undefined,
    changedFields: Record<string, any>
  ) => {
    if (!userId) throw new Error("No user id");
    const previous = { ...(user as any) };
    const optimistic = { ...(user as any), ...changedFields };
    setUser(optimistic);
    try {
      // Use your apiClient helper - replace endpoint if needed
      const res = await apiClient(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      });
      if (
        !res ||
        (res && (res.ok === false || (res.status && res.status >= 400)))
      ) {
        // best-effort rollback
        setUser(previous);
        const text = res?.statusText ?? "Failed to update";
        throw new Error(text);
      }
      const data = await (res.json ? res.json() : Promise.resolve(null));
      setUser((prev) => ({ ...(prev as any), ...(data ?? {}) }));
      return { ok: true, data };
    } catch (err: any) {
      setUser(previous);
      return { ok: false, error: err?.message ?? String(err) };
    }
  };

  const onUpload = async (file: File) => {
    // Replace with your upload handler (Supabase / S3) that returns { photoURL }
    // We send a FormData with the `file` field. Do NOT set Content-Type header here;
    // the browser will set the multipart boundary automatically.
    const form = new FormData();
    form.append("file", file);
    // Attach Firebase ID token as Authorization header — server requires it
    const headers: Record<string, string> = {};
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) headers["Authorization"] = `Bearer ${idToken}`;
      }
    } catch {
      /* ignore */
    }

    const res = await fetch("/api/upload/avatar", {
      method: "POST",
      body: form,
      headers,
    });

    // Helpful logging to diagnose server-side failures (status + body)
    let bodyText: string | null = null;
    try {
      bodyText = await res.text();
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      console.error("avatar upload failed", {
        status: res.status,
        body: bodyText,
      });
      // try to extract error message from JSON body if present
      try {
        const parsed = bodyText ? JSON.parse(bodyText) : null;
        throw new Error(
          parsed?.error ??
            parsed?.message ??
            bodyText ??
            `upload failed (${res.status})`
        );
      } catch {
        throw new Error(bodyText ?? `upload failed (${res.status})`);
      }
    }

    // success: parse JSON and, if a signedUrl was returned, return it as photoURL
    try {
      const parsed = JSON.parse(bodyText ?? "{}");
      if (parsed?.signedUrl) {
        try {
          const uid =
            (auth.currentUser && (auth.currentUser as any).uid) ||
            (user && (user as any).uid);
          if (uid) {
            const cache = {
              url: parsed.signedUrl,
              fetchedAt: Date.now(),
              expiresIn: 300,
            };
            try {
              localStorage.setItem(
                `avatar-cache:${uid}`,
                JSON.stringify(cache)
              );
            } catch {}
            try {
              localStorage.setItem(
                "avatar-cache:last",
                JSON.stringify({
                  photo: parsed.signedUrl,
                  fetchedAt: Date.now(),
                })
              );
            } catch {}
          }
        } catch {}
        return { photoURL: parsed.signedUrl } as any;
      }
      if (parsed?.path) {
        // fallback: ask server for signed url (short-lived)
        try {
          const currentUid =
            (auth.currentUser && (auth.currentUser as any).uid) ||
            (user && (user as any).uid);
          if (currentUid) {
            const su = await fetch(
              `/api/avatar-url?userId=${encodeURIComponent(
                String(currentUid)
              )}&expires=60`
            );
            if (su.ok) {
              const sd = await su.json();
              if (sd?.signedUrl) return { photoURL: sd.signedUrl } as any;
            }
          }
        } catch {
          /* ignore */
        }
      }
      return {} as any;
    } catch {
      return {} as any;
    }
  };

  React.useEffect(() => {
    // First try a synchronous currentUser read (safe only on client)
    const current = auth.currentUser;
    if (current) {
      setUser(current as unknown as Record<string, unknown>);
      deriveAndSetName(current as unknown as Record<string, unknown>);
      setAuthChecked(true);
    }

    // Listen for auth changes
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        deriveAndSetName(null);
        setAuthChecked(true);
        return;
      }
      const asObj = u as unknown as Record<string, unknown>;
      setUser(asObj);
      deriveAndSetName(asObj);
      setAuthChecked(true);
    });

    try {
      const pv = localStorage.getItem("phone_verified");
      if (pv && !user) setUser((prev) => prev || { phoneNumber: pv });
    } catch {
      /* ignore */
    }

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // studentName is initialized from auth state below to avoid running an
  // effect on every small `user` mutation (photoURL updates etc.) which
  // previously caused a render loop when navigating away.

  // Avatar cache stored in localStorage under key `avatar-cache:<uid>`.
  // Value shape: { url?: string, fetchedAt?: number, expiresIn?: number, dataUrl?: string }
  React.useEffect(() => {
    const CACHE_MARGIN_MS = 15 * 1000; // safety margin

    const getCache = (uid: string) => {
      try {
        const raw = localStorage.getItem(`avatar-cache:${uid}`);
        if (!raw) return null;
        return JSON.parse(raw) as Record<string, any> | null;
      } catch {
        return null;
      }
    };

    const setCache = (uid: string, v: Record<string, any>) => {
      try {
        localStorage.setItem(`avatar-cache:${uid}`, JSON.stringify(v));
      } catch {
        // ignore quota errors
      }
    };

    const fetchImageAsDataUrl = async (url: string) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const blob = await r.blob();
        // only cache reasonably small images to avoid blowing localStorage
        if (blob.size > 250 * 1024) return null;
        return await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };

    (async () => {
      try {
        if (!user) return;
        const uid = (user as any)?.uid as string | undefined;
        if (!uid) return;

        const cached = getCache(uid);
        const now = Date.now();

        if (cached) {
          // Use signed URL if it's still valid
          if (cached.url && cached.fetchedAt && cached.expiresIn) {
            const expiresAt = cached.fetchedAt + (cached.expiresIn * 1000 || 0);
            if (now + CACHE_MARGIN_MS < expiresAt) {
              setUser((prev) => {
                // avoid creating a new object when photoURL is unchanged
                if ((prev as any)?.photoURL === cached.url) return prev;
                return { ...(prev as any), photoURL: cached.url };
              });
              return;
            }
          }

          // If signed URL expired but we have a cached data URL, use it immediately
          if (cached.dataUrl) {
            setUser((prev) => {
              if ((prev as any)?.photoURL === cached.dataUrl) return prev;
              return { ...(prev as any), photoURL: cached.dataUrl };
            });
            // continue to fetch fresh signed URL in background
          }
        }

        const res = await fetch(
          `/api/avatar-url?userId=${encodeURIComponent(uid)}&expires=300`
        );
        if (!res.ok) return;
        const j = await res.json();
        if (j?.signedUrl) {
          setUser((prev) => {
            if ((prev as any)?.photoURL === j.signedUrl) return prev;
            return { ...(prev as any), photoURL: j.signedUrl };
          });

          const newCache: Record<string, any> = {
            url: j.signedUrl,
            fetchedAt: Date.now(),
            expiresIn: 300,
            dataUrl: (cached && cached.dataUrl) || null,
          };
          setCache(uid, newCache);

          // Try to fetch image and cache small images as base64 for instant loads
          (async () => {
            const data = await fetchImageAsDataUrl(j.signedUrl);
            if (data) {
              newCache.dataUrl = data;
              setCache(uid, newCache);
              // update UI to use the dataUrl for faster subsequent loads
              setUser((prev) => {
                if ((prev as any)?.photoURL === data) return prev;
                return { ...(prev as any), photoURL: data };
              });
            }
          })();
        }
      } catch {
        // ignore network errors
      }
    })();
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
    }).catch(() => console.warn("Google user upsert failed"));
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

  // Derived values are read inline in the JSX below; avoid duplicate
  // local bindings here to reduce accidental unused-variable warnings.

  // student name editing state (declared after derived `name`/`photo`)
  // ...existing code...

  // ...existing code...

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    } catch {
      console.error("saveStudentName error");
      setSnackMsg("Failed to save");
      setSnackOpen(true);
    } finally {
      setSaving(false);
    }
  };

  // safe derived fields to avoid `any` casts in JSX
  // The following derived fields are useful for debugging and future UI
  // enhancements. They are intentionally unused for now; disable the
  // unused-vars rule for this block so typecheck stays clean.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const _uid = typeof user?.uid === "string" ? (user!.uid as string) : null;
  const _emailVerified =
    typeof user?.emailVerified === "boolean"
      ? ((user as Record<string, unknown>).emailVerified as boolean)
      : null;
  const _metadataCandidate = user?.metadata;
  const _metadata =
    typeof _metadataCandidate === "object" && _metadataCandidate
      ? (_metadataCandidate as Record<string, unknown>)
      : null;
  const _createdAt =
    _metadata && typeof _metadata["creationTime"] === "string"
      ? (_metadata["creationTime"] as string)
      : null;
  const _lastSignIn =
    _metadata && typeof _metadata["lastSignInTime"] === "string"
      ? (_metadata["lastSignInTime"] as string)
      : null;
  const _providerDataCandidate = user?.providerData;
  const _providerIds = Array.isArray(_providerDataCandidate)
    ? (_providerDataCandidate as Array<Record<string, unknown>>)
        .map((p) =>
          typeof p?.providerId === "string" ? (p.providerId as string) : ""
        )
        .filter(Boolean)
    : [];
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // LinkedIn fields removed

  if (!authChecked) {
    return (
      <>
        <TopNavBar
          backgroundMode="gradient"
          titleBar={{
            visible: true,
            title: "Profile Page",
            breadcrumbs: [
              { label: "Home", href: "/" },
              { label: "Profile" },
              { label: "Requests" },
            ],
            showBreadcrumbs: true,
            actions: [],
            showBackButton: true,
            onBack: () => router.back(),
          }}
        />
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
      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          visible: true,
          title: "Profile Page",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Profile" },
            { label: "Requests" },
          ],
          showBreadcrumbs: true,
          actions: [],
          showBackButton: true,
          onBack: () => router.back(),
        }}
      />

      <Container maxWidth="lg" sx={{ mt: "101px", mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item component="div" xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <ProfilePictureCard
                user={
                  (user as any) ?? {
                    displayName: undefined,
                  }
                }
                onUpload={onUpload}
                avatarSize={96}
              />

              <ProfileCard
                title="Profile Details"
                icon={null}
                onEdit={() =>
                  openEditDrawer({
                    title: "Profile Details",
                    fields: profileFields,
                    values: (user as any) ?? {},
                  })
                }
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {((user as any)?.bio ?? (user as any)?.profile?.bio) || "—"}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, color: "text.secondary" }}
                  >
                    Student Name:
                  </Typography>
                  <Typography variant="body2">
                    {((user as any)?.student_name ??
                      (user as any)?.displayName) ||
                      "—"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, color: "text.secondary" }}
                  >
                    DOB:
                  </Typography>
                  <Typography variant="body2">
                    {(user as any)?.dob || "—"}
                  </Typography>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Interests</Typography>
                  <Box sx={{ mt: 1 }}>
                    {Array.isArray((user as any)?.interests) &&
                    (user as any).interests.length ? (
                      (user as any).interests.map((t: string) => (
                        <Chip
                          key={t}
                          size="small"
                          label={t}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </Box>
                </Box>
              </ProfileCard>
            </Box>
          </Grid>

          <Grid item component="div" xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ProfileCard
                  title="Account Details"
                  icon={null}
                  onEdit={() =>
                    openEditDrawer({
                      title: "Account Details",
                      fields: accountFields,
                      values: (user as any) ?? {},
                    })
                  }
                >
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Username:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.username || "—"}
                    </Typography>
                  </Stack>
                </ProfileCard>
              </Grid>

              <Grid item xs={12}>
                <ProfileCard
                  title="Contact Details"
                  icon={null}
                  onEdit={() =>
                    openEditDrawer({
                      title: "Contact Details",
                      fields: contactFields,
                      values: (user as any) ?? {},
                    })
                  }
                >
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Email:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.email || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Phone:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.phone || "—"}
                    </Typography>
                  </Stack>
                </ProfileCard>
              </Grid>

              <Grid item xs={12}>
                <ProfileCard
                  title="Education Details"
                  icon={null}
                  onEdit={() =>
                    openEditDrawer({
                      title: "Education Details",
                      fields: educationFields,
                      values: (user as any) ?? {},
                    })
                  }
                >
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      School/College:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.school_name || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Board:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.board || "—"}
                    </Typography>
                  </Stack>
                </ProfileCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Drawer for editing */}
      <Drawer
        anchor="right"
        open={drawer.open}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 2 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{drawer.title}</Typography>
          <Button
            size="small"
            variant="contained"
            sx={{ height: 28 }}
            onClick={handleSubmit(async (vals) => {
              if (!drawer.userId || !drawer.fields) return;
              // basic validation
              for (const f of drawer.fields) {
                if (f.required && !vals[f.name]) {
                  setSnack({
                    open: true,
                    message: `${f.label} is required`,
                    severity: "error",
                  });
                  return;
                }
                if (f.type === "email" && vals[f.name]) {
                  const ok = /^\S+@\S+\.\S+$/.test(vals[f.name]);
                  if (!ok) {
                    setSnack({
                      open: true,
                      message: "Invalid email",
                      severity: "error",
                    });
                    return;
                  }
                }
                if (f.type === "date" && vals[f.name]) {
                  const dt = new Date(vals[f.name]);
                  if (dt > new Date()) {
                    setSnack({
                      open: true,
                      message: "Date cannot be in the future",
                      severity: "error",
                    });
                    return;
                  }
                }
              }

              const changed: Record<string, any> = {};
              for (const f of drawer.fields!) {
                const key = f.name;
                const oldVal = (user as any)?.[key];
                const newVal = vals[key];
                if (newVal !== oldVal)
                  changed[key] = newVal === "" ? null : newVal;
              }
              if (Object.keys(changed).length === 0) {
                setSnack({
                  open: true,
                  message: "No changes",
                  severity: "info",
                });
                closeDrawer();
                return;
              }
              const res = await updateUserFields(drawer.userId, changed);
              if (res.ok) {
                setSnack({ open: true, message: "Saved", severity: "success" });
                closeDrawer();
              } else {
                setSnack({
                  open: true,
                  message: `Save failed: ${res.error}`,
                  severity: "error",
                });
              }
            })}
          >
            Save
          </Button>
        </Box>

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {(drawer.fields ?? []).map((f) => {
            if (f.type === "select") {
              return (
                <Controller
                  key={f.name}
                  name={f.name}
                  control={control}
                  defaultValue={(drawer.values ?? {})[f.name] ?? ""}
                  render={({ field }) => (
                    <TextField
                      select
                      label={f.label}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      fullWidth
                    >
                      {(f.options ?? []).map((opt: string) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              );
            }

            if (f.type === "chips") {
              return (
                <Controller
                  key={f.name}
                  name={f.name}
                  control={control}
                  defaultValue={(drawer.values ?? {})[f.name] ?? []}
                  render={({ field }) => {
                    const value: string[] = Array.isArray(field.value)
                      ? field.value
                      : field.value
                      ? String(field.value)
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];
                    return (
                      <Box>
                        <TextField
                          label={f.label + " (comma separated)"}
                          value={value.join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          fullWidth
                        />
                        <Box sx={{ mt: 1 }}>
                          {value.length ? (
                            value.map((c) => (
                              <Chip key={c} label={c} sx={{ mr: 1, mb: 1 }} />
                            ))
                          ) : (
                            <Typography variant="caption">No items</Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                />
              );
            }

            return (
              <Controller
                key={f.name}
                name={f.name}
                control={control}
                defaultValue={(drawer.values ?? {})[f.name] ?? ""}
                render={({ field }) => (
                  <TextField
                    label={f.label}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    fullWidth
                    type={
                      f.type === "date"
                        ? "date"
                        : f.type === "email"
                        ? "email"
                        : "text"
                    }
                    InputLabelProps={
                      f.type === "date" ? { shrink: true } : undefined
                    }
                    multiline={f.type === "multiline"}
                    minRows={f.type === "multiline" ? 3 : undefined}
                  />
                )}
              />
            );
          })}
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ open: false })}
      >
        <Alert severity={snack.severity ?? "success"} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Existing snackbars for saveStudentName and requireName */}
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
