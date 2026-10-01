export type ProfileAddress = { address: string; locality: string };

export function validateProfileAddress(address: unknown, locality: unknown): ProfileAddress | null {
  if (typeof address !== "string" || !address.trim() || address.trim().length > 500 ||
      typeof locality !== "string" || !locality.trim() || locality.trim().length > 100) return null;
  return { address: address.trim(), locality: locality.trim() };
}

export function getProfileAddress(metadata: Record<string, unknown>): ProfileAddress | null {
  return validateProfileAddress(metadata.street_address ?? metadata.address, metadata.locality);
}
