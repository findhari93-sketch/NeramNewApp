# Session Tracking - Quick Setup Checklist

## 📋 Complete This Checklist Step-by-Step

### ✅ Step 1: Database Setup (Supabase Console)

**What to do OUTSIDE VS Code:**

1. **Open Supabase**

   - Go to: https://app.supabase.com
   - Login to your account
   - Select project: `neramclasses`

2. **Run Migration**

   - Click: **SQL Editor** in left sidebar
   - Click: **New query**
   - Open file in VS Code: `supabase_migrations/013_create_user_sessions_table.sql`
   - Copy **ALL contents** (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click: **Run** (or Cmd/Ctrl + Enter)
   - Wait for success message ✅

3. **Verify Tables**

   - Click: **Table Editor** in left sidebar
   - Look for new tables:
     - ✅ `user_sessions`
     - ✅ `session_events`

4. **Verify Functions**
   - Click: **Database** → **Functions**
   - Should see 7 new functions:
     - ✅ `start_user_session`
     - ✅ `update_session_section`
     - ✅ `end_user_session`
     - ✅ `get_user_session_stats`
     - ✅ `get_active_sessions`
     - ✅ `log_session_event`
     - ✅ `cleanup_old_sessions`

---

### ✅ Step 2: Integrate SessionProvider (VS Code)

**File to modify:** `src/app/layout.tsx`

Add the import at the top:

```typescript
import { SessionProvider } from "@/contexts/SessionContext";
```

Wrap your app content:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {/* Add SessionProvider here */}
          <SessionProvider enableTracking={true} autoTrackNavigation={true}>
            <ProfileGuard>
              <SnackbarNotice />
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

### ✅ Step 3: Test Locally

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Open browser:**

   - Navigate to: http://localhost:3000
   - Open DevTools Console (F12)

3. **Login to your app**

   - Use any valid test account

4. **Check console logs:**

   - Should see: `[SessionTracker] New session started: <session-id>`
   - Navigate between pages
   - Should see: `[SessionTracker] Section changed: home -> dashboard`

5. **Verify in Supabase:**
   - Go to Supabase → Table Editor → `user_sessions`
   - Find your session record
   - Should see your `user_id`, `session_start`, `app_section`

---

### ✅ Step 4: Test API Endpoints

**Test Session Stats API:**

Open in browser:

```
http://localhost:3000/api/sessions/stats?userId=<your-user-id>
```

Replace `<your-user-id>` with actual user ID from `users_duplicate` table.

**Expected response:**

```json
{
  "ok": true,
  "stats": {
    "total_sessions": 1,
    "total_time": "00:05:23",
    "avg_session_duration": "00:05:23",
    "most_used_sections": { "home": 1 },
    "last_session_start": "2025-11-25T...",
    "active_sessions": 1
  }
}
```

---

### ✅ Step 5: Deploy to Production

1. **Commit changes:**

   ```bash
   git add .
   git commit -m "Add session tracking system"
   git push origin master
   ```

2. **Run migration in Production Supabase:**

   - Repeat Step 1 but in **Production Supabase project**
   - Make sure you're in the RIGHT project!

3. **Verify deployment:**
   - Wait for Vercel build to complete
   - Visit: https://neramclasses.com
   - Login and test session tracking

---

## 🎯 Usage Examples

### Track Custom Events

```typescript
"use client";

import { useSession } from "@/contexts/SessionContext";

export function MyComponent() {
  const { logEvent } = useSession();

  const handleClick = async () => {
    await logEvent("button_click", {
      button: "subscribe_premium",
      location: "pricing_page",
    });
  };

  return <button onClick={handleClick}>Subscribe</button>;
}
```

### Get Session Statistics

```typescript
"use client";

import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";

export function Dashboard() {
  const { getStats } = useSession();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats(30).then(setStats); // Last 30 days
  }, [getStats]);

  return (
    <div>
      <h2>Your Activity</h2>
      <p>Total Sessions: {stats?.total_sessions}</p>
    </div>
  );
}
```

### Manual Section Tracking

```typescript
const { changeSection } = useSession();

// When switching views
await changeSection("gallery_view", {
  previousView: "list_view",
  timestamp: new Date().toISOString(),
});
```

---

## 🔍 Troubleshooting

### Problem: Session not starting

**Check:**

- [ ] User is logged in (Firebase Auth working)
- [ ] User ID exists in `users_duplicate` table
- [ ] Supabase credentials correct in `.env.local`
- [ ] No errors in browser console

**Solution:**

```bash
# Check env variables
cat .env.local | grep SUPABASE

# Test API directly
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"<test-user-id>"}'
```

### Problem: Stats API returns 404

**Check:**

- [ ] User ID is correct
- [ ] Sessions exist in database
- [ ] Query string is correct

**Solution:**

```sql
-- Check if user has any sessions
SELECT * FROM user_sessions
WHERE user_id = '<your-user-id>'::UUID;
```

---

## 📊 View Data in Supabase

**Quick Queries:**

```sql
-- All sessions for a user
SELECT
  session_start,
  session_end,
  duration_seconds,
  app_section,
  device_info
FROM user_sessions
WHERE user_id = '<user-id>'::UUID
ORDER BY session_start DESC;

-- Top sections visited
SELECT
  app_section,
  COUNT(*) as visits,
  AVG(EXTRACT(EPOCH FROM duration_seconds)) as avg_seconds
FROM user_sessions
WHERE user_id = '<user-id>'::UUID
GROUP BY app_section
ORDER BY visits DESC;

-- Recent events
SELECT
  se.event_type,
  se.event_data,
  se.timestamp,
  us.app_section
FROM session_events se
JOIN user_sessions us ON se.session_id = us.id
WHERE us.user_id = '<user-id>'::UUID
ORDER BY se.timestamp DESC
LIMIT 20;
```

---

## ✨ What Gets Tracked Automatically

Once integrated, the system automatically tracks:

✅ **Session Start** - When user logs in
✅ **Session End** - When user logs out or closes tab
✅ **Page Navigation** - Every route change
✅ **Section Changes** - Automatic section detection
✅ **Heartbeats** - Every 30 seconds (confirms user active)
✅ **Page Visibility** - When user switches tabs
✅ **Device Info** - Browser, screen size, platform

---

## 🎉 You're Done!

Session tracking is now fully implemented and running.

**Next steps:**

- Monitor sessions in Supabase
- Build analytics dashboards
- Set up cleanup jobs
- Add custom event tracking

**Full documentation:** See `SESSION_TRACKING_GUIDE.md`

---

## 📞 Need Help?

Common issues and solutions are in `SESSION_TRACKING_GUIDE.md` under the **Troubleshooting** section.
