"use client";

import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const TransparentAccordion = (props: any) => (
  <Accordion
    {...props}
    sx={{
      backgroundColor: "transparent",
      color: "white",
      "& .MuiAccordionSummary-expandIconWrapper": { color: "white" },
    }}
  />
);

export default function QuestionAccord({ type }: { type: "free" | "premium" }) {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <Container>
      <TransparentAccordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            1. JEE Question Papers
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            JEE papers list coming soon...
          </Typography>
        </AccordionDetails>
      </TransparentAccordion>
      <TransparentAccordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            2. NATA Question Papers
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            NATA papers list coming soon...
          </Typography>
        </AccordionDetails>
      </TransparentAccordion>
      <TransparentAccordion
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
        sx={{ display: type === "free" ? "block" : "none" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            3. Important Links
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography>
              Go Premium to receive access to our NATA Self study resources
            </Typography>
            <Button href="/applicationform" variant="contained">
              Get access
            </Button>
          </Box>
        </AccordionDetails>
      </TransparentAccordion>
    </Container>
  );
}
