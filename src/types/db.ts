export type UserRow = {
  id?: string; // database PK (could be uuid or text)
  firebase_uid?: string | null;
  phone?: string | null;
  email?: string | null;
  display_name?: string | null;
  father_name?: string | null;
  gender?: string | null;
  zip_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  instagram_handle?: string | null;
  education_type?: string | null;
  selected_course?: string | null;
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
};

export type UserUpsertPayload = Partial<
  Pick<
    UserRow,
    | "display_name"
    | "father_name"
    | "gender"
    | "zip_code"
    | "city"
    | "state"
    | "country"
    | "email"
    | "instagram_handle"
    | "education_type"
    | "selected_course"
  >
> & { [key: string]: unknown };

// types only
