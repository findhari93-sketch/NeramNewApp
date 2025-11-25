import React from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  TextField,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StepHeader from "../ui/TitleWsteps";
import PhoneInput from "react-phone-input-2";

export default function StepReview(props) {
  const {
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
    hoveredKey,
    setHoveredKey,
    onSubmitSuccess,
    saveToDatabase,
    setForm,
    setAltPhone,
    setInstagramId,
    setSchoolStd,
    setCollegeName,
    setCollegeYear,
    setDiplomaCourse,
    setDiplomaYear,
    setDiplomaCollege,
    setOtherDescription,
    setSelectedCourse,
    handleGoToStep,
  } = props;

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState(null);
  const [editValue, setEditValue] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Confirmation dialog for education type edit
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  // Snackbar state for non-blocking messages
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMsg(message || "");
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Field metadata: type, options, etc.
  const getFieldMetadata = (key) => {
    const metadata = {
      studentName: {
        type: "text",
        label: "Student Name",
        dbField: "studentName",
      },
      fatherName: { type: "text", label: "Father Name", dbField: "fatherName" },
      phone: { type: "phone", label: "Phone", readonly: true },
      altPhone: {
        type: "phone",
        label: "Additional Contact",
        dbField: "altPhone",
      },
      instagramId: { type: "text", label: "Instagram", dbField: "instagramId" },
      zipCode: { type: "text", label: "Zip Code", dbField: "zipCode" },
      city: { type: "text", label: "City", dbField: "city" },
      state: { type: "text", label: "State", dbField: "state" },
      country: { type: "text", label: "Country", dbField: "country" },
      educationType: {
        type: "select",
        label: "Education Type",
        options: [
          { value: "school", label: "School" },
          { value: "college", label: "College" },
          { value: "diploma", label: "Diploma" },
          { value: "other", label: "Other" },
        ],
        navigateToStep: true,
      },
      classGrade: {
        type: "select",
        label: "Class / Standard",
        dbField: "schoolStd",
        options: [
          { value: "Below 10th", label: "Below 10th" },
          { value: "10th", label: "10th" },
          { value: "11th", label: "11th" },
          { value: "12th", label: "12th" },
        ],
      },
      board: {
        type: "select",
        label: "Board",
        dbField: "board",
        options: [
          { value: "CBSE", label: "CBSE" },
          { value: "State Board", label: "State Board" },
          { value: "ICSE", label: "ICSE" },
          { value: "Other", label: "Other" },
        ],
      },
      collegeName: {
        type: "text",
        label: "College Name",
        dbField: "collegeName",
      },
      collegeYear: {
        type: "select",
        label: "College Year",
        dbField: "collegeYear",
        options: [
          { value: "1st Year", label: "1st Year" },
          { value: "2nd Year", label: "2nd Year" },
          { value: "3rd Year", label: "3rd Year" },
          { value: "4th Year", label: "4th Year" },
          { value: "5th Year", label: "5th Year" },
        ],
      },
      diplomaCourse: {
        type: "text",
        label: "Diploma Course",
        dbField: "diplomaCourse",
      },
      diplomaYear: {
        type: "select",
        label: "Diploma Year",
        dbField: "diplomaYear",
        options: [
          { value: "First Year", label: "First Year" },
          { value: "Second Year", label: "Second Year" },
          { value: "Third Year", label: "Third Year" },
          { value: "Completed", label: "Completed" },
        ],
      },
      diplomaCollege: {
        type: "text",
        label: "Diploma College",
        dbField: "diplomaCollege",
      },
      otherDescription: {
        type: "textarea",
        label: "Description",
        dbField: "otherDescription",
      },
      selectedCourse: {
        type: "select",
        label: "Selected Course",
        dbField: "selectedCourse",
        options: [
          { value: "nata-jee-2yr", label: "NATA/JEE 2 Year long" },
          { value: "crash", label: "Crash course" },
          { value: "revit", label: "Revit Architecture" },
          { value: "other", label: "Other" },
        ],
      },
    };
    return metadata[key] || { type: "text", label: key };
  };

  // Open edit dialog - directly show the edit field
  const handleEditClick = (key, label, value) => {
    const metadata = getFieldMetadata(key);

    // If field is readonly, show message
    if (metadata.readonly) {
      showSnackbar("This field cannot be edited from here", "info");
      return;
    }

    // If field requires navigation to step (like educationType), show confirmation
    if (metadata.navigateToStep && key === "educationType") {
      setConfirmDialogOpen(true);
      return;
    }

    setEditingField({ key, label, metadata });
    setEditValue(value || "");
    setEditDialogOpen(true);
  };

  // Handle education type edit confirmation
  const handleConfirmNavigateToEducation = () => {
    setConfirmDialogOpen(false);
    if (handleGoToStep) {
      handleGoToStep(2, "educationType"); // Navigate to step 2 (Education step)
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    if (handleGoToStep) {
      handleGoToStep(2); // Go back to step 2 (Education step)
    }
  };

  // Save edit to database
  const handleSaveEdit = async () => {
    if (!editingField) return;

    setIsSaving(true);

    try {
      const { auth } = await import("../../../../../lib/firebase");
      const currentUser = auth.currentUser;

      if (!currentUser) {
        showSnackbar("Please log in to save changes", "error");
        setIsSaving(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const fieldKey = editingField.key;

      // Prepare payload based on field
      const payload = {
        uid: currentUser.uid,
      };

      // Map field to database column
      if (fieldKey === "altPhone") {
        payload.alternate_phone = editValue;
      } else if (fieldKey === "instagramId") {
        payload.instagram = editValue;
      } else if (fieldKey === "studentName") {
        payload.displayName = editValue;
      } else if (fieldKey === "fatherName") {
        payload.fatherName = editValue;
      } else if (fieldKey === "zipCode") {
        payload.zipCode = editValue;
      } else if (fieldKey === "city") {
        payload.city = editValue;
      } else if (fieldKey === "state") {
        payload.state = editValue;
      } else if (fieldKey === "country") {
        payload.country = editValue;
      } else if (fieldKey === "classGrade") {
        payload.schoolStd = editValue;
      } else if (fieldKey === "board") {
        payload.board = editValue;
      } else if (fieldKey === "collegeName") {
        payload.collegeName = editValue;
      } else if (fieldKey === "collegeYear") {
        payload.collegeYear = editValue;
      } else if (fieldKey === "diplomaCourse") {
        payload.diplomaCourse = editValue;
      } else if (fieldKey === "diplomaYear") {
        payload.diplomaYear = editValue;
      } else if (fieldKey === "diplomaCollege") {
        payload.diplomaCollege = editValue;
      } else if (fieldKey === "otherDescription") {
        payload.otherDescription = editValue;
      } else if (fieldKey === "selectedCourse") {
        payload.selectedCourse = editValue;
      }

      // Make API call to save data
      const response = await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        showSnackbar(result.error || "Failed to save changes", "error");
        setIsSaving(false);
        return;
      }

      // Success - show message
      showSnackbar("Changes saved successfully!", "success");

      // Update local state immediately to reflect changes in UI
      const editedFieldKey = editingField.key;
      if (editedFieldKey === "altPhone" && setAltPhone) {
        setAltPhone(editValue);
      } else if (editedFieldKey === "instagramId" && setInstagramId) {
        setInstagramId(editValue);
      } else if (editedFieldKey === "studentName" && setForm) {
        setForm((prev) => ({ ...prev, studentName: editValue }));
      } else if (editedFieldKey === "fatherName" && setForm) {
        setForm((prev) => ({ ...prev, fatherName: editValue }));
      } else if (editedFieldKey === "zipCode" && setForm) {
        setForm((prev) => ({ ...prev, zipCode: editValue }));
      } else if (editedFieldKey === "city" && setForm) {
        setForm((prev) => ({ ...prev, city: editValue }));
      } else if (editedFieldKey === "state" && setForm) {
        setForm((prev) => ({ ...prev, state: editValue }));
      } else if (editedFieldKey === "country" && setForm) {
        setForm((prev) => ({ ...prev, country: editValue }));
      } else if (editedFieldKey === "classGrade" && setSchoolStd) {
        setSchoolStd(editValue);
        setForm((prev) => ({ ...prev, classGrade: editValue }));
      } else if (editedFieldKey === "board" && setForm) {
        setForm((prev) => ({ ...prev, board: editValue }));
      } else if (editedFieldKey === "collegeName" && setCollegeName) {
        setCollegeName(editValue);
      } else if (editedFieldKey === "collegeYear" && setCollegeYear) {
        setCollegeYear(editValue);
      } else if (editedFieldKey === "diplomaCourse" && setDiplomaCourse) {
        setDiplomaCourse(editValue);
      } else if (editedFieldKey === "diplomaYear" && setDiplomaYear) {
        setDiplomaYear(editValue);
      } else if (editedFieldKey === "diplomaCollege" && setDiplomaCollege) {
        setDiplomaCollege(editValue);
      } else if (editedFieldKey === "otherDescription" && setOtherDescription) {
        setOtherDescription(editValue);
      } else if (editedFieldKey === "selectedCourse" && setSelectedCourse) {
        setSelectedCourse(editValue);
      }

      setIsSaving(false);

      // Close dialog after a brief delay
      setTimeout(() => {
        setEditDialogOpen(false);
        setEditingField(null);
        setEditValue("");
      }, 500);
    } catch (error) {
      console.error("Error saving edit:", error);
      showSnackbar("An error occurred while saving", "error");
      setIsSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingField(null);
    setEditValue("");
  };

  // Render edit control based on field type
  const renderEditControl = () => {
    if (!editingField) return null;

    const { metadata } = editingField;

    if (metadata.type === "phone") {
      return (
        <PhoneInput
          country={"in"}
          value={editValue}
          onChange={(value) => setEditValue(value)}
          inputStyle={{ width: "100%", height: 40 }}
          containerStyle={{ marginTop: 8 }}
          enableSearch
          autoFocus
        />
      );
    }

    if (metadata.type === "select") {
      return (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>{metadata.label}</InputLabel>
          <Select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            label={metadata.label}
            autoFocus
          >
            {metadata.options?.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (metadata.type === "textarea") {
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          variant="outlined"
          label={metadata.label}
          sx={{ mt: 2 }}
          autoFocus
        />
      );
    }

    // Default: text field
    return (
      <TextField
        fullWidth
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        variant="outlined"
        label={metadata.label}
        sx={{ mt: 2 }}
        autoFocus
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 520, m: { xs: 2, md: 5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton
          onClick={handleBackClick}
          sx={{
            color: "#7c1fa0",
            "&:hover": { bgcolor: "rgba(124, 31, 160, 0.08)" },
          }}
          aria-label="Go back to previous step"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <StepHeader title="Review your details" steps="Step 3 of 3" />
        </Box>
      </Box>
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #eee",
          p: 1.5,
          borderRadius: 1,
        }}
      >
        {/* Group fields by their originating step with section titles */}
        {(() => {
          const sections = [];

          // Basic Details
          sections.push({
            title: "Basic Details",
            items: [
              ["studentName", "Student Name", form?.studentName],
              ["fatherName", "Father Name", form?.fatherName],
              ["phone", "Phone", form?.phone],
              ["altPhone", "Additional Contact", altPhone],
              ["instagramId", "Instagram", instagramId],
            ],
          });

          // Education
          const educationLabel =
            educationType === "school"
              ? "School"
              : educationType === "college"
              ? "College"
              : educationType === "diploma"
              ? "Diploma"
              : "Other";

          const educationItems = [
            ["educationType", "Education (type)", educationLabel],
          ];

          const courseItems = [];
          courseItems.push([
            "selectedCourse",
            "Selected course",
            selectedCourse || "-",
          ]);

          if (educationType === "school") {
            educationItems.push([
              "classGrade",
              "Class / Standard",
              form?.classGrade || schoolStd,
            ]);
            educationItems.push(["board", "Board", form?.board]);
          } else if (educationType === "college") {
            educationItems.push(["collegeName", "College Name", collegeName]);
            educationItems.push(["collegeYear", "College Year", collegeYear]);
          } else if (educationType === "diploma") {
            educationItems.push([
              "diplomaCourse",
              "Diploma Course",
              diplomaCourse,
            ]);
            educationItems.push(["diplomaYear", "Diploma Year", diplomaYear]);
            educationItems.push([
              "diplomaCollege",
              "Diploma College",
              diplomaCollege,
            ]);
          } else if (educationType === "other") {
            educationItems.push([
              "otherDescription",
              "Description",
              otherDescription,
            ]);
          }
          sections.push({ title: "Education", items: educationItems });

          // Selected course section
          sections.push({ title: "Selected Course", items: courseItems });

          // Address
          sections.push({
            title: "Address",
            items: [
              ["zipCode", "Zip Code", form?.zipCode],
              ["city", "City", form?.city],
              ["state", "State", form?.state],
              ["country", "Country", form?.country],
            ],
          });

          // Render sections with improved UX
          return sections.map((sec) => (
            <div key={sec.title} style={{ marginBottom: 12 }}>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 14 }}>
                {sec.title}
              </Typography>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {sec.items.map(([key, label, value]) => {
                  const k = String(key);
                  const isHover = hoveredKey === k;
                  return (
                    <div
                      key={k}
                      onMouseEnter={() => setHoveredKey && setHoveredKey(k)}
                      onMouseLeave={() => setHoveredKey && setHoveredKey(null)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderBottom: "1px solid #f6f6f6",
                        background: isHover ? "#fafafa" : "transparent",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <div style={{ color: "#666", fontSize: 13 }}>{label}</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            color: "#111",
                            minWidth: 140,
                            textAlign: "right",
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {value !== undefined && value !== null
                            ? String(value)
                            : "-"}
                        </div>
                        {/* Fixed-width edit icon space - no dancing! */}
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(k, label, value)}
                            sx={{
                              opacity: isHover ? 1 : 0,
                              transition: "opacity 0.2s ease",
                              width: 28,
                              height: 28,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16, color: "#7c1fa0" }} />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </Box>

      {/* Agreement checkbox and submit button */}
      {(() => {
        const [agreed, setAgreed] = React.useState(false);
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        return (
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.5 }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#333",
                fontSize: 14,
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                aria-label="I agree to terms and conditions"
              />
              <span>I agree to terms &amp; conditions</span>
            </label>

            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              onClick={async (e) => {
                e.preventDefault();
                if (!agreed || isSubmitting) return;

                setIsSubmitting(true);
                try {
                  // Save final application data to database
                  if (props.saveToDatabase) {
                    const result = await props.saveToDatabase();
                    if (!result.ok) {
                      showSnackbar(
                        "Failed to submit application. Please try again.",
                        "error"
                      );
                      console.error("Final submission failed:", result.error);
                      setIsSubmitting(false);
                      return;
                    }
                  } else {
                    console.warn("saveToDatabase not provided.");
                    setIsSubmitting(false);
                    return;
                  }

                  // Get Firebase Auth user and token
                  const { auth } = await import("../../../../../lib/firebase");
                  const currentUser = auth.currentUser;
                  if (!currentUser) {
                    console.error("No authenticated user found");
                    showSnackbar(
                      "Please log in again and try submitting.",
                      "error"
                    );
                    setIsSubmitting(false);
                    return;
                  }

                  const token = await currentUser.getIdToken();

                  // Trigger admin notification email
                  const submitRes = await fetch("/api/applications/submit", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      firebaseUid: currentUser.uid,
                    }),
                  });

                  if (!submitRes.ok) {
                    const errorData = await submitRes.json().catch(() => ({}));
                    console.error("Admin notification failed:", errorData);
                    console.warn(
                      "Admin notification failed, but application was saved"
                    );
                  }

                  // Redirect to applications page after submission completes
                  if (onSubmitSuccess) {
                    onSubmitSuccess();
                  }
                } catch (error) {
                  console.error("Error during submission:", error);
                  showSnackbar("An error occurred. Please try again.", "error");
                  setIsSubmitting(false);
                }
              }}
              style={{
                padding: "10px 14px",
                background: agreed && !isSubmitting ? "#7c1fa0" : "#e6cfee",
                color: agreed && !isSubmitting ? "#fff" : "#7a4a7a",
                border: "none",
                borderRadius: 4,
                cursor: agreed && !isSubmitting ? "pointer" : "not-allowed",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isSubmitting && (
                <CircularProgress size={16} sx={{ color: "#7a4a7a" }} />
              )}
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </button>
          </Box>
        );
      })()}

      {/* Edit Dialog - Direct inline editing */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit {editingField?.label}</DialogTitle>
        <DialogContent>{renderEditControl()}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelEdit} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Non-blocking feedback popup */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      {/* Confirmation dialog for education type edit */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Education Information?</DialogTitle>
        <DialogContent>
          <Typography>
            Education type has multiple associated fields. Do you want to go
            back to the education step to edit this information?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            No
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmNavigateToEducation}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
