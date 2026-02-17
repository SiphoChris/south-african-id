# Contributing to @mzantsi/id

Thanks for your interest in contributing!

## Setup

```sh
git clone https://github.com/SiphoChris/south-african-id.git
cd id
pnpm install
```

## Development

```sh
pnpm dev          # rebuild on file change
pnpm test:watch   # run tests in watch mode
pnpm typecheck    # type-check without emitting
```

## Submitting changes

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-feature`
3. Make your changes and add/update tests
4. Ensure `pnpm test` and `pnpm build` both pass
5. Open a pull request with a clear description

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add getZodiacSign helper
fix: correct age calculation near birthday boundary
docs: add CDN usage example
chore: bump vitest to v2.1
```

## Reporting bugs

Open an issue at https://github.com/SiphoChris/south-african-id/issues and include:
- The ID number (or a synthetic one that reproduces the bug)
- Expected vs actual output
- Your Node.js and package version
