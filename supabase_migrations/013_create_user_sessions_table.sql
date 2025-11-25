-- Migration: User Session Tracking System
-- Description: Tracks user sessions, time spent in app sections, and device information
-- Created: 2025-11-25

-- =============================================================================
-- 1. CREATE SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users_duplicate(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTERVAL,
    app_section TEXT DEFAULT 'initial_load',
    device_info JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON public.user_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, session_end) WHERE session_end IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_app_section ON public.user_sessions(app_section);

-- Add comment
COMMENT ON TABLE public.user_sessions IS 'Tracks user session details including time spent and app sections visited';

-- Optional: index to speed up lookup by firebase_uid in JSONB
CREATE INDEX IF NOT EXISTS idx_users_duplicate_firebase_uid
ON public.users_duplicate ((account ->> 'firebase_uid'));

-- =============================================================================
-- 2. CREATE SESSION EVENTS TABLE (for detailed section tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'section_change', 'interaction', 'custom'
    event_data JSONB DEFAULT '{}'::JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON public.session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_timestamp ON public.session_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_type ON public.session_events(event_type);

COMMENT ON TABLE public.session_events IS 'Stores granular events within user sessions for detailed analytics';

-- =============================================================================
-- 3. FUNCTION: Start a new user session
-- =============================================================================

CREATE OR REPLACE FUNCTION public.start_user_session(
    p_user_id UUID,
    p_section TEXT DEFAULT 'initial_load',
    p_device_info JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- End any existing active sessions for this user (cleanup stale sessions)
    UPDATE public.user_sessions
    SET session_end = NOW(),
        duration_seconds = NOW() - session_start,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND session_end IS NULL;

    -- Create new session
    INSERT INTO public.user_sessions (
        user_id,
        session_start,
        app_section,
        device_info,
        metadata
    ) VALUES (
        p_user_id,
        NOW(),
        p_section,
        COALESCE(p_device_info, '{}'::JSONB),
        jsonb_build_object(
            'section_history', jsonb_build_array(p_section),
            'section_timestamps', jsonb_build_object(p_section, NOW()::TEXT)
        )
    ) RETURNING id INTO v_session_id;

    -- Log initial section event
    INSERT INTO public.session_events (session_id, event_type, event_data)
    VALUES (v_session_id, 'session_start', jsonb_build_object('section', p_section));

    RETURN v_session_id;
END;
$$;

COMMENT ON FUNCTION public.start_user_session IS 'Initializes a new user session and returns session ID';

-- =============================================================================
-- 4. FUNCTION: Update session section (track navigation)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_session_section(
    p_session_id UUID,
    p_new_section TEXT,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_metadata JSONB;
    v_section_history JSONB;
    v_section_timestamps JSONB;
BEGIN
    -- Get current metadata
    SELECT metadata INTO v_current_metadata
    FROM public.user_sessions
    WHERE id = p_session_id;

    -- Extract and update section history
    v_section_history := COALESCE(v_current_metadata->'section_history', '[]'::JSONB);
    v_section_history := v_section_history || to_jsonb(p_new_section);

    -- Extract and update section timestamps
    v_section_timestamps := COALESCE(v_current_metadata->'section_timestamps', '{}'::JSONB);
    v_section_timestamps := v_section_timestamps || jsonb_build_object(p_new_section, NOW()::TEXT);

    -- Update session
    UPDATE public.user_sessions
    SET 
        app_section = p_new_section,
        metadata = jsonb_build_object(
            'section_history', v_section_history,
            'section_timestamps', v_section_timestamps
        ) || COALESCE(p_metadata, '{}'::JSONB),
        updated_at = NOW()
    WHERE id = p_session_id;

    -- Log section change event
    INSERT INTO public.session_events (session_id, event_type, event_data)
    VALUES (
        p_session_id,
        'section_change',
        jsonb_build_object(
            'section', p_new_section,
            'additional_data', COALESCE(p_metadata, '{}'::JSONB)
        )
    );
END;
$$;

COMMENT ON FUNCTION public.update_session_section IS 'Updates current session section and tracks navigation history';

-- =============================================================================
-- 5. FUNCTION: End user session
-- =============================================================================

CREATE OR REPLACE FUNCTION public.end_user_session(
    p_session_id UUID,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_sessions
    SET 
        session_end = NOW(),
        duration_seconds = NOW() - session_start,
        metadata = COALESCE(metadata, '{}'::JSONB) || COALESCE(p_metadata, '{}'::JSONB),
        updated_at = NOW()
    WHERE id = p_session_id
      AND session_end IS NULL;

    -- Log session end event
    INSERT INTO public.session_events (session_id, event_type, event_data)
    VALUES (p_session_id, 'session_end', COALESCE(p_metadata, '{}'::JSONB));
END;
$$;

COMMENT ON FUNCTION public.end_user_session IS 'Ends an active session and calculates duration';

-- =============================================================================
-- 6. FUNCTION: Get user session statistics
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_session_stats(
    p_user_id UUID,
    p_days_back INT DEFAULT 30
) RETURNS TABLE (
    total_sessions BIGINT,
    total_time INTERVAL,
    avg_session_duration INTERVAL,
    most_used_sections JSONB,
    last_session_start TIMESTAMP WITH TIME ZONE,
    active_sessions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH session_stats AS (
        SELECT
            COUNT(*) AS total_sessions_count,
            SUM(COALESCE(duration_seconds, NOW() - session_start)) AS total_time_sum,
            AVG(COALESCE(duration_seconds, NOW() - session_start)) AS avg_duration,
            MAX(session_start) AS last_start,
            COUNT(*) FILTER (WHERE session_end IS NULL) AS active_count
        FROM public.user_sessions
        WHERE user_id = p_user_id
          AND session_start > NOW() - (p_days_back || ' days')::INTERVAL
    ),
    section_usage AS (
        SELECT jsonb_object_agg(
            app_section,
            section_count
        ) AS sections
        FROM (
            SELECT 
                app_section,
                COUNT(*) AS section_count
            FROM public.user_sessions
            WHERE user_id = p_user_id
              AND session_start > NOW() - (p_days_back || ' days')::INTERVAL
            GROUP BY app_section
            ORDER BY section_count DESC
            LIMIT 10
        ) AS top_sections
    )
    SELECT
        ss.total_sessions_count,
        ss.total_time_sum,
        ss.avg_duration,
        COALESCE(su.sections, '{}'::JSONB),
        ss.last_start,
        ss.active_count
    FROM session_stats ss
    CROSS JOIN section_usage su;
END;
$$;

COMMENT ON FUNCTION public.get_user_session_stats IS 'Returns aggregated session statistics for a user';

-- =============================================================================
-- 7. FUNCTION: Get active sessions for a user
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_active_sessions(
    p_user_id UUID
) RETURNS TABLE (
    session_id UUID,
    session_start TIMESTAMP WITH TIME ZONE,
    app_section TEXT,
    device_info JSONB,
    duration_so_far INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        user_sessions.session_start,
        user_sessions.app_section,
        user_sessions.device_info,
        NOW() - user_sessions.session_start AS duration_so_far
    FROM public.user_sessions
    WHERE user_id = p_user_id
      AND session_end IS NULL
    ORDER BY user_sessions.session_start DESC;
END;
$$;

COMMENT ON FUNCTION public.get_active_sessions IS 'Returns all active (not ended) sessions for a user';

-- =============================================================================
-- 8. FUNCTION: Log custom session event
-- =============================================================================

CREATE OR REPLACE FUNCTION public.log_session_event(
    p_session_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.session_events (session_id, event_type, event_data)
    VALUES (p_session_id, p_event_type, COALESCE(p_event_data, '{}'::JSONB))
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION public.log_session_event IS 'Logs a custom event within a session';

-- =============================================================================
-- 9. VIEW: Recent sessions with user details
-- =============================================================================

CREATE OR REPLACE VIEW public.recent_sessions_view AS
SELECT
    us.id AS session_id,
    us.user_id,
    ud.basic->>'student_name' AS student_name,
    ud.contact->>'email' AS email,
    us.session_start,
    us.session_end,
    us.duration_seconds,
    us.app_section,
    us.device_info,
    (us.metadata->'section_history') AS section_history,
    COUNT(se.id) AS event_count
FROM public.user_sessions us
LEFT JOIN public.users_duplicate ud ON us.user_id = ud.id
LEFT JOIN public.session_events se ON us.id = se.session_id
GROUP BY us.id, us.user_id, ud.basic, ud.contact, us.session_start,
         us.session_end, us.duration_seconds, us.app_section,
         us.device_info, us.metadata
ORDER BY us.session_start DESC;

COMMENT ON VIEW public.recent_sessions_view IS 'Provides a comprehensive view of recent sessions with user details';

-- =============================================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.user_sessions
    FOR SELECT
    USING (
        user_id IN (
            SELECT id
            FROM public.users_duplicate
            WHERE (account ->> 'firebase_uid') = auth.uid()::text
        )
    );

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can create own sessions"
    ON public.user_sessions
    FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id
            FROM public.users_duplicate
            WHERE (account ->> 'firebase_uid') = auth.uid()::text
        )
    );

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON public.user_sessions
    FOR UPDATE
    USING (
        user_id IN (
            SELECT id
            FROM public.users_duplicate
            WHERE (account ->> 'firebase_uid') = auth.uid()::text
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id
            FROM public.users_duplicate
            WHERE (account ->> 'firebase_uid') = auth.uid()::text
        )
    );

-- Policy: Service role can manage all sessions (for server-side operations)
CREATE POLICY "Service role full access to sessions"
    ON public.user_sessions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can view events for their sessions
CREATE POLICY "Users can view own session events"
    ON public.session_events
    FOR SELECT
    USING (
        session_id IN (
            SELECT id
            FROM public.user_sessions
            WHERE user_id IN (
                SELECT id
                FROM public.users_duplicate
                WHERE (account ->> 'firebase_uid') = auth.uid()::text
            )
        )
    );

-- Policy: Service role full access to events
CREATE POLICY "Service role full access to events"
    ON public.session_events
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- 11. TRIGGER: Auto-update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 12. DATA RETENTION: Auto-cleanup old sessions (optional)
-- =============================================================================

-- Function to cleanup old session data (run periodically via cron or scheduled job)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions(
    p_days_to_keep INT DEFAULT 90
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete sessions older than specified days
    WITH deleted AS (
        DELETE FROM public.user_sessions
        WHERE session_start < NOW() - (p_days_to_keep || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;

    RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_sessions IS 'Deletes session data older than specified days (default 90). Run periodically.';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
