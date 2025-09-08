"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Check,
  Close,
  Security,
  Email,
  Person,
  Phone,
} from "@mui/icons-material";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  linkEmailPasswordToCurrentUser,
  sendEmailVerificationToCurrentUser,
  changePassword,
  sendPasswordReset,
  getLinkedProviders,
  hasEmailPasswordLinked,
  hasPhoneLinked,
} from "../../lib/auth/firebaseAuth";
import {
  linkEmailPasswordSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  setUsernameSchema,
  getPasswordStrength,
} from "../../lib/auth/validation";
import { useRouter } from "next/navigation";
import TopNavBar from "../components/shared/TopNavBar";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  // Form states
  const [linkEmailForm, setLinkEmailForm] = useState({ email: "", password: "" });
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: "" });
  const [usernameForm, setUsernameForm] = useState({ username: "" });

  // Loading states
  const [linkEmailLoading, setLinkEmailLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [sendVerificationLoading, setSendVerificationLoading] = useState(false);

  // Success/error states
  const [linkEmailMessage, setLinkEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changePasswordMessage, setChangePasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Username validation
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  // Password visibility
  const [showPasswords, setShowPasswords] = useState({
    linkPassword: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Get linked providers
        try {
          const providers = await getLinkedProviders();
          setLinkedProviders(providers.providers);
          setUserEmail(providers.email);
          
          // Pre-fill email fields if user has email
          if (providers.email) {
            setForgotPasswordForm({ email: providers.email });
          }
        } catch (error) {
          console.error("Failed to get linked providers:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Username availability check with debounce
  useEffect(() => {
    if (!usernameForm.username || usernameForm.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const checkUsername = async () => {
      setUsernameCheckLoading(true);
      try {
        const response = await fetch("/api/auth/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameForm.username }),
        });
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (error) {
        console.error("Username check failed:", error);
        setUsernameAvailable(null);
      } finally {
        setUsernameCheckLoading(false);
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [usernameForm.username]);

  // Redirect if not authenticated
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Link Email & Password
  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkEmailLoading(true);
    setLinkEmailMessage(null);

    try {
      const validation = linkEmailPasswordSchema.safeParse(linkEmailForm);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      await linkEmailPasswordToCurrentUser(linkEmailForm.email, linkEmailForm.password);
      
      // Update linked providers
      const providers = await getLinkedProviders();
      setLinkedProviders(providers.providers);
      setUserEmail(providers.email);
      
      setLinkEmailMessage({ type: "success", text: "Email and password linked successfully!" });
      setLinkEmailForm({ email: "", password: "" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setLinkEmailMessage({ type: "error", text: message });
    } finally {
      setLinkEmailLoading(false);
    }
  };

  // Send Email Verification
  const handleSendEmailVerification = async () => {
    setSendVerificationLoading(true);
    setVerificationMessage(null);

    try {
      await sendEmailVerificationToCurrentUser();
      setVerificationMessage({ type: "success", text: "Verification email sent!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setVerificationMessage({ type: "error", text: message });
    } finally {
      setSendVerificationLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordMessage(null);

    try {
      const validation = changePasswordSchema.safeParse(changePasswordForm);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      await changePassword(changePasswordForm.currentPassword, changePasswordForm.newPassword);
      setChangePasswordMessage({ type: "success", text: "Password changed successfully!" });
      setChangePasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setChangePasswordMessage({ type: "error", text: message });
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage(null);

    try {
      const validation = forgotPasswordSchema.safeParse(forgotPasswordForm);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      await sendPasswordReset(forgotPasswordForm.email);
      setForgotPasswordMessage({ type: "success", text: "Password reset email sent!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setForgotPasswordMessage({ type: "error", text: message });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Set Username
  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameMessage(null);

    try {
      const validation = setUsernameSchema.safeParse(usernameForm);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      if (!usernameAvailable) {
        throw new Error("Username is not available");
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Update username in Supabase
      const response = await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ username: usernameForm.username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to set username");
      }

      setUsernameMessage({ type: "success", text: "Username set successfully!" });
      setUsernameForm({ username: "" });
      setUsernameAvailable(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setUsernameMessage({ type: "error", text: message });
    } finally {
      setUsernameLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(changePasswordForm.newPassword);
  const hasEmailPassword = hasEmailPasswordLinked(user);
  const hasPhone = hasPhoneLinked(user);

  return (
    <>
      <TopNavBar />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Account Settings
        </Typography>

        {/* Linked Methods */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Security /> Linked Sign-in Methods
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {hasPhone && <Chip icon={<Phone />} label="Phone" color="primary" />}
              {hasEmailPassword && <Chip icon={<Email />} label="Email/Password" color="primary" />}
              {linkedProviders.includes("google.com") && <Chip label="Google" color="secondary" />}
              {linkedProviders.includes("linkedin.com") && <Chip label="LinkedIn" color="secondary" />}
              {linkedProviders.length === 0 && <Typography color="text.secondary">No methods linked</Typography>}
            </Box>
          </CardContent>
        </Card>

        {/* Link Email & Password */}
        {!hasEmailPassword && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Email /> Link Email & Password
              </Typography>
              <Box component="form" onSubmit={handleLinkEmailPassword} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={linkEmailForm.email}
                  onChange={(e) => setLinkEmailForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Password"
                  type={showPasswords.linkPassword ? "text" : "password"}
                  value={linkEmailForm.password}
                  onChange={(e) => setLinkEmailForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, linkPassword: !prev.linkPassword }))}
                          edge="end"
                        >
                          {showPasswords.linkPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={linkEmailLoading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {linkEmailLoading ? <CircularProgress size={20} /> : "Link Email & Password"}
                </Button>
                {linkEmailMessage && (
                  <Alert severity={linkEmailMessage.type}>{linkEmailMessage.text}</Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Email Verification */}
        {userEmail && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Email Verification
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography>Email: {userEmail}</Typography>
                {user.emailVerified ? (
                  <Chip icon={<Check />} label="Verified" color="success" size="small" />
                ) : (
                  <Chip icon={<Close />} label="Not Verified" color="error" size="small" />
                )}
              </Box>
              {!user.emailVerified && (
                <Button
                  variant="outlined"
                  onClick={handleSendEmailVerification}
                  disabled={sendVerificationLoading}
                >
                  {sendVerificationLoading ? <CircularProgress size={20} /> : "Send Verification Email"}
                </Button>
              )}
              {verificationMessage && (
                <Alert severity={verificationMessage.type} sx={{ mt: 2 }}>
                  {verificationMessage.text}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Change Password */}
        {hasEmailPassword && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Change Password
              </Typography>
              <Box component="form" onSubmit={handleChangePassword} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Current Password"
                  type={showPasswords.currentPassword ? "text" : "password"}
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                          edge="end"
                        >
                          {showPasswords.currentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  type={showPasswords.newPassword ? "text" : "password"}
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                          edge="end"
                        >
                          {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {changePasswordForm.newPassword && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Password strength: {passwordStrength.score}/6
                    </Typography>
                    {passwordStrength.feedback.map((feedback, index) => (
                      <Typography key={index} variant="caption" display="block" color="text.secondary">
                        • {feedback}
                      </Typography>
                    ))}
                  </Box>
                )}
                <TextField
                  label="Confirm New Password"
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                          edge="end"
                        >
                          {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={changePasswordLoading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {changePasswordLoading ? <CircularProgress size={20} /> : "Change Password"}
                </Button>
                {changePasswordMessage && (
                  <Alert severity={changePasswordMessage.type}>{changePasswordMessage.text}</Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reset Password
            </Typography>
            <Box component="form" onSubmit={handleForgotPassword} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={forgotPasswordForm.email}
                onChange={(e) => setForgotPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                required
                fullWidth
                helperText="Enter email to receive password reset link"
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={forgotPasswordLoading}
                sx={{ alignSelf: "flex-start" }}
              >
                {forgotPasswordLoading ? <CircularProgress size={20} /> : "Send Reset Email"}
              </Button>
              {forgotPasswordMessage && (
                <Alert severity={forgotPasswordMessage.type}>{forgotPasswordMessage.text}</Alert>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Set Username */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Person /> Set Username
            </Typography>
            <Box component="form" onSubmit={handleSetUsername} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <FormLabel>Username</FormLabel>
                <TextField
                  value={usernameForm.username}
                  onChange={(e) => setUsernameForm(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                  placeholder="Enter username"
                  InputProps={{
                    endAdornment: usernameCheckLoading ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : usernameAvailable !== null ? (
                      <InputAdornment position="end">
                        {usernameAvailable ? (
                          <Check color="success" />
                        ) : (
                          <Close color="error" />
                        )}
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <FormHelperText>
                  {usernameForm.username.length >= 3 && usernameAvailable !== null && (
                    <span style={{ color: usernameAvailable ? 'green' : 'red' }}>
                      {usernameAvailable ? 'Username is available' : 'Username is taken'}
                    </span>
                  )}
                  {usernameForm.username.length === 0 && (
                    "3-20 characters, lowercase letters, numbers, underscores, and dots only"
                  )}
                </FormHelperText>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                disabled={usernameLoading || !usernameAvailable || usernameForm.username.length < 3}
                sx={{ alignSelf: "flex-start" }}
              >
                {usernameLoading ? <CircularProgress size={20} /> : "Set Username"}
              </Button>
              {usernameMessage && (
                <Alert severity={usernameMessage.type}>{usernameMessage.text}</Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}