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
// ListItemText not used; custom NavLinkText used instead
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import Image from "next/image";
import NavbarProfile from "./NavbarProfile";
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
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [scrolled, setScrolled] = React.useState(false);

  type NavItem = { label: string; href: string; badge?: string };
  const menuItems: NavItem[] = [
    { label: "Materials", href: "/", badge: "Free" },
    { label: "NATA", href: "/applicationform", badge: "Syllabus" },
    { label: "JEE B.arch", href: "/about", badge: "Paper 2" },
    { label: "Allumnus", href: "/contact", badge: "Neram Nata" },
    { label: "Contact", href: "/materials", badge: "Office" },
  ];

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUserLabel(null);
        setAvatarUrl(null);
        return;
      }
      const asObj = u as unknown as Record<string, unknown>;
      const displayName =
        typeof asObj.displayName === "string" && asObj.displayName
          ? (asObj.displayName as string)
          : null;
      const email = typeof asObj.email === "string" ? asObj.email : null;
      const phone =
        typeof asObj.phoneNumber === "string"
          ? (asObj.phoneNumber as string)
          : null;
      const photo =
        typeof (asObj as Record<string, unknown>).photoURL === "string"
          ? ((asObj as Record<string, unknown>).photoURL as string)
          : null;
      setUserLabel(
        (displayName as string) ||
          (email as string) ||
          (phone as string) ||
          null
      );
      setAvatarUrl(photo);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
      showBreadcrumbs = true,
      actions = [],
      showBackButton = true,
      onBack,
    } = titleBar;
    const isSmall = window?.matchMedia?.("(max-width:600px)")?.matches ?? false;
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
          px: 2,
          gap: 2,
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
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
          {showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              aria-label="breadcrumb"
              separator="›"
              sx={{
                fontSize: `${TB_BC_FONT}px`,
                color: "text.secondary",
                display: isSmall ? "none" : "flex",
              }}
            >
              {breadcrumbs.map((c, idx) =>
                c.href ? (
                  <Link
                    key={idx}
                    href={c.href}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      fontSize: `${TB_BC_FONT}px`,
                    }}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <Typography
                    key={idx}
                    sx={{ fontSize: `${TB_BC_FONT}px` }}
                    color="text.secondary"
                  >
                    {c.label}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          )}
          <Typography
            sx={{
              fontSize: `${TB_TITLE_FONT}px`,
              fontWeight: 600,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={title}
          >
            {title}
          </Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ display: { xs: "inline-flex", md: "none" } }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Link
              href="/"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Image
                src="/brand/neramclasses-logo.svg"
                alt="Neram Classes"
                width={140}
                height={32}
                priority
                style={{ height: 32, width: "auto" }}
              />
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
                    sx={(theme) => ({
                      width: "1px",
                      height: "2rem",
                      mx: 1,
                      bgcolor: theme.palette.highlight.main,
                      opacity: 0.4,
                      borderRadius: 0.5,
                    })}
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
                  name: userLabel,
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
        <Box sx={{ width: 260 }} role="presentation">
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
          <Divider />
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
                  color="primary"
                  fullWidth
                  startIcon={<LoginRounded />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderWidth: 1.5,
                    py: 1,
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
