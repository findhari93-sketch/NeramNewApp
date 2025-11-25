/**
 * User Session Tracking Types
 *
 * Type definitions for the session tracking system.
 */

// =============================================================================
// Core Session Types
// =============================================================================

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  screenOrientation?: "portrait" | "landscape";
  language?: string;
  timezone?: string;
  connection?: {
    effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
    downlink?: number;
    rtt?: number;
  };
}

export interface SessionMetadata {
  section_history?: string[];
  section_timestamps?: Record<string, string>;
  [key: string]: unknown;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_start: string; // ISO timestamp
  session_end: string | null; // ISO timestamp
  duration_seconds: string | null; // PostgreSQL interval as string
  app_section: string;
  device_info: DeviceInfo;
  metadata: SessionMetadata;
  created_at: string;
  updated_at: string;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  event_type:
    | "session_start"
    | "section_change"
    | "session_end"
    | "interaction"
    | "custom";
  event_data: Record<string, unknown>;
  timestamp: string; // ISO timestamp
}

// =============================================================================
// Session Statistics Types
// =============================================================================

export interface SessionStats {
  total_sessions: number;
  total_time: string; // PostgreSQL interval
  avg_session_duration: string; // PostgreSQL interval
  most_used_sections: Record<string, number>;
  last_session_start: string | null;
  active_sessions: number;
}

export interface ActiveSession {
  session_id: string;
  session_start: string;
  app_section: string;
  device_info: DeviceInfo;
  duration_so_far: string; // PostgreSQL interval
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface StartSessionRequest {
  userId: string;
  section?: string;
  deviceInfo?: Partial<DeviceInfo>;
}

export interface StartSessionResponse {
  ok: boolean;
  sessionId?: string;
  error?: string;
}

export interface UpdateSectionRequest {
  sessionId: string;
  section: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSectionResponse {
  ok: boolean;
  error?: string;
}

export interface EndSessionRequest {
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface EndSessionResponse {
  ok: boolean;
  error?: string;
}

export interface LogEventRequest {
  sessionId: string;
  eventType: string;
  eventData?: Record<string, unknown>;
}

export interface LogEventResponse {
  ok: boolean;
  eventId?: string;
  error?: string;
}

export interface GetStatsRequest {
  userId: string;
  daysBack?: number;
}

export interface GetStatsResponse {
  ok: boolean;
  stats?: SessionStats;
  error?: string;
}

// =============================================================================
// Client Session Tracker Types
// =============================================================================

export interface SessionTrackerConfig {
  userId: string;
  initialSection?: string;
  autoTrackNavigation?: boolean;
  heartbeatInterval?: number; // milliseconds
  enableBeacon?: boolean;
}

export interface SessionTrackerState {
  sessionId: string | null;
  currentSection: string;
  isActive: boolean;
  startTime: number;
}

export type SectionChangeCallback = (section: string) => void;
export type SessionEndCallback = () => void;

// =============================================================================
// React Hook Types
// =============================================================================

export interface UseSessionReturn {
  sessionId: string | null;
  currentSection: string;
  isActive: boolean;
  changeSection: (
    section: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  endSession: (metadata?: Record<string, unknown>) => Promise<void>;
  logEvent: (
    eventType: string,
    eventData?: Record<string, unknown>
  ) => Promise<void>;
  getStats: (daysBack?: number) => Promise<SessionStats | null>;
}

export interface SessionContextValue extends UseSessionReturn {
  trackingEnabled: boolean;
  setTrackingEnabled: (enabled: boolean) => void;
}

// =============================================================================
// Navigation Tracking Types
// =============================================================================

export interface RouteChangeEvent {
  from: string;
  to: string;
  timestamp: number;
}

export interface SectionMapping {
  [path: string]: string;
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface SessionAnalytics {
  userId: string;
  period: "day" | "week" | "month" | "year";
  totalSessions: number;
  totalTime: number; // in seconds
  averageSessionDuration: number; // in seconds
  topSections: Array<{
    section: string;
    count: number;
    percentage: number;
  }>;
  peakUsageHours: number[];
  deviceBreakdown: Record<string, number>;
}

// =============================================================================
// Database Function Parameter Types
// =============================================================================

export interface StartSessionParams {
  p_user_id: string;
  p_section?: string;
  p_device_info?: DeviceInfo;
}

export interface UpdateSectionParams {
  p_session_id: string;
  p_new_section: string;
  p_metadata?: Record<string, unknown>;
}

export interface EndSessionParams {
  p_session_id: string;
  p_metadata?: Record<string, unknown>;
}

export interface GetStatsParams {
  p_user_id: string;
  p_days_back?: number;
}

export interface LogEventParams {
  p_session_id: string;
  p_event_type: string;
  p_event_data?: Record<string, unknown>;
}

// =============================================================================
// Utility Types
// =============================================================================

export type IntervalString = string; // PostgreSQL interval format
export type ISOTimestamp = string;
export type UUID = string;

// Helper to parse PostgreSQL intervals to seconds
export interface ParsedInterval {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
