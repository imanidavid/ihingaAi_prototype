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
`coopMembers` · `coopGroupRecords` · `meetings` · `equipmentBookings` · `rolePermissions` ·
`auditEvents` · `loginAttempts` · `securitySettings` · `dataSources` · `processingRuns` ·
`processingSettings` · `messageTemplates` · `voiceSettings` · `rainForecasts` ·
`stationReadings` · `cropAdvisories` · `warningDeliveries` · `riskTypes` · `sectorRegister` ·
`planAheadItems` · `cropPlantings` · `coopJoinRequests` · `trainingMaterials` · `trainingShares`

Derived once in `App.tsx` and passed down: `coopGroups` (`computeCoopGroups`), `coopSummary`
(`computeCoopSummary`), `sectorForecastRisk` (`computeSectorForecastRisk`), `affectedSectors`,
`districtClimateRisk`, and for the farmer `farmerMember`, `farmerMeetings`, `farmerBookings`,
`farmerForecast`, `farmerReading`, `farmerWeatherSummary`, `farmerAdvisories`, `farmerCropRisk`,
`farmerPlanItems`, `farmerCropPhases`; and `districtCropRisk` for other roles.

Open tabs share the store: `useTabSync` (`src/useTabSync.ts`) broadcasts every change over a
`BroadcastChannel` and a new tab adopts the store of an open one, so an officer in one tab and a
farmer in another see the same data. UI state (role, view, sign-in) stays per tab. Nothing is
persisted: closing every tab or Reset demo (which also reaches the other tabs) starts from the seed.
Add every new store field to `storeSnapshot` in `App.tsx` as well as to Reset demo.

UI-only state alongside them: `role`, `currentAccountId` (who is signed in), `currentView`,
`previewMode`, `drawerContent`,
`searchQuery`, `toastMessage`, `isAuthenticated`, `hasUnsavedSettings`, plus the
message-composer, schedule-meeting, report-modal and session-timeout flags.

Seed data lives in four files, not one:

- `src/data/musanzeData.ts` — `NOW`, `MUSANZE_RECORD`, `INITIAL_WARNINGS`,
  `INITIAL_THRESHOLD_RULES`, `INITIAL_USER_SETTINGS`, `COOPERATIVE_DATA`,
  `INITIAL_COOP_MESSAGES`, the 15 sectors, the rainfall series,
  Uploads belong to the officer (sidebar "Weather data", permission `upload_weather_data`); the
administrator keeps the feed connections, sync and schedules (`manage_data_sources`). Audit
actions: "Uploaded station readings", "Uploaded rain forecast". `SECTOR_BASE_FORECAST_RISK`, `computeSectorClimateRisk`, `computeDistrictClimateRisk`,
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
- `src/data/rwandaAdminData.ts` — `INITIAL_USER_ACCOUNTS` (11, incl. two waiting for
  approval), `INITIAL_ACCESS_REQUESTS` (2), `DEMO_ACCOUNT_ID_BY_ROLE`, sector/cell lists,
  `validateRwandaPhone`, `maskPhone`, `maskEmail`, `SAMPLE_MEMBER_IMPORT_CSV`, `parseMemberCsv`.
  Admin data in `musanzeData.ts`: `ROLE_LABELS`, `ROLE_ORDER`, `PERMISSIONS`,
  `INITIAL_ROLE_PERMISSIONS`, `INITIAL_AUDIT_EVENTS`, `INITIAL_LOGIN_ATTEMPTS`,
  `INITIAL_SECURITY_SETTINGS`, `INITIAL_DATA_SOURCES`, `INITIAL_PROCESSING_RUNS`,
  `INITIAL_PROCESSING_SETTINGS`, `PROCESSING_STAGES`, `INITIAL_MESSAGE_TEMPLATES`,
  `INITIAL_VOICE_SETTINGS`, `SEEDED_SMS_OPT_OUTS`, `SMS_REPLIES`, `SCHEDULED_MESSAGES`,
  `SAMPLE_RAIN_GAUGE_CSV` / `parseRainGaugeCsv`, `computeSignInAnomalies`.

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
6. **Sector climate risk** = the higher of (a) the sector's forecast risk and (b) active
   *weather* warnings covering it. Forecast risk = the highest level the sector's 10-day rain
   forecast (`rainForecasts`) reaches under the officer's rain rule in `thresholdRules`
   (24 h: 40 Watch · 60 High · 80 Critical), computed by `computeSectorForecastRisk`.
   Pest/disease warnings do not change climate risk.
   District risk = highest sector climate risk. Implemented in `computeSectorClimateRisk` /
   `computeDistrictClimateRisk` (both take the forecast-risk map) — use those, never re-derive
   risk in a component.
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
    (`src/components/PillSelect.tsx`) for every new form. Date/time ranges use
    `DateTimeRangePicker` (Starts/Ends = date + half-hour pill, optional "Next 24/48/72 h" chips
    from NOW); store the two values (`startsAt`/`endsAt`, 'DD/MM/YYYY HH:MM') and build the text
    with `formatTimeframe()` — never a typed range. 13 older native `<select>` elements
    remain; replace them in the consistency pass (Task 9).
13. **The floating demo control never covers content.** `<main>` carries `pb-32` (128px) —
    keep it at ≥ 96px.
14. **Reset demo** (`handleResetDemo`, `App.tsx`) must restore every store field to its
    initial value, including anything created during the demo. It currently resets all
    thirty-four fields; add every new field you introduce (also to `storeSnapshot`, which syncs open tabs).
15. **Keep it simple — never overwhelm users.** One clear component per question; never show the
    same data twice (e.g. a chart and day cards, a map and per-type bars). Fold extra detail into
    that one component (filter chips, tap for detail) instead of adding sections. Every
    requirement in `docs/requirements.md` must still be met.

## Roles (one shared store, desktop unless noted)

`AppRole` in `src/types.ts` is exactly `'farmer' | 'officer' | 'cooperative' | 'researcher' | 'admin'`
(`'cooperative'` = cooperative leader). It is the one set of role names: the app shell,
`UserAccount.role`, sign-up (`SignUpRole`) and access requests (`ApprovalRole`) all use it.
Display names come from `ROLE_LABELS`. Account status: `active · pending · suspended · rejected`;
only `active` accounts can sign in. Officers and administrators need the two-step code.

| Role | Sign-in identifier | Password | Lands on |
|---|---|---|---|
| Farmer — Jean-Baptiste Ndayisaba | +250 788 000 012 | demo1234 | Farmer dashboard (desktop + mobile M1/M2) |
| Cooperative leader — Aline Uwimana | +250 788 000 034 | demo1234 | Cooperative dashboard |
| Agricultural officer — Claudine Mukamana | claudine.m@ihinga.demo | demo1234 | Officer dashboard |
| Administrator — Grace Ingabire | grace.i@ihinga.demo | demo1234 | Admin dashboard (two-step 246810) |
| Researcher — Diane Uwase | diane.u@ihinga.demo | demo1234 | Research dashboard |

Waiting for approval at the start of the demo: Esther Nyirabagenzi (officer,
esther.n@ihinga.demo) and Celestin Ndayambaje (cooperative leader, +250 788 000 072).
Suspended: Theophile Nsabimana (farmer).

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

- **13 native `<select>`** elements: `SignUpWizard` 6,
  `ReportObservationModal` 3, `MobileFrame` 3, `OfficerReportsView` 1 (breaks rule 12). Settings uses `PillSelect` now.
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

Task 2 (admin) added: the administrator role and shell, Users & access (Users · Access
requests · Permission matrix · Bulk import), and one role naming (`'cooperative_leader'` is
gone). Tasks 3–5 followed in the same branch: `AdminSecurityView` (Audit log · Login
activity · Data access · Security settings), `AdminDataSourcesView`, `AdminProcessingView`,
`AdminNotificationsView` (Message history · Templates · Opt-outs · SMS inbox · Scheduled).
`auditEvents` records sign-ins, warnings, report decisions and opens, exports, messages,
meetings, bookings and every admin action. Security settings are live: the two-step roles,
lock-after-N-failures and the inactivity timeouts drive sign-in and the session timer.
Task 6 (researcher) added `ResearcherDashboardView`, `ResearcherModelView` (forecast vs
observed, accuracy by horizon, warning hit rate, report-based validation) and
`ResearcherFieldDataView` (anonymised reports + CSV). Field data and its export are gated by the
permission matrix (`view_research_data`, `export_data`). Reports offers research types
("Model validation", "Field data summary") to researchers. Research helpers in `musanzeData.ts`:
`FORECAST_VS_OBSERVED`, `computeForecastSkill`, `LONG_HORIZON_ACCURACY` (illustrative),
`computeWarningHitRate`, `computeReportValidation`, `anonymisedReportId`. No page is a
`PlaceholderView` any more.

Farmer dashboard data sources (after Task 6): weather = latest `stationReadings` entry for the
farmer's sector (officer Weather data → Manual upload adds readings with temperature,
humidity and wind); weather forecast card (`WeatherForecastCard`, no chart: one small card per day for 10 days with rain as the main number, day high/low small) = the sector's series in `rainForecasts` (rain, day high/low; officer "Rain forecast
upload" replaces days); the card's "N mm in 10 days" = sum of the first 10 days, and its wind comes
from the station reading (`windKmh`, optional in the upload); affected sectors = sectors at
Watch or above (`computeAffectedSectors`); crop advice = `cropAdvisories`, written by the
officer on an active warning (Warnings → "Add crop advice"), shown to a farmer only while
that warning is active and only for their sector and crops (`visibleAdvisories`); the map
(`MusanzeRiskMapCard`, Leaflet + OpenStreetMap tiles, no API key) colours Musanze's 15 sectors
with `computeSectorClimateRisk`; the sector shapes are bundled in
`src/data/musanzeSectorBoundaries.json` (geoBoundaries gbOpen RWA ADM3, CC BY 4.0, credited on
the card), so they show even when the tiles cannot load. `SECTOR_BASE_FORECAST_RISK`,
`SECTORS_WATCH_LIST` and `SECTORS_LOW_LIST` are gone. Sources still missing are listed in
`docs/fix-in-code-later.md`.

Officer dashboard (09/10/2026): warning delivery is stored per warning and sector in
`warningDeliveries` (sent and delivered by channel, acknowledged). App reads `warnings` through
`withDeliveryTotals`, so `channels`, `sectorBreakdown`, `totalSent`, `acknowledgedPct`,
`farmersReached` etc. are always computed — never seed them on a warning. Farmer counts come
from `sectorRegister` (admin: Users & access → Sector register); a new warning's delivery
records are built from it (`buildWarningDeliveries`). Risk types live in `riskTypes`; each
warning carries `riskGroup` (`weather` | `pest_disease`) and only `weather` raises climate risk
(`isWeatherWarning`). The officer dashboard rows and "Needs your attention" come from
`computeSectorOverview` and `computeOfficerAttention`; `OFFICER_DATA` now only holds the
profile, hero badge and photo.

Crop risk matrix and plan ahead (12/10/2026): **every section's data comes from the (mock) AI
model or from a user through a screen where they enter it — never typed into a component.** The
crop risk matrix is `computeCropRiskMatrix` (`musanzeData.ts`, "Crop risk model (simulated)"): per
sector and crop it reads the 10-day forecast in `rainForecasts` against the officer's rules in
`thresholdRules` (rain 40/60/80 mm, dry spell 7 dry days, temperature +3°C over the 30-day average
high, late blight 85% humidity for 48 h on potato), then raises each cell to any active warning for
that hazard, sector and crop (`hazardForWarning`). Farmers get their sector and crops
(`farmerCropRisk`); other roles get the district maximum (`districtCropRisk`). Late Blight Threat
is what makes potato disease High; ending it drops the cell to Low. Plan-ahead items are the store
field `planAheadItems` (seed `INITIAL_PLAN_AHEAD_ITEMS`), written by the officer under Warnings →
Plan ahead (crop, category Soil · Input timing · Variety · Harvest · Risk mitigation, title,
reason, due by / not before a date, or a season from `PLAN_SEASON_OPTIONS`). A farmer sees items
for "All crops" or a crop they grow (`planItemsForCrops`); bookmarks stay in `savedItemIds`.
`CROP_RISK_MATRIX`, `PLAN_AHEAD_DATA` and `OFFICER_CROP_RISK_MAP` are gone.

Crop phases (12/10/2026): the farmer enters each crop's planting date (Crop calendar → Crop
phases → "Change date"; store field `cropPlantings`, one row per account and crop). The crop
growth model (`CROP_GROWTH_MODEL`, `computeCropPhase`, "Crop growth model (simulated)") turns days
since planting at NOW into the stage, the stage dates, % to harvest and the harvest window;
"From your officer" is the farmer's active advice or next plan-ahead item for that crop. The
dashboard Seasonal calendar card computes window and phase status from NOW
(`seasonPhaseStatus`, `windowProgress`) and its footer reads the farmer's first crop phase.
`CROP_RECORD` is gone.

Farmer observations (12/10/2026): "My reports" = `reports` whose `farmer` equals the signed-in
farmer's report name (`reportNameOf`); App stamps that name on every new report, so the modal and
mobile form never type a name. KPIs: reports this season (`reportsThisSeason`, from
`SEASON_START_DATE`), verified, and "Used in forecasts" = `computeReportValidation` on the farmer's
own reports (the same rule as the research page). "Reports near you" = the farmer's sector in the
last `FIELD_REPORT_WINDOW_DAYS`, shown as the community observation map
(`CommunityObservationMap`: Musanze's sectors shaded in greens by report count, type chips re-count
the map, tapping a sector shows its counts by type; covers Module 9 "community observation map" and
"observation analytics"). Seed report
photos are planned files in `public/media/` (media manifest); a missing photo shows no thumbnail.

Report types (13/10/2026): Rainfall · Flood / damage · Crop condition · Pest / disease · Other
(`REPORT_TYPES`). "Other" carries the farmer's own words in `otherType`; show any report's type
with `reportTypeLabel()`. Officers verify reports on Observations → To review; opening a report
under review from the bell goes there (`reviewReportId`), not to the read-only drawer.

Settings (13/10/2026, kept short on purpose): Profile (name, phone, email, one language for the
app and messages) · Farm (farmers only: sector, cell, farm size, cooperative, crops — any crop
can be added beside `CROP_OPTIONS`) · Messages (channel, four plain on/off switches, stop SMS) ·
Password (change, two-step note for officers and administrators, sign out other devices).

Cooperative (13/10/2026): one registered cooperative with groups inside it (a group is a team
such as "Kinigi growers", not a cooperative). Only the cooperative leader (board president or
manager, Aline) uses the cooperative dashboard; group leads are farmers on the farmer dashboard.
A farmer who picks a cooperative at sign-up or in Settings creates a join request
(`coopJoinRequests`); the leader accepts it and places them in a group (`suggestGroupFor` picks
the group of their sector). The dashboard answers "which members need me today?": join requests,
one row per group with members who have not acknowledged each active warning (Remind, or "Told in
person" — stored in `CoopMember.toldInPerson`, counted by `memberAcknowledged`, shown "told by
leader"), and the officer's active advice and plan-ahead items due within `PASS_ON_WINDOW_DAYS`
(collapsed, "Send to members"). Then My groups (with each group's climate risk from `computeSectorClimateRisk`; warning names open the warning) and one line for the last message and next meeting. The leader's menu has no Risk forecast or Early warnings pages (the dashboard covers group risk).
A farmer acknowledges once; the officer sees totals, the leader sees names. `COOPERATIVE_DATA.actions`
is gone.

Training (13/10/2026): the agricultural officer writes lessons (sidebar Training →
`OfficerTrainingView`: title, format Guide · Audio · Video, language, length, one-line summary,
steps one per line) in `trainingMaterials`. The cooperative leader shares a lesson from Training →
Lessons; it opens the message composer (`trainingShareText`) and sending records a
`trainingShares` entry for the chosen groups. A farmer whose group received a lesson gets a bell
item ("New lesson") and a "Learn" row in Recommendations (`lessonsForGroup`); `LessonModal`
shows the steps. Audio and video files are planned media; until then the steps are their script.
`TRAINING_MATERIALS` is gone.

Risk forecast (13/10/2026): the four cards (excess rain, dry spell, temperature, rain total) are
`computeHazardCards` for one sector over the 10- or 30-day window, using the officer's rules.
Farmers see their sector; officers and researchers pick a sector (highest risk first). The chart
caption is the computed forecast skill (`computeForecastSkill`, simulated gauge data).

Admin data (13/10/2026): Data sources shows the forecast model first (`FORECAST_MODEL`: learned
from Meteo Rwanda station rain and temperature, MINAGRI crop data, satellite rain and crop
greenness; simulated, years illustrative, with a note that naming the data owners is not an
endorsement), then one "Data coming in" list (late sources first). Admin pages use plain words:
`PROCESSING_LABELS` maps the stored technical values (gap method, outlier threshold,
interpolation, aggregation, run trigger and result, source status) to everyday labels.

Researcher (13/10/2026): the dashboard answers "is IHINGA AI getting it right?" with four cards
(rain forecast right X of 10 days, warnings that really happened, farmers who saw the active
warnings from delivery totals, farmer reports that agree) that open Model performance or Field
data, and "Data for your research" (forecast CSV via `forecastsToCsv`, gated by `export_data`;
link to field data). Model performance uses plain words ("Usual miss", "Too wet or too dry?",
"Did the warnings work?" with % of farmers who saw each warning).

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
