"use server";

import { db } from "@/lib/drizzle/db";
import { bookings, laundries, type BookingItem } from "@/lib/drizzle/schema";
import { generateServerClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type BookingInput = {
  laundryId: number;
  quantities: Record<string, number>;
  requestId: string;
};

export async function createBooking(input: BookingInput) {
  try {
    const supabase = await generateServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.email) {
      return {
        ok: false as const,
        message: "Please sign in before booking.",
        signInRequired: true,
      };
    }
    if (
      !input ||
      !Number.isSafeInteger(input.laundryId) ||
      input.laundryId <= 0 ||
      typeof input.requestId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        input.requestId,
      ) ||
      !input.quantities ||
      typeof input.quantities !== "object" ||
      Array.isArray(input.quantities)
    ) {
      return { ok: false as const, message: "Invalid booking details." };
    }
    const findExisting = async () => {
      const [booking] = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.requestId, input.requestId),
            eq(bookings.customerId, user.id),
            eq(bookings.laundryId, input.laundryId),
          ),
        )
        .limit(1);
      return booking;
    };
    let booking = await findExisting();
    if (!booking) {
      const [store] = await db
        .select()
        .from(laundries)
        .where(eq(laundries.id, input.laundryId))
        .limit(1);
      if (!store) return { ok: false as const, message: "Laundry not found." };
      const entries = Object.entries(input.quantities);
      if (
        entries.length > 50 ||
        entries.some(
          ([apparelType, quantity]) =>
            !Number.isSafeInteger(quantity) ||
            quantity < 0 ||
            quantity > 1000 ||
            store.pricing.filter((p) => p.apparelType === apparelType)
              .length !== 1,
        )
      ) {
        return {
          ok: false as const,
          message: "Check your selected items and quantities.",
        };
      }
      const items: BookingItem[] = entries
        .filter(([, quantity]) => quantity > 0)
        .map(([apparelType, quantity]) => ({
          apparelType,
          quantity,
          unitPrice: store.pricing.find((p) => p.apparelType === apparelType)!
            .unitPrice,
        }));
      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      if (
        !items.length ||
        items.some(
          (item) => !Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0,
        ) ||
        !Number.isSafeInteger(totalAmount) ||
        totalAmount > 2147483647
      ) {
        return {
          ok: false as const,
          message: "Select items with valid whole Taka prices.",
        };
      }
      const [inserted] = await db
        .insert(bookings)
        .values({
          laundryId: store.id,
          laundryName: store.name,
          customerId: user.id,
          customerName: String(user.user_metadata.full_name ?? ""),
          customerEmail: user.email,
          items,
          totalAmount,
          requestId: input.requestId,
        })
        .onConflictDoNothing({ target: bookings.requestId })
        .returning({ id: bookings.id });
      booking = inserted ?? (await findExisting());
    }
    if (!booking)
      return { ok: false as const, message: "Please start a new booking." };
    revalidatePath("/auth");
    revalidatePath("/orders");
    revalidatePath(`/auth/${input.laundryId}`);
    return { ok: true as const, bookingId: booking.id };
  } catch (error) {
    console.error("Booking creation failed:", error);
    return {
      ok: false as const,
      message: "Could not save your booking. Please retry.",
    };
  }
}
