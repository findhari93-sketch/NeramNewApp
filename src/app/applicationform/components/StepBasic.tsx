"use client";
// Step: Basic Info
import React, { useState, useEffect, useRef } from "react";
import YoutubeSubscribe from "./YoutubeSubscribe";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import PhoneAuth from "./PhoneAuth";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import { supabase } from "../../../lib/supabase";

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
  address?: Record<string, any>;
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

// Form data shape used in component state
type FormData = {
  studentName?: string;
  fatherName?: string;
  gender?: string;
  classGrade?: string | number;
  board?: string;
  boardYear?: number | string;
  paymentType?: "full" | "part";
  // Address fields
  houseNo?: string;
  street?: string;
  landmark?: string;
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
  const fetchCityStateFromZip = async (zip: string, signal?: AbortSignal) => {
    const cleaned = zip.trim();
    const allowedCountryCodes = ["ae", "in", "sa", "om", "lk"]; // UAE, India, Saudi, Oman, Sri Lanka
    const countryNameToCode: Record<string, string> = {
      "United Arab Emirates": "ae",
      UAE: "ae",
      India: "in",
      "Saudi Arabia": "sa",
      Oman: "om",
      "Sri Lanka": "lk",
      LK: "lk",
    };
    try {
      // mark this as the latest query
      latestZipQuery.current = cleaned;

      // 1) India PIN (6 digits) - use India postal API which is accurate for IN
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
                setForm((prev: FormData) => ({
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
          // ignore or logged above
        }
      }

      // 2) Try allowed country Nominatim queries (preferred)
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
          const resItem = results[0];
          const addr = resItem.address || {};

          // If the result has a postcode and it doesn't match, skip
          if (addr.postcode && addr.postcode !== cleaned) continue;

          // Only accept results within allowed countries
          if (!addr.country) continue;
          const code = countryNameToCode[addr.country] || addr.country_code;
          if (!code || !allowedCountryCodes.includes(code.toLowerCase()))
            continue;

          // Ensure this is still the latest query
          if (latestZipQuery.current !== cleaned) return;

          // Map country to allowed code if possible
          let mappedCountry = addr.country || form.country;
          if (addr.country) {
            const code = countryNameToCode[addr.country] || addr.country_code;
            if (code && allowedCountryCodes.includes(code.toLowerCase())) {
              mappedCountry =
                Object.keys(countryNameToCode).find(
                  (k) => countryNameToCode[k] === code
                ) || addr.country;
            }
          }
          setForm((prev: FormData) => ({
            ...prev,
            city:
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              prev.city,
            state: addr.state || addr.region || prev.state,
            country: mappedCountry,
          }));
          return;
        } catch {
          // ignore and continue
          continue;
        }
      }

      // 3) Final fallback: single Nominatim search but restricted to allowed countries as a list
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
          const resItem = resJson[0];
          const addr = resItem.address || {};
          if (addr.postcode && addr.postcode !== cleaned) return;
          if (latestZipQuery.current !== cleaned) return;
          if (addr.country) {
            const code = countryNameToCode[addr.country] || addr.country_code;
            if (!code || !allowedCountryCodes.includes(code.toLowerCase()))
              return;
          }
          // Map country to allowed code if possible
          let mappedCountry = addr.country || form.country;
          if (addr.country) {
            const code = countryNameToCode[addr.country] || addr.country_code;
            if (code && allowedCountryCodes.includes(code.toLowerCase())) {
              mappedCountry =
                Object.keys(countryNameToCode).find(
                  (k) => countryNameToCode[k] === code
                ) || addr.country;
            }
          }
          setForm((prev: FormData) => ({
            ...prev,
            city:
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              prev.city,
            state: addr.state || addr.region || prev.state,
            country: mappedCountry,
          }));
        }
      } catch {
        // ignore global nominatim errors
      }
    } catch {
      // ignore
    }
  };
  const [altError, setAltError] = useState("");

  // Alternate phone verification state (inline alt contact)
  const [altPhone, setAltPhone] = useState("");
  const [altOtp, setAltOtp] = useState("");
  const [altStep, setAltStep] = useState<"phone" | "otp" | "done">("phone");
  const [altConfirmation, setAltConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [altLoading, setAltLoading] = useState(false);

  const sendAltOtp = async () => {
    setAltError("");
    setAltLoading(true);
    try {
      if (!(window as any).recaptchaVerifierAlt) {
        (window as any).recaptchaVerifierAlt = new RecaptchaVerifier(
          auth,
          "recaptcha-container-alt",
          { size: "invisible" }
        );
        (window as any).recaptchaVerifierAlt.render();
      }
      const formattedPhone = altPhone.startsWith("+")
        ? altPhone
        : "+" + altPhone;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        (window as any).recaptchaVerifierAlt
      );
      setAltConfirmation(confirmationResult);
      setAltStep("otp");
    } catch {
      setAltError("Failed to send OTP. Check phone number.");
    }
    setAltLoading(false);
  };

  const verifyAltOtp = async () => {
    setAltError("");
    setAltLoading(true);
    try {
      if (altConfirmation) {
        await altConfirmation.confirm(altOtp);
        setAltStep("done");
      } else {
        setAltError("No confirmation object. Please retry.");
      }
    } catch {
      setAltError("Invalid OTP. Try again.");
    }
    setAltLoading(false);
  };
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
    houseNo: "",
    street: "",
    landmark: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    // language preference mode: 'english' | 'native' | 'combination'
    languageMode: "english",
  });

  // YouTube subscribe flow state (moved into reusable component)
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  // Location / reverse-geocode state
  const [location, setLocation] = useState<Loc | null>(null);
  const [locationError, setLocationError] = useState("");

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
        houseNo: prev.houseNo || addr.house_number || addr.building || "",
        street:
          prev.street ||
          addr.road ||
          addr.neighbourhood ||
          addr.suburb ||
          addr.village ||
          "",
        landmark: prev.landmark || addr.landmark || addr.city_district || "",
        zipCode: prev.zipCode || addr.postcode || "",
        city:
          prev.city ||
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          prev.city,
        state: prev.state || addr.state || addr.region || "",
        country: prev.country || addr.country || "",
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
  const [languageQuery, setLanguageQuery] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "English",
  ]);

  // Review & edit flow
  const [reviewMode, setReviewMode] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Draft persistence key and feedback
  const DRAFT_KEY = "neram_application_draft_v1";
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

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
      // clear editField after focusing
      setEditField(null);
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

  // Subscribe callback handler used by the reusable component
  const onYoutubeSubscribed = (s: boolean) => {
    setYoutubeSubscribed(s);
  };

  const addLanguage = (lang: string) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setSelectedLanguages((s) => (s.includes(lang) ? s : [...s, lang]));
    setLanguageQuery("");
  };

  const removeLanguage = (lang: string) => {
    setSelectedLanguages((s) => s.filter((x) => x !== lang));
  };

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

  // City autocomplete state
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<NominatimPlace[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  // Loading indicators for lookups
  const [zipLoading, setZipLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

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
            const code =
              (addr.country &&
                (COUNTRY_NAME_TO_CODE[addr.country] || countryCodeFromAddr)) ||
              undefined;
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
      city: addr.city || addr.town || addr.village || addr.county || prev.city,
      state: addr.state || addr.region || prev.state,
      country: addr.country || prev.country,
    }));
    setCityQuery("");
    setCitySuggestions([]);
    setShowCitySuggestions(false);
  };
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
          country: addr.country || prev.country,
        }));
      }
    } catch (err) {
      console.warn("Infer country from state failed", err);
    }
  };

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
        basicRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
    } catch (_e) {
      // ignore
    }
  }, [currentStep]);

  // Multi-step flow state: 1=phone verify, 2=basic details, 3=education, 4=course, 5=review

  // Render step 1: Phone verification when currentStep === 1
  // PhoneAuth will call onVerified with the normalized E.164 phone string.
  if (currentStep === 1) {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto", padding: 0 }}>
        <h2
          style={{
            color: "#7c1fa0",
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Verify your phone number to continue
        </h2>
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
    <Box sx={{ maxWidth: 420, m: "40px auto", p: 0 }}>
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
          Step {currentStep} of 3
        </Typography>
        {/* course selection moved to the end of the form (see below) */}
        {/* Additional Contact Number Field (Step 2: Basics) */}
        {currentStep === 2 && (
          <Box>
            {/* Student Name */}
            <TextField
              id="studentName"
              name="studentName"
              label="Student Name"
              value={form.studentName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="off"
            />

            {/* Father Name */}
            <TextField
              id="fatherName"
              name="fatherName"
              label="Father Name"
              value={form.fatherName as string}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="off"
            />

            {/* Gender */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                name="gender"
                value={form.gender}
                label="Gender"
                onChange={handleChange}
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
              id="houseNo"
              name="houseNo"
              label="House No"
              value={form.houseNo as string}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Door / House no"
              autoComplete="off"
            />
            <TextField
              id="street"
              name="street"
              label="Street"
              value={form.street as string}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Street / Locality"
              autoComplete="off"
            />
            <TextField
              id="landmark"
              name="landmark"
              label="Landmark"
              value={form.landmark as string}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Landmark (optional)"
              autoComplete="off"
            />
            <TextField
              id="zipCode"
              name="zipCode"
              label="Zip Code"
              value={form.zipCode}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Postal / ZIP code"
              autoComplete="off"
            />

            {/* City, State, Country: show as text, allow edit on icon click */}
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{ fontSize: 14, color: "#333", fontWeight: 500, mb: 0.5 }}
              >
                City
              </Typography>
              {editField === "city" ? (
                <TextField
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "#666" }}>
                    {form.city || "(auto-filled)"}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setEditField("city")}
                    sx={{ minWidth: 0 }}
                  >
                    ✏️
                  </Button>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{ fontSize: 14, color: "#333", fontWeight: 500, mb: 0.5 }}
              >
                State
              </Typography>
              {editField === "state" ? (
                <TextField
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "#666" }}>
                    {form.state || "(auto-filled)"}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setEditField("state")}
                    sx={{ minWidth: 0 }}
                  >
                    ✏️
                  </Button>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{ fontSize: 14, color: "#333", fontWeight: 500, mb: 0.5 }}
              >
                Country
              </Typography>
              {editField === "country" ? (
                <TextField
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "#666" }}>
                    {form.country || "(auto-filled)"}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setEditField("country")}
                    sx={{ minWidth: 0 }}
                  >
                    ✏️
                  </Button>
                </Box>
              )}
            </Box>

            {/* Verified Phone Number with Change option */}
            <label style={labelStyle} htmlFor="verifiedPhone">
              Verified Phone Number
            </label>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                id="verifiedPhone"
                value={verifiedPhone || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                sx={{ background: "#f7f7f7" }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  try {
                    localStorage.removeItem(PHONE_KEY);
                  } catch {
                    // ignore
                  }
                  setVerifiedPhone(null);
                  setCurrentStep(1);
                }}
              >
                Change phone
              </Button>
            </Box>

            {/* Additional Contact Number with OTP verification */}
            <label style={labelStyle} htmlFor="altPhone">
              Additional Contact Number (optional)
            </label>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <PhoneInput
                country={"in"}
                value={altPhone}
                onChange={setAltPhone}
                inputProps={{ name: "altPhone", autoComplete: "off" }}
                inputStyle={{ ...inputStyle, width: "100%" }}
                specialLabel=""
                enableSearch
              />
              {altStep === "phone" && altPhone && altPhone.length >= 10 && (
                <Button
                  variant="contained"
                  onClick={sendAltOtp}
                  disabled={altLoading}
                >
                  {altLoading ? "Sending..." : "Send OTP"}
                </Button>
              )}
            </Box>
            {altStep === "otp" && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                  Enter OTP
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    id="altOtp"
                    value={altOtp}
                    onChange={(e) => setAltOtp(e.target.value)}
                    variant="outlined"
                    placeholder="Enter OTP"
                    autoComplete="off"
                  />
                  <Button
                    variant="contained"
                    onClick={verifyAltOtp}
                    disabled={altLoading}
                  >
                    Verify OTP
                  </Button>
                </Box>
                {altError && (
                  <Typography sx={{ color: "red", mt: 0.5 }}>
                    {altError}
                  </Typography>
                )}
              </Box>
            )}
            {altStep === "done" && (
              <Typography sx={{ color: "green", mt: 1 }}>
                Additional contact verified!
              </Typography>
            )}

            {/* Email ID */}
            <TextField
              id="email"
              name="email"
              label="Email ID"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Enter email"
              autoComplete="off"
            />

            {/* Instagram handle */}
            <TextField
              id="instagramId"
              name="instagramId"
              label="Instagram handle (optional)"
              type="text"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              variant="outlined"
              sx={{ width: 220 }}
              placeholder="@yourhandle or username"
              autoComplete="off"
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 1.5,
              }}
            >
              <Button variant="outlined" disabled>
                Back
              </Button>
              <Button variant="contained" onClick={() => setCurrentStep(3)}>
                Next
              </Button>
            </Box>
          </Box>
        )}
        {/* --- Consolidated course selection & fees (placed last) --- */}
        {currentStep === 3 && (
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

            {/* Education type and related fields */}
            <div style={{ marginTop: 12 }}>
              <Typography sx={{ fontWeight: 600 }}>Education</Typography>
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <RadioGroup
                  row
                  value={educationType}
                  onChange={(e) => setEducationType(e.target.value as any)}
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
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
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
                      <select
                        value={schoolStd}
                        onChange={(e) => setSchoolStd(e.target.value)}
                        style={inputStyle}
                      >
                        {standardOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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
                    <select
                      id="board"
                      name="board"
                      value={form.board}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      {boardOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <label style={labelStyle} htmlFor="boardYear">
                      Year
                    </label>
                    <input
                      id="boardYear"
                      type="number"
                      name="boardYear"
                      value={form.boardYear}
                      onChange={handleChange}
                      style={inputStyle}
                      min={currentYear - 10}
                      max={currentYear + 1}
                    />
                  </div>
                </div>
              ) : educationType === "college" ? (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>College Name / Year</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 8 }}
                    placeholder="College name"
                  />
                  <input
                    type="text"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                    style={inputStyle}
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
                    <select
                      value={diplomaYear}
                      onChange={(e) => setDiplomaYear(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      {diplomaYearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
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
                  <input
                    type="text"
                    value={diplomaCollege}
                    onChange={(e) => setDiplomaCollege(e.target.value)}
                    style={inputStyle}
                    placeholder="College name"
                  />
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Tell us about yourself</label>
                  <textarea
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    style={{ ...inputStyle, height: 120 }}
                    placeholder="Describe your background, current work or study"
                  />
                </div>
              )}
            </div>

            {/* Software course & fee (only when software is selected) */}
            {selectedCourse === "software" && (
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Software Course</label>
                <select
                  value={softwareCourse}
                  onChange={(e) => setSoftwareCourse(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Revit">Revit</option>
                  <option value="CAD">CAD</option>
                  <option value="SketchUp">SketchUp</option>
                </select>
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Total Fee</label>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      type="text"
                      name="fee"
                      value={SOFTWARE_FEE - (youtubeSubscribed ? 25 : 0)}
                      style={{ ...inputStyle, background: "#f7f7f7" }}
                      readOnly
                    />
                    <div>
                      <YoutubeSubscribe
                        discountAmount={25}
                        label="Subscribe on YouTube"
                        onSubscribed={onYoutubeSubscribed}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* NATA/JEE fee fields (show when NATA/JEE selected) */}
            {selectedCourse === "nata-jee" && (
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>NATA / JEE Fees</label>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Total Fee</label>
                      <input
                        type="text"
                        value={`₹${nataJeeFee || 0}`}
                        readOnly
                        style={{ ...inputStyle, background: "#f7f7f7" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Discounted (if full)</label>
                      <input
                        type="text"
                        value={`₹${nataJeeDiscountedFee || nataJeeFee || 0}`}
                        readOnly
                        style={{ ...inputStyle, background: "#f7f7f7" }}
                      />
                    </div>
                  </div>

                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <RadioGroup
                      row
                      name="paymentType"
                      value={form.paymentType}
                      onChange={(e) =>
                        setForm({ ...form, paymentType: e.target.value as any })
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
                  {/* Licensing message depending on fee bracket and payment type */}
                  <div style={{ marginTop: 12, fontSize: 13, color: "#444" }}>
                    {(() => {
                      // For both brackets the messaging is similar but values differ; show generic text
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
              <Button variant="outlined" onClick={() => setCurrentStep(2)}>
                Back to Basic
              </Button>
            </Box>
          </div>
        )}
        {/* Review / Submit flow */}
        {!reviewMode ? (
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              sx={{ flex: 1 }}
              onClick={() => setReviewMode(true)}
            >
              Review details
            </Button>
            <Button variant="outlined" onClick={() => saveDraft()}>
              Save draft
            </Button>
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
                items.push(["houseNo", "Door / House No", form.houseNo]);
                items.push(["street", "Street / Locality", form.street]);
                items.push(["landmark", "Landmark", form.landmark]);
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
