import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase environment variables:", {
    hasUrl: !!url,
    hasKey: !!key,
    keyPrefix: key ? key.substring(0, 20) + "..." : "missing",
  });
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment"
  );
}

console.log("Initializing Supabase server client:", {
  url,
  keyPrefix: key.substring(0, 20) + "...",
});

export const supabaseServer = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseServer;
