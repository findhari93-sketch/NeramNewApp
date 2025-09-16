export type CachedUser = {
  user: Record<string, any>;
  fetchedAt: number;
} | null;

const CACHE_PREFIX = "user-cache:";

export function readUserCache(
  uid: string,
  ttlMs = 24 * 60 * 60 * 1000
): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUser;
    if (!parsed || !parsed.fetchedAt) return null;
    if (Date.now() - parsed.fetchedAt > ttlMs) return null;
    return parsed.user ?? null;
  } catch {
    return null;
  }
}

export function writeUserCache(uid: string, u: Record<string, any>) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${uid}`,
      JSON.stringify({ user: u, fetchedAt: Date.now() })
    );
  } catch {
    // ignore
  }
}
