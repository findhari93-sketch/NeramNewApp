"use client";
import React, { useState, useRef } from "react";
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
  setCurrentStep: (n: number) => void;
  verifiedPhone?: string | null;
  setVerifiedPhone?: (p: string | null) => void;
  fieldRefs?: React.RefObject<Record<string, HTMLElement | null>>;
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
    setCurrentStep,
    verifiedPhone,
    setVerifiedPhone,
    fieldRefs: externalFieldRefs,
  } = props;

  const localFieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const fieldRefs = externalFieldRefs ?? localFieldRefs;
  const [editField, setEditField] = useState<string | null>(null);
  const [hoverCsc, setHoverCsc] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 16,
    padding: "10px 12px",
    marginBottom: 16,
    background: "#fff",
  };

  return (
    <Box sx={{ maxWidth: 520, m: 5 }}>
      <Box component="form" onSubmit={(e) => e.preventDefault()}>
        <Typography sx={{ mb: 1.5, fontSize: 14, color: "#666" }}>
          Step 2 • Basic details
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "top" }}>
          <TextField
            id="studentName"
            size="small"
            name="studentName"
            label="Student Name"
            value={form.studentName || ""}
            onChange={handleChange}
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
            onClick={() => {
              if (!validateStep2()) return;
              saveDraft();
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
