import { NextResponse } from "next/server";
import { z } from "zod";
import supabaseServer from "../../../../lib/supabaseServer";

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

// Schema for username validation
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-z0-9_\.]+$/,
      "Username can only contain lowercase letters, numbers, underscores, and dots"
    ),
});

/**
 * POST /api/auth/username-to-email
 * Resolves username to email for login purposes
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= RATE_LIMIT_MAX) {
          return NextResponse.json(
            { ok: false, error: "Too many requests" },
            { status: 429 }
          );
        }
        userLimit.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = usernameSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username } = validation.data;

    // Query Supabase for username -> email mapping
    // Use case-insensitive lookup to match the unique constraint
    const { data, error } = await supabaseServer
      .from("users")
      .select("email")
      .ilike("username", username.toLowerCase())
      .not("email", "is", null)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Username lookup error:", error);
      return NextResponse.json(
        { ok: false, error: "Database error" },
        { status: 500 }
      );
    }

    if (!data || !data.email) {
      return NextResponse.json(
        { ok: false, error: "Username not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      email: data.email,
    });
  } catch (error) {
    console.error("Username-to-email API error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}