# Mylapore Grievance Portal — Component Execution Plan

> **Stage:** 04 — Implementation-ready frontend tasks.
> **Inputs:** `outputs/01_ui_audit.md`, `outputs/02_ux_improvement_strategy.md`, `outputs/03_visual_redesign_direction.md`.
> **Audience:** Frontend engineers + design.
> **Output stack:** React + Vite + Tailwind (current). All tokens specified below assume Tailwind config extension; nothing requires a framework change.

### How to read this document

Every component has:
1. **Current issue** — what's wrong, with file references.
2. **Redesign goal** — the user/business outcome.
3. **Exact UI changes** — what to delete, what to add, in concrete terms (Tailwind classes, props, structure).
4. **Interaction** — events, states, motion, focus.
5. **Responsive** — sm / md / lg behaviour.
6. **Spacing & layout** — tokens, not magic numbers.
7. **Acceptance criteria** — how to know it's done.

### Pre-requisite: ship the token foundation first

Before any component work, land a `tokens.css` and an extended `tailwind.config.js` that expose:

- Colours: `surface`, `surface-2`, `panel`, `hairline`, `border-strong`, `ink-{400,500,700,900}`, `brand-red`, `brand-yellow`, `status-{success,warning,danger,info}`.
- Radii: `sm 6, md 10, lg 14, xl 20`.
- Shadows: `e1`, `e2`.
- Spacing scale matches Tailwind's default minus stray values; lint anything not on the scale.
- Type tokens: `display-2xl, display-xl, display-lg, h1, h2, h3, body, body-sm, mono, label, overline`.

Every component below uses these tokens. No hex codes, no inline gradients except the one Primary button gradient.

---

# Header Changes

**Component:** `@d:\Downloads\MylaporeConstituency-main (1)\MylaporeConstituency-main\src\components\Topbar.jsx`

### Current issue
- Glassmorphism + `scrolled` state transitions the background unpredictably as content scrolls beneath.
- Logo container is a 40 px square holding a portrait 3D flag image — the actual flag becomes ~12 px tall and is visually unreadable.
- "Home" appears conditionally; non-logged-in users see almost no nav.
- Account menu uses `mousedown` outside-click but no keyboard escape.
- Hard-coded gradients and shadows.

### Redesign goal
A flat, always-solid bar that disappears from the user's mind. Logo + verbs. No theatre.

### Exact UI changes

```
<header class="h-14 lg:h-16 bg-surface border-b border-hairline sticky top-0 z-50">
  <div class="max-w-[1200px] mx-auto h-full px-4 lg:px-8 flex items-center gap-4">

    <!-- Brand lockup -->
    <Link to="/" class="flex items-center gap-2 shrink-0">
      <Logo size="sm" />                                <!-- 24px icon + wordmark -->
      <span class="hidden md:flex flex-col leading-tight">
        <span class="text-[15px] font-semibold text-ink-900">Mylapore</span>
        <span class="text-[11px] text-ink-500 font-medium">Grievance Portal</span>
      </span>
    </Link>

    <!-- Primary nav (desktop only) -->
    <nav class="hidden lg:flex items-center gap-1 ml-6">
      <TopbarLink to="/grievance">File</TopbarLink>
      <TopbarLink to="/track">Track</TopbarLink>
      <TopbarLink to="/my-grievances">My Requests</TopbarLink>
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <LangSwitcher />                                   <!-- Existing -->
      <AccountMenu />                                    <!-- avatar + popover -->
    </div>
  </div>
</header>
```

- Remove `tvk-nav` class and `scrolled` state entirely.
- Replace existing hero-image logo with a new lightweight `<Logo>` component that renders a 24 × 24 simplified mark (flat SVG of the flag, not the 3D PNG). The 3D PNG stays for marketing surfaces only.
- Remove the conditional Home item. The Logo is Home.
- Remove `shadow-lg shadow-tvk-red/30`. Use the hairline bottom border alone.

### `TopbarLink` recipe

```
<NavLink class={({ isActive }) => cn(
  "px-3 py-2 rounded-md text-[14px] font-medium text-ink-700 hover:bg-surface-2 hover:text-ink-900 transition-colors",
  isActive && "text-ink-900 relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:bg-brand-red"
)} />
```

### `AccountMenu` recipe

- Trigger: avatar circle 32 × 32 with user initial, `border-hairline`, `bg-surface-2`.
- Popover: 240 px wide, e2 elevation, radius `md`. Items: Profile, Settings, Sign out.
- Focus trap inside menu when open; `Escape` closes; arrow keys move focus.

### Interaction
- No scroll-triggered re-style.
- `Escape` closes any open popover.
- Tab order: logo → nav links left-to-right → lang switcher → avatar.

### Responsive
- `sm` (< 768 px): only Logo (no wordmark) on the left, `AccountMenu` on the right. Primary nav lives in the **Bottom Tab Bar** (separate component, see Mobile Interaction Improvements).
- `md` (768–1023 px): Logo + wordmark, no top nav links (bottom tab bar still in use).
- `lg` (≥ 1024 px): Full inline nav, no bottom tab bar.

### Spacing & layout
- Height: 56 px mobile, 64 px desktop.
- Container max 1200 px.
- Horizontal padding: `px-4` mobile, `px-8` desktop.
- Gap between brand and nav: 24 px (`ml-6`).

### Acceptance criteria
- [ ] Topbar height is constant; no jump on scroll.
- [ ] No `backdrop-filter`, no `bg-white/60`, no `tvk-nav` references remain.
- [ ] Tab order is logical end-to-end.
- [ ] Logo focus ring meets AA contrast.
- [ ] Active link underline animates in 120 ms.

---

# Sidebar Changes

**Components:** `MyGrievances.jsx` (filter sidebar), `GrievanceHome.jsx` (category sidebar), `TrackStatus.jsx` (sidebar of unknown utility).

### Current issue
- Two different sidebar widths (260 / 280 px) and two different active styles (navy `#2c4569`, red gradient).
- `GrievanceHome` sidebar **resets the wizard on click**, destroying form data.
- `TrackStatus` sidebar items are `<div onClick>` — keyboard inaccessible.
- All sidebars are `hidden lg:flex` — feature missing on mobile.

### Redesign goal
A single `Sidebar` component used consistently. Inside the wizard, it is **replaced by a breadcrumb**, not just hidden.

### Exact UI changes

#### New shared component: `Sidebar`

```
<aside class="hidden lg:flex w-[240px] shrink-0 border-r border-hairline bg-surface">
  <nav class="flex flex-col py-3 px-2 gap-0.5 w-full">
    <SidebarItem to="…" icon={Icon} count={n} active={…}>Label</SidebarItem>
    …
  </nav>
</aside>
```

#### `SidebarItem` recipe

```
<button class={cn(
  "flex items-center gap-3 px-3 h-9 rounded-md w-full text-left text-[14px] font-medium",
  "text-ink-700 hover:bg-surface-2 hover:text-ink-900",
  active && "text-ink-900 bg-surface-2 relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-brand-red before:rounded-r"
)}>
  <Icon class="w-4 h-4 shrink-0 text-ink-500" />
  <span class="truncate">{label}</span>
  {count != null && <span class="ml-auto text-[12px] font-semibold text-ink-500">{count}</span>}
</button>
```

#### `MyGrievances` filter sidebar
- Use `Sidebar` with items: `All / Open / Active / Closed`. The current 5-status list is collapsed into 4 categories (Accepted + In progress = "Active") — see UX strategy D1.
- Counts come from the same `requests` array, derived once.

#### `GrievanceHome` — remove the category sidebar entirely
- Step 1 of the wizard renders categories **as the primary content**, not as a side rail.
- Steps 2–3 render `Breadcrumb` (new component) at the top of the form column.

#### `TrackStatus` sidebar
- Removed. The page is now a single column showing the user's most recent grievance with a "View another" dropdown for older ones (per UX strategy W4).

### Interaction
- `SidebarItem` is a `<button>` (or `<NavLink>` if it navigates). Never `<div onClick>`.
- Focus ring: 2 px `brand-red` with 2 px offset.
- Mobile: sidebar collapses; filters move to a sticky horizontal pill row (see Mobile Interaction Improvements).

### Responsive
- `sm` / `md`: hidden; filters surface as sticky pill row at top of list.
- `lg`: fixed 240 px left rail.

### Spacing & layout
- Width: 240 px (was 260–280).
- Item height: 36 px (`h-9`).
- Vertical padding: 12 px top/bottom on the nav container.
- Gap between items: 2 px (`gap-0.5`).

### Acceptance criteria
- [ ] No `<div onClick>` sidebar items remain.
- [ ] `GrievanceHome` no longer renders the categories sidebar on steps 2+.
- [ ] Width and active style identical across pages.
- [ ] Keyboard tab order moves through every item; arrow keys are *not* required (linear list).

---

# Navigation Improvements

**Components:** `Topbar`, `Breadcrumb` (new), `BottomTabBar` (new).

### Current issue
- No breadcrumb in the wizard.
- Mobile users lack a persistent way to switch between primary tasks.

### Redesign goal
Two persistent surfaces: a slim top brand bar and (on mobile) a 4-item bottom tab bar. Inside multi-step flows, a breadcrumb at the top of the column shows position.

### `Breadcrumb` component (new)

```
<nav aria-label="Breadcrumb" class="flex items-center gap-1 text-[13px] text-ink-500">
  {segments.map((seg, i) => (
    <Fragment>
      <button onClick={…} class="px-1.5 py-1 rounded hover:bg-surface-2 hover:text-ink-900 transition-colors">
        {seg.label}
      </button>
      {i < segments.length - 1 && <ChevronRight class="w-3.5 h-3.5 text-ink-400" />}
    </Fragment>
  ))}
  <span class="ml-1 text-ink-900 font-medium">{currentLabel}</span>
</nav>
```

- Clicking a non-current segment triggers a **confirm-discard dialog** (per UX strategy W2) when there is dirty form data.
- The current step is plain text, not a button.

### `BottomTabBar` (new, mobile only)

```
<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-hairline h-[52px] grid grid-cols-4">
  <TabItem to="/grievance" icon={FileText}>File</TabItem>
  <TabItem to="/track" icon={Search}>Track</TabItem>
  <TabItem to="/my-grievances" icon={Eye}>Requests</TabItem>
  <TabItem to="/profile" icon={UserIcon}>Profile</TabItem>
</nav>
```

- `TabItem` is a `<NavLink>` rendering a 20 px icon + `text-[11px] font-semibold` label, centred.
- Active state: icon and label step from `ink-500` to `ink-900`, with a 2 px top stroke of `brand-red`.
- Items are `min-h-[44px] min-w-[44px]` touch targets.

### Acceptance criteria
- [ ] Breadcrumb confirms before discarding data when user changes category mid-wizard.
- [ ] Bottom tab bar is visible on every authenticated page on `sm` and `md`.
- [ ] Bottom tab bar is `lg:hidden`; top nav appears only at `lg`.

---

# Dashboard Card Changes

**Component:** `MyGrievances.jsx` list cards.

### Current issue
- Cards have inconsistent heights, decorative borders, emoji icons (`🔴 🔵 ✅ ⛔`), per-status colored progress bars, percentages with no link to reality.
- The card answers *"what is this?"* but not *"whose turn is it?"*.

### Redesign goal
A calm, scannable card where status + next action are the eye targets. Two cards per row at `lg`, one at `md` and below.

### Exact UI changes

#### `GrievanceCard` recipe

```
<article class="bg-panel border border-hairline rounded-lg p-4 lg:p-5
                hover:shadow-e2 transition-shadow
                focus-within:ring-2 focus-within:ring-brand-red focus-within:ring-offset-2">

  <header class="flex items-center justify-between gap-3 mb-2">
    <StatusChip status={r.status} />                       <!-- See Status Chip recipe -->
    <span class="font-mono text-[12px] text-ink-500 truncate">{r.ref}</span>
  </header>

  <h3 class="text-[16px] font-semibold text-ink-900 leading-snug truncate">
    {r.title}
  </h3>

  <p class="mt-1 text-[14px] text-ink-700 leading-relaxed line-clamp-2">
    {r.description}
  </p>

  <div class="mt-3 flex items-start gap-2 text-[13px] text-ink-700">
    <Activity class="w-4 h-4 mt-0.5 text-ink-500 shrink-0" />
    <span>{r.whatsNext}</span>                             <!-- "Engineer assigned. Visit by 15 Mar." -->
  </div>

  <footer class="mt-4 flex items-center justify-between text-[12px] text-ink-500">
    <span title={r.updatedAt}>Updated {relTime(r.updatedAt)}</span>
    <div class="flex items-center gap-1">
      <ButtonGhost size="sm" onClick={…}>View</ButtonGhost>
      {r.needsInput && <ButtonSecondary size="sm" onClick={…}>{r.inputAction}</ButtonSecondary>}
    </div>
  </footer>
</article>
```

#### `StatusChip` recipe

- One component, six tones (per stage 3 palette). Renders a leading dot + label, all in label type.

```
<span class="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11px] font-semibold tracking-wide"
      data-tone={tone}>
  <span class="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
  {label}
</span>
```

Styles set via `data-tone="open|active|resolved|rejected|awaiting|info"` selectors, not via inline color props.

#### Remove
- Emoji icons in `STATUS_LABELS`.
- Per-card progress bar with fake percentages (`pct: '12%'…`).
- Coloured per-row backgrounds.
- Decorative card watermarks if added.

### Interaction
- Whole card click → opens detail. The `View` button is for screen-reader / keyboard users — both targets navigate to the same place.
- Hover: shadow `e1` → `e2`, 120 ms.
- Focus-within shows the ring; tab order goes title → primary action → secondary action.
- `Enter` and `Space` on the card open detail.

### Responsive
- `sm`: full-width single column, padding `p-4`, line-clamp `2`.
- `md`: full-width single column, padding `p-5`.
- `lg`: two-up grid (`grid-cols-2 gap-3`).

### Spacing & layout
- Card padding: 16 / 20 px.
- Vertical gap between cards: 12 px.
- Inside-card gaps: 8 / 12 / 16 (header → title → description → next → footer).

### Acceptance criteria
- [ ] All emoji removed from status indicators.
- [ ] No fake percentage bars.
- [ ] StatusChip used everywhere; no bespoke status pill markup.
- [ ] Card is keyboard-operable end-to-end.
- [ ] "What's next" line appears on every active card.

---

# Table Improvements

**Where:** Admin/dense views of `MyGrievances`; future internal tables.

### Current issue
- No real table exists today (everything is cards). When dense views appear (e.g., > 20 rows, or admin), they will be invented ad-hoc.

### Redesign goal
A single `DataTable` recipe that admin and power users can scale into.

### `DataTable` skeleton

```
<table class="w-full text-[14px]">
  <thead class="bg-surface-2 text-ink-500 text-[12px] font-semibold uppercase tracking-wide">
    <tr>
      <th class="text-left px-4 h-9 font-semibold">Title</th>
      <th class="text-left px-4 h-9 font-semibold">Status</th>
      <th class="text-left px-4 h-9 font-semibold">Updated</th>
      <th class="text-right px-4 h-9 font-semibold">Actions</th>
    </tr>
  </thead>
  <tbody>
    {rows.map(r => (
      <tr class="border-b border-hairline hover:bg-surface-2 cursor-pointer">
        <td class="px-4 h-13 text-ink-900 font-medium">{r.title}</td>
        <td class="px-4 h-13"><StatusChip status={r.status} /></td>
        <td class="px-4 h-13 text-ink-500">{relTime(r.updatedAt)}</td>
        <td class="px-4 h-13 text-right">
          <IconButton ariaLabel="View" icon={Eye} />
          <IconButton ariaLabel="More" icon={MoreHorizontal} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Density toggle
- Top-right of table area: a `Segmented` control (Default / Compact). Compact reduces row height to 40 px.

### Interaction
- Row click opens detail (same target as `View`).
- `Tab` cycles through actionable cells; `Enter` activates.
- Sort: click header → arrow appears, second click reverses, third clears.

### Responsive
- `sm`/`md`: `DataTable` is replaced by `GrievanceCard` list. Do not horizontally scroll tables on mobile.
- `lg`+: full table.

### Acceptance criteria
- [ ] No `<table>` rendered on `sm`/`md`.
- [ ] `StatusChip` used in cells; no bespoke chip in tables.
- [ ] Header row uses `bg-surface-2`, body rows have hairline bottom only.
- [ ] Sort arrows appear only on sortable columns.

---

# Form Improvements

**Components:** `LoginPage`, `RegisterPage`, `GrievanceHome` (wizard), `LocationPicker`, photo upload.

### Current issue
- Some fields rely on placeholder-as-label.
- Validation appears at submit, not on blur.
- Inputs have varying heights, radii, focus styles.
- Wizard sticky-bottom CTA is inconsistent.

### Redesign goal
A single `<TextField>` primitive and a single wizard frame. Forms feel the same on every page.

### `TextField` primitive

```
<div class="flex flex-col gap-2">
  <label for={id} class="text-[12px] font-semibold tracking-wide text-ink-700">
    {label}{!required && <span class="ml-1 text-ink-500 font-normal">Optional</span>}
  </label>
  <input id={id}
         class={cn(
           "h-10 lg:h-10 px-3 rounded-md border border-hairline bg-panel text-[15px] text-ink-900",
           "placeholder:text-ink-400 hover:border-border-strong",
           "focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/15",
           error && "border-status-danger focus:border-status-danger focus:ring-status-danger/15"
         )}
         placeholder={`e.g. ${example}`} />
  {error ? (
    <p class="text-[13px] text-status-danger flex items-start gap-1.5"><AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />{error}</p>
  ) : help ? (
    <p class="text-[13px] text-ink-500">{help}</p>
  ) : null}
</div>
```

- Mobile input height bumps to **44 px** for touch (`sm:h-11 lg:h-10` — choose the convention you prefer; documented preference: `h-11 sm:h-10`).
- Validate on blur, not on keystroke. Show success state (small green check inside input on success — only on critical fields like phone/OTP).

### Wizard frame

```
<div class="min-h-[calc(100dvh-56px)] lg:min-h-[calc(100vh-64px)] flex flex-col">
  <div class="border-b border-hairline px-4 lg:px-8 py-3 flex items-center justify-between">
    <Breadcrumb segments={…} />
    <Stepper current={step} total={totalSteps} />
  </div>

  <div class="flex-1 overflow-y-auto">
    <div class="max-w-[640px] mx-auto px-4 lg:px-0 py-8 lg:py-12">
      {/* Step content */}
    </div>
  </div>

  <div class="border-t border-hairline px-4 lg:px-8 py-3 flex items-center justify-between bg-surface">
    <ButtonGhost onClick={back}>Back</ButtonGhost>
    <ButtonPrimary onClick={next} loading={loading}>{nextLabel}</ButtonPrimary>
  </div>
</div>
```

- Sticky bottom bar holds the primary action.
- Stepper shows current step out of total (e.g., `Step 2 of 3 · Where`).

### `LocationPicker`
- Add a top tab order: GPS → Map pin → Type address (per UX strategy F5).
- Map opens as a bottom sheet on mobile (80% height), centered modal on desktop.
- "Use my current location" runs `navigator.geolocation` with a visible 1-line privacy notice.

### Photo upload
- Replace the existing drop area with the standard upload component:
  - Empty: dashed `border-hairline`, 144 px height, icon + label, click + drop both work.
  - With files: row of 96 × 96 thumbnails, each with a 20 px × in the top-right and "Replace" link below.
  - Browser-side compression to ~1.5 MB before upload (use `browser-image-compression` or `canvas.toBlob`).

### Acceptance criteria
- [ ] No `placeholder`-only fields anywhere.
- [ ] Validation runs on `onBlur` with `aria-invalid` set correctly.
- [ ] Wizard's sticky bottom bar is identical across all three steps.
- [ ] Mobile input height ≥ 44 px.

---

# Button System Improvements

**Files affected:** every page; centralise in `@d:\Downloads\MylaporeConstituency-main (1)\MylaporeConstituency-main\src\components` as `Button.jsx`.

### Current issue
- Three custom CSS classes (`tvk-cta`, `tvk-cta-primary`, `tvk-cta-ghost`) plus countless ad-hoc button markup.
- Inconsistent heights, radii, paddings, focus rings.
- Buttons sometimes carry shadows + gradients + glows simultaneously.

### Redesign goal
A `<Button>` component with `kind` and `size` props that produces every legitimate button in the app.

### Component contract

```
type ButtonProps = {
  kind?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link'
  size?: 'sm' | 'md' | 'lg'
  iconLeft?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  as?: 'button' | 'a' | typeof Link
}
```

### Visual recipes (Tailwind)

```
const base = "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-[-0.005em] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 select-none";

const sizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-5 text-[15px]",
};

const kinds = {
  primary:     "text-white shadow-e1 hover:shadow-e2 active:translate-y-px focus-visible:ring-brand-red/25",  // background set via inline style: linear-gradient(180deg,#DA1A38 0%,#B40C26 100%)
  secondary:   "bg-panel text-ink-900 border border-hairline hover:bg-surface-2 hover:border-border-strong focus-visible:ring-ink-900/15",
  ghost:       "text-ink-700 hover:bg-surface-2 hover:text-ink-900 focus-visible:ring-ink-900/15",
  destructive: "bg-status-danger text-white hover:brightness-[1.05] focus-visible:ring-status-danger/30",
  link:        "px-0 h-auto text-ink-700 underline underline-offset-2 hover:text-ink-900",
};
```

- Loading: leading icon is replaced with a `Loader2` spinner; label becomes the present-progressive verb (passed by the caller via `loadingLabel`).
- Disabled: `opacity-40 cursor-not-allowed pointer-events-none`.

### Delete
- Custom CSS `tvk-cta`, `tvk-cta-primary`, `tvk-cta-ghost` from `@d:\Downloads\MylaporeConstituency-main (1)\MylaporeConstituency-main\src\index.css`.
- All bespoke `<button class="rounded-2xl bg-gradient-to-...">` markup.

### Acceptance criteria
- [ ] No usage of `tvk-cta-*` in any JSX.
- [ ] No inline gradient on buttons except the single Primary gradient.
- [ ] Focus ring visible on keyboard focus, not on mouse click.
- [ ] All buttons have at most one signal (gradient *or* shadow on hover, not both).

---

# Modal Improvements

**Components needed:** `Modal` (desktop), `BottomSheet` (mobile), `ConfirmDialog` (special case).

### Current issue
- `LocationPicker` modal exists but is bespoke. There is no shared modal pattern. Confirm-discard dialogs don't exist at all.

### Redesign goal
One overlay system. Adapts to viewport. Accessible.

### `Modal` recipe

```
<DialogRoot open={open} onOpenChange={…}>
  <DialogBackdrop class="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px]" />
  <DialogContent class="fixed z-50
                        lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-[560px] lg:w-[90vw] lg:rounded-xl
                        max-lg:inset-x-0 max-lg:bottom-0 max-lg:rounded-t-xl
                        bg-panel shadow-e2 outline-none focus:outline-none flex flex-col max-h-[85dvh]">
    <header class="flex items-center justify-between border-b border-hairline px-5 h-12">
      <h2 class="text-[16px] font-semibold text-ink-900">{title}</h2>
      <IconButton ariaLabel="Close" icon={X} onClick={onClose} />
    </header>
    <div class="px-5 py-4 overflow-y-auto">{children}</div>
    <footer class="border-t border-hairline px-5 py-3 flex items-center justify-end gap-2">
      <Button kind="ghost" onClick={onClose}>Cancel</Button>
      <Button kind="primary" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
    </footer>
  </DialogContent>
</DialogRoot>
```

- Use `@radix-ui/react-dialog` (or equivalent) for accessibility (focus trap, escape, return focus).
- Mobile renders as a bottom sheet (full-width, top-rounded, swipe-down to close).
- Backdrop click closes, unless `dismissable={false}`.

### `ConfirmDialog`
- Pre-configured `Modal` variant. Used by the wizard breadcrumb when the user navigates away with dirty data.
- Title: *"Discard this draft?"*
- Body: *"You'll lose what you've entered for this complaint."*
- Footer: ghost `Keep editing`, destructive `Discard`.

### Acceptance criteria
- [ ] Focus traps inside dialog while open.
- [ ] `Escape` closes (unless explicitly disabled).
- [ ] Background scroll is locked while open.
- [ ] Mobile sheet swipe-down closes.

---

# Empty State Improvements

**Where:** `MyGrievances` empty list, `TrackStatus` no-results, search empty.

### Current issue
- Empty list rendered as a blank space.
- No CTA from empty states; user must navigate elsewhere to make progress.

### Redesign goal
Every empty state has a single illustration line, a title, a body line, and a primary CTA.

### `EmptyState` recipe

```
<div class="flex flex-col items-center text-center max-w-md mx-auto py-16 px-6">
  <Illustration name={name} class="w-24 h-24 mb-6" />     <!-- Single-line SVG, ≤24KB -->
  <h3 class="text-[20px] font-semibold text-ink-900 mb-2">{title}</h3>
  <p class="text-[14px] text-ink-500 mb-6">{body}</p>
  <Button kind="primary" size="md" onClick={…}>{ctaLabel}</Button>
</div>
```

### Examples

- **MyGrievances empty.** Title: *"Start with your first complaint"*. Body: *"Most Mylapore residents start with Streetlight or Garbage."* CTA: *"File a grievance"*.
- **Track no-results.** Title: *"No grievance found"*. Body: *"Check the reference ID, or use the phone number you registered with."* CTA: *"Use phone number"*.

### Acceptance criteria
- [ ] Every list / table component has an `EmptyState` branch.
- [ ] Illustrations are inline SVG, not images.

---

# Error State Improvements

### Current issue
- Errors surface as red boxes at the top of forms or unstyled alerts.
- Toasts exist but aren't `aria-live`.
- Network/server errors have no consistent fallback UI.

### Redesign goal
Three classes of error feedback, each consistent.

### A. Inline field error
Already covered in `TextField`. Below the input, `text-status-danger` with a 14 px alert icon.

### B. Banner / form-level error

```
<div role="alert"
     class="flex items-start gap-3 rounded-md border border-status-danger/30 bg-status-danger/5 px-4 py-3">
  <AlertCircle class="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
  <div class="flex-1">
    <p class="text-[14px] font-semibold text-ink-900">{title}</p>
    <p class="text-[13px] text-ink-700 mt-0.5">{body}</p>
  </div>
  {action && <Button kind="ghost" size="sm" onClick={action.onClick}>{action.label}</Button>}
</div>
```

- One banner per form, at the top of the form (not floating).

### C. Toast

```
<div role="status" aria-live="polite"
     class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-md bg-ink-900 text-white px-4 h-11 shadow-e2">
  {Icon && <Icon class="w-4 h-4" />}
  <span class="text-[14px] font-medium">{message}</span>
</div>
```

- Auto-dismiss after 4 s.
- On mobile, sits above the bottom tab bar (z and offset adjusted).
- Stacks vertically when multiple toasts overlap.

### D. Page-level fallback (Error Boundary)

- Wrap the app root in `<ErrorBoundary>`.
- On error: full-screen layout with an illustration, a calm title (*"Something went wrong on our end"*), a body line, a `Reload` primary button and a `Go home` ghost button. Logs to console (or telemetry).

### Acceptance criteria
- [ ] All toast containers carry `aria-live="polite"` (or `aria-live="assertive"` for destructive failures).
- [ ] Banner and toast colours are tokenised (no inline hex).
- [ ] Error Boundary exists at app root.

---

# Responsive Design Tasks

A flat list of changes engineering must verify on every page.

| # | Change | Files |
|---|---|---|
| R1 | Container max-width 1200 px on all marketing surfaces | `LandingPage`, `Footer` |
| R2 | Drop `hidden lg:flex` for filter sidebars; replace with mobile pill row | `MyGrievances`, `TrackStatus`, `GrievanceHome` |
| R3 | Drop `hidden lg:flex` for auth trust panels; replace with mobile trust strip | `LoginPage`, `RegisterPage` |
| R4 | Wordmark on topbar visible from `md` (was `sm`); on `sm` only the logo, with the wordmark in a focused state | `Topbar` |
| R5 | Add `BottomTabBar` on `sm` and `md` | new component |
| R6 | All inputs ≥ 44 px height on `sm` | `TextField` |
| R7 | All buttons ≥ 44 px height on `sm` (size `lg` everywhere mobile-CTAs render) | `Button`, callers |
| R8 | Replace `<table>` with `GrievanceCard` list on `sm`/`md` | future `DataTable` |
| R9 | Modal becomes bottom sheet on `sm`/`md` | `Modal` |
| R10 | Hero typography steps down: `display-xl` on `sm`, `display-2xl` on `lg` | `LandingPage` |
| R11 | Single-column wizard at every breakpoint (no two-column desktop tricks) | `GrievanceHome` |
| R12 | Footer columns: 3 on `lg`, 2 on `md`, 1 on `sm` (currently inconsistent) | `Footer` |
| R13 | Decorative elements respect `prefers-reduced-motion` and the small-screen heuristic | `index.css` keyframes |
| R14 | All overflow-x:auto containers labelled with `role="region" aria-label` | `Marquee`, scroll rails |

---

# Mobile Interaction Improvements

### M1 — Bottom Tab Bar
Implemented per the Navigation section. Persistent, 52 px height, four items max.

### M2 — Sticky primary CTA on marketing pages
A separate `<StickyCta>` component that appears on `sm`/`md` after the inline hero CTA scrolls past:

```
<div class="lg:hidden fixed left-0 right-0 z-30 bottom-[52px] /* above tab bar */
            p-3 bg-surface/95 backdrop-blur-sm border-t border-hairline transition-transform"
     data-visible={visible}>
  <Button kind="primary" size="lg" fullWidth>File a grievance</Button>
</div>
```

- Toggle visibility on scroll past the inline CTA threshold.
- Disappear once the user enters a wizard or form.

### M3 — Filter pill row (mobile)
Replaces the `Sidebar` on `sm`/`md` for `MyGrievances`:

```
<div role="tablist" class="lg:hidden sticky top-14 z-20 bg-surface border-b border-hairline overflow-x-auto">
  <div class="flex gap-2 px-4 py-2 min-w-max">
    <FilterPill active={…}>All <count /></FilterPill>
    <FilterPill active={…}>Open <count /></FilterPill>
    <FilterPill active={…}>Active <count /></FilterPill>
    <FilterPill active={…}>Closed <count /></FilterPill>
  </div>
</div>
```

- Each pill: `h-9 px-3 rounded-full border border-hairline text-[13px]`; active state: `bg-ink-900 text-white border-ink-900`.
- Horizontal scroll lock; keyboard left/right arrows move focus.

### M4 — Pull to refresh
Use a lightweight library (e.g., `react-simple-pull-to-refresh`) on `MyGrievances` and `TrackStatus`. Pull triggers an immediate fetch.

### M5 — Disable hover effects on touch devices
- Wrap hover-dependent CSS in `@media (hover: hover)` so touch users don't get sticky hover states after tapping.

### M6 — Reduce motion on mobile by default
- Add a media query: `@media (max-width: 640px) and (prefers-reduced-motion: no-preference) { /* keep only state-change motion */ }`. Decorative motion (blobs, marquee, gradient shimmer) is dropped from mobile entirely.

### M7 — Tap target audit
- All clickable elements measured to ≥ 44 × 44 on mobile.

### Acceptance criteria
- [ ] Bottom tab bar present on `sm`/`md` for authenticated users.
- [ ] Sticky CTA appears/disappears correctly with scroll on landing.
- [ ] Filter pill row appears on `sm`/`md` for `MyGrievances`.
- [ ] No hover styles applied via tap on a touch device.

---

# Frontend Handoff Notes

### Folder structure (suggested additions)

```
src/
  components/
    primitives/           ← Button, TextField, StatusChip, IconButton, Card
    layout/               ← Topbar, BottomTabBar, Sidebar, Breadcrumb, StickyCta
    feedback/             ← Modal, ConfirmDialog, EmptyState, Toast, ErrorBanner
    grievance/            ← GrievanceCard, GrievanceWizardFrame, PhotoUploader, LocationPicker
    decorative/           ← TvkFlagDecor (kept, used once on Landing hero)
  styles/
    tokens.css            ← all CSS custom properties
    motion.css            ← all keyframes, with reduced-motion guards
    base.css              ← resets, body type, link defaults
  hooks/
    useDraftPersistence.js
    usePollingWithVisibility.js
    useDirtyForm.js
```

### Token implementation pattern (`tokens.css`)

```
:root {
  --surface: #FFFFFF;
  --surface-2: #F8FAFC;
  --panel: #FFFFFF;
  --hairline: #E5E7EB;
  --border-strong: #D1D5DB;

  --ink-900: #0B1220;
  --ink-700: #1F2A37;
  --ink-500: #5B6776;
  --ink-400: #8794A3;

  --brand-red: #C8102E;
  --brand-yellow: #F5B600;

  --status-success: #0F9D58;
  --status-warning: #D97706;
  --status-danger: #DC2626;
  --status-info: #1D4ED8;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --e1: 0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.06);
  --e2: 0 8px 24px -8px rgba(15,23,42,.12), 0 2px 6px rgba(15,23,42,.06);
}
```

In `tailwind.config.js`, expose them as theme tokens (`colors`, `borderRadius`, `boxShadow`) so Tailwind class names map cleanly (`bg-surface`, `text-ink-900`, `rounded-lg`, `shadow-e1`).

### Lint guards

- ESLint rule (or Stylelint) to ban: arbitrary hex in JSX, `text-[##px]` arbitrary sizes outside the type scale, custom shadows.
- Prettier + ESLint pre-commit (existing or to be added).

### Animation rules

- Every keyframe lives in `motion.css` and is suffixed with a `@media (prefers-reduced-motion: reduce) { animation: none; }` partner.
- Disallow `animation` declarations outside `motion.css`.

### Testing

- Component-level: Vitest + Testing Library for `Button`, `TextField`, `StatusChip`, `Modal`, `GrievanceCard`.
- Integration: Playwright for the file-grievance happy path and the track-status flow, mobile + desktop viewports.
- A11y: axe-core run inside Playwright on critical routes; fail CI on any violation on `/grievance`, `/track`, `/my-grievances`, `/login`, `/register`.

### Performance budgets

- First Contentful Paint < 1.5 s on Moto-G-class device on 4G.
- Cumulative Layout Shift < 0.05 on landing (sticky CTA must not push content).
- JS bundle for marketing route < 180 KB gzipped.

### Telemetry hooks (deferred but plan now)

- Add a thin `track(event, props)` wrapper used by all primary CTAs and form submissions. Today it can be a no-op; tomorrow it can be wired.

---

# Component Priority Order

A 6-week-friendly sequence. Each phase is independently shippable.

### Phase 0 — Foundations (week 1)
1. `tokens.css` + Tailwind config extension.
2. `motion.css` with reduced-motion guards.
3. ESLint / Stylelint guards for tokens.
4. `Button` primitive (replaces `tvk-cta-*`).
5. `StatusChip` primitive.
6. Topbar redesign (flat, no glassmorphism).
7. Footer simplification (3 columns, party-link separation).

> **Outcome:** the brand expression visibly calms across the app even before product changes.

### Phase 1 — Lists & dashboards (week 2)
8. `Sidebar` primitive + `SidebarItem`.
9. `FilterPillRow` mobile component.
10. `GrievanceCard` redesign with "what's next".
11. `MyGrievances` page recomposition (action strip + active + closed).
12. Polling reduced to 30 s with visibility awareness.

> **Outcome:** the dashboard is usable, readable, and respects user time.

### Phase 2 — Wizard & forms (week 3)
13. `TextField` primitive.
14. `Breadcrumb` primitive.
15. `WizardFrame` component (sticky top + sticky bottom).
16. `GrievanceHome` rebuilt as 3 steps.
17. `ConfirmDialog` for destructive-navigation guard.
18. `useDraftPersistence` hook + draft resume banner.
19. `LocationPicker` reflow (GPS / map / type).
20. `PhotoUploader` redesign + browser compression.

> **Outcome:** filing a grievance is short, recoverable, predictable.

### Phase 3 — Auth & mobile (week 4)
21. `LoginPage` redesign (single screen OTP, stateful CTA).
22. `RegisterPage` redesign (manual default, EPIC deferred).
23. `BottomTabBar`.
24. `StickyCta` on landing.
25. Mobile-first trust strip on auth pages.

> **Outcome:** mobile parity. Auth becomes calm.

### Phase 4 — Feedback & polish (week 5)
26. `Modal` + `BottomSheet`.
27. `EmptyState` everywhere.
28. `ErrorBanner` + `Toast` with `aria-live`.
29. `ErrorBoundary` at app root.
30. Landing page restructure to the 5-element hero.
31. Footer redesign with publisher / officer block.

> **Outcome:** every edge case has a designed response.

### Phase 5 — Accessibility & QA (week 6)
32. Skip-to-content link.
33. `lang="ta"` audit and fix.
34. Tab order + focus ring audit per page.
35. Playwright + axe CI integration.
36. Performance budget verification.

> **Outcome:** WCAG AA on all critical paths; CI prevents regressions.

### Phase 6 — Deferred (post-launch)
- Dark mode token derivation.
- DataTable for admin/dense views.
- Reciprocity loop (post-resolution rating).
- Pull-to-refresh.
- Telemetry wiring.

---

## Definition of Done — global

A component or page is "done" only when:

- [ ] Uses only tokenised colours, radii, shadows, spacing, type sizes.
- [ ] Passes axe-core with zero violations on its primary user flow.
- [ ] Keyboard-only navigable end-to-end.
- [ ] Works on a 360 px-wide viewport without horizontal scroll.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Has at least one happy-path test (Vitest or Playwright).
- [ ] Reviewed against the **UI Consistency Rules** (stage 3, section 12).

---

*End of execution plan. Engineering can begin with Phase 0 immediately; design can iterate on illustrations and Landing in parallel.*
