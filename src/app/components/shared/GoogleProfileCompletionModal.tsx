import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
// This modal only handles phone verification; other UI pieces were removed.
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import PhoneAuth from "./PhoneAuth";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface Props {
  open: boolean;
  onClose: () => void;
  // onComplete should return a boolean indicating whether the server-side
  // save succeeded. For this simplified modal we only collect phone and
  // call onComplete(phone).
  onComplete: (phone: string) => Promise<boolean>;
  initialPhone?: string;
  // If true, the modal becomes modal and cannot be dismissed until the
  // phone verification flow completes.
  forceComplete?: boolean;
}

const GoogleProfileCompletionModal: React.FC<Props> = ({
  open,
  onClose,
  onComplete,
  initialPhone,
  forceComplete,
}) => {
  const [step, setStep] = useState<"phone" | "welcome">("phone");
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(initialPhone || "");
  const theme = useTheme();

  function PromoText({ text }: { text: string }) {
    // make 'FREE' and 'Q&A PDFs' bold and use theme primary color
    const parts = text.split(/(FREE|Q&A PDFs)/g);
    return (
      <Typography sx={{ color: "#fff", fontSize: 20 }} component="div">
        {parts.map((p, i) => {
          if (!p) return null;
          if (p === "FREE" || p === "Q&A PDFs") {
            return (
              <span
                key={i}
                style={{
                  fontWeight: 700,
                  color:
                    theme.palette.highlight?.main ?? theme.palette.primary.main,
                }}
              >
                {p}
              </span>
            );
          }
          return <span key={i}>{p}</span>;
        })}
      </Typography>
    );
  }

  const handlePhoneVerified = async (verifiedPhone: string) => {
    setPhone(verifiedPhone);
    setError(null);
    try {
      const ok = await onComplete(verifiedPhone);
      if (ok) {
        setStep("welcome");
        // close after a short delay to show welcome briefly when not forced
        setTimeout(() => onClose(), 500);
      } else {
        setError("Failed to save phone. Please try again.");
      }
    } catch (e) {
      setError(String(e ?? "Failed to save phone"));
    }
  };

  return (
    <Dialog
      open={open}
      // allow close only when not forceComplete OR when at welcome step
      onClose={!forceComplete || step === "welcome" ? onClose : undefined}
      disableEscapeKeyDown={forceComplete ? step !== "welcome" : false}
      PaperProps={{
        sx: {
          // set requested dialog min dimensions
          minWidth: 550,
          minHeight: 380,
          // allow children (country dropdown) to overflow outside the dialog
          overflow: "visible",
          // background image from public/2025/bgphonepopup.png
          backgroundImage: `url('/2025/bgphonepopup.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      }}
    >
      {step === "phone" && (
        <>
          <DialogContent
            sx={{
              // inner content sizing to better fit the background art
              minWidth: 420,
              minHeight: 320,
              display: "flex",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              background: "transparent",
              // allow dropdowns inside to escape the dialog box and not be clipped
              overflow: "visible",
              p: 2,
            }}
          >
            {/* Left column: decorative character image */}
            <Box
              component="img"
              src="/2025/Character.png"
              alt="Illustration"
              sx={{
                width: { xs: 0, sm: 160, md: 200 },
                height: "auto",
                objectFit: "contain",
                display: { xs: "none", sm: "block" },
                flex: "0 0 auto",
              }}
            />

            {/* Right column: phone auth flow */}
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                gap: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Promotional text: white, 16px; highlight FREE and Q&A PDFs */}
              <PromoText
                text={"Get FREE JEE2 / NATA 2024 Q&A PDFs to Whatsapp"}
              />
              <PhoneAuth
                initialPhone={phone}
                onVerified={handlePhoneVerified}
                label="off"
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
        </>
      )}
      {step === "welcome" && (
        <>
          <DialogTitle>Thank you</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2, color: "#fff" }}>
              Phone verified — taking you to your profile.
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default GoogleProfileCompletionModal;
