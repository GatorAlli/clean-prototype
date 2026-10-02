"use client";

import { submitData } from "./adminLogic";
import { supabase } from "@/lib/supabase/browser";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export type Pricing = { apparelType: string; unitPrice: number };
type PricingDraft = { apparelType: string; unitPrice: string };

export function AdminPage() {
  const router = useRouter();
  const inputStyling =
    "w-full min-w-0 h-12 rounded-xl border border-gray-300 bg-white px-4 text-base text-black placeholder:text-gray-400 focus-visible:border-[#ff206e] focus-visible:ring-2 focus-visible:ring-[#ff206e]/20";
  const [laundryName, setLaundryName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [pricing, setPricing] = useState<PricingDraft[]>([
    { apparelType: "", unitPrice: "" },
  ]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(
      "Selected images:",
      images.map((file) => file?.name),
    );

    const imagePaths: string[] = [];

    for (const file of images) {
      if (!file) {
        continue;
      }

      const path = `laundries/${crypto.randomUUID()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("laundry-images")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
      if (error) {
        console.error("Upload failed:", error);
        return;
      }

      console.log("Uploaded to:", data.path);
      imagePaths.push(data.path);
    }

    await submitData({
      storeName: laundryName,
      ownerEmail,
      location,
      about,
      prices: pricing.map(({ apparelType, unitPrice }) => ({
        apparelType,
        unitPrice: Number(unitPrice),
      })),
      images: imagePaths,
    });
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10 pb-24 text-black font-sans md:px-12 md:py-12">
      <Label className="mx-auto mb-10 block w-full max-w-4xl font-bricolage text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
        {" "}
        Site Admin Page{" "}
      </Label>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-4xl grid-cols-1 items-start gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:grid-cols-2 md:gap-8 md:p-8"
      >
        {/* Add a Turf Form */}
        <Label className="col-span-full block border-b border-gray-100 pb-4 font-bricolage text-2xl font-bold">
          Add a Laundry
        </Label>

        <div className="min-w-0 space-y-2">
          <Label className="block font-bricolage text-base font-bold">
            Laundry Name
          </Label>
          <Input
            className={inputStyling}
            value={laundryName}
            onChange={(event) => setLaundryName(event.target.value)}
          />
        </div>
        <div className="min-w-0 space-y-2">
          <Label className="block font-bricolage text-base font-bold">
            Owner&apos;s Email
          </Label>
          <Input
            className={inputStyling}
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
          />
        </div>
        <div className="col-span-full min-w-0 space-y-2">
          <Label className="block font-bricolage text-base font-bold">
            Location (Area)
          </Label>
          <Input
            className={inputStyling}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
        <div className="col-span-full min-w-0 space-y-2">
          <Label className="block font-bricolage text-base font-bold">
            About
          </Label>
          <textarea
            className="min-h-[180px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-black shadow-sm transition-shadow focus:border-[#ff206e] focus:outline-none focus:ring-2 focus:ring-[#ff206e]/20"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
          />
        </div>
        <div className="min-w-0 space-y-4 rounded-2xl border border-gray-200 p-4 md:p-5">
          <Label className="block border-b border-gray-100 pb-3 font-bricolage text-xl font-bold">
            Pricing
          </Label>
          <ol className="space-y-4">
            {pricing.map((e, index) => (
              <div key={index} className="min-w-0">
                <li className="grid min-w-0 grid-cols-[minmax(0,1fr)_44px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <Label className="col-span-full font-bricolage text-base font-bold">
                    {index + 1}.
                  </Label>
                  <Input
                    placeholder="Apparel Type"
                    value={pricing[index].apparelType}
                    onChange={(e) => {
                      setPricing((rows) => {
                        return rows.map((row, i) =>
                          i === index
                            ? { ...row, apparelType: e.target.value }
                            : row,
                        );
                      });
                    }}
                    className={`${inputStyling} col-span-full`}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="BDT"
                    value={e.unitPrice}
                    onChange={(event) => {
                      setPricing((rows) =>
                        rows.map((row, i) =>
                          i === index
                            ? { ...row, unitPrice: event.target.value }
                            : row,
                        ),
                      );
                    }}
                    className="h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 text-right font-mono text-base font-semibold text-black placeholder:text-gray-400 focus-visible:border-[#ff206e] focus-visible:ring-2 focus-visible:ring-[#ff206e]/20"
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setPricing(
                        pricing.filter((e, ind) => {
                          return ind !== index;
                        }),
                      );
                    }}
                    className="h-12 w-11 rounded-xl border border-gray-300 bg-white p-0 text-xl font-bold text-gray-600 shadow-none transition-colors hover:bg-gray-100 hover:text-black"
                  >
                    -
                  </Button>
                </li>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => {
                setPricing(pricing.concat({ apparelType: "", unitPrice: "" }));
              }}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white text-xl font-bold text-black shadow-none transition-colors hover:bg-gray-100"
            >
              +
            </Button>
          </ol>
        </div>
        <div className="min-w-0 space-y-4 rounded-2xl border border-gray-200 p-4 md:p-5">
          <Label className="block border-b border-gray-100 pb-3 font-bricolage text-xl font-bold">
            Images
          </Label>
          {images?.map((e, i) => (
            <div key={i} className="flex min-w-0 items-center gap-3">
              <Input
                onChange={(event) => {
                  const selectedFile = event.currentTarget.files?.[0] ?? null;
                  setImages((rows) =>
                    rows.map((row, index) =>
                      index === i ? selectedFile : row,
                    ),
                  );
                }}
                type="file"
                accept="image/*"
                className="h-auto min-h-12 w-full min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:font-semibold file:text-black focus-visible:ring-2 focus-visible:ring-[#ff206e]/20"
              />
              <Button
                type="button"
                onClick={() => {
                  setImages((row) => row.filter((_, ind) => ind !== i));
                }}
                className="h-12 w-11 shrink-0 rounded-xl border border-gray-300 bg-white p-0 text-xl font-bold text-gray-600 shadow-none transition-colors hover:bg-gray-100 hover:text-black"
              >
                -
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => setImages((rows) => [...rows, null])}
            className="h-12 w-full rounded-xl border border-gray-300 bg-white text-xl font-bold text-black shadow-none transition-colors hover:bg-gray-100"
          >
            +
          </Button>
        </div>

        <Button
          type="submit"
          className="col-span-full h-14 w-full rounded-xl bg-[#ff206e] px-8 text-lg font-bold text-white shadow-md transition hover:bg-[#d41b5b] active:scale-[0.99]"
        >
          Submit
        </Button>
      </form>
      <Button
        onClick={() => {
          router.refresh();
          supabase.auth.signOut();
          router.refresh();
        }}
        className="mx-auto mt-6 flex h-12 w-full max-w-4xl rounded-xl border border-gray-300 bg-white text-base font-bold text-black shadow-none transition-colors hover:bg-gray-100"
      >
        Sign Out
      </Button>
    </div>
  );
}
