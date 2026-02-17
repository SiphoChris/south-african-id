# Changelog

All notable changes to `@mzantsi/id` will be documented here.

This project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2024-01-01

### Added
- Initial release — full rewrite of `@mzantsi/id-verifier` in TypeScript
- `parse()` — full ID parsing with discriminated union result
- `isValid()` — boolean validity check
- `getDateOfBirth()` — extract birth date as a `Date`
- `getGender()` — extract `"male"` | `"female"`
- `getAge()` — extract age in full years
- `getCitizenship()` — extract `"citizen"` | `"permanent_resident"`
- `luhn()` — low-level Luhn checksum utility
- Dual ESM + CJS build via tsup
- Full TypeScript declarations
- Zero runtime dependencies
