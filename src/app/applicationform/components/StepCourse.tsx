import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import YoutubeSubscribe from "./YoutubeSubscribe";

export default function StepCourse(props: any) {
  const {
    selectedCourse,
    setSelectedCourse,
    setActiveTab,
    softwareCourse,
    setSoftwareCourse,
    SOFTWARE_FEE,
    youtubeSubscribed,
    onYoutubeSubscribed,
    nataJeeFee,
    nataJeeDiscountedFee,
    nataJeePart1,
    nataJeeInfo,
    form,
    setForm,
    setCurrentStep,
    labelStyle,
  } = props;

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <label style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>
        Choose course
      </label>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Button
          variant={selectedCourse === "nata-jee" ? "contained" : "outlined"}
          fullWidth
          onClick={() => {
            setSelectedCourse("nata-jee");
            setActiveTab("nata-jee");
          }}
        >
          NATA / JEE
        </Button>
        <Button
          variant={selectedCourse === "software" ? "contained" : "outlined"}
          fullWidth
          onClick={() => {
            setSelectedCourse("software");
            setActiveTab("software");
          }}
        >
          Software
        </Button>
      </Box>

      {selectedCourse === "software" && (
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Software Course</label>
          <TextField
            select
            size="small"
            label="Software Course"
            value={softwareCourse}
            onChange={(e) => setSoftwareCourse(e.target.value)}
            fullWidth
            variant="outlined"
            margin="dense"
          >
            <MenuItem value="Revit">Revit</MenuItem>
            <MenuItem value="CAD">CAD</MenuItem>
            <MenuItem value="SketchUp">SketchUp</MenuItem>
          </TextField>
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>Total Fee</label>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                value={SOFTWARE_FEE - (youtubeSubscribed ? 25 : 0)}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                margin="dense"
              />
              <div>
                <YoutubeSubscribe
                  discountAmount={25}
                  label="Subscribe on YouTube"
                  onSubscribed={onYoutubeSubscribed}
                />
              </div>
            </Box>
          </div>
        </div>
      )}

      {selectedCourse === "nata-jee" && (
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>NATA / JEE Fees</label>
          <div style={{ marginTop: 8 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, color: "#666" }}>
                  Total Fee
                </Typography>
                <TextField
                  size="small"
                  value={`₹${nataJeeFee || 0}`}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, color: "#666" }}>
                  Discounted (if full)
                </Typography>
                <TextField
                  size="small"
                  value={`₹${nataJeeDiscountedFee || nataJeeFee || 0}`}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                />
              </Box>
            </Box>

            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <RadioGroup
                row
                name="paymentType"
                value={form.paymentType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({
                    ...form,
                    paymentType: e.target.value as "full" | "part",
                  })
                }
              >
                <FormControlLabel
                  value="full"
                  control={<Radio />}
                  label="Full"
                />
                <FormControlLabel
                  value="part"
                  control={<Radio />}
                  label="Part"
                />
              </RadioGroup>
            </FormControl>

            {form.paymentType === "part" && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={labelStyle}>First Payment</Typography>
                <TextField
                  size="small"
                  value={`₹${nataJeePart1 || 0}`}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  sx={{ background: "#f7f7f7" }}
                />
              </Box>
            )}

            <div style={{ marginTop: 8, color: "#666" }}>{nataJeeInfo}</div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#444" }}>
              {(() => {
                if (form.paymentType === "full") {
                  return (
                    <div>
                      For full payment: we purchase a classroom license for 1
                      year. Any additional license months after one year will be
                      provided free if full payment was selected.
                    </div>
                  );
                }
                return (
                  <div>
                    For part payment: we purchase a license for 3 months and
                    access will be automatically terminated after 3 months
                    unless the second payment is made; once the second payment
                    is completed, a year-long license will be purchased.
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
        <Button variant="outlined" onClick={() => setCurrentStep(3)}>
          Back to Education
        </Button>
      </Box>
    </div>
  );
}
