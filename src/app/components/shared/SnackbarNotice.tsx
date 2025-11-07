"use client";
import React from "react";
import type { SnackbarCloseReason } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function SnackbarNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const notice = searchParams?.get("notice") ?? null;
  const [open, setOpen] = React.useState(false);
  // Prevent SSR -> hydration flicker when `notice` is present. Don't render
  // the snackbar until the client has hydrated.
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  React.useEffect(() => {
    if (notice === "already_logged_in" || notice === "login_success") {
      setOpen(true);
      try {
        window.dispatchEvent(
          new CustomEvent("neram:log", { detail: { notice } })
        );
      } catch {}
    }
  }, [notice]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ): void => {
    if (reason === "clickaway") return;
    setOpen(false);
    // remove the notice query param
    try {
      // construct a stable URLSearchParams from the current search params
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.delete("notice");
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""));
    } catch {}
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  if (!hydrated) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      message={
        notice === "login_success"
          ? "Signed in successfully"
          : "You\u2019re already logged in"
      }
      action={action}
    />
  );
}
