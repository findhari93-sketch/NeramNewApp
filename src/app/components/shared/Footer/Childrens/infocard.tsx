"use client";
import React from "react";
import { Typography, Link as MuiLink } from "@mui/material";
import GridOrig from "@mui/material/Grid";
const Grid: any = GridOrig;
import {
  WhatsApp,
  Twitter,
  LinkedIn,
  Facebook,
  Instagram,
  YouTube,
} from "@mui/icons-material";
import styled from "@emotion/styled";
import Image from "next/image";

const FooterInfo = styled.div`
  .text-foor-card {
    color: var(--yellow);
  }
`;

type SocialItem = { icon: React.ElementType; href: string };

const socialIcons: SocialItem[] = [
  {
    icon: WhatsApp,
    href: "https://api.whatsapp.com/send?phone=918807437399&text=I%20got%20your%20number%20from%20neram%20website.",
  },
  { icon: Twitter, href: "https://twitter.com/neramclassrooms" },
  {
    icon: LinkedIn,
    href: "https://www.linkedin.com/company/neram-classes-online-nata-coaching-center/",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/neramclassesnata",
  },
  { icon: Instagram, href: "https://www.instagram.com/neramclassrooms/" },
  { icon: YouTube, href: "https://www.youtube.com/@neramclassesnata" },
];

const FooterCard: React.FC = () => {
  return (
    <div className="footercard">
      <FooterInfo>
        {/* Fallback to brand logo in /public */}
        <Image
          src="/brand/neramclasses-logo.svg"
          alt="Neram Classes"
          width={160}
          height={40}
          style={{ height: "auto", width: "12rem" }}
        />
        <Typography variant="caption" className="text-foor-card py-3">
          India&apos;s No.1 NATA &amp; JEE Paper 2 Online coaching center
          developed by Alumnus of IITs &amp; NITs.
        </Typography>
        <br />
        <br />
        <Typography variant="caption" className="green-try">
          <strong>NATA Coaching offline centers in</strong>
          <br />
          Chennai | Coimbatore | Madurai | Trichy | Tirupur | Pudukkottai
          <br />
          <br />
          <strong>Phone:</strong> +91 91761 37043
          <br />
          <strong>Email:</strong> info@neramclasses.com
        </Typography>
        <br />
        <br />
        <Grid container spacing={1}>
          {socialIcons.map((Item, index) => {
            const Icon = Item.icon;
            return (
              <Grid item key={index}>
                <MuiLink
                  href={Item.href}
                  color="inherit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </MuiLink>
              </Grid>
            );
          })}
        </Grid>
      </FooterInfo>
    </div>
  );
};

export default FooterCard;
