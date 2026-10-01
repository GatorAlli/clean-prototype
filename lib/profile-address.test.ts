import assert from "node:assert/strict";
import test from "node:test";
import { getProfileAddress, validateProfileAddress } from "./profile-address";

test("saved profile addresses are trimmed and support older address metadata", () => {
  assert.deepEqual(getProfileAddress({ street_address: " House 10, Road 2 ", locality: " Banani " }), { address: "House 10, Road 2", locality: "Banani" });
  assert.deepEqual(getProfileAddress({ address: "House 10", locality: "Banani" }), { address: "House 10", locality: "Banani" });
});

test("missing, malformed and oversized profile addresses cannot be used for delivery", () => {
  for (const address of [undefined, null, {}, "", "  ", "a".repeat(501)]) {
    assert.equal(validateProfileAddress(address, "Banani"), null);
  }
  for (const locality of [undefined, null, {}, "", "  ", "a".repeat(101)]) {
    assert.equal(validateProfileAddress("House 10", locality), null);
  }
  assert.equal(getProfileAddress({}), null);
});
