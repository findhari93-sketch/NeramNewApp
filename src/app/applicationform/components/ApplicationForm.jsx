"use client";
import React, { useState, useRef } from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import StepBasic from "./Steps/StepBasic";
import StepCourse from "./Steps/StepCourse";
import StepEdu from "./Steps/StepEdu";
import StepReview from "./Steps/StepReview";
import StepPhoneVerify from "./Steps/StepPhoneVerify";
import { saveApplicationStep } from "../../../lib/applicationAPI";

// small constants used by fee logic
const currentYear = new Date().getFullYear();
const SOFTWARE_FEE = 10000;

export default function ApplicationForm() {
  // Lift core state used across steps here and pass tuples down to children.
  const formState = useState({});
  const altPhoneState = useState("");
  const showAltContactState = useState(false);
  const activeTabState = useState("nata-jee");
  const youtubeSubscribedState = useState(false);
  const locationState = useState(null);
  const locationErrorState = useState("");
  const selectedCourseState = useState("nata-jee");
  const educationTypeState = useState("school");
  const schoolStdState = useState("12th");
  const collegeNameState = useState("");
  const collegeYearState = useState("1st Year");
  const diplomaCourseState = useState("");
  const diplomaYearState = useState("Third Year");
  const diplomaCollegeState = useState("");
  const otherDescriptionState = useState("");
  const isCompactSelectorState = useState(false);
  const showStdPopupState = useState(false);
  const softwareCourseState = useState("Revit");
  const instagramIdState = useState("");
  const selectedLanguagesState = useState(["English"]);
  const reviewModeState = useState(false);
  const editFieldState = useState(null);
  const hoveredKeyState = useState(null);
  const hoverCscState = useState(null);
  const step2ErrorsState = useState({});
  const draftSavedState = useState(false);
  const draftLoadedState = useState(false);
  const phoneToEditState = useState(null);
  const verifiedPhoneState = useState(() => {
    try {
      return localStorage.getItem("phone_verified");
    } catch {
      return null;
    }
  });
  const currentStepState = useState(1);
  const fieldRefs = useRef({});

  // Keep form.classGrade in sync with schoolStd when form state is lifted here.
  React.useEffect(() => {
    const [, setForm] = formState;
    const [schoolStd] = schoolStdState;
    setForm((prev) => ({ ...(prev || {}), classGrade: schoolStd }));
    // only depend on the primitive value to avoid tuple identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolStdState[0]]);

  // Handlers moved from StepBasic: change handlers, validation and draft save
  const handleChange = (e) => {
    const [, setForm] = formState;
    setForm((prev) => ({ ...(prev || {}), [e.target.name]: e.target.value }));
    try {
      const [, setStep2Errors] = step2ErrorsState;
      setStep2Errors((p) => ({ ...(p || {}), [e.target.name]: false }));
    } catch {}
  };

  const handleSelectChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const [, setForm] = formState;
    if (name) setForm((prev) => ({ ...(prev || {}), [name]: value }));
    try {
      const [, setStep2Errors] = step2ErrorsState;
      setStep2Errors((p) => ({ ...(p || {}), [name]: false }));
    } catch {}
  };

  const validateStep2 = () => {
    const [form] = formState;
    const [, setStep2Errors] = step2ErrorsState;
    const errs = {};
    if (!form.studentName || !String(form.studentName).trim())
      errs.studentName = true;
    if (!form.fatherName || !String(form.fatherName).trim())
      errs.fatherName = true;
    if (!form.gender || !String(form.gender).trim()) errs.gender = true;
    if (!form.zipCode || !String(form.zipCode).trim()) errs.zipCode = true;
    const emailVal = String(form.email || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailVal || !emailOk) errs.email = true;
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveDraft = () => {
    try {
      const [form] = formState;
      const [altPhone] = altPhoneState;
      const [instagramId] = instagramIdState;
      const [selectedLanguages] = selectedLanguagesState;
      const [youtubeSubscribed] = youtubeSubscribedState;
      const [selectedCourse] = selectedCourseState;
      const [educationType] = educationTypeState;
      const [schoolStd] = schoolStdState;
      const [collegeName] = collegeNameState;
      const [collegeYear] = collegeYearState;
      const [diplomaCourse] = diplomaCourseState;
      const [diplomaYear] = diplomaYearState;
      const [diplomaCollege] = diplomaCollegeState;
      const [otherDescription] = otherDescriptionState;
      const [softwareCourse] = softwareCourseState;

      const payload = {
        form,
        altPhone,
        instagramId,
        selectedLanguages,
        youtubeSubscribed,
        selectedCourse,
        educationType,
        schoolStd,
        collegeName,
        collegeYear,
        diplomaCourse,
        diplomaYear,
        diplomaCollege,
        otherDescription,
        softwareCourse,
      };
      localStorage.setItem(
        "neram_application_draft_v1",
        JSON.stringify(payload)
      );
      const [, setDraftSaved] = draftSavedState;
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1800);
    } catch (err) {
      console.warn("Failed to save draft", err);
    }
  };

  // New function to save current application data to database (per step)
  const saveToDatabase = async (step, overrides) => {
    try {
      const [form] = formState;
      const [altPhone] = altPhoneState;
      const [instagramId] = instagramIdState;
      const [selectedLanguages] = selectedLanguagesState;
      const [youtubeSubscribed] = youtubeSubscribedState;
      const [selectedCourse] = selectedCourseState;
      const [educationType] = educationTypeState;
      const [schoolStd] = schoolStdState;
      const [collegeName] = collegeNameState;
      const [collegeYear] = collegeYearState;
      const [diplomaCourse] = diplomaCourseState;
      const [diplomaYear] = diplomaYearState;
      const [diplomaCollege] = diplomaCollegeState;
      const [otherDescription] = otherDescriptionState;
      const [softwareCourse] = softwareCourseState;
      const [verifiedPhone] = verifiedPhoneState;

      const baseStepData = {
        form,
        altPhone,
        instagramId,
        selectedLanguages,
        youtubeSubscribed,
        selectedCourse,
        educationType,
        schoolStd,
        collegeName,
        collegeYear,
        diplomaCourse,
        diplomaYear,
        diplomaCollege,
        otherDescription,
        softwareCourse,
        verifiedPhone,
      };

      // Apply optional overrides (e.g., computed payment fields from StepCourse)
      const stepData = {
        ...baseStepData,
        ...(overrides || {}),
        form: { ...(baseStepData.form || {}), ...(overrides?.form || {}) },
      };

      const result = await saveApplicationStep(step, stepData);
      if (!result.ok) {
        console.error("Failed to save to database:", result.error);
        // Could show user notification here if needed
      }
      return result;
    } catch (err) {
      console.error("Error saving to database:", err);
      return { ok: false, error: String(err) };
    }
  };

  // cycle helpers copied from StepBasic
  const cycleStandard = (dir) => {
    const [schoolStd, setSchoolStd] = schoolStdState;
    const standardOptions = ["Below 10th", "10th", "11th", "12th"];
    const idx = standardOptions.indexOf(schoolStd);
    const next = (idx + dir + standardOptions.length) % standardOptions.length;
    setSchoolStd(standardOptions[next]);
  };
  const cycleDiplomaYear = (dir) => {
    const [diplomaYear, setDiplomaYear] = diplomaYearState;
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

  // Orchestrate steps here using currentStepState
  const [currentStep, setCurrentStep] = currentStepState;
  const [verifiedPhone, setVerifiedPhone] = verifiedPhoneState;

  // If user is already authenticated via Firebase, skip phone verification step
  React.useEffect(() => {
    try {
      const current = auth.currentUser;
      if (current) {
        // mark verifiedPhone if available and advance to step 2
        setVerifiedPhone(current.phoneNumber || verifiedPhone || null);
        setCurrentStep(2);
      }
    } catch {}

    const unsub = onAuthStateChanged(auth, (u) => {
      try {
        if (u) {
          setVerifiedPhone(u.phoneNumber || verifiedPhone || null);
          setCurrentStep(2);
        }
      } catch {}
    });
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize studentName from authenticated user's displayName when no draft loaded
  React.useEffect(() => {
    try {
      const [draftLoaded] = draftLoadedState;
      const [, setForm] = formState;
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
        const [draftLoaded] = draftLoadedState;
        const [, setForm] = formState;
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

  // If we know a phone is already verified (from localStorage), skip step 1
  React.useEffect(() => {
    if (verifiedPhone) setCurrentStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedPhone]);

  // extract primitives/setters for StepBasic props
  const [form] = formState;
  const [altPhone, setAltPhone] = altPhoneState;
  const [showAltContact, setShowAltContact] = showAltContactState;
  const [instagramId, setInstagramId] = instagramIdState;
  const [selectedLanguages] = selectedLanguagesState;
  const [youtubeSubscribed, setYoutubeSubscribed] = youtubeSubscribedState;
  const [step2Errors, setStep2Errors] = step2ErrorsState;

  // extract primitives/setters used by StepEdu
  const [educationType, setEducationType] = educationTypeState;
  const [isCompactSelector] = isCompactSelectorState;
  const [showStdPopup, setShowStdPopup] = showStdPopupState;
  const [schoolStd, setSchoolStd] = schoolStdState;
  const [diplomaYear, setDiplomaYear] = diplomaYearState;
  const [diplomaCourse, setDiplomaCourse] = diplomaCourseState;
  const [diplomaCollege, setDiplomaCollege] = diplomaCollegeState;
  const [otherDescription, setOtherDescription] = otherDescriptionState;
  const [collegeName, setCollegeName] = collegeNameState;
  const [collegeYear, setCollegeYear] = collegeYearState;
  const [youtubeSubscribedVal, setYoutubeSubscribedVal] =
    youtubeSubscribedState;

  // extract selected course, active tab and software course primitives/setters
  const [activeTab, setActiveTab] = activeTabState;
  const [selectedCourse, setSelectedCourse] = selectedCourseState;
  const [softwareCourse, setSoftwareCourse] = softwareCourseState;
  const [, setForm] = formState;

  const [hoveredKey, setHoveredKey] = hoveredKeyState;
  const [reviewMode, setReviewMode] = reviewModeState;
  const [editField, setEditField] = editFieldState;

  // option lists used by StepEdu
  const standardOptions = ["Below 10th", "10th", "11th", "12th"];
  const diplomaYearOptions = [
    "First Year",
    "Second Year",
    "Third Year",
    "Completed",
  ];

  // Auto-load draft from localStorage on mount so user data survives refresh
  const saveTimerRef = React.useRef(null);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("neram_application_draft_v1");
      if (raw) {
        const payload = JSON.parse(raw);
        const [, setFormLocal] = formState;
        const [, setAltPhoneLocal] = altPhoneState;
        const [, setInstagramLocal] = instagramIdState;
        const [, setSelectedLanguagesLocal] = selectedLanguagesState;
        const [, setYoutubeSubscribedLocal] = youtubeSubscribedState;
        const [, setSelectedCourseLocal] = selectedCourseState;
        const [, setEducationTypeLocal] = educationTypeState;
        const [, setSchoolStdLocal] = schoolStdState;
        const [, setCollegeNameLocal] = collegeNameState;
        const [, setCollegeYearLocal] = collegeYearState;
        const [, setDiplomaCourseLocal] = diplomaCourseState;
        const [, setDiplomaYearLocal] = diplomaYearState;
        const [, setDiplomaCollegeLocal] = diplomaCollegeState;
        const [, setOtherDescriptionLocal] = otherDescriptionState;
        const [, setSoftwareCourseLocal] = softwareCourseState;
        if (payload.form) setFormLocal(payload.form);
        if (payload.altPhone) setAltPhoneLocal(payload.altPhone);
        if (payload.instagramId) setInstagramLocal(payload.instagramId);
        if (payload.selectedLanguages)
          setSelectedLanguagesLocal(payload.selectedLanguages);
        if (typeof payload.youtubeSubscribed !== "undefined")
          setYoutubeSubscribedLocal(payload.youtubeSubscribed);
        if (payload.selectedCourse)
          setSelectedCourseLocal(payload.selectedCourse);
        if (payload.educationType) setEducationTypeLocal(payload.educationType);
        if (payload.schoolStd) setSchoolStdLocal(payload.schoolStd);
        if (payload.collegeName) setCollegeNameLocal(payload.collegeName);
        if (payload.collegeYear) setCollegeYearLocal(payload.collegeYear);
        if (payload.diplomaCourse) setDiplomaCourseLocal(payload.diplomaCourse);
        if (payload.diplomaYear) setDiplomaYearLocal(payload.diplomaYear);
        if (payload.diplomaCollege)
          setDiplomaCollegeLocal(payload.diplomaCollege);
        if (payload.otherDescription)
          setOtherDescriptionLocal(payload.otherDescription);
        if (payload.softwareCourse)
          setSoftwareCourseLocal(payload.softwareCourse);
        const [, setDraftLoaded] = draftLoadedState;
        setDraftLoaded(true);
      }
    } catch (err) {
      // ignore parse errors
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save (debounced) — write a compact payload to localStorage
  React.useEffect(() => {
    try {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          const [formVal] = formState;
          const [altPhoneVal] = altPhoneState;
          const [instagramVal] = instagramIdState;
          const [selectedLanguagesVal] = selectedLanguagesState;
          const [youtubeSubscribedValLocal] = youtubeSubscribedState;
          const [selectedCourseVal] = selectedCourseState;
          const [educationTypeVal] = educationTypeState;
          const [schoolStdVal] = schoolStdState;
          const [collegeNameVal] = collegeNameState;
          const [collegeYearVal] = collegeYearState;
          const [diplomaCourseVal] = diplomaCourseState;
          const [diplomaYearVal] = diplomaYearState;
          const [diplomaCollegeVal] = diplomaCollegeState;
          const [otherDescriptionVal] = otherDescriptionState;
          const [softwareCourseVal] = softwareCourseState;

          const payload = {
            form: formVal || {},
            altPhone: altPhoneVal || "",
            instagramId: instagramVal || "",
            selectedLanguages: selectedLanguagesVal || [],
            youtubeSubscribed: youtubeSubscribedValLocal || false,
            selectedCourse: selectedCourseVal || "nata-jee",
            educationType: educationTypeVal || "school",
            schoolStd: schoolStdVal,
            collegeName: collegeNameVal,
            collegeYear: collegeYearVal,
            diplomaCourse: diplomaCourseVal,
            diplomaYear: diplomaYearVal,
            diplomaCollege: diplomaCollegeVal,
            otherDescription: otherDescriptionVal,
            softwareCourse: softwareCourseVal,
          };

          localStorage.setItem(
            "neram_application_draft_v1",
            JSON.stringify(payload)
          );
        } catch (err) {
          // ignore
        }
      }, 700);
    } catch (err) {}
    return () => {
      try {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      } catch {}
    };
    // watch all lifted primitives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formState,
    altPhoneState,
    instagramIdState,
    selectedLanguagesState,
    youtubeSubscribedState,
    selectedCourseState,
    educationTypeState,
    schoolStdState,
    collegeNameState,
    collegeYearState,
    diplomaCourseState,
    diplomaYearState,
    diplomaCollegeState,
    otherDescriptionState,
    softwareCourseState,
  ]);

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "#7c1fa0" }}>
        Application Form
      </h1>

      {currentStep === 1 && (
        <StepPhoneVerify
          initialPhone={phoneToEditState[0]}
          onVerified={(p) => {
            try {
              setVerifiedPhone(p);
              // clear phoneToEdit after successful verification
              try {
                phoneToEditState[1](null);
              } catch {}
            } catch {}
          }}
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <StepBasic
          form={form}
          altPhone={altPhone}
          setAltPhone={setAltPhone}
          showAltContact={showAltContact}
          setShowAltContact={setShowAltContact}
          instagramId={instagramId}
          setInstagramId={setInstagramId}
          selectedLanguages={selectedLanguages}
          youtubeSubscribed={youtubeSubscribed}
          setYoutubeSubscribed={setYoutubeSubscribed}
          step2Errors={step2Errors}
          setStep2Errors={setStep2Errors}
          saveDraft={saveDraft}
          saveToDatabase={() => saveToDatabase("basic")}
          validateStep2={validateStep2}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          setCurrentStep={setCurrentStep}
          verifiedPhone={verifiedPhone}
          setVerifiedPhone={setVerifiedPhone}
          fieldRefs={fieldRefs}
          editField={editField}
        />
      )}

      {currentStep === 3 && (
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
          onYoutubeSubscribed={setYoutubeSubscribedVal}
          youtubeSubscribed={youtubeSubscribedVal}
          setCurrentStep={setCurrentStep}
          validateStep2={validateStep2}
          saveDraft={saveDraft}
          saveToDatabase={() => saveToDatabase("education")}
          cycleDiplomaYear={cycleDiplomaYear}
        />
      )}

      {currentStep === 4 && (
        <StepCourse
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          setActiveTab={setActiveTab}
          softwareCourse={softwareCourse}
          setSoftwareCourse={setSoftwareCourse}
          SOFTWARE_FEE={SOFTWARE_FEE}
          youtubeSubscribed={youtubeSubscribedVal}
          onYoutubeSubscribed={setYoutubeSubscribedVal}
          form={form}
          setForm={setForm}
          setCurrentStep={setCurrentStep}
          saveToDatabase={(overrides) => saveToDatabase("course", overrides)}
        />
      )}

      {currentStep === 5 && (
        <StepReview
          form={form}
          verifiedPhone={verifiedPhone}
          altPhone={altPhone}
          instagramId={instagramId}
          educationType={educationType}
          collegeName={collegeName}
          collegeYear={collegeYear}
          diplomaCourse={diplomaCourse}
          diplomaYear={diplomaYear}
          diplomaCollege={diplomaCollege}
          otherDescription={otherDescription}
          selectedLanguages={selectedLanguages}
          selectedCourse={selectedCourse}
          softwareCourse={softwareCourse}
          hoveredKey={hoveredKey}
          setHoveredKey={setHoveredKey}
          setReviewMode={setReviewMode}
          setEditField={setEditField}
          setCurrentStep={setCurrentStep}
          saveToDatabase={(overrides) => saveToDatabase("course", overrides)}
          handleGoToStep={(stepIdx, fieldKey) => {
            try {
              // navigate to requested step
              setCurrentStep(stepIdx);
              // set parent editField so target step can enter edit mode
              setEditField && setEditField(fieldKey || null);
              // special-case phone: if navigating to phone verify (step 1) put phoneToEdit
              if (stepIdx === 1 && fieldKey === "phone") {
                try {
                  phoneToEditState[1](form?.phone || null);
                } catch {}
              }
            } catch (err) {
              console.warn(err);
            }
          }}
        />
      )}
    </div>
  );
}
