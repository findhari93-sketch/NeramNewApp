"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import {
  uploadAvatarToServer,
  getAvatarSignedUrl,
} from "../../../lib/uploadAvatar";
// ...existing code...

export default function AvatarUploader({
  userId,
  initialUrl,
}: {
  userId: string;
  initialUrl?: string | null;
}) {
  const [loading, setLoading] = React.useState(false);
  const [imgUrl, setImgUrl] = React.useState<string | null>(initialUrl ?? null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!imgUrl && userId) {
      (async () => {
        try {
          const url = await getAvatarSignedUrl(userId);
          if (url) setImgUrl(url);
        } catch {
          // ignore
        }
      })();
    }
  }, [userId, imgUrl]);

  const handleFile = async (file?: File | null) => {
    if (!file || !userId) return;
    setLoading(true);
    try {
      // upload via server
      await uploadAvatarToServer(file, userId);
      // fetch signed url to display
      const signed = await getAvatarSignedUrl(userId);
      setImgUrl(signed || null);
    } catch (e) {
      console.error("avatar upload failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <Avatar src={imgUrl ?? undefined} sx={{ width: 56, height: 56 }} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          handleFile(f);
        }}
      />
      <Button
        variant="outlined"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <CircularProgress size={18} /> : "Upload"}
      </Button>
    </Box>
  );
}
