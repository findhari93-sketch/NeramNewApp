"use client";
import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import ProfileMenu from "../../components/shared/ProfileMenu";
import type { User } from "../../components/shared/types";

const mockUser: User = {
  id: "u123",
  name: "Subramanya",
  role: "Visitor",
  avatarUrl: null,
  plan: "Free",
  storageFull: true,
};

export default function DemoProfileMenuPage() {
  return (
    <Container sx={{ mt: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <ProfileMenu
          user={mockUser}
          onSignOut={() => {
            /* noop */
          }}
        />
      </Box>
    </Container>
  );
}
