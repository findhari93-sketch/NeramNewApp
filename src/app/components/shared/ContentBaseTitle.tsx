"use client";
import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export type ContentBaseTitleProps = {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
};

export default function ContentBaseTitle({
  primary,
  secondary,
  tertiary,
}: ContentBaseTitleProps) {
  return (
    <Box>
      <Typography
        fontWeight={700}
        fontSize="21px"
        color="#88206d"
        component="p"
        m={0}
      >
        {primary}
      </Typography>
      {secondary ? (
        <Typography
          fontWeight={700}
          fontSize="16px"
          component="p"
          m={0}
          className="mb-1"
        >
          {secondary}
        </Typography>
      ) : null}
      {tertiary ? (
        <Typography
          color="#6e6e6e"
          fontFamily="arial"
          fontSize="14px"
          fontStyle="italic"
          component="p"
          m={0}
        >
          {tertiary}
        </Typography>
      ) : null}
    </Box>
  );
}
