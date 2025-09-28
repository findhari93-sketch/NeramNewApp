"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import GridOrig from "@mui/material/Grid";
const Grid: any = GridOrig;
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import { Controller, useForm } from "react-hook-form";
import { auth } from "../../lib/firebase";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import TopNavBar from "../components/shared/TopNavBar";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";
import HeaderCardDesign from "./components/HeaderCardDesign";
import ProfilePictureCard from "./components/ProfilePictureCard";
import { useSyncedUser } from "@/hooks/useSyncedUser";

export default function ProfilePage() {
  // Set authChecked to true after Firebase auth state is checked
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);
  const userId = auth.currentUser?.uid ?? "";
  const [user, setUser] = useSyncedUser(userId);
  // (Removed unused initialPhoto state; we now write a global cache key below when we save cache.)
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);
  // Removed unused studentName logic.
  // Removed unused saving state
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMsg] = React.useState<string | null>(null);
  const [requireNameSnackOpen] = React.useState(false);

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

  // Password change dialog state
  const [pwdDialogOpen, setPwdDialogOpen] = React.useState(false);
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwdError, setPwdError] = React.useState<string | null>(null);
  const [reauthenticated, setReauthenticated] = React.useState(false);

  const { control, handleSubmit, reset } = useForm<Record<string, any>>({
    defaultValues: {},
  });

  // Compute a simple profile completeness score (0-100)
  const completeness = React.useMemo(() => {
    const u: any = user || {};
    const p: any = (u && u.profile) || {};
    const checks: Array<boolean> = [
      Boolean(u.student_name || u.displayName),
      Boolean(u.username),
      Boolean(u.email),
      Boolean(u.phone || p.phone),
      Boolean(u.photoURL || (p && p.photoURL)),
      Boolean(u.gender || p.gender),
      Boolean(u.dob || p.dob),
      Boolean(p.city),
      Boolean(p.state),
      Boolean(p.country),
      // education: consider filled if any primary education field exists
      Boolean(
        u.education_type ||
          p.education_type ||
          u.school_std ||
          u.college_year ||
          u.diploma_year
      ),
      // course selection hints intent
      Boolean(p.selected_course || u.selected_course),
    ];
    const total = checks.length;
    const done = checks.filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [user]);

  // Ensure the form is reset whenever the drawer opens or its values change.
  // This fixes a bug where controlled inputs (notably the `chips` text field)
  // didn't update or accept typing because react-hook-form retained stale
  // internal state. Calling `reset` keeps controller values in sync. We also
  // include drawer.open in the deps so opening the drawer for the same
  // values still triggers a reset.
  React.useEffect(() => {
    try {
      if (drawer.open) {
        reset(drawer.values ?? {});
      }
    } catch {
      /* ignore */
    }
    // We intentionally depend on drawer.open and drawer.values
    // so this runs when the drawer is shown with new values.
  }, [drawer.open, drawer.values, reset]);

  // Field schemas for drawer (examples)
  const profileFields = [
    { name: "father_name", label: "Father's Name", type: "text" },
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
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "nonbinary", label: "Other" },
      ],
    },
    { name: "interests", label: "Interests", type: "chips" },
    // Add dropdown for languages
    {
      name: "selected_languages",
      label: "Languages",
      type: "multi-select",
      options: [
        { value: "English", label: "English" },
        { value: "Tamil", label: "Tamil" },
        { value: "Hindi", label: "Hindi" },
      ],
    },
    // Add cycling selector for youtubeSubscribed
    {
      name: "youtube_subscribed",
      label: "Subscribed to YouTube?",
      type: "cycle",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },
    // Add dropdown for selectedCourse
    {
      name: "selected_course",
      label: "Course",
      type: "select",
      options: [
        { value: "nata-jee", label: "NATA/JEE" },
        { value: "barch", label: "B.Arch" },
        { value: "other", label: "Other" },
      ],
    },
    // Add dropdown for softwareCourse
    {
      name: "software_course",
      label: "Software Course",
      type: "select",
      options: [
        { value: "Revit", label: "Revit" },
        { value: "AutoCAD", label: "AutoCAD" },
        { value: "SketchUp", label: "SketchUp" },
      ],
    },
  ];
  const accountFields = [
    { name: "username", label: "Username", type: "text", required: true },
  ];

  const contactFields = [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Verified Number", type: "text" },
    { name: "alternate_phone", label: "Alternate Number", type: "text" },
    {
      name: "city",
      label: "City",
      type: "select",
      options: [
        { value: "Chennai", label: "Chennai" },
        { value: "Coimbatore", label: "Coimbatore" },
        { value: "Madurai", label: "Madurai" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "state",
      label: "State",
      type: "select",
      options: [
        { value: "Tamil Nadu", label: "Tamil Nadu" },
        { value: "Kerala", label: "Kerala" },
        { value: "Karnataka", label: "Karnataka" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: [
        { value: "India", label: "India" },
        { value: "Other", label: "Other" },
      ],
    },
    { name: "zip_code", label: "Zip Code", type: "text" },
  ];

  const educationFields = [
    {
      name: "education_type",
      label: "Education Type",
      type: "select",
      options: [
        { value: "school", label: "School" },
        { value: "college", label: "College" },
        { value: "diploma", label: "Diploma" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "school_std",
      label: "School Standard/Grade",
      type: "cycle",
      options: [
        { value: "Below 10th", label: "Below 10th" },
        { value: "10th", label: "10th" },
        { value: "11th", label: "11th" },
        { value: "12th", label: "12th" },
      ],
    },
    {
      name: "board",
      label: "Education Board",
      type: "select",
      options: [
        { value: "CBSE", label: "CBSE" },
        { value: "State Board", label: "State Board" },
        { value: "ICSE", label: "ICSE" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "board_year",
      label: "Board Exam Year",
      type: "cycle",
      options: [
        { value: "2022-23", label: "2022-23" },
        { value: "2023-24", label: "2023-24" },
        { value: "2024-25", label: "2024-25" },
        { value: "2025-26", label: "2025-26" },
        { value: "2026-27", label: "2026-27" },
        { value: "2027-28", label: "2027-28" },
      ],
    },
    { name: "school_name", label: "School Name", type: "text" },
    { name: "college_name", label: "College Name", type: "text" },
    {
      name: "college_year",
      label: "College Year",
      type: "cycle",
      options: [
        { value: "1st Year", label: "1st Year" },
        { value: "2nd Year", label: "2nd Year" },
        { value: "3rd Year", label: "3rd Year" },
        { value: "Completed", label: "Completed" },
      ],
    },
    { name: "diploma_course", label: "Diploma Course", type: "text" },
    {
      name: "diploma_year",
      label: "Diploma Year",
      type: "cycle",
      options: [
        { value: "2022-23", label: "2022-23" },
        { value: "2023-24", label: "2023-24" },
        { value: "2024-25", label: "2024-25" },
        { value: "2025-26", label: "2025-26" },
        { value: "2026-27", label: "2026-27" },
        { value: "2027-28", label: "2027-28" },
        { value: "Completed", label: "Completed" },
      ],
    },
    { name: "diploma_college", label: "Diploma College Name", type: "text" },
    {
      name: "nata_attempt_year",
      label: "NATA Attempt Year",
      type: "cycle",
      options: [
        { value: "2022-23", label: "2022-23" },
        { value: "2023-24", label: "2023-24" },
        { value: "2024-25", label: "2024-25" },
        { value: "2025-26", label: "2025-26" },
        { value: "2026-27", label: "2026-27" },
        { value: "2027-28", label: "2027-28" },
      ],
    },
    {
      name: "other_description",
      label: "What I do ?",
      type: "multiline",
    },
  ];

  // Helper function to determine which fields should be displayed based on education type
  const getFieldsForEducationType = (educationType: string) => {
    const normalizedType = (educationType || "school").toLowerCase();

    const commonFields = ["education_type", "nata_attempt_year"];

    switch (normalizedType) {
      case "college":
        return [...commonFields, "college_name", "college_year"];
      case "school":
        return [
          ...commonFields,
          "school_std",
          "board",
          "board_year",
          "school_name",
        ];
      case "diploma":
        return [
          ...commonFields,
          "diploma_college",
          "diploma_year",
          "diploma_course",
        ];
      case "other":
        return [...commonFields, "other_description"];
      default:
        return [
          ...commonFields,
          "school_std",
          "board",
          "board_year",
          "school_name",
        ]; // default to school
    }
  };

  const openEditDrawer = (params: {
    title: string;
    fields: any[];
    values?: Record<string, any>;
  }) => {
    const provided = params.values ?? {};
    const initialValues: Record<string, any> = { ...(provided ?? {}) };
    try {
      // student_name fallback -> displayName / email / phone
      if (
        (params.fields || []).some((f: any) => f.name === "student_name") &&
        !initialValues["student_name"]
      ) {
        if ((provided as any).student_name)
          initialValues["student_name"] = (provided as any).student_name;
        else if ((user as any)?.displayName)
          initialValues["student_name"] = (user as any).displayName;
        else if ((user as any)?.email)
          initialValues["student_name"] = (user as any).email;
        else if ((user as any)?.phoneNumber)
          initialValues["student_name"] = (user as any).phoneNumber;
      }

      // father_name fallback -> profile.father_name or user.father_name
      if (
        (params.fields || []).some((f: any) => f.name === "father_name") &&
        !initialValues["father_name"]
      ) {
        if ((provided as any).father_name)
          initialValues["father_name"] = (provided as any).father_name;
        else if ((user as any)?.profile && (user as any).profile.father_name)
          initialValues["father_name"] = (user as any).profile.father_name;
        else if ((user as any)?.father_name)
          initialValues["father_name"] = (user as any).father_name;
      }

      // gender fallback -> profile.gender or user.gender
      if (
        (params.fields || []).some((f: any) => f.name === "gender") &&
        !initialValues["gender"]
      ) {
        if ((provided as any).gender)
          initialValues["gender"] = (provided as any).gender;
        else if ((user as any)?.profile && (user as any).profile.gender)
          initialValues["gender"] = (user as any).profile.gender;
        else if ((user as any)?.gender)
          initialValues["gender"] = (user as any).gender;
      }

      // dob fallback -> prefer top-level dob or profile.dob but format for <input type="date" />
      if (
        (params.fields || []).some((f: any) => f.name === "dob") &&
        !initialValues["dob"]
      ) {
        const rawDob =
          (provided as any).dob ||
          (user as any)?.profile?.dob ||
          (user as any)?.dob;
        try {
          if (rawDob) {
            const d = new Date(rawDob);
            if (!isNaN(d.getTime())) {
              // format as YYYY-MM-DD for the date input
              initialValues["dob"] = d.toISOString().slice(0, 10);
            }
          }
        } catch {
          // ignore parse errors
        }
      }
    } catch {
      // ignore any access errors and proceed with provided values
    }

    setDrawer({
      open: true,
      title: params.title,
      fields: params.fields,
      values: initialValues,
      userId: (user as any)?.uid ?? null,
    });
    reset(initialValues);
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
      // Use the server-side upsert endpoint which merges provided profile
      // fields into dedicated columns and profile JSON. Send only changed
      // fields under `profile` so single-field updates (e.g. father_name)
      // persist without requiring other fields.
      // Promote certain top-level fields (e.g., dob, student_name, username)
      // into top-level payload keys so the server upsert can place them into
      // dedicated columns. Keep the rest under `profile` JSON.
      const payload: Record<string, any> = { uid: userId };
      const profilePayload: Record<string, any> = {};
      for (const k of Object.keys(changedFields)) {
        // heuristics: promote known top-level columns
        if (k === "dob" || k === "student_name" || k === "username") {
          payload[k] = changedFields[k];
        } else {
          profilePayload[k] = changedFields[k];
        }
      }
      payload.profile = profilePayload;
      const res = await apiClient(`/api/users/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res || res.status >= 400) {
        // best-effort rollback
        setUser(previous);
        const text = res?.statusText ?? "Failed to update";
        throw new Error(text);
      }
      const parsed = await res.json().catch(() => null);
      // server returns { ok: true, user }
      const returnedUser = parsed && parsed.user ? parsed.user : parsed;
      if (returnedUser) {
        // Merge education fields from profile into top-level for UI consistency
        const educationKeys = [
          "education_type",
          "school_std",
          "board",
          "board_year",
          "school_name",
          "college_name",
          "college_year",
          "diploma_course",
          "diploma_year",
          "diploma_college",
          "nata_attempt_year",
          "other_description",
        ];
        if (returnedUser.profile) {
          for (const k of educationKeys) {
            if (returnedUser.profile[k] !== undefined) {
              returnedUser[k] = returnedUser.profile[k];
            }
          }
        }
        setUser(returnedUser);
        try {
          const uid = String(userId);
          // write a local cache copy to avoid extra DB hits on reload
          localStorage.setItem(
            `user-cache:${uid}`,
            JSON.stringify({ user: returnedUser, fetchedAt: Date.now() })
          );
        } catch {
          /* ignore */
        }
      }
      return { ok: true, data: parsed };
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
                  uid,
                  photo: parsed.signedUrl,
                  fetchedAt: Date.now(),
                })
              );
              try {
                window.dispatchEvent(
                  new CustomEvent("avatar-updated", {
                    detail: { uid, photo: parsed.signedUrl },
                  })
                );
              } catch {}
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

  // Removed: auth state sync and cache logic

  // studentName is initialized from auth state below to avoid running an
  // effect on every small `user` mutation (photoURL updates etc.) which
  // previously caused a render loop when navigating away.

  // Avatar cache stored in localStorage under key `avatar-cache:<uid>`.
  // Value shape: { url?: string, fetchedAt?: number, expiresIn?: number, dataUrl?: string }

  // Removed: avatar cache logic and updater function

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

  // Fetch the server-side Supabase user row once after auth so DB-backed
  // fields (father_name, gender, profile JSON, etc.) appear on refresh.
  const fetchedMeForUid = React.useRef<string | null>(null);
  // Simple local cache for the full DB user row to avoid hitting the DB on
  // every reload. Cache key: `user-cache:<uid>` with shape { user, fetchedAt }.
  const USER_CACHE_TTL_MS_REF = React.useRef<number>(24 * 60 * 60 * 1000);
  const readUserCache = React.useCallback((uid: string) => {
    try {
      const raw = localStorage.getItem(`user-cache:${uid}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        user?: any;
        fetchedAt?: number;
      } | null;
      if (!parsed || !parsed.fetchedAt) return null;
      if (Date.now() - parsed.fetchedAt > USER_CACHE_TTL_MS_REF.current)
        return null;
      return parsed.user ?? null;
    } catch {
      return null;
    }
  }, []);
  const writeUserCache = React.useCallback(
    (uid: string, u: Record<string, any>) => {
      try {
        localStorage.setItem(
          `user-cache:${uid}`,
          JSON.stringify({ user: u, fetchedAt: Date.now() })
        );
      } catch {
        // ignore quota errors
      }
    },
    []
  );

  React.useEffect(() => {
    // Always run this effect, but only fetch if conditions are met
    if (!authChecked || !user) return;
    const uid = (user as any)?.uid;
    if (!uid) return;
    if (fetchedMeForUid.current === uid) return; // already fetched for this uid

    // if we have a fresh cache, use it and avoid a network call
    let cached = readUserCache(uid);
    // Clear old cache that might not have education fields
    if (
      cached &&
      !(cached as any).education_type &&
      !(cached as any).school_std
    ) {
      localStorage.removeItem(`user-cache:${uid}`);
      cached = null; // Force fresh fetch
      console.log("Cleared old cache without education fields");
    }
    if (cached) {
      console.log("Using cached user data:", {
        education_type: (cached as any).education_type,
        school_std: (cached as any).school_std,
        board: (cached as any).board,
        has_education_fields: !!(cached as any).education_type,
      });
      setUser(cached);
      fetchedMeForUid.current = uid;
      return;
    }

    (async () => {
      try {
        const res = await apiClient(`/api/users/me`);
        if (!res || !res.ok) return;
        const parsed = await res.json().catch(() => null);
        const dbUser = parsed && parsed.user ? parsed.user : parsed;
        if (dbUser) {
          // Debug: Log the education fields received from database
          console.log("Education fields from DB:", {
            education_type: dbUser.education_type,
            school_std: dbUser.school_std,
            board: dbUser.board,
            board_year: dbUser.board_year,
            school_name: dbUser.school_name,
            college_name: dbUser.college_name,
            college_year: dbUser.college_year,
            diploma_course: dbUser.diploma_course,
            diploma_year: dbUser.diploma_year,
            diploma_college: dbUser.diploma_college,
            nata_attempt_year: dbUser.nata_attempt_year,
            other_description: dbUser.other_description,
          });
          setUser(dbUser);
          // write to local cache for future reloads
          try {
            writeUserCache(uid, dbUser);
          } catch {}
        }
        fetchedMeForUid.current = uid;
      } catch {
        // ignore network errors
      }
    })();
  }, [authChecked, user, readUserCache, writeUserCache, setUser]);

  // Redirect unauthenticated users to the login page with a notice instead of rendering a 401 page.
  React.useEffect(() => {
    if (authChecked && !auth.currentUser) {
      try {
        const next = encodeURIComponent(window.location.pathname);
        router.replace(`/auth/login?notice=login_required&next=${next}`);
      } catch {
        router.replace(`/auth/login?notice=login_required`);
      }
    }
  }, [authChecked, router]);

  if (authChecked && !auth.currentUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Derived values are read inline in the JSX below; avoid duplicate

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
        {/* Profile completeness card */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Profile completeness
            </Typography>
            <Typography
              variant="subtitle1"
              color={completeness < 70 ? "warning.main" : "success.main"}
            >
              {completeness}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Number.isFinite(completeness) ? completeness : 0}
            sx={{ height: 8, borderRadius: 999 }}
          />
          {completeness < 70 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Complete at least 70% of your profile to unlock a smoother
              experience.
            </Typography>
          )}
        </Paper>
        <Grid container spacing={3}>
          <Grid item component="div" xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <HeaderCardDesign
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
                <ProfilePictureCard
                  user={
                    (user as any) ?? {
                      displayName: undefined,
                    }
                  }
                  onUpload={onUpload}
                  avatarSize={96}
                />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {(user as any)?.bio || "—"}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, color: "text.secondary" }}
                  >
                    Student Name:
                  </Typography>

                  <Typography variant="body2">
                    {(user as any)?.student_name ||
                      (user as any)?.displayName ||
                      "—"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, color: "text.secondary" }}
                  >
                    Father&apos;s Name:
                  </Typography>
                  <Typography variant="body2">
                    {(user as any)?.father_name || "—"}
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

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, color: "text.secondary" }}
                  >
                    Gender:
                  </Typography>
                  <Typography variant="body2">
                    {(user as any)?.gender || "—"}
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
              </HeaderCardDesign>
            </Box>
          </Grid>

          <Grid item component="div" xs={12} md={8}>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <HeaderCardDesign
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

                  {/* Password row: masked with reveal and edit action */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Password:
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {"••••••••"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setSnack({
                            open: true,
                            message:
                              "Password is hidden for security. Use Change to update your password.",
                            severity: "info",
                          })
                        }
                        aria-label="reveal-password"
                      >
                        {/* info / eye icon */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                        </svg>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setPwdDialogOpen(true)}
                        aria-label="change-password"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                            fill="currentColor"
                          />
                          <path
                            d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            fill="currentColor"
                          />
                        </svg>
                      </IconButton>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Account Type:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.accountType ||
                        (user as any)?.account_type ||
                        "Free"}
                    </Typography>
                  </Stack>

                  {/* account type */}
                </HeaderCardDesign>
              </Grid>

              <Grid item xs={12}>
                <HeaderCardDesign
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
                      Verified Number:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.phone || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Alternate Number:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.alternate_phone || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      City:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.city || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      State:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.state || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Country:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.country || "—"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 200, color: "text.secondary" }}
                    >
                      Zip Code:
                    </Typography>
                    <Typography variant="body2">
                      {(user as any)?.zip_code || "—"}
                    </Typography>
                  </Stack>
                </HeaderCardDesign>
              </Grid>

              <Grid item xs={12}>
                <HeaderCardDesign
                  title="Education Details"
                  icon={null}
                  onEdit={() => {
                    const educationType =
                      (user as any)?.education_type ?? "school";
                    const fieldsToShow =
                      getFieldsForEducationType(educationType);
                    const filteredFields = educationFields.filter((field) =>
                      fieldsToShow.includes(field.name)
                    );
                    openEditDrawer({
                      title: "Education Details",
                      fields: filteredFields,
                      values: (user as any) ?? {},
                    });
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1}>
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 160,
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Education Type:
                          </Typography>
                          <Typography variant="body2">
                            {(user as any)?.education_type ?? "school"}
                          </Typography>
                        </Stack>
                        {(() => {
                          const educationType =
                            (user as any)?.education_type ?? "school";
                          const fieldsToShow =
                            getFieldsForEducationType(educationType);
                          return (
                            <>
                              {fieldsToShow.includes("school_std") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    School Standard / Grade:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.school_std ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("board") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Education Board:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.board ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("board_year") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Board Exam Year:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.board_year ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("school_name") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    School Name:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.school_name ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("college_name") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    College Name:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.college_name ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("college_year") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    College Year:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.college_year ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("diploma_course") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Diploma Course:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.diploma_course ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("diploma_year") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Diploma Year:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.diploma_year ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("diploma_college") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Diploma College Name:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.diploma_college ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("other_description") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    What I do ?:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.other_description ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                              {fieldsToShow.includes("nata_attempt_year") && (
                                <Stack direction="row" spacing={1}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 160,
                                      color: "text.secondary",
                                      fontWeight: 500,
                                    }}
                                  >
                                    NATA Attempt Year:
                                  </Typography>
                                  <Typography variant="body2">
                                    {(user as any)?.nata_attempt_year ?? "—"}
                                  </Typography>
                                </Stack>
                              )}
                            </>
                          );
                        })()}
                      </Stack>
                    </Grid>
                  </Grid>
                </HeaderCardDesign>
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

              // Build changed set, with client-side normalization for some fields
              const normalizeGender = (v: any) => {
                if (v == null) return null;
                const s = String(v).trim().toLowerCase();
                const map: Record<string, string> = {
                  male: "male",
                  m: "male",
                  female: "female",
                  f: "female",
                  other: "nonbinary",
                  "non-binary": "nonbinary",
                  "non binary": "nonbinary",
                  nonbinary: "nonbinary",
                  nb: "nonbinary",
                };
                return map[s] ?? null;
              };

              const changed: Record<string, any> = {};
              for (const f of drawer.fields!) {
                const key = f.name;
                // prefer top-level user property, fall back to profile
                const oldVal =
                  (user as any)?.[key] ?? (user as any)?.profile?.[key];
                let newVal = vals[key];

                // normalize empty string -> null
                if (newVal === "") newVal = null;

                // field-specific normalization/validation
                if (key === "student_name" && typeof newVal === "string") {
                  const trimmed = newVal.trim().replace(/\s+/g, " ");
                  if (!trimmed) {
                    newVal = null;
                  } else if (/\d/.test(trimmed)) {
                    setSnack({
                      open: true,
                      message: "Name must not contain numbers",
                      severity: "error",
                    });
                    return;
                  } else {
                    newVal = trimmed;
                  }
                }

                if (key === "gender") {
                  const mapped = normalizeGender(newVal);
                  if (mapped == null) {
                    // drop unknown gender value rather than risk a DB enum error
                    continue;
                  }
                  newVal = mapped;
                }

                if (f.type === "chips") {
                  if (Array.isArray(newVal)) {
                    newVal = newVal
                      .map((s: any) => String(s).trim())
                      .filter(Boolean);
                  } else if (typeof newVal === "string") {
                    newVal = newVal
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                  } else {
                    newVal = null;
                  }
                }

                // Only include if changed (strict equality vs both null)
                const oldNormalized = oldVal === undefined ? null : oldVal;
                const newNormalized = newVal === undefined ? null : newVal;
                const bothNull = oldNormalized == null && newNormalized == null;
                if (!bothNull) {
                  const changedFlag =
                    JSON.stringify(oldNormalized) !==
                    JSON.stringify(newNormalized);
                  if (changedFlag) changed[key] = newNormalized;
                }
              }

              // Special case: if dob present, convert YYYY-MM-DD -> ISO date string
              if (typeof changed.dob === "string" && changed.dob) {
                try {
                  const d = new Date(changed.dob);
                  if (!isNaN(d.getTime())) {
                    // store as full ISO (server-side upsert will accept and you can also
                    // include top-level dob column to persist into a dedicated column)
                    changed.dob = d.toISOString();
                  }
                } catch {
                  // leave as-is if conversion fails
                }
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
                      {(f.options ?? []).map((opt: any) => {
                        const val = typeof opt === "string" ? opt : opt.value;
                        const lbl = typeof opt === "string" ? opt : opt.label;
                        return (
                          <MenuItem key={String(val)} value={val}>
                            {lbl}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )}
                />
              );
            }

            if (f.type === "cycle") {
              return (
                <Controller
                  key={f.name}
                  name={f.name}
                  control={control}
                  defaultValue={
                    (drawer.values ?? {})[f.name] ?? f.options?.[0]?.value ?? ""
                  }
                  render={({ field }) => {
                    const options = f.options ?? [];
                    const currentIdx = options.findIndex(
                      (opt: any) => opt.value === field.value
                    );
                    const prevIdx =
                      (currentIdx - 1 + options.length) % options.length;
                    const nextIdx = (currentIdx + 1) % options.length;
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <IconButton
                          aria-label={`Previous ${f.label}`}
                          onClick={() => field.onChange(options[prevIdx].value)}
                          size="small"
                        >
                          &#8592;
                        </IconButton>
                        <TextField
                          label={f.label}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                        <IconButton
                          aria-label={`Next ${f.label}`}
                          onClick={() => field.onChange(options[nextIdx].value)}
                          size="small"
                        >
                          &#8594;
                        </IconButton>
                      </Box>
                    );
                  }}
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

      {/* Change Password Dialog */}
      <Dialog open={pwdDialogOpen} onClose={() => setPwdDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Current password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            {pwdError ? (
              <Typography color="error" variant="body2">
                {pwdError}
              </Typography>
            ) : null}
            <Box>
              <Button
                size="small"
                onClick={async () => {
                  setPwdError(null);
                  try {
                    const googleProvider = new GoogleAuthProvider();
                    await signInWithPopup(auth, googleProvider);
                    setReauthenticated(true);
                    setSnack({
                      open: true,
                      message: "Reauthenticated via Google",
                      severity: "success",
                    });
                  } catch (e) {
                    setPwdError("Google reauthentication failed: " + String(e));
                  }
                }}
              >
                Sign in with Google
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={pwdLoading}
            onClick={async () => {
              setPwdError(null);

              // basic validation for new password
              if (!newPassword) return setPwdError("Please enter new password");
              if (newPassword.length < 6)
                return setPwdError(
                  "New password must be at least 6 characters"
                );
              if (newPassword !== confirmPassword)
                return setPwdError("Passwords do not match");

              setPwdLoading(true);
              try {
                const current = auth.currentUser;
                if (!current) {
                  setPwdError("No authenticated user to change password for");
                  setPwdLoading(false);
                  return;
                }

                const providerIds = Array.isArray((current as any).providerData)
                  ? ((current as any).providerData as any[]).map(
                      (p) => p.providerId
                    )
                  : [];

                const hasPasswordProvider = providerIds.includes("password");
                const hasGoogleProvider = providerIds.includes("google.com");

                if (hasPasswordProvider) {
                  // require old password and validate it
                  if (!oldPassword) {
                    setPwdError("Please enter current password");
                    setPwdLoading(false);
                    return;
                  }
                  try {
                    const cred = EmailAuthProvider.credential(
                      current.email ?? "",
                      oldPassword
                    );
                    await reauthenticateWithCredential(current, cred);
                  } catch (reauthErr) {
                    setPwdError(
                      "Current password incorrect: " +
                        ((reauthErr as any)?.message ?? String(reauthErr))
                    );
                    setPwdLoading(false);
                    return;
                  }
                } else if (hasGoogleProvider) {
                  // require explicit Google reauthentication via the dialog button
                  if (!reauthenticated) {
                    setPwdError(
                      "This account uses Google sign-in. Please click 'Sign in with Google' to reauthenticate first."
                    );
                    setPwdLoading(false);
                    return;
                  }
                } else {
                  setPwdError(
                    "Unable to reauthenticate this account. Contact support."
                  );
                  setPwdLoading(false);
                  return;
                }

                // Finally update password
                try {
                  await updatePassword(auth.currentUser as any, newPassword);
                  setSnack({
                    open: true,
                    message: "Password changed",
                    severity: "success",
                  });
                  setPwdDialogOpen(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setReauthenticated(false);
                } catch (uErr) {
                  setPwdError(
                    "Failed to update password: " +
                      ((uErr as any)?.message ?? String(uErr))
                  );
                }
              } catch (err) {
                setPwdError("Unexpected error: " + String(err));
              } finally {
                setPwdLoading(false);
              }
            }}
          >
            Change
          </Button>
        </DialogActions>
      </Dialog>

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
