// types/db.ts
export interface UserRow {
  id: string;
  firebase_uid: string | null;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  father_name: string | null;
  gender: 'male' | 'female' | 'nonbinary' | 'prefer_not_to_say' | null;
  zip_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  instagram_handle: string | null;
  education_type: string | null;
  selected_course: string | null;
  course_fee: number | null;
  discount: number | null;
  payment_type: string | null;
  total_payable: number | null;
  created_at: string;
  last_sign_in: string | null;
  providers: unknown;
  phone_auth_used: boolean;
  google_info: unknown;
  linkedin_info: unknown;
  profile: unknown;
  application: unknown;
  extra: unknown;
  updated_at: string;
}

export type UserUpsertPayload = Partial<Pick<UserRow, 
  | 'display_name' 
  | 'father_name' 
  | 'gender' 
  | 'zip_code' 
  | 'city' 
  | 'state' 
  | 'country' 
  | 'email' 
  | 'instagram_handle' 
  | 'education_type'
>> & Record<string, unknown>;