# NourishLink

**Find a dietitian near you online, track your diet and health numbers, and order healthy food — all in one app.**

This repository is the v1 (responsive web / PWA-ready) implementation of the NourishLink PRD: a
Next.js App Router front end with the full client, dietitian and admin journeys wired to a
stateful mock data layer that mirrors the Supabase schema described in the PRD.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000  (binds 0.0.0.0:3000)
```

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Dev server on `0.0.0.0:3000`            |
| `npm run build`     | Production build (all routes prerender)  |
| `npm start`         | Serve the production build              |
| `npm run typecheck` | `tsc --noEmit`                          |
| `npm test`          | Vitest domain + seed test suite         |

**Demo accounts** (`/login`) — the app ships with all three roles so both sides can be reviewed:

| Role          | Entry point   | What you can do                                                        |
| ------------- | ------------- | ---------------------------------------------------------------------- |
| Client        | `/app`        | Track meals/glucose/weight, book consults, shop, order, manage consent |
| Dietitian     | `/dietitian`  | Caseload, shared logs, SOAP-style notes, meal plans, availability      |
| Admin         | `/admin`      | Verify dietitians, fulfil orders, manage stock, pilot readiness        |

All state lives in the browser (`localStorage`), so every flow can be walked end to end with no
backend. **Profile → Reset demo data** restores the seed.

---

## Design system

The UI follows the NourishLink style guide: white cards on a pale gray canvas, one fresh lime
green carrying the brand, soft tinted icon tiles for category accents, and large bold numerals as
the hero of every card.

| Role                    | Token                    | Value      | Used for                                          |
| ----------------------- | ------------------------ | ---------- | ------------------------------------------------- |
| Canvas                  | `--color-canvas`         | `#F4F4F4`  | Screen background                                 |
| Surface                 | `--color-surface`        | `#FFFFFF`  | Cards, nav bar, icon buttons                      |
| Primary (lime)          | `--color-lime`           | `#8CCB2E`  | Center action button, ring stroke, active bar     |
| Primary tint            | `--color-lime-tint`      | `#CFEFA3`  | Hero card, inactive bars, selected date pill      |
| Text primary            | `--color-ink`            | `#111111`  | Headings, big numerals                            |
| Text secondary          | `--color-muted`          | `#7A7A7A`  | Labels, units, greeting                           |
| Hatch pattern           | `--color-hatch`          | `#E3E3E3`  | Striped target bars behind the data bars          |
| Orange                  | `--color-orange`         | `#F2762E`  | Steps, weight                                     |
| Blue                    | `--color-blue`           | `#2D9CDB`  | Water                                             |
| Red                     | `--color-red`            | `#E5484D`  | Heart rate (BPM line), glucose out of range       |
| Teal green              | `--color-teal`           | `#2BB673`  | Exercise, in-range glucose, consent confirmed     |
| Amber                   | `--color-amber`          | `#F5B82E`  | Calorie flame chips (on `#FFF3D1`)                |

**Type** — Plus Jakarta Sans Variable, self-hosted via `@fontsource-variable` so there is no
render-blocking font request. Display numerals 40px bold, card values 24px semibold, titles
16–18px semibold, body/label 14px, captions and units 11–12px in gray.

**Shape & depth** — cards `22px`, icon tiles `12px`, buttons and avatars fully circular, selected
dates a vertical pill, 18px screen padding and 12px between cards. Elevation is almost absent:
separation comes from white-on-gray contrast, with a faint shadow only on the nav bar and the
raised center button.

**Motion** — rings and bars animate on load (300–500ms ease-out); dates and tabs transition in
150ms; every `prefers-reduced-motion` user gets the static layout.

Primitives live in `src/components/ui.tsx` (`Card`, `IconTile`, `CircleButton`, `Pill`, `Tag`,
`Value`, `StatTile`, `ProgressRing`, `ProgressBar`, `BarChart`, `BarSparkline`, `LineChart`,
`Sheet`, `Toggle`, `EmptyState`), icons in `src/components/icons.tsx` (outline, 1.75px stroke,
rounded caps).

---

## Feature map (PRD → app)

| PRD feature                              | Where it lives                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1. Onboarding & health profile           | `/signup` → `/onboarding` (4 steps, consent gating) → `/profile` (edit, export, delete)            |
| 2. Dietitian discovery & online consults | `/consults/book` (verified-only search, filters) → `/consults/book/[id]` (slots, pay) → `/consults/[id]` → `/consult/room/[id]` (video) + chat sheet |
| 3. Health & diet tracking                | `/app` dashboard, `/track` (weekly bars, ring, streak), `/track/glucose` (3.9–7.8 mmol/L band), `/track/weight`, log sheets, reminders |
| 4. Dietitian client dashboard            | `/dietitian` caseload, `/dietitian/clients/[id]` (overview, logs, notes, plan), `/dietitian/schedule` availability |
| 5. Healthy food shop & ordering          | `/shop` (diet tags), `/shop/[id]`, `/cart` (delivery/pickup, payment), `/orders`, `/orders/[id]` tracking; `/admin/orders` for vendor fulfilment |
| Admin verification (definition of done)  | `/admin/dietitians` — pending licence queue; unverified dietitians never appear in search             |
| Privacy policy & consent screens         | `/privacy` + consent steps in onboarding and Profile                                                  |

Other routes: `/` public landing, `/login`, `/meal-plans` (assigned plan with adherence ticking),
`/profile` (consents, reminders, receipts, CSV export, role switcher), `/admin` overview.

### Rules that are enforced, not just displayed

- Only dietitians with `verification.status === "verified"` are discoverable, and only if they have
  an untaken future slot (`isDiscoverable`).
- A consult room unlocks only for a paid, confirmed appointment (`canJoinConsult`).
- Delivery is free above ₦25,000 or on pickup; otherwise ₦1,500 (`deliveryFeeFor`).
- Revoking sharing consent hides a client's logs from the dietitian view behind an explicit lock
  state, while keeping previously written notes.
- Glucose readings are classified against the target band and the in-range share is computed in one
  place (`glucoseInRangeRatio`), used by both the client and dietitian screens.

These live in `src/lib/care.ts` as pure functions so the UI and the test suite cannot drift apart.

---

## Architecture

```
src/
  app/                      route handlers (App Router, mostly client components)
    app/                    client dashboard (home tab)
    track/                  weekly progress, glucose, weight
    consults/               list, discovery, booking, detail
    consult/room/[id]/      in-browser consult room (SDK placeholder)
    shop/ cart/ orders/     healthy food commerce
    meal-plans/ profile/    assigned plan, consents, data controls
    dietitian/ admin/       practitioner + operations workspaces
    login/ signup/ onboarding/ privacy/   public + consent surfaces
  components/
    ui.tsx                  design-system primitives
    icons.tsx               outline icon set
    dashboard.tsx           dashboard widgets (date strip, hero, tiles, meal rows)
    charts.tsx              glucose band chart, weight chart, consistency strip
    log-sheets.tsx          meal / glucose / weight / water logging + consult chat
    bottom-nav.tsx          five-slot nav with raised lime scan button
    chrome.tsx              nav visibility + onboarding guard
  lib/
    types.ts                domain model (mirrors the Postgres schema)
    seed.ts                 deterministic demo dataset
    store.tsx               React store: state + actions + selectors
    care.ts                 pure domain rules (tested)
    format.ts               date/number/clinical formatting helpers (tested)
tests/                      Vitest suite: format, care rules, seed invariants
```

**Swapping in the real backend.** `src/lib/store.tsx` exposes a single `useStore()` surface
(`profile`, `consent`, `metrics`, `meals`, `glucose`, `weights`, `dietitians`, `appointments`,
`notes`, `mealPlans`, `products`, `cart`, `orders`, `reminders` plus actions such as
`bookAppointment`, `payAppointment`, `saveNote`, `assignMealPlan`, `checkout`, `advanceOrder`,
`setVerification`). Replacing the reducer body with Supabase queries and RLS-protected tables keeps
every screen untouched. The schema in `src/lib/types.ts` maps 1:1 to the Postgres tables, including
`appointments.payment`, `dietitians.verification`, `orders.status` and `session_notes`.

**Stubs that are intentionally out of scope for v1.** Payments, the video SDK (Daily/Twilio) and
reminder delivery are simulated: paying marks a booking/order paid, the consult room is a
placeholder UI, and reminders are in-app only. Location filtering uses seeded cities rather than
PostGIS, and there are no AI-generated plans, wearables or prescriptions — matching the PRD's
out-of-scope list.

---

## Testing

```bash
npm test
```

26 tests across three files:

- `tests/format.test.ts` — date maths (month boundaries, Monday-first weeks), UI formatting,
  glucose classification, BMI bands, currency/percentage formatting.
- `tests/care.test.ts` — consult join rules, verification gating, slot ordering, delivery fee rules,
  order status flow and totals, in-range glucose share, weight deltas, logging streaks.
- `tests/seed.test.ts` — seed invariants: seven days of metrics ending today, every dietitian's
  slots in the future, exactly one pending-verification dietitian (5 verified), order arithmetic,
  caseload/plan/notes present, deterministic output.

`npm run typecheck` and `npm run build` are both clean; the production build prerenders 22 of 27
routes and keeps first-load JS at ~123–131 kB.

---

## Definition-of-done status

| Requirement                                                       | Status                                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| All 5 features work end to end on mobile and desktop browsers      | ✅ Every route is responsive; dashboards reflow to multi-column layouts |
| New user can sign up, book and pay for a consult, log glucose <10 min | ✅ `/signup` → `/onboarding` → `/consults/book` → pay → `/track/glucose` |
| Row-level security verified (own data only; dietitians only consented) | ⚠️ Enforced in the app layer (sharing consent gate, verified-only search); ready to become Supabase RLS policies |
| Dietitians verified by an admin before appearing in search         | ✅ `/admin/dietitians` + `isDiscoverable`                               |
| Payments in test/live with confirmations                           | ⚠️ Test-mode payment stubs with confirmation screens and references     |
| No critical bugs; core flows covered by tests                      | ✅ 26 tests + clean build/typecheck                                     |
| Privacy policy and consent screens live                            | ✅ `/privacy`, onboarding consent step, Profile consent controls         |
| Five dietitians and 20 pilot users complete a cycle                | ⏳ Pilot tracking surfaced in `/admin` readiness card                    |

## Licence

Prototype for demonstration. Not medical advice; no real payments, consultations or deliveries.
