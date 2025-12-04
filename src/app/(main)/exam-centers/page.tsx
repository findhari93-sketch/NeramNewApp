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

export default function ExamCentersPage() {
  // Filter states
  const [examType, setExamType] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data states
  const [centers, setCenters] = useState<ExamCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available cities based on selected state
  const availableCities = useMemo(() => {
    if (!selectedState) return [];
    return CITIES_BY_STATE[selectedState as IndianState] || [];
  }, [selectedState]);

  // Current year for highlighting
  const currentYear = new Date().getFullYear();

  // Reset city when state changes
  useEffect(() => {
    setSelectedCity("");
  }, [selectedState]);

  // Search function
  const handleSearch = async () => {
    if (!examType) {
      setError("Please select an exam type");
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

      if (searchQuery.trim()) {
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
    setCenters([]);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
              <span className="material-icons text-white text-3xl">
                apartment
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Find Exam Centers
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Search for NATA and JEE Paper 2 exam centers across India. Find
              confirmed centers, addresses, and contact details.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-icons text-blue-600">tune</span>
              <h2 className="text-lg font-semibold text-slate-900">
                Search Filters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Exam Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Exam</option>
                    {EXAM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.value}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                    expand_more
                  </span>
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All States</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                    expand_more
                  </span>
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Cities</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Search by name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search by Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Center name..."
                    className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    search
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="material-icons animate-spin text-xl">
                    autorenew
                  </span>
                ) : (
                  <span className="material-icons text-xl">search</span>
                )}
                Find Exam Centers
              </button>

              {(examType || selectedState || selectedCity || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all"
                >
                  <span className="material-icons text-xl">close</span>
                  Clear Filters
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="mt-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {loading
                  ? "Searching..."
                  : `${centers.length} Center${
                      centers.length !== 1 ? "s" : ""
                    } Found`}
              </h2>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs font-medium ring-2 ring-green-500 ring-offset-1">
                    {currentYear}
                  </span>
                  <span className="text-slate-600">Confirmed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-xs font-medium">
                    {currentYear}
                  </span>
                  <span className="text-slate-600">Tentative</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-300 rounded-full text-xs font-medium">
                    {currentYear - 1}
                  </span>
                  <span className="text-slate-600">Previous Year</span>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {centers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {centers.map((center) => (
                  <ExamCenterCard
                    key={center.id}
                    center={center}
                    currentYear={currentYear}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <span className="material-icons text-slate-400 text-3xl">
                    search
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Centers Found
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  No exam centers match your search criteria. Try adjusting your
                  filters or searching for a different location.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Initial State */}
        {!searched && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
              <span className="material-icons text-blue-600 text-4xl">
                location_on
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Search for Exam Centers
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto mb-8">
              Select your exam type and location to find nearby exam centers.
              View confirmed centers for {currentYear} and historical data.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">NATA</div>
                <div className="text-sm text-slate-600">Architecture Exam</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">JEE</div>
                <div className="text-sm text-slate-600">Paper 2 B.Arch</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">36</div>
                <div className="text-sm text-slate-600">States & UTs</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-amber-600">500+</div>
                <div className="text-sm text-slate-600">Cities</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-icons text-blue-600 flex-shrink-0 mt-0.5 text-xl">
            info
          </span>
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> Exam center information is updated
            periodically. Please verify the details with the official exam
            conducting body before your exam date. Centers marked as
            &quot;Confirmed&quot; have been verified for the current year&apos;s
            examination.
          </div>
        </div>
      </div>
    </div>
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
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {center.is_confirmed_current_year &&
                center.active_years.includes(currentYear) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <span className="material-icons text-sm">check_circle</span>
                    Confirmed {currentYear}
                  </span>
                )}
              {!center.is_confirmed_current_year &&
                center.active_years.includes(currentYear) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <span className="material-icons text-sm">schedule</span>
                    Tentative {currentYear}
                  </span>
                )}
              {center.status === "inactive" && (
                <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  Inactive
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
              {center.center_name}
            </h3>
            {center.center_code && (
              <p className="text-sm text-slate-500 mt-0.5">
                Code: {center.center_code}
              </p>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
            {center.exam_type}
          </span>
        </div>

        {center.description && (
          <p className="text-sm text-slate-600 mb-4">{center.description}</p>
        )}

        {/* Years Active */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-slate-400 text-xl">
              calendar_today
            </span>
            <span className="text-sm font-medium text-slate-700">
              Years Active
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sortedYears.map((year) => (
              <span
                key={year}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getYearBadgeStyle(
                  year,
                  center.is_confirmed_current_year
                )}`}
              >
                {year}
              </span>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <span className="material-icons text-slate-400 text-xl mt-0.5 flex-shrink-0">
            location_on
          </span>
          <div>
            <p className="text-sm text-slate-700">{center.address}</p>
            <p className="text-sm text-slate-600">
              {center.city}, {center.state}
              {center.pincode && ` - ${center.pincode}`}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span>{expanded ? "Hide Details" : "Show More Details"}</span>
          <span
            className={`material-icons text-xl transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {expanded && (
          <div className="px-6 pb-6 space-y-4">
            {/* Contact Info */}
            {(center.phone_number || center.email || center.contact_person) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900">
                  Contact Information
                </h4>
                {center.contact_person && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-icons text-slate-400 text-xl">
                      person
                    </span>
                    <span>{center.contact_person}</span>
                    {center.contact_designation && (
                      <span className="text-slate-400">
                        ({center.contact_designation})
                      </span>
                    )}
                  </div>
                )}
                {center.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-icons text-slate-400 text-xl">
                      phone
                    </span>
                    <a
                      href={`tel:${center.phone_number}`}
                      className="text-blue-600 hover:underline"
                    >
                      {center.phone_number}
                    </a>
                    {center.alternate_phone && (
                      <span className="text-slate-400">
                        /{" "}
                        <a
                          href={`tel:${center.alternate_phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {center.alternate_phone}
                        </a>
                      </span>
                    )}
                  </div>
                )}
                {center.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-icons text-slate-400 text-xl">
                      mail
                    </span>
                    <a
                      href={`mailto:${center.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {center.email}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Nearby Transport */}
            {(center.nearest_railway || center.nearest_bus_stand) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900">
                  Nearby Transport
                </h4>
                {center.nearest_railway && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-icons text-slate-400 text-xl">
                      train
                    </span>
                    <span>{center.nearest_railway}</span>
                  </div>
                )}
                {center.nearest_bus_stand && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-icons text-slate-400 text-xl">
                      directions_bus
                    </span>
                    <span>{center.nearest_bus_stand}</span>
                  </div>
                )}
              </div>
            )}

            {/* Facilities */}
            {center.facilities && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  Facilities
                </h4>
                <p className="text-sm text-slate-600">{center.facilities}</p>
              </div>
            )}

            {/* Instructions */}
            {center.instructions && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  Instructions
                </h4>
                <p className="text-sm text-slate-600">{center.instructions}</p>
              </div>
            )}

            {/* Landmarks */}
            {center.landmarks && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  Landmarks
                </h4>
                <p className="text-sm text-slate-600">{center.landmarks}</p>
              </div>
            )}

            {/* Capacity */}
            {center.capacity && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="material-icons text-slate-400 text-xl">
                  apartment
                </span>
                <span>Seating Capacity: {center.capacity}</span>
              </div>
            )}

            {/* Google Maps Link */}
            {center.google_maps_link && (
              <a
                href={center.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <span className="material-icons text-slate-400 text-xl">
                  location_on
                </span>
                View on Google Maps
                <span className="material-icons text-slate-400 text-sm">
                  open_in_new
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for year badge styles
function getYearBadgeStyle(year: number, isConfirmed: boolean): string {
  const currentYear = new Date().getFullYear();

  if (year === currentYear && isConfirmed) {
    return "bg-green-100 text-green-800 border-green-300 ring-2 ring-green-500 ring-offset-1";
  }
  if (year === currentYear) {
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
  if (year === currentYear - 1) {
    return "bg-blue-100 text-blue-700 border-blue-300";
  }
  return "bg-gray-100 text-gray-600 border-gray-300";
}
