# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pune Global Group — industrial packaging company website. Static site deployed to Firebase Hosting at https://puneglobalgroup.in.

## Commands

```bash
npm run dev          # Next.js dev server on localhost:3000
npm run build        # Generate sitemap + static export to out/
npm run lint         # ESLint with Next.js plugin
```

**Cloud Functions** (in `functions/`):
```bash
cd functions && npm run build    # Compile TypeScript to lib/
firebase deploy --only functions # Deploy to Firebase
```

**Full deploy**: `firebase deploy --only hosting` (or push to `master` for CI/CD auto-deploy via GitHub Actions).

## Architecture

- **Next.js 15 + TypeScript**, `output: 'export'` in `next.config.ts` — pure static HTML, no server
- **No Tailwind** — all styling is inline CSS via `style` props, `<style>` JSX blocks, and CSS custom properties in `globals.css`
- **Color tokens** defined as `const C = { cream, charcoal, ... }` at the top of each page file; canonical values: cream `#FAF7F2`, charcoal `#1C1A17`, parchment `#EDE5D8`, taupe `#7A736D`
- **Typography tokens** as `const F = { display, body, italic }` — Playfair Display (headings), DM Sans (body), Cormorant Garamond (italic accents)
- **Firebase lazy init** — `src/lib/firebase.ts` uses a Proxy pattern so Firebase only initializes in the browser, avoiding SSR prerender errors
- **Auth** — Firebase email/password; `AuthContext` wraps app in `layout.tsx`; `/admin` is protected, `/login` for auth
- **Contact form** → Firestore `contacts` collection → Cloud Function (`functions/src/index.ts`) sends email via Gmail SMTP to 3 recipients

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage — hero, products, infra callout, blog teaser, contact form. Largest file. |
| `src/app/globals.css` | CSS variables, h2 gradient system, grain overlay, animation keyframes |
| `src/components/GlobalNav.tsx` | Floating glassmorphic navbar with mobile hamburger menu |
| `src/lib/pgg-data.ts` | Paper & Board product specs (TypeScript data) |
| `src/lib/pp-data.ts` | PP Packaging product specs |
| `src/lib/firebase.ts` | Lazy Firebase init via Proxy |
| `functions/src/index.ts` | Firestore trigger → email notification on new contact |
| `firebase.json` | Hosting config (`public: "out"`), security headers, Firestore rules |
| `.github/workflows/deploy.yml` | CI/CD: lint → build → deploy on master push; preview on PRs |

## Styling Conventions

- Each page defines its own `C` (colors) and `F` (fonts) constants — these should stay consistent with the canonical palette above
- CSS animations go in `<style>` blocks inside components, using `@keyframes`
- Premium h2 treatment: gradient text via `background-clip: text` with CSS custom properties `--h2-from`, `--h2-via`, `--h2-to`; dark sections use `.section-dark` class to flip to cream/gold variant
- Responsive breakpoints: 960px (2-col → 1-col), 768px (mobile nav, stack layouts), 520px (compact hero)

## Deployment

- **CI/CD**: GitHub Actions on `master` push — lint, build (injects Firebase env vars from GitHub Secrets), deploy to Firebase Hosting
- **Auth**: Google Cloud Workload Identity Federation (OIDC), service account `github-deploy@cryptoprism-io.iam.gserviceaccount.com`
- **Cloud Functions**: deployed separately via `firebase deploy --only functions`; credentials in `functions/.env` (gitignored)
- **Firebase project**: `puneglobalgroup` (project number `709011913442`)

## Firestore Rules

- `contacts/{docId}`: anyone can **create**; only authenticated users can **read/delete**; no updates
- All other paths deny by default

## Image Generation

Scripts in `scripts/` use Gemini API (`imagen-4.0-fast-generate`) for product/facility images. Requires `GEMINI_API_KEY` env var.
