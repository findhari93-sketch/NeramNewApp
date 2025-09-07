// Utility functions for saving application form data to database
import { auth } from "./firebase";
import apiClient from "./apiClient";

type StepKey = "basic" | "education" | "course";

interface ApplicationData {
  form?: Record<string, unknown>;
  altPhone?: string;
  instagramId?: string;
  selectedLanguages?: string[];
  youtubeSubscribed?: boolean;
  selectedCourse?: string;
  educationType?: string;
  schoolStd?: string;
  collegeName?: string;
  collegeYear?: string;
  diplomaCourse?: string;
  diplomaYear?: string;
  diplomaCollege?: string;
  otherDescription?: string;
  softwareCourse?: string;
  verifiedPhone?: string | null;
}

export const saveApplicationStep = async (
  step: StepKey,
  stepData: ApplicationData
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User not authenticated, skipping database save");
      return { ok: false, error: "User not authenticated" };
    }

    // Get fresh Firebase ID token to avoid racing a stale token
    await user.getIdToken(true);

    // Prepare payload for the API
    // Only include fields relevant to the provided step to avoid unintended writes.
    const payload: Record<string, unknown> = {
      uid: user.uid,
      phoneAuth: true,
    };

    // Step-scoped top-level columns
    if (step === "basic") {
      if (stepData.form?.email) payload.email = stepData.form.email;
      if (stepData.form?.studentName)
        payload.displayName = stepData.form.studentName;
      if (stepData.form?.fatherName)
        payload.fatherName = stepData.form.fatherName;
      if (stepData.form?.gender) payload.gender = stepData.form.gender;
      if (stepData.form?.zipCode) payload.zipCode = stepData.form.zipCode;
      if (stepData.form?.city) payload.city = stepData.form.city;
      if (stepData.form?.state) payload.state = stepData.form.state;
      if (stepData.form?.country) payload.country = stepData.form.country;
      if (stepData.instagramId) payload.instagram = stepData.instagramId;
    }

    if (step === "education") {
      if (stepData.educationType)
        payload.educationType = stepData.educationType;
    }

    if (step === "course") {
      if (stepData.selectedCourse)
        payload.selectedCourse = stepData.selectedCourse;
      // Optional billing-related fields if caller provided them
      if (stepData.form?.courseFee) payload.courseFee = stepData.form.courseFee;
      if (typeof stepData.form?.discount !== "undefined")
        payload.discount = stepData.form?.discount;
      if (stepData.form?.paymentType)
        payload.paymentType = stepData.form.paymentType;
      if (stepData.form?.totalPayable)
        payload.totalPayable = stepData.form.totalPayable;
    }

    // Build application JSON namespaced by step
    const appSection: Record<string, unknown> = {};
    if (step === "basic") {
      appSection.altPhone = stepData.altPhone;
      appSection.selectedLanguages = stepData.selectedLanguages;
      appSection.youtubeSubscribed = stepData.youtubeSubscribed;
      appSection.form = stepData.form; // store raw form for step-specific fields
    } else if (step === "education") {
      appSection.educationType = stepData.educationType;
      const type = stepData.educationType;
      const form = stepData.form || {};
      const nataAttemptYear = (form as Record<string, unknown>)[
        "nataAttemptYear"
      ];

      appSection.educationType = type;
      if (nataAttemptYear !== undefined)
        appSection.nataAttemptYear = nataAttemptYear;

      if (type === "school") {
        // Only store school-related fields
        if (stepData.schoolStd) appSection.schoolStd = stepData.schoolStd;
        const board = (form as Record<string, unknown>)["board"];
        if (board !== undefined) appSection.board = board;
        const boardYear = (form as Record<string, unknown>)["boardYear"];
        if (boardYear !== undefined) appSection.boardYear = boardYear;
        const schoolName = (form as Record<string, unknown>)["schoolName"];
        if (schoolName !== undefined) appSection.schoolName = schoolName;
      } else if (type === "college") {
        // Only store college-related fields
        if (stepData.collegeName) appSection.collegeName = stepData.collegeName;
        if (stepData.collegeYear) appSection.collegeYear = stepData.collegeYear;
      } else if (type === "diploma") {
        // Only store diploma-related fields
        if (stepData.diplomaCourse)
          appSection.diplomaCourse = stepData.diplomaCourse;
        if (stepData.diplomaYear) appSection.diplomaYear = stepData.diplomaYear;
        if (stepData.diplomaCollege)
          appSection.diplomaCollege = stepData.diplomaCollege;
      } else if (type === "other") {
        // Only store freeform description
        if (stepData.otherDescription)
          appSection.otherDescription = stepData.otherDescription;
      }
    } else if (step === "course") {
      appSection.selectedCourse = stepData.selectedCourse;
      appSection.softwareCourse = stepData.softwareCourse;
      appSection.youtubeSubscribed = stepData.youtubeSubscribed;
      appSection.form = stepData.form; // any computed totals if caller set them
    }

    payload.application = { [step]: appSection };

    // Make API call to save data (apiClient adds Authorization)
    const response = await apiClient("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return { ok: false, error: result.error || "Failed to save data" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error saving application step:", error);
    return { ok: false, error: String(error) };
  }
};
