# Wedding Platform — Refactor Roadmap
**From: Per-Couple App Generation → Multi-Tenant Dynamic App**

---

## The Problem We're Solving

Apple rejected the "generate a unique app per couple" model because it creates thousands of near-identical apps targeting tiny audiences. The fix: **one app on the App Store, infinite weddings inside it.**

The core architectural shift is:
- **Before:** Data injected at compile time (`{{BRIDE_NAME}}` replaced by code generator → ZIP download)
- **After:** Data fetched at runtime from Firestore (one app reads any couple's config dynamically)

---

## Current State Snapshot

| Layer | Status | What needs to change |
|---|---|---|
| **Flutter App** | Template-only, placeholder-driven | Full rebuild as a data-driven multi-tenant app |
| **Next.js Designer** | ✅ Saves to Firestore, mostly good | Remove ZIP generation, add Publish/QR code flow |
| **Express App Generator** | Generates custom ZIPs | Deprecate entirely |
| **Firestore Schema** | ✅ Already well-structured | Minor additions for multi-tenancy |

---

## New Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Flutter App (ONE app, many weddings)           │
│                                                             │
│  Entry Screen → Find Wedding (by code/slug)                 │
│      ↓                                                      │
│  Firestore fetch → Load WeddingConfig                       │
│      ↓                                                      │
│  Auth Gate → Optional password check                        │
│      ↓                                                      │
│  Dynamic Home → Screens/Theme driven by WeddingConfig       │
└───────────────────────┬─────────────────────────────────────┘
                        │ reads/writes
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firestore Database                       │
│   weddingApps/{slug}  ← source of truth for all weddings   │
└───────────────────────┬─────────────────────────────────────┘
                        │ reads/writes
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           Next.js Web Designer (mostly unchanged)           │
│   - Couples design their wedding → saves to Firestore       │
│   - "Publish" button replaces "Generate App"                │
│   - QR code generated for guest sharing                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1 — Flutter: Foundation & Data Layer
**Goal:** Wire up Firebase and build the data models that replace all placeholders.
**Estimated effort:** 3–4 days

### 1.1 Add Firebase to Flutter
- Add `firebase_core`, `cloud_firestore`, `firebase_auth` to `pubspec.yaml`
- Initialize Firebase in `main.dart`
- Remove `google_fonts`, `shared_preferences`, etc. that are no longer needed at startup (keep for session caching)

### 1.2 Create Data Models
Build typed Dart models that mirror the Firestore schema:

```dart
WeddingConfig
  ├── brideName, groomName, weddingDate, weddingLocation, appName
  ├── selectedColor, selectedFont, selectedFontColor
  ├── backgroundImageUrl
  ├── enableRSVP, rsvpSheetUrl, rsvpDeadline
  ├── enableGallery, galleryDriveUrl
  ├── enableItinerary, enableWeddingParty, enableRegistry
  ├── enableOurStory, enableTravel, enableSettings
  ├── enablePassword, appPassword
  ├── weddingEvents[], brideEvents[], groomEvents[]
  ├── weddingParty { bride[], groom[] }
  ├── faqs[], contactInfo[], registries[]
  └── websiteSlug (used as lookup key)

Event { title, date, time, location, dresscode, description }
PartyMember { name, role, relation, imageUrl }
FamilyMember { name, description, imageUrl }
FAQ { question, answer }
Registry { label, url }
```

### 1.3 Build WeddingDataService
Single service class that:
- Fetches a `weddingApps` Firestore document by `websiteSlug`
- Caches the result in memory for the session
- Exposes a `WeddingConfig` stream or Future
- Handles loading/error states

### 1.4 Add State Management
Add `provider` package. Create `WeddingConfigProvider` so all screens can read config without passing it manually.

---

## Phase 2 — Flutter: Wedding Entry Flow
**Goal:** Replace the hardcoded single-wedding experience with a code-based multi-wedding entry screen.
**Estimated effort:** 2 days

### 2.1 New Entry Screen
The app's first screen (instead of `AuthGate`):

```
┌─────────────────────────┐
│   💍 WeddingApp         │
│                         │
│  Enter your wedding     │
│  code to get started:   │
│                         │
│  [ satya-and-priya    ] │
│                         │
│       [ Find Wedding ]  │
│                         │
│  (Or scan a QR code)    │
└─────────────────────────┘
```

- Stores last-used wedding code in `SharedPreferences` for auto-load on relaunch
- Fetches Firestore doc, shows loading + error states cleanly
- Deep link support: `weddingapp://satya-and-priya` opens directly to correct wedding

### 2.2 Updated Auth Flow
After finding the wedding, the existing password protection logic runs — but now reads `appPassword` and `enablePassword` from `WeddingConfig` instead of `{{APP_PASSWORD}}` placeholder.

---

## Phase 3 — Flutter: Dynamic Theming
**Goal:** Apply each couple's colors and fonts at runtime — no compile-time injection needed.
**Estimated effort:** 1–2 days

### 3.1 Runtime ThemeData
Build a `WeddingTheme` class that takes `selectedColor` and `selectedFont` from `WeddingConfig` and returns a `ThemeData` object. Wrap the whole app in it.

```dart
ThemeData buildTheme(WeddingConfig config) {
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Color(config.selectedColorHex)),
    textTheme: config.selectedFont == 'Serif'
      ? GoogleFonts.playfairDisplayTextTheme()
      : GoogleFonts.latoTextTheme(),
    ...
  );
}
```

### 3.2 Dynamic Background Images
Home screen background image loaded from Firestore `backgroundImageUrl` via `CachedNetworkImage` instead of a bundled asset.

---

## Phase 4 — Flutter: Rebuild All Screens (Data-Driven)
**Goal:** Replace every placeholder/template screen with a screen that reads from `WeddingConfig`.
**Estimated effort:** 4–5 days

### Screen-by-Screen Plan

| Screen | Current state | New state |
|---|---|---|
| **Home** | `{{BRIDE_NAME}}`, `{{WEDDING_DATE}}` hardcoded | Reads from `WeddingConfig` |
| **Itinerary** | Empty template, marker comments | Renders `weddingEvents[]`, `brideEvents[]`, `groomEvents[]` |
| **Gallery** | `{{DRIVE_FOLDER_ID}}` placeholder | Reads `galleryDriveUrl` from config |
| **Wedding Party** | Empty template | Renders `weddingParty.bride[]` + `weddingParty.groom[]` |
| **Our Family** | Empty template | Renders family members from config |
| **RSVP** | `{{SHEET_ID}}` placeholder | Reads `rsvpSheetUrl` from config |
| **Registry** | Empty template | Renders `registries[]` from config |
| **Settings** | Hardcoded FAQ + contacts | Reads `faqs[]` + `contactInfo[]` from config |

### 4.1 Dynamic Navigation
The bottom nav bar only shows tabs for enabled screens:

```dart
// Only show tabs the couple turned on
if (config.enableGallery) tabs.add(GalleryTab());
if (config.enableItinerary) tabs.add(ItineraryTab());
if (config.enableWeddingParty) tabs.add(WeddingPartyTab());
// etc.
```

---

## Phase 5 — Flutter: User Roles
**Goal:** Support guests, couples, and admins in the same app.
**Estimated effort:** 2 days

### 5.1 Guest Mode (default)
- Enter wedding code → view wedding → RSVP
- Read-only access

### 5.2 Couple / Admin Mode
- Firebase Auth login within the app
- Couple can edit their own wedding config directly in the app
- Admin can send push notifications from the app

### 5.3 Push Notifications
- Add `firebase_messaging` + `flutter_local_notifications`
- Subscribe guests to a wedding topic on entry (e.g., `wedding_satya-and-priya`)
- Couple/admin can send blasts from the app or web designer

---

## Phase 6 — Web Designer: Remove ZIP Generation
**Goal:** Clean up the Next.js designer now that app generation is gone.
**Estimated effort:** 1 day

### 6.1 Replace "Generate App" with "Publish"
- Remove the generate/download ZIP button and all associated UI
- Add a **Publish** button that sets `isPublished: true` on the Firestore doc
- Add a **Unpublish** option for couples who want to hide their wedding temporarily

### 6.2 Add QR Code + Sharing
- After publishing, show a QR code encoding the wedding slug
- "Share link" button that copies `https://weddingapp.com/satya-and-priya`
- Works for both web browser access and deep-linking into the mobile app

### 6.3 Live App Preview
- Add a mobile preview panel in the designer
- Shows what guests will actually see in real time as the couple configures

---

## Phase 7 — Backend: Deprecate App Generator
**Goal:** Decommission the Express app-generator service.
**Estimated effort:** 0.5 days

### 7.1 Keep What's Useful
- `/api/wedding/:code` endpoint — keep this, it's used by the public web site
- `/send-blast` push notification endpoint — keep and possibly improve
- Remove `/api/generate-app` entirely

### 7.2 Clean Up Infrastructure
- Remove `app-generator` from CI/CD pipelines in `buildspec-backend.yaml`
- Archive or delete the `flutterapp` template directory (it's no longer cloned)

---

## Phase 8 — Flutter Web Build
**Goal:** The same Flutter codebase serves both the mobile app and a web browser experience.
**Estimated effort:** 1–2 days

### 8.1 Flutter Web Support
- Flutter already has web support scaffolded (`web/` directory exists)
- Ensure all screens are responsive for desktop/tablet browser
- Handle web-specific navigation (URL routing with `go_router`)
- Deploy Flutter web build to a CDN/Vercel alongside the Next.js designer

### 8.2 Routing Strategy
```
weddingapp.com/                    → Designer (Next.js)
weddingapp.com/view/[slug]         → Flutter Web (guest view)
weddingapp.com/view/[slug]/admin   → Flutter Web (couple/admin view)
```

---

## Recommended Execution Order

| # | Phase | Why this order |
|---|---|---|
| **1** | Phase 1 — Data Layer | Everything else depends on this |
| **2** | Phase 2 — Entry Screen | Gets the multi-tenant shell working |
| **3** | Phase 3 — Dynamic Theming | Quick win, makes it feel alive |
| **4** | Phase 4 — Rebuild Screens | The bulk of the Flutter work |
| **5** | Phase 6 — Web Designer Cleanup | Parallel with Flutter work if possible |
| **6** | Phase 5 — User Roles | Builds on a working app |
| **7** | Phase 8 — Flutter Web | Polish phase |
| **8** | Phase 7 — Deprecate Backend | Do last once Flutter app is live |

---

## Key Design Decisions

**Why Firestore (not a custom REST API)?**
The web designer already writes to Firestore. The Flutter app reading from the same Firestore collection means zero extra backend work for the core data flow.

**Why Provider (not Bloc/Riverpod)?**
The app is relatively simple in terms of state — one loaded config, a few async fetches. Provider keeps it lightweight. Can migrate to Riverpod later if complexity grows.

**Why keep Google Sheets for RSVP (for now)?**
The existing RSVP infrastructure works and couples are already using it. This can be migrated to Firestore in a future iteration — it's not blocking the multi-tenant refactor.

**Why Flutter Web instead of a separate web app?**
You already have the Flutter screens built (or being rebuilt). Maintaining one codebase for both mobile and web is significantly less work than building and syncing two separate apps.

---

## What We're NOT Changing (Yet)

- The Next.js designer UI — it's already solid
- The Firestore schema — it already matches what we need
- Google Drive photo integration — still works fine dynamically
- Google Sheets RSVP — still works fine dynamically
- Firebase Auth for couple accounts — already set up on the web side

---

## Files That Will Change Most

**Flutter (high impact — major rewrites):**
- `lib/main.dart` — new entry screen, Firebase init, Provider setup
- `lib/common/layout/layout.dart` — dynamic navigation
- `lib/itinerary.dart`, `our_family.dart`, `wedding_party.dart`, `registry.dart`, `settings.dart` — all become data-driven

**Flutter (new files to create):**
- `lib/services/wedding_data_service.dart`
- `lib/models/wedding_config.dart` (and related models)
- `lib/providers/wedding_config_provider.dart`
- `lib/screens/entry_screen.dart`
- `lib/theme/wedding_theme.dart`

**Next.js (low impact — targeted changes):**
- Remove generate/download ZIP flow
- Add publish button + QR code component

**Backend (deprecation):**
- `app-generator/` — archive/remove
