"use client";
import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Image from "next/image";
import StepHeader from "../ui/TitleWsteps";
import apiFetch from "../../../../lib/apiClient";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type StepPaymentProps = {
  amount: number; // inclusive, in INR
  studentName?: string;
  email?: string;
  phone?: string;
  course?: string; // slug or id for the purchased course
  onBack: () => void;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (reason?: string) => void;
};

export default function StepPayment({
  amount,
  studentName,
  email,
  phone,
  onBack,
  onSuccess,
  onFailure,
  course,
}: StepPaymentProps) {
  const [loading, setLoading] = React.useState(false);
  const [keyId, setKeyId] = React.useState<string | undefined>(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || undefined
  );

  // If public key is not present in env, ask the server for it
  React.useEffect(() => {
    const needFetch = !keyId || keyId.trim() === "";
    if (!needFetch) return;
    (async () => {
      try {
        const res = await fetch("/api/payments/razorpay/config", {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (data?.keyId) setKeyId(data.keyId);
      } catch {}
    })();
  }, [keyId]);

  const loadScript = React.useCallback((src: string) => {
    return new Promise<boolean>((resolve) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve(true);
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const handleRazorpay = React.useCallback(async () => {
    try {
      setLoading(true);
      // 1) Ask server to create an order for this amount
      let orderId: string | undefined;
      try {
        const res = await apiFetch("/api/payments/razorpay/create-order", {
          method: "POST",
          body: JSON.stringify({ amount }), // amount in INR; server converts to paise
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data?.message || `Order create failed (${res.status})`
          );
        }
        const data = await res.json();
        orderId = data?.orderId;
        if (!orderId) throw new Error("Missing orderId from server");
      } catch (err: any) {
        if (onFailure) onFailure(`order_error: ${String(err?.message || err)}`);
        return;
      }
      const ok = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!ok || !window.Razorpay) {
        if (onFailure) onFailure("Failed to load Razorpay");
        return;
      }
      // Convert to paise
      const paise = Math.max(0, Math.round((amount || 0) * 100));
      const options = {
        key: keyId,
        amount: paise,
        currency: "INR",
        name: "neramClasses.com",
        description: "Course fee payment",
        order_id: orderId,
        prefill: {
          name: studentName || "",
          email: email || "",
          contact: phone || "",
        },
        theme: { color: "#7c1fa0" },
        handler: async function (response: any) {
          try {
            const verifyRes = await apiFetch("/api/payments/razorpay/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
                course,
              }),
            });
            const ok = verifyRes.ok;
            if (!ok) {
              const data = await verifyRes.json().catch(() => ({}));
              if (onFailure)
                onFailure(
                  `verify_failed: ${data?.hint || verifyRes.statusText}`
                );
              return;
            }
            // best-effort: ask server to generate and email invoice (non-blocking)
            try {
              await apiFetch("/api/payments/invoice", {
                method: "POST",
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount,
                  currency: "INR",
                  course,
                }),
              });
            } catch {}
            if (onSuccess) onSuccess(response.razorpay_payment_id);
          } catch (e: any) {
            if (onFailure) onFailure(String(e?.message || e));
          }
        },
        modal: {
          ondismiss: function () {
            if (onFailure) onFailure("dismissed");
          },
        },
      } as any;
      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    email,
    keyId,
    loadScript,
    onFailure,
    onSuccess,
    course,
    phone,
    studentName,
  ]);

  const upiIntentHref = React.useMemo(() => {
    // Basic UPI intent link placeholder; replace pa/payee if you have a VPA
    const vpa = process.env.NEXT_PUBLIC_UPI_VPA || ""; // e.g., yourname@bank
    const name = encodeURIComponent("neramClasses");
    const amt = encodeURIComponent(String(amount || 0));
    return vpa
      ? `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${name}&am=${amt}&cu=INR`
      : undefined;
  }, [amount]);

  // Many desktop browsers cannot handle upi:// schemes. Detect if we're on a mobile device.
  const isMobile = React.useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod/i.test(String(ua));
  }, []);

  // Desktop helpers for UPI: copy link and show QR
  const [qrOpen, setQrOpen] = React.useState(false);
  const qrUrl = React.useMemo(() => {
    if (!upiIntentHref) return undefined;
    const chl = encodeURIComponent(upiIntentHref);
    return `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${chl}`;
  }, [upiIntentHref]);

  const handleCopyUpi = async () => {
    try {
      if (upiIntentHref) {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(upiIntentHref);
          alert("UPI link copied. Open on your phone to pay.");
        } else {
          window.prompt("Copy UPI link:", upiIntentHref);
        }
      }
    } catch {}
  };

  return (
    <Box sx={{ maxWidth: 520, m: { xs: 2, md: 5 } }}>
      <StepHeader title="Payment" steps="Step 6 of 6" />
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #eee",
          p: 2,
          borderRadius: 1,
        }}
      >
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Amount to pay</Typography>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
          ₹
          {new Intl.NumberFormat("en-IN").format(
            Math.max(0, Math.round(amount || 0))
          )}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
          <Button
            variant="contained"
            disabled={!keyId || loading || amount <= 0}
            onClick={handleRazorpay}
            sx={{ py: 1.2 }}
          >
            Pay with Razorpay
          </Button>
          {upiIntentHref &&
            (isMobile ? (
              <Button
                component="a"
                href={upiIntentHref}
                target="_blank"
                rel="noopener"
                variant="outlined"
              >
                Pay via UPI app (GPay/PhonePe)
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={handleCopyUpi}>
                  Copy UPI link
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setQrOpen(true)}
                  disabled={!qrUrl}
                >
                  Show QR for UPI
                </Button>
              </Box>
            ))}
          {!isMobile && upiIntentHref && (
            <Typography variant="caption" color="text.secondary">
              Tip: Scan the QR with your UPI app or paste the copied link into
              your phone’s browser to open GPay/PhonePe.
            </Typography>
          )}
          <Button variant="text" onClick={onBack}>
            Back to Review
          </Button>
          {!keyId && (
            <Typography variant="caption" color="text.secondary">
              Note: Configure NEXT_PUBLIC_RAZORPAY_KEY_ID to enable Razorpay
              checkout. Optionally set NEXT_PUBLIC_UPI_VPA for UPI intent.
            </Typography>
          )}
        </Box>
      </Box>
      {/* UPI QR dialog for desktop */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
        <DialogTitle>Scan to pay via UPI</DialogTitle>
        <DialogContent>
          {qrUrl ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
              <Image
                src={qrUrl}
                alt="UPI QR"
                width={220}
                height={220}
                style={{ imageRendering: "pixelated" }}
              />
            </Box>
          ) : (
            <Typography>Unable to generate QR.</Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Use any UPI app (GPay/PhonePe/BHIM) to scan and pay the amount.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
