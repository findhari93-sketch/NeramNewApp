"use client";
import React, { useState, useRef, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Box from "@mui/material/Box";
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
import StepHeader from "../ui/TitleWsteps";
import { auth } from "../../../../lib/firebase";
import { updateProfile } from "firebase/auth";

type FormData = {
  studentName?: string;
  fatherName?: string;
  gender?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
};

const genderOptions = ["Male", "Female", "Other"];

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
  step2Errors: Record<string, boolean>;
  setStep2Errors?: (s: Record<string, boolean>) => void;
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
  verifiedPhone?: string | null;
  setVerifiedPhone?: (p: string | null) => void;
  setPhoneToEdit?: (p: string | null) => void;
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
    verifiedPhone,
    setVerifiedPhone,
    // optional setter to indicate phone should be edited in PhoneAuth
    setPhoneToEdit,
    fieldRefs: externalFieldRefs,
    editField: parentEditField,
    setEditField: parentSetEditField,
  } = props;

  const localFieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const fieldRefs = externalFieldRefs ?? localFieldRefs;
  const [editField, setEditField] = useState<string | null>(null);
  const [hoverCsc, setHoverCsc] = useState<string | null>(null);
  const zipLookupController = useRef<AbortController | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipDebug, setZipDebug] = useState<string | null>(null);

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
    setZipDebug(`query:${cleaned}`);
    setZipLoading(true);
    console.log("zipLookup: starting lookup for", cleaned);
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
                console.log("zipLookup: postal api result", post);
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
                setZipDebug(`We found: ${post.District}, ${post.State}, India`);
                return;
              }
            }
          }
        } catch (e) {
          console.warn("zipLookup: postal api error", e);
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
            console.log("zipLookup: nominatim hit", addr);
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
            setZipDebug(
              `found: ${addr.city || addr.town || addr.village || ""}, ${
                addr.state || ""
              }, ${addr.country || ""}`
            );
            return;
          }
        } catch (e) {
          console.warn("zipLookup: nominatim error", e);
          continue;
        }
      }

      setZipDebug("no results");
    } finally {
      setZipLoading(false);
    }
  };

  // Trigger lookup when zip changes (3-8 chars)
  useEffect(() => {
    const zip = String(form.zipCode || "").trim();
    if (/^[A-Za-z0-9\-\s]{3,8}$/.test(zip)) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.zipCode]);

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

  return (
    <Box sx={{ maxWidth: 520, m: 5 }}>
      <Box component="form" onSubmit={(e) => e.preventDefault()}>
        {/* header */}
        {/* ...existing code... */}
        {/* use shared StepHeader */}
        <StepHeader title="BasicDetails" steps="Step 1 of 5" />

        <Box sx={{ display: "flex", gap: 1, alignItems: "top" }}>
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
                    } catch (e) {
                      // non-fatal: proceed to DB save even if displayName update failed
                      console.warn("updateProfile failed", e);
                    }
                  }
                }
                if (saveToDatabase) await saveToDatabase();
              } catch {}
            }}
            sx={{ flex: 1, "& .MuiFormHelperText-root": { minHeight: 20 } }}
            error={!!step2Errors.studentName}
            helperText={step2Errors.studentName ? "Required" : ""}
            margin="normal"
            variant="outlined"
            autoComplete="off"
          />
          <TextField
            id="fatherName"
            size="small"
            name="fatherName"
            label="Father Name"
            value={form.fatherName || ""}
            onChange={handleChange}
            sx={{ flex: 1, "& .MuiFormHelperText-root": { minHeight: 20 } }}
            error={!!step2Errors.fatherName}
            helperText={step2Errors.fatherName ? "Required" : ""}
            margin="normal"
            variant="outlined"
            autoComplete="off"
          />
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            id="gender"
            size="small"
            name="gender"
            value={form.gender || ""}
            label="Gender"
            onChange={handleSelectChange}
          >
            {genderOptions.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          id="zipCode"
          size="small"
          name="zipCode"
          label="Address Zip Code"
          value={form.zipCode || ""}
          onChange={handleChange}
          fullWidth
          error={!!step2Errors.zipCode}
          helperText={step2Errors.zipCode ? "Required" : ""}
          margin="normal"
          variant="outlined"
          placeholder="Postal / ZIP code"
          autoComplete="off"
        />

        {/* Debug / zip lookup status (visible on page) */}
        {zipLoading || zipDebug ? (
          <Typography sx={{ fontSize: 12, color: "#666", mt: 0.5 }}>
            {zipLoading ? "Looking up postal code..." : zipDebug}
          </Typography>
        ) : null}

        <Box sx={{ mt: (form.zipCode || "").toString().trim() ? 0 : 2 }}>
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

                {(form.state && form.country) || (form.city && form.country) ? (
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

        {!showAltContact ? (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                position: "relative",
                "&:hover .hoverIcons": { display: "flex" },
              }}
            >
              <TextField
                id="verifiedPhone"
                size="small"
                value={verifiedPhone || ""}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        className="hoverIcons"
                        sx={{ display: "none", alignItems: "center", gap: 0.5 }}
                      >
                        <IconButton
                          aria-label="Add additional contact"
                          onClick={() => {
                            setShowAltContact?.(true);
                            setTimeout(() => {
                              try {
                                const el = document.querySelector(
                                  'input[name="altPhone"]'
                                ) as HTMLInputElement | null;
                                if (el) el.focus();
                              } catch {}
                            }, 120);
                          }}
                          size="small"
                          sx={{ p: 0.5, fontSize: 14 }}
                        >
                          <Box component="span" sx={{ fontSize: 16 }}>
                            ➕
                          </Box>
                        </IconButton>
                        <IconButton
                          aria-label="Change verified phone"
                          onClick={() => {
                            try {
                              // clear the verified marker so PhoneAuth allows editing
                              localStorage.removeItem("phone_verified");
                            } catch {}
                            try {
                              // tell PhoneAuth which phone to prefill for re-verification
                              setPhoneToEdit?.(
                                verifiedPhone ||
                                  localStorage.getItem("phone_verified")
                              );
                            } catch {}
                            setVerifiedPhone?.(null);
                            setCurrentStep(1);
                          }}
                          size="small"
                          sx={{ p: 0.5, fontSize: 14 }}
                        >
                          <Box component="span" sx={{ fontSize: 15 }}>
                            ✏️
                          </Box>
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: "#f7f7f7",
                  "& .MuiInputBase-input": {
                    height: 40,
                    boxSizing: "border-box",
                    padding: "10px 12px",
                  },
                }}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1, alignItems: "top", mt: 2 }}>
            <Box
              sx={{
                flex: 1,
                position: "relative",
                "&:hover .hoverIcons": { display: "flex" },
              }}
            >
              <TextField
                id="verifiedPhone"
                size="small"
                value={verifiedPhone || ""}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        className="hoverIcons"
                        sx={{ display: "none", alignItems: "center", gap: 0.5 }}
                      >
                        <IconButton
                          aria-label="Change verified phone"
                          onClick={() => {
                            try {
                              localStorage.removeItem("PHONE_KEY");
                            } catch {}
                            setVerifiedPhone?.(null);
                            setCurrentStep(1);
                          }}
                          size="small"
                          sx={{ p: 0.5, fontSize: 14 }}
                        >
                          <Box component="span" sx={{ fontSize: 15 }}>
                            ✏️
                          </Box>
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: "#f7f7f7",
                  "& .MuiInputBase-input": {
                    height: 40,
                    boxSizing: "border-box",
                    padding: "10px 12px",
                  },
                }}
                fullWidth
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
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
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
          <TextField
            id="email"
            size="small"
            name="email"
            label="Email ID"
            type="email"
            value={form.email || ""}
            onChange={handleChange}
            sx={{
              flex: 1,
              "& .MuiInputBase-input": {
                height: 40,
                boxSizing: "border-box",
                padding: "10px 12px",
              },
              "& .MuiFormHelperText-root": { minHeight: 20 },
            }}
            error={!!step2Errors.email}
            helperText={step2Errors.email ? "Enter a valid email" : ""}
            variant="outlined"
            placeholder="Enter email"
            autoComplete="off"
            margin="dense"
          />

          <TextField
            id="instagramId"
            size="small"
            name="instagramId"
            label="Instagram handle (optional)"
            type="text"
            value={instagramId || ""}
            onChange={(e) => setInstagramId?.(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiInputBase-input": {
                height: 40,
                boxSizing: "border-box",
                padding: "10px 12px",
              },
              "& .MuiFormHelperText-root": { minHeight: 20 },
            }}
            variant="outlined"
            placeholder="@yourhandle or username"
            autoComplete="off"
            margin="dense"
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={async () => {
              if (!validateStep2()) return;
              saveDraft();
              // Save to database
              if (saveToDatabase) {
                const result = await saveToDatabase();
                if (!result.ok) {
                  console.error("Failed to save step data:", result.error);
                  // Continue to next step even if database save fails (data is in localStorage)
                }
              }
              setCurrentStep(3);
            }}
          >
            Save & Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
