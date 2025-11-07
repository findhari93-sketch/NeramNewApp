"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Tooltip,
  Grid,
} from "@mui/material";

import {
  Person,
  Security,
  VpnKey,
  Notifications,
  CreditCard,
  DeleteOutline,
  CheckCircle,
  Save,
  History,
  Logout,
} from "@mui/icons-material";

type TabId =
  | "profile"
  | "security"
  | "linked"
  | "notifications"
  | "billing"
  | "danger";

interface User {
  displayName: string;
  email: string;
  username: string;
  phone: string;
  emailVerified: boolean;
  plan: string;
  createdAt: string;
}

type Snack = {
  severity: "success" | "error" | "info" | "warning";
  message: string;
} | null;

export default function AccountSettingsMUI() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [user, setUser] = useState<User>({
    displayName: "Jane Doe",
    email: "jane.doe@example.com",
    username: "janedoe",
    phone: "+91 98765 43210",
    emailVerified: false,
    plan: "Pro",
    createdAt: "2024-03-05",
  });

  const [active, setActive] = useState<TabId>("profile");
  const [form, setForm] = useState<User>({ ...user });
  const [snack, setSnack] = useState<Snack>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm((f: User) => ({ ...f, ...user })), [user]);

  const navItems = useMemo(
    () => [
      {
        id: "profile" as TabId,
        label: "Profile",
        icon: <Person fontSize="small" />,
      },
      {
        id: "security" as TabId,
        label: "Security",
        icon: <Security fontSize="small" />,
      },
      {
        id: "linked" as TabId,
        label: "Linked Accounts",
        icon: <VpnKey fontSize="small" />,
      },
      {
        id: "notifications" as TabId,
        label: "Notifications",
        icon: <Notifications fontSize="small" />,
      },
      {
        id: "billing" as TabId,
        label: "Billing",
        icon: <CreditCard fontSize="small" />,
      },
      {
        id: "danger" as TabId,
        label: "Danger Zone",
        icon: <DeleteOutline fontSize="small" />,
      },
    ],
    []
  );

  // mock handlers
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setUser((u) => ({ ...u, ...form }));
      setSnack({ severity: "success", message: "Profile saved" });
    } catch {
      setSnack({ severity: "error", message: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setUser((u) => ({ ...u, emailVerified: true }));
      setSnack({ severity: "success", message: "Verification email sent" });
    } catch {
      setSnack({ severity: "error", message: "Failed to send verification" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      setTwoFAEnabled((s) => !s);
      setSnack({
        severity: "success",
        message: twoFAEnabled ? "2FA disabled" : "2FA enabled",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAll = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setSessionsOpen(false);
      setSnack({
        severity: "success",
        message: "Signed out of other sessions",
      });
    } finally {
      setSaving(false);
    }
  };

  // Render — profile improved layout (main change)
  const renderProfileArea = () => (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Grid container spacing={3}>
        {/* Left: form (takes 2/3 of the area) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Basic profile information — public fields are highlighted.
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Display name
              </Typography>
              <TextField
                size="small"
                fullWidth
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
                sx={{ mt: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Username
              </Typography>
              <TextField
                size="small"
                fullWidth
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    username: e.target.value.toLowerCase(),
                  }))
                }
                helperText="3–20 chars: lowercase, numbers, dot, underscore"
                sx={{ mt: 1 }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>

              <Grid
                size={{ xs: 12, sm: 4 }}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Box sx={{ width: "100%", ml: { xs: 0, sm: 1 } }}>
                  <Tooltip
                    title={user.emailVerified ? "Verified" : "Not verified"}
                  >
                    <Box>
                      {user.emailVerified ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<CheckCircle color="success" />}
                        >
                          Verified
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="inherit"
                          fullWidth
                          onClick={handleSendVerification}
                        >
                          Verify
                        </Button>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <TextField
                size="small"
                fullWidth
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                sx={{ mt: 1 }}
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setForm({ ...user });
              }}
            >
              Reset
            </Button>
          </Box>
        </Grid>

        {/* Right: summary card (1/3) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main" }}>
                  {(user.displayName || "U").slice(0, 2).toUpperCase()}
                </Avatar>
                <Typography fontWeight={700}>{user.displayName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  @{user.username}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Plan
                  </Typography>
                  <Typography fontWeight={700}>{user.plan}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Account created
                  </Typography>
                  <Typography variant="body2">{user.createdAt}</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                startIcon={<History />}
                fullWidth
                variant="outlined"
                onClick={() =>
                  setSnack({
                    severity: "info",
                    message: "Activity log placeholder",
                  })
                }
              >
                Activity log
              </Button>

              <Button
                startIcon={<Logout />}
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                onClick={() =>
                  setSnack({
                    severity: "info",
                    message: "Sign out placeholder",
                  })
                }
              >
                Sign out
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  // Keep other renderers the same but styled with similar paddings
  const renderSecurityCard = () => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6">Security</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage 2FA, sessions and passwords.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography fontWeight={600}>
                  Two-factor authentication
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  TOTP / Authenticator apps
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={twoFAEnabled} onChange={handleToggle2FA} />
                <Button
                  size="small"
                  onClick={() =>
                    setSnack({
                      severity: "info",
                      message: "2FA setup placeholder",
                    })
                  }
                >
                  Setup
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography fontWeight={600}>Sessions & devices</Typography>
                <Typography variant="caption" color="text.secondary">
                  Sign out remote sessions
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSessionsOpen((s) => !s)}>
                  View
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSignOutAll}
                >
                  Sign out other sessions
                </Button>
              </Stack>
            </Stack>

            {sessionsOpen && (
              <Box sx={{ mt: 2 }}>
                <List dense>
                  <ListItemButton>
                    <ListItemText
                      primary="Chrome — Windows"
                      secondary="Last active: Today"
                    />
                    <Button size="small">Sign out</Button>
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemText
                      primary="iPhone — iOS"
                      secondary="Last active: Yesterday"
                    />
                    <Button size="small">Sign out</Button>
                  </ListItemButton>
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Account settings
          </Typography>
          <Typography color="text.secondary">
            Manage profile, security, billing and more
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* left nav */}
        {mdUp && (
          <Grid size={{ md: 3 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, position: "sticky", top: 24, borderRadius: 2 }}
            >
              <Box
                sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
              >
                <Avatar sx={{ width: 56, height: 56 }}>
                  {(user.displayName || "U").slice(0, 2).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>{user.displayName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{user.username}
                  </Typography>
                </Box>
              </Box>

              <List disablePadding>
                {navItems.map((n) => (
                  <ListItemButton
                    key={n.id}
                    selected={active === n.id}
                    onClick={() => setActive(n.id)}
                  >
                    <ListItemIcon>{n.icon}</ListItemIcon>
                    <ListItemText primary={n.label} />
                  </ListItemButton>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Plan
                </Typography>
                <Typography fontWeight={600}>{user.plan}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  Account created {user.createdAt}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* content center */}
        <Grid size={{ xs: 12, md: 6 }}>
          {active === "profile" && renderProfileArea()}
          {active === "security" && renderSecurityCard()}

          {/* fallback cards for other tabs (you can style similarly) */}
          {active === "linked" && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6">Linked Accounts</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage social sign-ins and email/password methods
              </Typography>
            </Paper>
          )}
          {active === "notifications" && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6">Notifications</Typography>
              <Typography variant="body2" color="text.secondary">
                Control how we notify you
              </Typography>
            </Paper>
          )}
          {active === "billing" && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6">Billing</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage payment methods
              </Typography>
            </Paper>
          )}
          {active === "danger" && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="error">
                Danger Zone
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* right summary column (keeps page balanced) */}
        {mdUp && (
          <Grid size={{ md: 3 }}>
            <Box sx={{ position: "sticky", top: 24 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Quick actions
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() =>
                      setSnack({
                        severity: "info",
                        message: "Export placeholder",
                      })
                    }
                  >
                    Export data
                  </Button>
                  <Button
                    fullWidth
                    color="error"
                    variant="contained"
                    onClick={() =>
                      setSnack({
                        severity: "warning",
                        message: "Delete flow placeholder",
                      })
                    }
                  >
                    Delete account
                  </Button>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Support & plan
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>{user.plan}</strong>
                </Typography>
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() =>
                    setSnack({
                      severity: "info",
                      message: "Support placeholder",
                    })
                  }
                >
                  Contact support
                </Button>
              </Paper>
            </Box>
          </Grid>
        )}
      </Grid>

      {snack && (
        <Snackbar
          open={!!snack}
          autoHideDuration={3000}
          onClose={() => setSnack(null)}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack(null)}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
