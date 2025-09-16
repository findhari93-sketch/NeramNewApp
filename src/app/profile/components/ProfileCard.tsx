/**
 * ProfileCard.tsx
 *
 * Reusable card with a pastel/pink header, left icon, title, and optional Edit button.
 *
 * Example usage:
 * <ProfileCard
 *   title="Contact Details"
 *   icon={<PersonOutlineIcon />}
 *   onEdit={() => openEditDrawer({ title: 'Contact Details', fields: contactFields, values: user }) }
 * >
 *   <Typography>...content...</Typography>
 * </ProfileCard>
 *
 * Props exported: ProfileCardProps
 */

import React, { ReactNode } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import EditIcon from "@mui/icons-material/Edit";

export type ProfileCardProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onEdit?: () => void;
  elevation?: number;
  sx?: SxProps<Theme>;
};

export function ProfileCard({
  title,
  icon,
  children,
  onEdit,
  elevation = 2,
  sx,
}: ProfileCardProps) {
  return (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        // keep header and body contained; header is full width
        ...((sx as any) || {}),
      }}
    >
      <Box
        role="region"
        aria-label={title}
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #f8dfe9 0%, #f3d3e7 100%)"
              : "linear-gradient(180deg, rgba(255,200,220,0.06), rgba(255,190,210,0.04))",
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon ? <Box sx={{ display: "inline-flex" }}>{icon}</Box> : null}
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {title}
          </Typography>
        </Box>

        {onEdit ? (
          <IconButton
            aria-label={`Edit ${title}`}
            size="small"
            onClick={onEdit}
            sx={{ ml: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ p: 2 }}>{children}</Box>
    </Card>
  );
}

export default ProfileCard;
