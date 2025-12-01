/**
 * Admin Dashboard - Payment Notifications Component
 *
 * Example React component to display payment notifications in admin panel
 * Shows real-time notifications from the notifications table
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
}

export default function AdminNotifications({
  adminUserId,
}: {
  adminUserId: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${adminUserId}`,
        },
        (payload) => {
          console.log("New notification received:", payload.new);
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show browser notification (if permitted)
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const notif = payload.new as Notification;
            new Notification(notif.title, {
              body: notif.message,
              icon: "/images/logos/neram-logo.png",
              badge: "/images/logos/neram-logo.png",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminUserId]);

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", adminUserId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: adminUserId,
      })
      .eq("id", notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function markAllAsRead() {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: adminUserId,
      })
      .eq("user_id", adminUserId)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 border-red-500 text-red-900";
      case "high":
        return "bg-orange-100 border-orange-500 text-orange-900";
      case "normal":
        return "bg-blue-100 border-blue-500 text-blue-900";
      case "low":
        return "bg-gray-100 border-gray-500 text-gray-900";
      default:
        return "bg-gray-100 border-gray-500 text-gray-900";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_completed":
        return "💰";
      case "payment_failed":
        return "❌";
      case "payment_pending":
        return "⏳";
      case "user_registered":
        return "👤";
      case "application_submitted":
        return "📝";
      default:
        return "🔔";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border-l-4 p-4 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${
                notif.is_read
                  ? "bg-gray-50 opacity-70"
                  : getPriorityColor(notif.priority)
              }`}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {getNotificationIcon(notif.notification_type)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{notif.message}</p>

                  {/* Payment Details (if available) */}
                  {notif.notification_type === "payment_completed" &&
                    notif.data && (
                      <div className="mt-3 p-3 bg-white/50 rounded text-xs space-y-1">
                        {notif.data.student_name && (
                          <div>
                            <strong>Student:</strong> {notif.data.student_name}
                          </div>
                        )}
                        {notif.data.student_email && (
                          <div>
                            <strong>Email:</strong> {notif.data.student_email}
                          </div>
                        )}
                        {notif.data.amount && (
                          <div>
                            <strong>Amount:</strong> ₹
                            {notif.data.amount.toLocaleString("en-IN")}
                          </div>
                        )}
                        {notif.data.method && (
                          <div>
                            <strong>Method:</strong>{" "}
                            {notif.data.method.toUpperCase()}
                          </div>
                        )}
                        {notif.data.payment_id && (
                          <div className="font-mono text-xs">
                            <strong>Payment ID:</strong> {notif.data.payment_id}
                          </div>
                        )}
                      </div>
                    )}

                  <p className="text-xs text-gray-600 mt-2">
                    {new Date(notif.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Usage in Admin Dashboard:
 *
 * import AdminNotifications from '@/components/admin/AdminNotifications';
 *
 * export default function AdminDashboard() {
 *   const { user } = useAuth(); // Get current admin user
 *
 *   return (
 *     <div className="container mx-auto p-6">
 *       <h1>Admin Dashboard</h1>
 *       <AdminNotifications adminUserId={user.id} />
 *     </div>
 *   );
 * }
 */

/**
 * Browser Notification Permission Request:
 *
 * Add this to your admin layout or dashboard component:
 */
export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted");
      }
    });
  }
}
