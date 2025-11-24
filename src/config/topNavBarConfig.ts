/**
 * Centralized TopNavBar configuration for all pages
 *
 * Notes:
 * - Avoid storing runtime functions in the static config. Use `actionId`/`backActionId`
 *   and resolve them to actual callbacks inside the TopNavBar component.
 * - Use consistent route casing (kebab-case recommended).
 */

export interface TopNavBarAction {
  name: string;
  label: string;
  variant?: "text" | "outlined" | "contained";
  // actionId is an identifier; the TopNavBar component resolves it to a function.
  actionId?: string;
}

export interface TopNavBarConfig {
  visible: boolean;
  title?: string;
  // breadcrumbs: enabled determines show/hide, auto determines if breadcrumbs are generated from the pathname
  breadcrumbs?: {
    enabled?: boolean;
    auto?: boolean;
  };
  segmentLabelMap?: Record<string, string>;
  actions?: TopNavBarAction[];
  showBackButton?: boolean;
  // backActionId can be resolved to an actual function in runtime (e.g., router.back)
  backActionId?: string;
  backgroundMode?: "gradient" | "transparent";
}

/**
 * Global segment label map used across pages (use consistent keys, e.g. kebab-case)
 */
export const globalSegmentLabelMap: Record<string, string> = {
  // Main sections
  "application-form": "Application Form",
  "account-settings": "Account Settings",
  profile: "Profile",
  settings: "Settings",

  // Sub-sections
  auth: "Auth",
  login: "Login",
  "complete-signup": "Complete Signup",
  action: "Action",

  // Features
  calculator: "Calculator",
  "nata-cutoff-calculator": "NATA Cutoff Calculator",
  "nata-history": "NATA History",
  freebooks: "Free Books",
  "ask-seniors": "Ask Seniors",
};

/**
 * Default config (merged with per-route config)
 */
export const DEFAULT_TOP_NAV_CONFIG: TopNavBarConfig = {
  visible: true,
  backgroundMode: "gradient",
  breadcrumbs: { enabled: true, auto: true },
  showBackButton: true,
};

/**
 * Route-specific TopNavBar configurations
 * Use Partial<TopNavBarConfig> so entries only need to override what they want.
 */
export const topNavBarConfigs: Record<string, Partial<TopNavBarConfig>> = {
  "/": {
    visible: true,
    title: "Home",
    breadcrumbs: { enabled: false },
    showBackButton: false,
    backgroundMode: "transparent",
  },

  "/application-form": {
    title: "Application Form",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    actions: [],
    showBackButton: true,
    backgroundMode: "gradient",
  },

  "/account-settings": {
    title: "Account Settings",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    showBackButton: true,
    actions: [
      {
        name: "activity",
        label: "Activity",
        variant: "text",
        actionId: "activity",
      },
      {
        name: "signout",
        label: "Sign out",
        variant: "text",
        actionId: "signout",
      },
    ],
  },

  // Support camelCase route folder used by (main)/accountSettings
  // note: camelCase folder names like /accountSettings are matched by the
  // normalization in getTopNavBarConfig (hyphen stripping), so an explicit
  // duplicate entry is not required.

  "/profile": {
    title: "Profile",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    // Show back button on profile so users can navigate back from profile pages
    showBackButton: true,
  },

  "/profile/nata-history": {
    title: "NATA History",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    showBackButton: true,
  },

  "/settings": {
    title: "Settings",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    showBackButton: true,
  },

  "/calculator": {
    visible: false, // custom layout / page-managed header
  },

  "/nata-cutoff-calculator": {
    title: "NATA Cutoff Calculator",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    showBackButton: true,
  },

  "/freebooks": {
    title: "Free Books",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    showBackButton: true,
  },

  "/applications": {
    title: "Submitted Applications",
    breadcrumbs: { enabled: true, auto: true },
    segmentLabelMap: globalSegmentLabelMap,
    showBackButton: true,
  },

  "/ask-seniors": {
    visible: false,
  },

  "/auth/login": {
    visible: true,
    backgroundMode: "transparent",
    breadcrumbs: { enabled: false },
  },

  "/auth/forgot": {
    visible: true,
    backgroundMode: "transparent",
    breadcrumbs: { enabled: false },
    showBackButton: true,
  },

  "/auth/complete-signup": {
    visible: false,
  },

  "/auth/action": {
    visible: false,
  },
};

/**
 * Resolve config for a pathname — merges defaults and resolves special dynamic routes.
 * Optionally pass an actionResolver to map actionId/backActionId to runtime callbacks.
 */
export function getTopNavBarConfig(
  pathname: string
  // actionResolver is a runtime map of actionId => function, used inside the TopNavBar component
  // (not used here, but kept for illustration).
  // actionResolver?: (id: string) => (() => void) | undefined
): TopNavBarConfig {
  // handle dynamic application detail route e.g. /applications/:id
  if (pathname.startsWith("/applications/")) {
    return {
      ...DEFAULT_TOP_NAV_CONFIG,
      title: "Application Details",
      segmentLabelMap: globalSegmentLabelMap,
      breadcrumbs: { enabled: true, auto: true },
      showBackButton: true,
    };
  }

  // Normalize pathname matching: allow hyphen / no-hyphen variants to match the
  // same config. This helps when route folders vs. URL keys differ (for
  // example `/application-form` vs `/applicationform`). Matching strategy:
  // 1. exact lookup
  // 2. find any config key whose hyphen-stripped form equals the
  //    hyphen-stripped pathname
  let entry = topNavBarConfigs[pathname];
  if (!entry) {
    const norm = pathname.replace(/-/g, "");
    for (const key of Object.keys(topNavBarConfigs)) {
      if (key.replace(/-/g, "") === norm) {
        entry = topNavBarConfigs[key];
        break;
      }
    }
  }

  return {
    ...DEFAULT_TOP_NAV_CONFIG,
    ...(entry || {}),
  } as TopNavBarConfig;
}

/**
 * Convenience boolean check
 */
export function shouldShowTopNavBar(pathname: string): boolean {
  return getTopNavBarConfig(pathname).visible;
}
