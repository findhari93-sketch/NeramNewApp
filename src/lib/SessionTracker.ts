/**
 * Session Tracker Class
 *
 * Client-side session tracking implementation with automatic
 * section tracking, heartbeat, and cleanup.
 */

"use client";

import type {
  SessionTrackerConfig,
  SessionTrackerState,
  SectionChangeCallback,
  SessionEndCallback,
} from "@/types/session";
import {
  getDeviceInfo,
  pathToSection,
  shouldTrackSession,
  sendEndSessionBeacon,
  storeSessionId,
  clearStoredSessionId,
  getStoredSessionId,
  isPageVisible,
  debounce,
} from "./sessionUtils";

export class SessionTracker {
  private config: Required<SessionTrackerConfig>;
  private state: SessionTrackerState;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private sectionChangeCallbacks: Set<SectionChangeCallback> = new Set();
  private sessionEndCallbacks: Set<SessionEndCallback> = new Set();
  private abortController: AbortController | null = null;
  private recovering = false;

  constructor(config: SessionTrackerConfig) {
    this.config = {
      userId: config.userId,
      initialSection: config.initialSection || this.getCurrentSection(),
      autoTrackNavigation: config.autoTrackNavigation ?? true,
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      enableBeacon: config.enableBeacon ?? true,
    };

    this.state = {
      sessionId: getStoredSessionId(),
      currentSection: this.config.initialSection,
      isActive: false,
      startTime: Date.now(),
    };

    // Check if we should track
    if (!shouldTrackSession()) {
      console.log("[SessionTracker] Session tracking disabled");
      return;
    }

    // Initialize session
    this.initializeSession();
  }

  /**
   * Initialize a new session or resume existing one
   */
  private async initializeSession(): Promise<void> {
    try {
      // If we have a stored session ID, try to resume it
      if (this.state.sessionId) {
        console.log("[SessionTracker] Resuming session:", this.state.sessionId);
        this.state.isActive = true;
        this.cleanupListeners();
        this.startHeartbeat();
        this.setupListeners();
        return;
      }

      // Start a new session
      const response = await this.startSession(
        this.config.initialSection,
        getDeviceInfo()
      );

      if (response.ok && response.sessionId) {
        this.state.sessionId = response.sessionId;
        this.state.isActive = true;
        storeSessionId(response.sessionId);
        console.log(
          "[SessionTracker] New session started:",
          response.sessionId
        );

        this.cleanupListeners();
        this.startHeartbeat();
        this.setupListeners();
      } else {
        console.error(
          "[SessionTracker] Failed to start session:",
          response.error
        );
      }
    } catch (error) {
      console.error("[SessionTracker] Initialization error:", error);
    }
  }

  /**
   * Get current section from URL
   */
  private getCurrentSection(): string {
    if (typeof window === "undefined") return "initial_load";
    return pathToSection(window.location.pathname);
  }

  /**
   * Start a new session via API
   */
  private async startSession(
    section: string,
    deviceInfo: unknown
  ): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
    this.abortController = new AbortController();

    try {
      const response = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: this.config.userId,
          section,
          deviceInfo,
        }),
        signal: this.abortController.signal,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return { ok: false, error: "Request aborted" };
      }
      return { ok: false, error: String(error) };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Update current section
   */
  public async changeSection(
    newSection: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.state.sessionId || !this.state.isActive) {
      console.warn("[SessionTracker] No active session");
      return;
    }

    if (newSection === this.state.currentSection) {
      return; // No change
    }

    const oldSection = this.state.currentSection;
    this.state.currentSection = newSection;

    // Notify callbacks
    this.sectionChangeCallbacks.forEach((callback) => {
      try {
        callback(newSection);
      } catch (error) {
        console.error("[SessionTracker] Callback error:", error);
      }
    });

    // Update section via API
    try {
      const response = await fetch("/api/sessions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.state.sessionId,
          section: newSection,
          metadata,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        console.error("[SessionTracker] Failed to update section:", data.error);
        await this.maybeRecoverFromError("change_section", data.error);
      } else {
        console.log(
          `[SessionTracker] Section changed: ${oldSection} -> ${newSection}`
        );
      }
    } catch (error) {
      console.error("[SessionTracker] Error updating section:", error);
      await this.maybeRecoverFromError("change_section", error);
    }
  }

  /**
   * Debounced section change (useful for rapid navigation)
   */
  public changeSectionDebounced = debounce(this.changeSection.bind(this), 1000);

  /**
   * Log custom event
   */
  public async logEvent(
    eventType: string,
    eventData?: Record<string, unknown>
  ): Promise<void> {
    if (!this.state.sessionId || !this.state.isActive) {
      console.warn("[SessionTracker] No active session");
      return;
    }

    try {
      const response = await fetch("/api/sessions/log-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.state.sessionId,
          eventType,
          eventData,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        console.error("[SessionTracker] Failed to log event:", data.error);
        await this.maybeRecoverFromError("log_event", data.error);
      }
    } catch (error) {
      console.error("[SessionTracker] Error logging event:", error);
      await this.maybeRecoverFromError("log_event", error);
    }
  }

  /**
   * End the current session
   */
  public async endSession(metadata?: Record<string, unknown>): Promise<void> {
    if (!this.state.sessionId || !this.state.isActive) {
      return;
    }

    this.state.isActive = false;
    this.stopHeartbeat();

    // Notify callbacks
    this.sessionEndCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("[SessionTracker] Callback error:", error);
      }
    });

    try {
      const response = await fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.state.sessionId,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        console.log("[SessionTracker] Session ended:", this.state.sessionId);
      } else {
        console.error("[SessionTracker] Failed to end session:", data.error);
        await this.maybeRecoverFromError("end_session", data.error);
      }
    } catch (error) {
      console.error("[SessionTracker] Error ending session:", error);
      await this.maybeRecoverFromError("end_session", error);
    } finally {
      clearStoredSessionId();
      this.state.sessionId = null;
    }
  }

  /**
   * Start heartbeat to keep session alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;

    this.heartbeatTimer = setInterval(() => {
      // Only send heartbeat if page is visible
      if (!isPageVisible()) return;

      this.logEvent("heartbeat", {
        section: this.state.currentSection,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Setup event listeners for automatic tracking
   */
  private setupListeners(): void {
    if (typeof window === "undefined") return;

    this.cleanupListeners();

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        this.logEvent("page_hidden").catch(console.error);
      } else {
        this.logEvent("page_visible").catch(console.error);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Track beforeunload (user leaving page)
    const handleBeforeUnload = () => {
      if (this.config.enableBeacon && this.state.sessionId) {
        sendEndSessionBeacon(this.state.sessionId, {
          reason: "page_unload",
          timestamp: new Date().toISOString(),
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

    // Store cleanup for later
    (this as any)._cleanup = cleanup;
  }

  /**
   * Subscribe to section changes
   */
  public onSectionChange(callback: SectionChangeCallback): () => void {
    this.sectionChangeCallbacks.add(callback);
    return () => this.sectionChangeCallbacks.delete(callback);
  }

  /**
   * Subscribe to session end
   */
  public onSessionEnd(callback: SessionEndCallback): () => void {
    this.sessionEndCallbacks.add(callback);
    return () => this.sessionEndCallbacks.delete(callback);
  }

  /**
   * Get current state
   */
  public getState(): Readonly<SessionTrackerState> {
    return { ...this.state };
  }

  /**
   * Check if session is active
   */
  public isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get session ID
   */
  public getSessionId(): string | null {
    return this.state.sessionId;
  }

  /**
   * Cleanup and destroy tracker
   */
  public destroy(): void {
    this.stopHeartbeat();

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.cleanupListeners();

    this.sectionChangeCallbacks.clear();
    this.sessionEndCallbacks.clear();

    console.log("[SessionTracker] Tracker destroyed");
  }

  /**
   * Remove any registered DOM event listeners
   */
  private cleanupListeners(): void {
    const cleanup = (this as any)._cleanup as (() => void) | undefined;
    if (cleanup) {
      cleanup();
      delete (this as any)._cleanup;
    }
  }

  /**
   * Reset tracker state when stored session no longer exists server-side
   */
  private async recoverSession(reason: string): Promise<void> {
    if (this.recovering) return;
    this.recovering = true;

    try {
      console.warn(`[SessionTracker] Resetting session due to ${reason}`);
      this.stopHeartbeat();
      this.cleanupListeners();
      clearStoredSessionId();
      this.state.sessionId = null;
      this.state.isActive = false;
      this.state.currentSection = this.getCurrentSection();
      this.state.startTime = Date.now();

      await this.initializeSession();
    } finally {
      this.recovering = false;
    }
  }

  /**
   * Inspect error messages and trigger session recovery when appropriate
   */
  private async maybeRecoverFromError(
    source: string,
    error: unknown
  ): Promise<void> {
    const message =
      typeof error === "string"
        ? error
        : error instanceof Error
        ? error.message
        : "";

    if (!message) return;

    const normalized = message.toLowerCase();
    const foreignKeyViolation = normalized.includes(
      "session_events_session_id_fkey"
    );
    const sessionMissing =
      foreignKeyViolation || normalized.includes("session not found");

    if (sessionMissing) {
      await this.recoverSession(`${source}: missing session`);
    }
  }
}

/**
 * Singleton instance for global access
 */
let globalTracker: SessionTracker | null = null;

export function getGlobalTracker(): SessionTracker | null {
  return globalTracker;
}

export function setGlobalTracker(tracker: SessionTracker | null): void {
  if (globalTracker) {
    globalTracker.destroy();
  }
  globalTracker = tracker;
}
