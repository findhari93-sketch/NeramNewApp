import React from "react";
import { Box, Typography } from "@mui/material";

export default function StepReview(props) {
  const {
    form,
    verifiedPhone,
    altPhone,
    instagramId,
    educationType,
    collegeName,
    collegeYear,
    diplomaCourse,
    diplomaYear,
    diplomaCollege,
    otherDescription,
    selectedLanguages = [],
    selectedCourse,
    softwareCourse,
    hoveredKey,
    setHoveredKey,
    setReviewMode,
    setEditField,
  } = props;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ mb: 1.5, fontWeight: 600, fontSize: 16 }}>
        Review your details
      </Typography>
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #eee",
          p: 1.5,
          borderRadius: 1,
        }}
      >
        {/* Build a list of key/label/value pairs to show (only relevant ones) */}
        {(() => {
          const items = [];

          // Basic contact fields
          items.push(["studentName", "Student Name", form.studentName]);
          items.push(["fatherName", "Father Name", form.fatherName]);
          items.push(["phone", "Verified Phone", verifiedPhone]);
          items.push(["altPhone", "Additional Contact", altPhone]);
          items.push(["instagramId", "Instagram", instagramId]);

          // Include radio selections in review (education type and payment type)
          const educationLabel =
            educationType === "school"
              ? "School"
              : educationType === "college"
              ? "College"
              : educationType === "diploma"
              ? "Diploma"
              : "Other";
          items.push(["educationType", "Education (type)", educationLabel]);

          items.push([
            "paymentType",
            "Payment Type",
            form.paymentType === "full"
              ? "Full"
              : form.paymentType === "part"
              ? "Part"
              : String(form.paymentType ?? "-"),
          ]);

          // Education-specific fields (only include fields for the selected educationType)
          if (educationType === "school") {
            items.push(["classGrade", "Class / Standard", form.classGrade]);
            items.push(["board", "Board", form.board]);
            items.push(["boardYear", "Board Year", form.boardYear]);
          } else if (educationType === "college") {
            items.push(["collegeName", "College Name", collegeName]);
            items.push(["collegeYear", "College Year", collegeYear]);
          } else if (educationType === "diploma") {
            items.push(["diplomaCourse", "Diploma Course", diplomaCourse]);
            items.push(["diplomaYear", "Diploma Year", diplomaYear]);
            items.push(["diplomaCollege", "Diploma College", diplomaCollege]);
          } else if (educationType === "other") {
            items.push(["otherDescription", "Description", otherDescription]);
          }

          // Address (show always)
          items.push(["zipCode", "Zip Code", form.zipCode]);
          items.push(["city", "City", form.city]);
          items.push(["state", "State", form.state]);
          items.push(["country", "Country", form.country]);

          // Language preferences
          items.push(["languageMode", "Language Mode", form.languageMode]);
          items.push([
            "selectedLanguages",
            "Selected Languages",
            Array.isArray(selectedLanguages)
              ? selectedLanguages.join(", ")
              : String(selectedLanguages),
          ]);

          // Course selection and course-specific fields
          items.push(["selectedCourse", "Selected Course", selectedCourse]);
          if (selectedCourse === "software") {
            items.push(["softwareCourse", "Software Course", softwareCourse]);
          }

          return items.map(([key, label, value]) => {
            const k = String(key);
            const isHover = hoveredKey === k;
            return (
              <div
                key={k}
                onMouseEnter={() => setHoveredKey && setHoveredKey(k)}
                onMouseLeave={() => setHoveredKey && setHoveredKey(null)}
                onClick={() => {
                  setReviewMode && setReviewMode(false);
                  setEditField && setEditField(k);
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
                    }}
                  >
                    <span style={{ opacity: 0.9 }}>✎</span>
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
        <button
          type="button"
          onClick={() => setReviewMode && setReviewMode(false)}
          style={{
            padding: "10px 14px",
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Back to edit
        </button>
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            background: "#7c1fa0",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Confirm & Submit
        </button>
      </Box>
    </Box>
  );
}
