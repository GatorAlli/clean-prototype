import { generateServerClient } from "@/lib/supabase/server";
import { AuthPageBody, ProfilePageBody } from "./PageBody";
import { AdminPage } from "./AdminPage";
import { db } from "@/lib/drizzle/db";
import { laundries, bookings } from "@/lib/drizzle/schema";
import { createClient } from "@supabase/supabase-js";
import { desc, eq } from "drizzle-orm";
import { getProfileAddress } from "@/lib/profile-address";
import { redirect } from "next/navigation";

export default async function Page() {
  // Supabase
  const supabase = await generateServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Site Admin Email Address
  const isAdmin = user?.email === "www.joybangl@gmail.com";

  async function saveAuthPhone(phone: string) {
    "use server";

    const sessionClient = await generateServerClient();
    const {
      data: { user: signedInUser },
      error: authError,
    } = await sessionClient.auth.getUser();

    if (authError || !signedInUser) {
      return { error: "Could not verify the signed-in user." };
    }

    const digits = phone.replace(/\D/g, "");
    const normalizedPhone = /^01[3-9]\d{8}$/.test(digits)
      ? `+880${digits.slice(1)}`
      : /^8801[3-9]\d{8}$/.test(digits)
        ? `+${digits}`
        : phone.startsWith("+") && /^\+[1-9]\d{7,14}$/.test(phone)
          ? phone
          : null;

    if (!normalizedPhone) {
      return { error: "Enter a valid phone number, such as 01712345678." };
    }

    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!secretKey) {
      return {
        error: "SUPABASE_SECRET_KEY is missing from the server environment.",
      };
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secretKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await adminClient.auth.admin.updateUserById(
      signedInUser.id,
      { phone: normalizedPhone },
    );

    return { error: error?.message ?? null };
  }

  if (user?.email) {
    // Store Fetching
    const [ownedStore] = await db
      .select()
      .from(laundries)
      .where(eq(laundries.ownerEmail, user.email.toLowerCase()));
    if (ownedStore) {
      redirect(`/auth/${ownedStore.id}`);
    }
  }

  const customerBookings = user ? await db.select().from(bookings)
    .where(eq(bookings.customerId, user.id)).orderBy(desc(bookings.createdAt)) : [];

  return (
    <div>
      {isAdmin ? (
        <AdminPage />
      ) : user ? (
        <ProfilePageBody address={getProfileAddress(user.user_metadata)} bookings={customerBookings} displayName={user.user_metadata.full_name} isLoggedIn={Boolean(user)} />
      ) : (
        <AuthPageBody onSaveAuthPhone={saveAuthPhone} isLoggedIn={Boolean(user)} />
      )}
    </div>
  );
}
