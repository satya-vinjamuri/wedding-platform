# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multi-component wedding platform built by Lambda Technology Services ("WedDesigner"). It consists of three parts:

- **`wedding-app-builder/`** — Next.js 15 web designer where couples configure their wedding app (primary focus)
- **`app-generator/`** — Express backend (port 4000); being deprecated per `REFACTOR_ROADMAP.md`
- **`flutterapp/`** — Flutter app template; being rebuilt as a multi-tenant runtime app (see roadmap)

## Commands

All commands run from `wedding-app-builder/`:

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build (standalone output for Amplify)
npm run lint     # ESLint (note: lint errors are ignored during builds)
```

Backend (port 4000, from `app-generator/`):
```bash
npm install && node app.js
```

There are no tests in this codebase currently.

## Architecture: The Designer Flow

The web designer is a multi-step form that saves to Firestore. The central data model is `FormState` in `src/types/FormState.ts` — every feature toggle and piece of wedding content lives there. `defaultFormState` shows all valid field names and defaults.

**Save mechanism:** `src/lib/saveFormToFirestore.ts` handles the full save cycle — it uploads `File` objects to Firebase Storage (`weddingApps/{uid}/`), replaces them with download URLs, then calls `setDoc` with `merge: true` on `weddingApps/{uid}`. The Firestore document key is the user's UID, but it is queried by the `websiteSlug` field.

**Slug format:** `{brideName}-{groomName}-{year}-{month}`, all lowercase hyphenated, generated in `src/lib/generateSlug.ts`.

## Architecture: Two Separate "Sites" in One App

There are two distinct rendering contexts that share the same Firestore data:

1. **The mobile-preview designer** (`/app-info` and similar routes): Protected pages where couples use a drag-and-drop builder. The `src/components/mobile/` components render what the mobile app screens will look like. `AppPreviewRenderer.tsx` is the in-browser phone-preview that mirrors the actual Flutter app.

2. **The public wedding website** (`/site/[slug]`): A server-rendered page that fetches the couple's Firestore document by `websiteSlug` and renders it for guests. `WeddingSiteTabs.tsx` drives the tabbed guest experience. Tabs are dynamically shown/hidden based on `enable*` flags in the data.

## Authentication

`AuthContext` (`src/context/AuthContext.tsx`) wraps the app in `layout.tsx` and provides `{ user, loading }` via `useAuth()`. Auth is Firebase-based with two sign-in methods:

- Email/password — requires email verification before login is allowed (`authService.ts:login`)
- Google OAuth — no verification step needed

Wrap any authenticated designer page with `<ProtectedRoute>` (redirects to `/log-in` if unauthenticated). The `/admin` page uses a separate hardcoded password (`"wedadmin"`) for internal ops.

## Firestore Collections

| Collection | Key | Purpose |
|---|---|---|
| `weddingApps` | `{userId}` | Wedding config; queried by `websiteSlug` field |
| `users` | `{userId}` | Profile data (name, email, `updatesOptIn`) |
| `workRequests` | auto-id | Tracks app deployment status (`authStatus` field, type `WorkStatusType`) |
| `contactRequests` | auto-id | Contact/help form submissions |

## RSVP Integration

RSVP is powered by Google Sheets. The flow:
- Guest submits form → Next.js API route `/api/rsvp/submit` → Google Apps Script webhook
- Admin views summary → `/api/rsvp/lookup` and `/api/rsvp/events` parse the Sheet
- Event codes (e.g., `W`=WeddingCeremony, `R`=Reception, `E`=AllEvents) are decoded in `WeddingSiteTabs.tsx`

## Backend (`app-generator/`)

The Express server has two active endpoints:
- `GET /api/wedding/:code` — Fetches `weddingApps` doc by `websiteSlug`; used by the Flutter app
- `POST /send-blast` — Sends FCM push notification to a wedding topic (`wedding_{slug}`)

The `/api/generate-app` (ZIP generation) endpoint was removed. `app-generator/` is on track for full deprecation once the Flutter multi-tenant rebuild is complete (see `REFACTOR_ROADMAP.md`).

## Environment Variables

Required in `wedding-app-builder/.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
ALERT_EMAIL_USERNAME
ALERT_EMAIL_PASSWORD
```

## Deployment

- **Frontend**: AWS Amplify using `buildspec-frontend.yaml`; `next.config.ts` sets `output: "standalone"`
- **Backend**: AWS CodeBuild using `buildspec-backend.yaml`

## Active Refactor

`REFACTOR_ROADMAP.md` documents a major in-flight refactor from per-couple compiled Flutter apps to a single multi-tenant Flutter app reading config from Firestore at runtime. Key implications:
- The `flutterapp/` directory is the old template; a full Flutter rebuild is planned
- The Next.js designer is mostly staying as-is; the planned change is replacing the "Generate App" button with a "Publish" flow
- `app-generator/` is planned for deprecation after the Flutter rebuild is live
