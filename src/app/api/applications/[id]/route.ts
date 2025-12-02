// app/(main)/applications/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { mapFromUsersDuplicate } from "../../../../lib/userFieldMapping";

type PatchBody =
  | {
      status?: string;
      adminRemarks?: string;
      approvedBy?: string;
      approvedAt?: string;
    }
  | {
      payment_status?: string;
      payment_provider?: string;
      payment_link?: string;
      payment_record?: Record<string, any>;
    }
  | {
      application_details?: Record<string, any>;
      final_fee_payment?: Record<string, any>;
      // any other fields you want to allow owners/admins to update
    }
  | Partial<Record<string, any>>;

function isAdminFromUser(user: any) {
  if (!user) return false;
  // 1) prefer an explicit role in user_metadata
  if (user.user_metadata?.role === "admin") return true;
  // 2) fallback to checking email in ADMIN_EMAILS env var
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (user.email && ADMIN_EMAILS.includes(user.email)) return true;
  return false;
}

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing id param" }, { status: 400 });

  // note: pass the `cookies` function (from next/headers) directly to the
  // auth helpers so they can read the request cookies in this runtime.
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from("users_duplicate")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("GET users_duplicate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data)
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );

  // normalize response to the shape used by the applications list page:
  // { id, data: <flattened/mapped>, status, payment_status, ... }
  try {
    const mapped = mapFromUsersDuplicate(data as any);
    const response = {
      id: data.id,
      data: mapped,
      status:
        (data.application_details || {}).application_admin_approval || null,
      payment_status: (data.final_fee_payment || {}).payment_status || null,
      submitted_at: data.updated_at || data.created_at_tz || null,
    };

    return NextResponse.json(response);
  } catch (err) {
    // fallback: return raw row if mapping fails
    console.error("Mapping users_duplicate row failed:", err);
    return NextResponse.json(data);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing id param" }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // get current user session
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error("Auth error:", sessionError);
    // still allow patching only if you want anonymous updates — here we require auth
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isUserAdmin = isAdminFromUser(user);

  const body = (await req.json().catch(() => ({}))) as PatchBody;

  try {
    // fetch existing row
    const { data: existing, error: fetchErr } = await supabase
      .from("users_duplicate")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch existing error:", fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!existing)
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );

    // determine owner: check account.firebase_uid (if present) vs supabase user id
    // the account JSON may be null or an object
    const account = existing.account ?? {};
    const ownerFirebaseUid =
      account?.firebase_uid ?? account?.firebaseUid ?? null;
    const isOwner = !!ownerFirebaseUid && ownerFirebaseUid === user.id;

    // if not admin and not owner -> forbidden
    if (!isUserAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Restrict non-admins from changing admin-only fields
    if (!isUserAdmin) {
      if (
        "status" in body ||
        "adminRemarks" in body ||
        "approvedBy" in body ||
        "approvedAt" in body
      ) {
        return NextResponse.json(
          { error: "Only admins can change status or admin remarks" },
          { status: 403 }
        );
      }
    }

    // prepare updated payload by merging JSONB pieces
    const updates: Record<string, any> = {};
    const now = new Date().toISOString();

    // handle status and admin remarks (admin only)
    if (isUserAdmin && typeof (body as any).status !== "undefined") {
      const status = (body as any).status;
      // your original schema used application_details.application_admin_approval etc.
      // we'll merge application_details and set admin-related fields there
      const existingAppDetails = existing.application_details ?? {};
      const mergedAppDetails = {
        ...existingAppDetails,
        application_admin_approval: status,
      };

      // set approved_by/approved_at when status is approved or rejected
      if (status === "approved" || status === "rejected") {
        mergedAppDetails.approved_by = (body as any).approvedBy ?? user.id;
        mergedAppDetails.approved_at = (body as any).approvedAt ?? now;
        mergedAppDetails.email_status =
          mergedAppDetails.email_status ?? "Pending";
      }

      if ("adminRemarks" in body) {
        mergedAppDetails.admin_remarks = (body as any).adminRemarks;
      }

      updates.application_details = mergedAppDetails;
    }

    // handle direct application_details partial merge from client (admin or owner)
    if ((body as any).application_details) {
      const existingAppDetails = existing.application_details ?? {};
      updates.application_details = {
        ...(updates.application_details ?? existingAppDetails),
        ...(body as any).application_details,
      };
    }

    // handle final_fee_payment partial merge
    if ((body as any).final_fee_payment) {
      const existingFinal = existing.final_fee_payment ?? {};
      updates.final_fee_payment = {
        ...existingFinal,
        ...(body as any).final_fee_payment,
      };
    }

    // payment-specific fields (could be admin/webhook)
    if ((body as any).payment_status) {
      const existingFinal = existing.final_fee_payment ?? {};
      updates.final_fee_payment = {
        ...existingFinal,
        payment_status: (body as any).payment_status,
        ...(updates.final_fee_payment ?? {}),
      };
    }
    if ((body as any).payment_provider) {
      const existingFinal = existing.final_fee_payment ?? {};
      updates.final_fee_payment = {
        ...existingFinal,
        payment_provider: (body as any).payment_provider,
        ...(updates.final_fee_payment ?? {}),
      };
    }
    if ((body as any).payment_link) {
      const existingFinal = existing.final_fee_payment ?? {};
      updates.final_fee_payment = {
        ...existingFinal,
        payment_link: (body as any).payment_link,
        ...(updates.final_fee_payment ?? {}),
      };
    }

    // append payment_record into final_fee_payment.payment_history (if provided)
    if ((body as any).payment_record) {
      const existingFinal = existing.final_fee_payment ?? {};
      const existingHistory = Array.isArray(existingFinal.payment_history)
        ? existingFinal.payment_history
        : existingFinal.payment_history
        ? [existingFinal.payment_history]
        : [];
      const newHistory = [...existingHistory, (body as any).payment_record];
      updates.final_fee_payment = {
        ...existingFinal,
        payment_history: newHistory,
        ...(updates.final_fee_payment ?? {}),
      };
    }

    // allow updating top-level JSON fields (e.g., basic, contact) by owner/admin if included
    const allowedTopLevelUpdatesForOwner = [
      "basic",
      "contact",
      "about_user",
      "education",
      "admin_filled",
    ];
    for (const key of allowedTopLevelUpdatesForOwner) {
      if ((body as any)[key]) {
        const existingVal = existing[key] ?? {};
        updates[key] = { ...existingVal, ...(body as any)[key] };
      }
    }

    // if nothing to update, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update or unauthorized fields" },
        { status: 400 }
      );
    }

    // always bump updated_at
    updates.updated_at = now;

    const { data: updated, error: updateErr } = await supabase
      .from("users_duplicate")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error("Update error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Optionally: send notification/email here (call an email function or edge function)

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /users_duplicate/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing id param" }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error("Auth error:", sessionError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isUserAdmin = isAdminFromUser(user);
  if (!isUserAdmin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { error: delErr } = await supabase
      .from("users_duplicate")
      .delete()
      .eq("id", id);
    if (delErr) {
      console.error("Delete error:", delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /users_duplicate/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
