"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  discountAmount?: number; // numeric discount to display in UI
  label?: string; // button label
  serverBaseUrl?: string; // where the auth server lives (defaults to :4000 on current host)
  initialSubscribed?: boolean;
  onSubscribed?: (subscribed: boolean) => void;
};

export default function YoutubeSubscribe({
  discountAmount = 25,
  label = "Subscribe on YouTube",
  serverBaseUrl,
  initialSubscribed = false,
  onSubscribed,
}: Props) {
  const [subscribed, setSubscribed] = useState<boolean>(initialSubscribed);
  const popupRef = useRef<Window | null>(null);
  const [waiting, setWaiting] = useState(false);

  // compute server base URL default (http(s)://hostname:4000)
  const defaultServer =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:4000`
      : "http://localhost:4000";
  const base = serverBaseUrl || defaultServer;

  const openPopup = () => {
    try {
      popupRef.current = window.open(
        `${base}/auth/google`,
        "youtube_subscribe",
        "width=900,height=700"
      );
      if (popupRef.current) popupRef.current.focus();
      setWaiting(true);
    } catch (e) {
      console.warn("Failed to open YouTube popup", e);
    }
  };

  useEffect(() => {
    const onMsg = async (ev: MessageEvent) => {
      if (!ev.data || ev.data.type !== "yt_auth" || !ev.data.state) return;
      const state = ev.data.state as string;
      try {
        const checkUrl = `${base}/api/check-subscription?state=${encodeURIComponent(
          state
        )}`;
        const r = await fetch(checkUrl);
        const j = await r.json();
        if (j.subscribed) {
          setSubscribed(true);
          if (onSubscribed) onSubscribed(true);
        } else {
          if (onSubscribed) onSubscribed(false);
        }
      } catch (e) {
        console.warn("subscription check failed", e);
      } finally {
        setWaiting(false);
        try {
          if (popupRef.current && !popupRef.current.closed)
            popupRef.current.close();
        } catch {
          /* ignore popup close errors */
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [base, onSubscribed]);

  return (
    <div>
      {!subscribed ? (
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={openPopup}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
            {/* Small discount badge */}
            <span
              aria-hidden
              style={{
                background: "#e6f4ea",
                color: "#097a2b",
                padding: "6px 8px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ₹{discountAmount}
            </span>
          </div>
          {waiting && (
            <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
              Waiting for verification from YouTube popup...
            </div>
          )}
          <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
            Click subscribe to get ₹{discountAmount} off your total fee.
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "green" }}>
          Subscribed: ₹{discountAmount} discount applied
        </div>
      )}
    </div>
  );
}
