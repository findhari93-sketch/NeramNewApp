"use client";
// Step: Basic Info
import React, { useState, useEffect, useRef } from "react";
import YoutubeSubscribe from "./YoutubeSubscribe";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
// OTP for additional contact removed; primary phone flow handled in PhoneAuth
import PhoneAuth from "./PhoneAuth";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// supabase imported earlier but not used in this component — remove to avoid lint warnings

const currentYear = new Date().getFullYear();
const genderOptions = ["Male", "Female", "Other"];
const classOptions = ["10th", "11th", "12th", "Other"];
const boardOptions = ["Matric", "CBSE", "ICSE", "State Board", "Other"];
// Supported/visible languages for selection (only these are allowed)
const SUPPORTED_LANGUAGES = [
  "English",
  "Tamil",
  "Malayalam",
  "Kannada",
  "Hindi",
];

// Small types and constants used by city/address helpers
type NominatimPlace = {
  place_id: number;
  display_name?: string;
  address?: Record<string, unknown>;
};

const ALLOWED_COUNTRY_CODES = ["ae", "in", "sa", "om", "lk"];
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  India: "in",
  "United Arab Emirates": "ae",
  "Saudi Arabia": "sa",
  Oman: "om",
  "Sri Lanka": "lk",
};

// Minimal location state and helpers (geolocation implementation present later in file)
type Loc = { lat: number; lng: number } | null;

// No global recaptcha verifier is used in this component anymore
type FormData = {
  studentName?: string;
  fatherName?: string;
  gender?: string;
  classGrade?: string | number;
  board?: string;
  boardYear?: number | string;
  paymentType?: "full" | "part";
  // Address fields
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  // language mode
  languageMode?: "english" | "native" | "combination";
};
export default function StepBasic() {
  // Helpers: zipCode -> city/state. Try India postal API first for 6-digit IN PINs,
  // otherwise fall back to Nominatim search for gulf countries (ae, sa, om) and a global fallback.
  // refs to manage in-flight zip lookups to avoid out-of-order results
  const zipLookupController = useRef<AbortController | null>(null);
  const latestZipQuery = useRef<string | null>(null);
  // City search controller to cancel previous queries
  const citySearchController = useRef<AbortController | null>(null);

  // no duplicate constants here — top-level ALLOWED_COUNTRY_CODES / COUNTRY_NAME_TO_CODE used
  // Alternate phone (no OTP verification)
  const [altPhone, setAltPhone] = useState("");
  // control visibility of the Additional Contact input (hidden by default)
  const [showAltContact, setShowAltContact] = useState(false);

  // sendAltOtp / verifyAltOtp removed — additional contact is accepted without OTP
  const PHONE_KEY = "phone_verified";
  const [activeTab, setActiveTab] = useState<"nata-jee" | "software">(
    "nata-jee"
  );
  const [form, setForm] = useState<FormData>({
    studentName: "",
    fatherName: "",
    gender: genderOptions[0],
    classGrade: classOptions[2],
    board: boardOptions[0],
    boardYear: currentYear,
    paymentType: "full", // 'full' or 'part'
    // Address fields
    zipCode: "",
    city: "",
    state: "",
    country: "",
    // language preference mode: 'english' | 'native' | 'combination'
    languageMode: "english",
  });

  // Helper to fetch city/state from ZIP using India API or Nominatim. Placed after form state to avoid hoisting issues.
  const fetchCityStateFromZip = async (zip: string, signal?: AbortSignal) => {
    const cleaned = zip.trim();
    const allowedCountryCodes = ALLOWED_COUNTRY_CODES;
    const countryNameToCode = COUNTRY_NAME_TO_CODE;
    latestZipQuery.current = cleaned;

    try {
      if (/^\d{6}$/.test(cleaned)) {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${cleaned}`,
            { signal }
          );
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json[0]?.Status === "Success") {
              const post = json[0].PostOffice?.[0];
              if (post && latestZipQuery.current === cleaned) {
                setForm((prev) => ({
                  ...prev,
                  city: post.District || prev.city,
                  state: post.State || prev.state,
                  country: "India",
                }));
                return;
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // allowed-country nominatim lookup
      for (const cc of allowedCountryCodes) {
        if (signal?.aborted) return;
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=${cc}&q=${encodeURIComponent(
          cleaned
        )}`;
        try {
          const r = await fetch(url, {
            headers: { "User-Agent": "neram-app/1.0" },
            signal,
          });
          if (!r.ok) continue;
          const results = await r.json();
          if (!Array.isArray(results) || results.length === 0) continue;
          const resItem = results[0] as NominatimPlace;
          const addr = (resItem.address || {}) as Record<string, unknown>;
          if (addr.postcode && addr.postcode !== cleaned) continue;
          const countryCodeFromAddr = (addr as Record<string, unknown>)[
            "country_code"
          ] as string | undefined;
          const countryName =
            typeof (addr as Record<string, unknown>).country === "string"
              ? ((addr as Record<string, unknown>).country as string)
              : undefined;
          const code = countryName
            ? countryNameToCode[countryName] || countryCodeFromAddr
            : countryCodeFromAddr;
          if (!code || !allowedCountryCodes.includes(code.toLowerCase()))
            continue;
          if (latestZipQuery.current !== cleaned) return;
          let mappedCountry = countryName;
          if (countryName) {
            const code2 = countryNameToCode[countryName] || countryCodeFromAddr;
            if (code2 && allowedCountryCodes.includes(code2.toLowerCase())) {
              mappedCountry =
                Object.keys(countryNameToCode).find(
                  (k) => countryNameToCode[k] === code2
                ) || countryName;
            }
          }
          setForm((prev) => ({
            ...prev,
            city:
              (addr.city as string) ||
              (addr.town as string) ||
              (addr.village as string) ||
              (addr.county as string) ||
              prev.city,
            state:
              (addr.state as string) || (addr.region as string) || prev.state,
            country: (mappedCountry as string) || prev.country,
          }));
          return;
        } catch {
          continue;
        }
      }

      // global fallback restricted to allowed countries
      try {
        if (signal?.aborted) return;
        const codes = allowedCountryCodes.join(",");
        const urlGlobal = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=${codes}&q=${encodeURIComponent(
          cleaned
        )}`;
        const rg = await fetch(urlGlobal, {
          headers: { "User-Agent": "neram-app/1.0" },
          signal,
        });
        if (!rg.ok) return;
        const resJson = await rg.json();
        if (Array.isArray(resJson) && resJson.length > 0) {
          const resItem = resJson[0] as NominatimPlace;
          const addr = (resItem.address || {}) as Record<string, unknown>;
          if (addr.postcode && addr.postcode !== cleaned) return;
          if (latestZipQuery.current !== cleaned) return;
          const countryCodeFromAddr = (addr as Record<string, unknown>)[
            "country_code"
          ] as string | undefined;
          const countryName =
            typeof (addr as Record<string, unknown>).country === "string"
              ? ((addr as Record<string, unknown>).country as string)
              : undefined;
          const code = countryName
            ? countryNameToCode[countryName] || countryCodeFromAddr
            : countryCodeFromAddr;
          if (!code || !allowedCountryCodes.includes(code.toLowerCase()))
            return;
          let mappedCountry = countryName;
          if (countryName) {
            const code2 = countryNameToCode[countryName] || countryCodeFromAddr;
            if (code2 && allowedCountryCodes.includes(code2.toLowerCase())) {
              mappedCountry =
                Object.keys(countryNameToCode).find(
                  (k) => countryNameToCode[k] === code2
                ) || countryName;
            }
          }
          setForm((prev) => ({
            ...prev,
            city:
              (addr.city as string) ||
              (addr.town as string) ||
              (addr.village as string) ||
              (addr.county as string) ||
              prev.city,
            state:
              (addr.state as string) || (addr.region as string) || prev.state,
            country: (mappedCountry as string) || prev.country,
          }));
        }
      } catch {
        // ignore
      }
    } catch {
      // ignore top-level failures
    }
  };

  // YouTube subscribe flow state (moved into reusable component)
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  // Location / reverse-geocode state
  const [location, setLocation] = useState<Loc | null>(null);
  const [locationError, setLocationError] = useState("");
  // referenced to avoid 'assigned but never used' TypeScript warnings until UI uses these
  void setLocation;
  void locationError;

  // Reverse geocode helper: populate address fields from lat/lng using Nominatim
  const fetchAddressFromLocation = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(
        String(lat)
      )}&lon=${encodeURIComponent(String(lng))}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "neram-app/1.0" },
      });
      if (!res.ok) throw new Error("reverse failed");
      const json = await res.json();
      const addr = json.address || {};
      setForm((prev: FormData) => ({
        ...prev,
        zipCode: prev.zipCode || (addr.postcode as string) || "",
        city:
          prev.city ||
          (addr.city as string) ||
          (addr.town as string) ||
          (addr.village as string) ||
          (addr.county as string) ||
          prev.city,
        state:
          prev.state || (addr.state as string) || (addr.region as string) || "",
        country: prev.country || (addr.country as string) || "",
      }));
      setLocationError("");
    } catch (err) {
      console.warn("Reverse geocode failed", err);
      setLocationError("Failed to get address from location.");
    }
  };
  // Which course the applicant selects: NATA/JEE or Software
  const [selectedCourse, setSelectedCourse] = useState<"nata-jee" | "software">(
    "nata-jee"
  );
  // Education type: school, college, diploma, or other
  const [educationType, setEducationType] = useState<
    "school" | "college" | "diploma" | "other"
  >("school");
  const [schoolStd, setSchoolStd] = useState("12th");
  const [collegeName, setCollegeName] = useState("");
  const [collegeYear, setCollegeYear] = useState("");
  // Diploma-specific fields
  const [diplomaCourse, setDiplomaCourse] = useState("");
  const [diplomaYear, setDiplomaYear] = useState("First Year");
  const [diplomaCollege, setDiplomaCollege] = useState("");
  // 'Other' freeform description
  const [otherDescription, setOtherDescription] = useState("");
  // Standard selector responsiveness and popup for tablet/mobile
  const [isCompactSelector, setIsCompactSelector] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 900 : false
  );
  const [showStdPopup, setShowStdPopup] = useState(false);
  const standardOptions = ["Below 10th", "10th", "11th", "12th"];

  const diplomaYearOptions = [
    "First Year",
    "Second Year",
    "Third Year",
    "Completed",
  ];

  // Keep form.classGrade in sync with schoolStd
  useEffect(() => {
    setForm((prev: FormData) => ({ ...prev, classGrade: schoolStd }));
  }, [schoolStd]);

  useEffect(() => {
    const onResize = () => setIsCompactSelector(window.innerWidth <= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cycleStandard = (dir: number) => {
    const idx = standardOptions.indexOf(schoolStd);
    const next = (idx + dir + standardOptions.length) % standardOptions.length;
    setSchoolStd(standardOptions[next]);
  };
  const cycleDiplomaYear = (dir: number) => {
    const idx = diplomaYearOptions.indexOf(diplomaYear);
    const next =
      (idx + dir + diplomaYearOptions.length) % diplomaYearOptions.length;
    setDiplomaYear(diplomaYearOptions[next]);
  };
  // Software course selection (Revit, CAD, SketchUp) — flat fee per course
  const [softwareCourse, setSoftwareCourse] = useState("Revit");
  const SOFTWARE_FEE = 10000;
  // Optional Instagram handle provided by student
  const [instagramId, setInstagramId] = useState("");

  // Language selection UI state: default English selected as requested
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "English",
  ]);

  // Review & edit flow
  const [reviewMode, setReviewMode] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  // Hover state for the combined City|State|Country line to show per-item edit icon
  const [hoverCsc, setHoverCsc] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Draft persistence key and feedback
  const DRAFT_KEY = "neram_application_draft_v1";
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  // referenced to avoid 'assigned but never used' TypeScript warnings until draft UI is shown
  void draftLoaded;

  // Focus the field when returning from review edit click
  useEffect(() => {
    if (editField && !reviewMode) {
      const el = fieldRefs.current[editField] as HTMLElement | null;
      if (el && typeof el.focus === "function") {
        // small timeout to wait for render
        setTimeout(() => {
          try {
            if (el.scrollIntoView)
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          } catch {
            // Do nothing. undefined will be returned.
          }
        }, 80);
      }
      // keep editField set; onBlur handlers will clear it when the user finishes editing
    }
  }, [editField, reviewMode]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d) {
          if (d.form)
            setForm((prev) => ({
              ...prev,
              ...(d.form as Record<string, unknown>),
            }));
          if (typeof d.altPhone === "string") setAltPhone(d.altPhone);
          if (typeof d.instagramId === "string") setInstagramId(d.instagramId);
          if (Array.isArray(d.selectedLanguages))
            setSelectedLanguages(d.selectedLanguages);
          if (typeof d.youtubeSubscribed === "boolean")
            setYoutubeSubscribed(d.youtubeSubscribed);
          if (typeof d.selectedCourse === "string")
            setSelectedCourse(d.selectedCourse);
          if (typeof d.educationType === "string")
            setEducationType(d.educationType);
          if (typeof d.schoolStd === "string") setSchoolStd(d.schoolStd);
          if (typeof d.collegeName === "string") setCollegeName(d.collegeName);
          if (typeof d.collegeYear === "string") setCollegeYear(d.collegeYear);
          if (typeof d.diplomaCourse === "string")
            setDiplomaCourse(d.diplomaCourse);
          if (typeof d.diplomaYear === "string") setDiplomaYear(d.diplomaYear);
          if (typeof d.diplomaCollege === "string")
            setDiplomaCollege(d.diplomaCollege);
          if (typeof d.otherDescription === "string")
            setOtherDescription(d.otherDescription);
          if (typeof d.softwareCourse === "string")
            setSoftwareCourse(d.softwareCourse);
          setDraftLoaded(true);
          setTimeout(() => setDraftLoaded(false), 2200);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const saveDraft = () => {
    try {
      const payload = {
        form,
        altPhone,
        instagramId,
        selectedLanguages,
        youtubeSubscribed,
        selectedCourse,
        educationType,
        schoolStd,
        collegeName,
        collegeYear,
        diplomaCourse,
        diplomaYear,
        diplomaCollege,
        otherDescription,
        softwareCourse,
      } as Record<string, unknown>;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1800);
    } catch {
      console.warn("Failed to save draft");
    }
  };

  // Fee calculation logic for NATA/JEE
  let nataJeeFee = 0;
  let nataJeeDiscountedFee = 0;
  let nataJeePart1 = 0;
  let nataJeeInfo = "";
  // (keep for potential future use) - removed unused detailed second-year info
  if (activeTab === "nata-jee") {
    // Determine the effective bracket depending on education type.
    const effectiveGrade =
      educationType === "diploma"
        ? // For diploma, map years to brackets
          diplomaYear === "Third Year" || diplomaYear === "Completed"
          ? "12th"
          : "11th"
        : (form.classGrade || "").toString();

    if (["Below 10th", "10th", "11th"].includes(effectiveGrade)) {
      nataJeeFee = 35000;
      nataJeeDiscountedFee = 30000;
      nataJeePart1 = 16500;
      nataJeeInfo =
        form.paymentType === "full"
          ? "You get a ₹5,000 discount for single payment."
          : "You can pay in two parts: First payment ₹16,500.";
    } else if (effectiveGrade === "12th") {
      nataJeeFee = 30000;
      nataJeeDiscountedFee = 25000;
      nataJeePart1 = 16500;
      nataJeeInfo =
        form.paymentType === "full"
          ? "You get a ₹5,000 discount for single payment."
          : "You can pay in two parts: First payment ₹16,500.";
    }
  }

  // helper removed (logic kept inline where required)

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 16,
    padding: "10px 12px",
    marginBottom: 16,
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 500,
    color: "#333",
    fontSize: 15,
    marginBottom: 4,
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // MUI Select emits SelectChangeEvent which differs from standard ChangeEvent
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    if (name) setForm({ ...form, [name]: value });
  };

  // Subscribe callback handler used by the reusable component
  const onYoutubeSubscribed = (s: boolean) => {
    setYoutubeSubscribed(s);
  };

  const addLanguage = (lang: string) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setSelectedLanguages((s) => (s.includes(lang) ? s : [...s, lang]));
  };
  // keep a noop reference so linter doesn't complain until UI adds the addLanguage control
  void addLanguage;

  // Auto-populate address from geolocation when available
  useEffect(() => {
    if (location) {
      fetchAddressFromLocation(location.lat, location.lng);
    }
  }, [location]);

  // When user edits zipCode, try to auto-fill city/state (India API first, then Nominatim)
  useEffect(() => {
    const zip = (form.zipCode || "").toString().trim();
    // Trigger for 3-8 characters (numeric or alphanumeric) to support global ZIP formats
    if (/^[A-Za-z0-9\-\s]{3,8}$/.test(zip)) {
      // abort previous zip lookup and create a new controller
      if (zipLookupController.current) zipLookupController.current.abort();
      const controller = new AbortController();
      zipLookupController.current = controller;
      latestZipQuery.current = zip;
      setZipLoading(true);
      fetchCityStateFromZip(zip, controller.signal)
        .finally(() => {
          if (zipLookupController.current === controller)
            zipLookupController.current = null;
        })
        .finally(() => setZipLoading(false));
    }
  }, [form.zipCode, form.country]);

  // City autocomplete state (kept minimal until UI added)
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<NominatimPlace[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  // Loading indicators for lookups
  const [zipLoading, setZipLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  // noop references to avoid 'assigned but never used' until suggestions UI added
  void citySuggestions;
  void showCitySuggestions;
  void zipLoading;
  void cityLoading;

  // City autocomplete: search Nominatim for typed city names and show suggestions
  useEffect(() => {
    const q = cityQuery.trim();
    if (q.length < 3) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setCityLoading(false);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      // cancel previous search and start a new one
      if (citySearchController.current) citySearchController.current.abort();
      const controller = new AbortController();
      citySearchController.current = controller;
      setCityLoading(true);
      try {
        const qc = form.country ? `${q} ${form.country}` : q;
        // prefer user's selected country if it's in the allowed list, otherwise restrict to allowed countries
        const userCode = form.country
          ? COUNTRY_NAME_TO_CODE[form.country] ||
            form.country.toLowerCase().slice(0, 2)
          : undefined;
        const countryParam =
          userCode && ALLOWED_COUNTRY_CODES.includes(userCode)
            ? `&countrycodes=${userCode}`
            : `&countrycodes=${ALLOWED_COUNTRY_CODES.join(",")}`;

        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5${countryParam}&q=${encodeURIComponent(
          qc
        )}`;
        const r = await fetch(url, {
          headers: { "User-Agent": "neram-app/1.0" },
          signal: controller.signal,
        });
        if (!r.ok) {
          // if this request failed and it's still the active controller, clear loading
          if (citySearchController.current === controller) {
            setCityLoading(false);
            citySearchController.current = null;
          }
          return;
        }
        const res = await r.json();
        if (cancelled) {
          if (citySearchController.current === controller) {
            setCityLoading(false);
            citySearchController.current = null;
          }
          return;
        }

        // filter results to allowed countries only
        const filtered: NominatimPlace[] = (res || []).filter(
          (item: unknown) => {
            const it = item as NominatimPlace;
            const addr = it.address || {};
            const countryCodeFromAddr = (addr as Record<string, unknown>)[
              "country_code"
            ] as string | undefined;
            const countryName =
              typeof (addr as Record<string, unknown>).country === "string"
                ? ((addr as Record<string, unknown>).country as string)
                : undefined;
            const code = countryName
              ? COUNTRY_NAME_TO_CODE[countryName] || countryCodeFromAddr
              : countryCodeFromAddr;
            return code && ALLOWED_COUNTRY_CODES.includes(code.toLowerCase());
          }
        );
        setCitySuggestions(filtered);
        setShowCitySuggestions(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("City search failed", err);
      } finally {
        // only clear loading if this controller is still the active one
        if (citySearchController.current === controller) {
          setCityLoading(false);
          citySearchController.current = null;
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [cityQuery, form.country]);

  const selectCitySuggestion = (s: NominatimPlace) => {
    const addr = s.address || {};
    setForm((prev: FormData) => ({
      ...prev,
      city:
        prev.city ||
        (addr.city as string) ||
        (addr.town as string) ||
        (addr.village as string) ||
        (addr.county as string) ||
        prev.city,
      state:
        prev.state ||
        (addr.state as string) ||
        (addr.region as string) ||
        prev.state,
      country: prev.country || (addr.country as string) || prev.country,
    }));
    setCityQuery("");
  };
  // referenced to avoid 'assigned but never used' TypeScript error until UI uses these helpers
  void selectCitySuggestion;
  // When user edits state manually, try to infer country
  const onStateBlurInferCountry = async (stateName: string) => {
    const s = stateName.trim();
    if (!s) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(
        s
      )}`;
      const r = await fetch(url, {
        headers: { "User-Agent": "neram-app/1.0" },
      });
      if (!r.ok) return;
      const res = await r.json();
      if (Array.isArray(res) && res.length > 0) {
        const addr = res[0].address || {};
        setForm((prev: FormData) => ({
          ...prev,
          country: (addr.country as string) || prev.country,
        }));
      }
    } catch (err) {
      console.warn("Infer country from state failed", err);
    }
  };
  // referenced to avoid 'assigned but never used' TypeScript error until UI uses these helpers
  void onStateBlurInferCountry;

  // Reactive verified phone state (reads from localStorage at init)
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PHONE_KEY);
    } catch {
      return null;
    }
  });

  // Multi-step state and refs for scrolling between sections
  const [currentStep, setCurrentStep] = useState<number>(1);
  useEffect(() => {
    try {
      if (localStorage.getItem(PHONE_KEY)) {
        setCurrentStep(2);
      }
    } catch {}
  }, []);
  const basicRef = useRef<HTMLDivElement | null>(null);
  const educationRef = useRef<HTMLDivElement | null>(null);
  const courseRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (currentStep === 2 && basicRef.current) {
        basicRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (currentStep === 3 && educationRef.current) {
        educationRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (currentStep === 4 && courseRef.current) {
        courseRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (currentStep === 5 && reviewRef.current) {
        reviewRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch {
      // ignore
    }
  }, [currentStep]);

  // Multi-step flow state: 1=phone verify, 2=basic details, 3=education, 4=course, 5=review

  // Render step 1: Phone verification when currentStep === 1
  // PhoneAuth will call onVerified with the normalized E.164 phone string.
  if (currentStep === 1) {
    return (
      <div style={{ maxWidth: 520, margin: 40 }}>
        <PhoneAuth
          onVerified={(p: string) => {
            try {
              setVerifiedPhone(p);
              setCurrentStep(2);
            } catch {
              // ignore
            }
          }}
        />
      </div>
    );
  }

  return (
    <Box sx={{ maxWidth: 520, m: 5 }}>
      {/* Tabs removed — course selection uses in-form controls now */}

      {/* Form Title */}
      <Typography
        variant="h5"
        sx={{ color: "#7c1fa0", fontWeight: 700, mb: 3, textAlign: "center" }}
      >
        {activeTab === "nata-jee"
          ? "NATA/JEE Coaching Application Form"
          : "Software Class Application Form"}
      </Typography>

      {/* Application Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          // ...existing code...
        }}
      >
        {/* Step indicator */}
        <Typography sx={{ mb: 1.5, fontSize: 14, color: "#666" }}>
          Step {currentStep} of 4
        </Typography>
        {/* course selection moved to the end of the form (see below) */}
        {/* Additional Contact Number Field (Step 2: Basics) */}
        {currentStep === 2 && (
          <Box>
            {/* Student Name and Father Name - inline */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                id="studentName"
                size="small"
                name="studentName"
                label="Student Name"
                value={form.studentName}
                onChange={handleChange}
                sx={{ flex: 1 }}
                margin="normal"
                variant="outlined"
                autoComplete="off"
              />
              <TextField
                id="fatherName"
                size="small"
                name="fatherName"
                label="Father Name"
                value={form.fatherName as string}
                onChange={handleChange}
                sx={{ flex: 1 }}
                margin="normal"
                variant="outlined"
                autoComplete="off"
              />
            </Box>

            {/* Gender */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                size="small"
                name="gender"
                value={form.gender}
                label="Gender"
                onChange={handleSelectChange}
              >
                {genderOptions.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Address fields */}

            <TextField
              id="zipCode"
              size="small"
              name="zipCode"
              label="Address Zip Code"
              value={form.zipCode}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Postal / ZIP code"
              autoComplete="off"
            />

            {/* City | State | Country — single line with per-item hover edit */}
            <Box
              sx={{
                mt: ((form.zipCode || "") as string).toString().trim() ? 0 : 2,
              }}
            >
              {/* Only show combined City/State/Country after user entered a ZIP */}
              {((form.zipCode || "") as string).toString().trim() ? (
                // Inline editors: if any specific field is being edited, show its TextField in place
                editField === "city" ? (
                  <TextField
                    id="city"
                    size="small"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    onBlur={() => setEditField(null)}
                    inputRef={(el: HTMLInputElement | null) => {
                      fieldRefs.current["city"] = el;
                    }}
                    autoFocus
                  />
                ) : editField === "state" ? (
                  <TextField
                    id="state"
                    size="small"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    onBlur={() => setEditField(null)}
                    inputRef={(el: HTMLInputElement | null) => {
                      fieldRefs.current["state"] = el;
                    }}
                    autoFocus
                  />
                ) : editField === "country" ? (
                  <TextField
                    id="country"
                    size="small"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    onBlur={() => setEditField(null)}
                    inputRef={(el: HTMLInputElement | null) => {
                      fieldRefs.current["country"] = el;
                    }}
                    autoFocus
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {form.city ? (
                      <Box
                        onMouseEnter={() => setHoverCsc("city")}
                        onMouseLeave={() => setHoverCsc(null)}
                        onClick={() => setEditField("city")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setEditField("city");
                        }}
                      >
                        <Typography sx={{ color: "#666", fontSize: 13 }}>
                          City :{" "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {form.city}
                          </Box>
                        </Typography>
                        {hoverCsc === "city" && (
                          <Button
                            size="small"
                            aria-label="Edit city"
                            onClick={() => setEditField("city")}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              lineHeight: 1,
                              height: "1em",
                              fontSize: 13,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            ✏️
                          </Button>
                        )}
                      </Box>
                    ) : null}

                    {form.city && form.state ? (
                      <Typography sx={{ color: "#bbb", fontSize: 13 }}>
                        |
                      </Typography>
                    ) : null}

                    {form.state ? (
                      <Box
                        onMouseEnter={() => setHoverCsc("state")}
                        onMouseLeave={() => setHoverCsc(null)}
                        onClick={() => setEditField("state")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setEditField("state");
                        }}
                      >
                        <Typography sx={{ color: "#666", fontSize: 13 }}>
                          State :{" "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {form.state}
                          </Box>
                        </Typography>
                        {hoverCsc === "state" && (
                          <Button
                            size="small"
                            aria-label="Edit state"
                            onClick={() => setEditField("state")}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              lineHeight: 1,
                              height: "1em",
                              fontSize: 13,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            ✏️
                          </Button>
                        )}
                      </Box>
                    ) : null}

                    {(form.state && form.country) ||
                    (form.city && form.country) ? (
                      <Typography sx={{ color: "#bbb", fontSize: 13 }}>
                        |
                      </Typography>
                    ) : null}

                    {form.country ? (
                      <Box
                        onMouseEnter={() => setHoverCsc("country")}
                        onMouseLeave={() => setHoverCsc(null)}
                        onClick={() => setEditField("country")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setEditField("country");
                        }}
                      >
                        <Typography sx={{ color: "#666", fontSize: 13 }}>
                          Country :{" "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {form.country}
                          </Box>
                        </Typography>
                        {hoverCsc === "country" && (
                          <Button
                            size="small"
                            aria-label="Edit country"
                            onClick={() => setEditField("country")}
                            sx={{
                              p: 0,
                              minWidth: 0,
                              lineHeight: 1,
                              height: "1em",
                              fontSize: 13,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            ✏️
                          </Button>
                        )}
                      </Box>
                    ) : null}
                  </Box>
                )
              ) : null}
            </Box>

            {/* Verified Phone Number with Change option */}

            {/* Verified phone: full-width initially. When additional contact is activated,
                render two equal-width fields (verified + additional). Icons appear only
                when hovering the verified-phone area. */}
            {!showAltContact ? (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    position: "relative",
                    "&:hover .hoverIcons": { display: "flex" },
                  }}
                >
                  <TextField
                    id="verifiedPhone"
                    size="small"
                    value={verifiedPhone || ""}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box
                            className="hoverIcons"
                            sx={{
                              display: "none",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              aria-label="Add additional contact"
                              onClick={() => {
                                setShowAltContact(true);
                                setTimeout(() => {
                                  try {
                                    const el = document.querySelector(
                                      'input[name="altPhone"]'
                                    ) as HTMLInputElement | null;
                                    if (el) el.focus();
                                  } catch {}
                                }, 120);
                              }}
                              size="small"
                              sx={{ p: 0.5, fontSize: 14 }}
                            >
                              <Box component="span" sx={{ fontSize: 16 }}>
                                ➕
                              </Box>
                            </IconButton>
                            <IconButton
                              aria-label="Change verified phone"
                              onClick={() => {
                                try {
                                  localStorage.removeItem(PHONE_KEY);
                                } catch {}
                                setVerifiedPhone(null);
                                setCurrentStep(1);
                              }}
                              size="small"
                              sx={{ p: 0.5, fontSize: 14 }}
                            >
                              <Box component="span" sx={{ fontSize: 15 }}>
                                ✏️
                              </Box>
                            </IconButton>
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      background: "#f7f7f7",
                      "& .MuiInputBase-input": {
                        height: 40,
                        boxSizing: "border-box",
                        padding: "10px 12px",
                      },
                    }}
                    fullWidth
                    variant="outlined"
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}
              >
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                    "&:hover .hoverIcons": { display: "flex" },
                  }}
                >
                  <TextField
                    id="verifiedPhone"
                    size="small"
                    value={verifiedPhone || ""}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box
                            className="hoverIcons"
                            sx={{
                              display: "none",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              aria-label="Change verified phone"
                              onClick={() => {
                                try {
                                  localStorage.removeItem(PHONE_KEY);
                                } catch {}
                                setVerifiedPhone(null);
                                setCurrentStep(1);
                              }}
                              size="small"
                              sx={{ p: 0.5, fontSize: 14 }}
                            >
                              <Box component="span" sx={{ fontSize: 15 }}>
                                ✏️
                              </Box>
                            </IconButton>
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      background: "#f7f7f7",
                      "& .MuiInputBase-input": {
                        height: 40,
                        boxSizing: "border-box",
                        padding: "10px 12px",
                      },
                    }}
                    fullWidth
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <PhoneInput
                    country={"in"}
                    value={altPhone}
                    onChange={setAltPhone}
                    inputProps={{ name: "altPhone", autoComplete: "off" }}
                    inputStyle={{ ...inputStyle, width: "100%", height: 40 }}
                    specialLabel=""
                    enableSearch
                  />
                </Box>
              </Box>
            )}

            {/* Email ID and Instagram on a single line */}
            <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
              <TextField
                id="email"
                size="small"
                name="email"
                label="Email ID"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-input": {
                    height: 40,
                    boxSizing: "border-box",
                    padding: "10px 12px",
                  },
                }}
                variant="outlined"
                placeholder="Enter email"
                autoComplete="off"
                margin="dense"
              />

              <TextField
                id="instagramId"
                size="small"
                name="instagramId"
                label="Instagram handle (optional)"
                type="text"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-input": {
                    height: 40,
                    boxSizing: "border-box",
                    padding: "10px 12px",
                  },
                }}
                variant="outlined"
                placeholder="@yourhandle or username"
                autoComplete="off"
                margin="dense"
              />
            </Box>
          </Box>
        )}
        {/* Education (step 3): keep education-related fields here */}
        {currentStep === 3 && (
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <div style={{ marginTop: 12 }}>
              <Typography sx={{ fontWeight: 600 }}>Education</Typography>
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <RadioGroup
                  row
                  value={educationType}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEducationType(
                      e.target.value as
                        | "school"
                        | "college"
                        | "diploma"
                        | "other"
                    )
                  }
                >
                  <FormControlLabel
                    value="school"
                    control={<Radio />}
                    label="School"
                  />
                  <FormControlLabel
                    value="diploma"
                    control={<Radio />}
                    label="Diploma"
                  />
                  <FormControlLabel
                    value="college"
                    control={<Radio />}
                    label="College"
                  />
                  <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label="Other"
                  />
                </RadioGroup>
              </FormControl>

              {educationType === "school" ? (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Standard</label>
                  {isCompactSelector ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => cycleStandard(-1)}
                        aria-label="Previous standard"
                        style={{ padding: "6px 10px", cursor: "pointer" }}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowStdPopup((s) => !s)}
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {schoolStd}
                      </button>
                      <button
                        type="button"
                        onClick={() => cycleStandard(1)}
                        aria-label="Next standard"
                        style={{ padding: "6px 10px", cursor: "pointer" }}
                      >
                        ▶
                      </button>
                      {showStdPopup && (
                        <div
                          style={{
                            position: "absolute",
                            background: "#fff",
                            border: "1px solid #ddd",
                            marginTop: 8,
                            zIndex: 60,
                            width: 200,
                          }}
                        >
                          {standardOptions.map((s) => (
                            <div
                              key={s}
                              onClick={() => {
                                setSchoolStd(s);
                                setShowStdPopup(false);
                              }}
                              style={{ padding: 8, cursor: "pointer" }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <TextField
                        select
                        value={schoolStd}
                        onChange={(e) => setSchoolStd(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="dense"
                      >
                        {standardOptions.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </TextField>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => cycleStandard(-1)}
                          aria-label="Previous standard"
                          style={{ padding: "6px 10px", cursor: "pointer" }}
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() => cycleStandard(1)}
                          aria-label="Next standard"
                          style={{ padding: "6px 10px", cursor: "pointer" }}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <label style={labelStyle} htmlFor="board">
                      Board
                    </label>
                    <TextField
                      select
                      id="board"
                      name="board"
                      label="Board"
                      value={form.board}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                    >
                      {boardOptions.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <label style={labelStyle} htmlFor="boardYear">
                      Year
                    </label>
                    <TextField
                      id="boardYear"
                      name="boardYear"
                      label="Year"
                      type="number"
                      value={form.boardYear}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      inputProps={{
                        min: currentYear - 10,
                        max: currentYear + 1,
                      }}
                    />
                  </div>
                </div>
              ) : educationType === "college" ? (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>College Name / Year</label>
                  <TextField
                    label="College name"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="College name"
                  />
                  <TextField
                    label="Year (eg. 2nd)"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Year (eg. 2nd)"
                  />
                </div>
              ) : educationType === "diploma" ? (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Diploma Course</label>
                  <input
                    type="text"
                    value={diplomaCourse}
                    onChange={(e) => setDiplomaCourse(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 8 }}
                    placeholder="Course (eg. Civil, ECE)"
                  />
                  <label style={labelStyle}>Year of Study</label>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <button
                      type="button"
                      onClick={() => cycleDiplomaYear(-1)}
                      aria-label="Previous diploma year"
                      style={{ padding: "6px 10px", cursor: "pointer" }}
                    >
                      ◀
                    </button>
                    <TextField
                      select
                      value={diplomaYear}
                      onChange={(e) => setDiplomaYear(e.target.value)}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      sx={{ flex: 1 }}
                    >
                      {diplomaYearOptions.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </TextField>
                    <button
                      type="button"
                      onClick={() => cycleDiplomaYear(1)}
                      aria-label="Next diploma year"
                      style={{ padding: "6px 10px", cursor: "pointer" }}
                    >
                      ▶
                    </button>
                  </div>
                  <label style={labelStyle}>College Name</label>
                  <TextField
                    label="College name"
                    value={diplomaCollege}
                    onChange={(e) => setDiplomaCollege(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="College name"
                  />
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Tell us about yourself</label>
                  <TextField
                    label="Tell us about yourself"
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    multiline
                    rows={4}
                    placeholder="Describe your background, current work or study"
                  />
                </div>
              )}
            </div>

            <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
              <Button variant="outlined" onClick={() => setCurrentStep(2)}>
                Back to Basic
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  saveDraft();
                  setCurrentStep(4);
                }}
              >
                Save & Next
              </Button>
            </Box>
          </div>
        )}

        {/* Course & Fees (step 4): moved here from step 3 */}
        {currentStep === 4 && (
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>
              Choose course
            </label>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                variant={
                  selectedCourse === "nata-jee" ? "contained" : "outlined"
                }
                fullWidth
                onClick={() => {
                  setSelectedCourse("nata-jee");
                  setActiveTab("nata-jee");
                }}
              >
                NATA / JEE
              </Button>
              <Button
                variant={
                  selectedCourse === "software" ? "contained" : "outlined"
                }
                fullWidth
                onClick={() => {
                  setSelectedCourse("software");
                  setActiveTab("software");
                }}
              >
                Software
              </Button>
            </Box>

            {selectedCourse === "software" && (
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Software Course</label>
                <TextField
                  select
                  label="Software Course"
                  value={softwareCourse}
                  onChange={(e) => setSoftwareCourse(e.target.value)}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                >
                  <MenuItem value="Revit">Revit</MenuItem>
                  <MenuItem value="CAD">CAD</MenuItem>
                  <MenuItem value="SketchUp">SketchUp</MenuItem>
                </TextField>
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Total Fee</label>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      value={SOFTWARE_FEE - (youtubeSubscribed ? 25 : 0)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                    />
                    <div>
                      <YoutubeSubscribe
                        discountAmount={25}
                        label="Subscribe on YouTube"
                        onSubscribed={onYoutubeSubscribed}
                      />
                    </div>
                  </Box>
                </div>
              </div>
            )}

            {selectedCourse === "nata-jee" && (
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>NATA / JEE Fees</label>
                <div style={{ marginTop: 8 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13, color: "#666" }}>
                        Total Fee
                      </Typography>
                      <TextField
                        value={`₹${nataJeeFee || 0}`}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        margin="dense"
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13, color: "#666" }}>
                        Discounted (if full)
                      </Typography>
                      <TextField
                        value={`₹${nataJeeDiscountedFee || nataJeeFee || 0}`}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        margin="dense"
                      />
                    </Box>
                  </Box>

                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <RadioGroup
                      row
                      name="paymentType"
                      value={form.paymentType}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({
                          ...form,
                          paymentType: e.target.value as "full" | "part",
                        })
                      }
                    >
                      <FormControlLabel
                        value="full"
                        control={<Radio />}
                        label="Full"
                      />
                      <FormControlLabel
                        value="part"
                        control={<Radio />}
                        label="Part"
                      />
                    </RadioGroup>
                  </FormControl>

                  {form.paymentType === "part" && (
                    <div style={{ marginTop: 8 }}>
                      <label style={labelStyle}>First Payment</label>
                      <input
                        type="text"
                        value={`₹${nataJeePart1 || 0}`}
                        readOnly
                        style={{ ...inputStyle, background: "#f7f7f7" }}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 8, color: "#666" }}>
                    {nataJeeInfo}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13, color: "#444" }}>
                    {(() => {
                      if (form.paymentType === "full") {
                        return (
                          <div>
                            For full payment: we purchase a classroom license
                            for 1 year. Any additional license months after one
                            year will be provided free if full payment was
                            selected.
                          </div>
                        );
                      }
                      return (
                        <div>
                          For part payment: we purchase a license for 3 months
                          and access will be automatically terminated after 3
                          months unless the second payment is made; once the
                          second payment is completed, a year-long license will
                          be purchased.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
              <Button variant="outlined" onClick={() => setCurrentStep(3)}>
                Back to Education
              </Button>
            </Box>
          </div>
        )}
        {/* Review / Submit flow */}
        {!reviewMode ? (
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {/* On final step show Review button; otherwise show a single Save & Next */}
            {currentStep === 4 ? (
              <Button
                variant="contained"
                sx={{ flex: 1 }}
                onClick={() => setReviewMode(true)}
              >
                Review details
              </Button>
            ) : (
              <Button
                variant="outlined"
                sx={{ flex: 1 }}
                onClick={() => {
                  saveDraft();
                  setCurrentStep(currentStep + 1);
                }}
              >
                Save & Next
              </Button>
            )}

            {draftSaved && (
              <Typography sx={{ color: "green", fontSize: 13, ml: 1 }}>
                Draft saved
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 1.5, fontWeight: 600, fontSize: 16 }}>
              Review your details
            </Typography>
            <Box
              sx={{
                background: "#fff",
                border: "1px solid #eee",
                p: 1.5,
                borderRadius: 1,
              }}
            >
              {/* Build a list of key/label/value pairs to show (only relevant ones) */}
              {(() => {
                const items: Array<[string, string, unknown]> = [];

                // Basic contact fields
                items.push(["studentName", "Student Name", form.studentName]);
                items.push(["fatherName", "Father Name", form.fatherName]);
                items.push(["phone", "Verified Phone", verifiedPhone]);
                items.push(["altPhone", "Additional Contact", altPhone]);
                items.push(["instagramId", "Instagram", instagramId]);

                // Include radio selections in review (education type and payment type)
                const educationLabel =
                  educationType === "school"
                    ? "School"
                    : educationType === "college"
                    ? "College"
                    : educationType === "diploma"
                    ? "Diploma"
                    : "Other";
                items.push([
                  "educationType",
                  "Education (type)",
                  educationLabel,
                ]);

                items.push([
                  "paymentType",
                  "Payment Type",
                  form.paymentType === "full"
                    ? "Full"
                    : form.paymentType === "part"
                    ? "Part"
                    : String(form.paymentType ?? "-"),
                ]);

                // Education-specific fields (only include fields for the selected educationType)
                if (educationType === "school") {
                  items.push([
                    "classGrade",
                    "Class / Standard",
                    form.classGrade,
                  ]);
                  items.push(["board", "Board", form.board]);
                  items.push(["boardYear", "Board Year", form.boardYear]);
                } else if (educationType === "college") {
                  items.push(["collegeName", "College Name", collegeName]);
                  items.push(["collegeYear", "College Year", collegeYear]);
                } else if (educationType === "diploma") {
                  items.push([
                    "diplomaCourse",
                    "Diploma Course",
                    diplomaCourse,
                  ]);
                  items.push(["diplomaYear", "Diploma Year", diplomaYear]);
                  items.push([
                    "diplomaCollege",
                    "Diploma College",
                    diplomaCollege,
                  ]);
                } else if (educationType === "other") {
                  items.push([
                    "otherDescription",
                    "Description",
                    otherDescription,
                  ]);
                }

                // Address (show always)
                // houseNo, street, landmark were removed from the form schema
                items.push(["zipCode", "Zip Code", form.zipCode]);
                items.push(["city", "City", form.city]);
                items.push(["state", "State", form.state]);
                items.push(["country", "Country", form.country]);

                // Language preferences
                items.push([
                  "languageMode",
                  "Language Mode",
                  form.languageMode,
                ]);
                items.push([
                  "selectedLanguages",
                  "Selected Languages",
                  selectedLanguages.join(", "),
                ]);

                // Course selection and course-specific fields
                items.push([
                  "selectedCourse",
                  "Selected Course",
                  selectedCourse,
                ]);
                if (selectedCourse === "software") {
                  items.push([
                    "softwareCourse",
                    "Software Course",
                    softwareCourse,
                  ]);
                }

                return items.map(([key, label, value]) => {
                  const k = String(key);
                  const isHover = hoveredKey === k;
                  return (
                    <div
                      key={k}
                      onMouseEnter={() => setHoveredKey(k)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onClick={() => {
                        setReviewMode(false);
                        setEditField(k);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setReviewMode(false);
                          setEditField(k);
                        }
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 6px",
                        borderBottom: "1px solid #f6f6f6",
                        background: isHover ? "#fbfbfb" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ color: "#666" }}>{label}</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            color: "#111",
                            minWidth: 160,
                            textAlign: "right",
                          }}
                        >
                          {value !== undefined && value !== null
                            ? String(value)
                            : "-"}
                        </div>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            display: isHover ? "flex" : "none",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ opacity: 0.9 }}>✎</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </Box>

            <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
              <button
                type="button"
                onClick={() => setReviewMode(false)}
                style={{
                  padding: "10px 14px",
                  background: "#fff",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Back to edit
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 14px",
                  background: "#7c1fa0",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Confirm & Submit
              </button>
            </Box>
          </Box>
        )}
      </form>
    </Box>
  );
}
