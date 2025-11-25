/**
 * Auth Redirect Hook
 *
 * Handles post-authentication redirects based on profile completeness
 * and next target parameters.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  profile_completeness?: number;
  profile?: {
    completeness?: number;
  };
}

export const useAuthRedirect = (nextTarget?: string | null) => {
  const router = useRouter();

  const checkProfileCompleteness = useCallback(
    async (idToken: string): Promise<number> => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!res.ok) {
          return 0;
        }

        const data: ProfileData = await res.json().catch(() => ({}));
        const userRow =
          (data && "user" in data ? (data as any).user : data) || {};

        // Extract completeness from various possible locations
        let completeness = 0;

        if (typeof userRow.profile_completeness === "number") {
          completeness = userRow.profile_completeness;
        } else if (
          userRow.profile &&
          typeof userRow.profile.completeness === "number"
        ) {
          completeness = userRow.profile.completeness;
        }

        return completeness;
      } catch (error) {
        console.warn(
          "[useAuthRedirect] Failed to check profile completeness:",
          error
        );
        return 0;
      }
    },
    []
  );

  const redirectAfterLogin = useCallback(
    async (idToken: string): Promise<void> => {
      try {
        // Always respect explicit next parameter (e.g., from calculator)
        if (nextTarget) {
          router.replace(nextTarget);
          return;
        }

        // Check profile completeness
        const completeness = await checkProfileCompleteness(idToken);

        if (completeness < 70) {
          router.replace("/profile?notice=complete_profile");
        } else {
          router.replace("/?notice=login_success");
        }
      } catch (error) {
        console.warn("[useAuthRedirect] Redirect failed:", error);

        // Fallback: respect next first, else go to profile
        if (nextTarget) {
          router.replace(nextTarget);
        } else {
          router.replace("/profile?notice=complete_profile");
        }
      }
    },
    [nextTarget, router, checkProfileCompleteness]
  );

  return {
    redirectAfterLogin,
    checkProfileCompleteness,
  };
};
