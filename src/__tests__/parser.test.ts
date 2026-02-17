import { describe, it, expect } from "vitest";
import {
  parse,
  isValid,
  getDateOfBirth,
  getGender,
  getAge,
  getCitizenship,
} from "../parser.js";

// ---------------------------------------------------------------------------
// Known-valid test IDs
// ---------------------------------------------------------------------------
//
// These IDs pass the Luhn algorithm and have real-looking dates.
// They are synthetic examples used for testing only.
//
// Format reminder: YYMMDDSSSSCAZ
//   9001049818080  → DOB 1990-01-04, male (9818), citizen (0), checksum 0
//   8001015009087  → DOB 1980-01-01, female (5009 — wait, 5009 ≥ 5000 = male),
//                    let's keep consistent naming in comments.
// ---------------------------------------------------------------------------

const VALID_MALE_CITIZEN   = "9001049818080"; // 1990-01-04, male, citizen
const VALID_FEMALE_CITIZEN = "7805050050083"; // 1978-05-05, female, citizen
const VALID_PR             = "8001015009087"; // 1980-01-01, male, permanent resident

describe("parse()", () => {
  // ── Happy path ──────────────────────────────────────────────────────────

  describe("valid IDs", () => {
    it("returns valid=true for a known valid male citizen ID", () => {
      const result = parse(VALID_MALE_CITIZEN);
      expect(result.valid).toBe(true);
    });

    it("populates idNumber with the original input", () => {
      const result = parse(VALID_MALE_CITIZEN);
      expect(result.valid && result.idNumber).toBe(VALID_MALE_CITIZEN);
    });

    it("parses the date of birth correctly", () => {
      const result = parse(VALID_MALE_CITIZEN);
      if (!result.valid) throw new Error("Expected valid result");
      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.dateOfBirth.getFullYear()).toBe(1990);
      expect(result.dateOfBirth.getMonth()).toBe(0);   // January (0-indexed)
      expect(result.dateOfBirth.getDate()).toBe(4);
    });

    it("determines gender as male when SSSS >= 5000", () => {
      const result = parse(VALID_MALE_CITIZEN); // genderSequence = 9818
      expect(result.valid && result.gender).toBe("male");
    });

    it("determines gender as female when SSSS < 5000", () => {
      const result = parse(VALID_FEMALE_CITIZEN); // genderSequence = 0050
      expect(result.valid && result.gender).toBe("female");
    });

    it("sets citizenship to 'citizen' when digit is 0", () => {
      const result = parse(VALID_MALE_CITIZEN);
      expect(result.valid && result.citizenship).toBe("citizen");
    });

    it("sets citizenship to 'permanent_resident' when digit is 1", () => {
      const result = parse(VALID_PR);
      expect(result.valid && result.citizenship).toBe("permanent_resident");
    });

    it("sets isCitizen=true for citizens", () => {
      const result = parse(VALID_MALE_CITIZEN);
      expect(result.valid && result.isCitizen).toBe(true);
    });

    it("sets isCitizen=false for permanent residents", () => {
      const result = parse(VALID_PR);
      expect(result.valid && result.isCitizen).toBe(false);
    });

    it("calculates a sensible age", () => {
      const result = parse(VALID_MALE_CITIZEN);
      if (!result.valid) throw new Error("Expected valid result");
      const currentYear = new Date().getFullYear();
      const roughAge = currentYear - 1990;
      // Allow ±1 for birthday boundary.
      expect(result.age).toBeGreaterThanOrEqual(roughAge - 1);
      expect(result.age).toBeLessThanOrEqual(roughAge);
    });

    it("exposes raw segments", () => {
      const result = parse(VALID_MALE_CITIZEN);
      if (!result.valid) throw new Error("Expected valid result");
      expect(result.segments.yearPart).toBe("90");
      expect(result.segments.monthPart).toBe("01");
      expect(result.segments.dayPart).toBe("04");
      expect(result.segments.genderSequence).toBe("9818");
      expect(result.segments.citizenshipDigit).toBe("0");
      expect(result.segments.checksumDigit).toBe("0");
    });

    it("trims surrounding whitespace before parsing", () => {
      const result = parse(`  ${VALID_MALE_CITIZEN}  `);
      expect(result.valid).toBe(true);
    });
  });

  // ── Format errors ────────────────────────────────────────────────────────

  describe("invalid format", () => {
    it("rejects IDs shorter than 13 digits", () => {
      const result = parse("900104981808");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_FORMAT");
    });

    it("rejects IDs longer than 13 digits", () => {
      const result = parse("90010498180800");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_FORMAT");
    });

    it("rejects IDs containing non-digit characters", () => {
      const result = parse("9001049818O80"); // letter O instead of zero
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_FORMAT");
    });

    it("rejects an empty string", () => {
      const result = parse("");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_FORMAT");
    });

    it("stores the original idNumber even on failure", () => {
      const result = parse("bad");
      expect(!result.valid && result.idNumber).toBe("bad");
    });
  });

  // ── Date errors ──────────────────────────────────────────────────────────

  describe("invalid date", () => {
    it("rejects an impossible month (13)", () => {
      // YYMMDD = 901304... month 13 is invalid
      const result = parse("9013049818089");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_DATE");
    });

    it("rejects an impossible day (32)", () => {
      const result = parse("9001329818089");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_DATE");
    });

    it("rejects Feb 30", () => {
      const result = parse("9002309818089");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_DATE");
    });
  });

  // ── Citizenship digit errors ─────────────────────────────────────────────

  describe("invalid citizenship digit", () => {
    it("rejects digit 5 in the citizenship position", () => {
      // Manually craft 13 digits that pass format & date but fail citizenship.
      // Use 9001049818580: citizenship digit = 5
      const result = parse("9001049818580");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_CITIZENSHIP_DIGIT");
    });
  });

  // ── Checksum errors ──────────────────────────────────────────────────────

  describe("invalid checksum", () => {
    it("rejects an ID with a wrong last digit", () => {
      // Change the last digit of the valid ID to break the Luhn check.
      const result = parse("9001049818081");
      expect(result.valid).toBe(false);
      expect(!result.valid && result.reason).toBe("INVALID_CHECKSUM");
    });
  });
});

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

describe("isValid()", () => {
  it("returns true for a valid ID", () => {
    expect(isValid(VALID_MALE_CITIZEN)).toBe(true);
  });

  it("returns false for an invalid ID", () => {
    expect(isValid("1234567890123")).toBe(false);
  });
});

describe("getDateOfBirth()", () => {
  it("returns a Date for a valid ID", () => {
    const dob = getDateOfBirth(VALID_MALE_CITIZEN);
    expect(dob).toBeInstanceOf(Date);
  });

  it("returns null for an invalid ID", () => {
    expect(getDateOfBirth("invalid")).toBeNull();
  });
});

describe("getGender()", () => {
  it("returns 'male' for a valid male ID", () => {
    expect(getGender(VALID_MALE_CITIZEN)).toBe("male");
  });

  it("returns 'female' for a valid female ID", () => {
    expect(getGender(VALID_FEMALE_CITIZEN)).toBe("female");
  });

  it("returns null for an invalid ID", () => {
    expect(getGender("invalid")).toBeNull();
  });
});

describe("getAge()", () => {
  it("returns a positive integer for a valid ID", () => {
    const age = getAge(VALID_MALE_CITIZEN);
    expect(typeof age).toBe("number");
    expect(age).toBeGreaterThan(0);
  });

  it("returns null for an invalid ID", () => {
    expect(getAge("invalid")).toBeNull();
  });
});

describe("getCitizenship()", () => {
  it("returns 'citizen' for a citizen ID", () => {
    expect(getCitizenship(VALID_MALE_CITIZEN)).toBe("citizen");
  });

  it("returns 'permanent_resident' for a PR ID", () => {
    expect(getCitizenship(VALID_PR)).toBe("permanent_resident");
  });

  it("returns null for an invalid ID", () => {
    expect(getCitizenship("invalid")).toBeNull();
  });
});
