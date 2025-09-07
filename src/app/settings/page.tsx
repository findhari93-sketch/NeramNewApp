import React from "react";
import TopNavBar from "../components/shared/TopNavBar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function SettingsPage() {
  return (
    <>
      <TopNavBar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Settings</Typography>
        <Typography>Placeholder for settings.</Typography>
      </Container>
    </>
  );
}
