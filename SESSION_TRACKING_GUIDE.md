# User Session Tracking Implementation Guide

## Overview

This guide will help you implement comprehensive user session tracking in your Neram Classes application. The system tracks:

- User session start/end times
- Time spent in different app sections
- Device and browser information
- Custom events and interactions
- Session analytics and statistics

---

## 📋 Prerequisites

- Supabase account with access to SQL Editor
- Access to Vercel/deployment platform environment variables
- Firebase Authentication configured
- Next.js app with TypeScript

---

## 🚀 Implementation Steps

### Step 1: Run Database Migration (Supabase Console)

1. **Open Supabase SQL Editor**

   - Go to: https://app.supabase.com
   - Select your project
   - Navigate to: **SQL Editor**

2. **Run the Migration**

   - Open the file: `supabase_migrations/013_create_user_sessions_table.sql`
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify Tables Created**

   - Navigate to: **Table Editor**
   - You should see two new tables:
     - `user_sessions`
     - `session_events`

4. **Verify Functions Created**
   - Navigate to: **Database** → **Functions**
   - You should see these functions:
     - `start_user_session`
     - `update_session_section`
     - `end_user_session`
     - `get_user_session_stats`
     - `get_active_sessions`
     - `log_session_event`
     - `cleanup_old_sessions`

---

### Step 2: Integrate SessionProvider into App Layout

The SessionProvider is already created. Now integrate it into your app:

**File: `src/app/layout.tsx`**

```typescript
import { SessionProvider } from "@/contexts/SessionContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <SessionProvider enableTracking={true} autoTrackNavigation={true}>
            <ProfileGuard>
              {/* Your existing components */}
              {children}
            </ProfileGuard>
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
```

---

### Step 3: Using Session Tracking in Your Components

#### Basic Usage - Track Custom Events

```typescript
"use client";

import { useSession } from "@/contexts/SessionContext";

export function MyComponent() {
  const { logEvent, currentSection, sessionId } = useSession();

  const handleButtonClick = async () => {
    await logEvent("button_click", {
      button: "premium_subscribe",
      location: currentSection,
    });
  };

  return (
    <div>
      <p>Current Section: {currentSection}</p>
      <p>Session ID: {sessionId}</p>
      <button onClick={handleButtonClick}>Subscribe to Premium</button>
    </div>
  );
}
```

#### Track Manual Section Changes

```typescript
"use client";

import { useSession } from "@/contexts/SessionContext";

export function CustomPage() {
  const { changeSection } = useSession();

  const switchView = async (view: string) => {
    await changeSection(`custom_page_${view}`, {
      previousView: "main",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div>
      <button onClick={() => switchView("gallery")}>View Gallery</button>
    </div>
  );
}
```

#### Get Session Statistics

```typescript
"use client";

import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";

export function UserDashboard() {
  const { getStats } = useSession();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const sessionStats = await getStats(30); // Last 30 days
      setStats(sessionStats);
    };

    loadStats();
  }, [getStats]);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div>
      <h2>Your Activity (Last 30 Days)</h2>
      <p>Total Sessions: {stats.total_sessions}</p>
      <p>Total Time: {stats.total_time}</p>
      <p>Avg Duration: {stats.avg_session_duration}</p>
    </div>
  );
}
```

---

### Step 4: Verify Everything Works

#### Test Session Tracking

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Login to Your App**

   - Open http://localhost:3000
   - Login with a valid user account

3. **Check Browser Console**

   - You should see logs like:
     ```
     [SessionTracker] New session started: <session-id>
     [SessionTracker] Section changed: home -> dashboard
     ```

4. **Check Supabase Database**

   - Go to Supabase → Table Editor → `user_sessions`
   - You should see your session record
   - Navigate to different pages and see `app_section` update

5. **Test Session Stats API**
   - Open: http://localhost:3000/api/sessions/stats?userId=<your-user-id>
   - Should return JSON with session statistics

---

## 🔧 Configuration Options

### SessionProvider Props

```typescript
<SessionProvider
  enableTracking={true} // Enable/disable tracking globally
  autoTrackNavigation={true} // Auto-track route changes
>
  {children}
</SessionProvider>
```

### Environment Variables

No additional environment variables needed! The session tracking uses your existing:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Firebase Auth configuration

---

## 📊 Viewing Analytics

### Option 1: Query Supabase Directly

**Get User Session Stats:**

```sql
SELECT * FROM get_user_session_stats(
  '<user-id>'::UUID,  -- User ID from users_duplicate table
  30                   -- Days back
);
```

**Get Active Sessions:**

```sql
SELECT * FROM get_active_sessions('<user-id>'::UUID);
```

**View Recent Sessions:**

```sql
SELECT * FROM recent_sessions_view
WHERE user_id = '<user-id>'::UUID
ORDER BY session_start DESC
LIMIT 10;
```

**Get Top Sections:**

```sql
SELECT
  app_section,
  COUNT(*) as visit_count,
  AVG(EXTRACT(EPOCH FROM duration_seconds)) as avg_duration_seconds
FROM user_sessions
WHERE user_id = '<user-id>'::UUID
AND session_start > NOW() - INTERVAL '30 days'
GROUP BY app_section
ORDER BY visit_count DESC;
```

### Option 2: Build Admin Dashboard

Create an admin page to view all user sessions:

```typescript
// src/app/admin/sessions/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function SessionsAdmin() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch("/api/admin/sessions/all");
      const data = await response.json();
      setSessions(data.sessions);
    };

    fetchSessions();
  }, []);

  return (
    <div>
      <h1>All User Sessions</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Start Time</th>
            <th>Duration</th>
            <th>Section</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{session.student_name}</td>
              <td>{new Date(session.session_start).toLocaleString()}</td>
              <td>{session.duration_seconds}</td>
              <td>{session.app_section}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🛡️ Privacy & Data Retention

### Opt-Out Functionality

Users can opt out of session tracking:

```typescript
// User Settings Component
const handleOptOut = () => {
  localStorage.setItem("session_tracking_opt_out", "true");
  window.location.reload(); // Restart without tracking
};
```

### Auto-Cleanup Old Sessions

The database includes a cleanup function. Run it periodically:

**Option 1: Manual Cleanup (SQL)**

```sql
-- Delete sessions older than 90 days
SELECT cleanup_old_sessions(90);
```

**Option 2: Scheduled Job (Supabase Edge Function)**

Create a cron job to run monthly:

```typescript
// supabase/functions/cleanup-sessions/index.ts
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase.rpc("cleanup_old_sessions", {
    p_days_to_keep: 90,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ deleted: data }), {
    status: 200,
  });
});
```

---

## 🐛 Troubleshooting

### Issue: Sessions Not Starting

**Check:**

1. User is logged in (Firebase Auth)
2. User ID exists in `users_duplicate` table
3. Browser console shows no errors
4. Supabase service role key is set correctly

**Solution:**

```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test API endpoint
curl http://localhost:3000/api/sessions/start \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userId":"<test-user-id>"}'
```

### Issue: Section Changes Not Tracked

**Check:**

1. `autoTrackNavigation` is `true`
2. Navigation uses Next.js `<Link>` or `useRouter`
3. Check browser console for errors

### Issue: Stats Not Loading

**Check:**

1. User ID is correct
2. Sessions exist in database
3. RLS policies allow access

**Test Query:**

```sql
SELECT * FROM user_sessions
WHERE user_id = '<user-id>'::UUID
LIMIT 5;
```

---

## 📈 Advanced Features

### Custom Event Tracking

Track specific user interactions:

```typescript
const { logEvent } = useSession();

// Track video play
await logEvent("video_play", {
  videoId: "intro_to_nata",
  duration: 120,
  quality: "1080p",
});

// Track form submission
await logEvent("form_submit", {
  formType: "contact",
  fields: ["name", "email", "message"],
});

// Track download
await logEvent("file_download", {
  fileName: "NATA_2024_QA.pdf",
  fileSize: 2048576,
});
```

### Section Time Tracking

Calculate time spent in each section:

```sql
WITH section_times AS (
  SELECT
    user_id,
    jsonb_each_text(metadata->'section_timestamps') AS section_time
  FROM user_sessions
  WHERE user_id = '<user-id>'::UUID
)
SELECT
  (section_time).key AS section,
  COUNT(*) AS visits
FROM section_times
GROUP BY (section_time).key
ORDER BY visits DESC;
```

---

## 🎯 Best Practices

1. **Don't Track Everything**

   - Only track meaningful user interactions
   - Avoid tracking every mouse move or scroll

2. **Respect User Privacy**

   - Implement opt-out functionality
   - Don't track sensitive information
   - Comply with GDPR/privacy laws

3. **Optimize Performance**

   - Use debounced section changes
   - Batch event logging when possible
   - Use beacon API for unload events

4. **Monitor Database Size**

   - Run cleanup regularly
   - Set up alerts for table size
   - Consider archiving old data

5. **Test Thoroughly**
   - Test session start/end
   - Test navigation tracking
   - Test beacon on page unload
   - Test with slow network

---

## 📝 API Reference

### Start Session

```typescript
POST /api/sessions/start
Body: { userId, section?, deviceInfo? }
Response: { ok, sessionId }
```

### Update Section

```typescript
POST /api/sessions/update
Body: { sessionId, section, metadata? }
Response: { ok }
```

### End Session

```typescript
POST /api/sessions/end
Body: { sessionId, metadata? }
Response: { ok }
```

### Log Event

```typescript
POST /api/sessions/log-event
Body: { sessionId, eventType, eventData? }
Response: { ok, eventId }
```

### Get Stats

```typescript
GET /api/sessions/stats?userId=xxx&daysBack=30
Response: { ok, stats }
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Database migration run in production Supabase
- [ ] Environment variables set in Vercel
- [ ] SessionProvider integrated in layout
- [ ] Test session tracking in production
- [ ] Privacy policy updated
- [ ] Opt-out functionality implemented
- [ ] Cleanup job scheduled
- [ ] Monitoring/alerts set up

---

## 🤝 Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs
3. Review this guide thoroughly
4. Test API endpoints individually

---

## 📚 Related Documentation

- [Supabase Functions Documentation](https://supabase.com/docs/guides/database/functions)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

**Happy Tracking! 🎉**
