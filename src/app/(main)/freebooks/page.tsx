"use client";

import React from "react";
import Box from "@mui/material/Box";
import {
  BottomNavigation,
  BottomNavigationAction,
  Container,
} from "@mui/material";
import { Home, QuestionAnswer, Link as LinkIcon } from "@mui/icons-material";
import Bookslider from "./comps/Bookslider";
import QuestionAccord from "./comps/QuestionAccord";

export default function FreeBooksPage() {
  const [value, setValue] = React.useState(0);
  const [showBookslider, setShowBookslider] = React.useState(true);
  const [showQuestionAccord, setShowQuestionAccord] = React.useState(false);

  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        backgroundImage: theme.gradients.brand(),
        color: "white",
        pb: 8, // space for bottom nav
      })}
    >
      <Container sx={{ pt: { xs: 10, sm: 12 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: value !== 1 && value !== 2 ? "center" : "stretch",
            alignItems: value !== 1 && value !== 2 ? "center" : "flex-start",
            minHeight: { xs: "calc(100vh - 200px)", sm: 400 },
          }}
        >
          {value === 0 && showBookslider && <Bookslider variant="free" />}
          {value === 1 && showQuestionAccord && <QuestionAccord type="free" />}
        </Box>
      </Container>

      <Box
        className="bottom-navigation"
        sx={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: (t) => t.zIndex.appBar,
          px: 2,
          pb: 1,
        }}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
            if (newValue === 0) {
              setShowBookslider(true);
              setShowQuestionAccord(false);
            } else if (newValue === 1) {
              setShowBookslider(false);
              setShowQuestionAccord(true);
            }
          }}
          sx={{
            bgcolor: "var(--yellow)",
            width: { xs: "100%", sm: 400 },
            borderRadius: { xs: 0, sm: "10px 10px 0 0" },
          }}
        >
          <BottomNavigationAction label="Books" icon={<Home />} />
          <BottomNavigationAction label="Q.Bank" icon={<QuestionAnswer />} />
          <BottomNavigationAction
            label="Imp.Links"
            icon={<LinkIcon />}
            disabled
          />
        </BottomNavigation>
      </Box>
    </Box>
  );
}
