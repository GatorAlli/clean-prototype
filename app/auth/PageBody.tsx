"use client";

import { supabase } from "@/lib/supabase/browser";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CleanNavbar from "../components/CleanNavbar";
import BookingList from "../components/BookingList";
import ProfileAddressForm from "@/app/components/ProfileAddressForm";
import { validateProfileAddress, type ProfileAddress } from "@/lib/profile-address";
import type { Booking } from "@/lib/drizzle/schema";

const styles = {
  tabs: "flex gap-8 border-b border-gray-200 mb-8",
  activeTab:
    "text-lg font-bold text-black border-b-2 border-[#ff206e] pb-3 -mb-[1px]",
  inactiveTab:
    " text-lg font-bold text-gray-500 pb-3 hover:text-[#ff206e] transition",
  fieldLabel: "block text-xs font-bold text-gray-700 mb-2",
  requiredMark: "text-[#ff206e]",
  fieldInput:
    "bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-black focus-visible:ring-1 focus-visible:ring-[#ff206e]",
  fieldInputPlaceholder: "placeholder:text-gray-400",
  formGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  continueButton:
    "bg-[#ff206e] hover:bg-[#d41b5b] text-white font-bold px-8 py-3 rounded-xl transition shadow-md active:scale-95 w-fit",
} as const;

export function AuthPageBody({
  onSaveAuthPhone,
  isLoggedIn,
}: {
  onSaveAuthPhone: (phone: string) => Promise<{ error: string | null }>;
  isLoggedIn: boolean;
}) {
  const [isLogin, changeIsLogin] = useState(false);
  const [email, changeEmail] = useState("");
  const [phone, changePhone] = useState("");
  const [address, changeAddress] = useState("");
  const [locality, changeLocality] = useState("");
  const [password, changePassword] = useState("");
  const [status, changeStatus] = useState("");
  const [handle, changeHandle] = useState("");
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const profileAddress = validateProfileAddress(address, locality);
    if (!profileAddress) {
      changeStatus("Enter your address (up to 500 characters) and locality (up to 100 characters).");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: handle,
          auth_phone: phone,
          street_address: profileAddress.address,
          locality: profileAddress.locality,
        },
      },
    });
    if (error) {
      changeStatus(error.message);
    } else if (!data.user) {
      changeStatus("Signup succeeded, but Supabase did not return a user.");
    } else {
      const phoneResult = await onSaveAuthPhone(phone);
      changeStatus(phoneResult.error ?? "Signed up and phone number saved.");
    }
    console.log("Hello");
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      changeStatus(error.message);
    } else {
      changeStatus("Logged In Successfully");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      {/* Top Navbar */}
      <CleanNavbar isLoggedIn={isLoggedIn} />

      {/* Page Content Wrapper */}
      <main className="w-full max-w-4xl mx-auto px-6 py-10 grow ">
        {/* Title Section */}

        {isLogin ? (
          <div>
            {/* Sign up and in */}
            <div className={styles.tabs}>
              <button
                type="button"
                onClick={() => changeIsLogin(false)}
                className={styles.inactiveTab}
              >
                Sign up
              </button>
              <button type="button" className={styles.activeTab}>
                Sign in
              </button>
            </div>
            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn(e);
              }}
            >
              <div className={`${styles.formGrid} mb-8 mt-6`}>
                <div>
                  <Label className={styles.fieldLabel}>
                    Email Address <span className={styles.requiredMark}>*</span>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => changeEmail(e.target.value)}
                    className={`${styles.fieldInput} ${styles.fieldInputPlaceholder}`}
                    required
                  />
                </div>

                <div>
                  <Label className={styles.fieldLabel}>
                    Password <span className={styles.requiredMark}>*</span>
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => changePassword(e.target.value)}
                    className={styles.fieldInput}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className={`${styles.continueButton} text-sm`}
                >
                  Continue
                </Button>
              </div>
            </form>
            <Label className="text-sm font-medium text-black">{status}</Label>
          </div>
        ) : (
          <div>
            {/* sign up and in */}
            <div className={styles.tabs}>
              <button type="button" className={styles.activeTab}>
                Sign up
              </button>
              <button
                type="button"
                onClick={() => changeIsLogin(true)}
                className={styles.inactiveTab}
              >
                Sign in
              </button>
            </div>
            <form onSubmit={handleSignUp}>
              {/* Form */}

              {/* Username */}
              <div className={`${styles.formGrid} mb-6`}>
                <div>
                  <Label className={styles.fieldLabel}>
                    Username <span className={styles.requiredMark}>*</span>
                  </Label>
                  <Input
                    value={handle}
                    onChange={(e) => changeHandle(e.target.value)}
                    className={`${styles.fieldInput} ${styles.fieldInputPlaceholder}`}
                    required
                  />
                </div>
              </div>
              {/* Email and contact number */}
              <div>
                <Label className={styles.fieldLabel}>
                  Email <span className={styles.requiredMark}>*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => changeEmail(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>

              <div className="md:col-start-1">
                <Label className={styles.fieldLabel}>
                  Contact Number <span className={styles.requiredMark}>*</span>
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => changePhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={`${styles.fieldInput} ${styles.fieldInputPlaceholder}`}
                  required
                />
              </div>
              <div className="flex justify-between">
                <div className="md:col-start-1">
                  <Label className={styles.fieldLabel}>
                    Address <span className={styles.requiredMark}>*</span>
                  </Label>
                  <textarea
                    maxLength={500}
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => changeAddress(e.target.value)}
                    placeholder="Your address"
                    className={`${styles.fieldInput} ${styles.fieldInputPlaceholder}`}
                    required
                  />
                </div>
                <div className="md:col-start-1">
                  <Label className={styles.fieldLabel}>
                    Locality <span className={styles.requiredMark}>*</span>
                  </Label>
                  <Input
                    maxLength={100}
                    autoComplete="address-level3"
                    value={locality}
                    onChange={(e) => changeLocality(e.target.value)}
                    placeholder="e.g. Motijheel"
                    className={`${styles.fieldInput} ${styles.fieldInputPlaceholder}`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`${styles.formGrid} mb-8 mt-6`}>
                <div>
                  <Label className={styles.fieldLabel}>
                    Password <span className={styles.requiredMark}>*</span>
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => changePassword(e.target.value)}
                    className={styles.fieldInput}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`${styles.continueButton} text-md`}
              >
                Continue
              </Button>
              <Label className="text-sm font-medium text-black">{status}</Label>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export function ProfilePageBody({
  address,
  bookings,
  displayName,
  isLoggedIn,
}: {
  address: ProfileAddress | null;
  bookings: Booking[];
  displayName: string | undefined;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  return (
    <div className="bg-white text-black font-sans">
      <CleanNavbar isLoggedIn={isLoggedIn} />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <Label className="text-4xl font-extrabold tracking-tight text-black font-bricolage">
          Profile
        </Label>
        <Label className="text-gray-500 text-sm font-medium">
          Welcome<b className="text-[#ff206e]">{displayName}</b>
        </Label>
        <Button
          onClick={() => {
            router.refresh();
            supabase.auth.signOut();
            router.refresh();
          }}
          className="bg-[#ff206e] hover:bg-[#d41b5b] text-white font-bold rounded-xl transition shadow-md active:scale-95"
        >
          Sign Out
        </Button>
        <ProfileAddressForm initialAddress={address} />
        <section className="space-y-4" id="bookings">
          <h2 className="text-2xl font-bold">My bookings</h2>
          <BookingList bookings={bookings} />
        </section>
      </main>
    </div>
  );
}
