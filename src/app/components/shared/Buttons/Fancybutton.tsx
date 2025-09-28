"use client";
import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { pink } from "@mui/material/colors";

// Custom Button with pink styling
const CustomButton = styled(Button)<{
  variant?: "contained" | "outlined" | "text";
}>(({ variant }) => ({
  color: variant === "contained" ? "white" : "white",
  border: variant === "outlined" ? "2px solid white" : "none",
  borderRadius: "40px",
  textTransform: "none",
  backgroundColor: variant === "contained" ? pink.A400 : "transparent",
  "&:hover": {
    border:
      variant === "outlined" ? "2px solid white" : `2px solid ${pink.A400}`,
    color: variant === "outlined" ? pink.A400 : pink.A400,
    backgroundColor: variant === "outlined" ? "white" : "white",
  },
}));

// Gradient Button Component
interface GradientButtonProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  fullWidth,
  onClick,
  variant = "contained",
  size = "medium",
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      sx={{
        background: "linear-gradient(to right, #FFCE31, #FF3D00)",
        color: "white",
        borderRadius: "40px",
        textTransform: "none",
        "&:hover": {
          background: "linear-gradient(to right, #FFCE31, #FF3D00)",
          opacity: 0.9,
        },
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </Button>
  );
};

// Highlight Button with shiny animation
const HighlightButton = styled(Button)({
  textTransform: "none",
  borderRadius: "40px",
  background:
    "linear-gradient(103deg, rgb(251 33 134) 0%, rgb(76 234 139) 100%)",
  overflow: "hidden",
  position: "relative",
  transition: "all 0.3s ease",
  color: "white",

  "&:hover": {
    opacity: 0.7,
  },

  "&::before": {
    content: '""',
    position: "absolute",
    display: "inline-block",
    top: "-180px",
    left: 0,
    width: "30px",
    height: "100%",
    background: "#fff",
    animation: "shinyBtnAnimation 3s ease-in-out infinite",
  },

  "&:active": {
    boxShadow: `
      4px 4px 6px 0 rgba(255, 255, 255, 0.3),
      -4px -4px 6px 0 rgba(116, 125, 136, 0.2),
      inset -4px -4px 6px 0 rgba(255, 255, 255, 0.2),
      inset 4px 4px 6px 0 rgba(0, 0, 0, 0.2)
    `,
  },

  // Add keyframes to the component
  [`@keyframes shinyBtnAnimation`]: {
    "0%": {
      transform: "scale(0) rotate(45deg)",
      opacity: 0,
    },
    "80%": {
      transform: "scale(0) rotate(45deg)",
      opacity: 0.5,
    },
    "81%": {
      transform: "scale(4) rotate(45deg)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(50) rotate(45deg)",
      opacity: 0,
    },
  },
});

// Highlight Button Component
interface HighlightButtonProps {
  children: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  onClick?: () => void;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export const HilightBtn: React.FC<HighlightButtonProps> = ({
  children,
  variant = "contained",
  onClick,
  size = "large",
  fullWidth,
}) => {
  return (
    <HighlightButton
      variant={variant}
      size={size}
      onClick={onClick}
      sx={{ width: fullWidth ? "100%" : "auto" }}
    >
      {children}
    </HighlightButton>
  );
};

// Main Custom Button Component
interface MyButtonProps {
  children: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  onClick?: () => void;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const MyButton: React.FC<MyButtonProps> = ({
  children,
  variant = "contained",
  onClick,
  size = "large",
  fullWidth,
}) => {
  return (
    <CustomButton
      variant={variant}
      size={size}
      onClick={onClick}
      sx={{ width: fullWidth ? "100%" : "auto" }}
    >
      {children}
    </CustomButton>
  );
};

export default MyButton;
