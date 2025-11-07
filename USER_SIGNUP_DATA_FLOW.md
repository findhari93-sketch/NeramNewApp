# User Signup Data Flow - Storage in users_duplicate Table

## Overview

When a new user signs up (via Google, Email, or Phone), their data is automatically stored in the `users_duplicate` table with proper JSONB column grouping.

---

## Database Schema

### Table: `public.users_duplicate`

```sql
CREATE TABLE public.users_duplicate (
  id UUID PRIMARY KEY,
  selected_course TEXT,
  nata_attempt_year TEXT,
  nata_calculator_sessions JSONB DEFAULT '{}'::jsonb,

  -- Grouped JSONB columns
  account JSONB DEFAULT '{}'::jsonb,
  basic JSONB DEFAULT '{}'::jsonb,
  contact JSONB DEFAULT '{}'::jsonb,
  about_user JSONB DEFAULT '{}'::jsonb,
  education JSONB DEFAULT '{}'::jsonb
);
```

### JSONB Column Structure

#### `account` JSONB

```json
{
  "firebase_uid": "string",
  "username": "string",
  "display_name": "string",
  "photo_url": "string",
  "avatar_path": "string",
  "email_verified": boolean,
  "phone_verified": boolean,
  "account_type": "string",
  "last_sign_in": "ISO8601 timestamp",
  "providers": ["google.com", "password", "phone"],
  "phone_auth_used": boolean
}
```

#### `basic` JSONB

```json
{
  "student_name": "string", // ← USER'S NAME STORED HERE
  "father_name": "string",
  "gender": "male|female|nonbinary|prefer_not_to_say",
  "dob": "YYYY-MM-DD",
  "bio": "string"
}
```

#### `contact` JSONB

```json
{
  "email": "string", // ← USER'S EMAIL STORED HERE
  "phone": "string",
  "alternate_phone": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "zip_code": "string"
}
```

#### `about_user` JSONB

```json
{
  "interests": ["array", "of", "strings"],
  "instagram_handle": "string",
  "selected_languages": ["array"],
  "youtube_subscribed": boolean
}
```

#### `education` JSONB

```json
{
  "education_type": "school|college|diploma|other",
  "school_std": "string",
  "board": "string",
  "board_year": "string",
  "school_name": "string",
  "college_name": "string",
  "college_year": "string",
  "diploma_course": "string",
  "diploma_year": "string",
  "diploma_college": "string",
  "other_description": "string"
}
```

---

## Data Flow on Signup

### 1. Google Sign-In Flow

**File:** `src/app/auth/login/page.tsx` (line 112)

```typescript
const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  const user = res.user;

  const idToken = await user.getIdToken();

  // Call upsert API
  await fetch("/api/users/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      uid: user.uid,
      email: user.email, // → Goes to contact.email
      displayName: user.displayName, // → Goes to basic.student_name
      phone: user.phoneNumber, // → Goes to contact.phone
      profile: {
        photoURL: user.photoURL, // → Goes to account.photo_url
      },
      provider: "google.com", // → Added to account.providers[]
    }),
  });
};
```

**What gets stored:**

- `basic.student_name` = Google display name (e.g., "John Doe")
- `contact.email` = Google email (e.g., "john@gmail.com")
- `account.photo_url` = Google profile picture URL
- `account.firebase_uid` = Firebase UID
- `account.providers` = ["google.com"]
- `account.last_sign_in` = Current timestamp

---

### 2. Email/Password Sign-Up Flow

**File:** `src/app/auth/login/page.tsx` (line 810)

```typescript
const cred = await createUserWithEmailAndPassword(
  auth,
  identifier, // email
  password
);

// Upsert to Supabase
const idToken = await cred.user.getIdToken();
await fetch("/api/users/upsert", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({}), // Empty body, data extracted from token
});
```

**What gets stored:**

- `contact.email` = User's email (from Firebase token)
- `account.firebase_uid` = Firebase UID (from token)
- `account.providers` = ["password"]
- `account.last_sign_in` = Current timestamp
- `basic.student_name` = null (user must complete profile later)

---

### 3. Phone Sign-In Flow

When a user signs in with phone:

**What gets stored:**

- `contact.phone` = Phone number (from Firebase token)
- `account.firebase_uid` = Firebase UID
- `account.phone_auth_used` = true
- `account.providers` = ["phone"]
- `account.last_sign_in` = Current timestamp

---

## API Endpoint: `/api/users/upsert`

**File:** `src/app/api/users/upsert/route.ts`

### Key Logic (Updated Implementation)

```typescript
export async function POST(req: Request) {
  // 1. Verify Firebase ID token
  const decoded = await admin.auth().verifyIdToken(idToken);
  const firebaseUid = decoded.uid;

  // 2. Extract data from token and body
  const updates = {
    firebase_uid: firebaseUid,
    email: decoded.email,
    phone: decoded.phone_number,
    last_sign_in: new Date(decoded.auth_time * 1000).toISOString(),
  };

  // 3. Handle name (FIXED: Now stores in student_name)
  const nameFromToken = decoded.name; // From Google/Facebook
  const nameFromBody = body.displayName || body.student_name;

  if (!updates.student_name) {
    updates.student_name = nameFromBody || nameFromToken;
  }

  // 4. Handle photo URL (FIXED: Now stores in photo_url)
  const photoFromToken = decoded.picture; // From Google
  const photoFromBody = body.photoURL || body.profile?.photoURL;

  if (!updates.photo_url) {
    updates.photo_url = photoFromBody || photoFromToken;
  }

  // 5. Map flat structure to JSONB columns
  const mapped = mapToUsersDuplicate(updates);

  // 6. Insert or update in users_duplicate table
  if (existing) {
    // UPDATE
    const merged = mergeUsersDuplicateUpdate(existing, updates);
    await supabaseServer
      .from("users_duplicate")
      .update(merged)
      .eq("id", existing.id);
  } else {
    // INSERT
    mapped.id = randomUUID();
    await supabaseServer.from("users_duplicate").insert(mapped);
  }
}
```

---

## Field Mapping Function

**File:** `src/lib/userFieldMapping.ts`

### `mapToUsersDuplicate()` Function

Converts flat user object to grouped JSONB structure:

```typescript
export function mapToUsersDuplicate(flatUser: Record<string, any>) {
  return {
    id: flatUser.id || flatUser.firebase_uid || randomUUID(),

    account: {
      firebase_uid: flatUser.firebase_uid,
      username: flatUser.username,
      display_name: flatUser.display_name,
      photo_url: flatUser.photo_url || flatUser.photoURL,
      avatar_path: flatUser.avatar_path,
      email_verified: flatUser.email_verified,
      phone_verified: flatUser.phone_verified,
      account_type: flatUser.account_type,
      last_sign_in: flatUser.last_sign_in,
      providers: flatUser.providers,
      phone_auth_used: flatUser.phone_auth_used,
    },

    basic: {
      student_name: flatUser.student_name || flatUser.studentName, // ← NAME GOES HERE
      father_name: flatUser.father_name,
      gender: flatUser.gender,
      dob: flatUser.dob,
      bio: flatUser.bio,
    },

    contact: {
      email: flatUser.email, // ← EMAIL GOES HERE
      phone: flatUser.phone,
      alternate_phone: flatUser.alternate_phone,
      city: flatUser.city,
      state: flatUser.state,
      country: flatUser.country,
      zip_code: flatUser.zip_code,
    },

    about_user: {
      interests: flatUser.interests,
      instagram_handle: flatUser.instagram_handle,
      selected_languages: flatUser.selected_languages,
      youtube_subscribed: flatUser.youtube_subscribed,
    },

    education: {
      education_type: flatUser.education_type,
      school_std: flatUser.school_std,
      board: flatUser.board,
      board_year: flatUser.board_year,
      school_name: flatUser.school_name,
      college_name: flatUser.college_name,
      // ... more education fields
    },
  };
}
```

---

## Example: New Google User

### Input (Google Sign-In)

```json
{
  "uid": "abc123",
  "email": "john.doe@gmail.com",
  "displayName": "John Doe",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "provider": "google.com"
}
```

### Stored in Database

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "selected_course": null,
  "nata_attempt_year": null,
  "nata_calculator_sessions": {},

  "account": {
    "firebase_uid": "abc123",
    "username": null,
    "display_name": "John Doe",
    "photo_url": "https://lh3.googleusercontent.com/...",
    "email_verified": true,
    "phone_verified": false,
    "last_sign_in": "2025-10-21T10:30:00.000Z",
    "providers": ["google.com"],
    "phone_auth_used": false
  },

  "basic": {
    "student_name": "John Doe", // ← NAME STORED HERE
    "father_name": null,
    "gender": null,
    "dob": null,
    "bio": null
  },

  "contact": {
    "email": "john.doe@gmail.com", // ← EMAIL STORED HERE
    "phone": null,
    "city": null,
    "state": null,
    "country": null
  },

  "about_user": {
    "interests": [],
    "youtube_subscribed": false
  },

  "education": {
    "education_type": null
  }
}
```

---

## Summary of Changes Made

### ✅ Fixed Issues

1. **Name Storage:**

   - **Before:** Google `displayName` was stored in `account.display_name`
   - **After:** Now stored in `basic.student_name` (correct location)
   - **Code:** Updated `src/app/api/users/upsert/route.ts` to prioritize `student_name`

2. **Email Storage:**

   - **Already correct:** Stored in `contact.email`
   - **Source:** Extracted from Firebase token `decoded.email`

3. **Profile Picture Storage:**

   - **Before:** Inconsistent handling of Google `photoURL`
   - **After:** Now stored in `account.photo_url` (correct location)
   - **Code:** Added proper fallback logic in upsert route

4. **Code Quality:**
   - **Fixed:** Replaced `require("crypto")` with ES6 `import { randomUUID } from "crypto"`
   - **Result:** No TypeScript/ESLint errors

---

## How to Verify

### 1. Sign up a new user via Google

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/auth/login
# Click "Sign in with Google"
# Complete sign-in
```

### 2. Check database

```sql
SELECT
  id,
  basic->>'student_name' as student_name,
  contact->>'email' as email,
  account->>'photo_url' as photo_url,
  account->>'firebase_uid' as firebase_uid,
  account->'providers' as providers
FROM public.users_duplicate
ORDER BY account->>'last_sign_in' DESC
LIMIT 1;
```

**Expected result:**

```
student_name: "John Doe" (from Google)
email: "john.doe@gmail.com"
photo_url: "https://lh3.googleusercontent.com/..."
firebase_uid: "abc123..."
providers: ["google.com"]
```

---

## Next Steps

If you want to customize what data is saved on signup:

1. **Edit signup body** in `src/app/auth/login/page.tsx`:

   ```typescript
   body: JSON.stringify({
     displayName: user.displayName,
     email: user.email,
     // Add more fields here
   });
   ```

2. **Update field mapping** in `src/lib/userFieldMapping.ts`:

   - Add new fields to appropriate JSONB groups
   - Ensure `mapToUsersDuplicate()` handles the new fields

3. **Test the flow**:
   - Sign up a new user
   - Check database to verify data structure
   - Use `/api/users/me` to fetch and verify data

---

## Related Files

- **Signup flow:** `src/app/auth/login/page.tsx`
- **Upsert API:** `src/app/api/users/upsert/route.ts`
- **Field mapping:** `src/lib/userFieldMapping.ts`
- **Database schema:** `supabase_migrations/` (SQL files)
- **Type definitions:** `src/types/db.ts`

---

## Conclusion

✅ **Name** is now stored in `basic.student_name`  
✅ **Email** is stored in `contact.email`  
✅ **Profile picture** is stored in `account.photo_url`

All user data is properly organized in JSONB columns according to the schema design!
