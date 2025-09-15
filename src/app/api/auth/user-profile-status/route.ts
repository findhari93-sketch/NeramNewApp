import { NextResponse } from "next/server";

export async function GET() {
  // Minimal module - real implementation may exist elsewhere. Return 204 to
  // indicate no content but valid module.
  return new NextResponse(null, { status: 204 });
}
