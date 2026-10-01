"use client";

import { Pricing } from "@/app/auth/AdminPage";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createBooking } from "./actions";

export default function PageBody({
  laundryId,
  name,
  location,
  prices,
  about,
  images,
}: {
  laundryId: number;
  name: string;
  location: string;
  prices: Pricing[];
  about: string;
  images: string[];
}) {
  const router = useRouter(); // This enables the working Back button

  // State to hold the quantities of each apparel type
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [bookingPending, setBookingPending] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [signInRequired, setSignInRequired] = useState(false);
  const submission = useRef<{ selection: string; requestId: string } | null>(null);
  const submitting = useRef(false);

  async function handleContinue() {
    if (submitting.current || totalPieces === 0) return;
    submitting.current = true;
    setBookingPending(true);
    setBookingMessage("");
    setSignInRequired(false);
    const selection = JSON.stringify(Object.entries(quantities).filter(([, qty]) => qty > 0).sort());
    if (submission.current?.selection !== selection) {
      submission.current = { selection, requestId: crypto.randomUUID() };
    }
    try {
      const result = await createBooking({ laundryId, quantities, requestId: submission.current.requestId });
      if (!result.ok) {
        setBookingMessage(result.message);
        setSignInRequired("signInRequired" in result && result.signInRequired === true);
        return;
      }
      setBookingMessage(`Booking #${result.bookingId} created.`);
      router.push(`/auth?booking=${result.bookingId}`);
      router.refresh();
    } catch {
      setBookingMessage("Could not complete the booking. Please retry.");
    } finally {
      submitting.current = false;
      setBookingPending(false);
    }
  }

  // Counter logic
  const increment = (apparel: string) => {
    setQuantities((prev) => ({
      ...prev,
      [apparel]: (prev[apparel] || 0) + 1,
    }));
  };

  const decrement = (apparel: string) => {
    setQuantities((prev) => {
      const current = prev[apparel] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [apparel]: current - 1,
      };
    });
  };

  // Dynamic calculations for the "Your selection" box
  const totalPieces = Object.values(quantities).reduce((acc, curr) => acc + curr, 0);
  
  const totalPrice = prices ? prices.reduce((acc, item) => {
    const qty = quantities[item.apparelType] || 0;
    const numericPrice = parseFloat(item.unitPrice.toString().replace(/,/g, "")) || 0;
    return acc + (qty * numericPrice);
  }, 0) : 0;

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      
      {/* 1. TOP NAVBAR (Glassy, with Links and Back Button) */}
      <header className="sticky top-0 z-50 w-full px-6 md:px-12 py-5 flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <Link
          href="/"
          className="text-2xl text-black font-bold hover:text-[#ff206e] transition-all duration-500 font-bricolage tracking-tight"
        >
          clean
        </Link>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 text-black px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-50 transition hidden sm:block font-sans"
          >
            ← Back
          </button>
          <Link 
            href="/orders"
            className="text-black font-bold text-sm hover:text-[#ff206e] transition-colors font-sans"
          >
            Current Orders
          </Link>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: Left Content & Right Sticky Sidebar */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-10 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* LEFT COLUMN: Info, Services, Gallery */}
        <div className="flex-1 w-full">
          
          {/* Header Section (No dots or emojis) */}
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-black font-bricolage">
              {name}
            </h1>
          </div>

          {/* Location Section */}
          {location && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-black mb-3 font-bricolage">Location</h2>
              <p className="text-gray-600 leading-relaxed text-base" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {location}
              </p>
            </div>
          )}

          {/* About Section (Outer box removed) */}
          {about && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-black mb-3 font-bricolage">About</h2>
              <p className="text-gray-600 leading-relaxed text-base" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {about}
              </p>
            </div>
          )}

          {/* Services & Pricing with Counters */}
          <div className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-black font-bricolage">Services & Pricing</h2>
            </div>
            
            {prices && prices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prices.map((e, id) => {
                  const qty = quantities[e.apparelType] || 0;
                  const isSelected = qty > 0;

                  return (
                    <div 
                      key={id} 
                      className={`bg-white border p-5 rounded-xl transition-colors flex justify-between items-center ${
                        isSelected ? 'border-[#ff206e] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <h3 className="text-black font-bold text-lg font-bricolage">{e.apparelType}</h3>
                        <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                          <span className="font-semibold text-black" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>৳{e.unitPrice}</span> per piece
                        </p>
                      </div>
                      
                      {/* Counter Control */}
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full p-1">
                        <button
                          onClick={() => decrement(e.apparelType)}
                          disabled={!isSelected || bookingPending}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                            isSelected 
                              ? 'bg-[#111111] hover:bg-black ring-2 ring-[#ff206e]' 
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          -
                        </button>
                        
                        <span className="font-bold text-black w-5 text-center text-lg" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {qty}
                        </span>
                        
                        <button
                          disabled={bookingPending}
                          onClick={() => increment(e.apparelType)}
                          className="w-8 h-8 rounded-full bg-[#111111] hover:bg-black text-white flex items-center justify-center transition-all duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No pricing information available.</p>
            )}
          </div>

          {/* Gallery */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-black mb-5 font-bricolage">Gallery</h2>
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {images.map((imageUrl, index) => (
                  <div key={imageUrl} className="relative h-[300px] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={imageUrl}
                      fill
                      alt={`${name} photo ${index + 1}`}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>No photos have been added for this store yet.</p>
            )}
          </div>

        </div>

        {/* 3. RIGHT COLUMN: Sticky "Your selection" Box */}
        <div className="w-full lg:w-[380px] lg:sticky lg:top-28 shrink-0 mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-2xl font-bold text-black font-bricolage mb-6">Your selection</h2>

            {/* Store Info */}
            <div className="space-y-4 border-b border-gray-100 pb-5 mb-5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-500 text-sm">Laundry</span>
                <span className="text-black font-medium text-sm text-right">{name}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-500 text-sm">Location</span>
                <span className="text-black font-medium text-sm text-right">{location}</span>
              </div>
            </div>

            {/* Dynamic Itemized List */}
            {totalPieces > 0 && prices && (
              <div className="space-y-3 border-b border-gray-100 pb-5 mb-5" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                {prices.map((item) => {
                  const qty = quantities[item.apparelType] || 0;
                  if (qty === 0) return null;
                  return (
                    <div key={item.apparelType} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{item.apparelType}</span>
                      <span className="text-black font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {qty} × ৳{item.unitPrice}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Section */}
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 text-sm" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <span className="font-semibold text-black text-base" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{totalPieces}</span> pieces
              </span>
              <span className="text-4xl font-extrabold tracking-tight text-black font-bricolage flex items-center gap-1">
                <span className="text-2xl text-black">৳</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{totalPrice.toLocaleString()}</span>
              </span>
            </div>

            {/* Continue Button */}
            <button 
              type="button"
              onClick={handleContinue}
              disabled={totalPieces === 0 || bookingPending}
              className={`w-full py-4 rounded-xl font-bold text-center transition-colors text-lg ${
                totalPieces > 0 
                  ? 'bg-[#ff206e] text-white hover:bg-[#d41b5b] shadow-md' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              {bookingPending ? "Booking…" : "Continue"}
            </button>
            <p role="status" className="mt-3 text-sm">{bookingMessage}</p>
            {signInRequired && <Link href="/auth" className="text-sm font-semibold text-[#ff206e] underline">Sign in to book</Link>}
          </div>
        </div>

      </main>
    </div>
  );
}