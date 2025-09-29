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

export function HeaderCardDesign({
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
        // Ensure full-width behavior, especially on mobile and within flex layouts
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        alignSelf: "stretch",
        flex: "1 1 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
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
          gap: 1,
          px: 2,
          py: 1,
          minWidth: 0, // allow children to shrink and avoid horizontal overflow
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #f8dfe9 0%, #f3d3e7 100%)"
              : "linear-gradient(180deg, rgba(255,200,220,0.06), rgba(255,190,210,0.04))",
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          {icon ? <Box sx={{ display: "inline-flex" }}>{icon}</Box> : null}
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: 600, color: "text.primary", minWidth: 0 }}
          >
            {title}
          </Typography>
        </Box>

        {onEdit ? (
          <IconButton
            aria-label={`Edit ${title}`}
            size="small"
            onClick={onEdit}
            sx={{ ml: 1, flexShrink: 0 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ p: 2, width: "100%", boxSizing: "border-box" }}>
        {children}
      </Box>
    </Card>
  );
}

export default HeaderCardDesign;
