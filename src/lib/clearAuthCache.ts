/**
 * Centralized utility to clear all authentication-related caches
 * Ensures deleted/logged-out users cannot access cached data
 */

/**
 * Clear all authentication and user-related caches from browser storage
 * This includes:
 * - localStorage (user cache, avatar cache, tokens, flags)
 * - IndexedDB (Firebase auth state)
 * - sessionStorage (temporary session data)
 */
export async function clearAllAuthCaches(): Promise<void> {
  // 1. Clear all localStorage entries related to auth/user data
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const keysToRemove: string[] = [];

      // Collect all keys that match our cache patterns
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Remove user cache entries
          if (key.startsWith("user-cache:")) keysToRemove.push(key);
          // Remove avatar cache entries
          else if (key.startsWith("avatar-cache:")) keysToRemove.push(key);
          // Remove Firebase token if manually stored
          else if (key === "firebase_id_token") keysToRemove.push(key);
          // Remove phone verification flag
          else if (key === "phone_verified") keysToRemove.push(key);
          // Remove any other auth-related flags
          else if (key === "email_verified") keysToRemove.push(key);
          else if (key.startsWith("auth_")) keysToRemove.push(key);
        }
      }

      // Remove all collected keys
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove localStorage key: ${key}`, e);
        }
      });

      console.log(`[clearAuthCache] Cleared ${keysToRemove.length} localStorage entries`);
    }
  } catch (e) {
    console.warn("[clearAuthCache] Failed to clear localStorage", e);
  }

  // 2. Clear sessionStorage
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.clear();
      console.log("[clearAuthCache] Cleared sessionStorage");
    }
  } catch (e) {
    console.warn("[clearAuthCache] Failed to clear sessionStorage", e);
  }

  // 3. Clear Firebase IndexedDB databases
  try {
    if (typeof window !== "undefined" && window.indexedDB) {
      // Firebase typically uses these database names
      const firebaseDbNames = [
        "firebaseLocalStorageDb",
        "firebase-heartbeat-database",
        "firebase-installations-database",
      ];

      const deletionPromises = firebaseDbNames.map(
        (dbName) =>
          new Promise<void>((resolve) => {
            try {
              const request = indexedDB.deleteDatabase(dbName);
              request.onsuccess = () => {
                console.log(`[clearAuthCache] Deleted IndexedDB: ${dbName}`);
                resolve();
              };
              request.onerror = () => {
                console.warn(`[clearAuthCache] Failed to delete IndexedDB: ${dbName}`);
                resolve(); // Don't fail the entire operation
              };
              request.onblocked = () => {
                console.warn(`[clearAuthCache] Blocked from deleting IndexedDB: ${dbName}`);
                resolve(); // Don't fail the entire operation
              };
            } catch (e) {
              console.warn(`[clearAuthCache] Error deleting IndexedDB: ${dbName}`, e);
              resolve();
            }
          })
      );

      await Promise.all(deletionPromises);
    }
  } catch (e) {
    console.warn("[clearAuthCache] Failed to clear IndexedDB", e);
  }

  // 4. Clear service worker caches (if any)
  try {
    if (typeof window !== "undefined" && "caches" in window) {
      const cacheNames = await caches.keys();
      const deletions = cacheNames.map((cacheName) => {
        if (cacheName.includes("user") || cacheName.includes("auth")) {
          return caches.delete(cacheName);
        }
        return Promise.resolve(false);
      });
      await Promise.all(deletions);
      console.log("[clearAuthCache] Cleared service worker caches");
    }
  } catch (e) {
    console.warn("[clearAuthCache] Failed to clear service worker caches", e);
  }

  console.log("[clearAuthCache] All auth caches cleared successfully");
}

/**
 * Clear cache for a specific user by their UID
 * Useful when you want to invalidate cache for a single user without logging out
 */
export function clearUserCache(uid: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(`user-cache:${uid}`);
      localStorage.removeItem(`avatar-cache:${uid}`);
      console.log(`[clearUserCache] Cleared cache for user: ${uid}`);
    }
  } catch (e) {
    console.warn(`[clearUserCache] Failed to clear cache for user: ${uid}`, e);
  }
}
