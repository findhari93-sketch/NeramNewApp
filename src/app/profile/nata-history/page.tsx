"use client";

import React from "react";
import {
  Box,
  Card,
  Container,
  Pagination,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import getNataCalculatorSessions from "../../../lib/getNataCalculatorSessions";
import type { NataCalculatorSession } from "../../../types/db";
import TopNavBar from "../../components/shared/TopNavBar";

export default function NataHistoryPage() {
  const [sessions, setSessions] = React.useState<NataCalculatorSession[]>([]);
  const [page, setPage] = React.useState(1);
  const perPage = 12;

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const map = await getNataCalculatorSessions();
        if (!mounted) return;
        const list = Object.values(map).sort((a, b) =>
          String(b.createdAt).localeCompare(String(a.createdAt))
        ) as NataCalculatorSession[];
        setSessions(list);
      } catch {
        setSessions([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const slice = sessions.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(sessions.length / perPage));

  return (
    <Box>
      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          visible: true,
          title: "NATA Calculator History",
          autoBreadcrumbs: true,
          segmentLabelMap: {
            profile: "Profile",
            "nata-history": "NATA History",
          },
          showBreadcrumbs: true,
          showBackButton: true,
        }}
      />
      <Box sx={{ pt: { xs: "110px", md: "120px" } }} />

      <Container maxWidth="md" sx={{ pb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Your NATA calculations
        </Typography>
        {slice.length === 0 ? (
          <Typography color="text.secondary">No history yet.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {slice.map((s) => (
              <Card key={s.id} variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  gap={1}
                >
                  <Box>
                    <Typography variant="body2">
                      {new Date(s.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {`Board: ${s.result.boardOutOf200}  |  NATA: ${s.result.bestNataScore}  |  Cutoff: ${s.result.finalCutoff}`}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: s.result.eligibleOverall
                          ? "success.main"
                          : "error.main",
                      }}
                    >
                      {s.result.eligibleOverall ? "Eligible" : "Not eligible"}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      href={{ pathname: "/nata-cutoff-calculator" } as any}
                    >
                      Open calculator
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {sessions.length > perPage && (
          <Stack direction="row" justifyContent="center" mt={2}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_, p) => setPage(p)}
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
