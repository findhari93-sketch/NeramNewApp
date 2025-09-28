"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { faqItems } from "./data";

export default function FaqAccordion() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box
      sx={{ width: "100%", maxWidth: 900, mx: "auto", px: { xs: 2, md: 0 } }}
    >
      {faqItems.map((faq, index) => (
        <Accordion
          key={index}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{
            mb: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 2,
            "&:before": { display: "none" },
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            "&.Mui-expanded": {
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#88206d" }} />}
            sx={{
              minHeight: 56,
              "&.Mui-expanded": {
                minHeight: 56,
              },
              "& .MuiAccordionSummary-content": {
                margin: "12px 0",
                "&.Mui-expanded": {
                  margin: "12px 0",
                },
              },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#333",
                fontSize: { xs: "0.95rem", md: "1.1rem" },
              }}
            >
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                lineHeight: 1.6,
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
