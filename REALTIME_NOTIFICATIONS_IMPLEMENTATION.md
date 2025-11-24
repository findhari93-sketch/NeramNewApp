# Real-time Notifications Implementation Guide

## Overview
This guide will help you implement real-time notifications from the Student App (neramclasses.com) to the Admin App (admin.neramclasses.com) using Supabase Real-time subscriptions.

## Architecture Flow
```
Student App → users_duplicate table (UPDATE/INSERT)
                    ↓
            Database Trigger
                    ↓
          notifications table
                    ↓
         Real-time Channel
                    ↓
            Admin App (Subscribed)
```

---

## Step 1: Database Schema Setup

### 1.1 Create Notifications Table

Run this SQL migration in your Supabase SQL Editor:

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users_duplicate(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'application_submitted', 'profile_updated', 'payment_completed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::JSONB, -- Additional context data
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  read_by UUID, -- Admin user who read the notification

  -- Indexes for better query performance
  CONSTRAINT valid_notification_type CHECK (
    notification_type IN (
      'application_submitted',
      'application_approved',
      'application_rejected',
      'profile_updated',
      'payment_pending',
      'payment_completed',
      'payment_failed',
      'document_uploaded',
      'user_registered'
    )
  ),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_unread_priority
  ON public.notifications(is_read, priority, created_at DESC)
  WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can see all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users_duplicate
      WHERE id = auth.uid()
      AND (account->>'account_type')::text = 'admin'
    )
  );

-- RLS Policy: Admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users_duplicate
      WHERE id = auth.uid()
      AND (account->>'account_type')::text = 'admin'
    )
  );

-- RLS Policy: System can insert notifications (triggered by database functions)
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.notifications IS 'Stores system notifications for admin dashboard';
```

---

## Step 2: Create Database Trigger Functions

### 2.1 Create Notification Helper Function

```sql
-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::JSONB,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    notification_type,
    title,
    message,
    data,
    priority
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data,
    p_priority
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;
```

### 2.2 Create Trigger Function for Application Submissions

```sql
-- Trigger function for application submission
CREATE OR REPLACE FUNCTION public.notify_application_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_name TEXT;
  v_email TEXT;
  v_course TEXT;
  v_notification_data JSONB;
BEGIN
  -- Only trigger if application_submitted changes from false to true
  IF (
    NEW.application_details->>'application_submitted' = 'true'
    AND (
      OLD.application_details IS NULL
      OR OLD.application_details->>'application_submitted' != 'true'
    )
  ) THEN
    -- Extract student information
    v_student_name := COALESCE(NEW.basic->>'student_name', 'Unknown Student');
    v_email := COALESCE(NEW.contact->>'email', '');
    v_course := COALESCE(NEW.selected_course, 'Not specified');

    -- Build notification data
    v_notification_data := jsonb_build_object(
      'application_id', NEW.id,
      'student_name', v_student_name,
      'email', v_email,
      'course', v_course,
      'submitted_at', NEW.application_details->>'app_submitted_date_time',
      'firebase_uid', NEW.account->>'firebase_uid'
    );

    -- Create notification
    PERFORM public.create_notification(
      NEW.id,
      'application_submitted',
      'New Application Submitted',
      format('%s has submitted an application for %s', v_student_name, v_course),
      v_notification_data,
      'high'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users_duplicate table
DROP TRIGGER IF EXISTS trg_notify_application_submitted ON public.users_duplicate;
CREATE TRIGGER trg_notify_application_submitted
  AFTER INSERT OR UPDATE OF application_details
  ON public.users_duplicate
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_submitted();
```

### 2.3 Create Trigger Function for Payment Updates

```sql
-- Trigger function for payment updates
CREATE OR REPLACE FUNCTION public.notify_payment_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_name TEXT;
  v_email TEXT;
  v_old_status TEXT;
  v_new_status TEXT;
  v_notification_data JSONB;
  v_notification_type TEXT;
  v_title TEXT;
  v_message TEXT;
  v_priority TEXT;
BEGIN
  v_old_status := OLD.final_fee_payment->>'payment_status';
  v_new_status := NEW.final_fee_payment->>'payment_status';

  -- Only trigger if payment status actually changed
  IF v_old_status IS DISTINCT FROM v_new_status THEN
    v_student_name := COALESCE(NEW.basic->>'student_name', 'Unknown Student');
    v_email := COALESCE(NEW.contact->>'email', '');

    -- Determine notification type and priority based on status
    CASE v_new_status
      WHEN 'completed' THEN
        v_notification_type := 'payment_completed';
        v_title := 'Payment Completed';
        v_message := format('%s has completed their payment', v_student_name);
        v_priority := 'normal';
      WHEN 'pending' THEN
        v_notification_type := 'payment_pending';
        v_title := 'Payment Pending';
        v_message := format('%s has a pending payment', v_student_name);
        v_priority := 'normal';
      WHEN 'failed' THEN
        v_notification_type := 'payment_failed';
        v_title := 'Payment Failed';
        v_message := format('Payment failed for %s', v_student_name);
        v_priority := 'high';
      ELSE
        RETURN NEW; -- Don't create notification for unknown statuses
    END CASE;

    -- Build notification data
    v_notification_data := jsonb_build_object(
      'user_id', NEW.id,
      'student_name', v_student_name,
      'email', v_email,
      'old_status', v_old_status,
      'new_status', v_new_status,
      'payment_amount', NEW.final_fee_payment->>'payable_amount',
      'payment_method', NEW.final_fee_payment->>'payment_method',
      'payment_at', NEW.final_fee_payment->>'payment_at'
    );

    -- Create notification
    PERFORM public.create_notification(
      NEW.id,
      v_notification_type,
      v_title,
      v_message,
      v_notification_data,
      v_priority
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users_duplicate table
DROP TRIGGER IF EXISTS trg_notify_payment_update ON public.users_duplicate;
CREATE TRIGGER trg_notify_payment_update
  AFTER UPDATE OF final_fee_payment
  ON public.users_duplicate
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_update();
```

### 2.4 Create Trigger Function for Profile Updates

```sql
-- Trigger function for significant profile updates
CREATE OR REPLACE FUNCTION public.notify_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_name TEXT;
  v_changes TEXT[];
  v_notification_data JSONB;
BEGIN
  -- Skip if this is an insert (new user)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Check for significant changes
  v_changes := ARRAY[]::TEXT[];

  IF OLD.basic IS DISTINCT FROM NEW.basic THEN
    v_changes := array_append(v_changes, 'basic_info');
  END IF;

  IF OLD.contact IS DISTINCT FROM NEW.contact THEN
    v_changes := array_append(v_changes, 'contact');
  END IF;

  IF OLD.education IS DISTINCT FROM NEW.education THEN
    v_changes := array_append(v_changes, 'education');
  END IF;

  IF OLD.about_user IS DISTINCT FROM NEW.about_user THEN
    v_changes := array_append(v_changes, 'about_user');
  END IF;

  -- Only create notification if there are significant changes
  IF array_length(v_changes, 1) > 0 THEN
    v_student_name := COALESCE(NEW.basic->>'student_name', 'Unknown Student');

    v_notification_data := jsonb_build_object(
      'user_id', NEW.id,
      'student_name', v_student_name,
      'email', NEW.contact->>'email',
      'changed_sections', v_changes,
      'updated_at', NEW.updated_at
    );

    PERFORM public.create_notification(
      NEW.id,
      'profile_updated',
      'Profile Updated',
      format('%s updated their profile (%s)', v_student_name, array_to_string(v_changes, ', ')),
      v_notification_data,
      'low'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users_duplicate table
DROP TRIGGER IF EXISTS trg_notify_profile_update ON public.users_duplicate;
CREATE TRIGGER trg_notify_profile_update
  AFTER UPDATE
  ON public.users_duplicate
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_profile_update();
```

### 2.5 Create Trigger Function for New User Registration

```sql
-- Trigger function for new user registration
CREATE OR REPLACE FUNCTION public.notify_user_registered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_name TEXT;
  v_email TEXT;
  v_notification_data JSONB;
BEGIN
  v_student_name := COALESCE(NEW.basic->>'student_name', 'New User');
  v_email := COALESCE(NEW.contact->>'email', '');

  v_notification_data := jsonb_build_object(
    'user_id', NEW.id,
    'student_name', v_student_name,
    'email', v_email,
    'firebase_uid', NEW.account->>'firebase_uid',
    'account_type', NEW.account->>'account_type',
    'registered_at', NEW.created_at_tz
  );

  PERFORM public.create_notification(
    NEW.id,
    'user_registered',
    'New User Registered',
    format('%s has registered on the platform', v_student_name),
    v_notification_data,
    'normal'
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to users_duplicate table
DROP TRIGGER IF EXISTS trg_notify_user_registered ON public.users_duplicate;
CREATE TRIGGER trg_notify_user_registered
  AFTER INSERT
  ON public.users_duplicate
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_registered();
```

---

## Step 3: Enable Supabase Realtime

Run this SQL to enable realtime on the notifications table:

```sql
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## Step 4: Admin App Implementation

### 4.1 Create Supabase Client for Admin App

Create `lib/supabaseAdmin.ts` in your Admin App:

```typescript
// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Notification = {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at: string | null;
  read_by: string | null;
};
```

### 4.2 Create Real-time Hook

Create `hooks/useNotifications.ts` in your Admin App:

```typescript
// hooks/useNotifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseAdmin, type Notification } from '@/lib/supabaseAdmin';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

      if (unreadIds.length === 0) return;

      const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', unreadIds);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  // Setup real-time subscription
  useEffect(() => {
    fetchNotifications();

    let channel: RealtimeChannel;

    try {
      // Subscribe to real-time changes
      channel = supabaseAdmin
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('New notification received:', payload);
            const newNotification = payload.new as Notification;

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/notification-icon.png',
                badge: '/badge-icon.png',
              });
            }

            // Play notification sound
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.play().catch(console.error);
            } catch (err) {
              console.error('Error playing notification sound:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('Notification updated:', payload);
            const updatedNotification = payload.new as Notification;

            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
            );

            // Recalculate unread count
            setNotifications((currentNotifications) => {
              const unread = currentNotifications.filter((n) => !n.is_read).length;
              setUnreadCount(unread);
              return currentNotifications;
            });
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setError('Failed to setup real-time notifications');
    }

    // Cleanup
    return () => {
      if (channel) {
        supabaseAdmin.removeChannel(channel);
      }
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
```

### 4.3 Create Notification Component

Create `components/NotificationBell.tsx` in your Admin App:

```typescript
// components/NotificationBell.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string, userId: string) => {
    markAsRead(notificationId);
    // Navigate to user detail page or application page
    window.location.href = `/admin/users/${userId}`;
    handleClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} aria-label="notifications">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 420, maxHeight: 600 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading notifications...
            </Typography>
          </Box>
        )}

        {!loading && notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}

        {!loading && notifications.length > 0 && (
          <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
            {notifications.slice(0, 20).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.user_id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                  alignItems: 'flex-start',
                }}
              >
                <Stack spacing={0.5} sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={notification.is_read ? 400 : 600}>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={getPriorityColor(notification.priority) as any}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {notification.message}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Box>
        )}

        {notifications.length > 20 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button fullWidth size="small" href="/admin/notifications">
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
```

### 4.4 Add to Admin Layout

Add the notification bell to your admin app's header/navbar:

```typescript
// app/admin/layout.tsx or components/AdminHeader.tsx
import { NotificationBell } from '@/components/NotificationBell';

export default function AdminLayout({ children }) {
  return (
    <div>
      <header>
        {/* Your other header content */}
        <NotificationBell />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## Step 5: Testing the Implementation

### 5.1 Test Application Submission

On your Student App, submit an application:

```typescript
// This should trigger the notification
await supabase
  .from('users_duplicate')
  .update({
    application_details: {
      application_submitted: true,
      app_submitted_date_time: new Date().toISOString(),
      // ... other fields
    }
  })
  .eq('id', userId);
```

### 5.2 Test Payment Update

```typescript
// This should trigger the notification
await supabase
  .from('users_duplicate')
  .update({
    final_fee_payment: {
      payment_status: 'completed',
      payment_at: new Date().toISOString(),
      // ... other fields
    }
  })
  .eq('id', userId);
```

### 5.3 Monitor Real-time Subscription

Open your browser console in the Admin App and watch for:
- "Realtime subscription status: SUBSCRIBED"
- "New notification received: {...}"

---

## Step 6: Advanced Features (Optional)

### 6.1 Notification Preferences

Add a preferences table for admins to control which notifications they want to receive:

```sql
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.users_duplicate(id),
  notification_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_user_id, notification_type)
);
```

### 6.2 Notification History Page

Create a dedicated page in your Admin App to view all notifications:

```typescript
// app/admin/notifications/page.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead } = useNotifications();

  return (
    <div>
      <h1>All Notifications</h1>
      {/* Render notifications with filters, search, pagination */}
    </div>
  );
}
```

### 6.3 Email Notifications

Integrate with services like SendGrid or AWS SES to send email notifications to admins:

```sql
-- Add to trigger function
-- Send email notification for high-priority alerts
IF v_priority IN ('high', 'urgent') THEN
  -- Call your email service API
  PERFORM net.http_post(
    url := 'https://your-email-service.com/send',
    body := jsonb_build_object(
      'to', 'admin@neramclasses.com',
      'subject', v_title,
      'body', v_message
    )
  );
END IF;
```

---

## Security Considerations

1. **RLS Policies**: Ensure only admins can read notifications
2. **Rate Limiting**: Implement rate limiting on notification creation
3. **Data Validation**: Validate all notification data before insertion
4. **Audit Trail**: Keep logs of who reads/dismisses notifications
5. **HTTPS Only**: Always use HTTPS for real-time connections

---

## Troubleshooting

### Notifications not appearing in Admin App

1. Check Supabase realtime is enabled:
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```

2. Verify RLS policies allow admin access

3. Check browser console for subscription errors

4. Ensure environment variables are set correctly

### Trigger not firing

1. Check if trigger is enabled:
   ```sql
   SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'users_duplicate'::regclass;
   ```

2. Test trigger function directly:
   ```sql
   SELECT public.create_notification(
     'test-user-id'::uuid,
     'application_submitted',
     'Test',
     'Test message',
     '{}'::jsonb,
     'normal'
   );
   ```

---

## Performance Optimization

1. **Index Strategy**: Ensure proper indexes on notification queries
2. **Archival**: Archive old read notifications after 90 days
3. **Pagination**: Use cursor-based pagination for large notification lists
4. **Caching**: Cache unread count on the client side

---

## Next Steps

1. Run all SQL migrations in Supabase
2. Implement the Admin App components
3. Test with real data
4. Monitor performance and adjust as needed
5. Add more notification types as requirements grow

---

## Support

For issues or questions, refer to:
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Database Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
