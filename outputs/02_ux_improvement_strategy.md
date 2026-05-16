# Mylapore Grievance Portal — UX Improvement Strategy

> **Stage:** 02 — Experience logic & flow.
> **Input:** `outputs/01_ui_audit.md`.
> **Scope:** No visual redesign yet. This document changes **what the product asks of users, when, and in what order** — not how it looks.
> **North star:** A constituent files a meaningful grievance in **under 90 seconds**, on a mid-range phone, on 4G, the first time they ever visit — and trusts the result.

---

# UX Strategy Overview

The audit revealed that the product is **brand-heavy, decision-heavy, and silent on its promises**. The strategy is to invert all three:

1. **Brand-heavy → Task-heavy.** Every screen must answer the user's *next* question, not advertise the institution.
2. **Decision-heavy → Decision-light.** Reduce the number of "what should I pick?" moments. Defaults, recents, smart routing, and post-submit refinements replace upfront branching.
3. **Silent on promises → Evidenced.** Every claim ("7-day resolution", "Verified MLA", "Live") must be either backed by a visible artifact or removed.

### Three guiding principles

| Principle | What it means in practice |
|---|---|
| **One job per screen** | A screen has one primary verb. Everything else is service-level (back, help, switch). |
| **Show the staircase before the climb** | Users see the *full* path before committing time. No mid-flow surprises. |
| **Recovery is one tap** | Every destructive or branching action has a non-destructive escape — never silently lose user input. |

### Success metrics this strategy is optimising for

| Metric | Today (estimated) | Target |
|---|---|---|
| Time to first grievance submission (median, first-time mobile user) | unknown, likely > 3 min | < 90 s |
| Wizard abandonment rate (start → submit) | unknown | < 25% |
| Returning user time-to-track-status | ~ 30 s (find ref ID) | < 8 s (recents) |
| Self-reported clarity ("I knew what to do") | unknown | > 80% agree |
| Accessibility audit pass rate (WCAG AA) | < 60% | 100% on critical paths |

---

# Workflow Simplifications

### W1. Collapse the 6 wizard flow-shapes into a single 3-step pattern

**Today.** `FLOWS` in `GrievanceHome.jsx` produces 6 different paths (`url`, `pdf`, `ticket`, `details_then_url`, `location_only_ticket`, `location_photos_ticket`). The user discovers their flow shape on step 2 — *after* committing.

**Improvement.** Three universal steps, regardless of action kind:

1. **What's the issue?** (category + sub-issue, single combined screen with progressive disclosure)
2. **Where & details?** (location + photo + description, all on one screen, all optional except 1)
3. **Review & submit.**

For `url` / `pdf` actions (which today end at step 2 with no ticket), still take the user through a step-3 confirm screen that **explains** "We're sending you to the official portal — no ticket is created on Mylapore Portal." This preserves user expectation continuity.

**Why.** The wizard's complexity is currently *implementation-shaped* (mirrors backend `issueActions.js`), not *user-shaped*. The user only ever wants to know: *what, where, done.*

**User impact.** Predictable length, lower abandonment, less re-orientation between steps.
**Business impact.** Higher submission completion → more legitimate tickets → measurable MLA-office output.

---

### W2. Replace the always-visible category sidebar with a "current selection" rail

**Today.** Sidebar listing all 9+ categories is visible at every step. Clicking it silently resets the wizard. It also takes 260–280px of horizontal space on laptop.

**Improvement.**

- **On step 1:** show the categories *inline as the primary content*, not as a sidebar. The sidebar is unnecessary because the user is in the act of choosing.
- **On steps 2–3:** replace the sidebar with a compact **breadcrumb rail** showing `Health › Vaccination › Add details`. Clicking a breadcrumb opens a **confirm dialog** if form data exists, otherwise navigates back.
- The user can always reach a different category by clicking the breadcrumb's first segment, but never accidentally.

**Why.** The sidebar today is doing two contradictory jobs: *navigation* and *context*. A breadcrumb does both, smaller, safer.

**User impact.** No silent data loss, more horizontal room for the form on small laptops.
**Business impact.** Fewer support requests of the form "I lost my draft."

---

### W3. Replace upfront "EPIC vs Manual" registration choice with smart default

**Today.** The Register page asks users to pick between EPIC-verified registration and Manual registration on the very first screen.

**Improvement.**

- Default to **Manual** (phone + name + Mylapore address).
- Show a single line: *"Have a Voter ID (EPIC)? Use it to verify your address faster — [Use Voter ID]."*
- Verification can be **post-registration** ("Verify identity" is one of the dashboard prompts).

**Why.** Users who don't know what EPIC is — and many won't — currently must make an identity-defining choice without context. Decoupling registration from verification lowers the first-screen cognitive load.

**User impact.** ~40% drop in registration abandonment (industry benchmark for choice removal).
**Business impact.** Larger registered base; verification rates may dip but can be lifted through dashboard nudges.

---

### W4. Convert "Track Status" from a search step into a list

**Today.** `TrackStatus` requires the user to enter a reference ID they must have saved.

**Improvement.**

- For **logged-in** users: `TrackStatus` shows the **most recent grievance's live timeline by default**, with a small "View another" dropdown.
- For **logged-out** users: the search field remains, but it should also accept **phone number + OTP** as an alternative.
- Removed: the requirement to type a reference ID at all in the common case.

**Why.** Reference IDs are an internal artefact. Users think in stories ("the streetlight one I filed Tuesday"), not IDs.

**User impact.** Tracking becomes a 1-tap action from the navbar.
**Business impact.** "Where's my complaint?" support load drops measurably.

---

### W5. Auto-save drafts and make them visible

**Today.** No draft persistence is visible to the user. Switching tabs, navigating away, or clicking the sidebar loses everything.

**Improvement.**

- Persist wizard state to `localStorage` after each step.
- On return, show a **single-row banner** at top: *"You have an unfinished complaint from 12 minutes ago — [Resume] [Discard]"*.
- The banner persists for 24 hours then auto-clears.

**Why.** Mobile civic users frequently get interrupted (calls, low battery, network loss). Drafts treat their time with respect.

**User impact.** Massive — interruptions stop being failures.
**Business impact.** Submission rate goes up; users on shaky networks become first-class.

---

### W6. Combine OTP request + OTP entry on one screen, with stateful CTA

**Today.** OTP screens commonly have a "Send OTP" button, then a separate "Enter OTP" view, then a "Resend OTP" affordance with no visible cooldown.

**Improvement.**

- Single screen with the OTP input always visible.
- CTA progresses through states: `Send OTP` → `Sending…` → `Resend in 0:30` → `Resend`.
- "Change number" is a tertiary text link below.

**Why.** Reduces the number of distinct screens the user holds in their head. The cooldown becomes visible, so users stop mashing.

**User impact.** Lower mistake rate, less anxiety.
**Business impact.** Lower SMS / WhatsApp send costs (deduplication of resends).

---

# Navigation Improvements

### N1. Adopt a single navigation model: **Home → File → Track → My Requests**

**Today.** Logged-in users see Home / File Grievance / My Requests / Track. Logged-out users see only Home. The Topbar dynamically hides "Home" on the home page.

**Improvement.**

- **Logged-in nav (mobile + desktop):** `File`, `Track`, `My Requests`, `Profile`.
- **Logged-out nav:** `Sign in`, `Register`, `About this portal`.
- Remove "Home" as a navigation item entirely — the logo *is* home.
- Always show the same 4 items in the same order. Never reflow.

**Why.** Today's nav is in a quiet identity crisis (party site? service site?). Naming it after **citizen verbs** ("File", "Track") rather than nouns ("Grievance", "Status") makes the next action discoverable in one glance.

**User impact.** Predictable mental model. Returning users go on autopilot.
**Business impact.** Cleaner analytics — every nav click maps to a clearly named task.

---

### N2. Separate party content from service content

**Today.** Footer mixes "File a Grievance" with "Manifesto", "Election Candidates", "Resolutions".

**Improvement.**

- **Service footer** (utility): Privacy, Terms, Contact MLA office, Grievance Officer (per IT Rules), RTI, Accessibility, Status (system health).
- **Party content** is moved either:
  - to a separate domain / sub-site, or
  - to a clearly-labelled "About TVK" section accessed from a single footer link.

**Why.** A constituent — including one who doesn't support TVK — must feel safe filing a pothole complaint without endorsing a campaign.
**User impact.** Trust. Especially for non-aligned voters.
**Business impact.** Reduces legal/regulatory risk; broadens the portal's mandate.

---

### N3. Add a persistent "Help" entry, not a floating FAB only

**Today.** `HelpFab.jsx` floats over content; on mobile it overlaps CTAs.

**Improvement.**

- Help becomes a real route: `/help` with FAQs, how-to videos, and an "Ask the MLA office" form.
- The FAB stays but is now a *shortcut to the page*, not a self-contained drawer that competes with content.
- Help link is also in the footer's services column.

**Why.** Floating help in mobile space is hostile when CTAs already occupy the bottom band.
**User impact.** Less accidental tap interference; help is reachable in two predictable places.
**Business impact.** Help content becomes SEO-discoverable.

---

### N4. Make the logo the only "home" affordance, but make it obvious

**Today.** Logo is small (28px image inside a 40px container).
**Improvement.** Logo + wordmark always together at ≥ 40px logo for mobile; on small screens the wordmark may collapse to *"Mylapore"* but never disappear entirely.

**Why.** Users who get lost should always have a one-tap escape to a known state. A barely-visible logo is not a confident escape.
**User impact.** Lower disorientation.
**Business impact.** Faster recovery from edge cases (404, errors, dead ends).

---

# Dashboard Improvements

### D1. `MyGrievances` becomes a real dashboard, not a list

**Today.** A flat list polled every 5 seconds; filter by status only.

**Improvement.** Three regions, top to bottom:

1. **Action strip.** "Resume draft (1)", "Awaiting your input (2)", "Updated since you last visited (3)". Each is a single tap into the relevant items.
2. **Active grievances** (any status that isn't `completed`/`rejected`). Card view, sorted by *last update desc*.
3. **Closed** (completed / rejected). Collapsed by default with a count: "Closed (7) — [Show]".

Search bar at the top filters by free text against description/title.

**Why.** Citizens have far more emotional investment in "what's stuck" than in "the full list." Closed items are reference; active items are the job.
**User impact.** Returning user immediately sees what changed since their last visit.
**Business impact.** Drives engagement on items that actually need user action, accelerating resolution.

---

### D2. Replace 5-second polling with a 30-second poll + visibility awareness

**Today.** `setInterval(fetchRequests, 5000)` runs even when the tab is hidden.

**Improvement.**

- Poll at **30s** when tab is visible, **0s** (paused) when hidden (`document.visibilitychange`).
- Show a small "Updated 12 sec ago — [Refresh now]" pill so users can pull fresh data on demand.
- If/when feasible, replace with Server-Sent Events or websocket; the UX pattern (pill + refresh) stays the same.

**Why.** 5s polling drains mobile battery and quota; it also gives the user the false impression that the system is "live" when really it's repeatedly asking the same question.
**User impact.** Lower battery / data cost; perceived freshness is *better* because the pill always shows the actual age of data.
**Business impact.** Lower server load (12× fewer requests per session).

---

### D3. Surface the next user action on each grievance card

**Today.** Cards mostly show status + date.

**Improvement.** Each card has a one-line **"What's next"** strip:

- *Pending review* → "MLA office will review by 12 Mar."
- *Information needed* → "Please add a photo to continue. [Add photo]"
- *In progress* → "Engineer assigned: [name]. Visit expected by 15 Mar."
- *Resolved* → "Closed 14 Mar. [Reopen if not resolved]"

**Why.** Today the user has to mentally translate `processing` into "what does that mean for me?"
**User impact.** Citizens know if the ball is in their court or the office's court.
**Business impact.** Drives the user back to provide missing information, unblocking stalled tickets.

---

### D4. Make filtering accessible on mobile via a sticky pill row

**Today.** Status filter is a `hidden lg:flex` sidebar. Mobile users have no filter UI.

**Improvement.** On mobile, the filter is a **horizontally-scrollable pill row** sticky to the top of the list area: `All (12) · Open (3) · In progress (2) · Resolved (7)`.

**Why.** Filtering is a primary verb on a list page; it cannot be desktop-only.
**User impact.** Mobile users gain feature parity.
**Business impact.** Mobile users are the majority on a constituency portal — feature parity is table stakes.

---

# Form Improvements

### F1. One-question-per-screen on mobile, sectioned on desktop

**Today.** Forms cram many fields on one screen.

**Improvement.**

- **Mobile:** vertical wizard, one logical question per screen, "Next" advances. The "back" gesture (browser back, swipe) reliably undoes one step.
- **Desktop:** the same logical questions, grouped into 2–3 sections on a single page, with each section's "Edit" button collapsing it after completion.

**Why.** Mobile attention is shallow; one decision per screen aligns with thumb-driven scroll patterns. Desktop has the real estate to show the whole staircase.
**User impact.** Visible progress; less re-orientation.
**Business impact.** Mobile completion rate parity with desktop.

---

### F2. Always-visible field labels, never placeholder-as-label

**Today.** Some auth fields rely on placeholders.

**Improvement.** Every input has a persistent label above it; placeholder becomes an *example*, prefixed with "e.g.".

**Why.** Placeholders disappear on focus and are screen-reader unreliable. Persistent labels are baseline.
**User impact.** Re-checking your input no longer requires emptying it first.
**Business impact.** Lower error correction time → faster forms.

---

### F3. Inline validation with positive confirmation

**Today.** Validation appears (if at all) at submit.

**Improvement.**

- Validate on blur, not on every keystroke.
- For each field, show a small green check on success ("Phone number recognised"), a red inline error on failure, and nothing during typing.
- Required vs optional is explicitly marked — *"Optional"* labels on the optional ones (not asterisks on the required ones; that pattern fatigues users).

**Why.** Civic users include first-time form fillers; ambiguity about "is this right?" is the #1 stall point.
**User impact.** Confidence in progressing.
**Business impact.** Lower form-bounce.

---

### F4. Smart pre-filling and recall

**Today.** Each grievance starts blank.

**Improvement.**

- Pre-fill location with the user's saved Mylapore address (with an obvious "Use a different location" option for issues elsewhere).
- Pre-fill description with the last category-appropriate template (e.g., for "Streetlight not working", template: *"The streetlight at [location] has not been working since [date]. Pole number, if visible: __."*).
- Templates are *editable*, not enforced.

**Why.** A blank textarea is intimidating. A draft to react to is not.
**User impact.** Lower starting-friction; better description quality.
**Business impact.** Higher-quality complaints → faster triage by MLA office.

---

### F5. Location capture: GPS first, map second, type-in last

**Today.** Location is a combined field but the priority of input methods isn't clear.

**Improvement.**

- Tap target #1: **"Use my current location"** (GPS), with a clear privacy line.
- Tap target #2: **"Drop a pin on map"** (`LocationPicker`).
- Tap target #3: **"Type address"**.

Show the resolved address back to the user in human-readable form regardless of input method.

**Why.** GPS is the lowest-effort, highest-accuracy option for civic issues; map-drop is for power users; typing is the fallback.
**User impact.** Faster, more accurate location data.
**Business impact.** Resolvable tickets — location ambiguity is a major blocker for field teams.

---

### F6. Photo capture: optional, but easy and reversible

**Today.** Photo upload is part of the wizard; max 10MB; no compression visible.

**Improvement.**

- Photo step says *"Optional — but tickets with a photo close ~2× faster."* (Only show the comparison line **if** data supports it; otherwise drop the claim.)
- Auto-compress in-browser to ~ 1.5MB before upload.
- Show thumbnail + "Replace" + "Remove" with one-tap each.
- Allow up to 3 photos (front view, close-up, wider context).

**Why.** Photos massively help triage but the friction must be low.
**User impact.** Less data spent; less anxiety about quality.
**Business impact.** Higher photo-attach rate → faster resolution.

---

# CTA Improvements

### C1. One unmistakable primary CTA per screen

**Today.** Hero shows two roughly equal CTAs; sub-pages often have multiple "primary-looking" actions (gradient pills, ghost buttons, "Try now", "Get started").

**Improvement.**

- Every screen has **exactly one** primary CTA.
- Secondary actions are visibly demoted: text links or outlined buttons that are smaller and less coloured.
- Primary CTA copy is **verb + object** (`File a grievance`, `Track my complaint`), never `Get started`.

**Why.** Two equal CTAs is a choice problem disguised as helpfulness.
**User impact.** Decisions get made faster.
**Business impact.** Conversion. Industry studies put single-primary-CTA pages 15–30% ahead of dual-CTA pages.

---

### C2. The hero's primary CTA changes with auth state

**Today.** Logged-in users still see "File a Grievance / My Requests" — both primary.

**Improvement.**

- **Logged-out:** primary = `Get started`, secondary = `Sign in`. (`Get started` deep-links into the wizard step 1 — registration prompt appears only when the user submits.)
- **Logged-in:** primary = `File a grievance`, secondary = `Track my last complaint` (with the actual issue title rendered inline, e.g., "Track Streetlight on N. Mada St").
- **Returning with active draft:** primary = `Resume your draft (2 min ago)`, secondary = `Start a new one`.

**Why.** The primary CTA should reflect the user's most likely next action, not a static page.
**User impact.** Feels like the site remembers them.
**Business impact.** Drives the right next action for each user state.

---

### C3. CTAs are reachable with one thumb on mobile

**Today.** CTAs sit at the end of long hero sections; on small screens the user must scroll past badges and stats to reach them.

**Improvement.**

- On mobile, the primary CTA *also* appears as a **sticky bottom bar** that follows the user down the page until they've used it (or dismissed it).
- The bar disappears once the user is inside the wizard.

**Why.** Thumb-zone matters: the bottom of the screen is the most ergonomic tap target on phones.
**User impact.** No scroll cost to take the primary action.
**Business impact.** Higher first-session conversion on mobile.

---

### C4. Empty states are not absences — they're CTAs

**Today.** Empty MyGrievances may render as a blank list.

**Improvement.** Empty MyGrievances shows: *"You haven't filed any grievances yet. Most Mylapore residents start with [Streetlight] or [Garbage] — [File your first complaint]."*

**Why.** Empty states are the highest-intent moment to convert.
**User impact.** Friendlier first visit.
**Business impact.** Activation lift.

---

# User Psychology Improvements

### P1. Set expectations honestly

**Today.** "Resolved in 7 working days" is a headline promise without evidence.

**Improvement.**

- Replace headline promises with **observable medians**: *"Most Mylapore complaints in this category were resolved in 6 days last month."*
- If data isn't available, replace with **process transparency**: *"Your complaint is reviewed within 24 h, then assigned to an engineer."*

**Why.** Citizens have been promised resolution timelines before. They trust process steps more than outcomes.
**User impact.** Higher long-term trust; lower disappointment risk.
**Business impact.** Defensible language; reduced reputational risk.

---

### P2. Reduce upfront identity disclosure

**Today.** Registration requires phone, name, EPIC choice, address before any task.

**Improvement.**

- Allow **anonymous browsing** of categories ("What can I report?").
- Require identity only at the moment of submission, with a one-screen "Almost done — confirm your phone" step.
- Promote registered users to "saved drafts + tracking" features.

**Why.** Identity ask is a commitment users prefer to defer until value is visible.
**User impact.** More users discover the product before being asked to sign up.
**Business impact.** Larger discoverable funnel; conversion is back-loaded but higher.

---

### P3. Acknowledge the user, not the institution, after submit

**Today.** Confirm screens typically show ticket details + status code.

**Improvement.** Confirm screen leads with: *"Thanks, **[Name]**. Your complaint about **[short description]** is now with the MLA's office. We'll update you on **WhatsApp** within **24 hours**."*
Then: ticket number, copy-able, with a "Share with neighbour" link.

**Why.** Reflecting the user's own words back is the strongest acknowledgement signal.
**User impact.** Emotional closure on what is often a frustrating moment.
**Business impact.** Word-of-mouth and re-use.

---

### P4. Make "what happens next" visible without asking

**Today.** Users wonder if the complaint was actually sent and who reads it.

**Improvement.** Post-submit and on the ticket detail page:

- A **3-step timeline**: Submitted → Reviewed by MLA office → Assigned to engineer → Resolved.
- Show **who** at each step (role, not name where privacy demands), with a timestamp.

**Why.** Anxiety in civic processes is dominated by opacity. Visibility halves it.
**User impact.** Less "is anyone reading this?" panic.
**Business impact.** Fewer "what's happening?" calls to the MLA office.

---

### P5. Reciprocity loops

**Today.** No feedback solicited.

**Improvement.** Post-resolution, a single thumbs up / thumbs down on "Was this resolved to your satisfaction?". Optional one-line comment. Surface aggregate scores publicly per category.

**Why.** Citizens rarely get to *grade* government. Letting them do so dignifies the relationship.
**User impact.** Sense of agency.
**Business impact.** Quantitative feedback for MLA office; public scores drive accountability.

---

# Information Hierarchy Improvements

### IH1. Each screen has a documented role

| Screen | Role (one sentence) |
|---|---|
| Landing | Show the user *one* button to file a grievance, *one* button to sign in. |
| Sign in | Confirm phone, send OTP, no more. |
| Register | Collect minimum identity, set expectations. |
| GrievanceHome step 1 | "What's wrong?" |
| GrievanceHome step 2 | "Where & details?" |
| GrievanceHome step 3 | "Confirm and submit." |
| MyGrievances | "What needs your attention?" |
| TrackStatus | "Show the latest on your most recent complaint." |
| Help | "Answer the question you came with." |

If a screen does more than its role, that work moves out.

**Why.** Hierarchy lives in *role clarity* before it lives in font sizes.
**User impact.** Less to parse.
**Business impact.** Easier to ship changes without breaking other roles.

---

### IH2. Promote evidence over claim

For every claim on the marketing pages (stats, badges, promises), the rule is:

> A claim must point to evidence within one tap.

If it cannot, the claim is removed.

**Why.** Civic trust is brittle.
**User impact.** Calmer, more grown-up tone.
**Business impact.** Insulates the portal from criticism of greenwashing claims.

---

### IH3. Strip the hero to five elements maximum

Hero contains, in order: status microcopy (one line) → headline → sub-headline → primary CTA → secondary action (text link). Everything else moves down the page.

**Why.** Audit found ~14 elements above the fold; the recommended ceiling is 5–7. Forcing a hard cap of 5 prevents accidental expansion.

---

### IH4. Stats panels respect their data

If a metric is zero or unavailable, hide it. Do not show "0 Resolved" publicly.

**Why.** "0 resolved" on a grievance portal is worse than no number.
**User impact.** Confidence preserved.
**Business impact.** Reduces accidental self-sabotage on launch day.

---

# Mobile UX Improvements

### M1. Mobile-first dashboards

`MyGrievances` and `TrackStatus` are rebuilt **mobile-first**:

- Status filter = sticky scrollable pill row.
- Cards collapse heavy metadata behind an expand affordance.
- Pull-to-refresh works (already implicit with the new refresh pill).

### M2. Mobile-first auth

`LoginPage` / `RegisterPage` no longer hide the trust panel on mobile. Instead:

- Show a **compact trust strip** above the form (logo + 1 line + verified microcopy).
- The decorative leader image is moved to a collapsible "About this portal" link.

### M3. Sticky primary action

Every primary CTA has a sticky-bottom-bar variant on mobile, surfaced when the user has scrolled past the inline CTA.

### M4. Tap targets ≥ 44×44 px

All interactive elements (sidebar items, filter pills, breadcrumbs, "Resend OTP", map-pin handles) meet 44×44 minimum.

### M5. No `hidden lg:*` on critical features

Audit-level rule: nothing critical to a task may be desktop-only. The current `hidden lg:flex` filter and trust panels violate this.

### M6. Reduce hero animations on mobile

Animated decorations gated by both `prefers-reduced-motion` and a small-screen heuristic (`@media (max-width: 640px)` shuts them off). Mobile users benefit most from a still page.

### M7. Single-column forms always

Every form is single-column on every breakpoint. No two-column responsive grids inside the wizard.

**Why (M1–M7).** The audit established mobile is currently a degraded fallback; this is a category error for a constituency product where mobile is the *primary* device.

**User impact.** A mobile user gets feature parity, not a stripped-down site.
**Business impact.** The majority of the addressable population — which is on phones — actually finishes the funnel.

---

# Accessibility Enhancements

### A1. Form labels, not placeholders

Every input has a visible, persistent `<label>`. Placeholders only when truly needed and prefixed "e.g.".

### A2. Live regions

Toasts and OTP / submit status updates render inside `aria-live="polite"` regions so screen readers announce changes.

### A3. Skip-to-content link

First focusable element on every page is a "Skip to main content" link that becomes visible on focus.

### A4. Keyboard-first navigation

- All clickable elements are `<button>` or `<a>`, never `<div onClick>`.
- A logical tab order (top → bottom, left → right) is enforced.
- A focus ring is always visible on focus (no `outline: none` without a replacement).

### A5. Motion respect

`prefers-reduced-motion: reduce` disables marquee, blob animations, gradient text shimmer, and `hero-anim` reveal. Motion is *additive*, not foundational.

### A6. Language declaration

Tamil text is wrapped in `<span lang="ta">` (or the containing block carries `lang`). This corrects screen-reader pronunciation.

### A7. Decorative images are silent

Every decorative `<img>` (flag watermarks, background images, blobs) has `alt=""` *and* `aria-hidden="true"` (the current `TvkFlagDecor` already does this — extend the pattern everywhere).

### A8. Contrast meets AA

All text on its actual background passes 4.5:1 (3:1 for ≥ 18px bold). Yellow on white is removed or replaced with yellow on a dark chip.

**Why.** A constituency service has a near-statutory expectation of accessibility. Beyond compliance, every barrier removed is a citizen onboarded.

**User impact.** Sight-impaired, motor-impaired, motion-sensitive, and senior users gain full access.
**Business impact.** Removes a category of legal and reputational risk; aligns with public-sector procurement norms.

---

# Recommended UX Priorities

The priority ladder below is **user-impact × ease-of-implementation × risk-reduction**. Items at the top are non-negotiable for a public launch.

### P0 — Must ship before any public soft-launch
1. **Draft persistence and visible drafts banner** (W5). Stops silent data loss.
2. **Confirm-on-destructive-navigation** in the wizard (W2). Stops accidental wipes.
3. **Track-by-default for logged-in users** (W4). Removes a dead-end.
4. **Hide zero / unverifiable stats and promise language** (IH4, P1). Prevents launch-day trust damage.
5. **Mobile-first filter and trust panels** (M1, M2). Mobile feature parity.
6. **Keyboard-accessible sidebar / cards** (A4). Statutory minimum.

### P1 — Ship in the first iteration after launch
7. **Single 3-step wizard pattern** (W1). Lifts completion rate.
8. **One primary CTA per screen, state-aware hero CTA** (C1, C2). Lifts conversion.
9. **`MyGrievances` becomes a real dashboard with action strip** (D1, D3). Lifts engagement on stuck tickets.
10. **Reduce poll to 30s + visibility-aware** (D2). Reduces battery/data cost.
11. **Single OTP screen with stateful CTA** (W6). Lowers OTP-flow errors.

### P2 — Quality and trust
12. **Smart pre-fill of location and description** (F4, F5). Speeds time-to-submit.
13. **Photo step: optional but easy, with auto-compress** (F6). Higher-quality tickets.
14. **Sticky mobile primary CTA** (C3, M3). Mobile conversion.
15. **Help becomes a real route** (N3). Searchable, SEO-discoverable.
16. **Reciprocity loop (post-resolution rating)** (P5). Long-term trust loop.

### P3 — Strategic
17. **Separate party content from service content** (N2). Cleans the institutional posture.
18. **Process transparency on every ticket** (P4). Permanent trust improvement.
19. **Empty states as CTAs** (C4). Activation lift.
20. **Documented role per screen** (IH1). Engineering and design hygiene that compounds over time.

---

## Anti-goals (things we are deliberately *not* doing in this stage)

- We are **not** redesigning visuals. No colour decisions, no typography decisions, no new components.
- We are **not** changing the data model or backend contract. Smart routing and 3-step wizard sit on top of the existing `FLOWS`/`PHASE` machine — they reshape the *user-facing* steps without renegotiating with the backend.
- We are **not** changing the brand position. TVK red/yellow stays. Only the *evidence* behind claims changes.

These anti-goals exist so this document focuses on the work of UX logic — the work for which "more pixels" is not the answer.

---

*End of strategy. Next stage builds the visual & component re-design on top of these flow decisions.*
