import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import YoutubeSubscribe from "./YoutubeSubscribe";

export default function StepEdu(props) {
  const {
    form,
    handleChange,
    educationType,
    setEducationType,
    isCompactSelector,
    showStdPopup,
    setShowStdPopup,
    schoolStd,
    setSchoolStd,
    standardOptions,
    cycleStandard,
    diplomaYearOptions,
    diplomaYear,
    setDiplomaYear,
    diplomaCourse,
    setDiplomaCourse,
    diplomaCollege,
    setDiplomaCollege,
    otherDescription,
    setOtherDescription,
    collegeName,
    setCollegeName,
    collegeYear,
    setCollegeYear,
    labelStyle,
    inputStyle,
    onYoutubeSubscribed,
    youtubeSubscribed,
    setCurrentStep,
    validateStep2,
    saveDraft,
    cycleDiplomaYear,
  } = props;

  // show a small button to switch to college when user tries to increment past last school standard
  const [showCollegeSwitch, setShowCollegeSwitch] = React.useState(false);

  React.useEffect(() => {
    const last =
      standardOptions && standardOptions.length
        ? standardOptions[standardOptions.length - 1]
        : null;
    if (showCollegeSwitch && schoolStd !== last) setShowCollegeSwitch(false);
  }, [schoolStd, standardOptions, showCollegeSwitch]);

  // Prepare a navigation-safe list of standards: remove any aggregated "Below 10th" entry
  const cleanedStandardOptions = React.useMemo(() => {
    if (!Array.isArray(standardOptions)) return standardOptions || [];
    const filtered = standardOptions.filter(
      (s) => !/below\s*10th/i.test(String(s))
    );
    return filtered.length ? filtered : standardOptions;
  }, [standardOptions]);

  // Determine index and whether previous arrow should be disabled.
  const currentStdIndex = React.useMemo(() => {
    return cleanedStandardOptions.indexOf(schoolStd);
  }, [cleanedStandardOptions, schoolStd]);

  // Disable previous arrow when at the first option or when the standard is lower than 8th
  const isPrevDisabled = React.useMemo(() => {
    if (currentStdIndex <= 0) return true;
    // try to parse numeric standard (e.g., "7th" -> 7)
    const m = String(schoolStd || "").match(/(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n < 8) return true; // disable for below 8th
    }
    return false;
  }, [currentStdIndex, schoolStd]);

  // Diploma year index & prev-disable helper
  const currentDiplomaYearIndex = React.useMemo(() => {
    if (!Array.isArray(diplomaYearOptions)) return -1;
    return diplomaYearOptions.indexOf(diplomaYear);
  }, [diplomaYearOptions, diplomaYear]);

  const isDiplomaPrevDisabled = React.useMemo(() => {
    return currentDiplomaYearIndex <= 0;
  }, [currentDiplomaYearIndex]);

  // College year options (1st - 5th) and helpers
  const collegeYearOptions = React.useMemo(
    () => ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
    []
  );

  const currentCollegeYearIndex = React.useMemo(() => {
    return collegeYearOptions.indexOf(collegeYear);
  }, [collegeYearOptions, collegeYear]);

  const isCollegePrevDisabled = React.useMemo(() => {
    return currentCollegeYearIndex <= 0;
  }, [currentCollegeYearIndex]);

  const cycleCollegeYearLocal = (dir) => {
    const idx = collegeYearOptions.indexOf(collegeYear);
    const next =
      (idx + dir + collegeYearOptions.length) % collegeYearOptions.length;
    setCollegeYear(collegeYearOptions[next]);
  };

  // Ensure a sensible default is present when this component mounts
  React.useEffect(() => {
    if (
      !collegeYear &&
      Array.isArray(collegeYearOptions) &&
      collegeYearOptions.length
    ) {
      setCollegeYear(collegeYearOptions[0]);
    }
  }, [collegeYear, collegeYearOptions, setCollegeYear]);

  const handleNextStd = () => {
    const last =
      standardOptions && standardOptions.length
        ? standardOptions[standardOptions.length - 1]
        : null;
    if (schoolStd === last) {
      // show a button inside the field that lets the user switch to college
      setShowCollegeSwitch(true);
    } else {
      cycleStandard(1);
    }
  };

  return (
    <Box sx={{ mt: 1.5, mb: 1.5 }}>
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ fontWeight: 600 }}>Education</Typography>
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

        {educationType === "school" ? (
          <Box sx={{ mt: 1 }}>
            {/* Row 1: Standard + 12th completion Year side by side (responsive) */}
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
                  value={schoolStd}
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
                            if (showCollegeSwitch) {
                              setShowCollegeSwitch(false);
                              return;
                            }
                            if (isPrevDisabled) return;
                            cycleStandard(-1);
                          }}
                          aria-label="Previous standard"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                          disabled={isPrevDisabled}
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
                        {showCollegeSwitch ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setEducationType("college");
                              setShowCollegeSwitch(false);
                            }}
                            sx={{ textTransform: "none", ml: 0 }}
                          >
                            Switch to College
                          </Button>
                        ) : (
                          <IconButton
                            type="button"
                            onClick={handleNextStd}
                            aria-label="Next standard"
                            sx={{ p: "6px" }}
                          >
                            <ArrowForwardIosIcon fontSize="small" />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
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
                <Typography
                  component="label"
                  sx={labelStyle}
                  htmlFor="boardYear"
                >
                  12th completion Year
                </Typography>
                <TextField
                  size="small"
                  id="boardYear"
                  name="boardYear"
                  type="number"
                  value={form.boardYear}
                  onChange={handleChange}
                  variant="outlined"
                  margin="dense"
                  sx={{ width: "100%" }}
                  inputProps={{
                    min: new Date().getFullYear() - 10,
                    max: new Date().getFullYear() + 1,
                  }}
                />
              </Box>
            </Box>

            {/* Row 2: Board select full width */}
            <Box sx={{ mt: 1 }}>
              <TextField
                select
                size="small"
                id="board"
                name="board"
                label="Board"
                value={form.board}
                onChange={handleChange}
                variant="outlined"
                margin="dense"
                fullWidth
              >
                {["Matric", "CBSE", "ICSE", "State Board", "Other"].map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        ) : educationType === "college" ? (
          <Box sx={{ mt: 1 }}>
            <Typography component="label" sx={labelStyle}>
              College Name / Year
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                mt: 0.5,
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
                <TextField
                  size="small"
                  label="College name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  placeholder="College name"
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  maxWidth: "11rem",
                }}
              >
                <TextField
                  size="small"
                  value={collegeYear}
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
                            if (isCollegePrevDisabled) return;
                            cycleCollegeYearLocal(-1);
                          }}
                          aria-label="Previous college year"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                          disabled={isCollegePrevDisabled}
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
                          onClick={() => cycleCollegeYearLocal(1)}
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
          </Box>
        ) : educationType === "diploma" ? (
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
                  value={diplomaCourse}
                  onChange={(e) => setDiplomaCourse(e.target.value)}
                  placeholder="Course (eg. Civil, ECE)"
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
                            if (isDiplomaPrevDisabled) return;
                            cycleDiplomaYear(-1);
                          }}
                          aria-label="Previous diploma year"
                          sx={{ p: 0, minWidth: 32, height: 32 }}
                          disabled={isDiplomaPrevDisabled}
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
                          onClick={() => cycleDiplomaYear(1)}
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
                onChange={(e) => setDiplomaCollege(e.target.value)}
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="College name"
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography component="label" sx={labelStyle}>
              Tell us about yourself
            </Typography>
            <TextField
              size="small"
              label="Tell us about yourself"
              value={otherDescription}
              onChange={(e) => setOtherDescription(e.target.value)}
              fullWidth
              variant="outlined"
              margin="dense"
              multiline
              rows={4}
              placeholder="Describe your background, current work or study"
            />
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
