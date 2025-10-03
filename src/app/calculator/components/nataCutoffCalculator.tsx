"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { saveNataCalculatorSession } from "../../../lib/saveNataCalculatorSession";
import type {
  NataCalculatorResult,
  NataCalculatorSession,
} from "../../../types/db";
import getNataCalculatorSessions from "../../../lib/getNataCalculatorSessions";
import { getAuth, onAuthStateChanged } from "firebase/auth";

type Errors = {
  markScored: boolean;
  maxMark: boolean;
  nataScore: [boolean, boolean, boolean];
};

const Display = styled(Box, {
  shouldForwardProp: (prop) => prop !== "clicked" && prop !== "started",
})<{ clicked?: boolean; started?: boolean }>(({ theme, clicked, started }) => ({
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(4),
  minHeight: theme.spacing(10),
  backgroundColor: clicked ? "rgb(236, 251, 167)" : "#93987c",
  transition: "background-color 0.3s ease",
  borderRadius: "12px",
  border: started
    ? `3px solid ${theme.palette.error.main}`
    : `1px solid ${theme.palette.divider}`,
  boxShadow: "-4px -4px 4px -4px rgba(0,0,0,0.5) inset",
  color: theme.palette.getContrastText(clicked ? "#ecfba7" : "#93987c"),
  cursor: "pointer",
}));

export default function NataCutoffCalculator() {
  const [clicked, setClicked] = React.useState(false);
  const [buttonClicked, setButtonClicked] = React.useState(false);

  const [formData, setFormData] = React.useState({
    markScored: "",
    maxMark: "",
    scores: ["", "", ""] as [string, string, string],
  });

  const [errors, setErrors] = React.useState<Errors>({
    markScored: false,
    maxMark: false,
    nataScore: [false, false, false],
  });

  const [history, setHistory] = React.useState<NataCalculatorSession[] | null>(
    null
  );
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [historyPage, setHistoryPage] = React.useState(1);
  const historyPerPage = 10;

  React.useEffect(() => {
    let mounted = true;
    const auth = getAuth();

    const load = async () => {
      try {
        const map = await getNataCalculatorSessions();
        if (!mounted) return;
        const list = Object.values(map).sort((a, b) =>
          String(b.createdAt).localeCompare(String(a.createdAt))
        ) as NataCalculatorSession[];
        setHistory(list);
      } catch {
        // Not authenticated or no sessions
        if (mounted) setHistory([]);
      }
    };

    // If already signed in, load immediately
    if (auth.currentUser) load();

    // Also react to auth state changes (e.g., after login redirect)
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!mounted) return;
      if (u) load();
      else setHistory([]);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const parseNum = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const calculatePercentage = () => {
    const mark = parseNum(formData.markScored);
    const max = parseNum(formData.maxMark);
    if (!Number.isFinite(mark) || !Number.isFinite(max) || max <= 0) return NaN;
    return (mark / max) * 100;
  };

  const calculateGreatestScore = () => {
    const values = formData.scores.map((s) => parseNum(s));
    const valid = values.filter((n) => Number.isFinite(n));
    if (valid.length === 0) return NaN;
    return Math.max(...valid);
  };

  const percentage = calculatePercentage();
  const greatestScore = calculateGreatestScore();
  const hasAnyInput =
    formData.markScored !== "" ||
    formData.maxMark !== "" ||
    formData.scores.some((s) => s !== "");
  const boardOutOf200 = Number.isFinite(percentage)
    ? (percentage * 2).toFixed(2)
    : undefined;
  const nataFinalCutoff =
    Number.isFinite(greatestScore) && Number.isFinite(percentage)
      ? (percentage * 2 + (greatestScore as number)).toFixed(2)
      : undefined;

  const isBoardEligible = Number.isFinite(percentage) && percentage >= 50;
  const isNataEligible = Number.isFinite(greatestScore) && greatestScore >= 70;
  const isEligible = isBoardEligible && isNataEligible;

  const handleCalCInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setButtonClicked(false);
  };

  const handleNataInputChange = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.scores] as [string, string, string];
      next[index] = value;
      return { ...prev, scores: next };
    });
    setButtonClicked(false);
  };

  const validate = (): boolean => {
    const mark = parseNum(formData.markScored);
    const max = parseNum(formData.maxMark);
    const e: Errors = {
      markScored: false,
      maxMark: false,
      nataScore: [false, false, false],
    };

    if (
      !Number.isFinite(mark) ||
      mark < 0 ||
      (Number.isFinite(max) && mark > max)
    ) {
      e.markScored = true;
    }
    if (!Number.isFinite(max) || max <= 0) {
      e.maxMark = true;
    }
    const scoreErrs: [boolean, boolean, boolean] = [false, false, false];
    formData.scores.forEach((s, i) => {
      const n = parseNum(s);
      if (!Number.isFinite(n) || n < 0 || n > 200) scoreErrs[i] = true;
    });
    e.nataScore = scoreErrs;

    setErrors(e);
    const ok = !e.markScored && !e.maxMark && e.nataScore.every((v) => !v);
    return ok;
  };

  const handleSubmit = async () => {
    // Even if some scores are empty, allow calculation with the max of provided ones.
    // We only block when board inputs invalid or any provided score invalid/out of range.
    const ok = validate();
    if (!ok) return;
    setButtonClicked(true);

    // Prepare session payload and try to persist if user is authenticated
    try {
      const mark = parseNum(formData.markScored);
      const max = parseNum(formData.maxMark);
      const scoresNums: [number | null, number | null, number | null] = [
        formData.scores[0] === "" ? null : parseNum(formData.scores[0]),
        formData.scores[1] === "" ? null : parseNum(formData.scores[1]),
        formData.scores[2] === "" ? null : parseNum(formData.scores[2]),
      ];
      if (!Number.isFinite(mark) || !Number.isFinite(max)) return;
      const perc = (mark / max) * 100;
      const best = Number.isFinite(greatestScore)
        ? (greatestScore as number)
        : NaN;
      if (!Number.isFinite(perc) || !Number.isFinite(best)) return;
      const result: NataCalculatorResult = {
        academicPercentage: Number(perc.toFixed(2)),
        boardOutOf200: Number((perc * 2).toFixed(2)),
        bestNataScore: Number(best.toFixed(2)),
        finalCutoff: Number((perc * 2 + best).toFixed(2)),
        eligibleBoard: perc >= 50,
        eligibleNata: best >= 70,
        eligibleOverall: perc >= 50 && best >= 70,
      };
      const now = new Date();
      const id = now.toISOString();
      const session: NataCalculatorSession = {
        id,
        createdAt: id,
        source: "/nata-cutoff-calculator",
        input: {
          markScored: Number(mark),
          maxMark: Number(max),
          scores: scoresNums,
        },
        result,
      };
      // Fire-and-forget; show no UI error if unauthorized
      saveNataCalculatorSession(session).catch(() => {});
    } catch {
      // ignore persistence errors; calculation UI remains local
    }
  };

  const resetBoard = () => {
    setFormData((prev) => ({ ...prev, markScored: "", maxMark: "" }));
    setErrors((e) => ({ ...e, markScored: false, maxMark: false }));
    setButtonClicked(false);
  };

  const resetNata = () => {
    setFormData((prev) => ({ ...prev, scores: ["", "", ""] }));
    setErrors((e) => ({ ...e, nataScore: [false, false, false] }));
    setButtonClicked(false);
  };

  const resetAll = () => {
    setFormData({ markScored: "", maxMark: "", scores: ["", "", ""] });
    setErrors({
      markScored: false,
      maxMark: false,
      nataScore: [false, false, false],
    });
    setButtonClicked(false);
    setClicked(false);
  };

  const loadFromHistory = (s: NataCalculatorSession) => {
    const i = s.input;
    setFormData({
      markScored: String(i.markScored ?? ""),
      maxMark: String(i.maxMark ?? ""),
      scores: [
        i.scores[0] == null ? "" : String(i.scores[0]),
        i.scores[1] == null ? "" : String(i.scores[1]),
        i.scores[2] == null ? "" : String(i.scores[2]),
      ],
    });
    setErrors({
      markScored: false,
      maxMark: false,
      nataScore: [false, false, false],
    });
    setButtonClicked(false);
    setClicked(true);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        position: "relative",
        width: { xs: "100%", md: "25rem" },
        maxWidth: { xs: "100%", md: "25rem" },
      }}
      onClick={() => setClicked(true)}
    >
      {/* DISPLAY */}
      <Display
        clicked={clicked}
        started={hasAnyInput || buttonClicked}
        onClick={() => setClicked((v) => !v)}
      >
        {!hasAnyInput && !buttonClicked ? (
          <Box sx={{ px: 1 }}>
            <Typography variant="body2">
              Enter your Board marks and NATA scores below to calculate your
              NATA cutoff.
            </Typography>
          </Box>
        ) : (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={2}
            >
              <Stack>
                <Typography id="cutoff_1">
                  Board ={" "}
                  {boardOutOf200 === undefined ? (
                    <Box component="span" sx={{ color: "error.main" }}>
                      Invalid score
                    </Box>
                  ) : (
                    boardOutOf200
                  )}{" "}
                  /200
                </Typography>
                <Typography id="cutoff_2">
                  NATA ={" "}
                  {Number.isFinite(greatestScore) ? (
                    greatestScore
                  ) : (
                    <Box component="span" sx={{ color: "error.main" }}>
                      Invalid score
                    </Box>
                  )}{" "}
                  /200
                </Typography>
              </Stack>

              {buttonClicked &&
                Number.isFinite(percentage) &&
                Number.isFinite(greatestScore) && (
                  <Box>
                    <Typography fontWeight={700}>
                      <Box
                        component="span"
                        sx={{
                          color: isEligible ? "success.main" : "error.main",
                        }}
                      >
                        {isEligible ? "Eligible" : "Not Eligible"}
                      </Box>
                    </Typography>
                  </Box>
                )}
            </Stack>

            {buttonClicked && nataFinalCutoff !== undefined && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="flex-end"
                alignItems={{ xs: "flex-start", sm: "flex-end" }}
                mt={1}
                sx={{ overflow: "hidden" }}
              >
                <Typography>B.Arch Cutoff =</Typography>
                <Typography variant="h5" sx={{ lineHeight: 1, mx: 1 }}>
                  <b>{nataFinalCutoff}</b>
                </Typography>
                <Typography>/ 400</Typography>
              </Stack>
            )}
          </>
        )}
      </Display>

      {/* PERSONNEL DETAILS REMOVED: Name and City fields no longer shown */}

      {/* BOARD MARK SECTION */}
      <Box mt={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Board/Diploma mark
          </Typography>
          {(formData.markScored !== "" || formData.maxMark !== "") && (
            <IconButton
              aria-label="Reset board/diploma inputs"
              size="small"
              onClick={resetBoard}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} mt={1}>
          <TextField
            fullWidth
            id="outlined-mark-scored"
            label={errors.markScored ? "Invalid Score" : "Mark Scored"}
            variant="outlined"
            type="number"
            size="small"
            name="markScored"
            value={formData.markScored}
            onChange={handleCalCInputChange}
            error={errors.markScored}
            helperText={
              errors.markScored ? "Enter a valid number ≤ Maximum Mark" : ""
            }
            inputProps={{ min: 0, step: "any" }}
          />
          <TextField
            fullWidth
            id="outlined-max-mark"
            label={errors.maxMark ? "Invalid Score" : "Maximum Mark"}
            variant="outlined"
            type="number"
            size="small"
            name="maxMark"
            value={formData.maxMark}
            onChange={handleCalCInputChange}
            error={errors.maxMark}
            helperText={errors.maxMark ? "Enter a valid maximum (> 0)" : ""}
            inputProps={{ min: 1, step: "any" }}
          />
        </Stack>

        {Number.isFinite(percentage) && percentage > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2,
              py: 1,
              mt: 1,
              bgcolor: (t) => t.palette.action.hover,
              borderRadius: 1,
              fontSize: 12,
            }}
          >
            <Box
              sx={{ color: isBoardEligible ? "success.main" : "error.main" }}
            >
              {`Academic Percentage = ${percentage.toFixed(2)}%`}
            </Box>
            <Typography
              fontWeight={700}
              sx={{ color: isBoardEligible ? "success.main" : "error.main" }}
            >
              {percentage >= 50 ? "Eligible" : "Not Eligible"}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* NATA SCORE SECTION */}
      <Box mt={4}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={700}>
            NATA Scores
          </Typography>
          {formData.scores.some((s) => s !== "") && (
            <IconButton
              aria-label="Reset NATA scores"
              size="small"
              onClick={resetNata}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} mt={1}>
          {[0, 1, 2].map((i) => (
            <TextField
              key={i}
              id={`outlined-basic-score${i + 1}`}
              label={errors.nataScore[i] ? "Invalid Score" : `Score ${i + 1}`}
              variant="outlined"
              type="number"
              size="small"
              value={formData.scores[i]}
              onChange={(e) => handleNataInputChange(i, e.target.value)}
              error={errors.nataScore[i]}
              helperText={errors.nataScore[i] ? "Enter 0 to 200" : ""}
              inputProps={{ min: 0, max: 200, step: "any" }}
              fullWidth
            />
          ))}
        </Stack>

        {Number.isFinite(greatestScore) && greatestScore > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            sx={{
              px: 2,
              py: 1,
              mt: 1,
              bgcolor: (t) => t.palette.action.hover,
              borderRadius: 1,
              fontSize: 12,
            }}
          >
            <Box sx={{ color: isNataEligible ? "success.main" : "error.main" }}>
              {`Final NATA Score = ${greatestScore}`}
            </Box>
            <Typography
              fontWeight={700}
              sx={{ color: isNataEligible ? "success.main" : "error.main" }}
            >
              {isNataEligible ? "Eligible" : "Not Eligible"}
            </Typography>
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* CALCULATE BUTTON */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          className="mt-5"
          variant="contained"
          color="primary"
          fullWidth
          id="calculate_cutoff"
          onClick={handleSubmit}
          sx={{ py: 1.25, fontWeight: 700 }}
        >
          Calculate NATA Cutoff
        </Button>
        <IconButton
          aria-label="Reset all"
          onClick={resetAll}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <RestartAltIcon />
        </IconButton>
      </Stack>

      {/* HISTORY */}
      {Array.isArray(history) && history.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Recent calculations
          </Typography>
          <Stack spacing={1}>
            {history.slice(0, 5).map((s) => (
              <Card
                key={s.id}
                variant="outlined"
                sx={{ p: 1.5, cursor: "pointer" }}
                onClick={() => loadFromHistory(s)}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2">
                      {new Date(s.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {`Board: ${s.result.boardOutOf200}  |  NATA: ${s.result.bestNataScore}  |  Cutoff: ${s.result.finalCutoff}`}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: s.result.eligibleOverall
                        ? "success.main"
                        : "error.main",
                    }}
                  >
                    {s.result.eligibleOverall ? "Eligible" : "Not eligible"}
                  </Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
          {history.length > 5 && (
            <Box mt={1}>
              <Button size="small" onClick={() => setHistoryDialogOpen(true)}>
                Show all
              </Button>
            </Box>
          )}

          {/* History Dialog with pagination */}
          <Dialog
            open={historyDialogOpen}
            onClose={() => setHistoryDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>NATA Calculator History</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1}>
                {(history || [])
                  .slice(
                    (historyPage - 1) * historyPerPage,
                    historyPage * historyPerPage
                  )
                  .map((s) => (
                    <Card
                      key={s.id}
                      variant="outlined"
                      sx={{ p: 1.5, cursor: "pointer" }}
                      onClick={() => {
                        loadFromHistory(s);
                        setHistoryDialogOpen(false);
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="body2">
                            {new Date(s.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {`Board: ${s.result.boardOutOf200}  |  NATA: ${s.result.bestNataScore}  |  Cutoff: ${s.result.finalCutoff}`}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: s.result.eligibleOverall
                              ? "success.main"
                              : "error.main",
                          }}
                        >
                          {s.result.eligibleOverall
                            ? "Eligible"
                            : "Not eligible"}
                        </Typography>
                      </Stack>
                    </Card>
                  ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
              <Pagination
                page={historyPage}
                count={Math.max(
                  1,
                  Math.ceil((history?.length || 0) / historyPerPage)
                )}
                onChange={(_, p) => setHistoryPage(p)}
                size="small"
              />
              <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Card>
  );
}
