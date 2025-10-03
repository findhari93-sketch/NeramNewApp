"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import PlayCircleFilledRounded from "@mui/icons-material/PlayCircleFilledRounded";
import Link from "next/link";
import { books, type BookItem } from "../data";

type OneBookProps = {
  item: BookItem;
  index: number;
  variant: "free" | "premium";
};

function OneBook({ item, index, variant }: OneBookProps) {
  const [open, setOpen] = useState(false);
  const handleDialogClose = () => setOpen(false);
  const onOpenBook = () => {
    if (variant === "free") setOpen(true);
    else if (item.bookLink) window.open(item.bookLink, "_blank");
  };
  const onOpenTest = (url?: string) => {
    if (variant === "free") setOpen(true);
    else if (url) window.open(url, "_blank");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Card sx={{ bgcolor: "rgba(255,255,255,0.06)", boxShadow: 4 }}>
        <CardActionArea onClick={onOpenBook} sx={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.bookCoverImg}
            alt={item.bookTitle}
            style={{ width: "100%", height: 220, objectFit: "cover" }}
          />
        </CardActionArea>
        <CardContent>
          <Box display="flex" justifyContent="center" mt={-3} mb={1}>
            <Tooltip
              title={
                variant === "free" ? "Join Premium to access" : "Open book"
              }
            >
              <span>
                <IconButton
                  onClick={onOpenBook}
                  sx={{
                    bgcolor: "var(--yellow)",
                    color: "black",
                    width: 48,
                    height: 48,
                    boxShadow: 3,
                    "&:hover": { bgcolor: "#ffd54f" },
                  }}
                >
                  <PlayCircleFilledRounded />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Typography variant="subtitle2" gutterBottom noWrap>
            <i style={{ opacity: 0.8 }}>Ch {index + 1}:</i>{" "}
            <Box component="span" sx={{ color: "var(--yellow)" }}>
              {item.bookTitle}
            </Box>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {item.writtenBy}
          </Typography>
          <Typography
            variant="caption"
            sx={{ opacity: 0.9 }}
            mt={1}
            display="block"
          >
            Self Evaluation Mock Test
          </Typography>
          <Stack direction="row" spacing={2} mt={1} alignItems="center">
            {[
              item.test1Link,
              item.test2Link,
              item.test3Link,
              item.test4Link,
              item.test5Link,
            ].map((url, i) => (
              <Tooltip
                key={i}
                title={
                  url
                    ? variant === "free"
                      ? "Join Premium to access"
                      : `Open mock test ${i + 1}`
                    : "Not available"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    color="inherit"
                    disabled={!url}
                    onClick={() => onOpenTest(url)}
                  >
                    <DescriptionIcon fontSize="small" />
                    <sup>{i + 1}</sup>
                  </IconButton>
                </span>
              </Tooltip>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="xs">
        <DialogTitle>Get access</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Go Premium to receive access to our NATA self-study resources.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          <Link href="/applicationform" style={{ textDecoration: "none" }}>
            <Button variant="contained">Join Premium</Button>
          </Link>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function Bookslider({
  variant,
}: {
  variant: "free" | "premium";
}) {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const itemsPerView = isMdUp ? 3 : isSmUp ? 2 : 1;
  const gap = 24; // px
  const cardWidth = isMdUp ? 260 : isSmUp ? 240 : 220;
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, books.length - itemsPerView);

  const canPrev = index > 0;
  const canNext = index < maxIndex;
  const onPrev = () => setIndex((i) => Math.max(0, i - 1));
  const onNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  const trackWidth = useMemo(
    () => books.length * (cardWidth + gap) - gap,
    [cardWidth, gap]
  );
  const viewportWidth = useMemo(
    () => itemsPerView * cardWidth + gap * (itemsPerView - 1),
    [itemsPerView, cardWidth, gap]
  );

  return (
    <Box sx={{ position: "relative", px: { xs: 1, sm: 2 }, py: 2 }}>
      {/* Arrows */}
      {books.length > itemsPerView && (
        <>
          <IconButton
            onClick={onPrev}
            disabled={!canPrev}
            sx={{
              position: "absolute",
              left: { xs: -6, sm: -8 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              boxShadow: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ChevronLeftRounded />
          </IconButton>
          <IconButton
            onClick={onNext}
            disabled={!canNext}
            sx={{
              position: "absolute",
              right: { xs: -6, sm: -8 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              boxShadow: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.35)" },
            }}
          >
            <ChevronRightRounded />
          </IconButton>
        </>
      )}

      {/* Viewport */}
      <Box
        sx={{
          width: viewportWidth,
          mx: "auto",
          overflow: "hidden",
        }}
      >
        {/* Track */}
        <Box
          sx={{
            width: trackWidth,
            display: "flex",
            gap: `${gap}px`,
            transform: `translateX(-${index * (cardWidth + gap)}px)`,
            transition: "transform 400ms ease",
          }}
          role="list"
          aria-label="Books carousel"
        >
          {books.map((item, i) => (
            <Box
              key={i}
              role="listitem"
              sx={{ width: cardWidth, flex: "0 0 auto" }}
            >
              <OneBook item={item} index={i} variant={variant} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
