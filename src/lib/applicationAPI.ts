// Utility functions for saving application form data to database
import { auth } from "./firebase";

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

export const saveApplicationStep = async (stepData: ApplicationData): Promise<{ ok: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User not authenticated, skipping database save");
      return { ok: false, error: "User not authenticated" };
    }

    // Get Firebase ID token
    const idToken = await user.getIdToken();
    
    // Prepare payload for the API
    const payload = {
      uid: user.uid,
      email: stepData.form?.email || user.email,
      phone: stepData.verifiedPhone || user.phoneNumber,
      displayName: stepData.form?.studentName || user.displayName,
      fatherName: stepData.form?.fatherName,
      gender: stepData.form?.gender,
      zipCode: stepData.form?.zipCode,
      city: stepData.form?.city,
      state: stepData.form?.state,
      country: stepData.form?.country,
      instagram: stepData.instagramId,
      educationType: stepData.educationType,
      selectedCourse: stepData.selectedCourse,
      courseFee: stepData.form?.courseFee,
      discount: stepData.form?.discount || 0,
      paymentType: stepData.form?.paymentType,
      totalPayable: stepData.form?.totalPayable,
      phoneAuth: true,
      // Store additional application data in the application JSON field
      application: {
        altPhone: stepData.altPhone,
        selectedLanguages: stepData.selectedLanguages,
        youtubeSubscribed: stepData.youtubeSubscribed,
        schoolStd: stepData.schoolStd,
        collegeName: stepData.collegeName,
        collegeYear: stepData.collegeYear,
        diplomaCourse: stepData.diplomaCourse,
        diplomaYear: stepData.diplomaYear,
        diplomaCollege: stepData.diplomaCollege,
        otherDescription: stepData.otherDescription,
        softwareCourse: stepData.softwareCourse,
        formData: stepData.form,
      },
    };

    // Make API call to save data
    const response = await fetch("/api/users/upsert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
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