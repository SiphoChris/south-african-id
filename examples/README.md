# Examples

Two self-contained examples showing how to use `@mzantsi/id` in both module systems.

## ESM (`examples/esm/`)

Uses native ES module `import` syntax. Requires Node.js 18+.

```sh
cd examples/esm
npm install
node index.mjs
```

## CJS (`examples/cjs/`)

Uses CommonJS `require()` syntax. Works with any Node.js version that supports the package.

```sh
cd examples/cjs
npm install
node index.cjs
```

## What the examples cover

1. `parse()` — full parse with all fields
2. `isValid()` — quick boolean check
3. `getDateOfBirth()` — extract birth `Date`
4. `getGender()` — `"male"` | `"female"`
5. `getAge()` — age in full years
6. `getCitizenship()` — `"citizen"` | `"permanent_resident"`
7. Error handling — every `InvalidReason` shown
8. Practical patterns — form validation, building a profile, filtering lists
