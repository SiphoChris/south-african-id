/**
 * Represents the gender derived from a South African ID number.
 */
export type Gender = "male" | "female";

/**
 * Represents the citizenship status derived from a South African ID number.
 */
export type CitizenshipStatus = "citizen" | "permanent_resident";

/**
 * The raw segments extracted from a South African ID number before validation.
 */
export interface RawSegments {
  /** Two-digit year portion (e.g. "94") */
  yearPart: string;
  /** Two-digit month portion (e.g. "05") */
  monthPart: string;
  /** Two-digit day portion (e.g. "10") */
  dayPart: string;
  /** Four-digit gender sequence (0000–4999 female, 5000–9999 male) */
  genderSequence: string;
  /** Citizenship digit: "0" = citizen, "1" = permanent resident */
  citizenshipDigit: string;
  /** Legacy race digit (A) — now meaningless, always "8" or "9" on modern IDs */
  legacyDigit: string;
  /** Luhn checksum digit */
  checksumDigit: string;
}

/**
 * A fully parsed and validated South African ID number.
 */
export interface ParsedID {
  /** Whether the ID number passes all validation checks */
  valid: true;

  /** The original 13-digit ID number string */
  idNumber: string;

  /** The date of birth encoded in the ID */
  dateOfBirth: Date;

  /**
   * The person's age in full years as of today.
   */
  age: number;

  /** Gender derived from the gender-sequence digits */
  gender: Gender;

  /** Citizenship status derived from the citizenship digit */
  citizenship: CitizenshipStatus;

  /** Whether the person is a South African citizen (convenience boolean) */
  isCitizen: boolean;

  /** Raw numeric segments of the ID for advanced use-cases */
  segments: RawSegments;
}

/**
 * Returned when an ID number fails any validation step.
 */
export interface InvalidID {
  /** Always false for invalid IDs */
  valid: false;

  /** The original input string */
  idNumber: string;

  /** Human-readable reason for the failure */
  reason: InvalidReason;
}

/**
 * Possible reasons an ID number is considered invalid.
 */
export type InvalidReason =
  | "INVALID_FORMAT"
  | "INVALID_DATE"
  | "INVALID_CITIZENSHIP_DIGIT"
  | "INVALID_CHECKSUM";

/**
 * Union type returned by the `parse` function.
 */
export type IDResult = ParsedID | InvalidID;
