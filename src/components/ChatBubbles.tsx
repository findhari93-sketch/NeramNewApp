"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import WhatsAppChatBubble from "./WhatsAppChatBubble";
import TawkToChat from "./TawkToChat";

const ChatBubbles = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Define paths where chat bubbles should be hidden
  const hiddenPaths = [
    "/profile",
    "/settings",
    "/account",
    "/auth",
    "/nata-cutoff-calculator",
    "/calculator",
  ];

  // Check if current path should hide chat bubbles
  const shouldHide =
    hiddenPaths.some((path) => pathname?.startsWith(path)) ||
    (isAuthenticated &&
      (pathname?.startsWith("/profile") ||
        pathname?.startsWith("/settings") ||
        pathname?.startsWith("/account")));

  if (shouldHide) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: "none", // Allow clicks to pass through the container
        zIndex: 1000,
        "& > *": {
          pointerEvents: "auto", // Re-enable clicks on child components
        },
      }}
    >
      <WhatsAppChatBubble />
      <TawkToChat />
    </Box>
  );
};

export default ChatBubbles;
