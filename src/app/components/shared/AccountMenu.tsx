"use client";
import React from "react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearAllAuthCaches } from "../../../lib/clearAuthCache";

type Props = {
  label?: string | null;
};

export default function AccountMenu({ label: initialLabel }: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [photoURL, setPhotoURL] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(
    initialLabel ?? null
  );

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setDisplayName(initialLabel ?? null);
        setPhotoURL(null);
        return;
      }
      const asObj = u as unknown as Record<string, unknown>;
      const name =
        typeof asObj.displayName === "string"
          ? (asObj.displayName as string)
          : null;
      const email =
        typeof asObj.email === "string" ? (asObj.email as string) : null;
      const phone =
        typeof asObj.phoneNumber === "string"
          ? (asObj.phoneNumber as string)
          : null;
      const photo =
        typeof asObj.photoURL === "string" ? (asObj.photoURL as string) : null;
      setDisplayName(name || email || phone || initialLabel || null);
      setPhotoURL(photo || null);
    });
    try {
      // fallback: phone_verified may be stored as a simple label
      const pv = localStorage.getItem("phone_verified");
      if (pv && !initialLabel) setDisplayName((prev) => prev || pv);
    } catch {}
    return () => unsub();
  }, [initialLabel]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleClose();
    router.push("/profile");
  };

  const handleLogout = async () => {
    handleClose();

    // CRITICAL: Clear ALL auth caches before signing out
    // This ensures deleted/logged-out users cannot access cached data
    try {
      await clearAllAuthCaches();
    } catch (e) {
      console.warn("clearAllAuthCaches error", e);
    }

    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("signOut error", e);
    }

    router.push("/");
  };

  const nameForAvatar = displayName || "User";
  const avatarLetter = nameForAvatar.charAt(0).toUpperCase();

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Tooltip title={displayName || "Account"}>
        <IconButton
          onClick={handleOpen}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          aria-label="open account menu"
        >
          <Avatar src={photoURL ?? undefined} alt={displayName ?? undefined}>
            {!photoURL ? avatarLetter : null}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        MenuListProps={{ "aria-labelledby": "account-button" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">
            {displayName || "Your account"}
          </Typography>
        </Box>
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
