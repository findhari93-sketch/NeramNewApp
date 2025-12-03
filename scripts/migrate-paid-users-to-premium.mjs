/**
 * Migration Script: Upgrade Existing Paid Users to Premium
 *
 * This script finds all users in users_duplicate with payment_status="paid"
 * and updates their account.account_type to "premium"
 *
 * Usage: node scripts/migrate-paid-users-to-premium.mjs
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

console.log("🔄 Migrating Existing Paid Users to Premium Status\n");
console.log("=".repeat(60));

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePaidUsers() {
  try {
    // Step 1: Fetch all users
    console.log("\n📊 Step 1: Fetching all users from users_duplicate...");
    const { data: users, error: fetchError } = await supabase
      .from("users_duplicate")
      .select(
        "id, account, application_details, basic, contact, final_fee_payment"
      );

    if (fetchError) {
      console.error("❌ Error fetching users:", fetchError);
      return;
    }

    if (!users || users.length === 0) {
      console.log("⚠️  No users found");
      return;
    }

    console.log(`✅ Found ${users.length} total users`);

    // Step 2: Find users with payment_status="paid"
    console.log("\n📊 Step 2: Identifying paid users...");
    const paidUsers = [];

    for (const user of users) {
      const appDetails = user.application_details || {};
      const finalFee = appDetails.final_fee_payment || {};
      // Also check top-level final_fee_payment (legacy structure)
      const rootFinalFee = user.final_fee_payment || {};
      const paymentStatus =
        finalFee.payment_status || rootFinalFee.payment_status;
      const currentAccountType = user.account?.account_type;

      if (paymentStatus === "paid") {
        paidUsers.push({
          id: user.id,
          name: user.basic?.student_name || user.basic?.name || "Unknown",
          email: user.contact?.email || "No email",
          currentAccountType: currentAccountType || "none",
          paymentAmount: finalFee.amount || 0,
          paymentId: finalFee.razorpay_payment_id || "N/A",
          needsUpdate: currentAccountType !== "premium",
        });
      }
    }

    console.log(`✅ Found ${paidUsers.length} paid users`);

    if (paidUsers.length === 0) {
      console.log("\n✨ No paid users found. Nothing to migrate.");
      return;
    }

    // Step 3: Show users that need update
    const needsUpdate = paidUsers.filter((u) => u.needsUpdate);
    console.log(
      `\n📋 Users needing account_type update: ${needsUpdate.length}`
    );

    if (needsUpdate.length === 0) {
      console.log("\n✨ All paid users already have premium status!");
      return;
    }

    console.log("\n" + "=".repeat(60));
    console.log("Users to be updated:\n");
    needsUpdate.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Current: ${user.currentAccountType} → Will be: premium`);
      console.log(`   Payment: ₹${user.paymentAmount} (${user.paymentId})`);
      console.log("");
    });

    // Step 4: Update users
    console.log("=".repeat(60));
    console.log("\n🔧 Step 3: Updating users to premium status...\n");

    let successCount = 0;
    let failCount = 0;

    for (const user of needsUpdate) {
      try {
        const currentAccount =
          users.find((u) => u.id === user.id)?.account || {};
        const updatedAccount = {
          ...currentAccount,
          account_type: "premium",
        };

        const { error: updateError } = await supabase
          .from("users_duplicate")
          .update({
            account: updatedAccount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error(
            `❌ Failed to update ${user.name}:`,
            updateError.message
          );
          failCount++;
        } else {
          console.log(`✅ Updated ${user.name} (${user.email}) to premium`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating ${user.name}:`, err.message);
        failCount++;
      }
    }

    // Step 5: Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total paid users found:       ${paidUsers.length}`);
    console.log(
      `Already premium:              ${paidUsers.length - needsUpdate.length}`
    );
    console.log(`Successfully updated:         ${successCount}`);
    console.log(`Failed to update:             ${failCount}`);
    console.log("=".repeat(60));

    if (successCount > 0) {
      console.log("\n✨ Migration completed successfully!");
      console.log("\n💡 Next steps:");
      console.log(
        "   1. Paid users can now see Premium Dashboard in their profile menu"
      );
      console.log('   2. Their account type shows "Premium" with green badge');
      console.log('   3. "Join Class" button changed to "Add Course"');
      console.log("   4. Premium Dashboard button appears on profile page");
    }

    if (failCount > 0) {
      console.log("\n⚠️  Some updates failed. Check the errors above.");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migratePaidUsers().catch(console.error);
