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
  const inputStyling = "border-0 bg-slate-700 focus-visible:ring-0";
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
    <div className="bg-black text-amber-50 p-4 flex flex-col gap-2">
      <Label className="text-3xl"> Site Admin Page </Label>

      <form onSubmit={handleSubmit} className="bg-slate-950 p-2 rounded-2xl">
        {/* Add a Turf Form */}
        <Label className="text-2xl">Add a Laundry</Label>

        <div>
          <Label>Laundry Name</Label>
          <Input
            className={inputStyling}
            value={laundryName}
            onChange={(event) => setLaundryName(event.target.value)}
          />
        </div>
        <div>
          <Label>Owner&apos;s Email</Label>
          <Input
            className={inputStyling}
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
          />
        </div>
        <div>
          <Label>Location (Area)</Label>
          <Input
            className={inputStyling}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
        <div>
          <Label>About</Label>
          <textarea
            className="w-full rounded-md border-0 bg-slate-700 p-2 text-slate-100 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
          />
        </div>
        <div>
          <Label>Pricing</Label>
          <ol>
            {pricing.map((e, index) => (
              <div key={index}>
                <li className="flex gap-2">
                  <Label>{index + 1}.</Label>
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
                    className={inputStyling}
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
                    className="border-slate-600 focus-visible:ring-0 w-1xl"
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
                    className="text-2xl"
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
              className="text-2xl"
            >
              +
            </Button>
          </ol>
        </div>
        <div>
          <Label>Images</Label>
          {images?.map((e, i) => (
            <div key={i} className="flex gap-2">
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
                className={inputStyling}
              />
              <Button
                type="button"
                onClick={() => {
                  setImages((row) => row.filter((_, ind) => ind !== i));
                }}
                className="text-2xl"
              >
                -
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => setImages((rows) => [...rows, null])}
            className="text-2xl"
          >
            +
          </Button>
        </div>

        <Button type="submit">Submit</Button>
      </form>
      <Button
        onClick={() => {
          router.refresh();
          supabase.auth.signOut();
          router.refresh();
        }}
        className="bg-gray-700"
      >
        Sign Out
      </Button>
    </div>
  );
}
