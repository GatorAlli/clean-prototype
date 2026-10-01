import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BookingList from "./BookingList";
import type { Booking } from "@/lib/drizzle/schema";

const booking: Booking = {
  id: 1, laundryId: 1, laundryName: "Laundry", customerId: "00000000-0000-4000-8000-000000000001",
  customerName: "Customer", customerEmail: "customer@example.com", customerAddress: "House 10, Road 2", customerLocality: "Banani",
  items: [], totalAmount: 0, status: "completed", requestId: "00000000-0000-4000-8000-000000000002", createdAt: new Date("2026-10-01T00:00:00Z"),
};

test("owner bookings display the address while ordinary booking cards omit contact details", () => {
  const ownerHtml = renderToStaticMarkup(<BookingList bookings={[booking]} showCustomer />);
  assert.match(ownerHtml, /House 10, Road 2, Banani/);
  const customerHtml = renderToStaticMarkup(<BookingList bookings={[booking]} />);
  assert.doesNotMatch(customerHtml, /House 10|Banani|customer@example.com/);
});

test("older bookings without an address remain readable", () => {
  const html = renderToStaticMarkup(<BookingList bookings={[{ ...booking, customerAddress: null, customerLocality: null }]} showCustomer />);
  assert.match(html, /Not provided/);
});
