"use strict";

const {
  parse,
  isValid,
  getDateOfBirth,
  getGender,
  getAge,
  getCitizenship,
} = require("../../dist/index.cjs");

// ── 1. parse() ───────────────────────────────────────────────────────────────

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

const bad = parse("1234567890123");
if (!bad.valid) {
  console.log("\nInvalid ID reason:", bad.reason);
}

// ── 2. isValid() ─────────────────────────────────────────────────────────────

console.log("\n── isValid() ───────────────────────────────────");
console.log(isValid("9001049818080")); // true
console.log(isValid("9001049818081")); // false
console.log(isValid("not-an-id"));     // false

// ── 3. getDateOfBirth() ──────────────────────────────────────────────────────

console.log("\n── getDateOfBirth() ────────────────────────────");
const dob = getDateOfBirth("9001049818080");
if (dob) {
  console.log("Year :", dob.getFullYear());
  console.log("Month:", dob.getMonth() + 1);
  console.log("Day  :", dob.getDate());
}

// ── 4. getGender() ───────────────────────────────────────────────────────────

console.log("\n── getGender() ─────────────────────────────────");
console.log(getGender("9001049818080")); // "male"
console.log(getGender("7805050050083")); // "female"

// ── 5. getAge() ──────────────────────────────────────────────────────────────

console.log("\n── getAge() ────────────────────────────────────");
console.log(getAge("9001049818080")); // e.g. 35

// ── 6. getCitizenship() ──────────────────────────────────────────────────────

console.log("\n── getCitizenship() ────────────────────────────");
console.log(getCitizenship("9001049818080")); // "citizen"
console.log(getCitizenship("8001015009087")); // "permanent_resident"

// ── 7. Error handling ────────────────────────────────────────────────────────

console.log("\n── Error handling ──────────────────────────────");

const cases = [
  "900104981808",
  "9013049818089",
  "9001329818089",
  "9001049818081",
];

cases.forEach(function (id) {
  const result = parse(id);
  if (!result.valid) {
    console.log(id + " → " + result.reason);
  }
});

// ── 8. Practical: build a profile object ─────────────────────────────────────

console.log("\n── Profile object ──────────────────────────────");

function buildProfile(idNumber) {
  const result = parse(idNumber);
  if (!result.valid) return null;

  return {
    dob: result.dateOfBirth.toISOString().split("T")[0],
    age: result.age,
    gender: result.gender,
    status: result.isCitizen ? "SA Citizen" : "Permanent Resident",
  };
}

console.log(buildProfile("9001049818080"));
// { dob: '1990-01-04', age: 35, gender: 'male', status: 'SA Citizen' }

console.log(buildProfile("bad")); // null
