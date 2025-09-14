import { NextResponse } from "next/server";
import { z } from "zod";
import supabaseServer from "../../../../lib/supabaseServer";
import { usernameSchema } from "../../../../lib/auth/validation";

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

const checkUsernameBodySchema = z.object({
  username: usernameSchema,
});

/**
 * POST /api/auth/check-username
 * Check if username is available
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
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

    const validation = checkUsernameBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          error: validation.error.issues[0]?.message || "Invalid username",
        },
        { status: 400 }
      );
    }

    const { username } = validation.data;

    // Check if username exists (case-insensitive)
    const { data, error } = await supabaseServer
      .from("users")
      .select("id")
      .ilike("username", username.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Username check error:", error);
      return NextResponse.json(
        { ok: false, available: false, error: "Database error" },
        { status: 500 }
      );
    }

    const available = !data;

    return NextResponse.json({
      ok: true,
      available,
      username: username.toLowerCase(),
    });
  } catch (error) {
    console.error("Check username API error:", error);
    return NextResponse.json(
      { ok: false, available: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
