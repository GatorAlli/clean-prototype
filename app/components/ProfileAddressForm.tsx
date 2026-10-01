"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAddress } from "@/app/auth/addressActions";
import type { ProfileAddress } from "@/lib/profile-address";
import { Button } from "@/components/ui/button";

export default function ProfileAddressForm({ initialAddress }: { initialAddress: ProfileAddress | null }) {
  const [address, setAddress] = useState(initialAddress?.address ?? "");
  const [locality, setLocality] = useState(initialAddress?.locality ?? "");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  return <section className="space-y-4">
    <h2 className="text-2xl font-bold">Delivery address</h2>
    <p className="text-sm text-gray-600">Orders use your saved address automatically. Your laundry can see the address saved with each order.</p>
    <form className="max-w-lg space-y-4" action={async () => {
      setSaving(true);
      try {
        const result = await saveProfileAddress(address, locality);
        setStatus(result.message);
        if (result.ok) router.refresh();
      } catch {
        setStatus("Could not save your address. Please retry.");
      } finally { setSaving(false); }
    }}>
      <label className="block font-medium">Address
        <textarea className="mt-2 block w-full rounded-lg border p-3" autoComplete="street-address" required maxLength={500} value={address} onChange={event => setAddress(event.target.value)} />
      </label>
      <label className="block font-medium">Locality
        <input className="mt-2 block w-full rounded-lg border p-3" autoComplete="address-level3" required maxLength={100} value={locality} onChange={event => setLocality(event.target.value)} />
      </label>
      <Button disabled={saving} type="submit">{saving ? "Saving…" : "Save address"}</Button>
      <p role="status">{status}</p>
    </form>
  </section>;
}
