"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import useAvatarColor from "./useAvatarColor";
import type { ProfileMenuProps } from "./types";

function initialsForName(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const color = useAvatarColor(user?.name ?? undefined);

  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      if (onSignOut) await onSignOut();
    } catch {}
    router.push("/auth/login");
  };

  const avatar = user?.avatarUrl ? (
    <Avatar src={user.avatarUrl} alt={user?.name ?? "user"} />
  ) : (
    <Avatar sx={{ bgcolor: color }}>
      {initialsForName(user?.name ?? undefined)}
    </Avatar>
  );

  const demoName = user?.name ?? "Guest User";

  return (
    <>
      <Button
        onClick={handleOpen}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label="Open profile menu"
        startIcon={
          <Avatar
            sx={{ width: 32, height: 32, fontSize: 14 }}
            src={user?.avatarUrl ?? undefined}
          >
            {initialsForName(user?.name ?? undefined)}
          </Avatar>
        }
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ textTransform: "none", px: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            ml: 0,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {demoName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role ?? "Visitor"}
          </Typography>
        </Box>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 360, p: 2, borderRadius: 2, boxShadow: 3 },
        }}
      >
        <Card elevation={0} sx={{ boxShadow: "none" }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              {avatar}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">{demoName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role ?? "Visitor"}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => handleNavigate("/application")}
              >
                Join Class
              </Button>
            </Box>

            {user?.plan === "Free" || user?.storageFull ? (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Your Free plan storage is at full capacity. Explore more with
                  our <a href="/pricing">Pro account</a>.
                </Typography>
              </Box>
            ) : null}

            <Divider sx={{ my: 1 }} />

            <List disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/account/profile")}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItemButton>
              <ListItemButton onClick={() => handleNavigate("/settings")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
              <Divider sx={{ my: 1 }} />
              <ListItemButton
                onClick={handleLogout}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Log out" />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>
      </Popover>
    </>
  );
}

export { initialsForName };
