/**
 * Session Utility Functions
 *
 * Helper functions for session tracking.
 */

import type { DeviceInfo, ParsedInterval } from "@/types/session";

/**
 * Collects device and browser information for session tracking
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      userAgent: "server",
      platform: "server",
      screenWidth: 0,
      screenHeight: 0,
    };
  }

  const deviceInfo: DeviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };

  // Add screen orientation
  try {
    deviceInfo.screenOrientation =
      window.screen.width > window.screen.height ? "landscape" : "portrait";
  } catch {}

  // Add language
  try {
    deviceInfo.language = navigator.language;
  } catch {}

  // Add timezone
  try {
    deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {}

  // Add connection info (if available)
  try {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
      };
    };
    if (nav.connection) {
      deviceInfo.connection = {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
      };
    }
  } catch {}

  return deviceInfo;
}

/**
 * Parse PostgreSQL interval string to seconds
 * Example: "01:23:45" -> 5025 seconds
 * Example: "2 days 03:30:00" -> 185400 seconds
 */
export function parseInterval(interval: string | null): ParsedInterval {
  if (!interval) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Parse days if present
  const daysMatch = interval.match(/(\d+)\s+days?/);
  if (daysMatch) {
    days = parseInt(daysMatch[1], 10);
  }

  // Parse time component (HH:MM:SS or HH:MM:SS.ffffff)
  const timeMatch = interval.match(/(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    seconds = parseFloat(timeMatch[3]);
  }

  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}

/**
 * Format seconds into human-readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

/**
 * Map URL pathname to section name
 */
export function pathToSection(pathname: string): string {
  // Remove query params and hash
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Define section mappings
  const sectionMappings: Record<string, string> = {
    "/": "home",
    "/dashboard": "dashboard",
    "/profile": "profile",
    "/nata-cutoff-calculator": "nata_calculator",
    "/premium": "premium",
    "/asksenior": "asksenior",
    "/jee2": "jee2",
    "/nata": "nata",
    "/auth/login": "auth_login",
    "/auth/signup": "auth_signup",
    "/pay": "payment",
  };

  // Exact match
  if (sectionMappings[cleanPath]) {
    return sectionMappings[cleanPath];
  }

  // Prefix match for dynamic routes
  for (const [prefix, section] of Object.entries(sectionMappings)) {
    if (cleanPath.startsWith(prefix) && prefix !== "/") {
      return section;
    }
  }

  // Fallback: use first path segment
  const segments = cleanPath.split("/").filter(Boolean);
  return segments[0] || "home";
}

/**
 * Check if session tracking should be enabled
 * (e.g., user has consented, not a bot, etc.)
 */
export function shouldTrackSession(): boolean {
  if (typeof window === "undefined") return false;

  // Check if user has opted out
  try {
    const optOut = localStorage.getItem("session_tracking_opt_out");
    if (optOut === "true") return false;
  } catch {}

  // Check if it's a bot (basic check)
  const userAgent = navigator.userAgent.toLowerCase();
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "headless",
    "phantom",
    "puppeteer",
  ];

  for (const pattern of botPatterns) {
    if (userAgent.includes(pattern)) return false;
  }

  return true;
}

/**
 * Send session end beacon before page unload
 * Uses navigator.sendBeacon for reliability
 */
export function sendEndSessionBeacon(
  sessionId: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;

  try {
    const payload = JSON.stringify({
      sessionId,
      metadata,
    });

    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/sessions/end", blob);
  } catch (error) {
    console.error("[SessionTracker] Failed to send beacon:", error);
  }
}

/**
 * Throttle function to limit API calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function for section changes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Get stored session ID from localStorage (if any)
 */
export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem("active_session_id");
  } catch {
    return null;
  }
}

/**
 * Store session ID in localStorage
 */
export function storeSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("active_session_id", sessionId);
  } catch (error) {
    console.error("[SessionTracker] Failed to store session ID:", error);
  }
}

/**
 * Clear stored session ID
 */
export function clearStoredSessionId(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("active_session_id");
  } catch (error) {
    console.error("[SessionTracker] Failed to clear session ID:", error);
  }
}

/**
 * Check if page is currently visible
 */
export function isPageVisible(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

/**
 * Calculate time spent on current section
 */
export function getTimeSpent(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000);
}
