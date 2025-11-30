"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  useMediaQuery,
  Drawer,
  Divider,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TopNavBar from "../../components/shared/TopNavBar";
import Footer from "../../components/shared/Footer/footer";
import Script from "next/script";
import { useTheme } from "@mui/material/styles";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { alumniRecords, getAlumniStats, AlumniRecord } from "@/data/alumni";
import {
  generateBreadcrumbSchema,
  generateAlumniOrganizationSchema,
  generateAlumniPersonSchemas,
  generateWebPageSchema,
} from "@/utils/schemaMarkup";

export default function AlumniPage() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://neramacademy.com";

  // Local filter state
  const [globalFilter, setGlobalFilter] = useState("");
  const [examFilter, setExamFilter] = useState<string | "">("");
  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [collegeTypeFilter, setCollegeTypeFilter] = useState<string | "">("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecord | null>(
    null
  );

  const stats = useMemo(() => getAlumniStats(alumniRecords), []);

  const filteredData = useMemo(() => {
    return alumniRecords.filter((r) => {
      if (
        globalFilter &&
        !(
          `${r.name}`.toLowerCase().includes(globalFilter.toLowerCase()) ||
          r.college.toLowerCase().includes(globalFilter.toLowerCase())
        )
      ) {
        return false;
      }
      if (examFilter && r.exam !== examFilter) return false;
      if (yearFilter && r.year !== yearFilter) return false;
      if (collegeTypeFilter && r.collegeType !== collegeTypeFilter)
        return false;
      return true;
    });
  }, [globalFilter, examFilter, yearFilter, collegeTypeFilter]);

  const columns = useMemo<MRT_ColumnDef<AlumniRecord>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "year", header: "Year" },
      { accessorKey: "exam", header: "Exam" },
      {
        accessorKey: "nataScore",
        header: "NATA Score",
        Cell: ({ cell }) => cell.getValue<number | undefined>() ?? "-",
      },
      {
        accessorKey: "nataRankIndia",
        header: "NATA Rank",
        Cell: ({ cell }) => cell.getValue<number | undefined>() ?? "-",
      },
      {
        accessorKey: "jeeRankIndia",
        header: "JEE Rank",
        Cell: ({ cell }) => cell.getValue<number | undefined>() ?? "-",
      },
      { accessorKey: "college", header: "College" },
      { accessorKey: "collegeType", header: "College Type" },
      { accessorKey: "city", header: "College City" },
      { accessorKey: "studentCity", header: "Student City" },
      {
        accessorKey: "achievements",
        header: "Achievements",
        Cell: ({ row }) => (
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {row.original.achievements.map((a) => (
              <Chip key={a} label={a} size="small" color="primary" />
            ))}
          </Stack>
        ),
      },
    ],
    []
  );

  // Schema data
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Alumni", url: "/alumni" },
    ],
    siteUrl
  );
  const webPageSchema = generateWebPageSchema(
    "Neram Academy Alumni Results",
    "Search Neram Academy alumni & toppers (2016-2025) – NATA & JEE B.Arch ranks, college selections (NIT, CEPT, Anna University). Connect via LinkedIn or Instagram.",
    `${siteUrl}/alumni`
  );
  const orgSchema = generateAlumniOrganizationSchema(
    "Neram Academy",
    "Architecture entrance coaching alumni performance and selections.",
    `${siteUrl}`,
    stats.total,
    [
      "JEE B.Arch All India Rank 1 (2024)",
      "NATA All India Rank 1 (Score 187, 2020)",
      `${stats.nit} NIT Architecture Selections`,
      `${stats.cept} CEPT Selections`,
      `${stats.anna} Anna University Selections`,
    ]
  );
  const personSchemas = generateAlumniPersonSchemas(
    alumniRecords.slice(0, 6),
    siteUrl
  ); // limit

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Script
        id="alumni-org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <Script
        id="alumni-person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchemas) }}
      />

      <TopNavBar
        backgroundMode="gradient"
        titleBar={{
          title: "Neram Academy Alumni",
          showBreadcrumbs: true,
          autoBreadcrumbs: true,
        }}
      />
      <Container maxWidth="lg" sx={{ py: 6, mt: 8 }}>
        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 700, mb: 2 }}
        >
          Alumni & Toppers (2016–2025)
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Celebrating Neram Academy students: national rank toppers, NATA high
          scores, NIT/CEPT/Anna University selections. Use filters to search and
          connect.
        </Typography>

        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: "Total Alumni", value: stats.total },
            { label: "NIT Selections", value: stats.nit },
            { label: "CEPT Selections", value: stats.cept },
            { label: "Anna Univ Selections", value: stats.anna },
            { label: "NATA ≥180 Scores", value: stats.nataTopScores },
            { label: "JEE Ranks ≤200", value: stats.jeeTopRanks },
          ].map((s) => (
            <Grid size={{ xs: 6, md: 2 }} key={s.label}>
              <Card
                sx={{ textAlign: "center", py: 2 }}
                aria-label={`${s.label} summary`}
              >
                <CardContent>
                  <Typography variant="h5" fontWeight={700}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search name/college"
            size="small"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField
            label="Exam"
            size="small"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            placeholder="NATA / JEE B.Arch / Both"
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Year"
            size="small"
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="2024"
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="College Type"
            size="small"
            value={collegeTypeFilter}
            onChange={(e) => setCollegeTypeFilter(e.target.value)}
            placeholder="NIT / CEPT / Anna University"
            sx={{ minWidth: 220 }}
          />
          {mobile && (
            <Button
              startIcon={<FilterAltIcon />}
              onClick={() => setDrawerOpen(true)}
              variant="outlined"
              aria-label="Open filter drawer"
            >
              Filters
            </Button>
          )}
        </Box>

        {/* Data Table */}
        <MaterialReactTable
          columns={columns}
          data={filteredData}
          enableColumnActions={false}
          enableDensityToggle={false}
          initialState={{
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: false,
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => setSelectedAlumni(row.original),
            sx: { cursor: "pointer" },
            "aria-label": `View testimonial for ${row.original.name}`,
          })}
        />

        <Typography
          variant="h2"
          sx={{ mt: 6, mb: 2, fontSize: { xs: "1.75rem", md: "2.25rem" } }}
        >
          How Alumni Succeeded
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Consistent mock performance, iterative sketch critiques, time
          calibration drills and portfolio guidance are core pillars of Neram
          Academy&apos;s architecture entrance success pathway. Many of these alumni
          contributed peer insights that shaped newer cohorts.
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: "1.4rem", md: "1.8rem" }, mb: 2 }}
          >
            Connect & Network
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use the table above to locate alumni by year or achievement. Click a
            row to view testimonial and social links.
          </Typography>
        </Box>
      </Container>
      <Footer />

      {/* Drawer for mobile filters (optional simplified) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ p: 3, width: 280 }} role="dialog" aria-label="Filter alumni">
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <TextField
            label="Exam"
            fullWidth
            size="small"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Year"
            fullWidth
            size="small"
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value ? Number(e.target.value) : "")
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="College Type"
            fullWidth
            size="small"
            value={collegeTypeFilter}
            onChange={(e) => setCollegeTypeFilter(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={() => setDrawerOpen(false)}>
            Apply
          </Button>
        </Box>
      </Drawer>

      {/* Testimonial Dialog */}
      <Dialog
        open={!!selectedAlumni}
        onClose={() => setSelectedAlumni(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="alumni-dialog-title"
      >
        <DialogTitle id="alumni-dialog-title" sx={{ pr: 5 }}>
          {selectedAlumni?.name}
          <IconButton
            aria-label="Close"
            onClick={() => setSelectedAlumni(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            {selectedAlumni?.exam} • {selectedAlumni?.year} •{" "}
            {selectedAlumni?.college}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {selectedAlumni?.achievements.map((a) => (
              <Chip key={a} label={a} size="small" color="primary" />
            ))}
          </Stack>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {selectedAlumni?.testimonial || "No testimonial available."}
          </Typography>
          <Stack direction="row" gap={2}>
            {selectedAlumni?.linkedin && (
              <Tooltip title="View LinkedIn Profile">
                <Button
                  variant="outlined"
                  startIcon={<LinkedInIcon />}
                  href={selectedAlumni.linkedin}
                  target="_blank"
                  rel="noopener"
                >
                  LinkedIn
                </Button>
              </Tooltip>
            )}
            {selectedAlumni?.instagram && (
              <Tooltip title="View Instagram Profile">
                <Button
                  variant="outlined"
                  startIcon={<InstagramIcon />}
                  href={selectedAlumni.instagram}
                  target="_blank"
                  rel="noopener"
                >
                  Instagram
                </Button>
              </Tooltip>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
