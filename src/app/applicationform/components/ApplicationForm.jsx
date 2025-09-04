"use client";
import React, { useState, useRef } from "react";
import StepBasic from "./StepBasic";
import StepCourse from "./StepCourse";
import StepEdu from "./StepEdu";
import StepReview from "./StepReview";
import PhoneAuth from "./PhoneAuth";

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

  // option lists used by StepEdu
  const standardOptions = ["Below 10th", "10th", "11th", "12th"];
  const diplomaYearOptions = [
    "First Year",
    "Second Year",
    "Third Year",
    "Completed",
  ];

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "#7c1fa0" }}>
        Application Form
      </h1>

      {currentStep === 1 && (
        <div style={{ maxWidth: 520, margin: 40 }}>
          <PhoneAuth
            initialPhone={phoneToEditState[0]}
            onVerified={(p) => {
              try {
                setVerifiedPhone(p);
                // clear phoneToEdit after successful verification
                try {
                  phoneToEditState[1](null);
                } catch {}
                setCurrentStep(2);
              } catch {}
            }}
          />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#f3f3f3",
                cursor: "pointer",
              }}
            >
              Continue to application
            </button>
          </div>
        </div>
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
          validateStep2={validateStep2}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          setCurrentStep={setCurrentStep}
          verifiedPhone={verifiedPhone}
          setVerifiedPhone={setVerifiedPhone}
          fieldRefs={fieldRefs}
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
        />
      )}

      {currentStep === 5 && (
        <StepReview
          formState={formState}
          verifiedPhone={verifiedPhone}
          setCurrentStep={setCurrentStep}
        />
      )}
    </div>
  );
}
