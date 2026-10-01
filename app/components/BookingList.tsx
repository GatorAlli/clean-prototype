import type { Booking } from "@/lib/drizzle/schema";
import BookingActions from "./BookingActions";
import BookingRefresh from "./BookingRefresh";

export default function BookingList({
  bookings,
  showCustomer = false,
  canManage = false,
}: {
  bookings: Booking[];
  showCustomer?: boolean;
  canManage?: boolean;
}) {
  if (!bookings.length)
    return <p className="text-gray-500">No bookings yet.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {bookings.some((booking) => booking.status === "pending") && (
        <BookingRefresh />
      )}
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 text-black"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">Booking #{booking.id}</h3>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${booking.status === "completed" ? "bg-green-50 text-green-700" : booking.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-pink-50 text-[#ff206e]"}`}
            >
              {booking.status}
            </span>
          </div>
          <p className="mt-2 font-semibold">{booking.laundryName}</p>
          {showCustomer && (
            <p className="mt-1 break-words text-sm text-gray-600">
              {booking.customerName || "Customer"} · {booking.customerEmail}
            </p>
          )}
          <ul className="my-4 space-y-1 text-sm text-gray-600">
            {booking.items.map((item) => (
              <li key={item.apparelType} className="flex justify-between gap-3">
                <span>
                  {item.apparelType} × {item.quantity}
                </span>
                <span>
                  ৳{(item.quantity * item.unitPrice).toLocaleString("en-BD")}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-bold">
            Total: ৳{booking.totalAmount.toLocaleString("en-BD")}
          </p>
          <time
            className="mt-2 block text-xs text-gray-500"
            dateTime={new Date(booking.createdAt).toISOString()}
          >
            {new Date(booking.createdAt).toLocaleString("en-GB", {
              timeZone: "Asia/Dhaka",
            })}
          </time>
          {canManage && booking.status === "pending" && (
            <BookingActions bookingId={booking.id} />
          )}
        </article>
      ))}
    </div>
  );
}
