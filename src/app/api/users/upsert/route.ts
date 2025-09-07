import { NextResponse } from "next/server";
import { verifyIdToken } from "../../../../lib/firebaseAdmin";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import type { UserRow } from "../../../../types/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body || !body.idToken) {
      return NextResponse.json(
        { error: "Missing idToken in request body" },
        { status: 400 }
      );
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(body.idToken);
    } catch (error) {
      console.error("Invalid ID token:", error);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Extract required fields from token
    const { uid: firebase_uid, phone_number, email, name: displayName } = decodedToken;
    
    if (!phone_number) {
      return NextResponse.json(
        { error: "Phone not found on token" },
        { status: 400 }
      );
    }

    const profile = body.profile || {};

    // Separate known columns from unknown fields
    const knownColumns = {
      display_name: profile.display_name || displayName || null,
      father_name: profile.father_name || null,
      gender: profile.gender || null,
      zip_code: profile.zip_code || null,
      city: profile.city || null,
      state: profile.state || null,
      country: profile.country || null,
      email: profile.email || email || null,
      instagram_handle: profile.instagram_handle || null,
      education_type: profile.education_type || null,
    };

    // Extract unknown fields for the extra JSONB column
    const knownKeys = new Set([
      'display_name', 'father_name', 'gender', 'zip_code', 'city', 
      'state', 'country', 'email', 'instagram_handle', 'education_type'
    ]);
    const extraFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(profile)) {
      if (!knownKeys.has(key)) {
        extraFields[key] = value;
      }
    }

    // First, try to find existing user by phone
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("phone", phone_number)
      .single();

    if (selectError && selectError.code !== "PGRST116") { // PGRST116 = not found
      console.error("Database select error:", selectError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    let userRow: UserRow;

    if (existingUser) {
      // Update existing user
      const updateData: Partial<UserRow> = {
        firebase_uid,
        ...knownColumns,
        last_sign_in: new Date().toISOString(),
      };

      // Only update extra if there are new fields
      if (Object.keys(extraFields).length > 0) {
        updateData.extra = extraFields;
      }

      // Remove null/undefined values to perform partial update
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      );

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update(cleanedUpdateData)
        .eq("id", existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }

      userRow = updatedUser;
    } else {
      // Insert new user
      const insertData: Partial<UserRow> = {
        id: firebase_uid, // Use Firebase UID as primary key
        firebase_uid,
        phone: phone_number,
        ...knownColumns,
        phone_auth_used: true,
        providers: ["phone"],
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString(),
        extra: extraFields,
      };

      const { data: newUser, error: insertError } = await supabaseAdmin
        .from("users")
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }

      userRow = newUser;
    }

    return NextResponse.json({ user: userRow });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
