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
          } catch (_e) {
            // ignore
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
    } catch (e) {
      console.warn("Failed to save draft", e);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.warn("City search failed", e);
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
    } catch (e) {
      console.warn("Infer country from state failed", e);
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
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 0 }}>
      {/* Tabs removed — course selection uses in-form controls now */}

      {/* Form Title */}
      <h2
        style={{
          color: "#7c1fa0",
          fontWeight: 700,
          fontSize: 22,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        {activeTab === "nata-jee"
          ? "NATA/JEE Coaching Application Form"
          : "Software Class Application Form"}
      </h2>

      {/* Application Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          // Build application payload including language selections
          const payload = {
            phone: verifiedPhone,
            student_name: form.studentName,
            father_name: form.fatherName,
            gender: form.gender,
            class_grade: form.classGrade,
            board: form.board,
            board_year: form.boardYear,
            payment_type: form.paymentType,
            house_no: form.houseNo,
            street: form.street,
            landmark: form.landmark,
            zip_code: form.zipCode,
            city: form.city,
            state: form.state,
            country: form.country,
            language_mode: form.languageMode,
            selected_languages: selectedLanguages,
            selected_course: selectedCourse,
            education_type: educationType,
            school_standard: schoolStd,
            college_name: collegeName,
            college_year: collegeYear,
            diploma_course: diplomaCourse,
            diploma_year: diplomaYear,
            diploma_college: diplomaCollege,
            other_description: otherDescription,
            software_course: softwareCourse,
            youtube_subscribed: youtubeSubscribed,
            instagram_handle: instagramId,
            created_at: new Date().toISOString(),
          } as Record<string, unknown>;

          // attempt to save application (table 'applications' must exist)
          try {
            await supabase.from("applications").insert(payload);
          } catch (err) {
            console.warn("applications insert error", err);
          }

          // Store location in Supabase (hidden from user)
          if (location) {
            try {
              await supabase.from("user_locations").insert({
                phone: verifiedPhone,
                lat: location.lat,
                lng: location.lng,
                created_at: new Date().toISOString(),
              });
            } catch {
              console.warn("user_locations insert error");
            }
          }
        }}
      >
        {/* Step indicator and Verified Phone Number */}
        <div style={{ marginBottom: 12, fontSize: 14, color: "#666" }}>
          Step {currentStep} of 3
        </div>
        {/* Verified Phone Number */}
        <div>
          <label style={labelStyle} htmlFor="verifiedPhone">
            Verified Phone Number
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              id="verifiedPhone"
              type="text"
              value={verifiedPhone || ""}
              style={{ ...inputStyle, background: "#f7f7f7" }}
              readOnly
            />
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(PHONE_KEY);
                } catch (e) {
                  // ignore
                }
                // reload so component re-checks verification and shows PhoneAuth
                window.location.reload();
              }}
              style={{
                padding: "8px 10px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Change phone
            </button>
          </div>
        </div>
        {/* course selection moved to the end of the form (see below) */}
        {/* Additional Contact Number Field (Step 2: Basics) */}
        {currentStep === 2 && (
          <div>
            {/* Student Name */}
            <label style={labelStyle} htmlFor="studentName">
              Student Name
            </label>
            <input
              id="studentName"
              type="text"
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter student name"
              autoComplete="off"
            />

            {/* Father Name */}
            <label style={labelStyle} htmlFor="fatherName">
              Father Name
            </label>
            <input
              id="fatherName"
              type="text"
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter father name"
              autoComplete="off"
            />

            {/* Gender */}
            <label style={labelStyle} htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              style={inputStyle}
            >
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Address fields */}
            <label style={labelStyle} htmlFor="houseNo">
              House No
            </label>
            <input
              id="houseNo"
              type="text"
              name="houseNo"
              value={form.houseNo as string}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Door / House no"
              autoComplete="off"
            />
            <label style={labelStyle} htmlFor="street">
              Street
            </label>
            <input
              id="street"
              type="text"
              name="street"
              value={form.street as string}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Street / Locality"
              autoComplete="off"
            />
            <label style={labelStyle} htmlFor="landmark">
              Landmark
            </label>
            <input
              id="landmark"
              type="text"
              name="landmark"
              value={form.landmark as string}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Landmark (optional)"
              autoComplete="off"
            />
            <label style={labelStyle} htmlFor="zipCode">
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Postal / ZIP code"
              autoComplete="off"
            />

            {/* City, State, Country: show as text, allow edit on icon click */}
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>City</label>
              <span style={{ marginRight: 8 }}>
                {editField === "city" ? (
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    style={inputStyle}
                    onBlur={() => setEditField(null)}
                    autoFocus
                  />
                ) : (
                  <>
                    {form.city || "(auto-filled)"}
                    <span
                      style={{
                        cursor: "pointer",
                        marginLeft: 6,
                        color: "#888",
                      }}
                      onClick={() => setEditField("city")}
                      title="Edit City"
                    >
                      ✏️
                    </span>
                  </>
                )}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>State</label>
              <span style={{ marginRight: 8 }}>
                {editField === "state" ? (
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    style={inputStyle}
                    onBlur={() => setEditField(null)}
                    autoFocus
                  />
                ) : (
                  <>
                    {form.state || "(auto-filled)"}
                    <span
                      style={{
                        cursor: "pointer",
                        marginLeft: 6,
                        color: "#888",
                      }}
                      onClick={() => setEditField("state")}
                      title="Edit State"
                    >
                      ✏️
                    </span>
                  </>
                )}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Country</label>
              <span style={{ marginRight: 8 }}>
                {editField === "country" ? (
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    style={inputStyle}
                    onBlur={() => setEditField(null)}
                    autoFocus
                  />
                ) : (
                  <>
                    {form.country || "(auto-filled)"}
                    <span
                      style={{
                        cursor: "pointer",
                        marginLeft: 6,
                        color: "#888",
                      }}
                      onClick={() => setEditField("country")}
                      title="Edit Country"
                    >
                      ✏️
                    </span>
                  </>
                )}
              </span>
            </div>

            {/* Verified Phone Number */}
            <label style={labelStyle} htmlFor="verifiedPhone">
              Verified Phone Number
            </label>
            <input
              id="verifiedPhone"
              type="text"
              value={verifiedPhone || ""}
              style={{ ...inputStyle, background: "#f7f7f7" }}
              readOnly
            />

            {/* Additional Contact Number */}
            <label style={labelStyle} htmlFor="altPhone">
              Additional Contact Number (optional)
            </label>
            <PhoneInput
              country={"in"}
              value={altPhone}
              onChange={setAltPhone}
              inputProps={{ name: "altPhone", autoComplete: "off" }}
              inputStyle={{ width: 180, padding: 10 }}
              specialLabel=""
              enableSearch
            />

            {/* Email ID */}
            <label style={labelStyle} htmlFor="email">
              Email ID
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter email"
              autoComplete="off"
            />

            {/* Instagram handle */}
            <label style={labelStyle} htmlFor="instagramId">
              Instagram handle (optional)
            </label>
            <input
              id="instagramId"
              type="text"
              name="instagramId"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              style={{ ...inputStyle, width: 220 }}
              placeholder="@yourhandle or username"
              autoComplete="off"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 12,
              }}
            >
              <button
                type="button"
                disabled
                style={{
                  padding: "10px 14px",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                style={{
                  padding: "10px 14px",
                  background: "#7c1fa0",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* --- Consolidated course selection & fees (placed last) --- */}
        {currentStep === 3 && (
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>
              Choose course
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourse("nata-jee");
                  setActiveTab("nata-jee");
                }}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 6,
                  border:
                    selectedCourse === "nata-jee"
                      ? "2px solid #7c1fa0"
                      : "1px solid #ddd",
                  background:
                    selectedCourse === "nata-jee" ? "#f8eef9" : "#fff",
                  cursor: "pointer",
                }}
              >
                NATA / JEE
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourse("software");
                  setActiveTab("software");
                }}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 6,
                  border:
                    selectedCourse === "software"
                      ? "2px solid #7c1fa0"
                      : "1px solid #ddd",
                  background:
                    selectedCourse === "software" ? "#f8eef9" : "#fff",
                  cursor: "pointer",
                }}
              >
                Software
              </button>
            </div>

            {/* Education type and related fields */}
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Education</label>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="radio"
                    name="educationType"
                    value="school"
                    checked={educationType === "school"}
                    onChange={() => setEducationType("school")}
                  />
                  School
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="radio"
                    name="educationType"
                    value="diploma"
                    checked={educationType === "diploma"}
                    onChange={() => setEducationType("diploma")}
                  />
                  Diploma
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="radio"
                    name="educationType"
                    value="college"
                    checked={educationType === "college"}
                    onChange={() => setEducationType("college")}
                  />
                  College
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="radio"
                    name="educationType"
                    value="other"
                    checked={educationType === "other"}
                    onChange={() => setEducationType("other")}
                  />
                  Other
                </label>
              </div>

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

                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="full"
                        checked={form.paymentType === "full"}
                        onChange={handleChange}
                      />
                      Full
                    </label>
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="part"
                        checked={form.paymentType === "part"}
                        onChange={handleChange}
                      />
                      Part
                    </label>
                  </div>

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
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  padding: "10px 14px",
                  background: "#fff",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                Back to Basic
              </button>
            </div>
          </div>
        )}
        {/* Review / Submit flow */}
        {!reviewMode ? (
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => setReviewMode(true)}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "#7c1fa0",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Review details
            </button>
            <button
              type="button"
              onClick={() => saveDraft()}
              style={{
                padding: "12px 16px",
                background: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Save draft
            </button>
            {draftSaved && (
              <div style={{ color: "green", fontSize: 13, marginLeft: 8 }}>
                Draft saved
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
              Review your details
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 6,
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
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
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
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
