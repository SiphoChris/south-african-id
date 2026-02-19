# @south-african/id

> Parse, validate, and extract data from South African ID numbers — fully typed, zero dependencies.

[![npm version](https://img.shields.io/npm/v/@south-african/id)](https://www.npmjs.com/package/@south-african/id)
[![license](https://img.shields.io/npm/l/@south-african/id)](./LICENSE)
[![types](https://img.shields.io/npm/types/@south-african/id)](./src/types.ts)

---

## Table of Contents

- [Overview](#overview)
- [ID Number Format](#id-number-format)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [`parse(idNumber)`](#parseidnumber)
  - [`isValid(idNumber)`](#isvalididnumber)
  - [`getDateOfBirth(idNumber)`](#getdateofbirthidnumber)
  - [`getGender(idNumber)`](#getgenderidnumber)
  - [`getAge(idNumber)`](#getageidnumber)
  - [`getCitizenship(idNumber)`](#getcitizenshipipidnumber)
  - [`luhn(digits)`](#luhndigits)
- [Types](#types)
- [Validation Rules](#validation-rules)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

South African ID numbers encode a person's date of birth, gender, and citizenship status in a structured 13-digit format. `@south-african/id` gives you a clean, fully-typed API to:

- **Validate** an ID number (format, date, citizenship digit, Luhn checksum)
- **Parse** all encoded fields in one call
- **Extract** individual fields — DOB, age, gender, citizenship — with dedicated helpers

Zero runtime dependencies. Ships as both ESM and CJS with TypeScript declarations included.

---

## ID Number Format

```
Y Y M M D D S S S S C A Z
│ │ │ │ │ │ │ │ │ │ │ │ └─ Z  Luhn checksum digit
│ │ │ │ │ │ │ │ │ │ │ └─── A  Legacy digit (formerly race — now unused)
│ │ │ │ │ │ │ │ │ │ └───── C  Citizenship: 0 = SA citizen, 1 = permanent resident
│ │ │ │ │ │ └─┴─┴─┴─────── SSSS  Gender sequence: 0000–4999 = female, 5000–9999 = male
│ │ │ │ └─┴─────────────── DD  Birth day (01–31)
│ │ └─┴───────────────────── MM  Birth month (01–12)
└─┴─────────────────────────── YY  Last two digits of birth year
```

**Example:** `9001049818080`

| Segment | Value  | Meaning               |
| ------- | ------ | --------------------- |
| `YY`    | `90`   | Born in 1990          |
| `MM`    | `01`   | January               |
| `DD`    | `04`   | 4th                   |
| `SSSS`  | `9818` | ≥ 5000 → Male         |
| `C`     | `0`    | South African citizen |
| `A`     | `8`    | Legacy (ignore)       |
| `Z`     | `0`    | Luhn checksum ✓       |

---

## Installation

### pnpm _(recommended)_

```sh
pnpm add @south-african/id
```

### npm

```sh
npm install @south-african/id
```

### yarn

```sh
yarn add @south-african/id
```

### bun

```sh
bun add @south-african/id
```

---

## Quick Start

```ts
import { parse } from "@south-african/id";

const result = parse("9001049818080");

if (result.valid) {
  console.log(result.dateOfBirth); // Date: 1990-01-04
  console.log(result.age); // e.g. 35
  console.log(result.gender); // "male"
  console.log(result.citizenship); // "citizen"
  console.log(result.isCitizen); // true
} else {
  console.error(result.reason); // e.g. "INVALID_CHECKSUM"
}
```

---

## API Reference

### `parse(idNumber)`

The main entry point. Runs all four validation checks and returns a discriminated union — either a fully populated `ParsedID` or an `InvalidID` with a reason code.

```ts
function parse(idNumber: string): IDResult;
```

**Parameters**

| Name       | Type     | Description                                                                               |
| ---------- | -------- | ----------------------------------------------------------------------------------------- |
| `idNumber` | `string` | A 13-digit South African ID number. Leading/trailing whitespace is trimmed automatically. |

**Returns** — `ParsedID` (when `valid: true`) or `InvalidID` (when `valid: false`).

#### `ParsedID` fields

| Field         | Type                                | Description                          |
| ------------- | ----------------------------------- | ------------------------------------ |
| `valid`       | `true`                              | Discriminant                         |
| `idNumber`    | `string`                            | The original input string            |
| `dateOfBirth` | `Date`                              | Birth date encoded in the ID         |
| `age`         | `number`                            | Age in full years as of today        |
| `gender`      | `"male" \| "female"`                | Derived from digits 7–10             |
| `citizenship` | `"citizen" \| "permanent_resident"` | Derived from digit 11                |
| `isCitizen`   | `boolean`                           | `true` when citizenship digit is `0` |
| `segments`    | `RawSegments`                       | The raw sliced string segments       |

#### `InvalidID` fields

| Field      | Type            | Description               |
| ---------- | --------------- | ------------------------- |
| `valid`    | `false`         | Discriminant              |
| `idNumber` | `string`        | The original input string |
| `reason`   | `InvalidReason` | Why validation failed     |

```ts
import { parse } from "@south-african/id";

// ✅ Valid
const r1 = parse("9001049818080");
// r1.valid === true
// r1.gender === "male"
// r1.age    === 35 (as of 2025)

// ❌ Invalid format
const r2 = parse("not-an-id");
// r2.valid  === false
// r2.reason === "INVALID_FORMAT"

// ❌ Bad checksum
const r3 = parse("9001049818081");
// r3.valid  === false
// r3.reason === "INVALID_CHECKSUM"
```

---

### `isValid(idNumber)`

Lightweight boolean check. Internally calls `parse()` and returns `result.valid`.

```ts
function isValid(idNumber: string): boolean;
```

```ts
import { isValid } from "@south-african/id";

isValid("9001049818080"); // true
isValid("1234567890123"); // false
isValid("invalid"); // false
```

---

### `getDateOfBirth(idNumber)`

Returns the birth date encoded in the ID, or `null` if the ID is invalid.

```ts
function getDateOfBirth(idNumber: string): Date | null;
```

```ts
import { getDateOfBirth } from "@south-african/id";

const dob = getDateOfBirth("9001049818080");
// dob instanceof Date === true
// dob.getFullYear()   === 1990
// dob.getMonth()      === 0    (January, 0-indexed)
// dob.getDate()       === 4

getDateOfBirth("invalid"); // null
```

---

### `getGender(idNumber)`

Returns `"male"` or `"female"` based on the gender-sequence digits (positions 7–10), or `null` for invalid IDs.

```ts
function getGender(idNumber: string): "male" | "female" | null;
```

```ts
import { getGender } from "@south-african/id";

getGender("9001049818080"); // "male"   (sequence 9818 ≥ 5000)
getGender("7805050050083"); // "female" (sequence 0050 < 5000)
getGender("invalid"); // null
```

---

### `getAge(idNumber)`

Returns the person's age in completed years as of today, or `null` for invalid IDs.

```ts
function getAge(idNumber: string): number | null;
```

```ts
import { getAge } from "@south-african/id";

getAge("9001049818080"); // e.g. 35
getAge("invalid"); // null
```

---

### `getCitizenship(idNumber)`

Returns the citizenship status, or `null` for invalid IDs.

```ts
function getCitizenship(
  idNumber: string,
): "citizen" | "permanent_resident" | null;
```

```ts
import { getCitizenship } from "@south-african/id";

getCitizenship("9001049818080"); // "citizen"
getCitizenship("8001015009087"); // "permanent_resident"
getCitizenship("invalid"); // null
```

---

### `luhn(digits)`

Low-level Luhn (mod 10) checksum validator. Exposed for advanced use-cases; most consumers should use `parse()` or `isValid()` instead.

```ts
function luhn(digits: string): boolean;
```

```ts
import { luhn } from "@south-african/id";

luhn("9001049818080"); // true
luhn("9001049818081"); // false
```

---

## Types

All types are exported from the package root.

```ts
import type {
  IDResult,
  ParsedID,
  InvalidID,
  InvalidReason,
  Gender,
  CitizenshipStatus,
  RawSegments,
} from "@south-african/id";
```

### `IDResult`

```ts
type IDResult = ParsedID | InvalidID;
```

Discriminated union returned by `parse()`. Narrow with `result.valid`.

---

### `ParsedID`

```ts
interface ParsedID {
  valid: true;
  idNumber: string;
  dateOfBirth: Date;
  age: number;
  gender: Gender;
  citizenship: CitizenshipStatus;
  isCitizen: boolean;
  segments: RawSegments;
}
```

---

### `InvalidID`

```ts
interface InvalidID {
  valid: false;
  idNumber: string;
  reason: InvalidReason;
}
```

---

### `InvalidReason`

```ts
type InvalidReason =
  | "INVALID_FORMAT" // Not exactly 13 numeric digits
  | "INVALID_DATE" // Date portion is not a real calendar date
  | "INVALID_CITIZENSHIP_DIGIT" // Citizenship digit is not 0, 1, or 2
  | "INVALID_CHECKSUM"; // Luhn algorithm fails
```

---

### `Gender`

```ts
type Gender = "male" | "female";
```

---

### `CitizenshipStatus`

```ts
type CitizenshipStatus = "citizen" | "permanent_resident";
```

---

### `RawSegments`

The raw sliced string segments of the ID number. Available on `ParsedID.segments`.

```ts
interface RawSegments {
  yearPart: string; // "90"
  monthPart: string; // "01"
  dayPart: string; // "04"
  genderSequence: string; // "9818"
  citizenshipDigit: string; // "0"
  legacyDigit: string; // "8"
  checksumDigit: string; // "0"
}
```

---

## Validation Rules

`parse()` applies the following checks **in order**. The first failure short-circuits and returns the corresponding `reason`.

| #   | Check                                                    | Reason on failure           |
| --- | -------------------------------------------------------- | --------------------------- |
| 1   | Must be exactly **13 numeric digits** (after trimming)   | `INVALID_FORMAT`            |
| 2   | `YYMMDD` must be a **real, non-future** calendar date    | `INVALID_DATE`              |
| 3   | Citizenship digit (position 11) must be `0`, `1`, or `2` | `INVALID_CITIZENSHIP_DIGIT` |
| 4   | Full 13-digit string must satisfy the **Luhn algorithm** | `INVALID_CHECKSUM`          |

---

## Examples

### Form validation

```ts
import { isValid } from "@south-african/id";

function validateForm(idNumber: string) {
  if (!isValid(idNumber)) {
    throw new Error("Please enter a valid South African ID number.");
  }
}
```

### Detailed error handling

```ts
import { parse } from "@south-african/id";

function processID(idNumber: string) {
  const result = parse(idNumber);

  if (!result.valid) {
    switch (result.reason) {
      case "INVALID_FORMAT":
        return "ID must be exactly 13 digits.";
      case "INVALID_DATE":
        return "The date of birth in this ID is not valid.";
      case "INVALID_CITIZENSHIP_DIGIT":
        return "The citizenship indicator is not recognised.";
      case "INVALID_CHECKSUM":
        return "This ID number has been entered incorrectly.";
    }
  }

  return `Welcome, ${result.gender === "male" ? "Mr" : "Ms"}. Born ${result.dateOfBirth.toDateString()}.`;
}
```

### Displaying a person's profile

```ts
import { parse } from "@south-african/id";

const id = parse("9001049818080");

if (id.valid) {
  const profile = {
    dob: id.dateOfBirth.toISOString().split("T")[0], // "1990-01-04"
    age: id.age,
    gender: id.gender,
    status: id.isCitizen ? "South African Citizen" : "Permanent Resident",
  };

  console.table(profile);
  // ┌────────┬────────────────────────────┐
  // │ dob    │ 1990-01-04                 │
  // │ age    │ 35                         │
  // │ gender │ male                       │
  // │ status │ South African Citizen      │
  // └────────┴────────────────────────────┘
}
```

### Filtering a list

```ts
import { getGender, getAge } from "@south-african/id";

const ids = ["9001049818080", "7805050050083", "8001015009087"];

// Find all IDs belonging to people over 40
const over40 = ids.filter((id) => {
  const age = getAge(id);
  return age !== null && age > 40;
});
```

### Using raw segments

```ts
import { parse } from "@south-african/id";

const result = parse("9001049818080");

if (result.valid) {
  const { segments } = result;
  console.log(segments.genderSequence); // "9818"
  console.log(segments.citizenshipDigit); // "0"
}
```

### CommonJS usage

```js
const { parse, isValid } = require("@south-african/id");

const result = parse("9001049818080");
console.log(result.valid); // true
```

---

## Contributing

1. Fork the repo and clone locally.
2. Install dependencies: `pnpm install`
3. Run tests in watch mode: `pnpm test:watch`
4. Build: `pnpm build`
5. Open a pull request — all submissions welcome!

### Project structure

```
@south-african/id/
├── src/
│   ├── index.ts          # Public barrel — re-exports everything
│   ├── types.ts          # All TypeScript types and interfaces
│   ├── luhn.ts           # Luhn checksum algorithm
│   ├── parser.ts         # Core parse() logic and convenience helpers
│   └── __tests__/
│       ├── luhn.test.ts
│       └── parser.test.ts
├── tsup.config.ts        # Build configuration (ESM + CJS + .d.ts)
├── vitest.config.ts      # Test configuration
├── tsconfig.json
└── package.json
```

### Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm build`         | Compile to `dist/` (ESM, CJS, types) |
| `pnpm dev`           | Rebuild on file change               |
| `pnpm test`          | Run test suite once                  |
| `pnpm test:watch`    | Run tests in watch mode              |
| `pnpm test:coverage` | Run tests with coverage report       |
| `pnpm typecheck`     | Type-check without emitting          |
| `pnpm lint`          | Lint source files                    |

---

## License

[MIT](./LICENSE) © Mzantsi
