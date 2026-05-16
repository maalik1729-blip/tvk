# Mylapore Grievance Portal — Visual Redesign Direction

> **Stage:** 03 — Visual system & UI patterns.
> **Inputs:** `outputs/01_ui_audit.md`, `outputs/02_ux_improvement_strategy.md`.
> **Reference quality:** Stripe (clarity), Linear (density + speed), Notion (calm hierarchy), Airtable (data legibility).
> **One-line direction:** A **civic-tech product with TVK identity expressed quietly** — Stripe-grade clarity, Linear-grade density, Notion-grade calm, Airtable-grade readability. Red and yellow remain, but as *accent and signal*, not as wallpaper.

---

# Visual Design Philosophy

The current product expresses TVK by saturating screens with red, yellow, gradients, blobs, watermarks, and decorative animation. The redesign keeps the brand recognisable but uses it **like a serif on a stationery**: present, dignified, never shouting.

### Five visual principles

1. **Quiet by default, loud on purpose.** White / near-white canvas. Red and yellow appear only in identity, primary actions, and status — never as background fills.
2. **One axis of emphasis per surface.** Each card, page, modal has *one* element that dominates. Everything else is supporting.
3. **Generous, regular spacing.** A strict 4 / 8 spacing scale. Air is content.
4. **Type does the heavy lifting.** Strong type hierarchy replaces decoration. Borders, shadows, gradients are subtractive.
5. **Identity > Decoration.** A precise logo lockup, one accent stroke per surface, no watermarks behind content.

### What changes vs. today

| Today | Tomorrow |
|---|---|
| Red gradient hero with grid overlay + blobs + flag watermark | White hero, one accent line of yellow under the headline |
| 9+ decorative layers per section | ≤ 2 decorative elements per surface |
| Three competing pill systems (green Live, yellow Verified, gradient ribbons) | One status chip system with six standardised tones |
| Gradient text headlines | Solid `ink-900` headlines; gradient reserved for the **primary CTA only** |
| Tamil + English mixed at the same weight | Tamil set 1 step lighter, with `lang="ta"` and its own optical scale |
| Section backgrounds: white / cream / grey / dark | Two canvas tones only: `bg-surface` (white) and `bg-surface-2` (cool-grey 50) |
| Cards with red borders, yellow rings, gradient shadows | Cards with a single 1 px hairline and a single ambient shadow |
| Multiple shadows, radii, glows | One shadow system (3 elevations), one radius scale (4 sizes) |

---

# Typography Recommendations

### Reduce from 5 families → 2

- **Latin:** `Inter` (variable). Drop Poppins entirely. Inter is the closest open-source match to the Linear/Stripe register.
- **Tamil:** `Noto Sans Tamil` (variable). Drop the generic Noto Sans alias.

Custom display work (large hero) uses Inter at `font-weight: 700` and tightened tracking, not a separate "display" font.

### Type scale (Major Third — 1.25)

| Token | Size | Line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-2xl` | 56 / 60 px | 1.05 | 700 | -0.022em | Landing hero only |
| `display-xl` | 44 / 48 px | 1.08 | 700 | -0.02em | Section heroes |
| `display-lg` | 32 / 36 px | 1.15 | 700 | -0.015em | Page titles |
| `h1` | 24 px | 1.25 | 700 | -0.01em | Card section heading |
| `h2` | 20 px | 1.3 | 600 | -0.005em | Sub-section |
| `h3` | 16 px | 1.4 | 600 | 0 | Card title |
| `body` | 15 px | 1.55 | 400 | 0 | Default body |
| `body-sm` | 13 px | 1.5 | 400 | 0 | Meta, helper, captions |
| `mono` | 13 px | 1.4 | 500 | 0 | Reference IDs, timestamps |
| `label` | 12 px | 1.3 | 600 | 0.04em | Form labels, table headers |
| `overline` | 11 px | 1.3 | 700 | 0.08em | Sparingly, max one per surface |

### Tracking rules

- **No uppercase paragraphs.** Uppercase only on labels and overlines, never on body or buttons.
- **Maximum letter-spacing 0.08em.** The current `tracking-[0.32em]` and `0.4em` are removed entirely — they sacrifice legibility for "premium" feel and achieve neither.

### Tamil sizing rule

Tamil glyphs are visually heavier. When Tamil and Latin share a baseline, **Tamil drops one weight step** (e.g., 600 → 500) and may go +1 px to optically match Latin's x-height.

### Numerics

All numbers use `font-variant-numeric: tabular-nums` globally. Counters, IDs, timestamps, stats — all align.

### Reading width

Body copy is capped at **66 ch**. Long-form descriptions (grievance details) at **74 ch**. Wider than this is a layout bug.

---

# Layout System

### One 12-column grid, three breakpoints

| Breakpoint | Min width | Columns | Gutter | Container max |
|---|---|---|---|---|
| `sm` | 0 | 4 | 16 px | 100% – 32 px |
| `md` | 768 | 8 | 24 px | 720 px |
| `lg` | 1024 | 12 | 24 px | 1200 px |

That is the entire system. The current code has 5+ implicit grids; collapse to one.

### Spacing scale (only these tokens exist)

`0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96` (pixels).

Anything not on this scale is a bug.

### Radii (four steps, that's all)

- `sm` 6 px — pills, tag chips
- `md` 10 px — inputs, small buttons
- `lg` 14 px — cards, large buttons
- `xl` 20 px — modals, hero containers

No `rounded-3xl`, no `rounded-[32px]`, no random one-off radii.

### Elevation (three steps)

- `e0` — none. Default for inline content.
- `e1` — `0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.06)`. Cards, default tables, popovers.
- `e2` — `0 8px 24px -8px rgba(15,23,42,.12), 0 2px 6px rgba(15,23,42,.06)`. Modals, dropdowns, sticky CTA.

No glow shadows, no coloured shadows, no inset shadows in production. Today's `shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]` (RegisterPage) is replaced with `e2`.

### Page layout patterns

Three layouts cover every screen:

- **L1 — Marketing.** Centered 12-col content, max 1200 px, generous vertical rhythm (96 px between major sections).
- **L2 — Console.** Topbar (fixed) → optional left nav (240 px) → content area (12-col within remaining width).
- **L3 — Focus.** Topbar → centered single column (max 640 px). Used for sign-in, OTP, wizard steps.

Everything in the current app maps to L1, L2, or L3. No bespoke layouts.

---

# Color Hierarchy

### Token semantics (the *role* of each colour)

| Role | Token | Light hex | Use |
|---|---|---|---|
| Canvas | `bg-surface` | `#FFFFFF` | Default page bg |
| Canvas alt | `bg-surface-2` | `#F8FAFC` | Section bands, table stripes, dashboards |
| Panel | `bg-panel` | `#FFFFFF` with `border-hairline` | Cards |
| Hairline | `border-hairline` | `#E5E7EB` | All borders, dividers, table grid |
| Hairline strong | `border-strong` | `#D1D5DB` | Inputs in focus, separators with weight |
| Ink (max) | `text-ink-900` | `#0B1220` | Headings |
| Ink (default) | `text-ink-700` | `#1F2A37` | Body |
| Ink (meta) | `text-ink-500` | `#5B6776` | Captions, helper, secondary |
| Ink (mute) | `text-ink-400` | `#8794A3` | Disabled labels |
| **Brand primary** | `brand-red` | `#C8102E` | Primary CTA fill, brand identity, *one* accent per page |
| **Brand secondary** | `brand-yellow` | `#F5B600` | Secondary accent, link underline on dark, tiny highlight |
| Success | `status-success` | `#0F9D58` | Resolved, success toast |
| Warning | `status-warning` | `#D97706` | Awaiting input |
| Danger | `status-danger` | `#DC2626` | Rejected, destructive |
| Info | `status-info` | `#1D4ED8` | In progress, neutral process steps |
| Live | `status-live` | `#0F9D58` | Single "live" pill — *same* as success on purpose |

### Rules

1. **No background fill of `brand-red` or `brand-yellow` on any page-level surface.** Brand colours appear in: the logo, the primary CTA, the underline accent under hero headlines, and inside chips.
2. **`brand-yellow` is not used on white as a text colour.** It fails contrast. Yellow is for fills, strokes, and tiny ornaments — never paragraph text.
3. **One brand red gradient exists** — the primary CTA: `linear-gradient(180deg, #DA1A38 0%, #B40C26 100%)`. Used only on `Button.primary`.
4. **Dark mode is deferred.** Tokens above are written so a dark theme can be derived later; do not ship dark mode until tokens are stable.
5. **No colours other than the tokens above exist in the codebase.** Today's `navy #2c4569`, `#1a3a6b`, `tvk-cream`, `bee77a3b`-style ad-hoc backgrounds are removed.

### Status chip palette (the *only* chip recipes)

| Status | Bg | Text | Dot |
|---|---|---|---|
| Open | `#FFF7ED` | `#9A3412` | `#F97316` |
| Accepted | `#EFF6FF` | `#1D4ED8` | `#3B82F6` |
| In progress | `#EFF6FF` | `#1D4ED8` | `#3B82F6` (pulsing dot) |
| Resolved | `#ECFDF5` | `#065F46` | `#10B981` |
| Rejected | `#FEF2F2` | `#991B1B` | `#EF4444` |
| Awaiting you | `#FFFBEB` | `#92400E` | `#F59E0B` |

All chips use the same shape: `pill, h-22 px, px-8, label type, 6 px dot leading`.

---

# Navigation Redesign

### Topbar — Stripe-grade restraint

- Height **56 px** mobile, **64 px** desktop. Today's 68 px + glassmorphism is replaced by a flat surface with a single 1 px `border-hairline` bottom.
- **No glassmorphism.** No `scrolled` opaque transition. The bar is always solid `bg-surface`.
- **Logo lockup**: a clean horizontal mark — small flag icon (24 × 24) + wordmark "**Mylapore**" + sub-line "*Grievance Portal*" (caption type). The 3D flag-pole image is reserved for marketing only; the topbar uses a simplified 1-color mark.
- **Items**: `File · Track · My Requests · Profile`. Each is a text link with a thin bottom underline on active (2 px, `brand-red`).
- **Right side**: a single account avatar with a 240 px popover menu (Profile, Settings, Sign out).
- No "Home" item — the logo is home.

### Left side nav (Console layout)

- Width **240 px** desktop. Collapses to a 56 px rail on `md`, hides on `sm`.
- A flat list. Each item: 16 px icon + label + optional count chip. Active state: `bg-surface-2` + 2 px left red bar.
- **No coloured fills, no gradient active states, no nested accordions** on phase one. Categories sit one level deep.

### Breadcrumb (inside wizard)

- A single horizontal strip at top of content: `Health › Vaccination › Add details`.
- Each segment is a button; clicking it triggers the **confirm-discard** dialog if form data exists.
- The breadcrumb replaces the today's destructive sidebar inside the wizard.

### Mobile nav

- The topbar collapses to: logo (left) + avatar (right). A bottom tab bar (52 px, four tabs, max) replaces the desktop top nav: `File · Track · Requests · Profile`. Persistent, never hidden by scroll. Matches the mobile-first principle from stage 2.

---

# Dashboard Redesign

The new `MyGrievances` page is the centerpiece of the console. It is what justifies the visual system.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Topbar                                                          │
├──────────┬───────────────────────────────────────────────────────┤
│ Sidebar  │  Page title + summary                                 │
│ (Filter) │  ┌───────────────────────────────────────────────┐    │
│  All     │  │  ACTION STRIP                                  │   │
│  Open    │  │  • Resume draft (1)  • Awaiting you (2)        │   │
│  Active  │  │  • New updates (3)                             │   │
│  Closed  │  └───────────────────────────────────────────────┘   │
│          │                                                      │
│          │  Active grievances                                   │
│          │  ┌──────────────────────────────────────────────┐    │
│          │  │  [Card]  [Card]  [Card]                       │   │
│          │  └──────────────────────────────────────────────┘    │
│          │                                                      │
│          │  Closed (7)                                  [Show]  │
└──────────┴───────────────────────────────────────────────────────┘
```

### Density

- Card height ~ **96 px** (3-line content). Today's variable card heights are removed.
- **Two cards per row at `lg`, one per row below**. No three-column grid — it pushes the description too short to be useful.
- Vertical rhythm between cards: **12 px**. Inside the card: **8 / 16 / 8** padding.

### Information per card

| Slot | Content |
|---|---|
| Top-left | Status chip + reference ID (`mono`) |
| Title | Short user-given title (`h3`) |
| Body | First 100 chars of description, truncated with ellipsis |
| Right column | Last-updated timestamp + "What's next" one-liner |
| Footer | Tiny action row: `View · Add update · Reopen` (only relevant ones shown) |

No avatars, no flag watermarks, no colour-coded card backgrounds. The chip carries status; the rest is calm.

### The "what's next" line

This single line is the most important content on the dashboard:

- *"Reviewed. Engineer assigned. Visit expected by 15 Mar."*
- *"Photo missing — add to continue."* (rendered as `text-warning` with the inline action `[Add photo]` as an outlined button).

This line is the cure for the audit's "users blame themselves" finding. It tells the user whose turn it is and what's expected next.

### Empty state

- A line drawing (≤ 24 KB SVG), `display-lg` title *"Start with your first complaint"*, body line *"Most Mylapore residents start with **Streetlight** or **Garbage**."*, primary CTA `File a grievance`.
- No flag, no ribbon, no badge.

---

# Card Component Redesign

### One Card, multiple variants

```
Card
├── Card.Header   (optional)
├── Card.Body
└── Card.Footer   (optional)
```

### Visual recipe

- `bg-panel`, `border-hairline`, `radius-lg`, `e1` elevation.
- Hover state: elevation steps from `e1` → `e2` over 120 ms. **No translateY, no scale.** The shadow alone signals interactivity.
- Focus state: 2 px ring in `brand-red` with 2 px offset.
- Active (selected) state: 1 px `border-strong` plus a 2 px left `brand-red` bar.

### Card types and their rules

| Variant | Allowed elements | Forbidden |
|---|---|---|
| **List card** (dashboard ticket) | Chip · Title · Description (3 lines max) · Meta · Inline actions | Gradient fills, decorative imagery, drop-shadowed avatars |
| **Service card** (Landing services grid) | Icon · Title · Description · Optional CTA | Multiple icons, "verified" pills, photo |
| **Stat card** | Big number · Label · Optional sparkline | Decorative blobs, gradient borders |
| **Feature / marketing card** (Landing) | Image · Headline · Body · Single link | More than one CTA, gradient text, ring effects |

### Today vs tomorrow

- Today: dashboard cards have status indicator + 2 progress bars + photo placeholder + 4 buttons + emoji icons.
- Tomorrow: chip + title + 3-line body + "what's next" + ≤ 2 inline actions.

---

# Table Redesign

A table appears on `MyGrievances` (desktop dense mode) and in admin/internal screens.

### Anatomy

- **Header row**: 36 px, `bg-surface-2`, `label` type, sortable arrows on hover.
- **Body rows**: 52 px (compact) or 64 px (default), with a `border-hairline` bottom only — no full grid lines.
- **First column** is the *primary identifier* (title), `text-ink-900` `font-medium`.
- **Last column** is always actions, right-aligned, icon-only with tooltip.
- Zebra striping is `bg-surface-2` every other row, **only on > 10-row tables**.

### Interactions

- Row hover: `bg-surface-2` fill + cursor `pointer`.
- Row click opens the detail view; the actions column has explicit buttons.
- Multi-select via a checkbox column on the left; bulk action bar appears at the top when selection > 0.
- Sorting changes the column header — arrow + `text-ink-900` weight bump.

### Density toggle

Top-right of the table has a `Compact / Default` toggle. Default for first-time users; users with > 20 rows are nudged to `Compact`. Persistent in `localStorage`.

### Anti-patterns to remove

- No coloured row backgrounds for status. Status lives in the chip.
- No mixed text alignment within a single column.
- No more than one element per cell.

---

# Form Redesign

### Inputs

- Height **40 px** default, **44 px** on mobile (touch).
- Radius `md` (10 px).
- Border: `border-hairline` default, `border-strong` on hover, `brand-red` 1.5 px on focus, plus a 3 px `brand-red @ 12%` outer ring.
- Inside padding: 12 / 14 px.
- **Label** above input, `label` type, `text-ink-700`. Required vs optional shown as plain English ("Optional") suffix in `text-ink-500`.
- **Help text** below input, `body-sm`, `text-ink-500`.
- **Error text** replaces help text, `body-sm`, `text-status-danger`, with a small 14 px alert icon leading.

### Composition rules

- Vertical stack only. **No horizontal multi-input rows** on mobile; on desktop, max 2 inputs per row.
- 24 px gap between fields.
- 16 px between input and its label, 8 px between input and help.

### Wizard frame

- Sticky top: progress steps (3 dots / labels) + back affordance.
- Centred content column at L3 layout (640 px max).
- Sticky bottom: primary CTA (`Continue` / `Submit`) + ghost back button. On mobile, the sticky bottom bar holds only the primary; back is in the top breadcrumb.

### Photo upload

- Drop zone: dashed `border-hairline`, height 144 px, with a 20 px icon + "Drag a photo here, or **browse**".
- After upload: thumbnail tile 96 × 96, with a small × in the top-right and a "Replace" link beneath. Up to 3 tiles in a row.

---

# Button System

The system has exactly **five button kinds**. Anything else is a violation.

| Kind | Visual | Use |
|---|---|---|
| **Primary** | `brand-red` gradient fill, white text, `e1` shadow, hover lifts to `e2` | One per screen. The verb the user came for. |
| **Secondary** | `bg-panel` with `border-hairline`, `text-ink-900` | Adjacent action of equal-but-not-primary importance. |
| **Ghost** | No background, no border, `text-ink-700`, hover `bg-surface-2` | Tertiary actions, back, cancel. |
| **Destructive** | `bg-status-danger`, white text | Discard, delete, withdraw. |
| **Link** | Underlined `text-ink-700`, hover `text-ink-900` | Inline navigation within text. |

### Sizes

- `sm` 32 px (table actions, chips).
- `md` 40 px (default).
- `lg` 48 px (primary CTAs in hero + sticky mobile bar).

### Rules

- A button never has a gradient *and* a glow *and* a ring. Pick one signal.
- Icons sit 8 px to the left of the label.
- Loading state: spinner replaces the leading icon; label may change to a present-progressive verb ("Submitting…").
- Disabled: 40% opacity, no shadow, cursor `not-allowed`.
- Buttons never wrap text. If the label is long, the button container expands; it doesn't wrap to two lines.

### Today vs tomorrow

- Today's `tvk-cta-primary` (gradient fill + glow + 4 px border shadow) is replaced by **Primary** (just gradient + e1 elevation).
- Today's `tvk-cta-ghost` (gradient border + glass background) is replaced by **Secondary** (border-hairline + bg-panel).
- The "Resend OTP" pseudo-button (text only, hover underline) becomes **Link**.

---

# Mobile-first Design Adjustments

Mobile is the canonical canvas; desktop is the *expanded* version.

### Breakpoint behaviour

| Element | Mobile | Desktop |
|---|---|---|
| Topbar height | 56 px | 64 px |
| Logo | Icon + "Mylapore" wordmark, sub-line hidden | Icon + wordmark + sub-line |
| Nav | Bottom tab bar (4 items, 52 px) | Top inline links |
| Primary CTA | Sticky bottom (in marketing pages until tapped) | Inline, e1, lg size |
| Wizard step indicator | Compact dots + step name | Dots + all labels |
| Cards | One per row, 100% width | Two per row at `lg` |
| Filters | Sticky pill row at top of list | Left sidebar |
| Tables | Cards instead of tables | Tables |
| Modal | Bottom sheet, slides up to 80% height | Centered dialog, max 560 px |

### Mobile-specific affordances

- **Bottom tab bar** is the persistent way home. The topbar's account avatar is the only top-right action.
- **Sticky primary CTA** appears once the inline CTA has scrolled off; disappears when the user enters a wizard or form (which has its own sticky bottom CTA).
- **No `hidden lg:*`** on anything that the user could need to perform a primary task.

### Touch targets

44 × 44 minimum for every interactive element. Filter pills, chips, breadcrumb segments, table actions on mobile, dropdown options, OTP digit boxes — all measured.

### Motion on mobile

Motion is reduced on small screens by default: hero reveal animations, marquees, gradient shimmers are off; only state-change motion (modal slide, toast slide) remains. `prefers-reduced-motion` further reduces.

---

# UI Consistency Rules

These are the rules a designer reviewing a PR can check against in 60 seconds.

1. **Spacing** uses tokens from the scale only. No `mt-[19px]`, no `gap-[14px]`.
2. **Radius** uses one of `sm / md / lg / xl`. No `rounded-[7px]`.
3. **Color** uses tokens by role. No hard-coded hex except inside `tokens.css`.
4. **Type** uses one of the named scale steps. No `text-[13.5px]`.
5. **Buttons** belong to one of the five kinds. No bespoke buttons.
6. **Cards** use the Card recipe. No raw `<div className="rounded-3xl shadow-...">`.
7. **Shadows** use `e0 / e1 / e2`. No bespoke shadow values.
8. **Icons** are 16 px (inline), 20 px (buttons/list), 24 px (cards/headers), 40 px+ (illustrations). No 18 px, no 22 px.
9. **Decoration cap**: at most **2** decorative elements per surface (one illustration + one accent stroke). Anything more is a defect.
10. **Brand red as fill** lives only on: logo container, Primary buttons, the underline accent under hero titles, and inside chips.
11. **Tamil text** carries `lang="ta"` and is one weight step lighter than the adjacent Latin.
12. **Every image** has either meaningful `alt` or `aria-hidden="true"` + `alt=""`. No third option.

---

# Visual Simplification Opportunities

### Remove outright

- The animated `tvk-blob` decorations on every section.
- The yellow grid overlay on every hero.
- The flag watermark on every section (`TvkFlagDecor` is kept as a component but used once — on the Landing hero — at low intensity, optional).
- The marquee strip ("Resolve in 7 days · GPS-tagged…") — its content goes into the hero's evidence line.
- Decorative geometric accents inside the MLA hero card (rotated square, circle, ring).
- The gradient-text headline treatment everywhere except the Landing hero title.
- The "scrolled" glassmorphism state on the topbar.
- All `tvk-cta-*` custom CSS — replaced by the 5-kind Button system.
- The custom `tvk-bg-dark` and `tvk-bg` red gradient utility classes.
- The "Verified MLA", "Live", and "Portal Active" pills on the hero — replaced by **one** trust line below the headline that links to a proof page.

### Simplify

- **Hero**: from ~14 elements above the fold → **5** (microcopy → headline → subhead → primary CTA → secondary link).
- **Footer**: from 6+ columns → **3** (Services, Help, Policies) + a single "About TVK" link tucked into a meta row, per stage 2's separation principle.
- **MyGrievances card**: from ~10 visual elements → **6** (chip, title, description, what's next, timestamp, actions).
- **Service list on Landing**: from 9 brightly coloured cards → a 3×3 grid of monochrome cards with the icon as the only colour anchor.
- **Pledge banners**: replace background photo + overlay + multiple gradients with a single solid `ink-900` panel + a Tamil + English headline + a single hairline accent in yellow.

### Make visually dominant

- The **primary CTA** on every page (one per page, lg size, primary kind, brand-red gradient).
- The **headline** on every page (display-xl or display-lg, ink-900, tightened tracking).
- The **status chip + "what's next"** line on every grievance card.
- The **submission confirmation** screen — the moment the user has acted. This is the place to be most generous with space, type size, and clarity.

### Deferred (do not redesign yet)

- Dark mode.
- Internationalisation beyond Tamil + English.
- Admin / MLA-office side of the product (not in this audit's scope).

---

## Visual KPIs for this redesign

| Metric | Target |
|---|---|
| Distinct elements above the fold on Landing | ≤ 7 |
| Decorative layers per section | ≤ 2 |
| Total fonts loaded | 2 families |
| Total colour tokens used in CSS | ≤ 24 |
| Total radii used | 4 |
| Total elevation values used | 3 |
| Button kinds in production | 5 |
| Screens that meet WCAG AA contrast on critical paths | 100% |

A redesign that ships within these numbers is a win, before any user research.

---

*End of visual direction. Stage 04 will turn this direction into component-by-component specs and a tokens file the codebase can implement directly.*
