"use client";

import React, { Suspense, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import HeroWaves from "../homepage/sections/Hero/HeroWaves";
import Footer from "../../components/shared/Footer/footer";
import NataCutoffCalculator from "./components/nataCutoffCalculator";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function NataCutoffCalculatorPage() {
  const router = useRouter();
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    const current = auth.currentUser;
    setLoginPromptOpen(!current);
    const unsub = onAuthStateChanged(auth, (u) => {
      setLoginPromptOpen(!u);
    });
    return () => unsub();
  }, []);

  const goToLogin = () => {
    router.push("/auth/login?next=/nata-cutoff-calculator");
  };

  return (
    <Suspense fallback={null}>
      <Box
        sx={{
          minHeight: "100dvh",
          color: "white",
          backgroundImage:
            "url('/images/SVG/Asset6.svg'), linear-gradient(295deg, #2b2d4e 1.557%, #e1148b 101.349%)",
          backgroundBlendMode: "multiply",
          backgroundRepeat: "repeat, no-repeat",
          backgroundSize: "auto, cover",
          backgroundPosition: "top left, center",
        }}
      >
        <Box sx={{ pt: { xs: "110px", md: "120px" } }} />

        <Box component="main" sx={{ minHeight: "50vh", px: 2, pb: 6 }}>
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "25rem 1fr" },
              gap: { xs: 2, md: 2 },
              alignItems: "start",
            }}
          >
            <NataCutoffCalculator />

            <Box
              sx={{
                position: { md: "sticky" },
                top: { md: 100 },
                width: "100%",
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  How the cutoff is calculated
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  Your final B.Arch cutoff is computed out of 400 using this
                  formula:
                </Typography>
                <Box
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: (t) => t.palette.action.hover,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  (Academic Percentage × 2) + Best NATA Score = Final Cutoff
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Eligibility rules
                </Typography>
                <List dense sx={{ pt: 0 }}>
                  <ListItem disableGutters sx={{ py: 0.25 }}>
                    <ListItemText
                      primary="Academic: minimum 50%"
                      secondary="Calculated from (Mark Scored ÷ Maximum Mark) × 100"
                    />
                  </ListItem>
                  <ListItem disableGutters sx={{ py: 0.25 }}>
                    <ListItemText
                      primary="NATA: minimum 70 marks"
                      secondary="Among up to three attempts, the highest score is used"
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Example
                </Typography>
                <Box sx={{ fontSize: 14, mb: 2 }}>
                  <Box>{`Mark Scored = 430, Maximum Mark = 600 → Academic % = 71.67%`}</Box>
                  <Box>{`Board out of 200 = 71.67 × 2 = 143.33`}</Box>
                  <Box>{`NATA scores = [64, 78, 85] → Best = 85`}</Box>
                  <Box
                    fontWeight={700}
                  >{`Final Cutoff = 143.33 + 85 = 228.33 / 400`}</Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary">
                  Note: This tool is for guidance only. Always verify official
                  admission requirements and procedures with the relevant
                  authorities.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <div style={{ position: "relative" }}>
          <HeroWaves position="top" bgcolor="#fff" />
          <Footer />
        </div>

        <Dialog open={loginPromptOpen} onClose={() => {}} disableEscapeKeyDown>
          <DialogTitle>Login required</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Please log in to save your NATA calculations and view history.
              You’ll be brought back here after login.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={goToLogin} autoFocus>
              Log in
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Suspense>
  );
}
