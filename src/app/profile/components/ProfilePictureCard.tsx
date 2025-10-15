/**
 * ProfilePictureCard.tsx
 *
  student_name?: string | null;
 * Small card showing avatar + basic summary with an Edit overlay to upload a new avatar.
 *
 * Example usage:
 * <ProfilePictureCard
 *   user={user}
 *   onUpload={async (file) => {
 *     // upload file to storage (Supabase / S3) and return { photoURL }
 *     // return await uploadAvatar(file);
 * />
 *
 * Props exported: ProfilePictureCardProps
 *
 * Notes:
 * - Cropping integration placeholder (react-easy-crop) is commented where appropriate.
 * - onUpload should be provided by the app; it receives a File and must return { photoURL: string }
 */

import React, { useState, useRef, useEffect } from "react";
import { titleCase } from "../../../lib/stringUtils";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import { SxProps, Theme } from "@mui/system";
import UserAvatar from "../../components/shared/UserAvatar";

export type UserShape = {
  id?: string;
  student_name?: string | null;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  photoURL?: string | null;
};

export type ProfilePictureCardProps = {
  user: UserShape;
  onUpload: (file: File) => Promise<{ photoURL: string }>;
  avatarSize?: number;
  sx?: SxProps<Theme>;
};

export function ProfilePictureCard({
  user,
  onUpload,
  avatarSize = 96,
  sx,
}: ProfilePictureCardProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(user?.photoURL ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    message?: string;
    severity?: "error" | "success";
  }>({ open: false });
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep preview in sync when parent updates user.photoURL (e.g. after
  // fetching a server-signed URL). We only update preview when the incoming
  // photoURL differs from our current preview to avoid disrupting an ongoing
  // local selection (object URL) while the user is editing.
  useEffect(() => {
    const incoming = user?.photoURL ?? null;
    if (!incoming) return;
    if (incoming !== preview) {
      setPreview(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.photoURL]);

  const handleChoose = () => {
    inputRef.current?.click();
  };

  const handleFile = (f?: File | null) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      handleFile(f);
    }
  };

  const handleSave = async () => {
    if (!file) {
      setSnack({
        open: true,
        message: "Please choose an image",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    // optimistic UI: keep preview while uploading; if fails, rollback to previous user.photoURL
    const previous = preview;
    try {
      // IMPORTANT: Hook your real upload here (Supabase Storage / S3)
      // await onUpload(file) should return { photoURL: string }
      const result = await onUpload(file);

      // Update preview to returned URL (canonical)
      setPreview(result.photoURL);
      setSnack({ open: true, message: "Avatar updated", severity: "success" });
      setOpen(false);
    } catch {
      setPreview(previous);
      setSnack({ open: true, message: "Upload failed", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", ...((sx as any) || {}) }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexDirection: "column",
          textAlign: "center",
          p: 2,
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <UserAvatar user={user} size={avatarSize} />

          <IconButton
            aria-label="Edit avatar"
            onClick={() => setOpen(true)}
            size="small"
            sx={{
              position: "absolute",
              right: -4,
              bottom: -4,
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {titleCase(
              user?.student_name ??
                user?.displayName ??
                user?.email ??
                "Your account"
            )}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {user?.email ?? "—"}
          </Typography>
        </Box>
      </Box>

      {/* Upload dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: "none" }}
            aria-label="Choose avatar file"
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box
              sx={{
                borderRadius: 1,
                border: "1px dashed",
                borderColor: "divider",
                p: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Recommended: 400×400 px, ≤ 200KB
              </Typography>

              {/* Preview */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                <UserAvatar user={{ ...user, photoURL: preview }} size={120} />
              </Box>

              <Button
                startIcon={<PhotoCamera />}
                onClick={handleChoose}
                variant="outlined"
                size="small"
              >
                Choose file
              </Button>

              {/* Optional cropping integration:
                  - Install `react-easy-crop` and show a cropping canvas here when a file is selected.
                  - After crop selection, convert crop area to a Blob and call onUpload with that Blob.
                  - Example integration point: show Cropper component here and a 'Crop & Save' button.
              */}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} size="small" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="small"
            sx={{ height: 28 }}
            startIcon={saving ? <CircularProgress size={16} /> : null}
            disabled={saving}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity ?? "success"} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfilePictureCard;
