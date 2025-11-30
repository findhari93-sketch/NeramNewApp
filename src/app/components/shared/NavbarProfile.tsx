"use client";
import React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import Skeleton from "@mui/material/Skeleton";
import ProfileMenuContent from "./Profile/ProfileMenuContent";
import { titleCase } from "../../../lib/stringUtils";
import { useRouter } from "next/navigation";
import type { User } from "./types";
import UserAvatar from "./Profile/UserAvatar";

type Props = {
  user?: User | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  // If provided, the parent fully controls the Popover's anchor element.
  // Prefer `anchorEl` (an HTMLElement) or `anchorRef` (a ref to an element).
  // When the parent provides these, this component will not mutate internal anchor state.
  anchorEl?: HTMLElement | null;
  anchorRef?: React.RefObject<HTMLElement>;
  onSignOut?: () => Promise<void> | void;
  showDetails?: boolean; // controls whether to show name/role text
};

export default function NavbarProfile({
  user,
  isOpen: controlledOpen,
  onOpenChange,
  onSignOut,
  showDetails = true,
  anchorEl: parentAnchorEl,
  anchorRef,
}: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  // Determine the effective anchor element. Prefer parent-supplied anchorEl or anchorRef,
  // otherwise fall back to this component's internal anchor state.
  const effectiveAnchorEl = parentAnchorEl ?? anchorRef?.current ?? anchorEl;

  // When parent provides controlledOpen, avoid opening the Popover without an anchorEl.
  // If controlledOpen is undefined, behave uncontrolled and use anchor presence.
  const open =
    controlledOpen === undefined
      ? Boolean(effectiveAnchorEl)
      : Boolean(controlledOpen && effectiveAnchorEl);

  const popoverId = open ? "profile-popover" : undefined;

  // Stabilize handlers to avoid unnecessary re-renders in parent trees
  const handleToggle = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // If parent provided an anchor (anchorEl or anchorRef), don&apos;t mutate internal state;
      // delegate open/close control to the parent via onOpenChange.
      const parentAnchored = Boolean(parentAnchorEl || anchorRef?.current);
      if (parentAnchored) {
        onOpenChange?.(!controlledOpen);
        return;
      }

      if (anchorEl) {
        setAnchorEl(null);
        onOpenChange?.(false);
      } else {
        setAnchorEl(e.currentTarget);
        onOpenChange?.(true);
      }
    },
    [anchorEl, onOpenChange, parentAnchorEl, anchorRef, controlledOpen]
  );

  const handleClose = React.useCallback(() => {
    // If parent controls anchor, ask parent to close; otherwise clear internal state
    if (parentAnchorEl || anchorRef?.current) {
      onOpenChange?.(false);
      return;
    }
    setAnchorEl(null);
    onOpenChange?.(false);
  }, [onOpenChange, parentAnchorEl, anchorRef]);

  const displayName = React.useMemo(
    () => titleCase(user?.name ?? "Guest") ?? "Guest",
    [user?.name]
  );
  // prefer explicit accountType returned from DB; fall back to role for compatibility
  const displayRole = React.useMemo(
    () => user?.accountType ?? user?.role ?? "Free",
    [user?.accountType, user?.role]
  );

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
            id="profile-button"
            onClick={handleToggle}
            aria-haspopup="true"
            aria-controls={popoverId}
            aria-expanded={open ? "true" : "false"}
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
        id={popoverId}
        open={open}
        anchorEl={effectiveAnchorEl}
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
