"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useTheme } from "@mui/material/styles";
import type { TeamMember } from "./data";

type Props = {
  member: TeamMember;
};

export default function TeamCard({ member }: Props) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      {/* Photo with hover overlay */}
      <Box
        sx={{
          position: "relative",
          width: 200,
          height: 200,
          borderRadius: "50%",
          overflow: "hidden",
          mb: 2,
          cursor: "pointer",
          flexShrink: 0,
          "&:hover .overlay": {
            visibility: "visible",
            height: "100%",
            color: "#fff",
          },
          "&:hover .image": {
            transform: "scale(1.1) rotate(1deg) translateY(12px)",
          },
        }}
      >
        <Image
          src={member.photo}
          alt={member.alt}
          width={200}
          height={200}
          className="image"
          style={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            objectPosition: "center top",
            transition: "all 0.4s ease-in-out",
            display: "block",
          }}
        />
        <Box
          className="overlay"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 0,
            backgroundColor: member.background,
            boxShadow: "-15px 16px 14px -11px rgba(0, 0, 0, 0.42) inset",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10%",
            padding: 2,
            color: "transparent",
            visibility: "hidden",
            overflow: "hidden",
            transition: "all 0.3s ease-in-out",
            zIndex: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "16px",
              mb: 1,
              textAlign: "center",
            }}
          >
            {member.description}
          </Typography>
          {member.linkedin && (
            <Link
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <LinkedInIcon
                sx={{
                  fontSize: 24,
                  "&:hover": {
                    opacity: 0.6,
                  },
                }}
              />
            </Link>
          )}
        </Box>
      </Box>

      {/* Team member info */}
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.custom?.violet ?? theme.palette.primary.main,
            fontWeight: 600,
            mb: 1,
          }}
        >
          {member.name}
        </Typography>
        <Box
          component="hr"
          sx={{
            margin: "1rem 0",
            border: 0,
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            width: "80%",
            mx: "auto",
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {member.role}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#6e6e6e",
            fontStyle: "italic",
            fontSize: "14px",
          }}
        >
          {member.job}
        </Typography>
      </Box>
    </Box>
  );
}
