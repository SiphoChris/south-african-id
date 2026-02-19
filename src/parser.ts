import { luhn } from "./luhn.js";
import type {
  CitizenshipStatus,
  Gender,
  IDResult,
  InvalidReason,
  ParsedID,
  RawSegments,
} from "./types.js";

// South African ID numbers are exactly 13 numeric digits.
const ID_REGEX = /^\d{13}$/;

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Slices the raw segments out of a 13-digit ID string.
 * No validation is performed here — call this only after format check.
 */
function extractSegments(id: string): RawSegments {
  return {
    yearPart: id.slice(0, 2),
    monthPart: id.slice(2, 4),
    dayPart: id.slice(4, 6),
    genderSequence: id.slice(6, 10),
    citizenshipDigit: id.slice(10, 11),
    legacyDigit: id.slice(11, 12),
    checksumDigit: id.slice(12, 13),
  };
}

/**
 * Resolves the two-digit year to a full four-digit year.
 *
 * The ID number encodes only the last two digits of the birth year (YY).
 * We pick the century that places the birth date in the past and results
 * in the smallest non-negative age. This correctly handles people born in
 * the 2000s (e.g. "05" → 2005) while not misidentifying older people.
 */
function resolveYear(yy: number): number {
  const currentYear = new Date().getFullYear();
  const year2000 = 2000 + yy;
  const year1900 = 1900 + yy;

  // Prefer 2000s if the resulting year is not in the future.
  return year2000 <= currentYear ? year2000 : year1900;
}

/**
 * Parses and validates the date-of-birth portion of the ID.
 * Returns `null` when the date is invalid (e.g. month 13, day 30 in Feb).
 */
function parseDate(segments: RawSegments): Date | null {
  const yy = parseInt(segments.yearPart, 10);
  const mm = parseInt(segments.monthPart, 10);
  const dd = parseInt(segments.dayPart, 10);

  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const year = resolveYear(yy);
  // Month is 0-indexed in JS Date.
  const date = new Date(year, mm - 1, dd);

  // Guard against JS Date rolling over invalid dates (e.g. Feb 30 → Mar 1).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return null;
  }

  // Birth date must not be in the future.
  if (date > new Date()) return null;

  return date;
}

/**
 * Calculates the completed (floor) age in years from a birth date.
 */
function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) age--;
  return age;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Parses a South African ID number and returns a rich result object.
 *
 * Validation steps performed (in order):
 *   1. Format — must be exactly 13 numeric digits.
 *   2. Date of birth — must encode a real, non-future calendar date.
 *   3. Citizenship digit — must be `0`, `1`, or (historically) `2`.
 *   4. Luhn checksum — the 13th digit must satisfy the Luhn algorithm.
 *
 * @param idNumber - The 13-digit South African ID string to parse.
 * @returns A {@link ParsedID} on success or an {@link InvalidID} on failure.
 *
 * @example
 * ```ts
 * import { parse } from "south-african-id";
 *
 * const result = parse("9001049818080");
 * if (result.valid) {
 *   console.log(result.dateOfBirth); // Date object
 *   console.log(result.gender);      // "male" | "female"
 *   console.log(result.age);         // number
 * }
 * ```
 */
export function parse(idNumber: string): IDResult {
  const id = String(idNumber).trim();

  // ── Step 1: Format ──────────────────────────────────────────────
  if (!ID_REGEX.test(id)) {
    return invalid(id, "INVALID_FORMAT");
  }

  const segments = extractSegments(id);

  // ── Step 2: Date of birth ────────────────────────────────────────
  const dateOfBirth = parseDate(segments);
  if (dateOfBirth === null) {
    return invalid(id, "INVALID_DATE");
  }

  // ── Step 3: Citizenship digit ────────────────────────────────────
  const citizenshipDigit = segments.citizenshipDigit;
  if (
    citizenshipDigit !== "0" &&
    citizenshipDigit !== "1" &&
    citizenshipDigit !== "2"
  ) {
    return invalid(id, "INVALID_CITIZENSHIP_DIGIT");
  }

  // ── Step 4: Luhn checksum ────────────────────────────────────────
  if (!luhn(id)) {
    return invalid(id, "INVALID_CHECKSUM");
  }

  // ── All checks passed — build result ────────────────────────────
  const genderSequence = parseInt(segments.genderSequence, 10);
  const gender: Gender = genderSequence >= 5000 ? "male" : "female";

  const citizenship: CitizenshipStatus =
    citizenshipDigit === "0" ? "citizen" : "permanent_resident";

  const age = calculateAge(dateOfBirth);

  const parsed: ParsedID = {
    valid: true,
    idNumber: id,
    dateOfBirth,
    age,
    gender,
    citizenship,
    isCitizen: citizenshipDigit === "0",
    segments,
  };

  return parsed;
}

/**
 * Returns `true` when the supplied string is a structurally and
 * mathematically valid South African ID number.
 *
 * This is a lightweight convenience wrapper around {@link parse}.
 *
 * @param idNumber - The 13-digit string to validate.
 * @returns `true` if valid, `false` otherwise.
 *
 * @example
 * ```ts
 * import { isValid } from "south-african-id";
 *
 * isValid("9001049818080"); // true
 * isValid("1234567890123"); // false
 * ```
 */
export function isValid(idNumber: string): boolean {
  return parse(idNumber).valid;
}

/**
 * Extracts the date of birth from a South African ID number.
 *
 * @param idNumber - The 13-digit string.
 * @returns A `Date` object, or `null` if the ID is invalid.
 *
 * @example
 * ```ts
 * import { getDateOfBirth } from "south-african-id";
 *
 * getDateOfBirth("9001049818080"); // Date(1990, 0, 4)
 * ```
 */
export function getDateOfBirth(idNumber: string): Date | null {
  const result = parse(idNumber);
  return result.valid ? result.dateOfBirth : null;
}

/**
 * Extracts the gender from a South African ID number.
 *
 * @param idNumber - The 13-digit string.
 * @returns `"male"` or `"female"`, or `null` if the ID is invalid.
 *
 * @example
 * ```ts
 * import { getGender } from "south-african-id";
 *
 * getGender("9001049818080"); // "male"
 * ```
 */
export function getGender(idNumber: string): Gender | null {
  const result = parse(idNumber);
  return result.valid ? result.gender : null;
}

/**
 * Extracts the age (in full years) from a South African ID number.
 *
 * @param idNumber - The 13-digit string.
 * @returns The age as a whole number, or `null` if the ID is invalid.
 *
 * @example
 * ```ts
 * import { getAge } from "south-african-id";
 *
 * getAge("9001049818080"); // e.g. 35
 * ```
 */
export function getAge(idNumber: string): number | null {
  const result = parse(idNumber);
  return result.valid ? result.age : null;
}

/**
 * Extracts the citizenship status from a South African ID number.
 *
 * @param idNumber - The 13-digit string.
 * @returns `"citizen"` | `"permanent_resident"`, or `null` if the ID is invalid.
 *
 * @example
 * ```ts
 * import { getCitizenship } from "south-african-id";
 *
 * getCitizenship("9001049818080"); // "citizen"
 * ```
 */
export function getCitizenship(idNumber: string): CitizenshipStatus | null {
  const result = parse(idNumber);
  return result.valid ? result.citizenship : null;
}

// ------------------------------------------------------------------
// Private factory
// ------------------------------------------------------------------

function invalid(idNumber: string, reason: InvalidReason) {
  return { valid: false as const, idNumber, reason };
}
