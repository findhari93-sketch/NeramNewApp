/**
 * Profile field schemas for user profile editing
 * Extracted from profile page for better maintainability
 */

// Type definitions
export type FieldType =
  | "text"
  | "email"
  | "date"
  | "multiline"
  | "select"
  | "multi-select"
  | "cycle"
  | "chips";

export type FieldOption = {
  value: string | boolean;
  label: string;
};

export type DrawerField = {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  required?: boolean;
};

// Profile fields schema
export const profileFields: DrawerField[] = [
  { name: "father_name", label: "Father's Name", type: "text" },
  {
    name: "student_name",
    label: "Student Name",
    type: "text",
    required: true,
  },
  { name: "bio", label: "Bio", type: "multiline" },
  { name: "dob", label: "Date of Birth", type: "date" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "nonbinary", label: "Other" },
    ],
  },
  { name: "interests", label: "Interests", type: "chips" },
  {
    name: "selected_languages",
    label: "Languages",
    type: "multi-select",
    options: [
      { value: "English", label: "English" },
      { value: "Tamil", label: "Tamil" },
      { value: "Hindi", label: "Hindi" },
    ],
  },
  {
    name: "youtube_subscribed",
    label: "Subscribed to YouTube?",
    type: "cycle",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  },
  {
    name: "selected_course",
    label: "Course",
    type: "select",
    options: [
      { value: "nata-jee", label: "NATA/JEE" },
      { value: "barch", label: "B.Arch" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "software_course",
    label: "Software Course",
    type: "select",
    options: [
      { value: "Revit", label: "Revit" },
      { value: "AutoCAD", label: "AutoCAD" },
      { value: "SketchUp", label: "SketchUp" },
    ],
  },
];

// Account fields schema
export const accountFields: DrawerField[] = [
  { name: "username", label: "Username", type: "text", required: true },
];

// Contact fields schema
export const contactFields: DrawerField[] = [
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Verified Number", type: "text" },
  { name: "alternate_phone", label: "Alternate Number", type: "text" },
  {
    name: "city",
    label: "City",
    type: "select",
    options: [
      { value: "Chennai", label: "Chennai" },
      { value: "Coimbatore", label: "Coimbatore" },
      { value: "Madurai", label: "Madurai" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "state",
    label: "State",
    type: "select",
    options: [
      { value: "Tamil Nadu", label: "Tamil Nadu" },
      { value: "Kerala", label: "Kerala" },
      { value: "Karnataka", label: "Karnataka" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "country",
    label: "Country",
    type: "select",
    options: [
      { value: "India", label: "India" },
      { value: "Other", label: "Other" },
    ],
  },
  { name: "zip_code", label: "Zip Code", type: "text" },
];

// Education fields schema
export const educationFields: DrawerField[] = [
  {
    name: "education_type",
    label: "Education Type",
    type: "select",
    options: [
      { value: "school", label: "School" },
      { value: "college", label: "College" },
      { value: "diploma", label: "Diploma" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "school_std",
    label: "School Standard/Grade",
    type: "cycle",
    options: [
      { value: "Below 10th", label: "Below 10th" },
      { value: "10th", label: "10th" },
      { value: "11th", label: "11th" },
      { value: "12th", label: "12th" },
    ],
  },
  {
    name: "board",
    label: "Education Board",
    type: "select",
    options: [
      { value: "CBSE", label: "CBSE" },
      { value: "State Board", label: "State Board" },
      { value: "ICSE", label: "ICSE" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "board_year",
    label: "Board Exam Year",
    type: "cycle",
    options: [
      { value: "2022-23", label: "2022-23" },
      { value: "2023-24", label: "2023-24" },
      { value: "2024-25", label: "2024-25" },
      { value: "2025-26", label: "2025-26" },
      { value: "2026-27", label: "2026-27" },
      { value: "2027-28", label: "2027-28" },
    ],
  },
  { name: "school_name", label: "School Name", type: "text" },
  { name: "college_name", label: "College Name", type: "text" },
  {
    name: "college_year",
    label: "College Year",
    type: "cycle",
    options: [
      { value: "1st Year", label: "1st Year" },
      { value: "2nd Year", label: "2nd Year" },
      { value: "3rd Year", label: "3rd Year" },
      { value: "Completed", label: "Completed" },
    ],
  },
  { name: "diploma_course", label: "Diploma Course", type: "text" },
  {
    name: "diploma_year",
    label: "Diploma Year",
    type: "cycle",
    options: [
      { value: "2022-23", label: "2022-23" },
      { value: "2023-24", label: "2023-24" },
      { value: "2024-25", label: "2024-25" },
      { value: "2025-26", label: "2025-26" },
      { value: "2026-27", label: "2026-27" },
      { value: "2027-28", label: "2027-28" },
      { value: "Completed", label: "Completed" },
    ],
  },
  { name: "diploma_college", label: "Diploma College Name", type: "text" },
  {
    name: "nata_attempt_year",
    label: "NATA Attempt Year",
    type: "cycle",
    options: [
      { value: "2022-23", label: "2022-23" },
      { value: "2023-24", label: "2023-24" },
      { value: "2024-25", label: "2024-25" },
      { value: "2025-26", label: "2025-26" },
      { value: "2026-27", label: "2026-27" },
      { value: "2027-28", label: "2027-28" },
    ],
  },
  {
    name: "other_description",
    label: "What I do ?",
    type: "multiline",
  },
];

/**
 * Helper function to determine which fields should be displayed based on education type
 * @param educationType - The type of education (school, college, diploma, other)
 * @returns Array of field names to display
 */
export const getFieldsForEducationType = (educationType: string): string[] => {
  const normalizedType = (educationType || "school").toLowerCase();
  const commonFields = ["education_type", "nata_attempt_year"];

  switch (normalizedType) {
    case "college":
      return [...commonFields, "college_name", "college_year"];
    case "school":
      return [
        ...commonFields,
        "school_std",
        "board",
        "board_year",
        "school_name",
      ];
    case "diploma":
      return [
        ...commonFields,
        "diploma_college",
        "diploma_year",
        "diploma_course",
      ];
    case "other":
      return [...commonFields, "other_description"];
    default:
      return [
        ...commonFields,
        "school_std",
        "board",
        "board_year",
        "school_name",
      ]; // default to school
  }
};

// Cache configuration
export const CACHE_CONFIG = {
  USER_CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  AVATAR_CACHE_EXPIRES_IN: 300, // 5 minutes in seconds
} as const;
