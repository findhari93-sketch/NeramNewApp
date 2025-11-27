"use client";
import React, { Suspense } from "react";
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
import { auth } from "../../../lib/firebase";
import {
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  updatePassword,
  GoogleAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "../../../lib/apiClient";
import equal from "fast-deep-equal";
import HeaderCardDesign from "./components/HeaderCardDesign";
import ProfilePictureCard from "./components/ProfilePictureCard";
import { useSyncedUser } from "@/hooks/useSyncedUser";
import {
  type DrawerField,
  profileFields,
  accountFields,
  contactFields,
  educationFields,
  getFieldsForEducationType,
  CACHE_CONFIG,
} from "@/config/profileSchema";

// DrawerState type for component state

type DrawerState = {
  open: boolean;
  title?: string;
  fields?: DrawerField[];
  values?: Record<string, any>;
  userId?: string | null;
};

// User type based on Firebase user + Supabase extensions
type UserProfile = {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  student_name?: string | null;
  username?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  alternate_phone?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData?: Array<{ providerId: string }>;
  // Profile JSONB fields
  profile?: {
    father_name?: string;
    bio?: string;
    gender?: string;
    dob?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    interests?: string[];
    selected_languages?: string[];
    youtube_subscribed?: boolean;
    selected_course?: string;
    software_course?: string;
    photoURL?: string;
    [key: string]: any;
  };
  // Education fields (mirrored from profile JSONB for UI convenience)
  education_type?: string;
  school_std?: string;
  board?: string;
  board_year?: string;
  school_name?: string;
  college_name?: string;
  college_year?: string;
  diploma_course?: string;
  diploma_year?: string;
  diploma_college?: string;
  nata_attempt_year?: string;
  other_description?: string;
  // Top-level fields
  father_name?: string;
  bio?: string;
  gender?: string;
  dob?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  interests?: string[];
  selected_languages?: string[];
  youtube_subscribed?: boolean;
  selected_course?: string;
  software_course?: string;
  [key: string]: any; // Allow additional fields for flexibility
};

function ProfilePageInner() {
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
  const searchParams = useSearchParams();

  // Consolidated toast state - single source of truth for all snackbar notifications
  const [toast, setToast] = React.useState<{
    open: boolean;
    message?: string;
    severity?: "success" | "error" | "info" | "warning";
    anchor?: {
      vertical: "top" | "bottom";
      horizontal: "left" | "center" | "right";
    };
  }>({ open: false });
  // Show payment success banner once and then clean URL
  React.useEffect(() => {
    try {
      const paid = searchParams?.get("paid");
      const course = searchParams?.get("course");
      const pid = searchParams?.get("pid");
      if (paid === "1") {
        const parts = ["Payment successful!"];
        if (course) parts.push(`Course: ${course}`);
        if (pid) parts.push(`Payment ID: ${pid}`);
        setToast({
          open: true,
          message: parts.join(" – "),
          severity: "success",
          anchor: { vertical: "top", horizontal: "center" },
        });
        // Clean the URL after a short delay so banner doesn't reappear on refresh
        const t = setTimeout(() => {
          try {
            router.replace("/profile");
          } catch {}
        }, 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [searchParams, router]);

  const [drawer, setDrawer] = React.useState<DrawerState>({ open: false });

  // Password change dialog state
  const [pwdDialogOpen, setPwdDialogOpen] = React.useState(false);
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwdError, setPwdError] = React.useState<string | null>(null);
  const [reauthenticated, setReauthenticated] = React.useState(false);

  // Set Password dialog state (for Google users without password)
  const [setPasswordDialogOpen, setSetPasswordDialogOpen] = React.useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = React.useState(false);
  const [setPasswordUsername, setSetPasswordUsername] = React.useState("");
  const [setPasswordNew, setSetPasswordNew] = React.useState("");
  const [setPasswordConfirm, setSetPasswordConfirm] = React.useState("");
  const [setPasswordError, setSetPasswordError] = React.useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<Record<string, any>>({
    defaultValues: {},
  });

  // Smaller MUI TextField styling for mobile inside the drawer
  const textFieldMobileSx = React.useMemo(
    () => ({
      "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
      "& .MuiInputLabel-root": { fontSize: { xs: 13, sm: 14 } },
      "& .MuiFormHelperText-root": { fontSize: { xs: 11, sm: 12 } },
    }),
    []
  );

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

  // Detect if user has password provider linked
  const hasPasswordProvider = React.useMemo(() => {
    const providerData = user?.providerData as Array<{ providerId: string }> | undefined;
    return providerData?.some((p) => p.providerId === "password") ?? false;
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

  // Field schemas imported from @/config/profileSchema

  const openEditDrawer = (params: {
    title: string;
    fields: DrawerField[];
    values?: Record<string, any>;
  }) => {
    const provided = params.values ?? {};
    const initialValues: Record<string, any> = { ...(provided ?? {}) };
    try {
      // student_name fallback -> displayName / email / phone
      if (
        (params.fields || []).some((f) => f.name === "student_name") &&
        !initialValues["student_name"]
      ) {
        const typedProvided = provided as Partial<UserProfile>;
        const typedUser = user as UserProfile | null;
        if (typedProvided.student_name)
          initialValues["student_name"] = typedProvided.student_name;
        else if (typedUser?.displayName)
          initialValues["student_name"] = typedUser.displayName;
        else if (typedUser?.email)
          initialValues["student_name"] = typedUser.email;
        else if (typedUser?.phoneNumber)
          initialValues["student_name"] = typedUser.phoneNumber;
      }

      // father_name fallback -> profile.father_name or user.father_name
      if (
        (params.fields || []).some((f) => f.name === "father_name") &&
        !initialValues["father_name"]
      ) {
        const typedProvided = provided as Partial<UserProfile>;
        const typedUser = user as UserProfile | null;
        if (typedProvided.father_name)
          initialValues["father_name"] = typedProvided.father_name;
        else if (typedUser?.profile?.father_name)
          initialValues["father_name"] = typedUser.profile.father_name;
        else if (typedUser?.father_name)
          initialValues["father_name"] = typedUser.father_name;
      }

      // gender fallback -> profile.gender or user.gender
      if (
        (params.fields || []).some((f) => f.name === "gender") &&
        !initialValues["gender"]
      ) {
        const typedProvided = provided as Partial<UserProfile>;
        const typedUser = user as UserProfile | null;
        if (typedProvided.gender)
          initialValues["gender"] = typedProvided.gender;
        else if (typedUser?.profile?.gender)
          initialValues["gender"] = typedUser.profile.gender;
        else if (typedUser?.gender) initialValues["gender"] = typedUser.gender;
      }

      // dob fallback -> prefer top-level dob or profile.dob but format for <input type="date" />
      if (
        (params.fields || []).some((f) => f.name === "dob") &&
        !initialValues["dob"]
      ) {
        const typedProvided = provided as Partial<UserProfile>;
        const typedUser = user as UserProfile | null;
        const rawDob =
          typedProvided.dob || typedUser?.profile?.dob || typedUser?.dob;
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
      userId: (user as UserProfile | null)?.uid ?? null,
    });
    reset(initialValues);
  };

  const closeDrawer = React.useCallback(() => {
    setDrawer({ open: false });
    reset({});
  }, [reset]);

  const updateUserFields = React.useCallback(
    async (
      userId: string | null | undefined,
      changedFields: Record<string, any>
    ) => {
      if (!userId) throw new Error("No user id");
      // If nothing changed, just refresh the user from server/cache and exit successfully
      if (Object.keys(changedFields).length === 0) {
        try {
          const meRes = await apiClient(`/api/users/me`);
          if (meRes && meRes.ok) {
            const meParsed = await meRes.json().catch(() => null);
            const fresh = meParsed && meParsed.user ? meParsed.user : meParsed;
            if (fresh) {
              setUser(fresh);
              try {
                localStorage.setItem(
                  `user-cache:${userId}`,
                  JSON.stringify({ user: fresh, fetchedAt: Date.now() })
                );
              } catch {}
            }
          }
        } catch {}
        return { ok: true } as const;
      }
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
          // heuristics: promote known top-level columns so the API can persist to dedicated columns
          const promoteTopLevel = new Set([
            "dob",
            "student_name",
            "username",
            "email",
            "phone",
            "alternate_phone",
            "city",
            "state",
            "country",
            "zip_code",
          ]);
          if (promoteTopLevel.has(k)) {
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
          // Try to extract detailed error message from response body
          let errorMessage = "Failed to update profile";
          try {
            const errorBody = await res?.json();
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            } else if (errorBody?.message) {
              errorMessage = errorBody.message;
            } else if (res?.statusText) {
              errorMessage = `${errorMessage}: ${res.statusText}`;
            }
          } catch {
            // If JSON parsing fails, use status text or generic message
            if (res?.statusText) {
              errorMessage = `${errorMessage}: ${res.statusText}`;
            }
          }
          throw new Error(errorMessage);
        }
        const parsed = await res.json().catch(() => null);
        // server returns { ok: true, user } in most cases; sometimes 204/empty
        let returnedUser = parsed && parsed.user ? parsed.user : parsed;
        if (!returnedUser) {
          // Fallback: fetch the latest user row to ensure UI reflects saved state
          try {
            const meRes = await apiClient(`/api/users/me`);
            if (meRes && meRes.ok) {
              const meParsed = await meRes.json().catch(() => null);
              returnedUser =
                meParsed && meParsed.user ? meParsed.user : meParsed;
            }
          } catch {}
        }
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
            // Mirror commonly-used profile fields to top-level for current UI
            const profileKeysToMirror = [
              "interests",
              "father_name",
              "bio",
              "selected_languages",
              "youtube_subscribed",
              "selected_course",
              "software_course",
            ];
            for (const k of profileKeysToMirror) {
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
    },
    [user, setUser]
  );

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
              expiresIn: CACHE_CONFIG.AVATAR_CACHE_EXPIRES_IN,
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

  // Extracted save handler for drawer form - improves testability and readability
  const onSave = React.useCallback(
    async (vals: Record<string, any>) => {
      const uidAtSave =
        drawer.userId || auth.currentUser?.uid || (user as any)?.uid;
      if (!uidAtSave || !drawer.fields) {
        setToast({
          open: true,
          message: "Cannot save: missing user",
          severity: "error",
        });
        return;
      }
      // basic validation
      for (const f of drawer.fields) {
        if (f.type === "email" && vals[f.name]) {
          const ok = /^\S+@\S+\.\S+$/.test(vals[f.name]);
          if (!ok) {
            setToast({
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
            setToast({
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
        const oldVal = (user as any)?.[key] ?? (user as any)?.profile?.[key];
        let newVal = vals[key];

        // normalize empty string -> null
        if (newVal === "") newVal = null;

        // field-specific normalization/validation
        if (key === "student_name" && typeof newVal === "string") {
          const trimmed = newVal.trim().replace(/\s+/g, " ");
          if (!trimmed) {
            newVal = null;
          } else {
            // Allow letters, spaces, hyphens, and apostrophes (e.g., O'Connor, Mary-Jane)
            // but forbid digits and most special characters
            const invalidChars = /[0-9@#$%^&*()_+=\[\]{};:"\\|,.<>/?`~]/;
            if (invalidChars.test(trimmed)) {
              setToast({
                open: true,
                message:
                  "Name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed.",
                severity: "error",
              });
              return;
            }
            // Additional validation: ensure at least 2 characters and reasonable length
            if (trimmed.length < 2) {
              setToast({
                open: true,
                message: "Name must be at least 2 characters long",
                severity: "error",
              });
              return;
            }
            if (trimmed.length > 100) {
              setToast({
                open: true,
                message: "Name must be less than 100 characters",
                severity: "error",
              });
              return;
            }
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
            newVal = newVal.map((s: any) => String(s).trim()).filter(Boolean);
          } else if (typeof newVal === "string") {
            newVal = newVal
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          } else {
            newVal = null;
          }
        }

        // Only include if changed (use fast-deep-equal for better performance than JSON.stringify)
        const oldNormalized = oldVal === undefined ? null : oldVal;
        const newNormalized = newVal === undefined ? null : newVal;
        const bothNull = oldNormalized == null && newNormalized == null;
        if (!bothNull) {
          // Use fast-deep-equal instead of JSON.stringify for better performance
          const changedFlag = !equal(oldNormalized, newNormalized);
          if (changedFlag) changed[key] = newNormalized;
        }
      }

      // Special case: if dob present, convert YYYY-MM-DD -> ISO date string
      // Note: The server expects ISO 8601 format. We convert local date input
      // to UTC ISO string. Timezone differences may cause off-by-one day issues
      // for birth dates near midnight. Consider storing dates as YYYY-MM-DD strings
      // instead of timestamps if exact calendar date is more important than instant.
      if (typeof changed.dob === "string" && changed.dob) {
        try {
          // Validate format: expect YYYY-MM-DD from date input
          if (!/^\d{4}-\d{2}-\d{2}$/.test(changed.dob)) {
            setToast({
              open: true,
              message: "Invalid date format. Expected YYYY-MM-DD.",
              severity: "error",
            });
            return;
          }
          const d = new Date(changed.dob);
          if (!isNaN(d.getTime())) {
            // Verify the date is valid and not in the future (already checked above, but double-check)
            if (d > new Date()) {
              setToast({
                open: true,
                message: "Date of birth cannot be in the future",
                severity: "error",
              });
              return;
            }
            // Convert to ISO 8601 format for server storage
            // Server should handle timezone normalization if needed
            changed.dob = d.toISOString();
          } else {
            setToast({
              open: true,
              message: "Invalid date value",
              severity: "error",
            });
            return;
          }
        } catch {
          setToast({
            open: true,
            message: "Failed to parse date",
            severity: "error",
          });
          return;
        }
      }
      // Always upsert, even if nothing changed, to refresh from server and close
      const res = await updateUserFields(
        uidAtSave,
        Object.keys(changed).length ? changed : {}
      );
      if (res.ok) {
        setToast({
          open: true,
          message: "Saved",
          severity: "success",
        });
        closeDrawer();
      } else {
        setToast({
          open: true,
          message: `Save failed: ${res.error}`,
          severity: "error",
        });
      }
    },
    [
      drawer.userId,
      drawer.fields,
      user,
      updateUserFields,
      setToast,
      closeDrawer,
    ]
  );

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
    // Save to Supabase and dispatch event to trigger profile refresh
    apiClient("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(() => {
        // Dispatch event to trigger profile data refresh
        try {
          window.dispatchEvent(
            new CustomEvent("neram:googleAuthComplete", {
              detail: { uid: (user as any).uid },
            })
          );
        } catch {}
      })
      .catch(() => console.warn("Google user upsert failed"));
    // apiClient is a stable import, not needed in deps
  }, [user, authChecked]);

  // Fetch the server-side Supabase user row once after auth so DB-backed
  // fields (father_name, gender, profile JSON, etc.) appear on refresh.
  const fetchedMeForUid = React.useRef<string | null>(null);
  const isFetchingMe = React.useRef<boolean>(false);
  // Simple local cache for the full DB user row to avoid hitting the DB on
  // every reload. Cache key: `user-cache:<uid>` with shape { user, fetchedAt }.
  // Use configurable cache TTL from config
  const readUserCache = React.useCallback((uid: string) => {
    try {
      const raw = localStorage.getItem(`user-cache:${uid}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        user?: any;
        fetchedAt?: number;
      } | null;
      if (!parsed || !parsed.fetchedAt) return null;
      if (Date.now() - parsed.fetchedAt > CACHE_CONFIG.USER_CACHE_TTL_MS)
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

  // Listen for Google auth completion event to trigger profile refresh
  React.useEffect(() => {
    const handleGoogleAuthComplete = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Reset fetch flag to allow refetch
      fetchedMeForUid.current = null;

      // Fetch fresh data from server
      try {
        const res = await apiClient(`/api/users/me`);
        if (res && res.ok) {
          const parsed = await res.json().catch(() => null);
          const dbUser = parsed && parsed.user ? parsed.user : parsed;
          if (dbUser) {
            setUser(dbUser);
            try {
              writeUserCache(uid, dbUser);
            } catch {}
          }
        }
      } catch {
        // ignore network errors
      }
    };

    window.addEventListener("neram:googleAuthComplete", handleGoogleAuthComplete);
    return () => window.removeEventListener("neram:googleAuthComplete", handleGoogleAuthComplete);
  }, [writeUserCache, setUser]);

  React.useEffect(() => {
    // Always run this effect; prefer showing cached data immediately but also fetch from server to refresh UI
    if (!authChecked) return;
    const uid =
      auth.currentUser?.uid || ((user as any)?.uid ? (user as any).uid : null);
    if (!uid) return;
    if (fetchedMeForUid.current === uid && !isFetchingMe.current) return;

    // Use cache for instant paint (if present), but do NOT short-circuit the server fetch
    let cached = readUserCache(uid);
    if (
      cached &&
      !(cached as any).education_type &&
      !(cached as any).school_std
    ) {
      localStorage.removeItem(`user-cache:${uid}`);
      cached = null;
      console.log("Cleared old cache without education fields");
    }
    if (cached) {
      setUser(cached);
      // Do not set fetchedMeForUid here; we still fetch to get fresh data
    }

    if (isFetchingMe.current) return;
    isFetchingMe.current = true;
    (async () => {
      try {
        const res = await apiClient(`/api/users/me`);
        if (res && res.ok) {
          const parsed = await res.json().catch(() => null);
          const dbUser = parsed && parsed.user ? parsed.user : parsed;
          if (dbUser) {
            setUser(dbUser);
            try {
              writeUserCache(uid, dbUser);
            } catch {}
          }
          fetchedMeForUid.current = uid;
        }
      } catch {
        // ignore network errors
      } finally {
        isFetchingMe.current = false;
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
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mb: 6, overflowX: "clip" }}>
        {/* Page Header with Title and Join Class Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{ color: "primary.main" }}
          >
            My Profile
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => router.push("/applicationform")}
            sx={{
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            Join Class
          </Button>
        </Box>

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
        {/* Wrap Grid to compensate for spacing negative margins on small screens */}
        <Box sx={{ px: { xs: 0, sm: 0 } }}>
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

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                  >
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

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                  >
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

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                  >
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

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                  >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ minWidth: 0, flexWrap: "wrap" }}
                    >
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

                    {/* Password row: conditional based on whether user has password provider */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ minWidth: 200, color: "text.secondary" }}
                      >
                        Password:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {hasPasswordProvider ? (
                          <>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {"••••••••"}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setPwdDialogOpen(true)}
                              aria-label="change-password"
                            >
                              Change password
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              setSetPasswordUsername((user as any)?.username || "");
                              setSetPasswordDialogOpen(true);
                            }}
                            aria-label="set-password"
                            sx={{ fontWeight: 500 }}
                          >
                            Create username & password for easier login
                          </Button>
                        )}
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                    >
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

                {/* Purchases / Entitlements */}
                <Grid item xs={12}>
                  <HeaderCardDesign
                    title="Purchases"
                    icon={null}
                    onEdit={undefined}
                  >
                    {Array.isArray((user as any)?.application?.purchases) &&
                    (user as any).application.purchases.length > 0 ? (
                      <Stack spacing={1}>
                        {(user as any).application.purchases.map(
                          (p: any, idx: number) => (
                            <Box
                              key={p?.paymentId ?? idx}
                              sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                            >
                              <Chip
                                size="small"
                                label={(p.course || "general").toString()}
                              />
                              <Typography variant="body2">
                                {p.amount != null
                                  ? `₹${Number(p.amount).toLocaleString(
                                      "en-IN"
                                    )}`
                                  : ""}{" "}
                                {p.paymentId ? `• ${p.paymentId}` : ""}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {p.granted_at
                                  ? new Date(p.granted_at).toLocaleString()
                                  : ""}
                              </Typography>
                            </Box>
                          )
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No purchases yet.
                      </Typography>
                    )}
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ minWidth: 0, flexWrap: "wrap" }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, minWidth: 0, flexWrap: "wrap" }}
                    >
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
        </Box>
      </Container>

      {/* Drawer for editing */}
      <Drawer
        anchor="right"
        open={drawer.open}
        onClose={closeDrawer}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 420 }, p: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <IconButton aria-label="close" onClick={closeDrawer} size="small">
            {/* simple X icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {drawer.title}
          </Typography>
          <Button
            size="small"
            variant="text"
            sx={{
              height: 28,
              mr: 1,
              display: { xs: "none", sm: "inline-flex" },
            }}
            onClick={async () => {
              try {
                const res = await apiClient(`/api/users/me`);
                if (res && res.ok) {
                  const parsed = await res.json().catch(() => null);
                  const dbUser = parsed && parsed.user ? parsed.user : parsed;
                  if (dbUser) {
                    setUser(dbUser);
                    try {
                      const uid = (dbUser as any)?.uid || auth.currentUser?.uid;
                      if (uid) {
                        localStorage.setItem(
                          `user-cache:${uid}`,
                          JSON.stringify({
                            user: dbUser,
                            fetchedAt: Date.now(),
                          })
                        );
                      }
                    } catch {}
                    setToast({
                      open: true,
                      message: "Refreshed",
                      severity: "success",
                    });
                  }
                }
              } catch {}
            }}
          >
            Refresh
          </Button>
          <Button
            size="small"
            variant="contained"
            sx={{ height: 28 }}
            onClick={handleSubmit(onSave)}
          >
            Save
          </Button>
        </Box>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.25, sm: 2 },
          }}
        >
          {(drawer.fields ?? []).map((f) => {
            // Multi-select field support
            if (f.type === "multi-select") {
              return (
                <Controller
                  key={f.name}
                  name={f.name}
                  control={control}
                  defaultValue={(drawer.values ?? {})[f.name] ?? []}
                  render={({ field }) => (
                    <TextField
                      id={`drawer-field-${String(f.name)}`}
                      name={String(f.name)}
                      select
                      label={f.label}
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={(e) => field.onChange(e.target.value)}
                      fullWidth
                      size="small"
                      disabled={f.name === "email" || f.name === "phone"}
                      sx={{
                        ...textFieldMobileSx,
                        "& .MuiInputBase-root.Mui-disabled": {
                          backgroundColor: (theme) =>
                            (theme as any).palette.action.disabledBackground,
                        },
                      }}
                      SelectProps={{
                        multiple: true,
                        labelId: `drawer-field-${String(f.name)}-label`,
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              "& .MuiMenuItem-root": {
                                fontSize: { xs: 13, sm: 14 },
                                minHeight: { xs: 32, sm: 36 },
                              },
                            },
                          },
                        },
                        renderValue: (selected) =>
                          Array.isArray(selected) ? selected.join(", ") : "",
                      }}
                      InputLabelProps={{
                        id: `drawer-field-${String(f.name)}-label`,
                      }}
                    >
                      {(f.options ?? []).map((opt: any) => {
                        const val = typeof opt === "string" ? opt : opt.value;
                        const lbl = typeof opt === "string" ? opt : opt.label;
                        return (
                          <MenuItem
                            sx={{ fontSize: { xs: 13, sm: 14 } }}
                            key={String(val)}
                            value={val}
                          >
                            {lbl}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )}
                />
              );
            }
            if (f.type === "select") {
              return (
                <Controller
                  key={f.name}
                  name={f.name}
                  control={control}
                  defaultValue={(drawer.values ?? {})[f.name] ?? ""}
                  render={({ field }) => (
                    <TextField
                      id={`drawer-field-${String(f.name)}`}
                      name={String(f.name)}
                      select
                      label={f.label}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      fullWidth
                      size="small"
                      disabled={f.name === "email" || f.name === "phone"}
                      sx={{
                        ...textFieldMobileSx,
                        "& .MuiInputBase-root.Mui-disabled": {
                          backgroundColor: (theme) =>
                            (theme as any).palette.action.disabledBackground,
                        },
                      }}
                      SelectProps={{
                        labelId: `drawer-field-${String(f.name)}-label`,
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              "& .MuiMenuItem-root": {
                                fontSize: { xs: 13, sm: 14 },
                                minHeight: { xs: 32, sm: 36 },
                              },
                            },
                          },
                        },
                      }}
                      InputLabelProps={{
                        id: `drawer-field-${String(f.name)}-label`,
                      }}
                    >
                      {(f.options ?? []).map((opt: any) => {
                        const val = typeof opt === "string" ? opt : opt.value;
                        const lbl = typeof opt === "string" ? opt : opt.label;
                        return (
                          <MenuItem
                            sx={{ fontSize: { xs: 13, sm: 14 } }}
                            key={String(val)}
                            value={val}
                          >
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
                          id={`drawer-field-${String(f.name)}`}
                          name={String(f.name)}
                          label={f.label}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          fullWidth
                          size="small"
                          sx={textFieldMobileSx}
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
                          id={`drawer-field-${String(f.name)}`}
                          name={String(f.name)}
                          label={f.label + " (comma separated)"}
                          value={value.join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((s) => s.trim())
                            )
                          }
                          fullWidth
                          size="small"
                          sx={{
                            ...textFieldMobileSx,
                            "& .MuiInputBase-root.Mui-disabled": {
                              backgroundColor: (theme) =>
                                (theme as any).palette.action
                                  .disabledBackground,
                            },
                          }}
                        />
                        <Box sx={{ mt: 1 }}>
                          {value.filter(Boolean).length ? (
                            value
                              .filter(Boolean)
                              .map((c) => (
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
                    id={`drawer-field-${String(f.name)}`}
                    name={String(f.name)}
                    label={f.label}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={f.name === "email" || f.name === "phone"}
                    fullWidth
                    size="small"
                    sx={{
                      ...textFieldMobileSx,
                      "& .MuiInputBase-root.Mui-disabled": {
                        backgroundColor: (theme) =>
                          (theme as any).palette.action.disabledBackground,
                      },
                    }}
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
              id="pwd-current"
              name="current_password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              id="pwd-new"
              name="new_password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              id="pwd-confirm"
              name="confirm_new_password"
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
                    const current = auth.currentUser;
                    if (!current) {
                      setPwdError("No current user to reauthenticate");
                      return;
                    }
                    const googleProvider = new GoogleAuthProvider();
                    const result = await reauthenticateWithPopup(
                      current,
                      googleProvider
                    );

                    // Verify we reauthenticated the same user
                    if (result.user.uid !== current.uid) {
                      setPwdError(
                        "Reauthentication returned a different user account"
                      );
                      return;
                    }

                    // Verify the token is fresh by attempting to refresh it
                    try {
                      await result.user.getIdToken(true); // force refresh
                    } catch (tokenErr) {
                      setPwdError(
                        "Failed to refresh authentication token: " +
                          String(tokenErr)
                      );
                      return;
                    }

                    setReauthenticated(true);
                    setToast({
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
                  setToast({
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

      {/* Set Password Dialog (for Google users without password) */}
      <Dialog
        open={setPasswordDialogOpen}
        onClose={() => setSetPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Username & Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set up a username and password to easily sign in without needing Google authentication every time.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Username"
              type="text"
              id="set-username"
              name="username"
              value={setPasswordUsername}
              onChange={(e) => setSetPasswordUsername(e.target.value)}
              fullWidth
              helperText="Choose a unique username for login"
            />
            <TextField
              label="New password"
              type="password"
              id="set-password-new"
              name="new_password"
              value={setPasswordNew}
              onChange={(e) => setSetPasswordNew(e.target.value)}
              fullWidth
              helperText="Must be at least 6 characters"
            />
            <TextField
              label="Confirm password"
              type="password"
              id="set-password-confirm"
              name="confirm_password"
              value={setPasswordConfirm}
              onChange={(e) => setSetPasswordConfirm(e.target.value)}
              fullWidth
            />
            {setPasswordError ? (
              <Typography color="error" variant="body2">
                {setPasswordError}
              </Typography>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSetPasswordDialogOpen(false);
            setSetPasswordError(null);
            setSetPasswordNew("");
            setSetPasswordConfirm("");
          }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={setPasswordLoading}
            onClick={async () => {
              setSetPasswordError(null);

              // Validation
              if (!setPasswordUsername || setPasswordUsername.trim().length < 3) {
                setSetPasswordError("Username must be at least 3 characters");
                return;
              }
              if (!setPasswordNew) {
                setSetPasswordError("Please enter a password");
                return;
              }
              if (setPasswordNew.length < 6) {
                setSetPasswordError("Password must be at least 6 characters");
                return;
              }
              if (setPasswordNew !== setPasswordConfirm) {
                setSetPasswordError("Passwords do not match");
                return;
              }

              setSetPasswordLoading(true);
              try {
                const current = auth.currentUser;
                if (!current) {
                  setSetPasswordError("No authenticated user");
                  setSetPasswordLoading(false);
                  return;
                }

                if (!current.email) {
                  setSetPasswordError("Your account doesn't have an email address. Cannot create password login.");
                  setSetPasswordLoading(false);
                  return;
                }

                // First, update username in database if changed
                const trimmedUsername = setPasswordUsername.trim();
                if (trimmedUsername !== (user as any)?.username) {
                  const usernameResult = await updateUserFields(current.uid, {
                    username: trimmedUsername,
                  });
                  if (!usernameResult.ok) {
                    setSetPasswordError(`Failed to set username: ${usernameResult.error}`);
                    setSetPasswordLoading(false);
                    return;
                  }
                }

                // Link email/password credential to the existing account
                try {
                  const credential = EmailAuthProvider.credential(
                    current.email,
                    setPasswordNew
                  );
                  await linkWithCredential(current, credential);

                  setToast({
                    open: true,
                    message: "Username and password created successfully! You can now log in with your credentials.",
                    severity: "success",
                  });

                  // Close dialog and reset form
                  setSetPasswordDialogOpen(false);
                  setSetPasswordUsername("");
                  setSetPasswordNew("");
                  setSetPasswordConfirm("");
                  setSetPasswordError(null);

                  // Refresh user data to reflect new provider
                  try {
                    const res = await apiClient(`/api/users/me`);
                    if (res && res.ok) {
                      const parsed = await res.json().catch(() => null);
                      const dbUser = parsed && parsed.user ? parsed.user : parsed;
                      if (dbUser) setUser(dbUser);
                    }
                  } catch {}
                } catch (linkErr: any) {
                  let errorMsg = "Failed to create password login";
                  if (linkErr?.code === "auth/email-already-in-use") {
                    errorMsg = "This email is already associated with password login";
                  } else if (linkErr?.code === "auth/provider-already-linked") {
                    errorMsg = "Password login is already set up for this account";
                  } else if (linkErr?.message) {
                    errorMsg = linkErr.message;
                  }
                  setSetPasswordError(errorMsg);
                }
              } catch (err) {
                setSetPasswordError("Unexpected error: " + String(err));
              } finally {
                setSetPasswordLoading(false);
              }
            }}
          >
            {setPasswordLoading ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single consolidated toast for all notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === "error" ? 5000 : 3500}
        onClose={() => setToast({ open: false })}
        anchorOrigin={
          toast.anchor ?? { vertical: "bottom", horizontal: "center" }
        }
      >
        <Alert
          onClose={() => setToast({ open: false })}
          severity={toast.severity ?? "success"}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
