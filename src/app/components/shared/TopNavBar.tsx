"use client";
import React from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LoginRounded from "@mui/icons-material/LoginRounded";
import HomeRounded from "@mui/icons-material/HomeRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
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
import { usePathname, useRouter } from "next/navigation";
import NavbarProfile from "./NavbarProfile";
import { titleCase } from "../../../lib/stringUtils";
import { NeramLogo, MobileLogo } from "./NeramLogo/NeramLogo";
import { signOut } from "firebase/auth";
import NavLinkText from "./NavLinkText";

// Menu items are static; keep at module scope to avoid re-creating on each render
const MENU_ITEMS: Array<{ label: string; href: string; badge?: string }> = [
  { label: "Materials", href: "/materials", badge: "Free" },
  {
    label: "NATA",
    href: "/nata-preparation-guide#syllabus",
    badge: "Syllabus",
  },
  {
    label: "JEE B.Arch",
    href: "/jee-paper-2-preparation#syllabus",
    badge: "Paper 2",
  },
  { label: "Neram NATA", href: "/alumni", badge: "Alumni" },
  { label: "Contact", href: "/contact", badge: "Office" },
];

const MORE_MENU_ITEMS: Array<{ label: string; href: string }> = [
  { label: "NATA Preparation Guide", href: "/nata-preparation-guide" },
  { label: "JEE Paper 2 Preparation", href: "/jee-paper-2-preparation" },
  { label: "Best Books - NATA & JEE", href: "/best-books-nata-jee" },
  { label: "Previous Year Papers", href: "/previous-year-papers" },
  { label: "How to Score 150 in NATA", href: "/how-to-score-150-in-nata" },
  { label: "NATA Cutoff Calculator", href: "/nata-cutoff-calculator" },
  { label: "Free Books", href: "/freebooks" },
  { label: "Ask Seniors", href: "/askSeniors" },
  { label: "Premium", href: "/premium" },
  { label: "Careers", href: "/careers" },
  { label: "Application Form", href: "/applicationform" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

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
  const [moreMenuAnchor, setMoreMenuAnchor] =
    React.useState<null | HTMLElement>(null);
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
  const router = useRouter();
  const handleCloseDrawer = React.useCallback(() => setOpen(false), []);
  const openDrawer = React.useCallback(() => setOpen(true), []);

  // Extract titleBar pieces for memoization/hooks below
  const tbTitle = titleBar?.title;
  const tbBreadcrumbs = titleBar?.breadcrumbs;
  const tbAutoBreadcrumbs = titleBar?.autoBreadcrumbs;
  const tbSegmentLabelMap = titleBar?.segmentLabelMap;
  const tbShowBreadcrumbs = titleBar?.showBreadcrumbs ?? true;
  const tbActions = React.useMemo(
    () => titleBar?.actions ?? [],
    [titleBar?.actions]
  );
  const tbShowBackButton = titleBar?.showBackButton ?? true;
  const tbOnBack = titleBar?.onBack;

  // Memoize computed breadcrumbs and action slices at component level
  const computedCrumbs = React.useMemo(() => {
    try {
      const list: Array<{ label: string; href?: string }> = [];
      // Always show Home
      list.push({ label: "Home", href: "/" });
      if (!pathname || pathname === "/") return list;
      const parts = pathname.split("/").filter(Boolean).slice(0, 6); // cap length
      let acc = "";
      parts.forEach((seg, idx) => {
        acc += "/" + seg;
        const isIdLike = /^(?:[0-9a-fA-F-]{8,}|\[.*\]|id|\d+)$/.test(seg);
        if (isIdLike) return;
        const normalized = seg;
        const label =
          (tbSegmentLabelMap && tbSegmentLabelMap[normalized]) ||
          normalized
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (m) => m.toUpperCase());
        list.push({ label, href: idx < parts.length - 1 ? acc : undefined });
      });
      if (tbTitle && list.length > 0) {
        list[list.length - 1] = { label: tbTitle, href: undefined };
      }
      return list;
    } catch {
      return (tbBreadcrumbs as Array<{ label: string; href?: string }>) || [];
    }
  }, [pathname, tbTitle, tbSegmentLabelMap, tbBreadcrumbs]);

  const visibleLimit = isSmall ? 1 : 2;
  const visibleActions = React.useMemo(
    () => tbActions.slice(0, visibleLimit),
    [tbActions, visibleLimit]
  );
  const overflowActions = React.useMemo(
    () => tbActions.slice(visibleLimit),
    [tbActions, visibleLimit]
  );

  // menuItems moved to module-scope as MENU_ITEMS

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
    const onAvatarUpdated = (
      ev: CustomEvent<{ uid?: string; photo?: string }>
    ) => {
      try {
        const detail = ev?.detail;
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
    // use tb* memoized values computed at component level
    const title = tbTitle;
    const breadcrumbs = tbBreadcrumbs;
    const autoBreadcrumbs = tbAutoBreadcrumbs;
    const showBreadcrumbs = tbShowBreadcrumbs;

    const showBackButton = tbShowBackButton;
    const onBack = tbOnBack;

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
              onClick={() => (onBack ? onBack() : router.back())}
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
              role="navigation"
              aria-label="Main breadcrumb"
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
              ).map((c, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return c.href ? (
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
                    aria-current={isLast ? "page" : undefined}
                    sx={{ fontSize: "inherit", color: "inherit" }}
                  >
                    {c.label}
                  </Typography>
                );
              })}
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
        aria-label="Top navigation"
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
              onClick={openDrawer}
            >
              <MenuIcon />
            </IconButton>

            <Link
              href="/"
              aria-label="Neram home"
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
            {MENU_ITEMS.map((m, idx) => {
              const isActive =
                !!pathname &&
                (pathname === m.href || pathname.startsWith(m.href + "/"));
              return (
                <React.Fragment key={m.href}>
                  <Link href={m.href} style={{ textDecoration: "none" }}>
                    <Button
                      aria-current={isActive ? "page" : undefined}
                      aria-label={m.label}
                      sx={
                        isActive
                          ? { fontWeight: 600, textDecoration: "underline" }
                          : undefined
                      }
                    >
                      <NavLinkText primary={m.label} badge={m.badge ?? null} />
                    </Button>
                  </Link>
                  {idx < MENU_ITEMS.length - 1 ? (
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
              );
            })}
            {/* More Menu Button */}
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
            <Button
              aria-label="More menu"
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={(theme) => ({
                color: theme.palette.custom.yellow,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(255,251,1,0.08)",
                },
              })}
            >
              More
            </Button>
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
              <Link
                href={pathname === "/auth/login" ? "/" : "/auth/login"}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={
                    pathname === "/auth/login" ? (
                      <HomeRounded />
                    ) : (
                      <LoginRounded />
                    )
                  }
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
                  {pathname === "/auth/login" ? "Home" : "Sign In"}
                </Button>
              </Link>
            )}
          </Box>
        </Toolbar>
        {/* Render the TitleBar inside the AppBar so it is attached to the bottom
      of the AppBar and not visually hidden behind it. */}
        {renderTitleBar()}
      </AppBar>

      {/* More Menu Dropdown */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPaper-root": {
            maxHeight: 400,
            width: 280,
          },
        }}
      >
        {MORE_MENU_ITEMS.map((item) => (
          <MenuItem
            key={item.href}
            onClick={() => {
              setMoreMenuAnchor(null);
              router.push(item.href);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(128, 90, 213, 0.08)",
              },
            }}
          >
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      <Drawer open={open} onClose={handleCloseDrawer} role="presentation">
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
            <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Link
                href="/"
                style={{ textDecoration: "none" }}
                onClick={handleCloseDrawer}
              >
                <NeramLogo sx={{ height: 28 }} />
              </Link>
              <IconButton
                aria-label="close menu"
                onClick={handleCloseDrawer}
                sx={{ color: "white" }}
                autoFocus
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <List>
            {MENU_ITEMS.map((m) => {
              const isActive =
                !!pathname &&
                (pathname === m.href || pathname.startsWith(m.href + "/"));
              return (
                <ListItem key={m.href} disablePadding>
                  <Link
                    href={m.href}
                    style={{ textDecoration: "none", width: "100%" }}
                  >
                    <ListItemButton
                      onClick={handleCloseDrawer}
                      aria-current={isActive ? "page" : undefined}
                      sx={
                        isActive
                          ? { fontWeight: 600, textDecoration: "underline" }
                          : undefined
                      }
                    >
                      <NavLinkText primary={m.label} badge={m.badge ?? null} />
                    </ListItemButton>
                  </Link>
                </ListItem>
              );
            })}
          </List>
          <Divider
            sx={{
              borderColor: "rgba(255,255,255,0.15)",
            }}
          />
          {/* More Menu Items in Mobile Drawer */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
            >
              MORE PAGES
            </Typography>
          </Box>
          <List sx={{ pt: 0 }}>
            {MORE_MENU_ITEMS.map((item) => (
              <ListItem key={item.href} disablePadding>
                <Link
                  href={item.href}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <ListItemButton onClick={handleCloseDrawer}>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {item.label}
                    </Typography>
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
              <Link
                href={pathname === "/auth/login" ? "/" : "/auth/login"}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={
                    pathname === "/auth/login" ? (
                      <HomeRounded />
                    ) : (
                      <LoginRounded />
                    )
                  }
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
                  {pathname === "/auth/login" ? "Home" : "Sign In"}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
