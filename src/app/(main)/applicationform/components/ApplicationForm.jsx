"use client";
import React, { useState, useRef } from "react";
import { z } from "zod";
import { auth } from "../../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import StepBasic from "./Steps/StepBasic";
import StepEdu from "./Steps/StepEdu";
import StepReview from "./Steps/StepReview";
import { saveApplicationStep } from "../../../../lib/applicationAPI";
import { Box, Button, Typography } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, useSearchParams } from "next/navigation";

// small constants used by fee logic
const currentYear = new Date().getFullYear();

export default function ApplicationForm() {
  const STEP_STORAGE_KEY = "neram_application_step_v1";
  // Local storage key for drafts. Version this when the draft shape changes.
  const DRAFT_STORAGE_KEY = "neram_application_draft_v1";
  const router = useRouter();
  const searchParams = useSearchParams();
  // Lift core state used across steps here and pass values and setters down to children.
  const [form, setForm] = useState({});
  const [altPhone, setAltPhone] = useState("");
  const [showAltContact, setShowAltContact] = useState(false);
  const [educationType, setEducationType] = useState("school");
  const [schoolStd, setSchoolStd] = useState("12th");
  const [collegeName, setCollegeName] = useState("");
  const [collegeYear, setCollegeYear] = useState("1st Year");
  const [diplomaCourse, setDiplomaCourse] = useState("");
  const [diplomaYear, setDiplomaYear] = useState("Third Year");
  const [diplomaCollege, setDiplomaCollege] = useState("");
  const [otherDescription, setOtherDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [softwareCourse, setSoftwareCourse] = useState("Revit");
  const [isCompactSelector, setIsCompactSelector] = useState(false);
  const [showStdPopup, setShowStdPopup] = useState(false);
  const [instagramId, setInstagramId] = useState("");
  const [reviewMode, setReviewMode] = useState(false);
  const [editField, setEditField] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [step2Errors, setStep2Errors] = useState({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // phoneToEdit state removed
  const [currentStep, setCurrentStep] = useState(1);
  const [stepLoading, setStepLoading] = useState(false);
  const fieldRefs = useRef({});

  // Keep form.classGrade in sync with schoolStd when form state is lifted here.
  React.useEffect(() => {
    setForm((prev) => ({ ...(prev || {}), classGrade: schoolStd }));
  }, [schoolStd]);

  // Handlers moved from StepBasic: change handlers, validation and draft save
  const handleChange = (e) => {
    setForm((prev) => ({ ...(prev || {}), [e.target.name]: e.target.value }));
    try {
      // Clear any existing message for this field
      setStep2Errors((p) => ({ ...(p || {}), [e.target.name]: undefined }));
    } catch {}
  };

  const handleSelectChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name) setForm((prev) => ({ ...(prev || {}), [name]: value }));
    try {
      setStep2Errors((p) => ({ ...(p || {}), [name]: undefined }));
    } catch {}
  };

  const BANNER_DISMISS_KEY = "neram_application_banner_dismissed_v1";
  const dismissBanner = () => {
    try {
      localStorage.setItem(BANNER_DISMISS_KEY, "1");
    } catch {}
    try {
      setBannerDismissed(true);
    } catch {}
  };

  const validateStep2 = () => {
    // use top-level `form` and `setStep2Errors`
    // Schema-based validation keeps rules centralized and reusable.
    // Update this schema if the `form` shape changes.
    const Step2Schema = z.object({
      studentName: z.string().min(1, "Required"),
      fatherName: z.string().min(1, "Required"),
      gender: z.string().min(1, "Required"),
      zipCode: z.string().min(1, "Required"),
      email: z.string().email("Invalid email"),
    });

    const safe = Step2Schema.safeParse(form || {});
    if (safe.success) {
      setStep2Errors({});
      return true;
    }
    const errs = {};
    try {
      for (const issue of safe.error.issues || []) {
        const key = issue.path && issue.path.length ? issue.path[0] : null;
        if (key) errs[key] = issue.message || "Invalid";
      }
    } catch {}
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation for the Education step (Step 2) using zod.
  const StepEduSchema = z
    .object({
      educationType: z.enum(["school", "diploma", "college", "other"]),
      // common fields
      schoolName: z.string().optional(),
      boardYear: z.string().optional(),
      nataAttemptYear: z.string().optional(),
      diplomaCourse: z.string().optional(),
      diplomaCollege: z.string().optional(),
      collegeName: z.string().optional(),
      selectedCourse: z.string().optional(),
      softwareCourse: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      // enforce required fields depending on educationType
      if (val.educationType === "school") {
        // no strict requirement on schoolName, but boardYear should exist
        if (!val.boardYear)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["boardYear"],
            message: "Please set your 12th completion year",
          });
      }
      if (val.educationType === "diploma") {
        if (!val.diplomaCourse || !String(val.diplomaCourse).trim())
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["diplomaCourse"],
            message: "Please enter your diploma course",
          });
        if (!val.diplomaCollege || !String(val.diplomaCollege).trim())
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["diplomaCollege"],
            message: "Please enter your diploma college",
          });
      }
      if (val.educationType === "college") {
        if (!val.collegeName || !String(val.collegeName).trim())
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["collegeName"],
            message: "Please enter your college name",
          });
      }
      // course selection must be chosen
      if (!val.selectedCourse || !String(val.selectedCourse).trim())
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selectedCourse"],
          message: "Please select a course",
        });
      // If selectedCourse is revit, softwareCourse should be present
      if (
        String(val.selectedCourse || "").toLowerCase() === "revit" &&
        !val.softwareCourse
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["softwareCourse"],
          message: "Please confirm software (Revit)",
        });
      }
    });

  const validateEdu = () => {
    const payload = {
      educationType,
      schoolName: form.schoolName,
      boardYear: form.boardYear,
      nataAttemptYear: form.nataAttemptYear,
      diplomaCourse,
      diplomaCollege,
      collegeName,
      selectedCourse,
      softwareCourse,
    };
    const res = StepEduSchema.safeParse(payload);
    if (res.success) {
      // clear any education-related messages
      setStep2Errors((p) => ({
        ...(p || {}),
        boardYear: undefined,
        diplomaCourse: undefined,
        diplomaCollege: undefined,
        collegeName: undefined,
        selectedCourse: undefined,
        softwareCourse: undefined,
      }));
      return true;
    }
    const errs = {};
    try {
      for (const issue of res.error.issues || []) {
        const key = issue.path && issue.path.length ? issue.path[0] : null;
        if (key) errs[key] = issue.message || "Invalid";
      }
    } catch {}
    setStep2Errors((p) => ({ ...(p || {}), ...errs }));
    return Object.keys(errs).length === 0;
  };

  const saveDraft = () => {
    try {
      const payload = {
        form: form || {},
        altPhone: altPhone || "",
        instagramId: instagramId || "",
        educationType: educationType || "school",
        schoolStd: schoolStd,
        collegeName: collegeName,
        collegeYear: collegeYear,
        diplomaCourse: diplomaCourse,
        diplomaYear: diplomaYear,
        diplomaCollege: diplomaCollege,
        otherDescription: otherDescription,
        selectedCourse: selectedCourse,
        softwareCourse: softwareCourse,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1200);
      return { ok: true };
    } catch (err) {
      console.error("Error saving draft:", err);
      return { ok: false, error: String(err) };
    }
  };

  // Persist a step to the server. Uses saveApplicationStep helper from applicationAPI.
  const saveToDatabase = async (step = "basic", overrides = {}) => {
    try {
      const stepData = {
        form,
        altPhone,
        instagramId,
        educationType,
        schoolStd,
        collegeName,
        collegeYear,
        diplomaCourse,
        diplomaYear,
        diplomaCollege,
        otherDescription,
        selectedCourse,
        softwareCourse,
        ...overrides,
      };
      return await saveApplicationStep(step, stepData);
    } catch (err) {
      console.error("Error saving application step:", err);
      return { ok: false, error: String(err) };
    }
  };

  // cycle helpers copied from StepBasic
  const cycleStandard = (dir) => {
    const standardOptions = ["Below 10th", "10th", "11th", "12th"];
    const idx = standardOptions.indexOf(schoolStd);
    const next = (idx + dir + standardOptions.length) % standardOptions.length;
    setSchoolStd(standardOptions[next]);
  };
  const cycleDiplomaYear = (dir) => {
    const diplomaYearOptions = [
      "First Year",
      "Second Year",
      "Third Year",
      "Completed",
    ];
    const idx = diplomaYearOptions.indexOf(diplomaYear);
    const next =
      (idx + dir + diplomaYearOptions.length) % diplomaYearOptions.length;
    setDiplomaYear(diplomaYearOptions[next]);
  };

  // Orchestrate steps here (currentStep and stepLoading are explicit above)

  // Map step indices to URL slugs and back for query param syncing
  const stepToSlug = (n) => {
    switch (Number(n)) {
      case 1:
        return "personal";
      case 2:
        return "education";
      case 3:
        return "review";
      default:
        return "personal";
    }
  };
  const slugToStep = (s) => {
    const t = String(s || "").toLowerCase();
    if (t === "personal" || t === "basic") return 1;
    if (t === "education") return 2;
    if (t === "review" || t === "course") return 3;
    const n = parseInt(t, 10);
    return Number.isFinite(n) && n >= 1 && n <= 3 ? n : 1;
  };

  // Wrapper to change step and rely on effects to sync URL/local
  const setStep = (n) => {
    try {
      setCurrentStep(n);
    } catch {
      setCurrentStep(n);
    }
  };

  // Initialize studentName from authenticated user's displayName when no draft loaded
  React.useEffect(() => {
    try {
      const current = auth.currentUser;
      if (current && !draftLoaded) {
        setForm((prev) => ({
          ...(prev || {}),
          studentName: current.displayName || "",
        }));
      }
    } catch {}

    const unsub2 = onAuthStateChanged(auth, (u) => {
      try {
        if (u && !draftLoaded) {
          setForm((prev) => ({
            ...(prev || {}),
            studentName: u.displayName || "",
          }));
        }
      } catch {}
    });
    return () => unsub2 && unsub2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // primitives and setters are declared above as explicit state variables

  // hoveredKey, reviewMode and editField are declared above

  // option lists used by StepEdu
  const standardOptions = ["Below 10th", "10th", "11th", "12th"];
  const diplomaYearOptions = [
    "First Year",
    "Second Year",
    "Third Year",
    "Completed",
  ];

  // Auto-load draft from localStorage on mount so user data survives refresh
  // Also fetch latest DB values from /api/users/me and merge into form state.
  // Policy: local draft (if present) is considered the user's working copy and
  // takes precedence. DB values are used only to fill missing fields when a
  // draft exists. If no local draft is present, DB values overwrite defaults.
  // Holds the auto-save timer id. In browsers this is a number, in Node it may
  // be a Timeout object. We'll treat it opaquely and always clear using
  // clearTimeout to remain environment-agnostic.
  const saveTimerRef = React.useRef();
  React.useEffect(() => {
    let didSet = false;
    (async () => {
      try {
        // Load local draft first
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) {
          const payload = JSON.parse(raw);
          // apply draft values into top-level state setters
          if (payload.form) setForm(payload.form);
          if (payload.altPhone) setAltPhone(payload.altPhone);
          if (payload.instagramId) setInstagramId(payload.instagramId);
          if (payload.educationType) setEducationType(payload.educationType);
          if (payload.schoolStd) setSchoolStd(payload.schoolStd);
          if (payload.collegeName) setCollegeName(payload.collegeName);
          if (payload.collegeYear) setCollegeYear(payload.collegeYear);
          if (payload.diplomaCourse) setDiplomaCourse(payload.diplomaCourse);
          if (payload.diplomaYear) setDiplomaYear(payload.diplomaYear);
          if (payload.diplomaCollege) setDiplomaCollege(payload.diplomaCollege);
          if (payload.otherDescription)
            setOtherDescription(payload.otherDescription);
          if (payload.selectedCourse) setSelectedCourse(payload.selectedCourse);
          if (payload.softwareCourse) setSoftwareCourse(payload.softwareCourse);
          setDraftLoaded(true);
          didSet = true;
        }
      } catch (err) {
        // ignore parse errors
      }
      // Now fetch latest DB values and merge into form state. If a draft was
      // loaded (didSet === true), prefer the already-loaded draft values and
      // only fill missing fields from the DB. If no draft was loaded, the DB
      // becomes the source of truth and we overwrite defaults.
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          const res = await fetch("/api/users/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.user) {
              const db = data.user;
              // Merge form fields: prefer existing draft values when didSet is true
              setForm((prev) => {
                if (!didSet) {
                  return {
                    studentName: db.student_name ?? "",
                    fatherName: db.father_name ?? "",
                    gender: db.gender ?? "",
                    zipCode: db.zip_code ?? "",
                    city: db.city ?? "",
                    state: db.state ?? "",
                    country: db.country ?? "",
                    email: db.email ?? "",
                    phone: db.phone ?? "",
                    // StepEdu: board select and school name
                    board: db.board ?? "",
                    schoolName: db.school_name ?? "",
                    boardYear:
                      typeof db.board_year === "string"
                        ? (db.board_year.match(/(\d{4})/) || [])[1] || undefined
                        : undefined,
                    nataAttemptYear:
                      typeof db.nata_attempt_year === "string"
                        ? (db.nata_attempt_year.match(/(\d{4})/) || [])[1] ||
                          undefined
                        : undefined,
                  };
                }
                // merge: keep prev values when present, otherwise use db
                return {
                  studentName: prev?.studentName ?? db.student_name ?? "",
                  fatherName: prev?.fatherName ?? db.father_name ?? "",
                  gender: prev?.gender ?? db.gender ?? "",
                  zipCode: prev?.zipCode ?? db.zip_code ?? "",
                  city: prev?.city ?? db.city ?? "",
                  state: prev?.state ?? db.state ?? "",
                  country: prev?.country ?? db.country ?? "",
                  email: prev?.email ?? db.email ?? "",
                  phone: prev?.phone ?? db.phone ?? "",
                  board: prev?.board ?? db.board ?? "",
                  schoolName: prev?.schoolName ?? db.school_name ?? "",
                  boardYear:
                    prev?.boardYear ??
                    (typeof db.board_year === "string"
                      ? (db.board_year.match(/(\d{4})/) || [])[1]
                      : undefined) ??
                    undefined,
                  nataAttemptYear:
                    prev?.nataAttemptYear ??
                    (typeof db.nata_attempt_year === "string"
                      ? (db.nata_attempt_year.match(/(\d{4})/) || [])[1]
                      : undefined) ??
                    undefined,
                };
              });
              setAltPhone((p) => p || db.alt_phone || "");
              setInstagramId((p) => p || db.instagram_handle || "");
              setEducationType((p) => p || db.education_type || "school");
              setSchoolStd((p) => p || db.school_std || "12th");
              setCollegeName((p) => p || db.college_name || "");
              setCollegeYear((p) => p || db.college_year || "1st Year");
              setDiplomaCourse((p) => p || db.diploma_course || "");
              setDiplomaYear((p) => p || db.diploma_year || "Third Year");
              setDiplomaCollege((p) => p || db.diploma_college || "");
              setOtherDescription((p) => p || db.other_description || "");
              setSelectedCourse((p) =>
                p == null ? db.selected_course ?? null : p
              );
              setSoftwareCourse((p) => p || db.software_course || "Revit");
            }
          }
        }
      } catch (err) {
        // ignore network errors
      }
    })();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load banner dismissal preference so returning users aren't repeatedly prompted
  React.useEffect(() => {
    try {
      const v = localStorage.getItem(BANNER_DISMISS_KEY);
      if (v === "1") setBannerDismissed(true);
    } catch {}
  }, []);

  // Auto-save (debounced) — write a compact payload to localStorage
  React.useEffect(() => {
    try {
      if (typeof saveTimerRef.current !== "undefined") {
        try {
          clearTimeout(saveTimerRef.current);
        } catch {}
        saveTimerRef.current = undefined;
      }
      saveTimerRef.current = setTimeout(() => {
        try {
          const payload = {
            form: form || {},
            altPhone: altPhone || "",
            instagramId: instagramId || "",
            educationType: educationType || "school",
            schoolStd: schoolStd,
            collegeName: collegeName,
            collegeYear: collegeYear,
            diplomaCourse: diplomaCourse,
            diplomaYear: diplomaYear,
            diplomaCollege: diplomaCollege,
            otherDescription: otherDescription,
            softwareCourse: softwareCourse || "Revit",
          };

          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
          // ignore
        }
      }, 700);
    } catch (err) {}
    return () => {
      try {
        if (typeof saveTimerRef.current !== "undefined") {
          try {
            clearTimeout(saveTimerRef.current);
          } catch {}
          saveTimerRef.current = undefined;
        }
      } catch {}
    };
    // watch all lifted primitives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form,
    altPhone,
    instagramId,
    educationType,
    schoolStd,
    collegeName,
    collegeYear,
    diplomaCourse,
    diplomaYear,
    diplomaCollege,
    otherDescription,
    softwareCourse,
  ]);

  // Persist current step to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
    } catch {}
  }, [currentStep]);

  // Restore last visited step on first mount (prefer URL ?step)
  React.useEffect(() => {
    try {
      const urlSlug = searchParams.get("step");
      const fromUrl = urlSlug ? slugToStep(urlSlug) : NaN;
      const raw = localStorage.getItem(STEP_STORAGE_KEY);
      const saved = raw ? parseInt(raw, 10) : NaN;
      const pick = Number.isFinite(fromUrl) ? fromUrl : saved;
      if (!Number.isFinite(pick)) return;
      // Previously we enforced a minimum step based on phone verification.
      // With phone verification removed, allow starting at step 1.
      const target = Math.min(3, Math.max(1, pick));
      setStep(target);
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the URL ?step changes (e.g., back/forward), sync state
  React.useEffect(() => {
    try {
      const slug = searchParams.get("step");
      if (!slug) return;
      const next = slugToStep(slug);
      if (!Number.isFinite(next)) return;
      const target = Math.min(3, Math.max(1, next));
      if (target !== currentStep) setCurrentStep(target);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // On step change, refresh latest data from DB so each step shows up-to-date values
  React.useEffect(() => {
    // Write step slug to URL so refresh/deep-linking works
    try {
      const slug = stepToSlug(currentStep);
      const q = new URLSearchParams(Array.from(searchParams.entries()));
      q.set("step", slug);
      // Avoid scroll jump on replace
      router.replace(`/applicationform?${q.toString()}`, { scroll: false });
    } catch {}

    let cancelled = false;
    (async () => {
      // If user not authenticated, skip DB refresh early to avoid unnecessary loading state.
      try {
        const user = auth.currentUser;
        if (!user) {
          // No signed-in user; ensure we don't show a loading overlay and exit early.
          setStepLoading(false);
          return;
        }
        // Show overlay while we refresh data for the new step
        setStepLoading(true);
        const token = await user.getIdToken();
        if (!token) {
          setStepLoading(false);
          return;
        }
        const res = await fetch("/api/users/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.user || cancelled) return;
        const db = data.user;
        setForm({
          studentName: db.student_name ?? "",
          fatherName: db.father_name ?? "",
          gender: db.gender ?? "",
          zipCode: db.zip_code ?? "",
          city: db.city ?? "",
          state: db.state ?? "",
          country: db.country ?? "",
          email: db.email ?? "",
          phone: db.phone ?? "",
          // StepEdu fields
          board: db.board ?? "",
          schoolName: db.school_name ?? "",
          boardYear:
            typeof db.board_year === "string"
              ? (db.board_year.match(/(\d{4})/) || [])[1] || undefined
              : undefined,
          nataAttemptYear:
            typeof db.nata_attempt_year === "string"
              ? (db.nata_attempt_year.match(/(\d{4})/) || [])[1] || undefined
              : undefined,
          // removed payment/course fields
        });
        setAltPhone(db.alt_phone ?? "");
        setInstagramId(db.instagram_handle ?? "");
        // removed languages/youtube/course mapping
        setEducationType(db.education_type ?? "school");
        setSchoolStd(db.school_std ?? "12th");
        setCollegeName(db.college_name ?? "");
        setCollegeYear(db.college_year ?? "1st Year");
        setDiplomaCourse(db.diploma_course ?? "");
        setDiplomaYear(db.diploma_year ?? "Third Year");
        setDiplomaCollege(db.diploma_college ?? "");
        setOtherDescription(db.other_description ?? "");
        setSoftwareCourse(db.software_course ?? "Revit");
      } catch {
      } finally {
        if (!cancelled) setStepLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      setStepLoading(false);
    };
    // re-fetch when step switches
  }, [currentStep]);

  return (
    <Box>
      {/* Show a friendly prompt when user is not signed in */}
      {!auth?.currentUser && !bannerDismissed && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "light" ? "#fff8e1" : "#3a2b00",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography sx={{ flex: 1 }}>
            You are not signed in. Sign in to restore saved application data
            across devices and continue where you left off.
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                try {
                  dismissBanner();
                } catch {}
                router.push("/signin");
              }}
            >
              Sign in
            </Button>
            <Button
              variant="text"
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                try {
                  dismissBanner();
                } catch {}
                setDraftLoaded(true);
              }}
            >
              Continue as guest
            </Button>
            <Button
              variant="text"
              size="small"
              sx={{ ml: 1 }}
              onClick={dismissBanner}
            >
              Dismiss
            </Button>
          </Box>
        </Box>
      )}
      <Backdrop
        open={Boolean(stepLoading)}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {currentStep === 1 && (
        <StepBasic
          form={form}
          altPhone={altPhone}
          setAltPhone={setAltPhone}
          showAltContact={showAltContact}
          setShowAltContact={setShowAltContact}
          instagramId={instagramId}
          setInstagramId={setInstagramId}
          step2Errors={step2Errors}
          setStep2Errors={setStep2Errors}
          saveDraft={saveDraft}
          saveToDatabase={() => saveToDatabase("basic")}
          validateStep2={validateStep2}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          setCurrentStep={setStep}
          fieldRefs={fieldRefs}
          editField={editField}
        />
      )}

      {currentStep === 2 && (
        <StepEdu
          form={form}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          educationType={educationType}
          setEducationType={setEducationType}
          isCompactSelector={isCompactSelector}
          showStdPopup={showStdPopup}
          setShowStdPopup={setShowStdPopup}
          schoolStd={schoolStd}
          setSchoolStd={setSchoolStd}
          standardOptions={standardOptions}
          cycleStandard={cycleStandard}
          diplomaYearOptions={diplomaYearOptions}
          diplomaYear={diplomaYear}
          setDiplomaYear={setDiplomaYear}
          diplomaCourse={diplomaCourse}
          setDiplomaCourse={setDiplomaCourse}
          diplomaCollege={diplomaCollege}
          setDiplomaCollege={setDiplomaCollege}
          otherDescription={otherDescription}
          setOtherDescription={setOtherDescription}
          collegeName={collegeName}
          setCollegeName={setCollegeName}
          collegeYear={collegeYear}
          setCollegeYear={setCollegeYear}
          setCurrentStep={setStep}
          validateStep2={validateStep2}
          saveDraft={saveDraft}
          saveToDatabase={() => saveToDatabase("education")}
          validateEdu={validateEdu}
          step2Errors={step2Errors}
          setStep2Errors={setStep2Errors}
          cycleDiplomaYear={cycleDiplomaYear}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          softwareCourse={softwareCourse}
          setSoftwareCourse={setSoftwareCourse}
        />
      )}

      {/* Step 3 is Review; course/payment step removed */}

      {currentStep === 3 && (
        <StepReview
          form={form}
          altPhone={altPhone}
          instagramId={instagramId}
          educationType={educationType}
          schoolStd={schoolStd}
          collegeName={collegeName}
          collegeYear={collegeYear}
          diplomaCourse={diplomaCourse}
          diplomaYear={diplomaYear}
          diplomaCollege={diplomaCollege}
          otherDescription={otherDescription}
          selectedCourse={selectedCourse}
          hoveredKey={hoveredKey}
          setHoveredKey={setHoveredKey}
          setReviewMode={setReviewMode}
          setEditField={setEditField}
          setCurrentStep={setStep}
          saveToDatabase={async (overrides) => {
            const result = await saveToDatabase("review", overrides);
            if (result?.ok) {
              // After final review save, send user to the applications list so they
              // can view submitted applications and their statuses.
              // Note: `(main)` is a route-group folder and does not appear in URLs.
              router.replace("/applications?submitted=1");
            }
            return result;
          }}
          handleGoToStep={(stepIdx, fieldKey) => {
            try {
              // navigate to requested step
              setStep(stepIdx);
              // set parent editField so target step can enter edit mode
              setEditField && setEditField(fieldKey || null);
              // navigation to step 1 (phone) no longer needs special handling
            } catch (err) {
              console.warn(err);
            }
          }}
        />
      )}
    </Box>
  );
}
