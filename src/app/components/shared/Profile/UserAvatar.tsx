"use client";

import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { auth } from "../../../../lib/firebase";

interface UserAvatarProps {
  user?: any;
  size?: number;
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
  showRing?: boolean;
}

/**
 * Shared avatar component used in TopNavBar and profile page.
 * Display priority: custom uploaded photo > Google photo > initials
 * Listens to 'avatar-updated' events to stay in sync across the app.
 */
export default function UserAvatar({
  user,
  size = 40,
  editable = false,
  onUpload,
  showRing = false,
}: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => {
    try {
      if (typeof window === "undefined") return null;

      const uid = user?.uid || auth.currentUser?.uid;
      if (!uid) {
        // If no uid, check if user.photoURL is provided (for preview in dialog)
        if (user?.photoURL) return user.photoURL;
        return null;
      }

      // Use cache for instant display, but server fetch will override with latest
      const cached = localStorage.getItem(`avatar-cache:${uid}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const url = parsed?.dataUrl || parsed?.url;
          if (url) return url;
        } catch {}
      }

      // Fall back to last cache
      const lastCache = localStorage.getItem("avatar-cache:last");
      if (lastCache) {
        try {
          const parsed = JSON.parse(lastCache);
          if (!parsed?.uid || parsed.uid === uid) {
            const url = parsed?.photo;
            if (url) return url;
          }
        } catch {}
      }

      // Temporary fallback to Google photo until server responds
      if (user?.photoURL) return user.photoURL;
      if (auth.currentUser?.photoURL) return auth.currentUser.photoURL;

      return null;
    } catch {
      return null;
    }
  });

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);

  // Update avatarUrl when user.photoURL changes (for preview updates)
  React.useEffect(() => {
    if (user?.photoURL) {
      setAvatarUrl(user.photoURL);
    }
  }, [user?.photoURL]);

  // Listen for avatar updates from other components
  React.useEffect(() => {
    const handleAvatarUpdate = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as {
          uid?: string;
          photo?: string;
        };
        const currentUid = user?.uid || auth.currentUser?.uid;
        if (!detail?.photo) return;
        if (detail.uid && currentUid && detail.uid !== currentUid) return;
        setAvatarUrl(detail.photo);
      } catch {}
    };

    window.addEventListener(
      "avatar-updated",
      handleAvatarUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "avatar-updated",
        handleAvatarUpdate as EventListener
      );
    };
  }, [user?.uid]);

  // Always fetch avatar from server on mount to get the latest custom uploaded photo
  // This ensures database avatar_path (custom uploads) take priority over Google photoURL
  React.useEffect(() => {
    const uid = user?.uid || auth.currentUser?.uid;
    if (!uid) return;

    (async () => {
      try {
        const res = await fetch(
          `/api/avatar-url?userId=${encodeURIComponent(uid)}&expires=300`
        );

        // If server returns a signed URL, it means there's a custom uploaded photo in DB
        if (res.ok) {
          const data = await res.json();
          if (data?.signedUrl) {
            setAvatarUrl(data.signedUrl);
            // Cache it with higher priority
            localStorage.setItem(
              `avatar-cache:${uid}`,
              JSON.stringify({
                url: data.signedUrl,
                fetchedAt: Date.now(),
              })
            );
            localStorage.setItem(
              "avatar-cache:last",
              JSON.stringify({
                uid,
                photo: data.signedUrl,
                fetchedAt: Date.now(),
              })
            );
            window.dispatchEvent(
              new CustomEvent("avatar-updated", {
                detail: { uid, photo: data.signedUrl },
              })
            );
          }
        } else if (res.status === 204) {
          // No custom avatar in DB, fall back to Google photo if available
          if (user?.photoURL) {
            setAvatarUrl(user.photoURL);
          } else if (auth.currentUser?.photoURL) {
            setAvatarUrl(auth.currentUser.photoURL);
          }
        }
      } catch {}
    })();
  }, [user?.uid, user?.photoURL]);

  const handleFileSelect = async (file: File) => {
    if (!onUpload) return;
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  // Generate initials from display name, email, or phone
  const getInitials = () => {
    const name =
      user?.student_name || user?.displayName || user?.email || user?.phone;
    if (!name) return "?";

    // If it&apos;s an email, use the part before @
    if (name.includes("@")) {
      const emailName = name.split("@")[0];
      return emailName.substring(0, 2).toUpperCase();
    }

    // If it&apos;s a phone number, use first 2 digits
    if (/^\+?\d+$/.test(name.replace(/\s/g, ""))) {
      return name.replace(/\D/g, "").substring(0, 2);
    }

    // For names, get first letter of first two words
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarElement = (
    <Avatar
      src={avatarUrl || undefined}
      sx={{
        width: size,
        height: size,
        cursor: editable ? "pointer" : "default",
        opacity: uploading ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
      onClick={() => editable && !uploading && inputRef.current?.click()}
    >
      {!avatarUrl && getInitials()}
    </Avatar>
  );

  return (
    <>
      {showRing ? (
        <Box
          sx={{
            display: "inline-flex",
            borderRadius: "50%",
            padding: "2px", // thin ring
            backgroundImage: "linear-gradient(45deg, #f4d03f, #16a085)",
          }}
        >
          {avatarElement}
        </Box>
      ) : (
        avatarElement
      )}

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      )}
    </>
  );
}
