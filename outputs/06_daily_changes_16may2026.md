# Daily Changes Log — 16 May 2026

**Project**: Mylapore Constituency Grievance Portal  
**Build status**: ✅ green — `npm run build` — 1441 modules, 53 kB CSS, 337 kB JS  
**All `.md` documentation files in `/outputs/01–05` are untouched.**

---

## 1. Shared Dialog Primitives (Phase 8 — final)

### New files
- `src/components/ui/Modal.jsx`  
  Accessible portal-based dialog. Features: Esc + backdrop close, focus trap, body-scroll lock, sm / md / lg size variants, optional close button, `aria-modal` + `aria-labelledby` / `aria-describedby`.

- `src/components/ui/ConfirmDialog.jsx`  
  Thin wrapper on `Modal`. Props: `title`, `description`, `confirmLabel`, `cancelLabel`, `tone` (`primary` | `danger`), `loading`.

### Modified files
- `src/components/ui/index.js`  
  Added barrel exports for `Modal` and `ConfirmDialog`.

- `src/pages/GrievanceHome.jsx`  
  Replaced **3 native `window.confirm` calls** with a single state-driven `<ConfirmDialog/>`:
  - Switch category mid-draft → *"Switch category? The details you've entered will be discarded."*
  - Breadcrumb back to issue selection → *"Go back to issue selection? Your details will be discarded."*
  - Start over → *"Start a new grievance? Your current draft will be cleared."*  
  Added `confirm` state, `askConfirm()` and `closeConfirm()` helpers. `<ConfirmDialog/>` rendered at page root.

---

## 2. Real Project Imagery — 5 Surfaces

Replaced abstract red/yellow gradient placeholders with actual project assets.

| File | Change |
|---|---|
| `src/components/Topbar.jsx` | Brand lockup logo → TVK flag PNG (`/f1c0ef41-…png`) |
| `src/components/Footer.jsx` | Footer brand block logo → same TVK flag PNG |
| `src/components/Footer.jsx` | Publisher block → added 48 px circular MLA portrait (`/mla.png`) next to "Published by" |
| `src/pages/LoginPage.jsx` | Mini-header logo → TVK flag PNG |
| `src/pages/RegisterPage.jsx` | Mini-header logo → TVK flag PNG |
| `src/pages/LandingPage.jsx` | Hero converted to 2-col grid (`lg:grid-cols-[1.4fr_1fr]`); right column → 3D TVK flag image (`/9a355bb7-…png`) with soft yellow radial glow |

**Best practices applied to all `<img>` tags:**
- Explicit `width` / `height` attributes (prevents CLS)
- `alt=""` + `aria-hidden="true"` on decorative images
- `loading="lazy"` on below-the-fold images
- `object-cover` / `object-contain` as appropriate

---

## 3. New `/about-tvk` Page

Dedicated party-content page, built to honour `outputs/02_ux_strategy.md` rule **N2**:  
*"Separate party content from service content."*

### New file
`src/pages/AboutTvk.jsx` (~245 lines)

**Page sections (top to bottom):**

1. **Breadcrumb header** — back to portal link.
2. **Disclaimer strip** — *"This page is informational. The grievance portal is a constituency service and operates independently of party affiliation."*
3. **Hero** — Vijay portrait (right col, lg+) + text column:
   - Eyebrow: `Background`
   - Headline: *"About Tamilaga Vettri Kazhagam."*
   - Body: party founding context + CM role + portal neutrality statement
   - CTAs: `File a grievance` (primary) + `Visit tvkparty.com` (external)
4. **Leadership section** — two side-by-side cards:
   - **Joseph Vijay** — Chief Minister, Tamil Nadu (`/login-right.png`)
   - **MLA, Mylapore** — accountable owner of every grievance (`/mla.png`)
5. **Symbol section** — 3D flag image (`/9a355bb7-…png`) with explanation of why it appears in the portal header.
6. **Bottom CTA strip** — *"Ready to file a grievance? Open to every resident of Mylapore."* → `File now`.

### Modified files
- `src/App.jsx` — imported `AboutTvk`; registered public route `/about-tvk` (no auth gate).
- `src/components/Footer.jsx` — existing "About TVK" footer link now resolves to a real page.

---

## 4. Hero Copy Iterations on `/about-tvk`

| Version | Triggered by | Headline / key change |
|---|---|---|
| v1 | Initial build | *"The party behind the Mylapore office."* |
| v2 | User: rewrite hero copy (civic-neutral) | *"About Tamilaga Vettri Kazhagam."* — two-paragraph body separating party context from service neutrality |
| v3 | User: position Vijay as CM candidate | Added **Chief Ministerial candidate** label; leadership card eyebrow updated |
| **v4 (final)** | User correction: Vijay is sitting CM | Full name **Joseph Vijay**, eyebrow `Chief Minister, Tamil Nadu`, hero body updated. Image alt text updated for screen readers. |

---

## 5. Image Visibility Bug Fix

**Symptom**: Hero artwork (Vijay portrait on `/about-tvk`, flag on LandingPage) not rendering in some viewports.

**Root cause**: `-z-10` on the glow `<div>` pushed the stacking context behind the page background when the parent had no explicit `z-index`.

**Fix applied to:**
- `src/pages/AboutTvk.jsx` (Vijay hero portrait)
- `src/pages/LandingPage.jsx` (TVK flag hero artwork)

**Pattern change:**
```
Before: glow at -z-10, image at default z
After:  glow at z-0 pointer-events-none, image at relative z-10
        wrapper gets min-h-[320px] to prevent column collapse during load
```

---

## Files Changed Today — Full List

| File | Type | Summary |
|---|---|---|
| `src/components/ui/Modal.jsx` | **new** | Accessible portal dialog primitive |
| `src/components/ui/ConfirmDialog.jsx` | **new** | Yes/no confirm wrapper on Modal |
| `src/components/ui/index.js` | modified | Export Modal + ConfirmDialog |
| `src/pages/GrievanceHome.jsx` | modified | Replace 3 window.confirm with ConfirmDialog |
| `src/components/Topbar.jsx` | modified | Real TVK flag image |
| `src/components/Footer.jsx` | modified | Real flag + MLA portrait in publisher block |
| `src/pages/LoginPage.jsx` | modified | Real flag in mini-header |
| `src/pages/RegisterPage.jsx` | modified | Real flag in mini-header |
| `src/pages/LandingPage.jsx` | modified | 2-col hero + flag artwork + z-index fix |
| `src/pages/AboutTvk.jsx` | **new** | Full /about-tvk party page |
| `src/App.jsx` | modified | Register /about-tvk route |

---

## What Was NOT Changed

- `outputs/01_ui_audit.md` through `outputs/05_final_ux_review.md` — untouched.
- All backend API contracts (`/portal/services`, `/portal/grievances`, `/portal/auth/*`).
- Service pages (Landing, Login, Register, GrievanceHome, MyGrievances, TrackStatus) contain **zero party content** — N2 compliance maintained.

---

## Suggested Next Steps

1. **Smoke test** — `npm run dev` → click Landing → File grievance (switch category mid-draft to test ConfirmDialog) → Track → My Requests → footer "About TVK".
2. **Commit & push** — run `git add . && git commit` when satisfied.
3. **Optional** — split-screen auth layout (Login/Register with Vijay portrait on the right panel on lg+) — not done today; ask if needed.
