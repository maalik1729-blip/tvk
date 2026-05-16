# Mylapore Constituency Grievance Portal — UI/UX Audit

> **Auditor mode:** Senior product designer.
> **Scope:** Front-end web app (LandingPage, LoginPage, RegisterPage, GrievanceHome, MyGrievances, TrackStatus, Topbar, Footer).
> **Lens:** First-time citizens, non-technical / low-attention / mobile users.
> **Verdict:** The brand expression is strong, but the product is severely over-decorated, hierarchically flat, and cognitively noisy. Trust signals are loud but unspecific. Mobile and accessibility need work before a public launch.

---

# Executive Summary

The portal is built on top of a powerful political brand (TVK), and the visual ambition is clearly high. However, the current build prioritizes **brand theatre over civic clarity**:

- The Landing Page contains **9+ stacked sections** with decorative blobs, animated waves, grid overlays, watermark flags, drop-shadows, glassmorphism, and gradient text — all competing for attention.
- Every content section now has a 3D flag watermark (recently added), increasing visual noise without adding new information.
- The **primary task** of a constituent — *file a grievance and get it resolved* — is buried beneath marketing-style hero pills, "Verified MLA" badges, and live-status indicators that read as decorative rather than functional.
- The **multi-phase grievance wizard** (`GrievanceHome.jsx`) has 6 phases, multiple action kinds, and no consistent breadcrumb / back affordance — likely the largest UX risk in the app.
- **Mobile experience is degraded by design**: many panels and decorations are `hidden lg:block`, which means the mobile experience is the *fallback*, not the primary canvas — the inverse of what a citizen-services product should be.
- **Accessibility** is below the bar required for a government-adjacent product (contrast, focus order, motion, alt text, ARIA).
- **Trust language** ("Verified MLA", "Live", "Resolved in 7 days") is everywhere but never substantiated with evidence (no signed source, no actual SLA reference, no proof artifact).

A redesign should reduce visual layers by ~50%, enforce a single hierarchy per screen, simplify the wizard to a 3-step linear flow, fix mobile-first, and replace decorative trust signals with functional ones.

---

# Major UX Problems

### 1. The primary action is not the loudest element on the Landing Page
The hero offers two CTAs ("File a Grievance" / "My Requests") that compete with:
- a green "Portal Active" pill,
- a "Verified MLA" badge,
- a "Live" badge,
- a "Serving Mylapore" floating ribbon,
- 3 inline mini-stats,
- a giant gradient title with rotating colors,
- a 3-column stat block with thin yellow tracking labels.

A first-time, low-attention user opening the site cannot tell within 2 seconds **what they are supposed to do**. The CTA loses to the badges purely on visual weight.

**Why it matters:** Civic users come with intent ("I want to report broken streetlight"). Every additional element they parse before reaching that intent is a tax on conversion and trust.

---

### 2. The grievance wizard (`GrievanceHome`) is too branched
`PHASE` × `FLOWS` produces **6 distinct flow shapes** (`url`, `pdf`, `ticket`, `details_then_url`, `location_only_ticket`, `location_photos_ticket`). Users cannot anticipate how many steps remain because the flow shape is determined by their sub-category choice, which they make on **step 2**.

The progress bar therefore changes meaning mid-flow. Combined with an in-page sidebar that stays clickable, users can accidentally derail their submission by clicking another category.

**Why it matters:** Forms that get longer after a user commits are the #1 cause of abandonment in government services research (GOV.UK, NN/g). The user never sees the full ladder before climbing it.

---

### 3. The sidebar is destructive
Clicking a sidebar category in `GrievanceHome` resets `phase` back to `PHASE.CATEGORY` (`@d:\Downloads\MylaporeConstituency-main (1)\MylaporeConstituency-main\src\pages\GrievanceHome.jsx:427-430`) **without any confirmation**, even if the user has typed a description, picked a location, or attached a photo. The sidebar is also the first thing users see and naturally explore.

**Why it matters:** Silent data loss is the worst UX failure mode. Users blame themselves and don't return.

---

### 4. Three different "info architectures" coexist in one app
- LandingPage: marketing site (Hero → Pledge → Marquee → Services → Leadership → Steps → Stats → Pledge → Info → CTA).
- GrievanceHome: enterprise wizard (sidebar + multi-phase form).
- MyGrievances: dashboard (filter sidebar + cards).
- TrackStatus: utility page (sidebar + single search field).

Each uses a **different background color** (`bg-white`, `#f4f6f8`, `#f0f2f5`), a **different sidebar width**, a **different active-state color** (red gradient on Grievance, navy `#2c4569` on MyGrievances, `#1a3a6b` on TrackStatus), and a **different empty-state idiom**.

**Why it matters:** This is one product. Switching between filing, tracking, and listing should feel like *the same place*. Right now it feels like four different developers' apps stitched under one navbar.

---

### 5. Footer offers links to content that isn't part of the grievance product
`Footer.jsx` advertises "2026 Election Candidates", "Manifesto", "Disclosures", "Resolutions", "News", "Events", "Wings", "Committees", etc. — political-party content rather than grievance-portal content.

**Why it matters:** A user who came to file a complaint about a streetlight is now a click away from a **campaign** site. This blurs the line between a constituency service and political marketing — a serious **trust** risk for a public-service product.

---

# Major UI Problems

### 1. Decoration density is unsustainable
Per Landing Page section, the user typically sees:
- 1–2 animated blobs
- a yellow grid overlay (7% opacity)
- a faint background image (`/bg.png`) at 8% opacity
- a 3D flag watermark (newly added) at 7–18% opacity with mix-blend
- decorative geometric accents (rotated squares, circles, rings)
- gradient borders and inset highlights

Every section has at least 4 decorative layers behind 1 layer of content. The **signal-to-noise ratio is roughly 1:5**.

---

### 2. Hero contrast and text legibility risk
The hero is now a dark gradient (`#0A0A0A → #1A0A0A`) with a centered, screen-blended flag at 18% opacity, plus 7% yellow grid and 20% yellow blobs. Body copy uses `text-white/80` (~80% opacity white) and yellow accent text on the dark background.

`text-white/80` on black computes ~17:1 contrast (good), but **the `tvk-grad-text` gradient title** can fall below 4.5:1 in its mid-yellow stops, and the flag watermark crossing the title region risks producing a non-uniform background luminance that violates WCAG 1.4.6 in patches.

---

### 3. Inconsistent typographic system
Three different "uppercase tracking" treatments are in use across the codebase:
- `tracking-[0.18em]` (Landing pill)
- `tracking-[0.22em]` (MLA card identity strip)
- `tracking-[0.3em]`–`tracking-[0.4em]` (Pledge banner badge, Services intro)

This isn't a system — it's per-section taste. Same goes for font weights: `font-bold`, `font-extrabold`, `font-black` are sprinkled with no semantic difference.

---

### 4. Trust badges look the same as decorative pills
"Verified MLA" (legitimate trust signal) and "Portal Active • TVK Digital Initiative" (marketing) and "Live" (status) are visually almost identical: same pill shape, same glass background, same border treatment, same micro-icon. Users cannot tell which to trust.

---

### 5. Topbar logo container fights the logo
The topbar now wraps the new portrait-oriented 3D flag-pole image inside a **tiny 28×28 square with rounded corners**. The flag-pole is taller than wide, so the actual flag becomes ~12px tall — barely recognizable. The `object-contain` keeps it from cropping but at the cost of looking like a thumbnail of a thumbnail.

A horizontal logo lockup (icon + wordmark) would serve better at this size.

---

### 6. Glassmorphism + scrolling background = visual chaos
The Topbar is `tvk-nav` (glassmorphism) and goes `scrolled` opaque after 8px. On long pages with the new flag watermarks scrolling behind it, the bar shows three different backgrounds during a scroll: glass over hero → glass over white → opaque solid. This makes the brand wordmark legibility fluctuate.

---

# User Friction Points

| # | Friction point | Where | Impact |
|---|---|---|---|
| F1 | User cannot see total wizard length until step 2 | `GrievanceHome` flow branching | Abandonment |
| F2 | Sidebar clicks discard form data silently | `GrievanceHome` `onClick={() => setPhase(PHASE.CATEGORY)}` | Data loss |
| F3 | "Live" pill polls every 5s | `MyGrievances` setInterval 5000 | Battery / data drain on phone |
| F4 | Two registration modes (EPIC vs Manual) chosen on the **first** screen with no recommendation | `RegisterPage.jsx` | Choice paralysis |
| F5 | OTP step has no resend cooldown indicator visible up-front | Login/Register | Users mash "resend" |
| F6 | "Track" requires a reference ID the user may not have saved | `TrackStatus` | Dead end if lost |
| F7 | `My Requests` has no search by description, only filter by status | `MyGrievances` | Long-list users stuck |
| F8 | Logging out from menu → home, but the menu has no explicit "switch account" | `Topbar` | Confusion on shared phones |
| F9 | Marquee text is decorative, not interactive, but has hover-affordance styling | LandingPage | Users try to click it |
| F10 | Help FAB position floats over CTAs on small screens | `HelpFab` | Tap interference |

---

# Visual Hierarchy Problems

1. **Equal-weight competing elements.** On the hero, the title, the live pill, the verified badge, the flag image, and the MLA card all sit at roughly the same visual loudness. There is no single anchor for the eye.
2. **Multiple "primary" colors.** Red (`#C8102E`), red-dark (`#8B0000`), yellow (`#FFD60A`), orange (`#FF8C00`), green (`#00E676` — used for "Live"), navy (`#1a3a6b`), warm cream — used freely without role assignment. There is no documented colour token semantics.
3. **CTAs without escalation.** Both `tvk-cta-primary` (gradient) and `tvk-cta-ghost` (outline) appear at the same size with the same icon weight. Visually they are 90/100 vs 85/100 — too close to act as a real primary/secondary pair.
4. **Stats over content.** Hero stats and dashboard stats both use `text-3xl font-black` — louder than half the page's headlines. Numbers shouldn't outweigh body copy by default.
5. **Footer rivals hero.** The footer is so visually rich (multiple link columns, social icons, scroll-to-top, gradient bg, image overlays) that it looks like another hero section. A footer should be a *recede*, not a *crescendo*.

---

# Typography Problems

1. **Too many faces.** Inter, Poppins, Noto Sans Tamil, Noto Sans, plus a "font-display" alias and a "font-tamil" alias. Five families on a service portal is at least three too many.
2. **Tiny tracked uppercase as both body and label.** `text-[10px]–[11px] tracking-[0.22em]–[0.32em] uppercase` is used for hundreds of labels. At 10px the letters are ~7px tall on most phones — under WCAG minimum recommended sizes for sustained reading.
3. **Tamil + English mixed at the same weight.** When Tamil and English share a line, English is at `font-bold` and Tamil is at `font-bold` — but Tamil glyphs visually weigh more, so the line tilts. Tamil should typically be 1 step lighter to optically match.
4. **Numeric tracking missing.** Stats (`fontVariantNumeric: 'tabular-nums'`) is used in some places but not in the Landing hero stats — they jitter on update.
5. **Headline-to-body jump is too large.** `text-7xl` headlines (~72px) then `text-base` body (~16px) is a ~4.5× ratio. The eye loses the title's authority because nothing bridges them.

---

# Accessibility Problems

| Issue | Severity | Notes |
|---|---|---|
| **Decorative images without `aria-hidden`** | High | Many `tvk-blob` divs lack ARIA hiding; some watermarks have it (good), others use `alt=""` only. Audit all. |
| **Insufficient colour contrast on yellow accents** | High | `text-tvk-yellow/80` (≈ #FFCC00 @ 80%) on white = ~1.7:1 — fails WCAG AA. Used in footer nav, mini-stat labels, microcopy. |
| **Animated decorations without `prefers-reduced-motion` respect** | High | Only the wave animation respects it (`@d:\Downloads\MylaporeConstituency-main (1)\MylaporeConstituency-main\src\index.css:702-705`). Blobs, marquee, gradient text, hero-anim do not. |
| **Focus styles inconsistent / removed** | High | Many `tvk-cta-*` buttons rely on hover only; no visible focus ring shown in the source. Keyboard-only users cannot orient. |
| **Form fields without explicit `<label>`** | High | RegisterPage / LoginPage rely on placeholder-only fields in some places. Placeholder is not a label. |
| **`<button>` vs `<div onClick>` for sidebar items** | Medium | `MyGrievances` uses `<button>` (good); `TrackStatus` uses `<div>` (line 99) — keyboard inaccessible. |
| **Live regions missing** | Medium | Toasts in `GrievanceHome` and OTP step status messages aren't wrapped in `aria-live`. Screen readers don't hear success/error. |
| **Icon-only controls without `aria-label`** | Medium | Topbar mobile open/close, sidebar collapse, HelpFab. |
| **Skip-to-content link** | Medium | None present. |
| **Heading order skipped** | Low | Landing page jumps from `h1` to `h2` to `h4` in cards (in some sections), bypassing `h3`. |
| **Language attribute on Tamil snippets** | Low | Tamil text rendered without `lang="ta"` — affects screen-reader pronunciation. |

---

# Mobile Responsiveness Problems

1. **Auth pages hide the trust panel on mobile.** `LoginPage` / `RegisterPage` left panel is `hidden lg:flex`. The mobile experience drops the entire branded-trust column. New mobile users see a *bare* form — far less reassuring than the desktop view.
2. **GrievanceHome sidebar with categories is a `hidden lg:flex` on `TrackStatus`.** Mobile users on `TrackStatus` lose category context entirely. On `GrievanceHome` the sidebar is collapsible but defaults open and steals horizontal space at smaller laptop widths.
3. **MyGrievances filter sidebar** also `hidden lg:flex` — mobile users have **no filter UI** for status. They get the full list with no way to focus.
4. **Topbar drops the wordmark below `sm`** (`hidden sm:block`) — leaves only the tiny logo. With the new portrait flag image, the brand becomes nearly invisible at common phone widths.
5. **CTAs wrap unevenly.** Hero CTA row is `flex-col sm:flex-row flex-wrap` — at intermediate widths (e.g., 380–420px) the buttons stretch to 100%, then awkwardly to 50/50, depending on text length. Inconsistent thumb-target sizes.
6. **Hero stats `grid-cols-3` on mobile** with `text-2xl` numbers + `text-[10px]` labels = labels truncate or wrap to 3 lines on long Tamil strings.
7. **Sticky topbar plus floating HelpFab plus toast** can occupy 3 horizontal bands on a phone, leaving < 60% of viewport for content during peak interactions (e.g., after submitting a grievance).
8. **Footer link columns on mobile collapse to one column**, but each column has 4–6 links → 30+ link list before reaching the legal line. High scroll cost.
9. **Map picker (`LocationPicker`)** opens as a modal but the touch targets for moving the pin are likely < 44px on mobile (needs verification on device).
10. **Decorative flag watermarks at `h-72`–`h-80` may bleed off-canvas on phones**, increasing horizontal scroll risk if any parent is not `overflow-hidden`.

---

# Cognitive Load Analysis

### Landing Page
- **Distinct visual elements per fold (above scroll):** ~14 (hero pill, title, gradient text, body, two CTAs, three stats, MLA card with: live pill, verified badge, image, identity line, three mini-stats, ribbon).
- **Recommended ceiling for civic services:** 5–7.

### Hero alone is conveying ~8 different value props simultaneously:
1. The portal exists.
2. It's official / verified.
3. It's live.
4. There's a real MLA behind it.
5. Resolution is fast (7 days).
6. Other citizens have used it.
7. There's a digital initiative narrative.
8. There is a flag (national identity).

Each is true; together they dilute. The user cannot rank them.

### Wizard cognitive load
- 9 categories shown in the sidebar simultaneously at first load. Average user research benchmark for "scan and decide" lists is **5±2**. Anything above 7 introduces re-scanning.
- Sub-options within a category can be 4–10 more items. After picking a category the user is making a second 1-of-N decision before they've described their problem.

### Recommendation
Compress hero to: **Title + 1 supporting line + 1 primary CTA + 1 secondary CTA + 1 trust microcopy line.** Move stats below the fold. Move "verified MLA" to the page footer or About link.

---

# Trust & Clarity Issues

1. **"Verified MLA" with no proof artifact.** No link to election commission, no constituency notification, no official handle. The badge is decorative. It should link to a public source of truth (e.g., ECI page) or it should be removed.
2. **"Resolved in 7 working days"** is repeated as a guarantee. There is no service-level agreement document linked, no track record (the dashboard says "0 resolved" in the screenshot you shared earlier). Promising what you cannot show is a trust risk.
3. **"Live"** — what is live? The portal? The MLA? The polling? Without scope it reads as marketing.
4. **"WhatsApp-secured login"** — secured how? What does the user gain (vs SMS)? A single-line tooltip is needed.
5. **Mixing party and constituency.** The footer's "2026 Election", "Candidates", "Disclosures" are party-level content. A constituent filing a pothole complaint should not feel they are interacting with a campaign. Either separate the two domains or label each link with its scope.
6. **No imprint / publisher block.** Government-adjacent products typically need a published-by, contact, and grievance-redressal-officer block in the footer per IT Rules 2021. Currently absent.
7. **Tamil pledge banners** are emotionally charged — appropriate for a party, but on a *services* portal they shift the register from neutral utility to political identification, which can deter constituents who don't share that identification.
8. **Statistics on the homepage** ("Total Received", "Resolved", "Avg Response Time") are shown but, at the time of audit, evaluate to placeholders / zeros. Showing zeros publicly is worse than hiding the panel until there is data.
9. **No version, no changelog, no last-updated stamp** anywhere. Civic users gain confidence from "data updated 12 Mar 14:00".
10. **No grievance-officer, escalation path, or RTI link.** A grievance product without an escalation ladder is incomplete.

---

# Recommended Priority Fixes

### P0 — Trust & data-loss (ship before public launch)
1. **Confirm before discarding form data** in `GrievanceHome` sidebar / category clicks.
2. **Replace decorative "Verified MLA" / "Live" pills** with linked, dated, sourced facts — or remove them.
3. **Show wizard length up front** (total steps known before commitment).
4. **Add publisher / officer / escalation block** in footer.
5. **Hide stat panels when values are 0** until real data exists.
6. **Fix sidebar non-button elements** in `TrackStatus` to be keyboard accessible.
7. **Audit colour contrast** for yellow on white and gradient text on photos; raise to AA (4.5:1) minimum.

### P1 — Hierarchy & clarity (ship in next iteration)
1. **Reduce hero to 5 elements**: badge (one), title, sub, primary CTA, secondary link.
2. **Pick one decoration system** (e.g., subtle grid OR blobs OR flag watermark — not all three).
3. **Unify dashboard backgrounds and active-state colours** between Grievance / MyGrievances / Track.
4. **Mobile-first the auth pages**: bring the trust panel onto mobile (simplified), don't hide it.
5. **Mobile-first the dashboards**: surface filter UI on mobile via a sticky pill row above the list, not a hidden sidebar.
6. **Topbar logo lockup** redesign for the new 3D flag image (or use a horizontal lockup at small sizes).

### P2 — Accessibility & polish
1. **Honour `prefers-reduced-motion`** across blobs, marquee, gradient text, hero-anim.
2. **Add `aria-live`** to toast / OTP / submit-success regions.
3. **Add skip-to-content link** and consistent focus rings.
4. **Add `lang="ta"`** on Tamil spans.
5. **Reduce poll frequency** from 5s to 30s in `MyGrievances`, plus exponential backoff when tab is hidden.
6. **Standardise typography scale** (max 4 sizes, 2 weights, 1 family for Latin + 1 for Tamil).
7. **Drop one of the auto-installed decorations** (e.g., flag watermarks on light sections feel like noise; keep on hero only).

### P3 — Strategic
1. **Separate the *party* surface from the *services* surface**: move all election/manifesto/leadership content to a clearly-different sub-domain or section labelled "About TVK", with the grievance portal staying neutral and utilitarian.
2. **Define a design-token system** (semantic colour roles, spacing scale, motion presets, density modes).
3. **Run 5 unmoderated remote tests** with first-time mobile users on the *file-a-grievance* and *track-status* tasks. Measure time-to-first-CTA and abandonment per phase.

---

## Quick wins (can be merged within a day)

- Reduce hero badge count from 3 to 1.
- Hide "0 resolved" stats until real numbers exist.
- Wrap toast container in `aria-live="polite"`.
- Convert `TrackStatus` sidebar `<div>` items to `<button>`.
- Add `prefers-reduced-motion` guards to `tvk-blob` and `marquee` keyframes.
- Add `lang="ta"` on the Tamil pledge headline.
- Ship a confirm-discard dialog when changing categories with unsaved form data.

---

*End of audit. This document is the foundation for subsequent stages — redesign principles, component rebuilds, and a measurable rollout plan.*
