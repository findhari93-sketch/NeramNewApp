import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import StepHeader from "../ui/TitleWsteps";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import YoutubeSubscribe from "../../../components/shared/YoutubeSubscribe";

// lightweight typed form shape used in this component
type FormObj = Record<string, unknown> & {
  paymentType?: "part" | "full";
  classGrade?: string;
  nataAttemptYear?: number;
};

interface StepCourseProps {
  selectedCourse: string;
  setSelectedCourse: (v: string) => void;
  setActiveTab: (v: string) => void;
  softwareCourse?: string;
  setSoftwareCourse?: (v: string) => void;
  SOFTWARE_FEE?: number;
  youtubeSubscribed?: boolean;
  onYoutubeSubscribed?: (flag?: boolean) => void;
  nataJeeFee?: number;
  nataJeePart1?: number;
  nataJeeInfo?: React.ReactNode;
  form: FormObj;
  setForm: (f: FormObj | ((prev?: FormObj) => FormObj)) => void;
  setCurrentStep: (n: number) => void;
  saveToDatabase?: (
    overrides?: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: string }>;
  labelStyle?: React.CSSProperties;
}

export default function StepCourse(props: StepCourseProps) {
  const {
    selectedCourse,
    setSelectedCourse,
    setActiveTab,
    softwareCourse,
    setSoftwareCourse,
    SOFTWARE_FEE = 0,
    youtubeSubscribed,
    onYoutubeSubscribed,
    nataJeeFee = 0,
    nataJeePart1 = 0,
    nataJeeInfo,
    form,
    setForm,
    setCurrentStep,
    saveToDatabase,
    labelStyle,
  } = props;

  React.useEffect(() => {
    try {
      if (!form || !form.paymentType) {
        setForm((prev = {}) => ({ ...(prev || {}), paymentType: "part" }));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classGrade = String(
    (form &&
      ((form as Record<string, unknown>)["classGrade"] ||
        (form as Record<string, unknown>)["classGrade"])) ||
      ""
  );

  const getAcademicStartYear = (d: Date = new Date()) => {
    const y = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    if (month > 5 || (month === 5 && date >= 25)) return y;
    return y - 1;
  };

  const currentAcademicStart = getAcademicStartYear();
  const nataAttemptStart = Number(
    ((form as Record<string, unknown>)["nataAttemptYear"] as number) ??
      currentAcademicStart
  );
  const isAttemptCurrent = nataAttemptStart === currentAcademicStart;

  const determineNataFee = () => {
    const cg = classGrade || "";
    if (/12/.test(cg)) return isAttemptCurrent ? 30000 : 35000;
    if (/11/.test(cg)) return 35000;
    if (/below\s*11th|below\s*11|below 11|below 10th/i.test(cg)) return 35000;
    if (/diploma/i.test(cg)) {
      const dYear = String(
        ((form as Record<string, unknown>)["diplomaYear"] as string) || ""
      ).toLowerCase();
      if (/3|3rd|third/.test(dYear) || /3rd/.test(cg))
        return isAttemptCurrent ? 30000 : 35000;
      return 35000;
    }
    if (/college/i.test(cg)) return isAttemptCurrent ? 30000 : 35000;
    return isAttemptCurrent ? 30000 : 35000;
  };

  const computedNataFee =
    selectedCourse === "nata-jee" ? determineNataFee() : nataJeeFee || 0;
  const formatINR = (n: number) =>
    `₹${new Intl.NumberFormat("en-IN").format(n)}`;

  const paymentType: "full" | "part" = (((form as Record<string, unknown>)[
    "paymentType"
  ] as "full" | "part") || "part") as "full" | "part";

  const formatDate = (d: Date) => {
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

  // compute order summary values
  // treat `courseFee` as GST-inclusive. Split inclusive -> excl + GST.
  const inclusiveCourseFee =
    selectedCourse === "nata-jee" ? computedNataFee : SOFTWARE_FEE || 0;
  const discount =
    selectedCourse === "nata-jee" && paymentType === "full" ? 5000 : 0;
  const YT_DISCOUNT_AMOUNT = 25; // flat discount for YouTube subscription
  const youtubeDiscount = youtubeSubscribed ? YT_DISCOUNT_AMOUNT : 0;
  const totalDiscount = discount + youtubeDiscount;

  const splitInclusive = (inclusive: number) => {
    // User requested an 82% ex-GST approximation so excl + gst = inclusive
    const excl = Math.round((inclusive * 82) / 100);
    const gst = inclusive - excl;
    return { excl, gst };
  };

  const inclusiveAfterDiscount = Math.max(
    0,
    inclusiveCourseFee - totalDiscount
  );
  const courseSplit = splitInclusive(inclusiveCourseFee);
  const finalSplit = splitInclusive(inclusiveAfterDiscount);
  // total payable uses displayInclusive
  const displaySplit = totalDiscount > 0 ? finalSplit : courseSplit;
  const displayInclusive =
    totalDiscount > 0 ? inclusiveAfterDiscount : inclusiveCourseFee;
  const savings = totalDiscount;

  return (
    <Box sx={{ maxWidth: 920, m: 5 }}>
      <StepHeader title="Choose course" steps="Step 3 of 5" />

      <Box
        sx={{
          mt: 1,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
        }}
      >
        <Box>
          {/* Tabs for course selection */}
          <Tabs
            value={selectedCourse}
            onChange={(_, v) => {
              setSelectedCourse(v as string);
              setActiveTab(String(v));
            }}
            aria-label="course-tabs"
            variant="fullWidth"
          >
            <Tab value="nata-jee" label="NATA / JEE" />
            <Tab value="software" label="Software" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {selectedCourse === "software" ? (
              <>
                <Typography style={labelStyle} sx={{ fontWeight: 600, mb: 1 }}>
                  Software Course
                </Typography>
                <TextField
                  select
                  size="small"
                  label="Software Course"
                  value={softwareCourse}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSoftwareCourse &&
                    setSoftwareCourse(e.target.value as string)
                  }
                  fullWidth
                  variant="outlined"
                  margin="dense"
                >
                  <MenuItem value="Revit">Revit</MenuItem>
                  <MenuItem value="CAD">CAD</MenuItem>
                  <MenuItem value="SketchUp">SketchUp</MenuItem>
                </TextField>

                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "#666" }}>
                    Total Fee
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      value={(SOFTWARE_FEE ?? 0) - (youtubeSubscribed ? 25 : 0)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                    />
                    <YoutubeSubscribe
                      discountAmount={25}
                      label="Subscribe on YouTube"
                      onSubscribed={onYoutubeSubscribed}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Typography style={labelStyle} sx={{ fontWeight: 600, mb: 1 }}>
                  NATA / JEE Fees
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Course fees : {formatINR(computedNataFee)} (Including GST)
                </Typography>

                {paymentType === "full" ? (
                  <Typography sx={{ mt: 1, color: "green" }}>
                    Congratulations — you save {formatINR(5000)} from actual
                    fees on selection of full payment.
                  </Typography>
                ) : (
                  <Typography sx={{ mt: 1, color: "#666" }}>
                    You have an option to get {formatINR(5000)} discount if full
                    payment made.
                  </Typography>
                )}

                {/* YouTube subscribe control for NATA / JEE */}
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "#666" }}>
                    Total Fee
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      value={
                        (inclusiveCourseFee ?? 0) -
                        (youtubeSubscribed ? YT_DISCOUNT_AMOUNT : 0)
                      }
                      InputProps={{ readOnly: true }}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                    />
                    <YoutubeSubscribe
                      discountAmount={YT_DISCOUNT_AMOUNT}
                      label="Subscribe on YouTube"
                      onSubscribed={onYoutubeSubscribed}
                    />
                  </Box>
                </Box>

                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <RadioGroup
                    row
                    name="paymentType"
                    value={paymentType}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({
                        ...form,
                        paymentType: e.target.value as "part" | "full",
                      })
                    }
                  >
                    <FormControlLabel
                      value="part"
                      control={<Radio />}
                      label="Part payment"
                    />
                    <FormControlLabel
                      value="full"
                      control={<Radio />}
                      label="Full payment"
                    />
                  </RadioGroup>
                </FormControl>

                {paymentType === "part" && (
                  <Box sx={{ mt: 2 }}>
                    <Typography style={labelStyle} sx={{ fontWeight: 600 }}>
                      First Payment
                    </Typography>
                    <TextField
                      size="small"
                      value={
                        selectedCourse === "nata-jee"
                          ? formatINR(16500)
                          : `₹${nataJeePart1 || 0}`
                      }
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      sx={{ background: "#f7f7f7" }}
                    />
                    {/* breakdown of first payment (assumed inclusive) */}
                    {selectedCourse === "nata-jee" &&
                      (() => {
                        const firstInclusive = 16500;
                        const firstSplit = splitInclusive(firstInclusive);
                        return (
                          <Box>
                            <Typography sx={{ mt: 1, color: "#666" }}>
                              Second Payment : on or before{" "}
                              {formatDate(
                                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                              )}
                            </Typography>
                            <Typography
                              sx={{ mt: 1, color: "#666", fontSize: 13 }}
                            >
                              (First payment includes GST:{" "}
                              {formatINR(firstSplit.excl)} + GST{" "}
                              {formatINR(firstSplit.gst)})
                            </Typography>
                          </Box>
                        );
                      })()}
                  </Box>
                )}

                <Box sx={{ mt: 2, color: "#666" }}>{nataJeeInfo}</Box>
                <Box sx={{ mt: 2, fontSize: 13, color: "#444" }}>
                  {((form as Record<string, unknown>)[
                    "paymentType"
                  ] as string) === "full" ? (
                    <div>
                      For full payment: we purchase a classroom license for 1
                      year. Any additional license months after one year will be
                      provided free if full payment was selected.
                    </div>
                  ) : (
                    <div>
                      For part payment: we purchase a license for 3 months and
                      access will be automatically terminated after 3 months
                      unless the second payment is made; once the second payment
                      is completed, a year-long license will be purchased. No
                      more hidden fees.
                    </div>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Box>
          {/* Order Summary Card */}
          <Card elevation={2}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Order Summary
              </Typography>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>Course Fee</Typography>
                  <Typography>{formatINR(displaySplit.excl)}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    Discount Applied
                  </Typography>
                  <Typography sx={{ color: "green", fontWeight: 700 }}>
                    -{formatINR(discount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    Tax (18% GST)
                  </Typography>
                  <Typography>{formatINR(displaySplit.gst)}</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Divider />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                    Total Payable
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
                    {formatINR(displayInclusive)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ color: "green", fontWeight: 700 }}>
                    You save {formatINR(savings)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button variant="outlined" onClick={() => setCurrentStep(3)}>
          Back to Education
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            // Save to database before proceeding to review
            if (saveToDatabase) {
              const result = await saveToDatabase({
                // Ensure payment-related fields are present in payload
                form: {
                  courseFee: inclusiveCourseFee,
                  discount: savings,
                  paymentType,
                  totalPayable: displayInclusive,
                },
                selectedCourse,
              });
              if (!result.ok) {
                console.error("Failed to save step data:", result.error);
                // Continue to review even if database save fails (data is in localStorage)
              }
            }
            setCurrentStep(5);
          }}
          sx={{ minWidth: 160 }}
        >
          Review Details
        </Button>
      </Box>
    </Box>
  );
}
