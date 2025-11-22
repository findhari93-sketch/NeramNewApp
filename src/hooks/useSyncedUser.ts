import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  mapFromUsersDuplicate,
  mapToUsersDuplicate,
  type UsersDuplicateRow,
} from "../lib/userFieldMapping";
import apiClient from "../lib/apiClient";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { clearAllAuthCaches } from "../lib/clearAuthCache";

// Define the shape of your user record (customize as needed)
export interface UserRecord {
  uuid: string;
  [key: string]: any;
}

export function useSyncedUser(userId: string) {
  const localKey = `user-cache:${userId}`;
  const resolvedIdRef = useRef<string | null>(null);
  const [user, setUserState] = useState<UserRecord | null>(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Fetch latest user from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    let activeChannel: any = null;
    async function fetchUser() {
      if (!userId) return;
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let dbId: string | null = null;

      try {
        if (uuidRegex.test(userId)) {
          dbId = userId;
        } else {
          // resolve firebase uid to Supabase row
          try {
            const flat = await fetchUserByFirebaseUid(userId);
            if (flat && flat.id) {
              dbId = flat.id;
              if (isMounted) {
                setUserState(flat as UserRecord);
                localStorage.setItem(localKey, JSON.stringify(flat));
              }
            }
          } catch {
            // ignore resolution errors and continue; we'll fall back
          }
        }

        if (dbId) {
          resolvedIdRef.current = dbId;
          const { data, error } = await supabase
            .from("users_duplicate")
            .select("*")
            .eq("id", dbId)
            .single();

          // CRITICAL: If user not found (deleted), sign out immediately
          if (error && error.code === "PGRST116" && isMounted) {
            console.warn(
              "[useSyncedUser] User not found in database (deleted), signing out..."
            );
            try {
              await clearAllAuthCaches();
              await signOut(auth);
              if (typeof window !== "undefined") {
                window.location.href = "/auth/login?error=account_deleted";
              }
            } catch (e) {
              console.error("[useSyncedUser] Error during forced logout:", e);
            }
            return;
          }

          if (!error && data && isMounted) {
            const flatUser = mapFromUsersDuplicate(data as UsersDuplicateRow);
            setUserState(flatUser as UserRecord);
            localStorage.setItem(localKey, JSON.stringify(flatUser));
          }
        }
      } catch {
        // ignore fetch errors
      }
    }
    fetchUser();

    // Subscribe to realtime changes
    // subscribe when we have a resolved Supabase id
    const setupSubscription = async () => {
      try {
        const dbId = resolvedIdRef.current;
        if (!dbId) return;
        activeChannel = supabase
          .channel("user-sync")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "users_duplicate",
              filter: `id=eq.${dbId}`,
            },
            async (payload: any) => {
              if (payload.new) {
                const flatUser = mapFromUsersDuplicate(
                  payload.new as UsersDuplicateRow
                );
                setUserState(flatUser as UserRecord);
                localStorage.setItem(localKey, JSON.stringify(flatUser));
              } else if (payload.old && payload.eventType === "DELETE") {
                // CRITICAL: User was deleted from database
                // Sign out immediately and clear all caches
                console.warn(
                  "[useSyncedUser] User deleted from database, signing out..."
                );
                setUserState(null);
                localStorage.removeItem(localKey);

                try {
                  await clearAllAuthCaches();
                  await signOut(auth);
                  // Redirect to login with error message
                  if (typeof window !== "undefined") {
                    window.location.href = "/auth/login?error=account_deleted";
                  }
                } catch (e) {
                  console.error(
                    "[useSyncedUser] Error during forced logout on user deletion:",
                    e
                  );
                }
              } else if (payload.old) {
                // Handle other cases where payload.old exists but not DELETE
                setUserState(null);
                localStorage.removeItem(localKey);
              }
            }
          )
          .subscribe();
      } catch {
        /* ignore */
      }
    };

    // wait a tick to allow fetchUser to resolve and set resolvedIdRef
    const t = setTimeout(() => void setupSubscription(), 250);

    return () => {
      isMounted = false;
      clearTimeout(t);
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [userId, localKey]);

  // Setter that updates state, localStorage, and Supabase
  const setUser = useCallback(
    async (newUser: UserRecord) => {
      setUserState(newUser);
      localStorage.setItem(localKey, JSON.stringify(newUser));
      // Prefer updating by resolved Supabase id. If none, fall back to server upsert.
      const mapped = mapToUsersDuplicate(newUser);
      const dbId = resolvedIdRef.current;
      try {
        if (dbId) {
          await supabase.from("users_duplicate").update(mapped).eq("id", dbId);
        } else if (
          userId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            userId
          )
        ) {
          // userId looks like a UUID
          await supabase
            .from("users_duplicate")
            .update(mapped)
            .eq("id", userId);
        } else {
          // No Supabase id available — call server upsert which can map firebase_uid -> id
          await apiClient("/api/users/upsert", {
            method: "POST",
            body: JSON.stringify(newUser),
          });
        }
      } catch {
        // ignore update errors here; callers may handle if needed
      }
    },
    [userId, localKey]
  );

  return [user, setUser] as const;
}

// When reading a user row for a firebase uid, query the users_duplicate table and map grouped jsonb into one object.
export async function fetchUserByFirebaseUid(firebaseUid: string) {
  // Query users_duplicate where account->>firebase_uid = firebaseUid
  const { data, error } = await supabase
    .from("users_duplicate")
    .select("*")
    .filter("account->>firebase_uid", "eq", firebaseUid)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  // Use mapping helper to convert to flat structure
  return mapFromUsersDuplicate(data as UsersDuplicateRow);
}
