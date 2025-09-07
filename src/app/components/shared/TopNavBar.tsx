"use client";
import React from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// ListItemText not used; custom NavLinkText used instead
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import NavbarProfile from "./NavbarProfile";
import { signOut } from "firebase/auth";
import NavLinkText from "./NavLinkText";

export default function TopNavBar() {
  const [open, setOpen] = React.useState(false);
  const [userLabel, setUserLabel] = React.useState<string | null>(null);

  type NavItem = { label: string; href: string; badge?: string };
  const menuItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/applicationform" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    // example item with badge
    { label: "Materials", href: "/materials", badge: "Free" },
  ];

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return setUserLabel(null);
      // Prefer displayName -> email. Do not fall back to phone number for display.
      const asObj = u as unknown as Record<string, unknown>;
      const displayName =
        typeof asObj.displayName === "string" && asObj.displayName
          ? (asObj.displayName as string)
          : null;
      const email = typeof asObj.email === "string" ? asObj.email : null;
      setUserLabel((displayName as string) || (email as string) || null);
    });
    return () => unsub();
  }, []);

  // logout handled by AccountMenu; keep userLabel state here for display

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: (theme) => theme.palette.grey[800] }}
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

            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{ color: "#7c1fa0", fontWeight: 700 }}
              >
                Neram
              </Typography>
            </Link>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, ml: 2 }}>
              {menuItems.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  style={{ textDecoration: "none" }}
                >
                  <Button>
                    <NavLinkText primary={m.label} badge={m.badge ?? null} />
                  </Button>
                </Link>
              ))}
            </Box>
          </Box>

          <Box>
            {userLabel ? (
              <NavbarProfile
                user={{ id: userLabel, name: userLabel, role: "Visitor" }}
                onSignOut={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.warn("signOut error", e);
                  }
                  try {
                    localStorage.removeItem("phone_verified");
                    localStorage.removeItem("linkedin_token");
                  } catch {}
                }}
              />
            ) : (
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button variant="text">Log in / Sign up</Button>
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
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <Button variant="contained" fullWidth>
                Log in / Sign up
              </Button>
            </Link>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
