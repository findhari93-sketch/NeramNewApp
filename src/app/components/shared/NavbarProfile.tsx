"use client";
import React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import Skeleton from "@mui/material/Skeleton";
import ProfileMenuContent from "./ProfileMenuContent";
import { titleCase } from "../../../lib/stringUtils";
import { useRouter } from "next/navigation";
import type { User } from "./types";
import UserAvatar from "./UserAvatar";

type Props = {
  user?: User | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSignOut?: () => Promise<void> | void;
  showDetails?: boolean; // controls whether to show name/role text
};

export default function NavbarProfile({
  user,
  isOpen: controlledOpen,
  onOpenChange,
  onSignOut,
  showDetails = true,
}: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = controlledOpen ?? Boolean(anchorEl);

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
      onOpenChange?.(false);
    } else {
      setAnchorEl(e.currentTarget);
      onOpenChange?.(true);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
    onOpenChange?.(false);
  };

  const displayName = titleCase(user?.name ?? "Guest") ?? "Guest";
  // prefer explicit accountType returned from DB; fall back to role for compatibility
  const displayRole = (user as any)?.accountType ?? user?.role ?? "Free"; // default to Free for accounts without explicit accountType

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
        {showDetails &&
          (user ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                minWidth: 80,
              }}
            >
              <Typography
                variant="subtitle1"
                noWrap
                sx={{ maxWidth: 140, fontWeight: 700 }}
              >
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {displayRole}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Skeleton variant="text" width={100} height={24} />
              <Skeleton variant="text" width={60} height={16} />
            </Box>
          ))}

        {user ? (
          <ButtonBase
            onClick={handleToggle}
            aria-haspopup
            aria-expanded={open}
            aria-label="Open profile menu"
            sx={{ borderRadius: "50%" }}
          >
            <UserAvatar user={user} size={36} showRing />
          </ButtonBase>
        ) : (
          <Skeleton variant="circular" width={36} height={36} />
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <ProfileMenuContent
          user={user}
          onNavigate={(p) => {
            handleClose();
            router.push(p);
          }}
          onSignOut={onSignOut}
          onClose={handleClose}
        />
      </Popover>
    </>
  );
}
