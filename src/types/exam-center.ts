// Exam Center Types
// Shared types for both public site and admin panel

export interface ExamCenter {
  id: string;
  exam_type: "NATA" | "JEE Paper 2";
  state: string;
  city: string;
  center_name: string;
  center_code: string | null;
  description: string | null;
  address: string;
  pincode: string | null;
  phone_number: string | null;
  alternate_phone: string | null;
  email: string | null;
  contact_person: string | null;
  contact_designation: string | null;
  google_maps_link: string | null;
  latitude: number | null;
  longitude: number | null;
  active_years: number[];
  is_confirmed_current_year: boolean;
  status: "active" | "inactive" | "discontinued";
  facilities: string | null;
  instructions: string | null;
  nearest_railway: string | null;
  nearest_bus_stand: string | null;
  landmarks: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// Form input type (for creating/updating)
export interface ExamCenterInput {
  exam_type: "NATA" | "JEE Paper 2";
  state: string;
  city: string;
  center_name: string;
  center_code?: string;
  description?: string;
  address: string;
  pincode?: string;
  phone_number?: string;
  alternate_phone?: string;
  email?: string;
  contact_person?: string;
  contact_designation?: string;
  google_maps_link?: string;
  latitude?: number;
  longitude?: number;
  active_years: number[];
  is_confirmed_current_year: boolean;
  status: "active" | "inactive" | "discontinued";
  facilities?: string;
  instructions?: string;
  nearest_railway?: string;
  nearest_bus_stand?: string;
  landmarks?: string;
  capacity?: number;
}

// CSV Import type (matches CSV template columns)
export interface ExamCenterCSVRow {
  exam_type: string;
  state: string;
  city: string;
  center_name: string;
  center_code: string;
  description: string;
  address: string;
  pincode: string;
  phone_number: string;
  alternate_phone: string;
  email: string;
  contact_person: string;
  contact_designation: string;
  google_maps_link: string;
  latitude: string;
  longitude: string;
  active_years: string; // Comma-separated: "2022,2023,2024"
  is_confirmed_current_year: string; // "true" or "false"
  status: string;
  facilities: string;
  instructions: string;
  nearest_railway: string;
  nearest_bus_stand: string;
  landmarks: string;
  capacity: string;
}

// Filter state for the public search page
export interface ExamCenterFilters {
  examType: "NATA" | "JEE Paper 2" | "";
  state: string;
  city: string;
}

// Stats type for dashboard
export interface ExamCenterStats {
  totalCenters: number;
  confirmedCurrentYear: number;
  byExamType: {
    NATA: number;
    "JEE Paper 2": number;
  };
  byStatus: {
    active: number;
    inactive: number;
    discontinued: number;
  };
  topStates: { state: string; count: number }[];
}

// API response types
export interface ExamCentersResponse {
  data: ExamCenter[];
  count: number;
  error: string | null;
}

export interface ExamCenterResponse {
  data: ExamCenter | null;
  error: string | null;
}

// Supabase database type (for type generation)
export interface Database {
  public: {
    Tables: {
      exam_centers: {
        Row: ExamCenter;
        Insert: ExamCenterInput & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ExamCenterInput>;
      };
    };
    Views: {
      exam_center_states: {
        Row: {
          exam_type: string;
          state: string;
          center_count: number;
        };
      };
      exam_center_cities: {
        Row: {
          exam_type: string;
          state: string;
          city: string;
          center_count: number;
        };
      };
    };
  };
}
