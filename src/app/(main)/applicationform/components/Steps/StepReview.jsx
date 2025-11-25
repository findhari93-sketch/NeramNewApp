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
} from "@mui/material";
import StepHeader from "../ui/TitleWsteps";

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
    setReviewMode,
    setEditField,
    handleGoToStep,
    onSubmitSuccess,
  } = props;

  // dialog state for edit confirmation
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingEdit, setPendingEdit] = React.useState({
    key: null,
    step: null,
  });

  // Snackbar state for non-blocking messages (replaces alert())
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMsg(message || "");
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // map section title to step index (used when navigating back)
  // 3-step flow: 1=Basic, 2=Education, 3=Review
  const sectionToStep = (title) => {
    switch (title) {
      case "Basic Details":
      case "Address":
        return 1; // Basic details / address step
      case "Education":
        return 2; // Education step
      case "Selected Course":
        return 2; // Course selection lives under Education
      default:
        return 1;
    }
  };

  // helper to format academic year start -> "YYYY-YY"
  const getAcademicStartYear = (d = new Date()) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const date = d.getDate();
    return m > 5 || (m === 5 && date >= 25) ? y : y - 1;
  };
  const formatAcademicYear = (start) => {
    const s = Number(start) || getAcademicStartYear();
    const end = (s + 1) % 100;
    return `${s}-${String(end).padStart(2, "0")}`;
  };

  return (
    <Box sx={{ maxWidth: 520, m: { xs: 2, md: 5 } }}>
      <StepHeader title="Review your details" steps="Step 3 of 3" />
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

          // Basic Details (Step 2)
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

          // Education (Step 3)
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
          // add selected course as its own section in review
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

          // Address (Step 2/basic as well)
          sections.push({
            title: "Address",
            items: [
              ["zipCode", "Zip Code", form?.zipCode],
              ["city", "City", form?.city],
              ["state", "State", form?.state],
              ["country", "Country", form?.country],
            ],
          });

          // Removed Course/Payment and Preferences sections

          // Render sections
          return sections.map((sec) => (
            <div key={sec.title} style={{ marginBottom: 12 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
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
                      onClick={() => {
                        // open confirmation dialog before navigating
                        const stepIdx = sectionToStep(sec.title);
                        setPendingEdit({ key: k, step: stepIdx, label });
                        setConfirmOpen(true);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setReviewMode && setReviewMode(false);
                          setEditField && setEditField(k);
                        }
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 6px",
                        borderBottom: "1px solid #f6f6f6",
                        background: isHover ? "#fbfbfb" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ color: "#666" }}>{label}</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            color: "#111",
                            minWidth: 160,
                            textAlign: "right",
                          }}
                        >
                          {value !== undefined && value !== null
                            ? String(value)
                            : "-"}
                        </div>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            display: isHover ? "flex" : "none",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ opacity: 0.9 }}>✎</span>
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

      {/* Agreement checkbox and submit button: require checkbox before allowing submission */}
      {(() => {
        const [agreed, setAgreed] = React.useState(false);
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
              disabled={!agreed}
              onClick={async (e) => {
                e.preventDefault();
                if (!agreed) return;

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
                      return;
                    }
                  } else {
                    console.warn("saveToDatabase not provided.");
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
                }
              }}
              style={{
                padding: "10px 14px",
                background: agreed ? "#7c1fa0" : "#e6cfee",
                color: agreed ? "#fff" : "#7a4a7a",
                border: "none",
                borderRadius: 4,
                cursor: agreed ? "pointer" : "not-allowed",
              }}
            >
              Confirm &amp; Submit
            </button>
          </Box>
        );
      })()}
      {/* Confirmation dialog for edit navigation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm edit</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to edit{" "}
            {pendingEdit && pendingEdit.label
              ? `"${pendingEdit.label}"`
              : "this field"}
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              // Cancel
              setConfirmOpen(false);
              setPendingEdit({ key: null, step: null });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Yes: navigate back to the step and close dialog
              setConfirmOpen(false);
              if (pendingEdit && pendingEdit.step != null) {
                handleGoToStep &&
                  handleGoToStep(pendingEdit.step, pendingEdit.key);
              }
              setPendingEdit({ key: null, step: null });
            }}
          >
            Yes
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
    </Box>
  );
}
