/**
 * south-african-id
 *
 * Parse, validate, and extract data from South African ID numbers.
 *
 * A South African ID number is a 13-digit string with the format:
 *
 *   YYMMDDSSSSCAZ
 *
 * Where:
 *   YY   — last two digits of birth year
 *   MM   — birth month (01–12)
 *   DD   — birth day (01–31)
 *   SSSS — gender sequence: 0000–4999 = female, 5000–9999 = male
 *   C    — citizenship: 0 = SA citizen, 1 = permanent resident
 *   A    — legacy digit (formerly race, now unused)
 *   Z    — Luhn checksum digit
 *
 * @module
 */

export {
  parse,
  isValid,
  getDateOfBirth,
  getGender,
  getAge,
  getCitizenship,
} from "./parser.js";

export { luhn } from "./luhn.js";

export type {
  IDResult,
  ParsedID,
  InvalidID,
  InvalidReason,
  Gender,
  CitizenshipStatus,
  RawSegments,
} from "./types.js";
