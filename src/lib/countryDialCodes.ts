export type CountryDialCode = {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
};

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { iso2: "IN", name: "India", dialCode: "91", flag: "🇮🇳" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971", flag: "🇦🇪" },
  { iso2: "SG", name: "Singapore", dialCode: "65", flag: "🇸🇬" },
  { iso2: "US", name: "United States", dialCode: "1", flag: "🇺🇸" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44", flag: "🇬🇧" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966", flag: "🇸🇦" },
  { iso2: "QA", name: "Qatar", dialCode: "974", flag: "🇶🇦" },
  { iso2: "OM", name: "Oman", dialCode: "968", flag: "🇴🇲" },
  { iso2: "BH", name: "Bahrain", dialCode: "973", flag: "🇧🇭" },
  { iso2: "KW", name: "Kuwait", dialCode: "965", flag: "🇰🇼" },
];

const SORTED_BY_LENGTH = [...COUNTRY_DIAL_CODES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

export function findCountryByDialCode(code: string): CountryDialCode | null {
  const cleaned = code.replace(/\D/g, "");
  if (!cleaned) return null;
  return (
    SORTED_BY_LENGTH.find((country) => cleaned.startsWith(country.dialCode)) ||
    null
  );
}

export const DEFAULT_COUNTRY = COUNTRY_DIAL_CODES[0];
