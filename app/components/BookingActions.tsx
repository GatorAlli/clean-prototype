"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/app/auth/[owner_page]/actions";

export default function BookingActions({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [pending, setPending] = useState<"completed" | "cancelled" | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [processed, setProcessed] = useState(false);

  async function update(status: "completed" | "cancelled") {
    if (submitting.current) return;
    submitting.current = true;
    setPending(status);
    setMessage("");
    try {
      const result = await updateBookingStatus(bookingId, status);
      setMessage(result.message);
      if (result.ok) setProcessed(true);
      router.refresh();
    } catch {
      setMessage("Could not update the order. Please retry.");
    } finally {
      submitting.current = false;
      setPending(null);
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {!processed && (
        <div className="flex gap-3">
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => update("completed")}
            className="rounded-lg bg-[#ff206e] px-4 py-2 text-sm font-bold text-white hover:bg-[#d41b5b] disabled:opacity-50"
          >
            {pending === "completed" ? "Processing..." : "Complete"}
          </button>
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => update("cancelled")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
          >
            {pending === "cancelled" ? "Cancelling…" : "Cancel"}
          </button>
        </div>
      )}
      <p role="status" className="mt-2 text-sm text-gray-600">
        {message}
      </p>
    </div>
  );
}
