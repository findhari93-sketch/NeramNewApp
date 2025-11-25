/**
 * Session Analytics Helper Functions
 *
 * Utility functions for querying and analyzing session data.
 */

import { createClient } from "@supabase/supabase-js";
import type {
  UserSession,
  SessionStats,
  SessionEvent,
  ActiveSession,
} from "@/types/session";
import { parseInterval, formatDuration } from "./sessionUtils";

// Server-side Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get all sessions for a user
 */
export async function getUserSessions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ sessions: UserSession[]; total: number }> {
  // Get total count
  const { count } = await supabase
    .from("user_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Get sessions
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_start", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[getUserSessions] Error:", error);
    return { sessions: [], total: 0 };
  }

  return {
    sessions: (data || []) as UserSession[],
    total: count || 0,
  };
}

/**
 * Get session events for a specific session
 */
export async function getSessionEvents(
  sessionId: string
): Promise<SessionEvent[]> {
  const { data, error } = await supabase
    .from("session_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("[getSessionEvents] Error:", error);
    return [];
  }

  return (data || []) as SessionEvent[];
}

/**
 * Get user session statistics
 */
export async function getUserStats(
  userId: string,
  daysBack: number = 30
): Promise<SessionStats | null> {
  const { data, error } = await supabase.rpc("get_user_session_stats", {
    p_user_id: userId,
    p_days_back: daysBack,
  });

  if (error) {
    console.error("[getUserStats] Error:", error);
    return null;
  }

  return data && data[0] ? (data[0] as SessionStats) : null;
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(
  userId: string
): Promise<ActiveSession[]> {
  const { data, error } = await supabase.rpc("get_active_sessions", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[getActiveSessions] Error:", error);
    return [];
  }

  return (data || []) as ActiveSession[];
}

/**
 * Get all users with their latest session info
 */
export async function getAllUsersWithSessions(limit: number = 100): Promise<
  Array<{
    user_id: string;
    student_name: string | null;
    email: string | null;
    last_session_start: string | null;
    total_sessions: number;
    total_time: string | null;
  }>
> {
  const { data, error } = await supabase.rpc("get_all_users_with_sessions", {
    p_limit: limit,
  });

  if (error) {
    // Function might not exist, so create a query instead
    const { data: queryData, error: queryError } = await supabase
      .from("user_sessions")
      .select(
        `
        user_id,
        session_start,
        duration_seconds,
        users_duplicate!inner(
          basic,
          contact
        )
      `
      )
      .limit(limit);

    if (queryError) {
      console.error("[getAllUsersWithSessions] Error:", queryError);
      return [];
    }

    // Aggregate manually
    const userMap = new Map<
      string,
      {
        user_id: string;
        student_name: string | null;
        email: string | null;
        last_session_start: string | null;
        total_sessions: number;
        total_time_seconds: number;
      }
    >();

    (queryData || []).forEach((row: any) => {
      const userId = row.user_id;
      const existing = userMap.get(userId);

      if (existing) {
        existing.total_sessions++;
        if (row.duration_seconds) {
          const parsed = parseInterval(row.duration_seconds);
          existing.total_time_seconds += parsed.totalSeconds;
        }
        if (
          !existing.last_session_start ||
          row.session_start > existing.last_session_start
        ) {
          existing.last_session_start = row.session_start;
        }
      } else {
        const parsed = parseInterval(row.duration_seconds);
        userMap.set(userId, {
          user_id: userId,
          student_name: row.users_duplicate?.basic?.student_name || null,
          email: row.users_duplicate?.contact?.email || null,
          last_session_start: row.session_start,
          total_sessions: 1,
          total_time_seconds: parsed.totalSeconds,
        });
      }
    });

    return Array.from(userMap.values()).map((user) => ({
      ...user,
      total_time: formatDuration(user.total_time_seconds),
    }));
  }

  return data || [];
}

/**
 * Get session summary for a date range
 */
export async function getSessionSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  totalSessions: number;
  totalUsers: number;
  totalTime: number; // in seconds
  avgSessionDuration: number; // in seconds
  topSections: Array<{ section: string; count: number }>;
}> {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("user_id, duration_seconds, app_section")
    .gte("session_start", startDate.toISOString())
    .lte("session_start", endDate.toISOString());

  if (error || !data) {
    console.error("[getSessionSummary] Error:", error);
    return {
      totalSessions: 0,
      totalUsers: 0,
      totalTime: 0,
      avgSessionDuration: 0,
      topSections: [],
    };
  }

  const uniqueUsers = new Set<string>();
  let totalSeconds = 0;
  const sectionCounts = new Map<string, number>();

  data.forEach((session) => {
    uniqueUsers.add(session.user_id);

    if (session.duration_seconds) {
      const parsed = parseInterval(session.duration_seconds);
      totalSeconds += parsed.totalSeconds;
    }

    const section = session.app_section || "unknown";
    sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1);
  });

  const topSections = Array.from(sectionCounts.entries())
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSessions: data.length,
    totalUsers: uniqueUsers.size,
    totalTime: totalSeconds,
    avgSessionDuration: data.length > 0 ? totalSeconds / data.length : 0,
    topSections,
  };
}

/**
 * Get hourly session distribution (when users are most active)
 */
export async function getHourlyDistribution(
  daysBack: number = 7
): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("session_start")
    .gte(
      "session_start",
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error || !data) {
    console.error("[getHourlyDistribution] Error:", error);
    return {};
  }

  const hourCounts: Record<number, number> = {};

  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  data.forEach((session) => {
    const hour = new Date(session.session_start).getHours();
    hourCounts[hour]++;
  });

  return hourCounts;
}

/**
 * Get device breakdown (platform statistics)
 */
export async function getDeviceBreakdown(
  daysBack: number = 30
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("device_info")
    .gte(
      "session_start",
      new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error || !data) {
    console.error("[getDeviceBreakdown] Error:", error);
    return {};
  }

  const platformCounts: Record<string, number> = {};

  data.forEach((session) => {
    const platform = (session.device_info as any)?.platform || "Unknown";
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });

  return platformCounts;
}

/**
 * Calculate user engagement score (0-100)
 * Based on: session frequency, duration, and recency
 */
export async function calculateEngagementScore(
  userId: string
): Promise<number> {
  const stats = await getUserStats(userId, 30);

  if (!stats) return 0;

  // Factors:
  // 1. Session frequency (0-40 points)
  const frequencyScore = Math.min(40, (Number(stats.total_sessions) / 30) * 40);

  // 2. Average duration (0-40 points) - target: 5+ minutes
  const avgDuration = parseInterval(stats.avg_session_duration).totalSeconds;
  const durationScore = Math.min(40, (avgDuration / 300) * 40);

  // 3. Recency (0-20 points) - last session within 7 days
  const lastSession = stats.last_session_start
    ? new Date(stats.last_session_start)
    : null;
  const daysSinceLastSession = lastSession
    ? (Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  const recencyScore = Math.max(0, 20 - daysSinceLastSession * 2.86);

  return Math.round(frequencyScore + durationScore + recencyScore);
}

/**
 * Export session data to CSV format
 */
export async function exportSessionsToCSV(userId: string): Promise<string> {
  const { sessions } = await getUserSessions(userId, 1000);

  const headers = [
    "Session ID",
    "Start Time",
    "End Time",
    "Duration (seconds)",
    "Section",
    "Platform",
  ];

  const rows = sessions.map((session) => {
    const duration = session.duration_seconds
      ? parseInterval(session.duration_seconds).totalSeconds.toString()
      : "0";

    return [
      session.id,
      session.session_start,
      session.session_end || "Active",
      duration,
      session.app_section,
      (session.device_info as any)?.platform || "Unknown",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}
