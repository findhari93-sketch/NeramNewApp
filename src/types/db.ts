export type UserRow = {
  id?: string; // UUID primary key (as string)
  firebase_uid?: string | null;
  phone?: string | null;
  email?: string | null;
  username?: string | null;
  student_name?: string | null;
  father_name?: string | null;
  gender?: string | null;
  zip_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  instagram_handle?: string | null;
  education_type?: string | null;
  dob?: string | null;
  bio?: string | null;
  interests?: unknown;
  selected_course?: string | null;
  // Education details (dedicated columns)
  // Now stored as an academic-year label (e.g., "2025-26")
  nata_attempt_year?: string | null;
  school_std?: string | null;
  board?: string | null;
  board_year?: string | null;
  school_name?: string | null;
  college_name?: string | null;
  college_year?: string | null;
  diploma_course?: string | null;
  diploma_year?: string | null;
  diploma_college?: string | null;
  other_description?: string | null;
  course_fee?: number | null;
  discount?: number | null;
  payment_type?: string | null;
  total_payable?: number | null;
  created_at?: string | null;
  last_sign_in?: string | null;
  providers?: unknown;
  phone_auth_used?: boolean | null;
  google_info?: unknown;
  linkedin_info?: unknown;
  profile?: Record<string, unknown> | null;
  application?: Record<string, unknown> | null;
  updated_at?: string | null;
  // Option B (dedicated column, optional if migration applied):
  nata_calculator_sessions?: Record<string, unknown> | null;
};

export type UserUpsertPayload = Partial<
  Pick<
    UserRow,
    | "student_name"
    | "father_name"
    | "gender"
    | "zip_code"
    | "city"
    | "state"
    | "country"
    | "email"
    | "username"
    | "instagram_handle"
    | "education_type"
    | "selected_course"
    | "nata_attempt_year"
    | "school_std"
    | "board"
    | "board_year"
    | "school_name"
    | "college_name"
    | "college_year"
    | "diploma_course"
    | "diploma_year"
    | "diploma_college"
    | "other_description"
  >
> & { [key: string]: unknown };

// types only

// NATA Calculator session schema (Option A: stored under users.profile.nata_calculator_sessions)
export type NataCalculatorSessionInput = {
  markScored: number;
  maxMark: number;
  scores: [number | null, number | null, number | null];
};

export type NataCalculatorResult = {
  academicPercentage: number; // 0-100 with 2-decimal typical precision
  boardOutOf200: number; // academicPercentage * 2
  bestNataScore: number; // max(scores)
  finalCutoff: number; // boardOutOf200 + bestNataScore (out of 400)
  eligibleBoard: boolean;
  eligibleNata: boolean;
  eligibleOverall: boolean;
};

export type NataCalculatorSession = {
  id: string; // unique key (e.g., ISO timestamp)
  createdAt: string; // ISO string
  source?: string; // optional tag like "/nata-cutoff-calculator"
  input: NataCalculatorSessionInput;
  result: NataCalculatorResult;
};

export type NataCalculatorSessionsMap = Record<string, NataCalculatorSession>;
