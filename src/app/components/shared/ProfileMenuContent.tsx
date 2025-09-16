"use client";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import useAvatarColor from "./useAvatarColor";
import type { User } from "./types";

type Props = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onSignOut?: () => Promise<void> | void;
  onClose?: () => void;
};

function initialsForName(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileMenuContent({
  user,
  onNavigate,
  onSignOut,
  onClose,
}: Props) {
  const color = useAvatarColor(user?.name ?? undefined);
  const avatar = user?.avatarUrl ? (
    <Avatar src={user.avatarUrl} alt={user?.name ?? "user"} />
  ) : (
    <Avatar sx={{ bgcolor: color }}>
      {initialsForName(user?.name ?? undefined)}
    </Avatar>
  );

  const handleLogout = async () => {
    try {
      if (onSignOut) await onSignOut();
    } catch {}
    onNavigate("/auth/login");
    if (onClose) onClose();
  };

  return (
    <Card elevation={0} sx={{ boxShadow: "none" }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          {avatar}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">
              {user?.name ?? "Guest User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.accountType ?? "Free"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => onNavigate("/applicationform")}
          >
            Join Class
          </Button>
        </Box>

        {user?.plan === "Free" || user?.storageFull ? (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Your Free plan storage is at full capacity. Explore more with our{" "}
              <a href="/pricing">Pro account</a>.
            </Typography>
          </Box>
        ) : null}

        <Divider sx={{ my: 1 }} />

        <List disablePadding>
          <ListItemButton
            onClick={() => {
              onNavigate("/account/profile");
              if (onClose) onClose();
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Account" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              onNavigate("/settings");
              if (onClose) onClose();
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </List>
      </CardContent>
    </Card>
  );
}
