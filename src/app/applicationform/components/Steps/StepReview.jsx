import React from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import StepHeader from "../ui/TitleWsteps";

export default function StepReview(props) {
  const {
    form,
    verifiedPhone,
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
    selectedLanguages = [],
    selectedCourse,
    softwareCourse,
    hoveredKey,
    setHoveredKey,
    setReviewMode,
    setEditField,
    handleGoToStep,
  } = props;

  // dialog state for edit confirmation
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingEdit, setPendingEdit] = React.useState({
    key: null,
    step: null,
  });

  // map section title to step index (used when navigating back)
  // Adjust these values if your step indices differ in the parent.
  const sectionToStep = (title) => {
    switch (title) {
      case "Basic Details":
      case "Address":
        return 2; // Basic details / address step
      case "Education":
        return 3; // Education step
      case "Course & Payment":
      case "Preferences":
        return 4; // Course selection step
      default:
        return 2;
    }
  };

  // small helpers used to compute and format fee details (same rules as StepCourse)
  const formatINR = (n) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;
  const formatDate = (d) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  };

  const getAcademicStartYear = (d = new Date()) => {
    const y = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    if (month > 5 || (month === 5 && date >= 25)) return y;
    return y - 1;
  };

  const formatAcademicYear = (start) => {
    const s = Number(start) || getAcademicStartYear();
    const end = (s + 1) % 100;
    return `${s}-${String(end).padStart(2, "0")}`;
  };

  const currentAcademicStart = getAcademicStartYear();
  const nataAttemptStart = Number(
    form?.nataAttemptYear ?? currentAcademicStart
  );
  const isAttemptCurrent = nataAttemptStart === currentAcademicStart;

  const determineNataFee = () => {
    const cg = String(form?.classGrade || "");
    if (/12/.test(cg)) return isAttemptCurrent ? 30000 : 35000;
    if (/11/.test(cg)) return 35000;
    if (/below\s*11th|below\s*11|below 11|below 10th/i.test(cg)) return 35000;
    if (/diploma/i.test(cg)) {
      const dYear = String(form?.diplomaYear || "").toLowerCase();
      if (/3|3rd|third/.test(dYear) || /3rd/.test(cg))
        return isAttemptCurrent ? 30000 : 35000;
      return 35000;
    }
    if (/college/i.test(cg)) return isAttemptCurrent ? 30000 : 35000;
    return isAttemptCurrent ? 30000 : 35000;
  };

  return (
    <Box sx={{ maxWidth: 520, m: { xs: 2, md: 5 } }}>
      <StepHeader title="Review your details" steps="Step 5 of 6" />
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
              ["phone", "Verified Phone", verifiedPhone],
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
            ["paymentType", "Payment Type", form?.paymentType || "-"],
          ];
          // Common attempt year across all education types
          educationItems.push([
            "nataAttemptYear",
            "NATA/JEE attempt plan year",
            formatAcademicYear(nataAttemptStart),
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

          // Course & Payment (Step 4)
          const courseItems = [
            ["selectedCourse", "Selected Course", selectedCourse],
          ];
          if (selectedCourse === "software") {
            courseItems.push([
              "softwareCourse",
              "Software Course",
              softwareCourse,
            ]);
          }

          if (selectedCourse === "nata-jee") {
            // Show simplified summary: inclusive fee, discount applied, and total payable
            // Prefer DB values mapped into form when present
            const dbCourseFee = Number(form?.courseFee) || undefined;
            const dbDiscount =
              typeof form?.discount === "number"
                ? form.discount
                : Number(form?.discount) || undefined;
            const dbTotal =
              typeof form?.totalPayable === "number"
                ? form.totalPayable
                : Number(form?.totalPayable) || undefined;

            const computedTotalInclusive = determineNataFee();
            const computedDiscount =
              String(form?.paymentType || "part") === "full" ? 5000 : 0;
            const computedDiscountedInclusive = Math.max(
              0,
              computedTotalInclusive - computedDiscount
            );

            const totalInclusive = dbCourseFee ?? computedTotalInclusive;
            const discount = dbDiscount ?? computedDiscount;
            const discountedInclusive = dbTotal ?? computedDiscountedInclusive;

            courseItems.push([
              "courseTotal",
              "Course fees (incl. GST)",
              formatINR(totalInclusive),
            ]);
            courseItems.push([
              "discount",
              "Discount applied",
              formatINR(discount),
            ]);
            courseItems.push([
              "amountToPay",
              "Total payable",
              formatINR(discountedInclusive),
            ]);
          }

          courseItems.push([
            "amountPaidSoFar",
            "Amount paid (so far)",
            String(form?.paymentType || "part") === "part"
              ? formatINR(16500)
              : form?.firstPayment || "-",
          ]);
          sections.push({ title: "Course & Payment", items: courseItems });

          // Preferences
          sections.push({
            title: "Preferences",
            items: [
              ["languageMode", "Language Mode", form?.languageMode],
              [
                "selectedLanguages",
                "Selected Languages",
                Array.isArray(selectedLanguages)
                  ? selectedLanguages.join(", ")
                  : String(selectedLanguages || "-"),
              ],
            ],
          });

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

                // Save final application data to database
                if (props.saveToDatabase) {
                  const result = await props.saveToDatabase();
                  if (!result.ok) {
                    alert("Failed to submit application. Please try again.");
                    console.error("Final submission failed:", result.error);
                  }
                } else {
                  console.warn(
                    "saveToDatabase not provided; cannot proceed to payment."
                  );
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
              Confirm &amp; Proceed to Payment
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
    </Box>
  );
}
