"use client";
import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StepHeader from "../ui/TitleWsteps";

export default function StepEdu(props) {
  const {
    form = {},
    handleChange = () => {},
    handleSelectChange = () => {},
    educationType = "school",
    setEducationType = () => {},
    schoolStd = "12th",
    setSchoolStd = () => {},
    standardOptions = ["Below 10th", "10th", "11th", "12th"],
    collegeName,
    setCollegeName,
    collegeYear,
    setCollegeYear,
    diplomaCourse,
    setDiplomaCourse,
    diplomaYear,
    setDiplomaYear,
    diplomaCollege,
    setDiplomaCollege,
    otherDescription,
    setOtherDescription,
    cycleDiplomaYear = () => {},
    setCurrentStep = () => {},
    validateStep2 = () => true,
    saveDraft = () => {},
  } = props;

  const labelStyle = { fontSize: 12 };

  function getAcademicStartYear(d = new Date()) {
    const y = d.getFullYear();
    const month = d.getMonth(); // 0-11
    const date = d.getDate();
    // if date is on/after June 25 -> use current year, else previous year
    if (month > 5 || (month === 5 && date >= 25)) return y;
    return y - 1;
  }

  function formatAcademicYear(start) {
    const s = Number(start) || getAcademicStartYear();
    const end = (s + 1) % 100;
    return `${s}-${String(end).padStart(2, "0")}`;
  }

  const AcademicYearControl = ({ name }) => {
    const defaultStart = getAcademicStartYear();
    const minYear = getAcademicStartYear(
      new Date(new Date().getFullYear() - 10, 6, 1)
    );
    const maxYear = getAcademicStartYear(
      new Date(new Date().getFullYear() + 5, 6, 1)
    );
    const currStart = Number(form[name] ?? defaultStart);
    const canPrev = currStart > minYear;
    const canNext = currStart < maxYear;
    const changeYear = (nextStart) => {
      try {
        handleChange({ target: { name, value: String(nextStart) } });
      } catch {}
    };

    return (
      <TextField
        size="small"
        id={name}
        name={name}
        value={formatAcademicYear(currStart)}
        variant="outlined"
        margin="dense"
        sx={{ width: "100%" }}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{
                mr: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
              }}
            >
              <IconButton
                type="button"
                onClick={() => canPrev && changeYear(currStart - 1)}
                aria-label="Previous year"
                sx={{ p: 0, minWidth: 32, height: 32 }}
                disabled={!canPrev}
              >
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{ ml: 0, display: "flex", alignItems: "center" }}
            >
              <IconButton
                type="button"
                onClick={() => canNext && changeYear(currStart + 1)}
                aria-label="Next year"
                sx={{ p: "6px" }}
                disabled={!canNext}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  };

  const collegeYearOptions = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
  ];
  React.useEffect(() => {
    if (!collegeYear && collegeYearOptions.length && setCollegeYear)
      setCollegeYear(collegeYearOptions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ maxWidth: 520, m: 5 }}>
      <Box sx={{ mt: 1.5 }}>
        <StepHeader title="Education" steps="Step 2 of 5" />
        <FormControl component="fieldset" sx={{ mt: 1 }}>
          <RadioGroup
            row
            value={educationType}
            onChange={(e) => setEducationType(e.target.value)}
          >
            <FormControlLabel
              value="school"
              control={<Radio />}
              label="School"
            />
            <FormControlLabel
              value="diploma"
              control={<Radio />}
              label="Diploma"
            />
            <FormControlLabel
              value="college"
              control={<Radio />}
              label="College"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {educationType === "school" && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                gap: 1,
                alignItems: "flex-start",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Standard
                </Typography>
                <TextField
                  size="small"
                  select
                  value={schoolStd}
                  onChange={(e) => setSchoolStd(e.target.value)}
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                >
                  {standardOptions &&
                    standardOptions.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Board
                </Typography>
                <TextField
                  size="small"
                  select
                  value={form.board || ""}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "board", value: e.target.value },
                    })
                  }
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                >
                  <MenuItem value="CBSE">CBSE</MenuItem>
                  <MenuItem value="State Board">State Board</MenuItem>
                  <MenuItem value="ICSE">ICSE</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  12th completion year
                </Typography>
                <AcademicYearControl name="boardYear" />
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="School / College name"
                value={form.schoolName || ""}
                onChange={(e) =>
                  handleChange({
                    target: { name: "schoolName", value: e.target.value },
                  })
                }
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="School name"
              />
            </Box>

            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="label" sx={labelStyle}>
                  NATA/JEE attempt plan year
                </Typography>
                <AcademicYearControl name="nataAttemptYear" />
              </Box>
            </Box>
          </Box>
        )}

        {educationType === "diploma" && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Diploma Course
                </Typography>
                <TextField
                  size="small"
                  value={diplomaCourse ?? ""}
                  onChange={(e) =>
                    setDiplomaCourse && setDiplomaCourse(e.target.value)
                  }
                  placeholder="Course (eg. B.arch, Civil)"
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Year of Study
                </Typography>
                <TextField
                  size="small"
                  value={diplomaYear}
                  variant="outlined"
                  margin="dense"
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: "100%" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          mr: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                        }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              cycleDiplomaYear(-1);
                            } catch {}
                          }}
                          aria-label="Previous diploma year"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                        >
                          <ArrowBackIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ ml: 0, display: "flex", alignItems: "center" }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              cycleDiplomaYear(1);
                            } catch {}
                          }}
                          aria-label="Next diploma year"
                          sx={{ p: "6px" }}
                        >
                          <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="College name"
                value={diplomaCollege}
                onChange={(e) =>
                  setDiplomaCollege && setDiplomaCollege(e.target.value)
                }
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="College name"
              />
            </Box>

            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="label" sx={labelStyle}>
                  NATA/JEE attempt plan year
                </Typography>
                <AcademicYearControl name="nataAttemptYear" />
              </Box>
            </Box>
          </Box>
        )}

        {educationType === "college" && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  College name
                </Typography>
                <TextField
                  size="small"
                  value={collegeName || ""}
                  onChange={(e) =>
                    setCollegeName && setCollegeName(e.target.value)
                  }
                  margin="dense"
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography component="label" sx={labelStyle}>
                  Current Year
                </Typography>
                <TextField
                  size="small"
                  value={collegeYear || ""}
                  variant="outlined"
                  margin="dense"
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: "100%" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          mr: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                        }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              const idx = collegeYearOptions.indexOf(
                                collegeYear || ""
                              );
                              const next =
                                (idx - 1 + collegeYearOptions.length) %
                                collegeYearOptions.length;
                              setCollegeYear &&
                                setCollegeYear(collegeYearOptions[next]);
                            } catch {}
                          }}
                          aria-label="Previous college year"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                        >
                          <ArrowBackIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ ml: 0, display: "flex", alignItems: "center" }}
                      >
                        <IconButton
                          type="button"
                          onClick={() => {
                            try {
                              const idx = collegeYearOptions.indexOf(
                                collegeYear || ""
                              );
                              const next =
                                (idx + 1) % collegeYearOptions.length;
                              setCollegeYear &&
                                setCollegeYear(collegeYearOptions[next]);
                            } catch {}
                          }}
                          aria-label="Next college year"
                          sx={{ p: "6px" }}
                        >
                          <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="label" sx={labelStyle}>
                  NATA/JEE attempt plan year
                </Typography>
                <AcademicYearControl name="nataAttemptYear" />
              </Box>
            </Box>
          </Box>
        )}

        {educationType === "other" && (
          <Box sx={{ mt: 1 }}>
            <Typography component="label" sx={labelStyle}>
              Tell us about yourself
            </Typography>
            <TextField
              size="small"
              label="Tell us about yourself"
              value={otherDescription || ""}
              onChange={(e) =>
                setOtherDescription && setOtherDescription(e.target.value)
              }
              fullWidth
              variant="outlined"
              margin="dense"
              multiline
              rows={4}
              placeholder="Describe your background, current work or study"
            />

            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="label" sx={labelStyle}>
                  NATA/JEE attempt plan year
                </Typography>
                <AcademicYearControl name="nataAttemptYear" />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 1.5, justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => setCurrentStep(2)}
          sx={{ minWidth: 160 }}
        >
          Back to Basic
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (!validateStep2()) return;
            saveDraft();
            setCurrentStep(4);
          }}
          sx={{ minWidth: 160 }}
        >
          Save & Next
        </Button>
      </Box>
    </Box>
  );
}
