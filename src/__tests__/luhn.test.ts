import { describe, it, expect } from "vitest";
import { luhn } from "../luhn.js";

describe("luhn()", () => {
  it("returns true for a well-known valid SA ID", () => {
    expect(luhn("9001049818080")).toBe(true);
  });

  it("returns true for another known valid ID", () => {
    expect(luhn("8001015009087")).toBe(true);
  });

  it("returns false when a digit is altered (checksum mismatch)", () => {
    expect(luhn("9001049818081")).toBe(false);
  });

  it("returns false for a string with non-numeric characters", () => {
    expect(luhn("900104981808A")).toBe(false);
  });

  it("handles an empty string", () => {
    expect(luhn("")).toBe(true); // sum=0, 0 % 10 === 0
  });
});
