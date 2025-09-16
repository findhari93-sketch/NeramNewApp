import { useEffect, useState, useCallback } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Define the shape of your user record (customize as needed)
export interface UserRecord {
  uuid: string;
  [key: string]: any;
}

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useSyncedUser(userId: string) {
  const localKey = `user-cache:${userId}`;
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
    async function fetchUser() {
      if (!userId) return;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", userId)
        .single();
      if (!error && data && isMounted) {
        const userData = data as UserRecord;
        setUserState(userData);
        localStorage.setItem(localKey, JSON.stringify(userData));
      }
    }
    fetchUser();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("user-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `uuid=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setUserState(payload.new as UserRecord);
            localStorage.setItem(localKey, JSON.stringify(payload.new));
          } else if (payload.old) {
            setUserState(null);
            localStorage.removeItem(localKey);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId, localKey]);

  // Setter that updates state, localStorage, and Supabase
  const setUser = useCallback(
    async (newUser: UserRecord) => {
      setUserState(newUser);
      localStorage.setItem(localKey, JSON.stringify(newUser));
      if (userId) {
        await supabase.from("users").update(newUser).eq("uuid", userId);
      }
    },
    [userId, localKey]
  );

  return [user, setUser] as const;
}
