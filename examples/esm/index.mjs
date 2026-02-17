import {
  parse,
  isValid,
  getDateOfBirth,
  getGender,
  getAge,
  getCitizenship,
} from "../../dist/index.js";

// ── 1. parse() ───────────────────────────────────────────────────────────────
//
// The main function. Returns a discriminated union — narrow on `.valid`.

console.log("── parse() ─────────────────────────────────────");

const valid = parse("9001049818080");

if (valid.valid) {
  console.log("idNumber    :", valid.idNumber);
  console.log("dateOfBirth :", valid.dateOfBirth.toISOString().split("T")[0]);
  console.log("age         :", valid.age);
  console.log("gender      :", valid.gender);
  console.log("citizenship :", valid.citizenship);
  console.log("isCitizen   :", valid.isCitizen);
  console.log("segments    :", valid.segments);
}


// Invalid ID
const bad = parse("1234567890123");
if (!bad.valid) {
  console.log("\nInvalid ID reason:", bad.reason);
}

// ── 2. isValid() ─────────────────────────────────────────────────────────────

console.log("\n── isValid() ───────────────────────────────────");
console.log(isValid("")); // true
console.log(isValid("9001049818081")); // false — bad checksum
console.log(isValid("not-an-id"));     // false — bad format

// ── 3. getDateOfBirth() ──────────────────────────────────────────────────────

console.log("\n── getDateOfBirth() ────────────────────────────");
const dob = getDateOfBirth("9001049818080");
if (dob) {
  console.log("Year :", dob.getFullYear()); // 1990
  console.log("Month:", dob.getMonth() + 1); // 1 (January)
  console.log("Day  :", dob.getDate());      // 4
}
console.log("Invalid:", getDateOfBirth("bad")); // null

// ── 4. getGender() ───────────────────────────────────────────────────────────

console.log("\n── getGender() ─────────────────────────────────");
console.log(getGender("9001049818080")); // "male"
console.log(getGender("7805050050083")); // "female"
console.log(getGender("bad"));           // null

// ── 5. getAge() ──────────────────────────────────────────────────────────────

console.log("\n── getAge() ────────────────────────────────────");
console.log(getAge("9001049818080")); // e.g. 35
console.log(getAge("bad"));          // null

// ── 6. getCitizenship() ──────────────────────────────────────────────────────

console.log("\n── getCitizenship() ────────────────────────────");
console.log(getCitizenship("9001049818080")); // "citizen"
console.log(getCitizenship("8001015009087")); // "permanent_resident"
console.log(getCitizenship("bad"));           // null

// ── 7. Detailed error handling ───────────────────────────────────────────────

console.log("\n── Error handling ──────────────────────────────");

const cases = [
  "900104981808",    // too short
  "9013049818089",   // invalid month
  "9001329818089",   // invalid day
  "9001049818581",   // bad citizenship digit
  "9001049818081",   // bad checksum
];

for (const id of cases) {
  const result = parse(id);
  if (!result.valid) {
    console.log(`${id} → ${result.reason}`);
  }
}

// ── 8. Practical: form validation ────────────────────────────────────────────

console.log("\n── Form validation ─────────────────────────────");

function validateForm(idNumber) {
  const result = parse(idNumber);
  if (!result.valid) {
    const messages = {
      INVALID_FORMAT: "ID must be exactly 13 digits.",
      INVALID_DATE: "The date of birth in this ID is not valid.",
      INVALID_CITIZENSHIP_DIGIT: "The citizenship indicator is not recognised.",
      INVALID_CHECKSUM: "This ID number has been entered incorrectly.",
    };
    return { ok: false, message: messages[result.reason] };
  }
  return { ok: true, message: "ID is valid." };
}

console.log(validateForm("9001049818080")); // { ok: true, ... }
console.log(validateForm("9001049818081")); // { ok: false, INVALID_CHECKSUM }

// ── 9. Practical: filter a list ──────────────────────────────────────────────

console.log("\n── Filter a list ───────────────────────────────");

const ids = ["9001049818080", "7805050050083", "8001015009087"];

const femaleIDs  = ids.filter((id) => getGender(id) === "female");
const over40     = ids.filter((id) => (getAge(id) ?? 0) > 40);
const citizenIDs = ids.filter((id) => getCitizenship(id) === "citizen");

console.log("Female IDs :", femaleIDs);
console.log("Over 40    :", over40);
console.log("Citizens   :", citizenIDs);
