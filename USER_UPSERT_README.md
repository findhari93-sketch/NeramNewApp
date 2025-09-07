# User Upsert Implementation

This implementation provides phone-based user deduplication for Firebase Phone Auth + Supabase persistence.

## 🎯 Goal

When a user signs in/re-verifies with the **SAME phone number**, never create a new user row. Always upsert into the SAME row keyed to their Firebase UID / phone.

## 🏗️ Architecture

### Database Schema
- **Primary Key**: `id` (TEXT) - Uses Firebase UID
- **Unique Constraint**: `phone` (TEXT) - Prevents duplicate phone numbers
- **Firebase Tracking**: `firebase_uid` (TEXT) - Stores Firebase UID for auth consistency
- **Profile Fields**: Standard columns for known fields (`display_name`, `father_name`, etc.)
- **Flexible Storage**: `extra` (JSONB) - Stores unknown profile fields

### API Endpoint: `/api/users/upsert`

**Method**: POST  
**Body**: 
```json
{
  "idToken": "firebase_id_token",
  "profile": {
    "display_name": "John Doe",
    "city": "New York",
    "custom_field": "any_value"
  }
}
```

**Response**:
```json
{
  "user": {
    "id": "firebase_uid_123",
    "firebase_uid": "firebase_uid_123", 
    "phone": "+1234567890",
    "display_name": "John Doe",
    "city": "New York",
    "extra": { "custom_field": "any_value" },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## 📋 Upsert Logic

1. **Token Verification**: Verify Firebase ID token and extract `uid`, `phone_number`, `email`, `displayName`
2. **Phone Lookup**: Search for existing user by `phone_number`
3. **Update Path**: If user exists → Update existing row with new data
4. **Insert Path**: If no user exists → Create new row with Firebase UID as primary key
5. **Field Separation**: Known fields go to dedicated columns, unknown fields go to `extra` JSONB
6. **Return User**: Return complete user object

## 🔧 Setup

### Environment Variables
```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email  
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Migration
```sql
-- Run this migration to add required columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS extra JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
```

## 💻 Usage

### Frontend Helper
```typescript
import { saveUserProfile } from '@/lib/saveUserProfile';

// After Firebase phone auth success
const user = await saveUserProfile({
  display_name: "John Doe",
  father_name: "Robert Doe",
  gender: "male", 
  city: "New York",
  state: "NY",
  country: "USA",
  zip_code: "10001",
  email: "john@example.com",
  instagram_handle: "@johndoe",
  education_type: "Bachelor's Degree",
  // Custom fields go to 'extra' JSONB
  hobby: "Photography",
  profession: "Software Engineer"
});
```

### Direct API Call
```typescript
const response = await fetch('/api/users/upsert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idToken: await firebase.auth().currentUser.getIdToken(true),
    profile: { display_name: "Updated Name" }
  })
});

const { user } = await response.json();
```

## ✅ Acceptance Criteria

- ✅ **No Duplicates**: Same phone number → Same user row (updated, not duplicated)
- ✅ **Firebase UID Tracking**: `firebase_uid` updated on each sign-in
- ✅ **Partial Updates**: Only provided fields are updated
- ✅ **Type Safety**: Full TypeScript support with `UserRow` and `UserUpsertPayload` types
- ✅ **Flexible Storage**: Unknown fields stored in `extra` JSONB column
- ✅ **Error Handling**: 401 for invalid tokens, 400 for missing phone, 500 for DB errors
- ✅ **RLS Bypass**: Uses service role key for server-side operations

## 🧪 Testing Scenarios

### Scenario 1: First Sign-in
```
Phone: +1234567890 (new)
Result: Create new user with firebase_uid + phone + profile
```

### Scenario 2: Re-verification 
```
Phone: +1234567890 (existing)  
Result: Update existing user, preserve data, merge new profile fields
```

### Scenario 3: Different Phone
```
Phone: +9876543210 (different)
Result: Create separate user (no conflict)
```

## 📁 Files Created/Modified

- `src/types/db.ts` - TypeScript types
- `src/lib/firebaseAdmin.ts` - Firebase Admin SDK setup  
- `src/lib/supabaseAdmin.ts` - Supabase admin client
- `src/app/api/users/upsert/route.ts` - Main API route (rewritten)
- `src/lib/saveUserProfile.ts` - Frontend helper function
- `supabase_migrations/002_add_firebase_uid_extra.sql` - Database migration