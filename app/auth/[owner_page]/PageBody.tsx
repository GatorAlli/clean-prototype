"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateStore } from "./actions";
import Link from "next/link";
import CleanNavbar from "@/app/components/CleanNavbar";
import ProfileAddressForm from "@/app/components/ProfileAddressForm";
import type { ProfileAddress } from "@/lib/profile-address";
import BookingList from "@/app/components/BookingList";
import type { Booking } from "@/lib/drizzle/schema";

type storeData = {
  id: number;
  ownerEmail: string;
  name: string;
  location: string;
  about: string | null;
  pricing: {
    apparelType: string;
    unitPrice: number;
  }[];
};

export default function PageBody({ address, store, isLoggedIn, bookings, customerBookings }: { address: ProfileAddress | null; store: storeData; isLoggedIn: boolean; bookings: Booking[]; customerBookings: Booking[] }) {
  const router = useRouter();

  const [name, setName] = useState(store.name);
  const [location, setLocation] = useState(store.location);
  const [about, setAbout] = useState(store.about ?? "");
  const [pricing, setPricing] = useState(store.pricing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isUnchanged =
    name === store.name &&
    location === store.location &&
    about === (store.about ?? "") &&
    pricing.length === store.pricing.length &&
    pricing.every(
      (item, i) =>
        item.apparelType === store.pricing[i].apparelType &&
        item.unitPrice === store.pricing[i].unitPrice,
    );

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {/* Light Glassy Navbar */}
      <CleanNavbar isLoggedIn={isLoggedIn} />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-2 font-bricolage">
            Store Management<span className="text-[#ff206e]"></span>
          </h1>
          <p
            className="text-gray-500 text-lg font-medium"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            Update your laundry details and service pricing.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT COLUMN: General Information */}
          <div className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <h2 className="text-2xl font-bold text-black font-bricolage border-b border-gray-100 pb-3">
              General Info
            </h2>

            <div className="space-y-2">
              <Label className="text-base font-bold font-bricolage">
                Store Name
              </Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full h-14 text-lg rounded-xl border-gray-300 focus-visible:ring-[#ff206e]"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-bold font-bricolage">
                Store Location
              </Label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full h-14 text-lg rounded-xl border-gray-300 focus-visible:ring-[#ff206e]"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-bold font-bricolage">
                About (Description)
              </Label>
              <textarea
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                className="w-full min-h-[220px] rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff206e] transition-shadow"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                placeholder="Tell customers about your services..."
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Pricing & Actions */}
          <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-8">
            {/* Pricing Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
              <h2 className="text-2xl font-bold text-black font-bricolage border-b border-gray-100 pb-3">
                Service Pricing
              </h2>

              <div className="flex flex-col gap-4">
                {pricing.map((item, id) => (
                  <div
                    key={id}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between transition-colors hover:border-gray-300"
                  >
                    <Label className="font-bricolage text-lg font-bold">
                      {item.apparelType}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-gray-500 font-medium"
                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      >
                        ৳
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={item.unitPrice}
                        onChange={(event) =>
                          setPricing((rows) =>
                            rows.map((row, index) =>
                              index === id
                                ? {
                                    ...row,
                                    unitPrice: Number(event.target.value),
                                  }
                                : row,
                            ),
                          )
                        }
                        className="w-24 h-12 text-right text-lg font-semibold rounded-lg border-gray-300 focus-visible:ring-[#ff206e]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4">
              <Button
                type="button"
                disabled={isUnchanged || saving}
                onClick={async () => {
                  setSaving(true);
                  setMessage("");

                  try {
                    const result = await updateStore({
                      id: store.id,
                      name,
                      location,
                      about,
                      pricing,
                    });
                    setMessage(result.message);
                    if (result.ok && result.store) {
                      setName(result.store.name);
                      setLocation(result.store.location);
                      setAbout(result.store.about ?? "");
                      setPricing(result.store.pricing);
                    }
                  } catch {
                    setMessage("Could not save changes. Please try again.");
                  } finally {
                    setSaving(false);
                  }
                }}
                className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${
                  isUnchanged
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#ff206e] hover:bg-[#d41b5b] text-white shadow-md"
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                onClick={() => {
                  router.refresh();
                  supabase.auth.signOut();
                  router.refresh();
                }}
                variant="outline"
                className="w-full h-14 rounded-xl font-bold text-lg border-gray-300 hover:bg-gray-100 text-black transition-all"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                Sign Out
              </Button>

              {/* Status Message */}
              {message && (
                <p
                  role="status"
                  className={`text-center text-sm font-medium mt-2 ${message.includes("Could not") ? "text-red-500" : "text-green-600"}`}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
        <ProfileAddressForm initialAddress={address} />
        <section className="mt-10 space-y-4" id="bookings">
          <h2 className="text-2xl font-bold">Customer bookings</h2>
          <BookingList bookings={bookings} showCustomer canManage />
        </section>
        {customerBookings.length > 0 && <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">My bookings</h2>
          <BookingList bookings={customerBookings} />
        </section>}
      </main>
    </div>
  );
}
