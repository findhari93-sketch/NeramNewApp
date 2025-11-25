/**
 * Session Context and Provider
 *
 * React context for managing session tracking across the application.
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { SessionTracker, setGlobalTracker } from "@/lib/SessionTracker";
import { pathToSection } from "@/lib/sessionUtils";
import type { SessionContextValue, SessionStats } from "@/types/session";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: React.ReactNode;
  enableTracking?: boolean;
  autoTrackNavigation?: boolean;
}

export function SessionProvider({
  children,
  enableTracking = true,
  autoTrackNavigation = true,
}: SessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("initial_load");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [trackingEnabled, setTrackingEnabled] =
    useState<boolean>(enableTracking);
  const [userId, setUserId] = useState<string | null>(null);

  const trackerRef = useRef<SessionTracker | null>(null);
  const pathname = usePathname();

  // Listen to Firebase auth state to get user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user's database ID from users_duplicate table
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/session", {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            const dbUserId = data.user?.id;
            if (dbUserId) {
              setUserId(dbUserId);
            }
          }
        } catch (error) {
          console.error("[SessionProvider] Failed to get user ID:", error);
        }
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize tracker when user ID is available
  useEffect(() => {
    if (!userId || !trackingEnabled) {
      // Cleanup existing tracker
      if (trackerRef.current) {
        trackerRef.current.destroy();
        trackerRef.current = null;
        setGlobalTracker(null);
      }
      return;
    }

    // Create new tracker
    const tracker = new SessionTracker({
      userId,
      initialSection: pathToSection(pathname || "/"),
      autoTrackNavigation,
    });

    trackerRef.current = tracker;
    setGlobalTracker(tracker);

    // Subscribe to state changes
    const unsubSectionChange = tracker.onSectionChange((section) => {
      setCurrentSection(section);
    });

    const unsubSessionEnd = tracker.onSessionEnd(() => {
      setIsActive(false);
      setSessionId(null);
    });

    // Update local state
    const state = tracker.getState();
    setSessionId(state.sessionId);
    setCurrentSection(state.currentSection);
    setIsActive(state.isActive);

    // Cleanup on unmount
    return () => {
      unsubSectionChange();
      unsubSessionEnd();
      tracker.destroy();
      setGlobalTracker(null);
    };
  }, [userId, trackingEnabled, pathname, autoTrackNavigation]);

  // Track navigation changes
  useEffect(() => {
    if (!trackerRef.current || !autoTrackNavigation || !pathname) return;

    const newSection = pathToSection(pathname);
    if (newSection !== currentSection) {
      trackerRef.current.changeSectionDebounced(newSection);
    }
  }, [pathname, currentSection, autoTrackNavigation]);

  // Context methods
  const changeSection = useCallback(
    async (section: string, metadata?: Record<string, unknown>) => {
      if (!trackerRef.current) return;
      await trackerRef.current.changeSection(section, metadata);
    },
    []
  );

  const endSession = useCallback(async (metadata?: Record<string, unknown>) => {
    if (!trackerRef.current) return;
    await trackerRef.current.endSession(metadata);
  }, []);

  const logEvent = useCallback(
    async (eventType: string, eventData?: Record<string, unknown>) => {
      if (!trackerRef.current) return;
      await trackerRef.current.logEvent(eventType, eventData);
    },
    []
  );

  const getStats = useCallback(
    async (daysBack: number = 30): Promise<SessionStats | null> => {
      if (!userId) return null;

      try {
        const response = await fetch(
          `/api/sessions/stats?userId=${userId}&daysBack=${daysBack}`
        );

        if (!response.ok) {
          console.error("[SessionProvider] Failed to get stats");
          return null;
        }

        const data = await response.json();
        return data.stats || null;
      } catch (error) {
        console.error("[SessionProvider] Error getting stats:", error);
        return null;
      }
    },
    [userId]
  );

  const contextValue: SessionContextValue = {
    sessionId,
    currentSection,
    isActive,
    changeSection,
    endSession,
    logEvent,
    getStats,
    trackingEnabled,
    setTrackingEnabled,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to use session tracking
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}

/**
 * Hook to log events (convenience hook)
 */
export function useSessionEvent() {
  const { logEvent } = useSession();
  return logEvent;
}

/**
 * Hook to track section manually
 */
export function useTrackSection(
  section: string,
  metadata?: Record<string, unknown>
) {
  const { changeSection } = useSession();

  useEffect(() => {
    changeSection(section, metadata).catch(console.error);
  }, [section, changeSection, metadata]);
}
