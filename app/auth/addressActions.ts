"use server";

import { revalidatePath } from "next/cache";
import { validateProfileAddress } from "@/lib/profile-address";
import { generateServerClient } from "@/lib/supabase/server";

export async function saveProfileAddress(address: string, locality: string) {
  const contact = validateProfileAddress(address, locality);
  if (!contact) return { ok: false, message: "Enter your address (up to 500 characters) and locality (up to 100 characters)." };
  const supabase = await generateServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false, message: "Please sign in to save your address." };
  const { error } = await supabase.auth.updateUser({ data: { street_address: contact.address, locality: contact.locality } });
  if (error) return { ok: false, message: "Could not save your address. Please retry." };
  revalidatePath("/auth");
  return { ok: true, message: "Address saved. Future orders will use this address automatically." };
}
