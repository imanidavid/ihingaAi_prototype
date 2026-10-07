# IHINGA AI — Climate Risk Prediction System (frontend prototype)

Final-year project prototype for smallholder farmers in Musanze District, Rwanda.
**Frontend only.** All data is simulated and seeded from `src/data/`; there is no backend.
The project is graded against the teacher's 14-module requirements
(`ihinga-claude-code-kit/docs/requirements.md`) and on visual consistency.

Stack: React 19 + TypeScript + Vite 8 + Tailwind v4 (`@tailwindcss/vite`), `lucide-react` icons.

## Where things are

| What | Real path |
|---|---|
| App shell + the whole store | `src/App.tsx` |
| Pages / components | `src/components/` (auth wizards in `src/components/auth/`) |
| Seed data | `src/data/` — four files, see below |
| Types | `src/types.ts` |
| Kinyarwanda / English strings | `src/translations/signInTranslations.ts` |
| Images | `src/assets/images/` (imported directly; there is **no** `public/`) |
| Docs | `ihinga-claude-code-kit/docs/` — `requirements.md`, `remaining-work.md`, `demo-script.md`, `media-manifest.md`, `fix-in-code-later.md` |
| Skills | `ihinga-claude-code-kit/.claude/skills/<name>/SKILL.md` |

**Skills are not installed at the repo root.** There is no root `.claude/`, so
`ihinga-design-system`, `ihinga-new-page` and `ihinga-media-prompts` cannot be invoked as
slash-skills. Read the `SKILL.md` file directly before working, or move
`ihinga-claude-code-kit/.claude/` to the repo root to make them loadable.

This file is duplicated at `ihinga-claude-code-kit/CLAUDE.md`. The root copy is the one
Claude Code loads — **edit both together** so they stay identical.

## The store

The "shared store" is React `useState` in `src/App.tsx` (lines ~65–233). There is no store
module, no context and no reducer; state is passed down as props. Fields:

`warnings` · `reports` · `thresholdRules` · `userSettings` · `messages` · `accounts` ·
`accessRequests` · `generatedReports` · `savedItemIds` · `readNotificationIds`

UI-only state alongside them: `role`, `currentView`, `previewMode`, `drawerContent`,
`searchQuery`, `toastMessage`, `isAuthenticated`, `hasUnsavedSettings`, plus the
message-composer, report-modal and session-timeout flags.

Seed data lives in four files, not one:

- `src/data/musanzeData.ts` — `NOW`, `MUSANZE_RECORD`, `INITIAL_WARNINGS`,
  `INITIAL_THRESHOLD_RULES`, `INITIAL_USER_SETTINGS`, `COOPERATIVE_DATA`,
  `INITIAL_COOP_MESSAGES`, the 15 sectors, the rainfall series,
  `SECTOR_BASE_FORECAST_RISK`, `computeSectorClimateRisk`, `computeDistrictClimateRisk`,
  `isWarningRelevantToFarmer`.
- `src/data/districtReportsData.ts` — the 52 field reports
  (`INITIAL_52_DISTRICT_REPORTS`, re-exported as `INITIAL_52_REPORTS` from `musanzeData.ts`).
- `src/data/reportsModuleData.ts` — `INITIAL_GENERATED_REPORTS`.
- `src/data/rwandaAdminData.ts` — `INITIAL_USER_ACCOUNTS`, sector/cell lists,
  `validateRwandaPhone`, `maskPhone`, `maskEmail`.

Prefer `musanzeData.ts` for new shared data. Never hard-code a number in a component.

## Golden rules (never break these)

1. **One source of truth.** All data comes from `src/data/` through the store in `App.tsx`.
   Components never hard-code numbers, names, dates, risk levels or captions.
   Every count, percentage, comparison and total is **computed** from the store.
   Each data type exists exactly once in the store (one `warnings`, one `reports`, one `messages`, …).
2. **NOW = Monday 28/09/2026, 14:00** (`NOW` in `musanzeData.ts`).
   Every countdown, "x ago" and date is computed from NOW.
3. **Design System v3 only.** Read `ihinga-design-system/SKILL.md` before writing any UI.
   No new colours, fonts, radii or shadows.
4. **Risk colours mean risk.** Amber/orange/red are only for Watch/High/Critical.
   Never for decoration, counts, status chips or progress bars.
5. **Risk scale is exactly:** Low · Watch · High · Critical (`RiskLevel` in `src/types.ts`).
   Nothing else ("Moderate", "Normal" are bugs).
6. **Sector climate risk** = the higher of (a) the sector's forecast risk
   (`SECTOR_BASE_FORECAST_RISK`) and (b) active *weather* warnings covering it.
   Pest/disease warnings do not change climate risk.
   District risk = highest sector climate risk. Implemented in `computeSectorClimateRisk` /
   `computeDistrictClimateRisk` — use those, never re-derive risk in a component.
7. **Sentence case** for every label, heading and button. No ALL-CAPS text.
   Exception: the brand is always written **IHINGA AI**.
   (Existing sidebar labels are still Title Case — see "Known code drift".)
8. **Plain language** on farmer-facing screens: short sentences, max 10 words per action,
   no scientific names or technical terms.
9. **No module numbers in the UI.** Module numbers belong in documentation only.
10. **No invented statistics.** Any number without a source in `src/data/` is either removed
    or labelled "Estimate" / "Illustrative".
11. **No implied official affiliation.** Never present the prototype as endorsed by the
    Government of Rwanda, RAB, Meteo Rwanda or MINAGRI. External feeds are labelled "simulated".
12. **Dates DD/MM/YYYY.** Never use the native date input (currently true — no `type="date"`
    anywhere). A custom date picker and a custom pill dropdown **do not exist yet**; 17 native
    `<select>` elements remain. Build the two components before the consistency pass (Task 9)
    and replace the native ones then.
13. **The floating demo control never covers content.** `<main>` carries `pb-32` (128px) —
    keep it at ≥ 96px.
14. **Reset demo** (`handleResetDemo`, `App.tsx`) must restore every store field to its
    initial value, including anything created during the demo. It currently resets all ten
    fields; add every new field you introduce.

## Roles (one shared store, desktop unless noted)

`AppRole` in `src/types.ts` is exactly `'farmer' | 'officer' | 'cooperative'`.
Note `UserAccount.role` in `rwandaAdminData.ts` uses a different spelling for the third role:
`'cooperative_leader'`. Researcher and administrator have no `AppRole` value yet.

| Role | Sign-in identifier | Password | Lands on |
|---|---|---|---|
| Farmer — Jean-Baptiste Ndayisaba | +250 788 000 012 | demo1234 | Farmer dashboard (desktop + mobile M1/M2) |
| Cooperative leader — Aline Uwimana | +250 788 000 034 | demo1234 | Cooperative dashboard |
| Agricultural officer — Claudine Mukamana | claudine.m@ihinga.demo | demo1234 | Officer dashboard |
| Researcher | not built yet | — | see `docs/remaining-work.md` Task 6 |
| Administrator | not built yet | — | see `docs/remaining-work.md` Task 2–5 |

The two-step verification code is **246810** everywhere it is asked for (officer sign-in,
sign-up, forgot password). Other seeded account details: officer phone +250 788 000 014,
staff id RAB-EXT-4401; Aline's email aline.u@musanzepotato.coop, cooperative registration
RCA/2021/0492.

Jean-Baptiste's profile is seeded **twice and the two disagree** — see "Known code drift".
What the app shows before sign-in (`INITIAL_USER_SETTINGS`): Kinigi sector, Bisoke cell,
1.8 ha, Musanze Potato Growers Cooperative, Kinyarwanda, alerts by SMS,
phone +250 788 123 412. His cooperative group is "Kinigi growers", recorded only in
`COOPERATIVE_DATA.groups`, never on his profile.

Views per role come from `src/components/Sidebar.tsx`. The cooperative views `members`,
`meetings` and `training` are still `PlaceholderView` (remaining-work Task 1).

## Key data (must stay consistent everywhere)

- District risk Watch. Watch sectors: Kinigi, Busogo, Remera, Muhoza (4 of 15). Farmers: 4,120.
- Active warnings: **Heavy Rain Influx** (Watch · Kinigi, Busogo, Remera · Tue 02:00–14:00, peak 48 mm ·
  issued 13:35) and **Late Blight Threat** (High · Irish Potato plots · Muhoza & Kinigi · next 48–72 h · issued 13:00).
- Acknowledged: Heavy Rain 1,061 of 1,640 (65%); Late Blight 402 of 690 (58%). Season average 62%.
- Weather: 22°C / 78%. Rain: 10-day ≈185 mm, 30-day 300 mm, normal 13 mm/day.
- Field reports: 52 in last 7 days (Kinigi 14).
- Cooperative: Musanze Potato Growers Cooperative, 186 members —
  Kinigi growers 82 · Busogo growers 54 · Muhoza growers 50; member reports 7 d = 11;
  rain-warning acknowledgement 63%.
- Potato advisory: "Don't spray until Tuesday 14:00" / "Heavy rain will wash the spray off your plants."

## Known code drift (fix deliberately, in its own task — don't "tidy" it mid-task)

- **Jean-Baptiste is seeded twice.** `INITIAL_USER_SETTINGS` (`musanzeData.ts`) says
  phone +250 788 123 412, email j.ndayisaba@musanzecoop.rw, cell Bisoke, 1.8 ha,
  Musanze Potato Growers Cooperative. `acc-farmer-jb` (`rwandaAdminData.ts`) says
  phone +250 788 000 012, no email, cell Kaguhu, 0.8 ha, COOPAMA (Kinigi Irish Potato).
  `handleSignInSuccess` overwrites `userSettings` from the account, so his identity changes
  the moment you sign in. Reconcile on the `musanzeData.ts` values.
- **Late Blight severity.** `COOPERATIVE_DATA.groups[*].warnings` and `.acknowledgement`
  label Late Blight Threat `level: 'Watch'`; `INITIAL_WARNINGS` and the key data above say
  **High**.
- **13 mm/day normal is hard-coded** in `RainfallChartCard.tsx` (4 places) and
  `RiskForecastView.tsx:69` instead of living in `musanzeData.ts` (breaks rule 1).
- **`MessageComposerModal.tsx` hard-codes** the group list and the count `82` instead of
  reading `COOPERATIVE_DATA.groups` (breaks rule 1).
- **Sidebar labels are Title Case** ("Risk Forecast", "Early Warnings", "Crop Calendar")
  next to sentence-case "Members & groups" (breaks rule 7).
- **17 native `<select>`** elements: `SettingsView` 4, `SignUpWizard` 6,
  `ReportObservationModal` 3, `MobileFrame` 3, `OfficerReportsView` 1 (breaks rule 12).
- **`staffId: 'RAB-EXT-4401'`** on the officer account implies RAB affiliation (rule 11).
- **Stale comment** `musanzeData.ts:142` says the month totals 210 mm; the series and the
  UI both say 300 mm.
- **Media manifest is out of sync.** It tells you to save files to `public/media/`, but there
  is no `public/` directory. The real images are five AI-Studio files in
  `src/assets/images/`, and only two are used (`SignInView.tsx`,
  `CooperativeDashboardView.tsx`). All seven manifest rows are still `needed`.

Smaller deferred items live in `docs/fix-in-code-later.md`.

## Cross-role flows (the demo — must always work)

See `ihinga-claude-code-kit/docs/demo-script.md`. Never break these when changing anything.

## How to work in this repo

- One page or one fix-list per task. Before starting, read
  `ihinga-claude-code-kit/docs/remaining-work.md` and the relevant module in
  `ihinga-claude-code-kit/docs/requirements.md`. For new pages follow
  `ihinga-new-page/SKILL.md`.
- Images/video: never generate or download them. Follow `ihinga-media-prompts/SKILL.md`:
  add an entry to `docs/media-manifest.md` and reference the file path with a fallback.
- After each task: run `npm run build` (must pass) and `npm run lint` (`tsc --noEmit`),
  run the checks listed for that task, update the progress section of
  `docs/remaining-work.md`, then commit with git.
- Keep `docs/fix-in-code-later.md` up to date when something is deferred.
