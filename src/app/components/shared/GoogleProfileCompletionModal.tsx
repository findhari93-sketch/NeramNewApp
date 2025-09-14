import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import PhoneAuth from "./PhoneAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (data: {
    username: string;
    password: string;
    phone: string;
  }) => void;
  initialPhone?: string;
}

const GoogleProfileCompletionModal: React.FC<Props> = ({
  open,
  onClose,
  onComplete,
  initialPhone,
}) => {
  const [step, setStep] = useState<"profile" | "phone" | "welcome">("profile");
  const [username, setUsername] = useState("");
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
    if (username.length > 2) checkUsername(username);
  };

  const canSubmitProfile =
    usernameStatus === "available" &&
    password.length >= 6 &&
    retypePassword.length >= 6 &&
    password === retypePassword;

  const handleProfileSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setPasswordError(null);
    if (password !== retypePassword) {
      setPasswordError("Passwords do not match");
      setSubmitting(false);
      return;
    }
    // If all good, move to phone step
    setStep("phone");
    setSubmitting(false);
  };

  const handlePhoneVerified = (verifiedPhone: string) => {
    setPhone(verifiedPhone);
    setStep("welcome");
    // Call onComplete to persist data
    onComplete({ username, password, phone: verifiedPhone });
  };

  return (
    <Dialog
      open={open}
      onClose={step === "welcome" ? onClose : undefined}
      disableEscapeKeyDown={step !== "welcome"}
    >
      {step === "profile" && (
        <>
          <DialogTitle>Set Username & Password</DialogTitle>
          <DialogContent sx={{ minWidth: 350 }}>
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
                endAdornment:
                  usernameStatus === "checking" ? (
                    <CircularProgress size={18} />
                  ) : null,
              }}
            />
            <TextField
              label="Create Password"
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
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={submitting} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleProfileSubmit}
              disabled={!canSubmitProfile || submitting}
              variant="contained"
            >
              Next
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
