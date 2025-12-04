"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  INDIAN_STATES,
  CITIES_BY_STATE,
  EXAM_TYPES,
  type IndianState,
} from "@/data/indian-states-cities";
import type { ExamCenter } from "@/types/exam-center";
import {
  Container,
  Paper,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Divider,
  Link as MuiLink,
  CircularProgress,
  Alert,
  InputAdornment,
  Collapse,
  Stack,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ApartmentIcon from "@mui/icons-material/Apartment";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ClearIcon from "@mui/icons-material/Clear";

export default function ExamCentersPage() {
  // Filter states
  const [examType, setExamType] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [centerName, setCenterName] = useState<string>("");

  // Data states
  const [centers, setCenters] = useState<ExamCenter[]>([]);
  const [allCenterNames, setAllCenterNames] = useState<string[]>([]);
  const [centerNameToLocationMap, setCenterNameToLocationMap] = useState<
    Record<string, { city: string; state: string }>
  >({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all cities across all states for search
  const allCities = useMemo(() => {
    const cities: string[] = [];
    Object.values(CITIES_BY_STATE).forEach((stateCities) => {
      cities.push(...stateCities);
    });
    return [...new Set(cities)].sort(); // Remove duplicates and sort
  }, []);

  // Map city to state for auto-selection
  const cityToStateMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(CITIES_BY_STATE).forEach(([state, cities]) => {
      cities.forEach((city) => {
        if (!map[city]) {
          map[city] = state;
        }
      });
    });
    return map;
  }, []);

  // Available cities based on selected state (or all cities if no state selected)
  const availableCities = useMemo(() => {
    if (!selectedState) return allCities;
    return CITIES_BY_STATE[selectedState as IndianState] || [];
  }, [selectedState, allCities]);

  // Fetch center names for autocomplete
  useEffect(() => {
    const fetchCenterNames = async () => {
      try {
        const { data, error } = await supabase
          .from("exam_centers")
          .select("center_name, city, state, exam_type")
          .neq("status", "discontinued");

        if (error) throw error;

        const names: string[] = [];
        const locationMap: Record<string, { city: string; state: string }> = {};

        data?.forEach((center) => {
          const name = center.center_name;
          if (!names.includes(name)) {
            names.push(name);
          }
          // Map center name to its location (use first occurrence)
          if (!locationMap[name]) {
            locationMap[name] = {
              city: center.city,
              state: center.state,
            };
          }
        });

        setAllCenterNames(names.sort());
        setCenterNameToLocationMap(locationMap);
      } catch (err) {
        console.error("Error fetching center names:", err);
      }
    };

    fetchCenterNames();
  }, []);

  // Current year for highlighting
  const currentYear = new Date().getFullYear();

  // Reset city when state changes
  useEffect(() => {
    setSelectedCity("");
  }, [selectedState]);

  // Search function with validation
  const handleSearch = async () => {
    if (!examType) {
      setError("Please select an exam type");
      return;
    }

    // If searching by center name, city and state are auto-filled
    if (centerName && !selectedState) {
      setError("State should be auto-filled from center name. Please select a valid center name.");
      return;
    }

    // If not using center name, city is required
    if (!centerName && !selectedCity) {
      setError("Please select a city (state and city are required for center search)");
      return;
    }

    // State is always required
    if (!selectedState) {
      setError("Please select a state");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      let query = supabase
        .from("exam_centers")
        .select("*")
        .eq("exam_type", examType)
        .neq("status", "discontinued")
        .order("is_confirmed_current_year", { ascending: false })
        .order("center_name", { ascending: true });

      if (selectedState) {
        query = query.eq("state", selectedState);
      }

      if (selectedCity) {
        query = query.eq("city", selectedCity);
      }

      if (centerName) {
        query = query.eq("center_name", centerName);
      } else if (searchQuery.trim()) {
        query = query.or(
          `center_name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setCenters(data || []);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setError("Failed to fetch exam centers. Please try again.");
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setExamType("");
    setSelectedState("");
    setSelectedCity("");
    setSearchQuery("");
    setCenterName("");
    setCenters([]);
    setSearched(false);
    setError(null);
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              gap: 1,
            }}
          >
            <ApartmentIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Find Exam Centers
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ color: "#666", maxWidth: "600px", mx: "auto" }}
          >
            Search for NATA and JEE Paper 2 exam centers across India. Find
            confirmed centers with addresses and contact details.
          </Typography>
        </Box>

        {/* Search Card - Google Style */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            {/* Exam Type */}
            <Autocomplete
              fullWidth
              options={EXAM_TYPES.map((type) => type.value)}
              value={examType || null}
              onChange={(event, newValue) => setExamType(newValue || "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Exam Type"
                  variant="outlined"
                  size="medium"
                  placeholder="Search exam..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <InputAdornment position="end">
                          <SearchIcon sx={{ color: "action.active" }} />
                        </InputAdornment>
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f5f5f5",
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  }}
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />

            {/* State */}
            <Autocomplete
              fullWidth
              options={INDIAN_STATES}
              value={selectedState || null}
              onChange={(event, newValue) => setSelectedState(newValue || "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  variant="outlined"
                  size="medium"
                  placeholder="Search state..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f5f5f5",
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  }}
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />

            {/* City */}
            <Autocomplete
              fullWidth
              options={availableCities}
              value={selectedCity || null}
              onChange={(event, newValue) => {
                setSelectedCity(newValue || "");
                // Auto-select state when city is selected
                if (newValue && cityToStateMap[newValue]) {
                  setSelectedState(cityToStateMap[newValue]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  variant="outlined"
                  size="medium"
                  placeholder="Search any city..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f5f5f5",
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  }}
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />

            {/* Search by Center Name - Autocomplete */}
            <Autocomplete
              fullWidth
              options={allCenterNames}
              value={centerName || null}
              onChange={(event, newValue) => {
                setCenterName(newValue || "");
                // Auto-fill city and state when center name is selected
                if (newValue && centerNameToLocationMap[newValue]) {
                  const { city, state } = centerNameToLocationMap[newValue];
                  setSelectedCity(city);
                  setSelectedState(state);
                  setSearchQuery(""); // Clear free-text search
                }
              }}
              inputValue={centerName}
              onInputChange={(event, newInputValue) => {
                setCenterName(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Center Name"
                  variant="outlined"
                  size="medium"
                  placeholder="e.g., Delhi Center"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <InputAdornment position="end">
                          <SearchIcon sx={{ color: "action.active" }} />
                        </InputAdornment>
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f5f5f5",
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  }}
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />
          </Box>

          {/* Help Text - Search Requirements */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 500 }}>
              📌 <strong>Search Options:</strong>
              <br />
              • <strong>By Center Name:</strong> Select a center name → State & City auto-fill
              <br />
              • <strong>By Location:</strong> Select City → State auto-fills (minimum required)
              <br />
              • Exam Type is always required. State & City are mandatory for location-based search.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
              }
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 1,
              }}
            >
              {loading ? "Searching..." : "Search Centers"}
            </Button>

            {(examType || selectedState || selectedCity || searchQuery) && (
              <Button
                variant="outlined"
                size="large"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderColor: "#e0e0e0",
                  color: "#333",
                  "&:hover": { borderColor: "#999" },
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}
        </Paper>

        {/* Results Section */}
        {searched && (
          <Box>
            {/* Results Header */}
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
                {loading
                  ? "Searching for exam centers..."
                  : `${centers.length} Center${
                      centers.length !== 1 ? "s" : ""
                    } Found`}
              </Typography>
            </Box>

            {/* Legend */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={<CheckCircleIcon />}
                label={`Confirmed ${currentYear}`}
                sx={{
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<ScheduleIcon />}
                label={`Tentative ${currentYear}`}
                sx={{
                  backgroundColor: "#fff3e0",
                  color: "#e65100",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Previous Year (${currentYear - 1})`}
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                  fontWeight: 600,
                }}
              />
            </Box>

            {/* Results Grid */}
            {centers.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {centers.map((center) => (
                  <ExamCenterCard
                    key={center.id}
                    center={center}
                    currentYear={currentYear}
                  />
                ))}
              </Box>
            ) : !loading ? (
              <Card sx={{ textAlign: "center", py: 6 }}>
                <CardContent>
                  <SearchIcon
                    sx={{
                      fontSize: 60,
                      color: "#bdbdbd",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    No Centers Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    No exam centers match your search criteria. Try adjusting
                    your filters or searching for a different location.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}

        {/* Initial State - Quick Tips */}
        {!searched && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <PlaceIcon
              sx={{
                fontSize: 80,
                color: "#1976d2",
                mb: 2,
                opacity: 0.7,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Start Your Search
            </Typography>
            <Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
              Select your exam type and location to find nearby exam centers
            </Typography>

            {/* Quick Stats */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(4, 1fr)",
                },
                gap: 2,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              <Card
                sx={{
                  textAlign: "center",
                  py: 2,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1976d2" }}
                  >
                    NATA
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", mt: 0.5 }}>
                    Architecture
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  textAlign: "center",
                  py: 2,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1565c0" }}
                  >
                    JEE
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", mt: 0.5 }}>
                    Paper 2 B.Arch
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  textAlign: "center",
                  py: 2,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#0d47a1" }}
                  >
                    36
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", mt: 0.5 }}>
                    States & UTs
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  textAlign: "center",
                  py: 2,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#0d47a1" }}
                  >
                    500+
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", mt: 0.5 }}>
                    Cities
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Container>

      {/* Footer Info */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Alert
          icon={<InfoIcon />}
          severity="info"
          sx={{
            backgroundColor: "#e3f2fd",
            color: "#1565c0",
            border: "1px solid #90caf9",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Important Note:
          </Typography>
          <Typography variant="body2">
            Exam center information is updated periodically. Please verify the
            details with the official exam conducting body before your exam
            date. Centers marked as &quot;Confirmed&quot; have been verified for
            the current year&apos;s examination.
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
}

// Exam Center Card Component
function ExamCenterCard({
  center,
  currentYear,
}: {
  center: ExamCenter;
  currentYear: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Sort years in descending order
  const sortedYears = [...center.active_years].sort((a, b) => b - a);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
        },
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Header */}
      <CardHeader
        title={
          <Box>
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              {center.is_confirmed_current_year &&
                center.active_years.includes(currentYear) && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`Confirmed ${currentYear}`}
                    size="small"
                    sx={{
                      backgroundColor: "#e8f5e9",
                      color: "#2e7d32",
                      fontWeight: 600,
                    }}
                  />
                )}
              {!center.is_confirmed_current_year &&
                center.active_years.includes(currentYear) && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={`Tentative ${currentYear}`}
                    size="small"
                    sx={{
                      backgroundColor: "#fff3e0",
                      color: "#e65100",
                      fontWeight: 600,
                    }}
                  />
                )}
              {center.status === "inactive" && (
                <Chip
                  label="Inactive"
                  size="small"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    color: "#666",
                  }}
                />
              )}
              <Chip
                label={center.exam_type}
                size="small"
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {center.center_name}
            </Typography>
            {center.center_code && (
              <Typography
                variant="caption"
                sx={{ color: "#999", display: "block", mt: 0.5 }}
              >
                Center Code: {center.center_code}
              </Typography>
            )}
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        {center.description && (
          <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
            {center.description}
          </Typography>
        )}

        {/* Years Active */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <EventIcon sx={{ fontSize: 20, color: "#666" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Years Active
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {sortedYears.map((year) => (
              <Chip
                key={year}
                label={year.toString()}
                size="small"
                sx={{
                  ...getYearChipStyle(year),
                  fontWeight: 600,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Address */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <PlaceIcon
            sx={{ color: "#666", fontSize: 20, flexShrink: 0, mt: 0.5 }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {center.address}
            </Typography>
            <Typography variant="caption" sx={{ color: "#999" }}>
              {center.city}, {center.state}
              {center.pincode && ` - ${center.pincode}`}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Expandable Details Button */}
        <Button
          fullWidth
          onClick={() => setExpanded(!expanded)}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transition: "transform 0.3s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          }
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            color: "#1976d2",
            fontWeight: 600,
            justifyContent: "space-between",
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          {expanded ? "Hide Details" : "Show Details"}
        </Button>

        {/* Expandable Details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            {/* Contact Info */}
            {(center.phone_number || center.email || center.contact_person) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Contact Information
                </Typography>
                {center.contact_person && (
                  <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {center.contact_person}
                      </Typography>
                      {center.contact_designation && (
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          {center.contact_designation}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                {center.phone_number && (
                  <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Box>
                      <MuiLink
                        href={`tel:${center.phone_number}`}
                        sx={{
                          color: "#1976d2",
                          textDecoration: "none",
                          fontWeight: 500,
                          display: "block",
                        }}
                      >
                        {center.phone_number}
                      </MuiLink>
                      {center.alternate_phone && (
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          Alt:{" "}
                          <MuiLink
                            href={`tel:${center.alternate_phone}`}
                            sx={{
                              color: "#1976d2",
                              textDecoration: "none",
                            }}
                          >
                            {center.alternate_phone}
                          </MuiLink>
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                {center.email && (
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <EmailIcon sx={{ fontSize: 20, color: "#666" }} />
                    <MuiLink
                      href={`mailto:${center.email}`}
                      sx={{
                        color: "#1976d2",
                        textDecoration: "none",
                        fontWeight: 500,
                        wordBreak: "break-all",
                      }}
                    >
                      {center.email}
                    </MuiLink>
                  </Box>
                )}
              </Box>
            )}

            {/* Transport */}
            {(center.nearest_railway || center.nearest_bus_stand) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Nearby Transport
                </Typography>
                {center.nearest_railway && (
                  <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                    <TrainIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Typography variant="body2">
                      {center.nearest_railway}
                    </Typography>
                  </Box>
                )}
                {center.nearest_bus_stand && (
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <DirectionsBusIcon sx={{ fontSize: 20, color: "#666" }} />
                    <Typography variant="body2">
                      {center.nearest_bus_stand}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Facilities */}
            {center.facilities && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Facilities
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {center.facilities}
                </Typography>
              </Box>
            )}

            {/* Instructions */}
            {center.instructions && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Instructions
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {center.instructions}
                </Typography>
              </Box>
            )}

            {/* Landmarks */}
            {center.landmarks && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Landmarks
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {center.landmarks}
                </Typography>
              </Box>
            )}

            {/* Capacity */}
            {center.capacity && (
              <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <ApartmentIcon sx={{ fontSize: 20, color: "#666" }} />
                <Typography variant="body2">
                  Seating Capacity: {center.capacity}
                </Typography>
              </Box>
            )}

            {/* Google Maps Link */}
            {center.google_maps_link && (
              <Button
                fullWidth
                variant="outlined"
                endIcon={<OpenInNewIcon />}
                href={center.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#1976d2",
                  borderColor: "#90caf9",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                View on Google Maps
              </Button>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// Helper function for year badge styles
function getYearChipStyle(year: number) {
  const currentYear = new Date().getFullYear();

  if (year === currentYear) {
    return {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    };
  }
  if (year === currentYear - 1) {
    return {
      backgroundColor: "#e3f2fd",
      color: "#1565c0",
    };
  }
  return {
    backgroundColor: "#f5f5f5",
    color: "#666",
  };
}
