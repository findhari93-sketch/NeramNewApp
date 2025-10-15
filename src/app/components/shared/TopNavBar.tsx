"use client";
import React from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import LoginRounded from "@mui/icons-material/LoginRounded";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavbarProfile from "./NavbarProfile";
import { titleCase } from "../../../lib/stringUtils";
import { NeramLogo, MobileLogo } from "./NeramLogo/NeramLogo";
import { signOut } from "firebase/auth";
import NavLinkText from "./NavLinkText";

type TopNavBarProps = {
  // Controls initial background behavior:
  // - 'transparent' (default): transparent at top; gradient appears on scroll
  // - 'gradient': gradient is shown even at top
  backgroundMode?: "transparent" | "gradient";
  // Optional titleBar to render attached directly beneath the TopNavBar.
  // If omitted the titlebar is not shown.
  titleBar?: {
    visible?: boolean;
    title: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    // If true, generate breadcrumbs automatically from the URL
    autoBreadcrumbs?: boolean;
    // Optional map to customize segment labels (e.g., { applicationform: "Application Form" })
    segmentLabelMap?: Record<string, string>;
    showBreadcrumbs?: boolean;
    actions?: Array<{
      name: string;
      label: string;
      variant?: "text" | "outlined" | "contained";
      onClick?: () => void;
    }>;
    showBackButton?: boolean;
    onBack?: () => void;
  };
};

export default function TopNavBar({
  backgroundMode = "transparent",
  titleBar,
}: TopNavBarProps) {
  const [open, setOpen] = React.useState(false);
  const [userLabel, setUserLabel] = React.useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      // Prefer per-uid cache if we already have a currentUser; fall back to last or user.photoURL
      const u = (auth as any)?.currentUser as any | null | undefined;
      let used: string | null = null;
      const uid = u?.uid as string | undefined;
      if (uid) {
        const rawUid = localStorage.getItem(`avatar-cache:${uid}`);
        if (rawUid) {
          try {
            const parsed = JSON.parse(rawUid) as Record<string, any>;
            used =
              (parsed?.dataUrl as string) || (parsed?.url as string) || null;
          } catch {}
        }
      }
      if (!used) {
        const rawLast = localStorage.getItem("avatar-cache:last");
        if (rawLast) {
          try {
            const parsedLast = JSON.parse(rawLast) as Record<string, any>;
            if (!parsedLast?.uid || (uid && parsedLast.uid === uid)) {
              used = (parsedLast?.photo as string) ?? null;
            }
          } catch {}
        }
      }
      if (!used && u && typeof u.photoURL === "string")
        used = u.photoURL as string;
      return used;
    } catch {
      return null;
    }
  });
  const [scrolled, setScrolled] = React.useState(false);
  // Track small-screen state on client only to avoid SSR `window` access
  const [isSmall, setIsSmall] = React.useState(false);
  const pathname = usePathname();

  type NavItem = { label: string; href: string; badge?: string };
  const menuItems: NavItem[] = [
    { label: "Materials", href: "/freebooks", badge: "Free" },
    { label: "NATA", href: "/applicationform", badge: "Syllabus" },
    { label: "JEE B.arch", href: "/about", badge: "Paper 2" },
    { label: "Allumnus", href: "/contact", badge: "Neram Nata" },
    { label: "Contact", href: "/materials", badge: "Office" },
  ];

  React.useEffect(() => {
    // Fast path: if we already have a current user, set state immediately (before waiting for auth events)
    const primeFromUser = (u: any | null | undefined) => {
      if (!u) return;
      try {
        const asObj = u as Record<string, unknown>;
        const displayName =
          typeof asObj.displayName === "string" && asObj.displayName
            ? (asObj.displayName as string)
            : null;
        const email =
          typeof asObj.email === "string" ? (asObj.email as string) : null;
        const phone =
          typeof asObj.phoneNumber === "string"
            ? (asObj.phoneNumber as string)
            : null;
        setUserLabel(displayName || email || phone || null);
        // avatar from per-uid cache -> last -> photoURL
        const uid = (u as any)?.uid as string | undefined;
        let used: string | null = null;
        if (uid) {
          const rawUid = localStorage.getItem(`avatar-cache:${uid}`);
          if (rawUid) {
            try {
              const parsed = JSON.parse(rawUid) as Record<string, any>;
              used =
                (parsed?.dataUrl as string) || (parsed?.url as string) || null;
            } catch {}
          }
        }
        if (!used) {
          const rawLast = localStorage.getItem("avatar-cache:last");
          if (rawLast) {
            try {
              const parsedLast = JSON.parse(rawLast) as Record<string, any>;
              if (!parsedLast?.uid || (uid && parsedLast.uid === uid)) {
                used = (parsedLast?.photo as string) ?? null;
              }
            } catch {}
          }
        }
        if (!used && typeof (asObj as any).photoURL === "string") {
          used = (asObj as any).photoURL as string;
        }
        if (used) setAvatarUrl(used);
      } catch {}
    };

    try {
      primeFromUser((auth as any)?.currentUser as any);
    } catch {}

    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUserLabel(null);
        setAvatarUrl(null);
        return;
      }
      primeFromUser(u);

      (async () => {
        try {
          const uid = (u as any).uid as string | undefined;
          if (!uid) return;
          const res = await fetch(
            `/api/avatar-url?userId=${encodeURIComponent(uid)}&expires=300`
          );
          if (!res.ok) return;
          const j = await res.json();
          if (j?.signedUrl) {
            setAvatarUrl(j.signedUrl as string);
            try {
              localStorage.setItem(
                "avatar-cache:last",
                JSON.stringify({
                  uid,
                  photo: j.signedUrl,
                  fetchedAt: Date.now(),
                })
              );
              try {
                window.dispatchEvent(
                  new CustomEvent("avatar-updated", {
                    detail: { uid, photo: j.signedUrl },
                  })
                );
              } catch {}
            } catch {}
          }
        } catch {
          // ignore network errors
        }
      })();
    });
    // listen for in-page avatar updates (dispatched by profile upload flow)
    const onAvatarUpdated = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as
          | { uid?: string; photo?: string }
          | undefined;
        const curUid = (auth.currentUser as any)?.uid;
        if (!detail || !detail.photo) return;
        if (detail.uid && curUid && detail.uid !== curUid) return;
        setAvatarUrl(detail.photo);
      } catch {}
    };
    window.addEventListener("avatar-updated", onAvatarUpdated as EventListener);
    // also listen to storage changes from other tabs
    const onStorage = (ev: StorageEvent) => {
      try {
        if (ev.key !== "avatar-cache:last") return;
        if (!ev.newValue) return;
        const parsed = JSON.parse(ev.newValue) as Record<string, any>;
        const curUid = (auth.currentUser as any)?.uid;
        if (!parsed?.uid || parsed.uid === curUid) {
          if (parsed.photo) setAvatarUrl(parsed.photo);
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener(
        "avatar-updated",
        onAvatarUpdated as EventListener
      );
      window.removeEventListener("storage", onStorage as EventListener);
    };
  }, []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // matchMedia listener for small-screen detection
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function"
      ) {
        const mq = window.matchMedia("(max-width:600px)");
        const mqHandler = (ev: MediaQueryListEvent) => setIsSmall(ev.matches);
        // set initial
        setIsSmall(mq.matches);
        if (mq.addEventListener) mq.addEventListener("change", mqHandler);
        else mq.addListener(mqHandler as any);
        return () => {
          window.removeEventListener("scroll", onScroll);
          if (mq.removeEventListener)
            mq.removeEventListener("change", mqHandler);
          else mq.removeListener(mqHandler as any);
        };
      }
    } catch {
      // ignore; fallback to default
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showGradient = backgroundMode === "gradient" || scrolled;

  // Titlebar constants (match requirements)
  const TB_HEIGHT = 45;
  const TB_TITLE_FONT = 15;
  const TB_BC_FONT = 12;
  const TB_ACTION_HEIGHT = 28;

  const renderTitleBar = () => {
    if (!titleBar || titleBar.visible === false) return null;
    const {
      title,
      breadcrumbs,
      autoBreadcrumbs,
      segmentLabelMap,
      showBreadcrumbs = true,
      actions = [],
      showBackButton = true,
      onBack,
    } = titleBar;
    // Build breadcrumbs automatically from the current pathname if requested or when none provided
    const computedCrumbs: Array<{ label: string; href?: string }> = (() => {
      try {
        const list: Array<{ label: string; href?: string }> = [];
        // Always show Home
        list.push({ label: "Home", href: "/" });
        if (!pathname || pathname === "/") return list;
        const parts = pathname.split("/").filter(Boolean).slice(0, 6); // cap length to avoid overly long crumbs
        let acc = "";
        parts.forEach((seg, idx) => {
          acc += "/" + seg;
          // Hide obvious dynamic IDs and common technical segments
          const isIdLike = /^(?:[0-9a-fA-F-]{8,}|\[.*\]|id|\d+)$/.test(seg);
          if (isIdLike) return;
          const label =
            (segmentLabelMap && segmentLabelMap[seg]) ||
            seg.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
          list.push({ label, href: idx < parts.length - 1 ? acc : undefined });
        });
        // Prefer the provided page title as final crumb label if available
        if (title && list.length > 0) {
          list[list.length - 1] = { label: title, href: undefined };
        }
        return list;
      } catch {
        return (breadcrumbs as Array<{ label: string; href?: string }>) || [];
      }
    })();
    // use isSmall state set on the client by the effect above
    const visibleLimit = isSmall ? 1 : 2;
    const visibleActions = actions.slice(0, visibleLimit);
    const overflowActions = actions.slice(visibleLimit);

    return (
      <Box
        sx={(theme) => ({
          height: `${TB_HEIGHT}px`,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          gap: 2,
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: "0 0 auto",
          }}
        >
          {showBackButton && (
            <IconButton
              onClick={() => (onBack ? onBack() : window.history.back())}
              aria-label="back"
              size="large"
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          {" "}
          <Typography
            sx={{
              fontSize: `${TB_TITLE_FONT}px`,
              fontWeight: 600,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "neramPurple.main",
            }}
            title={title}
          >
            {title}
          </Typography>
          {showBreadcrumbs && (
            <Breadcrumbs
              aria-label="breadcrumb"
              separator="›"
              sx={{
                fontSize: { xs: "10px", sm: `${TB_BC_FONT}px` },
                color: "neramPurple.light",
                display: "flex",
              }}
            >
              {(autoBreadcrumbs || !breadcrumbs || breadcrumbs.length === 0
                ? computedCrumbs
                : breadcrumbs
              ).map((c, idx) =>
                c.href ? (
                  <Link
                    key={idx}
                    href={c.href}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <Typography
                    key={idx}
                    component="span"
                    variant="inherit"
                    sx={{ fontSize: "inherit", color: "inherit" }}
                  >
                    {c.label}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: "0 0 auto",
          }}
        >
          {visibleActions.map((a) => (
            <Button
              key={a.name}
              onClick={() => a.onClick && a.onClick()}
              variant={a.variant ?? "text"}
              size="small"
              aria-label={a.label}
              sx={{
                height: `${TB_ACTION_HEIGHT}px`,
                minHeight: `${TB_ACTION_HEIGHT}px`,
                textTransform: "none",
                fontSize: 13,
                px: 1.5,
              }}
            >
              {a.label}
            </Button>
          ))}
          {overflowActions.length > 0 && (
            <>
              <IconButton aria-label="more actions" size="large">
                <MenuIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        color="transparent"
        sx={(theme) => ({
          bgcolor: "transparent",
          backgroundImage: showGradient ? theme.gradients.brand() : "none",
          boxShadow: scrolled ? theme.shadows[6] : "none",
          transition: "background-image 200ms ease, box-shadow 200ms ease",
          zIndex: theme.zIndex.appBar,
        })}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "#fff",
              }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              {/* Desktop Logo */}
              <NeramLogo
                sx={{ display: { xs: "none", md: "flex" }, height: 32 }}
              />
              {/* Mobile Logo */}
              <MobileLogo sx={{ display: { xs: "flex", md: "none" } }} />
            </Link>
          </Box>

          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {menuItems.map((m, idx) => (
              <React.Fragment key={m.href}>
                <Link href={m.href} style={{ textDecoration: "none" }}>
                  <Button>
                    <NavLinkText primary={m.label} badge={m.badge ?? null} />
                  </Button>
                </Link>
                {idx < menuItems.length - 1 ? (
                  <Box
                    aria-hidden
                    sx={{
                      width: "2px",
                      height: "25px",
                      mx: 1,
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderRadius: 0.5,
                      alignSelf: "center",
                    }}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </Box>

          <Box>
            {userLabel ? (
              <NavbarProfile
                user={{
                  id: userLabel,
                  name: titleCase(userLabel) ?? userLabel,
                  role: "Visitor",
                  avatarUrl: avatarUrl,
                }}
                showDetails={false}
                onSignOut={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.warn("signOut error", e);
                  }
                  try {
                    localStorage.removeItem("phone_verified");
                  } catch {}
                }}
              />
            ) : (
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LoginRounded />}
                  sx={(theme) => ({
                    textTransform: "none",
                    borderColor: theme.palette.white.main,
                    color: theme.palette.white.main,
                    borderWidth: 1.5,
                    borderRadius: 999,
                    px: 1.75,
                    py: 0.5,
                    "&:hover": {
                      borderColor: theme.palette.white.main,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  })}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </Box>
        </Toolbar>
        {/* Render the TitleBar inside the AppBar so it is attached to the bottom
            of the AppBar and not visually hidden behind it. */}
        {renderTitleBar()}
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box
          sx={(theme) => ({
            width: 260,
            backgroundImage: theme.gradients.brand(),
            height: "100%",
            color: "white",
          })}
          role="presentation"
        >
          {/* Logo section at the top */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Link
              href="/"
              style={{ textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              <NeramLogo sx={{ height: 28 }} />
            </Link>
          </Box>

          <List>
            {menuItems.map((m) => (
              <ListItem key={m.href} disablePadding>
                <Link
                  href={m.href}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <ListItemButton onClick={() => setOpen(false)}>
                    <NavLinkText primary={m.label} badge={m.badge ?? null} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
          <Divider
            orientation="vertical"
            sx={{
              alignSelf: "center",
              height: "25px",
              borderRightWidth: "2px",
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />
          <Box sx={{ p: 2 }}>
            {userLabel ? (
              <Link
                href="/profile"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Button variant="contained" fullWidth>
                  Go to Profile
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LoginRounded />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderWidth: 1.5,
                    py: 1,
                    borderColor: "white !important",
                    color: "white !important",
                    "&:hover": {
                      borderColor: "white !important",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      color: "white !important",
                    },
                  }}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Drawer>
      {renderTitleBar()}
    </>
  );
}
