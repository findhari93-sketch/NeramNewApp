"use client";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardIcon from "@mui/icons-material/Dashboard";
import useAvatarColor from "./useAvatarColor";
import type { User } from "../types";

type Props = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onSignOut?: () => Promise<void> | void;
  onClose?: () => void;
};

export function initialsForName(name?: string) {
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

  // Memoize small derived values to avoid re-computing across renders
  const displayName = React.useMemo(() => user?.name ?? "Guest User", [user]);
  const displayRole = React.useMemo(() => {
    const acctType = user?.accountType || (user as any)?.account_type || "Free";
    return acctType === "premium" ? "Premium" : acctType;
  }, [user]);
  const isPremium = React.useMemo(
    () =>
      String(user?.accountType).toLowerCase() === "premium" ||
      (user as any)?.account_type === "premium" ||
      (user as any)?.payment_status === "paid",
    [user]
  );

  const avatar = React.useMemo(
    () =>
      user?.avatarUrl ? (
        <Avatar src={user.avatarUrl} alt={user?.name ?? "user"} />
      ) : (
        <Avatar sx={{ bgcolor: color }}>
          {initialsForName(user?.name ?? undefined)}
        </Avatar>
      ),
    [user?.avatarUrl, user?.name, color]
  );

  // Refs for keyboard focus management (arrow key navigation)
  // Use button element type for ListItemButton to be more specific when possible.
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  React.useEffect(() => {
    // ensure refs array length matches static menu size (5 base + 1 optional premium)
    itemRefs.current = itemRefs.current.slice(0, isPremium ? 6 : 5);
  }, [isPremium]);

  const goProfile = React.useCallback(() => {
    onNavigate("/profile");
    onClose?.();
  }, [onNavigate, onClose]);

  const goAccountSettings = React.useCallback(() => {
    onNavigate("/accountSettings");
    onClose?.();
  }, [onNavigate, onClose]);

  const goSettings = React.useCallback(() => {
    onNavigate("/settings");
    onClose?.();
  }, [onNavigate, onClose]);

  const goApplications = React.useCallback(() => {
    onNavigate("/applications");
    onClose?.();
  }, [onNavigate, onClose]);

  const goJoinClass = React.useCallback(() => {
    onNavigate("/applicationform");
    onClose?.();
  }, [onNavigate, onClose]);

  const goPremiumDashboard = React.useCallback(() => {
    onNavigate("/premium");
    onClose?.();
  }, [onNavigate, onClose]);

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const len = itemRefs.current.length;
    if (len === 0) return;
    const key = e.key;
    const active = document.activeElement as HTMLElement | null;
    const idx = itemRefs.current.findIndex((el) => el === active);

    if (idx === -1) {
      // nothing focused; start at first/last depending on arrow
      if (key === "ArrowDown") {
        e.preventDefault();
        itemRefs.current[0]?.focus();
      } else if (key === "ArrowUp") {
        e.preventDefault();
        itemRefs.current[len - 1]?.focus();
      }
      return;
    }

    if (key === "ArrowDown") {
      e.preventDefault();
      const next = (idx + 1) % len;
      itemRefs.current[next]?.focus();
    } else if (key === "ArrowUp") {
      e.preventDefault();
      const prev = (idx - 1 + len) % len;
      itemRefs.current[prev]?.focus();
    } else if (key === "Home") {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (key === "End") {
      e.preventDefault();
      itemRefs.current[len - 1]?.focus();
    } else if (key === "Escape") {
      // close the menu
      if (onClose) onClose();
    }
  };

  const handleLogout = React.useCallback(async () => {
    try {
      if (onSignOut) await onSignOut();
    } catch {}
    onNavigate("/auth/login");
    if (onClose) onClose();
  }, [onSignOut, onNavigate, onClose]);

  return (
    <Card elevation={0} sx={{ boxShadow: "none" }}>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, my: 1, px: 2 }}
        >
          {avatar}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{displayName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {displayRole}
            </Typography>
          </Box>
          <Button variant="contained" onClick={goJoinClass} size="small">
            {isPremium ? "Add Course" : "Join Class"}
          </Button>
        </Box>

        {user?.plan === "Free" || user?.storageFull ? (
          <Box sx={{ mb: 1 }} aria-live="polite" role="status">
            <Typography variant="body2" color="text.secondary">
              Your Free plan storage is at full capacity. Explore more with our{" "}
              <Link href="/pricing">Pro account</Link>.
            </Typography>
          </Box>
        ) : null}

        <Divider sx={{ my: 1 }} />

        <List
          disablePadding
          aria-label="Profile menu"
          onKeyDown={onListKeyDown}
          role="menu"
        >
          <ListItemButton
            ref={(el) => {
              itemRefs.current[0] = el as HTMLButtonElement | null;
            }}
            autoFocus
            aria-label="My Profile"
            role="menuitem"
            onClick={goProfile}
          >
            <ListItemIcon>
              <PersonIcon aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItemButton>
          <ListItemButton
            ref={(el) => {
              itemRefs.current[1] = el as HTMLButtonElement | null;
            }}
            role="menuitem"
            onClick={goAccountSettings}
          >
            <ListItemIcon>
              <ManageAccountsIcon aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </ListItemButton>
          <ListItemButton
            ref={(el) => {
              itemRefs.current[2] = el as HTMLButtonElement | null;
            }}
            role="menuitem"
            onClick={goApplications}
          >
            <ListItemIcon>
              <DescriptionIcon aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="Submitted Applications" />
          </ListItemButton>
          {isPremium && (
            <ListItemButton
              ref={(el) => {
                itemRefs.current[3] = el as HTMLButtonElement | null;
              }}
              role="menuitem"
              onClick={goPremiumDashboard}
            >
              <ListItemIcon>
                <DashboardIcon aria-hidden="true" />
              </ListItemIcon>
              <ListItemText primary="Premium Dashboard" />
            </ListItemButton>
          )}
          <ListItemButton
            ref={(el) => {
              itemRefs.current[isPremium ? 4 : 3] =
                el as HTMLButtonElement | null;
            }}
            role="menuitem"
            onClick={goSettings}
          >
            <ListItemIcon>
              <SettingsIcon aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
          <ListItemButton
            ref={(el) => {
              itemRefs.current[isPremium ? 5 : 4] =
                el as HTMLButtonElement | null;
            }}
            role="menuitem"
            onClick={handleLogout}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon aria-hidden="true" />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </List>
      </CardContent>
    </Card>
  );
}
