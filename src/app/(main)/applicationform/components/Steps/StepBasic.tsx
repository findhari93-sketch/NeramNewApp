"use client";
import React, { useState, useRef, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import Box from "@mui/material/Box";
import GridOrig from "@mui/material/Grid";
const Grid2: any = GridOrig;
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StepHeader from "../ui/TitleWsteps";
import { auth } from "../../../../../lib/firebase";
import { updateProfile } from "firebase/auth";
import PhoneAuth from "../../../../components/shared/PhoneAuth";

type FormData = {
  studentName?: string;
  fatherName?: string;
  gender?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
};

// Use DB-friendly values with user-friendly labels
const genderOptions: Array<{ value: string; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "nonbinary", label: "Other" },
];

interface StepBasicProps {
  form: FormData;
  altPhone: string;
  setAltPhone?: (v: string) => void;
  showAltContact: boolean;
  setShowAltContact?: (b: boolean) => void;
  instagramId: string;
  setInstagramId?: (v: string) => void;
  youtubeSubscribed?: boolean;
  setYoutubeSubscribed?: (b: boolean) => void;
  // step2Errors now carries friendly message strings keyed by field name.
  // If a field has no error, the value should be undefined or an empty string.
  step2Errors: Record<string, string | undefined>;
  setStep2Errors?: (s: Record<string, string | undefined>) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSelectChange: (e: SelectChangeEvent<string>) => void;
  validateStep2: () => boolean;
  saveDraft: () => void;
  saveToDatabase?: () => Promise<{ ok: boolean; error?: string }>;
  setCurrentStep: (n: number) => void;
  // primary phone is stored on form.phone now; verification step removed
  fieldRefs?: React.RefObject<Record<string, HTMLElement | null>>;
  editField?: string | null;
  setEditField?: (s: string | null) => void;
}

export default function StepBasic(props: StepBasicProps) {
  const {
    form,
    altPhone,
    setAltPhone,
    showAltContact,
    setShowAltContact,
    instagramId,
    setInstagramId,
    step2Errors,
    handleChange,
    handleSelectChange,
    validateStep2,
    saveDraft,
    saveToDatabase,
    setCurrentStep,
    fieldRefs: externalFieldRefs,
    editField: parentEditField,
    setEditField: parentSetEditField,
  } = props;

  const localFieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const fieldRefs = externalFieldRefs ?? localFieldRefs;
  const [editField, setEditField] = useState<string | null>(null);
  const [hoverCsc, setHoverCsc] = useState<string | null>(null);
  const zipLookupController = useRef<AbortController | null>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  // Initialize verifiedPhone from form.phone if it exists
  const [verifiedPhone, setVerifiedPhone] = useState<string>(form.phone || "");
  const [phoneVerificationSuccess, setPhoneVerificationSuccess] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });
  const zipDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Removed zip lookup debug/loading UI state

  // Extracted common styles
  const FIELD_HEIGHT = 40;
  const BORDER_RADIUS = 1; // theme units

  // Refs for key inputs to support focus management and parent-driven edits
  const studentNameRef = useRef<HTMLInputElement | null>(null);
  const fatherNameRef = useRef<HTMLInputElement | null>(null);
  const zipCodeRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  // When this step mounts, focus the first logical input (studentName) to aid keyboard users
  useEffect(() => {
    try {
      studentNameRef.current?.focus?.();
    } catch (e) {
      console.warn("StepBasic: failed to focus studentName on mount", e);
    }
    // run on mount only
  }, []);

  const normalizeGender = (v?: string | null) => {
    if (!v) return "";
    const s = String(v).trim().toLowerCase();
    const map: Record<string, string> = {
      male: "male",
      m: "male",
      female: "female",
      f: "female",
      other: "nonbinary",
      o: "nonbinary",
      nonbinary: "nonbinary",
      "non-binary": "nonbinary",
      "non binary": "nonbinary",
      nb: "nonbinary",
    };
    return map[s] ?? "";
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 16,
    padding: "10px 12px",
    marginBottom: 16,
    background: "#fff",
  };

  // Helper: fetch city/state from zip (India postal API first, then Nominatim fallback)
  const fetchCityStateFromZip = async (zip: string, signal?: AbortSignal) => {
    const cleaned = String(zip || "").trim();
    if (!cleaned) return;
    try {
      // India PIN (6 digits)
      if (/^\d{6}$/.test(cleaned)) {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${cleaned}`,
            { signal }
          );
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json[0]?.Status === "Success") {
              const post = json[0].PostOffice && json[0].PostOffice[0];
              if (post) {
                try {
                  // update fields via provided handler
                  try {
                    handleChange({
                      target: { name: "city", value: post.District || "" },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                    handleChange({
                      target: { name: "state", value: post.State || "" },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                    handleChange({
                      target: { name: "country", value: "India" },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  } catch {}
                } catch {}
                return;
              }
            }
          }
        } catch {
          // swallow postal api errors
        }
      }

      // Fallback: Nominatim search restricted to allowed countries
      const ALLOWED_COUNTRY_CODES = ["ae", "in", "sa", "om", "lk"];
      for (const cc of ALLOWED_COUNTRY_CODES) {
        if (signal?.aborted) return;
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=${cc}&q=${encodeURIComponent(
          cleaned
        )}`;
        try {
          const r = await fetch(url, {
            headers: { "User-Agent": "neram-app/1.0" },
            signal,
          });
          if (!r.ok) continue;
          const results = await r.json();
          if (Array.isArray(results) && results.length > 0) {
            const addr = results[0].address || {};
            try {
              try {
                handleChange({
                  target: {
                    name: "city",
                    value: addr.city || addr.town || addr.village || "",
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
                handleChange({
                  target: { name: "state", value: addr.state || "" },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
                handleChange({
                  target: { name: "country", value: addr.country || "" },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              } catch {}
            } catch {}
            return;
          }
        } catch {
          // swallow nominatim errors and continue to next country code
          continue;
        }
      }
    } finally {
      // no-op
    }
  };

  // Trigger lookup when zip changes (3-8 chars) with debounce
  useEffect(() => {
    const zip = String(form.zipCode || "").trim();

    // Clear any pending timer
    if (zipDebounceTimer.current) {
      clearTimeout(zipDebounceTimer.current);
      zipDebounceTimer.current = null;
    }

    if (/^[A-Za-z0-9\-\s]{3,8}$/.test(zip)) {
      // Debounce zip lookup by 400ms
      zipDebounceTimer.current = setTimeout(() => {
        if (zipLookupController.current) {
          try {
            zipLookupController.current.abort();
          } catch {}
        }
        const controller = new AbortController();
        zipLookupController.current = controller;
        fetchCityStateFromZip(zip, controller.signal).finally(() => {
          if (zipLookupController.current === controller)
            zipLookupController.current = null;
        });
      }, 400);
    }

    return () => {
      if (zipDebounceTimer.current) {
        clearTimeout(zipDebounceTimer.current);
        zipDebounceTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.zipCode]);

  // Autofill student name and email from Firebase user once on mount if empty
  useEffect(() => {
    try {
      const u = auth.currentUser;
      if (!u) return;
      const updates: Partial<FormData> = {};
      if (!form.email && u.email) updates.email = u.email;
      const display = u.displayName || "";
      if (!form.studentName && display) updates.studentName = display;
      if (Object.keys(updates).length > 0) {
        // drive through handlers so parent state updates
        if (updates.email) {
          handleChange({
            target: { name: "email", value: updates.email },
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
        if (updates.studentName) {
          handleChange({
            target: { name: "studentName", value: updates.studentName },
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
        // save silently
        if (saveToDatabase) {
          saveToDatabase().catch(() => {});
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When parent requests an edit, adopt it and focus the corresponding input
  React.useEffect(() => {
    if (typeof parentEditField !== "undefined" && parentEditField !== null) {
      try {
        setEditField(parentEditField);
        setTimeout(() => {
          try {
            const el = fieldRefs.current[parentEditField];
            if (el && (el as HTMLInputElement).focus)
              (el as HTMLInputElement).focus();
          } catch {}
        }, 80);
        // clear parent's intent so it doesn't repeatedly trigger
        try {
          if (parentSetEditField) parentSetEditField(null);
        } catch {}
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentEditField]);

  // Initialize verifiedPhone from form.phone if it exists
  React.useEffect(() => {
    if (form.phone && !verifiedPhone) {
      setVerifiedPhone(form.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.phone]);

  return (
    <Box sx={{ maxWidth: 680, m: { xs: 2, md: 5 } }}>
      <Box component="form" onSubmit={(e) => e.preventDefault()}>
        {/* use shared StepHeader */}
        <StepHeader title="BasicDetails" steps="Step 1 of 3" />

        <Grid2 container spacing={2} sx={{ mt: 1 }}>
          {/* Student Name and Father Name */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              id="studentName"
              size="small"
              name="studentName"
              label="Student Name"
              value={form.studentName || ""}
              onChange={handleChange}
              onBlur={async () => {
                // Auto-save student name when the field loses focus
                try {
                  const trimmed = String(form.studentName || "").trim();
                  if (trimmed && auth.currentUser) {
                    const currentDisplay = auth.currentUser.displayName || "";
                    // If displayName is missing or equals phone, set it to the provided name
                    if (
                      !currentDisplay ||
                      currentDisplay === (auth.currentUser.phoneNumber || "") ||
                      currentDisplay !== trimmed
                    ) {
                      try {
                        await updateProfile(auth.currentUser, {
                          displayName: trimmed,
                        });
                      } catch {
                        // non-fatal: proceed to DB save even if displayName update failed
                      }
                    }
                  }
                  if (saveToDatabase) await saveToDatabase();
                } catch {}
              }}
              fullWidth
              error={!!step2Errors.studentName}
              helperText={step2Errors.studentName || ""}
              variant="outlined"
              autoComplete="off"
              inputRef={(el: HTMLInputElement | null) => {
                studentNameRef.current = el;
                fieldRefs.current["studentName"] = el;
              }}
              inputProps={{
                "aria-describedby": step2Errors.studentName
                  ? "studentName-error"
                  : undefined,
              }}
              FormHelperTextProps={{
                id: step2Errors.studentName ? "studentName-error" : undefined,
                role: step2Errors.studentName ? "status" : undefined,
                "aria-live": step2Errors.studentName ? "polite" : undefined,
              }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              id="fatherName"
              size="small"
              name="fatherName"
              label="Father Name"
              value={form.fatherName || ""}
              onChange={handleChange}
              fullWidth
              error={!!step2Errors.fatherName}
              helperText={step2Errors.fatherName || ""}
              variant="outlined"
              autoComplete="off"
              inputRef={(el: HTMLInputElement | null) => {
                fatherNameRef.current = el;
                fieldRefs.current["fatherName"] = el;
              }}
              inputProps={{
                "aria-describedby": step2Errors.fatherName
                  ? "fatherName-error"
                  : undefined,
              }}
              FormHelperTextProps={{
                id: step2Errors.fatherName ? "fatherName-error" : undefined,
                role: step2Errors.fatherName ? "status" : undefined,
                "aria-live": step2Errors.fatherName ? "polite" : undefined,
              }}
            />
          </Grid2>

          {/* Gender */}
          <Grid2 size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                size="small"
                name="gender"
                value={normalizeGender(form.gender)}
                label="Gender"
                onChange={handleSelectChange}
              >
                {genderOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          {/* Zip Code */}
          <Grid2 size={{ xs: 12 }}>
            <TextField
              id="zipCode"
              size="small"
              name="zipCode"
              label="Address Zip Code"
              value={form.zipCode || ""}
              onChange={handleChange}
              fullWidth
              error={!!step2Errors.zipCode}
              helperText={step2Errors.zipCode || ""}
              variant="outlined"
              placeholder="Postal / ZIP code"
              autoComplete="off"
              inputRef={(el: HTMLInputElement | null) => {
                zipCodeRef.current = el;
                fieldRefs.current["zipCode"] = el;
              }}
              inputProps={{
                "aria-describedby": step2Errors.zipCode
                  ? "zipCode-error"
                  : undefined,
              }}
              FormHelperTextProps={{
                id: step2Errors.zipCode ? "zipCode-error" : undefined,
                role: step2Errors.zipCode ? "status" : undefined,
                "aria-live": step2Errors.zipCode ? "polite" : undefined,
              }}
            />
          </Grid2>

          {/* City, State, Country */}
          <Grid2 size={{ xs: 12 }}>
            <Box sx={{ mt: (form.zipCode || "").toString().trim() ? 0 : 0 }}>
              {(form.zipCode || "").toString().trim() ? (
                editField === "city" ? (
                  <TextField
                    id="city"
                    size="small"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    onBlur={() => setEditField(null)}
                    inputRef={(el: HTMLInputElement | null) => {
                      fieldRefs.current["city"] = el;
                    }}
                    autoFocus
                  />
                ) : editField === "state" ? (
                  <TextField
                    id="state"
                    size="small"
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    onBlur={() => setEditField(null)}
                    inputRef={(el: HTMLInputElement | null) => {
                      fieldRefs.current["state"] = el;
                    }}
                    autoFocus
                  />
                ) : editField === "country" ? (
                  <TextField
                    id="country"
                    size="small"
                    name="country"
                    value={form.country || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    onBlur={() => setEditField(null)}
                    inputRef={(el: HTMLInputElement | null) => {
                      fieldRefs.current["country"] = el;
                    }}
                    autoFocus
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {form.city ? (
                      <Box
                        onMouseEnter={() => setHoverCsc("city")}
                        onMouseLeave={() => setHoverCsc(null)}
                        onClick={() => setEditField("city")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setEditField("city");
                        }}
                      >
                        <Typography sx={{ color: "#666", fontSize: 13 }}>
                          City :{" "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {form.city}
                          </Box>
                        </Typography>
                        {hoverCsc === "city" && (
                          <Button
                            size="small"
                            aria-label="Edit city"
                            onClick={() => setEditField("city")}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              lineHeight: 1,
                              height: "1em",
                              fontSize: 13,
                            }}
                          >
                            ✏️
                          </Button>
                        )}
                      </Box>
                    ) : null}

                    {form.city && form.state ? (
                      <Typography sx={{ color: "#bbb", fontSize: 13 }}>
                        |
                      </Typography>
                    ) : null}

                    {form.state ? (
                      <Box
                        onMouseEnter={() => setHoverCsc("state")}
                        onMouseLeave={() => setHoverCsc(null)}
                        onClick={() => setEditField("state")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setEditField("state");
                        }}
                      >
                        <Typography sx={{ color: "#666", fontSize: 13 }}>
                          State :{" "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {form.state}
                          </Box>
                        </Typography>
                        {hoverCsc === "state" && (
                          <Button
                            size="small"
                            aria-label="Edit state"
                            onClick={() => setEditField("state")}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              lineHeight: 1,
                              height: "1em",
                              fontSize: 13,
                            }}
                          >
                            ✏️
                          </Button>
                        )}
                      </Box>
                    ) : null}

                    {(form.state && form.country) ||
                    (form.city && form.country) ? (
                      <Typography sx={{ color: "#bbb", fontSize: 13 }}>
                        |
                      </Typography>
                    ) : null}

                    {form.country ? (
                      <Box
                        onMouseEnter={() => setHoverCsc("country")}
                        onMouseLeave={() => setHoverCsc(null)}
                        onClick={() => setEditField("country")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setEditField("country");
                        }}
                      >
                        <Typography sx={{ color: "#666", fontSize: 13 }}>
                          Country :{" "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {form.country}
                          </Box>
                        </Typography>
                        {hoverCsc === "country" && (
                          <Button
                            size="small"
                            aria-label="Edit country"
                            onClick={() => setEditField("country")}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              lineHeight: 1,
                              height: "1em",
                              fontSize: 13,
                            }}
                          >
                            ✏️
                          </Button>
                        )}
                      </Box>
                    ) : null}
                  </Box>
                )
              ) : null}
            </Box>
          </Grid2>

          {/* Phone Number */}
          <Grid2 size={{ xs: 12 }}>
            <Box>
              {verifiedPhone || form.phone ? (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    id="phone"
                    size="small"
                    name="phone"
                    label="Phone"
                    value={verifiedPhone || form.phone || ""}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      sx: {
                        height: FIELD_HEIGHT,
                        backgroundColor: "#f5f5f5",
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          {phoneVerificationSuccess && (
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: "success.main", mr: 0.5 }}
                            />
                          )}
                          <IconButton
                            aria-label="Edit phone number"
                            onClick={() => setPhoneDialogOpen(true)}
                            edge="end"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {!showAltContact && (
                    <Button
                      size="small"
                      onClick={() => setShowAltContact?.(true)}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Add additional contact
                    </Button>
                  )}
                </Box>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PhoneIcon />}
                  onClick={() => setPhoneDialogOpen(true)}
                  sx={{
                    py: 1.5,
                    backgroundColor: "#7c1fa0",
                    "&:hover": { backgroundColor: "#6a1a8a" },
                  }}
                >
                  Add Phone Number
                </Button>
              )}

              {showAltContact && (
                <Box sx={{ mt: 1 }}>
                  <PhoneInput
                    country={"in"}
                    value={altPhone}
                    onChange={(v: string) => setAltPhone?.(v)}
                    inputProps={{ name: "altPhone", autoComplete: "off" }}
                    inputStyle={{ ...inputStyle, width: "100%", height: 40 }}
                    specialLabel=""
                    enableSearch
                  />
                </Box>
              )}
            </Box>
          </Grid2>

          {/* Email and Instagram */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              id="email"
              size="small"
              name="email"
              label="Email ID"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              fullWidth
              error={!!step2Errors.email}
              helperText={step2Errors.email || ""}
              variant="outlined"
              placeholder="Enter email"
              autoComplete="off"
              InputProps={{
                sx: {
                  height: FIELD_HEIGHT,
                  boxSizing: "border-box",
                },
              }}
              inputRef={(el: HTMLInputElement | null) => {
                emailRef.current = el;
                fieldRefs.current["email"] = el;
              }}
              inputProps={{
                "aria-describedby": step2Errors.email
                  ? "email-error"
                  : undefined,
              }}
              FormHelperTextProps={{
                id: step2Errors.email ? "email-error" : undefined,
                role: step2Errors.email ? "status" : undefined,
                "aria-live": step2Errors.email ? "polite" : undefined,
              }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              id="instagramId"
              size="small"
              name="instagramId"
              label="Instagram handle (optional)"
              type="text"
              value={instagramId || ""}
              onChange={(e) => setInstagramId?.(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="@yourhandle or username"
              autoComplete="off"
              InputProps={{
                sx: {
                  height: FIELD_HEIGHT,
                  boxSizing: "border-box",
                },
              }}
            />
          </Grid2>
        </Grid2>

        {/* Phone Verification Dialog */}
        <Dialog
          open={phoneDialogOpen}
          onClose={() => setPhoneDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: BORDER_RADIUS * 2,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#7c1fa0",
              color: "white",
              py: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PhoneIcon />
            <Typography variant="h6" component="span">
              Verify Phone Number
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <PhoneAuth
              initialPhone={verifiedPhone || undefined}
              onVerified={(phone: string) => {
                setVerifiedPhone(phone);
                setPhoneVerificationSuccess(true);
                // Update form state
                handleChange({
                  target: { name: "phone", value: phone },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
                // Save to database
                if (saveToDatabase) {
                  saveToDatabase().catch(() => {});
                }
                // Close dialog after brief delay
                setTimeout(() => {
                  setPhoneDialogOpen(false);
                }, 500);
              }}
              label="off"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPhoneDialogOpen(false)} color="inherit">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          <Button
            variant="text"
            onClick={async () => {
              saveDraft();
              if (saveToDatabase) {
                setIsSaving(true);
                try {
                  await saveToDatabase();
                  setSnackbar({
                    open: true,
                    message: "Draft saved successfully!",
                    severity: "success",
                  });
                } catch {
                  setSnackbar({
                    open: true,
                    message: "Save failed. Changes stored locally.",
                    severity: "error",
                  });
                } finally {
                  setIsSaving(false);
                }
              }
            }}
            sx={{ minWidth: 120 }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            disabled={isSaving}
            onClick={async () => {
              if (!validateStep2()) return;
              saveDraft();
              // Save to database
              if (saveToDatabase) {
                setIsSaving(true);
                try {
                  const result = await saveToDatabase();
                  if (!result.ok) {
                    // Continue to next step even if database save fails (data is in localStorage)
                    setSnackbar({
                      open: true,
                      message: "Save failed. Changes stored locally.",
                      severity: "warning",
                    });
                  } else {
                    setSnackbar({
                      open: true,
                      message: "Saved successfully!",
                      severity: "success",
                    });
                  }
                } catch {
                  setSnackbar({
                    open: true,
                    message: "Save failed. Changes stored locally.",
                    severity: "error",
                  });
                } finally {
                  setIsSaving(false);
                }
              }
              setCurrentStep(2);
            }}
            sx={{ minWidth: 120 }}
          >
            {isSaving ? "Saving..." : "Save & Next"}
          </Button>
        </Stack>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
