// client helper: upload file via server endpoint and fetch signed URL
export async function uploadAvatarToServer(file: File, userId: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("userId", userId);

  const res = await fetch("/api/upload/avatar", {
    method: "POST",
    body: fd,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Upload failed");
  // server returns { path }
  return j.path as string;
}

export async function getAvatarSignedUrl(userId: string, expires = 60) {
  const res = await fetch(
    `/api/avatar-url?userId=${encodeURIComponent(userId)}&expires=${Number(
      expires
    )}`
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Failed to fetch signed url");
  return j?.signedUrl as string | null;
}
