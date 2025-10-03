"use client";

import { useEffect } from "react";

export default function TawkMessenger() {
  useEffect(() => {
    const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

    if (!tawkPropertyId || !tawkWidgetId) {
      console.warn(
        "Tawk.to configuration missing. Please set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID"
      );
      return;
    }

    // Tawk.to integration script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    // Append to head
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Clean up Tawk global variables
      if (typeof window !== "undefined") {
        delete (window as any).Tawk_API;
        delete (window as any).Tawk_LoadStart;
      }
    };
  }, []);

  return null;
}
