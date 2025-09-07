"use client";
import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PhoneAuth from "../../../components/shared/PhoneAuth";

export default function StepPhoneVerify({
  initialPhone,
  onVerified,
  onContinue,
}) {
  return (
    <Box sx={{ maxWidth: 520, m: 5 }}>
      <Box sx={{ mt: 1.5 }}>
        <PhoneAuth
          initialPhone={initialPhone}
          onVerified={(p) => {
            try {
              onVerified?.(p);
            } catch {}
          }}
        />
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="outlined" onClick={() => onContinue && onContinue()}>
            Continue to application
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
