"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { decodePaymentToken } from "@/lib/validatePaymentToken";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PayPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp?.get("v") || "";
  const [amount, setAmount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setError("No payment token was provided in the URL.");
      return;
    }
    const res = decodePaymentToken(token);
    if (!res.ok) {
      setError("Invalid payment link.");
      return;
    }
    // show amount for UX; final validation happens on server in create-order
    setAmount(Number(res.payload.amount) || null);
  }, [token]);

  // Load Razorpay checkout script
  React.useEffect(() => {
    if (typeof window === "undefined" || window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // Script may already be removed
      }
    };
  }, []);

  const handleRequestNewLink = () => {
    router.push("/applicationform");
  };

  // When user clicks Pay, POST to server which verifies token with secret
  const handleCreateOrder = async () => {
    try {
      setError(null);
      // Ensure Razorpay SDK has loaded
      if (typeof window === "undefined" || !window.Razorpay) {
        setError(
          "Razorpay is still loading. Please wait a few seconds and try again."
        );
        return;
      }
      const r = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }), // server will verify
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error || "Failed to create order");
        return;
      }

      const { keyId, orderId, amount } = j;

      if (!keyId || !orderId) {
        throw new Error("Invalid order response from server");
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency: "INR",
        name: "neramClasses.com",
        description: "Course payment",
        order_id: orderId,
        theme: { color: "#7c1fa0" },
        handler: async function (response: any) {
          // Step 3: Verify payment on server
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                token, // Pass original token for lookup
              }),
            });

            if (!verifyRes.ok) {
              const data = await verifyRes.json().catch(() => ({}));
              setError(
                `Payment verification failed: ${
                  data?.hint || verifyRes.statusText
                }`
              );
              setProcessingPayment(false);
              return;
            }

            const verifyData = await verifyRes.json();
            const redirectToken = verifyData?.redirectToken;

            // Step 4: Redirect to premium page with token
            if (redirectToken) {
              router.push(`/premium?token=${redirectToken}`);
            } else {
              // Fallback: redirect without token (user may need to login again)
              router.push("/dashboard");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            setError(`Payment verification failed: ${String(err)}`);
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setError(String(err));
      setProcessingPayment(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Paper sx={{ maxWidth: 500, p: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No Payment Link
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            No payment token was provided in the URL.
          </Typography>
          <Button variant="contained" onClick={handleRequestNewLink}>
            Go to Application Form
          </Button>
        </Paper>
      </Box>
    );
  }

  // Token validation failed (JWT)
  if (token && error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Paper sx={{ maxWidth: 500, p: 4 }}>
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 600, color: "error.main" }}
          >
            Invalid Payment Link
          </Typography>

          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>

          <Button variant="contained" fullWidth onClick={handleRequestNewLink}>
            Request New Payment Link
          </Button>
        </Paper>
      </Box>
    );
  }

  // Valid token: show payment UI
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Paper sx={{ maxWidth: 500, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Complete Your Payment
        </Typography>

        {amount !== null && amount > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Payment Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ₹{amount.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Payment Type: Razorpay
            </Typography>
          </Box>
        )}

        <Typography variant="body1" sx={{ mb: 3 }}>
          Click Pay Now to complete your payment securely through Razorpay.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleCreateOrder}
          disabled={processingPayment}
          sx={{ py: 1.5 }}
        >
          {processingPayment ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          Secure payment powered by Razorpay
        </Typography>
      </Paper>
    </Box>
  );
}
