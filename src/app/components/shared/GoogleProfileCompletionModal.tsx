import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import PhoneAuth from "./PhoneAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  // studentName is optional (email-user flow may provide it). password is
  // optional too so the modal can be reused for email-verified users.
  // onComplete should return a boolean indicating whether the server-side
  // save succeeded. The modal will await this and only proceed to the
  // welcome/close state when true.
  onComplete: (data: {
    studentName?: string;
    username: string;
    password?: string;
    phone: string;
  }) => Promise<boolean>;
  initialPhone?: string;
  // If true, the modal becomes modal and cannot be dismissed until the
  // flow completes (student name + phone verification). Use for email-only
  // sign-ins where profile completion must be enforced.
  forceComplete?: boolean;
  // If true, hide password creation fields (useful when the user signed up
  // via email/password and already has a password).
  hidePasswordFields?: boolean;
  // If true, the user's phone is already verified (via Firebase) and the
  // modal should skip the phone verification step.
  phoneVerified?: boolean;
}

const GoogleProfileCompletionModal: React.FC<Props> = ({
  open,
  onClose,
  onComplete,
  initialPhone,
  forceComplete,
  hidePasswordFields,
  phoneVerified,
}) => {
  const [step, setStep] = useState<"profile" | "phone" | "welcome">("profile");
  const [username, setUsername] = useState("");
  const [studentName, setStudentName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(initialPhone || "");
  // removed unused phoneVerified

  // Username uniqueness check (POST, matches API)
  const checkUsername = async (val: string) => {
    setUsernameStatus("checking");
    setUsernameError(null);
    try {
      const res = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: val }),
      });
      const data = await res.json();
      if (res.ok && data.available) {
        setUsernameStatus("available");
      } else if (data && data.error) {
        setUsernameStatus("taken");
        setUsernameError(data.error || "Username is already taken");
      } else {
        setUsernameStatus("taken");
        setUsernameError("Username is already taken");
      }
    } catch {
      setUsernameStatus("idle");
      setUsernameError("Could not check username");
    }
  };

  const handleUsernameBlur = () => {
    // keep existing blur behavior as a fallback; prefer explicit check button
    if (username.length > 2) checkUsername(username);
  };

  const canSubmitProfile =
    usernameStatus === "available" &&
    // require a student name
    studentName.trim().length > 0 &&
    // If password fields are hidden, don't require password checks
    (hidePasswordFields ||
      password.length === 0 ||
      (password.length >= 6 &&
        retypePassword.length >= 6 &&
        password === retypePassword));

  const handleProfileSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setPasswordError(null);
    if (!hidePasswordFields && password !== retypePassword) {
      setPasswordError("Passwords do not match");
      setSubmitting(false);
      return;
    }
    // If phone is already verified we should submit the profile to the
    // backend immediately. Await onComplete (which returns boolean success)
    // and only proceed to welcome on success. Otherwise, move to phone step.
    // If initialPhone exists (from ProfileGuard) we consider phone step skipped
    // because the phone is already present; phoneVerified indicates the
    // Firebase verification but initialPhone may also mean we don't need the
    // separate phone step.
    const skipPhoneStep = Boolean(
      phoneVerified || (initialPhone && initialPhone.length > 0)
    );
    if (skipPhoneStep) {
      try {
        const ok = await onComplete({
          studentName,
          username,
          ...(hidePasswordFields ? {} : { password }),
          phone: phone || initialPhone || "",
        });
        if (ok) {
          setStep("welcome");
        } else {
          setError("Failed to save profile. Please try again.");
        }
      } catch (e) {
        setError(String(e ?? "Failed to save profile"));
      }
      setSubmitting(false);
      return;
    }
    setStep("phone");
    setSubmitting(false);
  };

  const handlePhoneVerified = async (verifiedPhone: string) => {
    setPhone(verifiedPhone);
    setSubmitting(true);
    try {
      const ok = await onComplete({
        studentName,
        username,
        ...(hidePasswordFields ? {} : { password }),
        phone: verifiedPhone,
      });
      if (ok) {
        setStep("welcome");
      } else {
        setError(
          "Failed to save profile after phone verification. Please try again."
        );
      }
    } catch (e) {
      setError(String(e ?? "Failed to save profile"));
    }
    setSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onClose={
        // allow close only when not forceComplete OR when at welcome step
        !forceComplete || step === "welcome" ? onClose : undefined
      }
      disableEscapeKeyDown={forceComplete ? step !== "welcome" : false}
      // disable backdrop click when forceComplete is true by ensuring
      // onClose is not provided in that case (handled above)
    >
      {step === "profile" && (
        <>
          <DialogTitle>Set Username & Password</DialogTitle>
          <DialogContent sx={{ minWidth: 350 }}>
            <TextField
              label="Student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              fullWidth
              margin="normal"
              helperText="Your full name as you'd like it displayed"
            />
            <TextField
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameStatus("idle");
                setUsernameError(null);
              }}
              onBlur={handleUsernameBlur}
              fullWidth
              margin="normal"
              helperText={
                usernameStatus === "available" ? (
                  <span style={{ color: "green" }}>Username is available</span>
                ) : usernameStatus === "taken" ? (
                  <span style={{ color: "red" }}>
                    {usernameError || "Username is already taken"}
                  </span>
                ) : (
                  usernameError || "Choose a unique username"
                )
              }
              error={usernameStatus === "taken"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {usernameStatus === "checking" ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Button
                        size="small"
                        onClick={() => checkUsername(username)}
                        disabled={username.length < 3}
                      >
                        Check
                      </Button>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            {!hidePasswordFields && (
              <>
                <TextField
                  label="Create Password (optional)"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  fullWidth
                  margin="normal"
                  helperText="Password must be at least 6 characters"
                  error={!!passwordError}
                />
                <TextField
                  label="Retype Password"
                  type="password"
                  value={retypePassword}
                  onChange={(e) => {
                    setRetypePassword(e.target.value);
                    setPasswordError(null);
                  }}
                  fullWidth
                  margin="normal"
                  helperText={passwordError || "Retype your password"}
                  error={!!passwordError}
                />
              </>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            {/* Hide cancel if this flow must be completed */}
            {!forceComplete && (
              <Button onClick={onClose} disabled={submitting} color="inherit">
                Cancel
              </Button>
            )}
            <Button
              onClick={handleProfileSubmit}
              disabled={!canSubmitProfile || submitting}
              variant="contained"
            >
              {/* If skipping phone step, label should be Submit & Close */}
              {phoneVerified || (initialPhone && initialPhone.length > 0)
                ? "Submit & Close"
                : "Next"}
            </Button>
          </DialogActions>
        </>
      )}
      {step === "phone" && (
        <>
          <DialogTitle>Confirm Your Phone Number</DialogTitle>
          <DialogContent
            sx={{
              minWidth: 420,
              minHeight: 480,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <PhoneAuth initialPhone={phone} onVerified={handlePhoneVerified} />
          </DialogContent>
        </>
      )}
      {step === "welcome" && (
        <>
          <DialogTitle>Welcome, {username}!</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>Your account is ready.</Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} variant="contained" autoFocus>
              Continue
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default GoogleProfileCompletionModal;
