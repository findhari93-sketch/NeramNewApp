/**
 * Field mapping utilities for users_duplicate table with grouped JSONB columns
 */

export interface UsersDuplicateRow {
  id: string;
  selected_course: string | null;
  nata_attempt_year: string | null;
  nata_calculator_sessions: Record<string, any>;
  created_at_tz?: string;
  account: {
    firebase_uid?: string;
    username?: string;
    display_name?: string;
    photo_url?: string;
    avatar_path?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    account_type?: string;
    last_sign_in?: string;
    providers?: string[];
    phone_auth_used?: boolean;
  };
  basic: {
    student_name?: string;
    father_name?: string;
    gender?: "male" | "female" | "nonbinary" | "prefer_not_to_say";
    dob?: string;
    bio?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    alternate_phone?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  };
  about_user: {
    interests?: string[];
    instagram_handle?: string;
    selected_languages?: string[];
    youtube_subscribed?: boolean;
  };
  education: {
    education_type?: "school" | "college" | "diploma" | "other";
    school_std?: string;
    board?: string;
    board_year?: string;
    school_name?: string;
    college_name?: string;
    college_year?: string;
    diploma_course?: string;
    diploma_year?: string;
    diploma_college?: string;
    other_description?: string;
  };
}

/**
 * Map flat user object (old schema) to grouped JSONB structure (new schema)
 */
export function mapToUsersDuplicate(
  flatUser: Record<string, any>
): Partial<UsersDuplicateRow> {
  const mapped: Partial<UsersDuplicateRow> = {
    id: flatUser.id || flatUser.uuid || flatUser.firebase_uid,
    created_at_tz: flatUser.created_at_tz || new Date().toISOString(),
    selected_course:
      flatUser.selected_course || flatUser.selectedCourse || null,
    nata_attempt_year:
      flatUser.nata_attempt_year || flatUser.nataAttemptYear || null,
    nata_calculator_sessions:
      flatUser.nata_calculator_sessions ||
      flatUser.nataCalculatorSessions ||
      {},
  };

  // Account group
  mapped.account = {
    firebase_uid: flatUser.firebase_uid || flatUser.firebaseUid,
    username: flatUser.username,
    display_name: flatUser.display_name || flatUser.displayName,
    photo_url:
      flatUser.photo_url || flatUser.photoURL || flatUser.profile?.photoURL,
    avatar_path: flatUser.avatar_path || flatUser.avatarPath,
    email_verified: flatUser.email_verified || flatUser.emailVerified,
    phone_verified: flatUser.phone_verified || flatUser.phoneVerified,
    account_type: flatUser.account_type || flatUser.accountType,
    last_sign_in: flatUser.last_sign_in || flatUser.lastSignIn,
    providers: flatUser.providers,
    phone_auth_used: flatUser.phone_auth_used || flatUser.phoneAuthUsed,
  };

  // Basic group
  mapped.basic = {
    student_name: flatUser.student_name || flatUser.studentName,
    father_name: flatUser.father_name || flatUser.fatherName,
    gender: flatUser.gender,
    dob: flatUser.dob || flatUser.dateOfBirth,
    bio: flatUser.bio,
  };

  // Contact group
  mapped.contact = {
    email: flatUser.email,
    phone: flatUser.phone,
    alternate_phone:
      flatUser.alternate_phone || flatUser.alternatePhone || flatUser.altPhone,
    city: flatUser.city,
    state: flatUser.state,
    country: flatUser.country,
    zip_code: flatUser.zip_code || flatUser.zipCode,
  };

  // About user group
  mapped.about_user = {
    interests: flatUser.interests,
    instagram_handle:
      flatUser.instagram_handle ||
      flatUser.instagramHandle ||
      flatUser.instagramId,
    selected_languages:
      flatUser.selected_languages || flatUser.selectedLanguages,
    youtube_subscribed:
      flatUser.youtube_subscribed || flatUser.youtubeSubscribed,
  };

  // Education group
  mapped.education = {
    education_type: flatUser.education_type || flatUser.educationType,
    school_std:
      flatUser.school_std || flatUser.schoolStd || flatUser.classGrade,
    board: flatUser.board,
    board_year: flatUser.board_year || flatUser.boardYear,
    school_name: flatUser.school_name || flatUser.schoolName,
    college_name: flatUser.college_name || flatUser.collegeName,
    college_year: flatUser.college_year || flatUser.collegeYear,
    diploma_course: flatUser.diploma_course || flatUser.diplomaCourse,
    diploma_year: flatUser.diploma_year || flatUser.diplomaYear,
    diploma_college: flatUser.diploma_college || flatUser.diplomaCollege,
    other_description: flatUser.other_description || flatUser.otherDescription,
  };

  // Remove undefined values to keep JSONB clean
  Object.keys(mapped).forEach((groupKey) => {
    if (
      typeof mapped[groupKey as keyof UsersDuplicateRow] === "object" &&
      mapped[groupKey as keyof UsersDuplicateRow] !== null
    ) {
      const group = mapped[groupKey as keyof UsersDuplicateRow] as Record<
        string,
        any
      >;
      Object.keys(group).forEach((key) => {
        if (group[key] === undefined) {
          delete group[key];
        }
      });
    }
  });

  return mapped;
}

/**
 * Map grouped JSONB structure (new schema) to flat user object (old schema)
 * for backward compatibility with frontend code
 */
export function mapFromUsersDuplicate(
  dbRow: UsersDuplicateRow
): Record<string, any> {
  const account = dbRow.account || {};
  const basic = dbRow.basic || {};
  const contact = dbRow.contact || {};
  const aboutUser = dbRow.about_user || {};
  const education = dbRow.education || {};

  return {
    // Top-level fields
    id: dbRow.id,
    uuid: dbRow.id, // For compatibility with useSyncedUser
    created_at_tz: dbRow.created_at_tz,
    createdAt: dbRow.created_at_tz,
    selected_course: dbRow.selected_course,
    selectedCourse: dbRow.selected_course,
    nata_attempt_year: dbRow.nata_attempt_year,
    nataAttemptYear: dbRow.nata_attempt_year,
    nata_calculator_sessions: dbRow.nata_calculator_sessions || {},
    nataCalculatorSessions: dbRow.nata_calculator_sessions || {},

    // Account fields (flattened)
    firebase_uid: account.firebase_uid,
    firebaseUid: account.firebase_uid,
    username: account.username,
    display_name: account.display_name,
    displayName: account.display_name,
    photo_url: account.photo_url,
    photoURL: account.photo_url,
    avatar_path: account.avatar_path,
    avatarPath: account.avatar_path,
    email_verified: account.email_verified,
    emailVerified: account.email_verified,
    phone_verified: account.phone_verified,
    phoneVerified: account.phone_verified,
    account_type: account.account_type,
    accountType: account.account_type,
    last_sign_in: account.last_sign_in,
    lastSignIn: account.last_sign_in,
    providers: account.providers,
    phone_auth_used: account.phone_auth_used,
    phoneAuthUsed: account.phone_auth_used,

    // Basic fields (flattened)
    student_name: basic.student_name,
    studentName: basic.student_name,
    father_name: basic.father_name,
    fatherName: basic.father_name,
    gender: basic.gender,
    dob: basic.dob,
    dateOfBirth: basic.dob,
    bio: basic.bio,

    // Contact fields (flattened)
    email: contact.email,
    phone: contact.phone,
    alternate_phone: contact.alternate_phone,
    alternatePhone: contact.alternate_phone,
    altPhone: contact.alternate_phone,
    city: contact.city,
    state: contact.state,
    country: contact.country,
    zip_code: contact.zip_code,
    zipCode: contact.zip_code,

    // About user fields (flattened)
    interests: aboutUser.interests,
    instagram_handle: aboutUser.instagram_handle,
    instagramHandle: aboutUser.instagram_handle,
    instagramId: aboutUser.instagram_handle,
    selected_languages: aboutUser.selected_languages,
    selectedLanguages: aboutUser.selected_languages,
    youtube_subscribed: aboutUser.youtube_subscribed,
    youtubeSubscribed: aboutUser.youtube_subscribed,

    // Education fields (flattened)
    education_type: education.education_type,
    educationType: education.education_type,
    school_std: education.school_std,
    schoolStd: education.school_std,
    classGrade: education.school_std,
    board: education.board,
    board_year: education.board_year,
    boardYear: education.board_year,
    school_name: education.school_name,
    schoolName: education.school_name,
    college_name: education.college_name,
    collegeName: education.college_name,
    college_year: education.college_year,
    collegeYear: education.college_year,
    diploma_course: education.diploma_course,
    diplomaCourse: education.diploma_course,
    diploma_year: education.diploma_year,
    diplomaYear: education.diploma_year,
    diploma_college: education.diploma_college,
    diplomaCollege: education.diploma_college,
    other_description: education.other_description,
    otherDescription: education.other_description,

    // Keep grouped objects for new code
    account,
    basic,
    contact,
    about_user: aboutUser,
    aboutUser,
    education,

    // Legacy profile shape
    profile: {
      photoURL: account.photo_url,
      student_name: basic.student_name,
      email: contact.email,
      phone: contact.phone,
    },
  };
}

/**
 * Merge updates into existing grouped JSONB structure
 */
export function mergeUsersDuplicateUpdate(
  existing: Partial<UsersDuplicateRow>,
  updates: Record<string, any>
): Partial<UsersDuplicateRow> {
  const mapped = mapToUsersDuplicate(updates);

  return {
    id: existing.id,
    // CRITICAL: Preserve existing created_at_tz, never overwrite it
    created_at_tz: existing.created_at_tz,
    selected_course: mapped.selected_course ?? existing.selected_course,
    nata_attempt_year: mapped.nata_attempt_year ?? existing.nata_attempt_year,
    nata_calculator_sessions: {
      ...(existing.nata_calculator_sessions || {}),
      ...(mapped.nata_calculator_sessions || {}),
    },
    account: {
      ...(existing.account || {}),
      ...(mapped.account || {}),
    },
    basic: {
      ...(existing.basic || {}),
      ...(mapped.basic || {}),
    },
    contact: {
      ...(existing.contact || {}),
      ...(mapped.contact || {}),
    },
    about_user: {
      ...(existing.about_user || {}),
      ...(mapped.about_user || {}),
    },
    education: {
      ...(existing.education || {}),
      ...(mapped.education || {}),
    },
  };
}
