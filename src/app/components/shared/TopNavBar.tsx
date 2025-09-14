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
};

export default function TopNavBar({
  backgroundMode = "transparent",
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
    </>
  );
}
