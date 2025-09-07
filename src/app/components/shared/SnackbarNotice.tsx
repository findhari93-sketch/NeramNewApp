"use client";
import React from "react";
import type { SnackbarCloseReason } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useSearchParams, useRouter } from "next/navigation";

export default function SnackbarNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const notice = searchParams.get("notice");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (notice === "already_logged_in" || notice === "login_success")
      setOpen(true);
  }, [notice]);

  const handleClose = (
    event?: Event | React.SyntheticEvent<unknown>,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
    // remove the notice query param
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("notice");
      router.replace(url.pathname + url.search);
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
