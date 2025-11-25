"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TawkMessenger() {
  const pathname = usePathname();

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

    // Configure Tawk_API before script loads
    (window as any).Tawk_API = (window as any).Tawk_API || {};

    script.onload = () => {
      const Tawk_API = (window as any).Tawk_API;
      if (Tawk_API) {
        const isAuthPage = pathname?.startsWith("/auth");

        // Hide widget on auth pages, show on other pages
        if (isAuthPage) {
          if (Tawk_API.hideWidget) {
            Tawk_API.hideWidget();
          }
        } else {
          // Default position (bottom-right) for all non-auth pages
          if (Tawk_API.showWidget) {
            Tawk_API.showWidget();
          }
          Tawk_API.customStyle = {
            visibility: {
              desktop: {
                position: "br", // bottom-right
                xOffset: 20,
                yOffset: 20,
              },
              mobile: {
                position: "br", // bottom-right
                xOffset: 10,
                yOffset: 10,
              },
            },
          };
        }
      }
    };

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

  // Update visibility and position when pathname changes
  useEffect(() => {
    const Tawk_API = (window as any).Tawk_API;
    if (!Tawk_API) return;

    const isLoginPage = pathname === "/auth/login";
    const isAuthPage = pathname?.startsWith("/auth");

    // Hide Tawk on all auth pages (login, signup, forgot password, etc.)
    if (isAuthPage) {
      if (Tawk_API.hideWidget) {
        Tawk_API.hideWidget();
      }
    } else {
      // Show widget on non-auth pages
      if (Tawk_API.showWidget) {
        Tawk_API.showWidget();
      }

      // Set position for non-auth pages
      if (Tawk_API.customStyle) {
        Tawk_API.customStyle = {
          visibility: {
            desktop: {
              position: "br", // bottom-right
              xOffset: 20,
              yOffset: 20,
            },
            mobile: {
              position: "br", // bottom-right
              xOffset: 10,
              yOffset: 10,
            },
          },
        };
      }
    }
  }, [pathname]);

  return null;
}
