"use client";
import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StepHeader from "../ui/TitleWsteps";

// Extract AcademicYearControl to module scope to prevent re-creation on every render
const AcademicYearControl = React.memo(function AcademicYearControl({
  name,
  form,
  handleChange,
  getAcademicStartYear,
  formatAcademicYear,
}) {
  const defaultStart = getAcademicStartYear();
  const minYear = getAcademicStartYear(
    new Date(new Date().getFullYear() - 10, 6, 1)
  );
  const maxYear = getAcademicStartYear(
    new Date(new Date().getFullYear() + 5, 6, 1)
  );
  const currStart = Number(form?.[name] ?? defaultStart);
  const canPrev = currStart > minYear;
  const canNext = currStart < maxYear;
  const changeYear = (nextStart) => {
    try {
      handleChange({ target: { name, value: String(nextStart) } });
    } catch (e) {
      console.warn(`Failed to change year for ${name}:`, e);
    }
  };

  return (
    <TextField
      size="small"
      id={name}
      name={name}
      value={formatAcademicYear(currStart)}
      variant="outlined"
      margin="dense"
      sx={{ width: "100%" }}
      InputProps={{
        readOnly: true,
        startAdornment: (
          <InputAdornment
            position="start"
            sx={{
              mr: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
            }}
          >
            <IconButton
              type="button"
              onClick={() => canPrev && changeYear(currStart - 1)}
              aria-label="Previous year"
              sx={{ p: 0, minWidth: 32, height: 32 }}
              disabled={!canPrev}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment
            position="end"
            sx={{ ml: 0, display: "flex", alignItems: "center" }}
          >
            <IconButton
              type="button"
              onClick={() => canNext && changeYear(currStart + 1)}
              aria-label="Next year"
              sx={{ p: "6px" }}
              disabled={!canNext}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
});

export default function StepEdu(props) {
  const {
    form = {},
    handleChange = () => {},
    handleSelectChange = () => {},
    educationType = "school",
    setEducationType = () => {},
    schoolStd = "12th",
    setSchoolStd = () => {},
    standardOptions = ["Below 10th", "10th", "11th", "12th"],
    collegeName,
    setCollegeName,
    collegeYear,
    setCollegeYear,
    diplomaCourse,
    setDiplomaCourse,
    diplomaYear,
    setDiplomaYear,
    diplomaCollege,
    setDiplomaCollege,
    otherDescription,
    setOtherDescription,
    cycleDiplomaYear = () => {},
    // Accept either `setStep` (new) or `setCurrentStep` (older prop) from parent.
    // We'll resolve to whichever is provided so the buttons always work.
    setStep: _maybeSetStep = undefined,
    validateStep2 = () => true,
    saveDraft = () => {},
    selectedCourse = null,
    setSelectedCourse = () => {},
    softwareCourse = null,
    setSoftwareCourse = () => {},
  } = props;
  const {
    step2Errors = {},
    setStep2Errors = () => {},
    validateEdu = () => true,
  } = props;

  // If parent passed `setStep` use it, otherwise fall back to `setCurrentStep`.
  const setStep = _maybeSetStep || props.setCurrentStep || (() => {});

  const labelStyle = { fontSize: 12 };

  // Refs for first-focusable fields in each education type so we can move
  // keyboard focus into the step when it becomes active (improves keyboard
  // flow after Save & Next navigation).
  const schoolNameRef = React.useRef(null);
  const diplomaCourseRef = React.useRef(null);
  const diplomaCollegeRef = React.useRef(null);
  const collegeNameRef = React.useRef(null);
  const otherDescriptionRef = React.useRef(null);

  // When the step mounts, focus the logical first input for the active education type.
  React.useEffect(() => {
    try {
      if (educationType === "school") {
        schoolNameRef.current?.focus?.();
      } else if (educationType === "diploma") {
        diplomaCourseRef.current?.focus?.();
      } else if (educationType === "college") {
        collegeNameRef.current?.focus?.();
      } else if (educationType === "other") {
        otherDescriptionRef.current?.focus?.();
      }
    } catch (e) {
      // non-fatal, but useful for debugging if focus fails
      console.warn("Failed to focus first field in StepEdu:", e);
    }
    // run on mount only (focus when step becomes active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getAcademicStartYear(d = new Date()) {
    const y = d.getFullYear();
    const month = d.getMonth(); // 0-11
    const date = d.getDate();
    // if date is on/after June 25 -> use current year, else previous year
    if (month > 5 || (month === 5 && date >= 25)) return y;
    return y - 1;
  }
  function formatAcademicYear(start) {
    const s = Number(start) || getAcademicStartYear();
    const end = (s + 1) % 100;
    return `${s}-${String(end).padStart(2, "0")}`;
  }

  const collegeYearOptions = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
  ];

  // Default collegeYear on mount if not set
  // Explicit intent: Initialize collegeYear to first option when component mounts
  React.useEffect(() => {
    if (!collegeYear && collegeYearOptions.length && setCollegeYear) {
      setCollegeYear(collegeYearOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount; collegeYearOptions is static

  // Ensure nataAttemptYear has a default value in form so it is persisted
  React.useEffect(() => {
    if (form && typeof form.nataAttemptYear === "undefined") {
      try {
        const start = getAcademicStartYear();
        handleChange({
          target: { name: "nataAttemptYear", value: String(start) },
        });
      } catch (e) {
        console.warn("Failed to set default nataAttemptYear:", e);
      }
    }
    // Only run once on mount for defaulting; avoid loop by not depending on form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure boardYear has a default start year when educationType is 'school'
  React.useEffect(() => {
    if (
      educationType === "school" &&
      form &&
      typeof form.boardYear === "undefined"
    ) {
      try {
        const start = getAcademicStartYear();
        handleChange({
          target: { name: "boardYear", value: String(start) },
        });
      } catch (e) {
        console.warn("Failed to set default boardYear:", e);
      }
    }
    // Run when educationType toggles to school; avoid depending on form to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educationType]);

  return (
    <Box sx={{ maxWidth: 520, m: { xs: 2, md: 5 } }}>
      <Box sx={{ mt: 1.5 }}>
        <StepHeader title="Education" steps="Step 2 of 3" />
        <FormControl component="fieldset" sx={{ mt: 1 }}>
          <RadioGroup
            row
            value={educationType}
            onChange={(e) => setEducationType(e.target.value)}
          >
            <FormControlLabel
              value="school"
              control={<Radio />}
              label="School"
            />
            <FormControlLabel
              value="diploma"
              control={<Radio />}
              label="Diploma"
            />
            <FormControlLabel
              value="college"
              control={<Radio />}
              label="College"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {educationType === "school" && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                gap: 1,
                alignItems: "flex-start",
                // Keep row layout even on mobile; allow horizontal scroll if crowded
                flexDirection: "row",
                flexWrap: { xs: "nowrap", sm: "wrap" },
                overflowX: { xs: "auto", sm: "visible" },
                WebkitOverflowScrolling: "touch",
                pr: { xs: 1, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 200, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Standard
                </Typography>
                <TextField
                  size="small"
                  select
                  value={schoolStd}
                  onChange={(e) => setSchoolStd(e.target.value)}
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                >
                  {standardOptions &&
                    standardOptions.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 200, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Board
                </Typography>
                <TextField
                  size="small"
                  select
                  value={form.board || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "board", value: e.target.value },
                    })
                  }
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                >
                  <MenuItem value="CBSE">CBSE</MenuItem>
                  <MenuItem value="State Board">State Board</MenuItem>
                  <MenuItem value="ICSE">ICSE</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 200, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  12th completion year
                </Typography>
                <AcademicYearControl
                  name="boardYear"
                  form={form}
                  handleChange={handleChange}
                  getAcademicStartYear={getAcademicStartYear}
                  formatAcademicYear={formatAcademicYear}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="School / College name"
                value={form.schoolName || ""}
                onChange={(e) =>
                  handleChange({
                    target: { name: "schoolName", value: e.target.value },
                  })
                }
                inputRef={schoolNameRef}
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="School name"
                error={!!step2Errors.schoolName}
                helperText={step2Errors.schoolName || ""}
                FormHelperTextProps={{
                  role: step2Errors.schoolName ? "status" : undefined,
                  "aria-live": step2Errors.schoolName ? "polite" : undefined,
                  id: step2Errors.schoolName ? "schoolName-error" : undefined,
                }}
              />
            </Box>

            {/* NATA/JEE attempt plan year removed */}
          </Box>
        )}

        {educationType === "diploma" && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: "row",
                flexWrap: { xs: "nowrap", sm: "wrap" },
                overflowX: { xs: "auto", sm: "visible" },
                WebkitOverflowScrolling: "touch",
                pr: { xs: 1, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 240, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Diploma Course
                </Typography>
                <TextField
                  size="small"
                  value={diplomaCourse ?? ""}
                  onChange={(e) =>
                    setDiplomaCourse && setDiplomaCourse(e.target.value)
                  }
                  placeholder="Course (eg. B.arch, Civil)"
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                  error={!!step2Errors.diplomaCourse}
                  helperText={step2Errors.diplomaCourse || ""}
                  inputRef={diplomaCourseRef}
                  FormHelperTextProps={{
                    role: step2Errors.diplomaCourse ? "status" : undefined,
                    "aria-live": step2Errors.diplomaCourse
                      ? "polite"
                      : undefined,
                    id: step2Errors.diplomaCourse
                      ? "diplomaCourse-error"
                      : undefined,
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 240, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Year of Study
                </Typography>
                <TextField
                  size="small"
                  value={diplomaYear}
                  variant="outlined"
                  margin="dense"
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: "100%" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          mr: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                        }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              cycleDiplomaYear(-1);
                            } catch (e) {
                              console.warn("Failed to cycle diploma year:", e);
                            }
                          }}
                          aria-label="Previous diploma year"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                        >
                          <ArrowBackIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ ml: 0, display: "flex", alignItems: "center" }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              cycleDiplomaYear(1);
                            } catch (e) {
                              console.warn("Failed to cycle diploma year:", e);
                            }
                          }}
                          aria-label="Next diploma year"
                          sx={{ p: "6px" }}
                        >
                          <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="College name"
                value={diplomaCollege}
                onChange={(e) =>
                  setDiplomaCollege && setDiplomaCollege(e.target.value)
                }
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="College name"
                error={!!step2Errors.diplomaCollege}
                helperText={step2Errors.diplomaCollege || ""}
                inputRef={diplomaCollegeRef}
                FormHelperTextProps={{
                  role: step2Errors.diplomaCollege ? "status" : undefined,
                  "aria-live": step2Errors.diplomaCollege
                    ? "polite"
                    : undefined,
                  id: step2Errors.diplomaCollege
                    ? "diplomaCollege-error"
                    : undefined,
                }}
              />
            </Box>

            {/* NATA/JEE attempt plan year removed */}
          </Box>
        )}

        {educationType === "college" && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: "row",
                flexWrap: { xs: "nowrap", sm: "wrap" },
                overflowX: { xs: "auto", sm: "visible" },
                WebkitOverflowScrolling: "touch",
                pr: { xs: 1, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 240, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  College name
                </Typography>
                <TextField
                  size="small"
                  value={collegeName || ""}
                  onChange={(e) =>
                    setCollegeName && setCollegeName(e.target.value)
                  }
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                  error={!!step2Errors.collegeName}
                  helperText={step2Errors.collegeName || ""}
                  inputRef={collegeNameRef}
                  FormHelperTextProps={{
                    role: step2Errors.collegeName ? "status" : undefined,
                    "aria-live": step2Errors.collegeName ? "polite" : undefined,
                    id: step2Errors.collegeName
                      ? "collegeName-error"
                      : undefined,
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: { xs: "0 0 auto", sm: 1 },
                  minWidth: { xs: 240, sm: 0 },
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Current Year
                </Typography>
                <TextField
                  size="small"
                  value={collegeYear || ""}
                  variant="outlined"
                  margin="dense"
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: "100%" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          mr: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                        }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              const idx = collegeYearOptions.indexOf(
                                collegeYear || ""
                              );
                              const next =
                                (idx - 1 + collegeYearOptions.length) %
                                collegeYearOptions.length;
                              setCollegeYear &&
                                setCollegeYear(collegeYearOptions[next]);
                            } catch (e) {
                              console.warn("Failed to change college year:", e);
                            }
                          }}
                          aria-label="Previous college year"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                        >
                          <ArrowBackIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ ml: 0, display: "flex", alignItems: "center" }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              const idx = collegeYearOptions.indexOf(
                                collegeYear || ""
                              );
                              const next =
                                (idx + 1) % collegeYearOptions.length;
                              setCollegeYear &&
                                setCollegeYear(collegeYearOptions[next]);
                            } catch (e) {
                              console.warn("Failed to change college year:", e);
                            }
                          }}
                          aria-label="Next college year"
                          sx={{ p: "6px" }}
                        >
                          <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* NATA/JEE attempt plan year removed */}
          </Box>
        )}

        {educationType === "other" && (
          <Box sx={{ mt: 1 }}>
            <Typography component="label" sx={labelStyle}>
              Tell us about yourself
            </Typography>
            <TextField
              size="small"
              label="Tell us about yourself"
              value={otherDescription || ""}
              onChange={(e) =>
                setOtherDescription && setOtherDescription(e.target.value)
              }
              fullWidth
              variant="outlined"
              margin="dense"
              multiline
              rows={4}
              placeholder="Describe your background, current work or study"
              inputRef={otherDescriptionRef}
            />

            {/* NATA/JEE attempt plan year removed */}
          </Box>
        )}
      </Box>

      {/* Course selection — common to all education types */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <FormControl component="fieldset" sx={{ mt: 0 }}>
          <FormLabel
            id="course-selection-label"
            sx={{ ...labelStyle, fontWeight: 600 }}
          >
            Course selection
          </FormLabel>
          <RadioGroup
            aria-labelledby="course-selection-label"
            value={
              selectedCourse ||
              (softwareCourse &&
              String(softwareCourse).toLowerCase() === "revit"
                ? "revit"
                : "")
            }
            onChange={(e) => {
              const v = e.target.value;
              try {
                setSelectedCourse && setSelectedCourse(v);
                if (v === "revit") {
                  setSoftwareCourse && setSoftwareCourse("Revit");
                } else {
                  // if user picks a non-software course, clear softwareCourse
                  setSoftwareCourse && setSoftwareCourse("");
                }
              } catch (err) {
                console.warn("Failed to update course selection:", err);
              }
            }}
            row
          >
            <FormControlLabel
              value="nata-jee-2yr"
              control={<Radio />}
              label="NATA/JEE 2 Year long"
            />
            <FormControlLabel
              value="crash"
              control={<Radio />}
              label="Crash course"
            />
            <FormControlLabel
              value="revit"
              control={<Radio />}
              label="Revit Architecture"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Show course selection error if present */}
      {step2Errors.selectedCourse ? (
        <Typography
          role="status"
          aria-live="polite"
          color="error"
          sx={{ mt: 1, textAlign: "center", fontWeight: 600, fontSize: "0.95rem" }}
        >
          {step2Errors.selectedCourse}
        </Typography>
      ) : null}

      <Box sx={{ display: "flex", gap: 1, mt: 1.5, justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => setStep(1)}
          sx={{ minWidth: 160 }}
        >
          Back to Basic
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (!validateEdu()) {
              // Scroll to top of form to show validation errors
              try {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } catch (e) {
                console.warn("Failed to scroll to top:", e);
              }
              return;
            }
            saveDraft();
            // Save to database
            if (props.saveToDatabase) {
              try {
                const result = await props.saveToDatabase();
                if (!result.ok) {
                  console.error("Failed to save step data:", result.error);
                  // Continue to next step even if database save fails (data is in localStorage)
                }
              } catch (e) {
                console.error("Error calling saveToDatabase:", e);
              }
            }
            setStep(3);
          }}
          sx={{ minWidth: 160 }}
        >
          Save & Next
        </Button>
      </Box>
    </Box>
  );
}
