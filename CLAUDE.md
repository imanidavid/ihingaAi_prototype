# IHINGA AI — Climate Risk Prediction System (frontend prototype)

Final-year project prototype for smallholder farmers in Musanze District, Rwanda.
**Frontend only.** All data is simulated and seeded from `src/data/`; there is no backend.
The project is graded against the teacher's 14-module requirements
(`docs/requirements.md`) and on visual consistency.

Stack: React 19 + TypeScript + Vite 8 + Tailwind v4 (`@tailwindcss/vite`), `lucide-react` icons.

## Where things are

| What | Real path |
|---|---|
| App shell + the whole store | `src/App.tsx` |
| Pages / components | `src/components/` (auth wizards in `src/components/auth/`) |
| Seed data | `src/data/` — four files, see below |
| Types | `src/types.ts` |
| Kinyarwanda / English strings | `src/translations/signInTranslations.ts` |
| Images | Existing five: `src/assets/images/` (imported directly). New media: `public/media/` (served at `/media/…`) |
| Docs | `docs/` — `requirements.md`, `remaining-work.md`, `demo-script.md`, `media-manifest.md`, `fix-in-code-later.md` |
| Skills | `.claude/skills/<name>/SKILL.md` |

The three skills (`ihinga-design-system`, `ihinga-new-page`, `ihinga-media-prompts`) are
installed at the repo root in `.claude/skills/`.

## The store

The "shared store" is React `useState` in `src/App.tsx` (lines ~65–260). There is no store
module, no context and no reducer; state is passed down as props. Fields:

`warnings` · `reports` · `thresholdRules` · `userSettings` · `messages` · `accounts` ·
`accessRequests` · `generatedReports` · `savedItemIds` · `readNotificationIds` ·
`coopMembers` · `coopGroupRecords` · `meetings` · `equipmentBookings`

Derived once in `App.tsx` and passed down: `coopGroups` (`computeCoopGroups`), `coopSummary`
(`computeCoopSummary`), and for the farmer `farmerMember`, `farmerMeetings`, `farmerBookings`.

UI-only state alongside them: `role`, `currentView`, `previewMode`, `drawerContent`,
`searchQuery`, `toastMessage`, `isAuthenticated`, `hasUnsavedSettings`, plus the
message-composer, schedule-meeting, report-modal and session-timeout flags.

Seed data lives in four files, not one:

- `src/data/musanzeData.ts` — `NOW`, `MUSANZE_RECORD`, `INITIAL_WARNINGS`,
  `INITIAL_THRESHOLD_RULES`, `INITIAL_USER_SETTINGS`, `COOPERATIVE_DATA`,
  `INITIAL_COOP_MESSAGES`, the 15 sectors, the rainfall series,
  `SECTOR_BASE_FORECAST_RISK`, `computeSectorClimateRisk`, `computeDistrictClimateRisk`,
  `isWarningRelevantToFarmer`. Cooperative: `INITIAL_COOP_MEMBERS` (186, built by
  `buildInitialMembers()`), `INITIAL_COOP_GROUPS`, `INITIAL_COOP_MEETINGS`,
  `INITIAL_EQUIPMENT_BOOKINGS`, `COOP_EQUIPMENT`, `BOOKING_SLOTS`, `COOP_CROP_WINDOWS`,
  `TRAINING_MATERIALS`, `COOP_DIRECTORY`, `REGISTERED_MUSANZE_FARMERS`, and the helpers
  `computeCoopGroups`, `computeCoopSummary`, `computeCoopPerformance`, `memberReportsFor`,
  `messageReachesMember`, `meetingReachesGroup`, `findBookingConflict`. Date helpers computed
  from NOW: `NOW_DATE`, `parseDMY`, `formatDMY`, `formatDayShort`, `formatDaysAgo`.
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
   (Sidebar labels are sentence case; some page headings and KPI labels are still Title Case — Task 9.)
8. **Plain language** on farmer-facing screens: short sentences, max 10 words per action,
   no scientific names or technical terms.
9. **No module numbers in the UI.** Module numbers belong in documentation only.
10. **No invented statistics.** Any number without a source in `src/data/` is either removed
    or labelled "Estimate" / "Illustrative".
11. **No implied official affiliation.** Never present the prototype as endorsed by the
    Government of Rwanda, RAB, Meteo Rwanda or MINAGRI. External feeds are labelled "simulated".
12. **Dates DD/MM/YYYY.** Never use the native date input (currently true — no `type="date"`
    anywhere). Use `DatePicker` (`src/components/DatePicker.tsx`) and `PillSelect`
    (`src/components/PillSelect.tsx`) for every new form. 17 older native `<select>` elements
    remain; replace them in the consistency pass (Task 9).
13. **The floating demo control never covers content.** `<main>` carries `pb-32` (128px) —
    keep it at ≥ 96px.
14. **Reset demo** (`handleResetDemo`, `App.tsx`) must restore every store field to its
    initial value, including anything created during the demo. It currently resets all
    fourteen fields; add every new field you introduce.

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
staff id MUS-AO-4401; Aline's email aline.u@musanzepotato.coop, cooperative registration
RCA/2021/0492.

Jean-Baptiste has **one** record: the sign-in account `acc-farmer-jb` (`rwandaAdminData.ts`):
phone +250 788 000 012, email j.ndayisaba@musanzecoop.rw, Kinigi sector, Bisoke cell, 1.8 ha,
Musanze Potato Growers Cooperative, Kinyarwanda. `INITIAL_USER_SETTINGS` is derived from it
with `userSettingsFromAccount()` (`musanzeData.ts`), and `handleSignInSuccess` uses the same
function, so his profile is identical before and after sign-in. Alerts by SMS is a default
setting, not an account field. His cooperative membership is the member record `mem-jb`
(Member, Kinigi growers) in `coopMembers`, never a profile field; App finds it by full name
(`findMemberByName`). Cooperative messages, meetings and sprayer bookings reach him only
through that record.

Cooperative members (`coopMembers`) are the one record of who is in which group, their role,
and which warnings they acknowledged. Group records (`coopGroupRecords`) hold only name,
sector and earlier-season report counts. Everything else is **computed** by
`computeCoopGroups()`: member counts, lead, active warnings and levels (from `warnings`),
acknowledgement (from members), "not acknowledged" names, and member field reports (from
`reports`, matched on "First L." name + sector, the same records the officer sees). A warning
issued in the demo starts at 0 acknowledged. Risk colours come from `RISK_LEVEL_COLORS`.
`COOPERATIVE_OPTIONS` (`rwandaAdminData.ts`) is the one list of Musanze cooperatives, used by
sign-up and Settings.

Views per role come from `src/components/Sidebar.tsx`. Cooperative pages:
`CooperativeMembersView` (Members · Groups · Performance · Directory, sub-parts in
`src/components/coop/`), `CooperativeMeetingsView` (shared calendar + upcoming list) and
`CooperativeTrainingView` (Materials · Shared equipment). Meetings show on the farmer's
`CropCalendarView` under "Cooperative events" and in the farmer bell (type `meeting`).

## Key data (must stay consistent everywhere)

- District risk Watch. Watch sectors: Kinigi, Busogo, Remera, Muhoza (4 of 15). Farmers: 4,120.
- Active warnings: **Heavy Rain Influx** (Watch · Kinigi, Busogo, Remera · Tue 02:00–14:00, peak 48 mm ·
  issued 13:35) and **Late Blight Threat** (High · Irish Potato plots · Muhoza & Kinigi · next 48–72 h · issued 13:00).
- Acknowledged: Heavy Rain 1,061 of 1,640 (65%); Late Blight 402 of 690 (58%). Season average 62%.
- Weather: 22°C / 78%. Rain: 10-day ≈185 mm, 30-day 300 mm, normal 13 mm/day
  (`RAINFALL_NORMAL_MM_PER_DAY`; the season chart uses `RAINFALL_NORMAL_MM_PER_MONTH_SEASON_CHART` = 65).
- Field reports: 52 in last 7 days (Kinigi 14).
- Cooperative: Musanze Potato Growers Cooperative, 186 members —
  Kinigi growers 82 · Busogo growers 54 · Muhoza growers 50; member reports 7 d = 11
  (6 · 3 · 2), this season 42; rain-warning acknowledgement 63% (86 of 136).
  Active 30 days 141 of 186 (76%); weekly active 102 · 118 · 133 · 141; average
  acknowledgement 164 of 268 deliveries (61%). Not acknowledged latest warning:
  Kinigi 18 · Busogo 32 · Muhoza 22.
- Meetings: Thu 01/10 14:00 Blight plan for Season A (Kinigi growers) · Mon 05/10 09:00 Seed
  orders for Season B (all) · Sat 10/10 08:30 Field day (all). Sprayers 1–3; bookings start
  Tue 29/09 14:00 (spray window opens).
- Potato advisory: "Don't spray until Tuesday 14:00" / "Heavy rain will wash the spray off your plants."

## Known code drift (fix deliberately, in its own task — don't "tidy" it mid-task)

- **17 native `<select>`** elements: `SettingsView` 4, `SignUpWizard` 6,
  `ReportObservationModal` 3, `MobileFrame` 3, `OfficerReportsView` 1 (breaks rule 12).
- **Rainfall normal contradicts the month total.** 13 mm/day × 30 = 390 mm, but the month
  card says 300 mm is "above normal", and the season chart's normal is 65 mm/month. The values
  now live in one place (`musanzeData.ts`), but the numbers themselves need a decision.
- **Heavy Rain issue time:** `INITIAL_WARNINGS` says `issuedAt: '28/09 13:40'`; the UI and key
  data say 13:35.

Task A (data integrity) fixed: Jean-Baptiste's double seed, Late Blight level in cooperative
groups, hard-coded 13 mm normal, composer group list, sidebar Title Case, RAB staff id, stale
210 mm comment, media manifest paths.

Task 1 (cooperative part 2) fixed: the invented 32% fungicide claim, the hard-coded "186
members under warning" sidebar card, and the farmer bell's hard-coded `'kinigi'` message filter.

Smaller deferred items live in `docs/fix-in-code-later.md`.

## Cross-role flows (the demo — must always work)

See `docs/demo-script.md`. Never break these when changing anything.

## How to work in this repo

- One page or one fix-list per task. Before starting, read
  `docs/remaining-work.md` and the relevant module in
  `docs/requirements.md`. For new pages follow
  `ihinga-new-page/SKILL.md`.
- Images/video: never generate or download them. Follow `ihinga-media-prompts/SKILL.md`:
  add an entry to `docs/media-manifest.md` and reference the file path with a fallback.
- After each task: run `npm run build` (must pass) and `npm run lint` (`tsc --noEmit`),
  run the checks listed for that task, update the progress section of
  `docs/remaining-work.md`, then commit with git.
- Keep `docs/fix-in-code-later.md` up to date when something is deferred.
