# Mylapore Grievance Portal — Final UX Review

> **Stage:** 05 — Pre-execution QA, validation, release readiness.
> **Inputs:** `outputs/01_ui_audit.md`, `outputs/02_ux_improvement_strategy.md`, `outputs/03_visual_redesign_direction.md`, `outputs/04_component_execution_plan.md`.
> **Stance:** Adversarial. The job of this stage is to *find what the previous stages missed* and to give the team explicit checklists to verify against before shipping.

---

# Final UX Review Summary

The four prior stages produce a coherent, ambitious redesign. The work is *necessary*, but several risks remain:

1. **The redesign is large.** It touches tokens, every primitive, every page, and the wizard's logic. Without sequencing and feature-flagging discipline, this becomes a risky monolith change.
2. **Some user states are still under-specified** — degraded networks, anonymous users, abusive content, language switching mid-flow, retro-active draft recovery across devices.
3. **Trust language has been removed but not replaced** with the proof artefacts required to keep credibility (linked sources, signed pages, public SLAs).
4. **The redesign assumes happy-path connectivity.** Constituency users frequently operate on 2G/3G or offline-first conditions. Loading, retry, and offline UX are under-spelled-out.
5. **Backend contract changes are out of scope per stage 02's anti-goals** — but several UX promises (draft persistence across devices, "what's next" line, live updates) implicitly require backend support that hasn't been negotiated.
6. **Accessibility commitments are present but unverified.** No baseline measurement was taken; without one, "100% AA" remains aspirational.
7. **The redesign visually pulls away from "TVK flag everywhere"** — this is correct for usability, but is also a brand-politics decision. The MLA office must sign off explicitly; failing to do so risks late-stage reversals.
8. **No analytics plan.** Without event tracking, none of the success metrics in stage 02 can be measured.

This stage gives the team checklists to close these gaps before execution begins, during execution, and at release.

---

# Remaining UX Risks

### R1. Draft persistence is only client-side
The plan stores drafts in `localStorage`. A user who starts on phone and continues on desktop loses the draft.

**Mitigation:**
- Phase 1: ship local-only drafts; clearly label *"This draft is on this device only."*
- Phase 2: lift draft persistence to server (tied to user account) once authenticated. Add a "Drafts" tab to `MyGrievances`.

### R2. "What's next" line requires data that may not exist
The new dashboard card depends on a per-ticket "next action" string. Today's backend may not expose it.

**Mitigation:**
- Derive client-side defaults from `status` + simple rules. If `status=pending` → "Under review by MLA office".
- Track gaps and open a backend ticket to add a real `nextAction` field.

### R3. "Updated N minutes ago" creates false freshness
With 30 s polling, "Updated 12 sec ago" may mean "we last asked the server 12 sec ago," not "data changed 12 sec ago."

**Mitigation:**
- Distinguish the two states. Pill copy: *"Checked 12 sec ago — no new updates"* vs *"New update 2 min ago"*.
- Pulse the dot only when there is a real delta.

### R4. Abusive / illegitimate submissions
Grievance portals are spam magnets (test entries, abuse, doxxing in descriptions, irrelevant content).

**Mitigation:**
- Rate limit per phone (server). Show a friendly "You've filed several recently — give us 30 minutes to review them" message on hit.
- Honeypot field + simple language filter for slurs on title/description.
- Reporting/withdrawal action available to user post-submission.

### R5. Language switching mid-flow
Switching from English → Tamil mid-wizard with form data in English can cause confusing label↔value mismatch.

**Mitigation:**
- Switching language preserves form values verbatim.
- Show a one-line note on language change: *"Your entries weren't translated."*
- Confirm before switching if any *system-generated* content (e.g., suggested templates) is dirty.

### R6. Anonymous users
Stage 02 (P2) suggests deferred identity. But certain actions (track, file with photo) need at least a phone for callback.

**Mitigation:**
- Anonymous browsing of categories: allowed.
- Anonymous submission of a *low-priority general feedback*: allowed.
- Anonymous submission of a *ticket-bearing grievance*: blocked; the wizard reaches step 3 and gates with "Confirm your phone to submit."

### R7. Reference ID is too long to recall
Reference IDs are likely 12+ chars (UUIDs or DB ids). Users can't recite them on phone calls.

**Mitigation:**
- Expose a short human-readable ID: e.g., `MYL-2026-04B-1287` (constituency prefix + year + month + sequence).
- Long ID remains for system use; humans see only the short form.

### R8. "Track my last complaint" prominence may surprise
A logged-in user on a *shared phone* may see another household member's grievance under their auth.

**Mitigation:**
- Show the user's name in the topbar at all times.
- After 30 min inactivity, the dashboard requires a quick PIN/biometric re-confirm before showing details.

### R9. Photo upload privacy
Photos may inadvertently include faces of neighbours or vehicles with plates.

**Mitigation:**
- Show a one-line privacy nudge above the upload area: *"Avoid faces and licence plates if possible — we may publish summary photos on the dashboard."*
- Server-side auto-blur of faces and plates before any public display (out of frontend scope but plan now).

### R10. Empty state CTA can mislead
"Most residents start with Streetlight or Garbage" assumes data we may not have.

**Mitigation:**
- Verify a category popularity number exists, or rewrite to category-agnostic copy: *"Pick a category to begin."*

### R11. Resume-draft banner can become noise
A user with multiple aborted drafts may see a banner on every visit.

**Mitigation:**
- Single banner showing the most recent draft only.
- "Dismiss" hides for 24 h.
- After 7 days, the draft is auto-discarded with a final reminder.

### R12. "View another" dropdown in `TrackStatus` assumes few items
Users with 20+ open grievances need search, not a dropdown.

**Mitigation:**
- Switch from dropdown to searchable popover once user has ≥ 5 grievances.

### R13. Wizard regression: kind=`url`/`pdf` flows now have an extra step
Stage 02 forced these into a uniform 3-step shape. The added step (Step 3 "We're sending you to…") is honest but slower.

**Mitigation:**
- Make the resource explanation inline on Step 2 rather than a full third step. Users in `url`/`pdf` flows complete in 2 steps + "Open portal" CTA.

### R14. No "save and finish later" path
Draft persistence is implicit; not a user-initiated action.

**Mitigation:**
- Add an explicit `Save & finish later` ghost button in the wizard's sticky-bottom bar. On click, save + show toast + route to `MyGrievances → Drafts`.

### R15. Confirm dialogs can fatigue
Every category change in the wizard popping a confirm is noisy if the form is barely started.

**Mitigation:**
- Only show the confirm when *substantive* data exists (location set, description ≥ 10 chars, or photo uploaded). Below the threshold, change silently.

---

# Accessibility Risks

### A1. `aria-live` region collision
Multiple components (Toast, banner, OTP timer) declare `aria-live`. Screen readers may double-read or miss.

**Mitigation:** A single shared `LiveRegion` component manages all status announcements; child components push messages into it via a hook.

### A2. Focus return after modal close
Closing a modal must return focus to the trigger. Radix handles this; ad-hoc bottom-sheets may not.

**Mitigation:** All modals/sheets go through the shared `Modal` API. No ad-hoc `<div role="dialog">` outside it.

### A3. Color is not the only signal
Status chip uses colour + dot, but the dot is the same shape across statuses. A monochrome user may not distinguish.

**Mitigation:** Add a status-specific micro-icon inside the chip when colour is unavailable (e.g., a check for resolved, an exclamation for warning) at 12 px.

### A4. Tap-to-dismiss vs tap-to-open conflict
Toast that auto-dismisses can disappear before low-attention users read it.

**Mitigation:** Auto-dismiss at 4 s only for success; warnings and errors require explicit close (with auto-hide at 30 s as a long fallback).

### A5. Tamil screen reader support is uneven
Some screen readers don't pronounce Tamil cleanly even with `lang="ta"`.

**Mitigation:** Test on TalkBack (Android) and NVDA with Vocalizer Tamil voice. Document the supported reader matrix.

### A6. Focus rings on dark backgrounds (CTA banner, error banner)
Primary buttons have a red-tinted focus ring; on a red gradient button it may be invisible.

**Mitigation:** Ring uses `ring-offset-2` with a white offset against gradient — verify visually at AA 3:1 against the button.

### A7. Sticky elements can hide content
Sticky topbar + sticky bottom CTA + bottom tab bar can hide the very thing being submitted (e.g., a "Confirm" checkbox).

**Mitigation:** Page bottom-padding is computed from the sticky-bar heights; scroll position adjusts on focus to keep the focused element in the visible band.

### A8. Keyboard trap risk in bottom sheets
Mobile bottom sheets sometimes don't return scroll/focus correctly when keyboard opens.

**Mitigation:** Use a known library (Radix / Vaul) and explicitly test with the on-screen keyboard open on iOS + Android.

### A9. Tab order across sticky regions
Topbar → main content → bottom tab bar is the intended tab order. Easy to break by source order.

**Mitigation:** Use logical DOM order; rely on CSS for visual positioning only. Add a small `tabindex` audit to CI.

### A10. Text resize / zoom
WCAG 1.4.4 requires 200% text resize without loss. Hero `display-2xl` (56 px) at 200% is 112 px and may break layout.

**Mitigation:** Test all hero compositions at 200% zoom and `font-size: 200%` user-stylesheet.

---

# Responsive Design Risks

### RD1. Bottom tab bar + virtual keyboard
On Android, the soft keyboard can push the bottom tab bar into the viewport, overlapping input.

**Mitigation:** Hide bottom tab bar when an input is focused on mobile (`window.visualViewport` listener). The wizard's sticky bottom CTA replaces it temporarily.

### RD2. iOS safe area
On notched iPhones, the bottom tab bar overlaps the home indicator.

**Mitigation:** `padding-bottom: env(safe-area-inset-bottom)` on the tab bar.

### RD3. Foldables / narrow tablets (320–360 px)
The smallest target widths are easily forgotten. Hero CTAs and chips can wrap awkwardly.

**Mitigation:** Add 320 px as a canonical breakpoint in the test matrix. Ensure no content overflows horizontally at 320 px.

### RD4. Very wide screens (≥ 1440 px)
The 1200 px container produces large empty gutters; cards may feel sparse.

**Mitigation:** Acceptable for marketing; for dashboards consider a max of 1320 px or scaling card columns up to 3 at `xl`. Decide explicitly.

### RD5. Sticky CTA + on-page CTA double-tap risk
Mobile user taps the in-hero CTA, scrolls slightly, and the sticky CTA appears. They may tap again, double-triggering the action.

**Mitigation:** Disable the sticky CTA for 600 ms after the in-hero CTA is tapped; route navigation also de-dupes.

### RD6. `aspect-ratio` images
The MLA hero card uses a portrait image. On `sm`, aspect-ratio shrinks the image to thumb-size. Confirm the design accommodates.

**Mitigation:** Define `aspect-ratio` per breakpoint, not as a global constant.

### RD7. RTL not in scope
Tamil is LTR so no immediate issue, but if a Hindi/Urdu locale is ever added the layout assumptions break.

**Mitigation:** Use logical CSS properties (`padding-inline`, `margin-block`) where painless. Note in the docs.

---

# Interaction Consistency Review

### IC1. Two patterns for "primary action under content"
Wizard uses sticky-bottom CTA. List pages use sticky-top filter pill row + floating sticky CTA. Decide whether mobile **always** has a sticky bottom primary or only in wizards.

**Decision needed:** Pick one. Recommendation: sticky-bottom CTA only inside wizards; list pages use the bottom tab bar's "+ New" item as the primary action.

### IC2. Card click vs button click
Whole-card click and explicit "View" button both navigate. On mobile a tap might miss-fire on the action button area.

**Decision needed:** Explicit interactive areas:
- The card's main content is the navigation target.
- The action footer has hit-stop padding (it does *not* propagate clicks to the card).

### IC3. "Resume draft" vs "Start new"
A returning user with a draft sees a primary CTA labelled `Resume draft`. The user also sees a `Start new` secondary action. These are visually similar.

**Decision needed:** `Resume` is `Button.primary`, `Start new` is `Button.link` styled into a small text link, *not* a secondary button. Eliminates parity.

### IC4. Long press / right click
Today undefined. Should long-pressing a grievance card open a context menu?

**Decision needed:** Out of scope for v1 — explicit. Do not enable long-press menus until product asks.

### IC5. Pull to refresh + sticky filter row
Filter row is sticky to top of list. Pull-to-refresh expects to anchor at the very top.

**Decision needed:** Pull gesture must start above the filter row to count. Document the trigger zone.

### IC6. Form field error timing
Stage 04 says "validate on blur". What about on submit?

**Decision needed:**
- Touched field: validate on blur.
- Submit: validate all fields and scroll focus to the first error.
- After submit attempt: switch to validate-on-change so the user sees errors clear as they fix them.

### IC7. Toast position
Stage 04 says mobile toast sits *above* the bottom tab bar. When the keyboard is open and tab bar is hidden, toast position is undefined.

**Decision needed:** Toast anchors to viewport bottom + 16 px, dynamically computed from `visualViewport.height`.

### IC8. Status chip in dark contexts
Chips are designed for light surfaces. On the future submission-confirm screen (dark hero), chips become illegible.

**Decision needed:** Add a `tone="dark"` variant. Or render chips only on light surfaces and reserve dark surfaces for headline + body only.

---

# Edge Case Review

### E1. Slow / failed photo upload
- **Slow:** show a progress bar inside the photo tile, "Cancel" option visible.
- **Failed:** mark the tile with a red `!` and a "Retry" link. Submission is blocked until retry succeeds or the file is removed.

### E2. GPS denied / unavailable
- Permission denied: show inline message *"Location access not granted. You can drop a pin or type the address instead."*
- Permission granted but no signal: spinner for 8 s, then fallback to map picker.

### E3. OTP not arriving
- Resend cooldown is visible. After 2 resends fail, show *"Still not received? Try WhatsApp instead."* with a tertiary link.
- Telephony failure on the server: a calm error banner explaining the issue and offering an alternative contact.

### E4. User taps "Submit" twice
- Button enters loading state and is disabled until the request resolves.
- Duplicate submission guard on the server is assumed but tracked as a backend ask.

### E5. Offline submission
- Wizard step 3 detects offline state (`navigator.onLine`).
- Offer to *"Queue this submission and send when you're back online."*
- Persistent queue in `localStorage`; auto-flush on online event with a toast *"Your queued grievance was submitted."*.

### E6. Session expiry mid-form
- JWT expires while user is composing.
- On submit, server returns 401.
- Show modal *"Sign in again to submit. We've kept your draft."* with a `Sign in` primary CTA that re-authenticates and returns to the same draft.

### E7. User changes phone number while logged in
- After phone change + OTP re-verify, surface a "You changed your phone. Old grievances are still listed here." note in `MyGrievances`.

### E8. Server returns 5xx
- Show banner *"We can't reach our server right now."* with a `Retry` button. Do not auto-retry more than 3 times.

### E9. Photo > 10 MB after compression
- After client compression, if still > 10 MB, refuse with an explanation: *"The photo is too large even after compression. Try a smaller image."*

### E10. Description with PII / phone numbers
- Soft-warning client-side detection (regex for phone, email): *"You've shared a phone number in your description. Are you sure you want to include it?"*
- Continue is allowed; just an awareness nudge.

### E11. Two browser tabs open, both filing
- Drafts are scoped to a `draftId`. Each new wizard creates a new id; tabs don't collide.
- Last-writer-wins on the dashboard list, which auto-refreshes.

### E12. Very long titles / descriptions
- Title capped at 80 chars; description capped at 1500 chars. Both with visible counters in the field.
- Server validates the same limits.

### E13. Accessibility for users with cognitive load
- Avoid time pressure outside of OTP (which has a clear timer). Forms have no auto-timeouts; drafts auto-save in the background.

### E14. User on a 5+ year-old Android browser
- `display: grid` and `flex` are universal. But `aspect-ratio`, `gap` in flex, `:has()`, `dvh` units, `backdrop-filter` are not all supported.
- Avoid `:has()` and `backdrop-filter` in critical paths. Use fallbacks for `dvh` via `100vh` plus a JS measurement of `visualViewport`.

### E15. Print
- Submission confirmation should be printable (some users print for records).
- A `print-only` stylesheet shows: title, reference id, description, location, timestamps, status; hides the topbar/sidebar/CTAs.

---

# Performance Considerations

### P1. Image asset weight
The current `public/` includes multiple high-resolution PNG/JPG (`auth-bg.jpg`, MLA card, flag at high-res, `vijay-rally.jpg`, etc.).

**Mitigation:**
- Convert all hero / decorative images to AVIF or WebP with PNG fallback.
- Provide multiple sizes via `<picture>` + `srcset`.
- Aggressive `loading="lazy"` for below-fold images; `fetchpriority="high"` for the LCP image.

### P2. Fonts
Inter + Noto Sans Tamil are variable fonts; subset to the characters used.

**Mitigation:**
- Preload only the latin (and Tamil if present) weights actually used above the fold.
- `font-display: swap` to avoid blocking.

### P3. JavaScript bundle
React + Router + Lucide + Radix + Tailwind classes are baseline. Each new dependency (image compression, animation libs) bloats.

**Mitigation:**
- Code-split per route. Marketing route stays under 180 KB gzipped.
- Lazy-load `LocationPicker` (map) and `PhotoUploader` (compression) — not needed on first render.

### P4. Polling cost
30 s polling on a hot dashboard with 1000 active users = 33 RPS baseline. Manageable but plan for SSE/WebSockets in Phase 6.

**Mitigation:** Add `If-None-Match` / etag support so 304 responses are cheap.

### P5. Layout shift from sticky elements appearing on scroll
Sticky CTA appearing can shift content; tab bar appearing on entry can shift content.

**Mitigation:**
- Reserve space for the bottom tab bar in the layout from the start (mobile only).
- Sticky CTA uses `position: fixed`, not `position: sticky`, and never reflows content. Page padding-bottom = `52 px (tab bar) + 64 px (sticky CTA, when present)`.

### P6. Animation cost
Today's animated blobs and marquee run on JS timers / CSS `transform`. Marquee in particular keeps the GPU active even off-screen.

**Mitigation:**
- `content-visibility: auto` on sections; pause animations when not in viewport with `IntersectionObserver`.

### P7. Battery / data
Polling, animations, large images, and Mobile-data users together produce a heavy session.

**Mitigation:** Detect Data Saver (`navigator.connection.saveData`) and:
- Replace LCP image with a CSS gradient.
- Reduce polling to 60 s.
- Skip decorative motion entirely.

---

# UX QA Checklist

A reviewer can run through this before any release.

### Information architecture
- [ ] Every screen has one documented role.
- [ ] Primary CTA is identifiable in < 2 s.
- [ ] No screen has two equally-weighted primary actions.

### Wizard
- [ ] Total steps known before commitment.
- [ ] All branching flows fit the 3-step pattern (or 2-step for url/pdf).
- [ ] Back works at every step.
- [ ] "Save & finish later" works at every step ≥ 2.
- [ ] Discarding requires a confirm when data is substantive.

### Dashboard
- [ ] "What's next" appears on every active card.
- [ ] Closed items are collapsed by default after the first 5.
- [ ] Drafts surface in their own slot (banner + dedicated list).
- [ ] Filtering works on mobile via pill row, on desktop via sidebar.

### Forms
- [ ] All labels are persistent.
- [ ] Required vs optional is shown in English, not asterisks.
- [ ] Inline validation fires on blur after first touch; on change after first submit.
- [ ] Errors are below the field and accompanied by an icon.
- [ ] Submit double-clicks are prevented.

### CTA & buttons
- [ ] Exactly one Primary per screen.
- [ ] Button kinds: Primary / Secondary / Ghost / Destructive / Link only.
- [ ] No bespoke button markup remains.

### Trust
- [ ] No unsourced claims ("Verified MLA" links to ECI; "7-day SLA" links to SLA page; "Resolved %" links to public stats).
- [ ] Zero-value stats are hidden.
- [ ] Publisher / officer / RTI / escalation block present in the footer.

### Confirmation & feedback
- [ ] Submission confirmation reflects user's own words.
- [ ] Reference ID is human-readable and copy-able.
- [ ] Print stylesheet exists for the confirmation page.

---

# Accessibility QA Checklist

Run axe-core or Lighthouse on each route; ensure manual checks for what tools miss.

### Structure
- [ ] One `<h1>` per page.
- [ ] Heading levels do not skip (h1 → h2 → h3 …).
- [ ] Landmarks present: `<header>`, `<nav>`, `<main>`, `<footer>`.
- [ ] Skip-to-content link present and operative.

### Keyboard
- [ ] Every interactive element reachable by Tab.
- [ ] Tab order is logical top-to-bottom, left-to-right.
- [ ] No keyboard traps (modal, dropdown, bottom sheet).
- [ ] `Escape` closes overlays.
- [ ] Focus returns to trigger on close.
- [ ] Visible focus ring on every focusable element.

### Colour & contrast
- [ ] Body text contrast ≥ 4.5:1 against background.
- [ ] Large text (≥ 18 px or 14 px bold) ≥ 3:1.
- [ ] Status indicated by colour *and* shape/text.
- [ ] No yellow-on-white text.

### Forms
- [ ] Every input has an associated `<label>` (not placeholder).
- [ ] `aria-invalid` toggles on error.
- [ ] `aria-describedby` links inputs to help / error text.
- [ ] Inputs at ≥ 44 px on touch devices.

### Motion
- [ ] `prefers-reduced-motion` disables all non-essential motion.
- [ ] No content flashes more than 3× per second.

### Media
- [ ] Decorative images: `alt=""` + `aria-hidden="true"`.
- [ ] Informative images: meaningful `alt`.
- [ ] Icons inside interactive elements: `aria-hidden="true"` if a text label is present, otherwise `aria-label` on the button.

### Language
- [ ] `<html lang="en">` set; Tamil regions wrapped in `lang="ta"`.
- [ ] Language switcher available from every page.

### Announcements
- [ ] Toasts inside `aria-live="polite"`.
- [ ] Form errors announced on submit.
- [ ] Page navigation announced via title change.

---

# Mobile Testing Checklist

Run on real devices when possible. Min matrix: iOS Safari (current + 2 prior), Chrome on Android (current), Samsung Internet (current).

### Viewports
- [ ] 320 px (small Android)
- [ ] 360 px (typical Android)
- [ ] 390 px (iPhone 13/14/15)
- [ ] 412 px (Pixel)
- [ ] 768 px (iPad portrait)

### Layout
- [ ] No horizontal scroll on any page at any viewport.
- [ ] Sticky elements respect safe-area-inset.
- [ ] Tap targets ≥ 44 × 44 px.

### Keyboard behaviour
- [ ] On-screen keyboard does not hide the focused input.
- [ ] Submit button is reachable above keyboard or via sticky CTA that pushes up.
- [ ] Bottom tab bar hides when input is focused.

### Gestures
- [ ] Pull-to-refresh works on `MyGrievances`, `TrackStatus`.
- [ ] Bottom-sheet swipe-down closes.
- [ ] Browser back works at every step without breaking state.

### Photo
- [ ] Camera capture works on iOS Safari.
- [ ] Camera capture works on Chrome Android.
- [ ] Photo compression reduces to < 1.5 MB.
- [ ] Failed upload shows retry inline.

### GPS
- [ ] Permission prompt appears once.
- [ ] Denied state has an inline message and fallback.
- [ ] Slow network respects 8 s timeout.

### Network
- [ ] Throttle to "Slow 3G" — site is usable; LCP < 4 s.
- [ ] Offline state shows a calm banner; wizard offers queue mode.
- [ ] Recovery from offline → online flushes queued submissions.

### Battery / data
- [ ] Data Saver mode reduces polling and skips motion.

---

# User Testing Checklist

Run 5 unmoderated remote sessions, then 5 moderated. Targets: first-time mobile users in the Mylapore constituency demographic; mix of ages and tech-comfort.

### Tasks (each session)
1. **Discover.** "You want to report a streetlight that's been off for three days. Find where to do that on this site."
2. **File.** "File the complaint. Use whatever details you'd normally include."
3. **Track.** "Three days later, you want to check the status. Show how you'd do that."
4. **Recover.** "Halfway through filing a different complaint about garbage, you get distracted and close the tab. Come back and finish it."
5. **Doubt.** "You're not sure who'll see your complaint. Find out."

### Measurements per task
- [ ] Time to complete.
- [ ] Number of dead-ends (back-clicks > 2 in a row, refreshes, navigation away).
- [ ] Self-reported confidence on a 1–5 scale.
- [ ] Verbal moments of confusion (count + quotes).
- [ ] Did the user produce a high-quality submission (location, description ≥ 30 chars, photo if applicable)?

### Post-task interview
- [ ] *"What did you expect to happen next?"* at three predefined points.
- [ ] *"Whose responsibility is this portal?"* (tests trust framing).
- [ ] *"Is there anything you'd be afraid to file here?"* (tests safety perception).
- [ ] *"How would you tell a neighbour to use this?"* (tests mental model).

### Success thresholds for soft-launch
- 4/5 users complete the File task without help.
- Median File-task time ≤ 90 s on mobile.
- 4/5 users complete the Recover task.
- 0/5 users say *"I'm not sure if my complaint was received."* after submission.

---

# Release Readiness Checklist

A go/no-go list for production deploy.

### Engineering
- [ ] All Phase 0–4 tasks (stage 04) merged behind feature flags.
- [ ] Tokens are the only source of colour, radius, shadow, spacing, type.
- [ ] No `tvk-cta-*`, no `tvk-nav`, no `tvk-bg`, no `tvk-blob` in JSX or CSS in `main`.
- [ ] Bundle size budget met (≤ 180 KB gzipped marketing route).
- [ ] LCP < 2.0 s on Moto-G-class device on Slow 4G.
- [ ] CLS < 0.05 on landing, < 0.10 on dashboard.

### Accessibility
- [ ] axe-core CI is green on `/grievance`, `/track`, `/my-grievances`, `/login`, `/register`.
- [ ] Manual keyboard pass complete on all critical routes.
- [ ] Screen reader smoke test (NVDA + TalkBack) on file-grievance + track flows.

### Content
- [ ] All copy reviewed for clarity, neutrality, Tamil parity.
- [ ] No promise without a linked proof artefact.
- [ ] Footer carries publisher, officer, RTI, accessibility, privacy, terms, contact.

### Resilience
- [ ] Offline queue tested.
- [ ] Session expiry mid-flow tested.
- [ ] Duplicate-submission guard tested.
- [ ] Rate-limit messaging tested.
- [ ] Server 5xx fallback banner tested.

### Privacy / trust
- [ ] Photo privacy nudge present.
- [ ] PII soft-warning present in description.
- [ ] Inactivity re-confirm tested on shared device scenario.

### Monitoring
- [ ] Frontend telemetry events fire for: hero CTA click, wizard step transitions, submission, error toasts.
- [ ] Performance metrics (LCP, INP, CLS) reported.
- [ ] Console error sink in place (Sentry or equivalent).

### Rollback
- [ ] Feature flags can disable the new wizard / new dashboard in < 5 min.
- [ ] Previous static asset URLs preserved during transition.
- [ ] DB migrations (if any) are forward + backward compatible.

### Communications
- [ ] MLA office trained on new dashboard fields ("what's next" copy, escalations).
- [ ] User-facing changelog drafted.
- [ ] Support channel (helpline, WhatsApp) briefed on new flows.

---

# Final Recommendations

### 1. Treat the redesign as a *phased* shipment, not a relaunch
Land Phase 0 (foundations) on top of the current product. Subsequent phases ship behind flags. Avoid a single "big bang" release; it concentrates risk.

### 2. Establish a baseline now
Before any code changes, capture:
- 5 user sessions on the *current* product (same 5 tasks above).
- axe-core scan results.
- Lighthouse performance numbers.
- Server analytics on funnel (registration → first submission → second submission).

Without a baseline, "we improved usability" cannot be defended.

### 3. Get sign-off on brand recession
The redesign explicitly tones down the TVK visual presence on the *service* surface. This is a political decision as much as a design one. Have it on record from the MLA's office before Phase 0 ships.

### 4. Negotiate the backend asks now
- `nextAction` string per ticket.
- Short human-readable reference IDs.
- Server-side rate limiting + duplicate-submission guard.
- Server-side photo auto-blur for faces / plates.
- Server-side draft persistence (Phase 2).
- Etag support on `/portal/grievances`.

If the backend can't commit, scope these features down explicitly.

### 5. Don't ship without analytics
Wire the `track(event, props)` hook (stage 04 handoff notes) before Phase 0. Even no-op telemetry is a contract; if events aren't fired now, they won't be fired later.

### 6. Re-test the wizard with real categories
The 3-step pattern works in design. Validate it against the *actual* most-popular categories (e.g., what fields does "Streetlight not working" need?). Edge categories may need a 4-step variant; design for that gracefully.

### 7. Plan a 2-week post-launch listening period
Pre-commit to a P0 bugfix and copy-tweak window. Civic users won't open support tickets; they'll just leave. Active monitoring and outbound interviews are required during the first two weeks.

### 8. Decide what to do with the existing `TvkFlagDecor`
It is currently sprinkled across 9 sections. The new direction uses it once. Either:
- Delete from all sections except the Landing hero, or
- Keep the component but gate its use behind a `theme="brand-forward"` flag for special moments (anniversaries, election season).

Make the decision in writing.

### 9. Don't ship Tamil parity as "translation"
Tamil isn't just translated English. The platform is for Tamil-first users; engage a Tamil copywriter who can write Tamil that doesn't feel like a translation of English. The interface should read native in Tamil.

### 10. Accept that the redesign is not the finish line
The four stages so far are about removing visible problems. Once shipped, the next stage is about *measurable* problems — abandonment by category, time-to-resolution by issue type, satisfaction by ward. Plan for stages 06+ that are data-driven rather than design-driven.

---

## A note on confidence

The redesign plan is sound. The audit found real problems. The strategy and visual direction respond to them. The execution plan is implementation-ready.

What separates a useful redesign from a beautiful redesign is **what's checked before shipping**, not what's drawn. Use the checklists above as standing orders. Anything that fails a checklist either gets fixed before release or is explicitly waived with documentation.

The product can succeed at its real job — letting Mylapore residents get a streetlight fixed without anxiety — if the team treats this review as a release gate, not a wish list.

---

*End of audit-to-release lifecycle (stages 01 – 05). Future stages should be data-driven: measure, learn, iterate.*
