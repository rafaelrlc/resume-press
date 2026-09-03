# Resume Press

A lightweight, completely free résumé builder that runs entirely in your browser. Fill in a form, watch a real PDF compose itself, download it — no account, no server, no database. Everything is saved to your browser's local storage.

Built as a modern, [JSON Resume](https://jsonresume.org)-compatible take on [resumake.io](https://resumake.io).

## Features

- **100% local** — no sign-up, no backend, no tracking. Your data never leaves your machine.
- **Free, no limits** — every template, every export, forever.
- **JSON Resume in, JSON Resume out** — import any `resume.json` that follows the [standard schema](https://jsonresume.org/schema) and export back to it, validated against the project's own [`@jsonresume/schema`](https://www.npmjs.com/package/@jsonresume/schema) package.
- **ATS-friendly output** — clean, single-column, text-based PDFs that parse correctly in applicant tracking systems, not image-based or heavily graphical layouts.
- **Three print templates** — Ledger (a classic LaTeX-style CV), Console (sidebar layout), and Rule (dense, dated-gutter grid).
- **Custom PDF section headers** — rename "Experience" to whatever you like for the printed page, independent of the underlying JSON data.
- **Multiple résumés**, saved side by side, switchable from one workspace.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
