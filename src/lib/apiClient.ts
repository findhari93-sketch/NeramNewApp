import { getAuth } from "firebase/auth";

export default async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const attempt = async (forceRefresh: boolean) => {
    const token = await user.getIdToken(forceRefresh);
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers });
  };

  // First try without forcing refresh; if server says invalid_token, refresh and retry once.
  let res = await attempt(false);
  if (res.status === 401) {
    try {
      const data = await res
        .clone()
        .json()
        .catch(() => null);
      if (data && data.error === "invalid_token") {
        // small backoff to avoid clock skew edge
        await new Promise((r) => setTimeout(r, 200));
        res = await attempt(true);
      }
    } catch {}
  }
  return res;
}
