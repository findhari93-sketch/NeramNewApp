"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TopNavBar from "../components/shared/TopNavBar";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { getTopNavBarConfig } from "../../config/topNavBarConfig";
import apiClient from "../../lib/apiClient";

/**
 * Main layout that wraps authenticated pages with TopNavBar
 * Uses centralized configuration from topNavBarConfig.ts
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const config = getTopNavBarConfig(pathname);
  const router = useRouter();

  // Whether the current user has any submitted applications. undefined = loading
  const [hasSubmitted, setHasSubmitted] = useState<boolean | undefined>(
    undefined
  );

  // Only check for submissions when on the application form page
  useEffect(() => {
    let mounted = true;
    async function checkSubmitted() {
      if (pathname !== "/applicationform") {
        if (mounted) setHasSubmitted(false);
        return;
      }

      try {
        // get current user (requires auth)
        const meRes = await apiClient(`/api/users/me`);
        const meJson = await meRes.json().catch(() => null);
        const user = meJson?.user;
        if (!user) {
          if (mounted) setHasSubmitted(false);
          return;
        }

        // Efficiently ask the server whether this user has submitted any apps
        const hasRes = await apiClient(`/api/users/has-submissions`).catch(
          () => null
        );
        const hasJson = hasRes ? await hasRes.json().catch(() => null) : null;
        const has = Boolean(hasJson && hasJson.ok && hasJson.hasSubmissions);
        if (mounted) setHasSubmitted(has);
      } catch {
        // treat errors as no submissions (silent)
        if (mounted) setHasSubmitted(false);
      }
    }

    checkSubmitted();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Build titleBar prop only if title is present
  const titleBar = config.title
    ? {
        title: config.title,
        autoBreadcrumbs: config.breadcrumbs?.auto,
        segmentLabelMap: config.segmentLabelMap,
        showBreadcrumbs: config.breadcrumbs?.enabled ?? true,
        // merge configured actions with a dynamic action for viewing submitted apps
        // Resolve any configured action.actionId -> a runtime onClick handler
        actions: [
          ...(config.actions || []).map((a) => {
            // runtime resolver
            const resolved = { ...(a as any) } as any;
            if ((a as any).actionId === "activity") {
              resolved.onClick = () => router.push("/profile");
            }
            if ((a as any).actionId === "signout") {
              resolved.onClick = async () => {
                try {
                  await signOut(auth);
                } catch (e) {
                  console.warn("signOut error", e);
                }
                try {
                  localStorage.removeItem("phone_verified");
                } catch {}
                router.push("/");
              };
            }
            return resolved;
          }),
          // Only show the 'View submitted application forms' action on the
          // application form page when the user has submitted applications.
          ...(pathname === "/applicationform" && hasSubmitted
            ? [
                {
                  name: "view_submitted_apps",
                  label: "View submitted application forms",
                  variant: "outlined" as const,
                  onClick: () => router.push("/applications"),
                },
              ]
            : []),
        ],
        showBackButton: config.showBackButton,
        // default behaviour: use router.back when a back button is requested
        onBack: config.showBackButton ? () => router.back() : undefined,
      }
    : undefined;

  // Ensure backgroundMode is either "gradient" or "transparent"
  const backgroundMode =
    config.backgroundMode === "gradient" ||
    config.backgroundMode === "transparent"
      ? config.backgroundMode
      : undefined;

  return (
    <>
      {config.visible && (
        <Suspense fallback={null}>
          <TopNavBar titleBar={titleBar} backgroundMode={backgroundMode} />
        </Suspense>
      )}

      {/* Spacer to offset the fixed AppBar + TitleBar so page content isn't hidden */}
      {config.visible && (
        <>
          {/* MUI Toolbar provides the correct toolbar height for AppBar */}
          <Toolbar />
          {/* TitleBar height (matches TopNavBar TB_HEIGHT) */}
          <Box aria-hidden sx={{ height: 45 }} />
        </>
      )}

      {children}
    </>
  );
}
