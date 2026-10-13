# Fix in code later (small fixes, no redesign)

- [ ] A newly signed-up farmer still sees "Jean-Baptiste" on the dashboard — use the signed-in account's name and sector.
- [ ] Mobile Forecast "This month": peak label shows "300 mm total" — should be "Peak 48 mm" (total stays in the chip).
- [ ] Warning drawer: confirm [Acknowledge warning] changes state to "Acknowledged ✓" and updates counts.
- [ ] Kinyarwanda strings in src/translations/ — reviewed by the owner (native speaker).
- [ ] Verify all cell names per sector against the official administrative list.

Found during Task A (07/10/2026):
- [ ] Rainfall normal: 13 mm/day × 30 = 390 mm, yet the 300 mm month is labelled "above normal"; the season chart's normal is 65 mm/month. Decide the real normals (values now live only in `musanzeData.ts`).
- [ ] Heavy Rain Influx `issuedAt` is `28/09 13:40` in `INITIAL_WARNINGS`; the UI and key data say 13:35.
- [ ] Officer dashboard "Active warnings" KPI subtitle is fixed text ("Rain influx & Late blight"); it does not change when a warning is issued or ended.
- [ ] Farmer dashboard: "2 active" chip and "2 require action" text use risk colours for counts (rule 4). Title Case KPI/section labels ("Current Risk Level", "Crop Advisories", "Rwanda Risk Map") — Task 9 sweep.
- [x] Farmer bell filters cooperative messages with a hard-coded `'kinigi'` (`App.tsx`) — fixed in Task 1 (`messageReachesMember` with his member record).
- [ ] Two sector→cell lists disagree: `MUSANZE_SECTORS_CELLS` (`musanzeData.ts`, used by Settings) and the list in `rwandaAdminData.ts` (used by sign-up). Merge when verifying cell names.
- [x] Cooperative group drawer: named "not acknowledged" members were seeded names — fixed in Task 1 (names come from the member records).

Found during Task 1 (08/10/2026):
- [ ] Farmer warning drawer [Acknowledge warning] is local state only; it does not set `acknowledged` on Jean-Baptiste's member record, so cooperative acknowledgement counts do not move. Wire it when fixing the acknowledgement item above.
- [ ] Meeting SMS invitations are a flag on the meeting (`smsInvite`); they are not added to the message history. Task 5 (Notifications) should list them with the other messages.
- [ ] Farmer bell shows a cooperative message's English text as the subtitle; the drawer shows Kinyarwanda first. Decide one order for both.
- [ ] Kinyarwanda strings added in Task 1 (training share messages in `TRAINING_MATERIALS`) need the owner's review.
- [x] `farmerMyReports` matched reports on the full name, so officer feedback never reached the farmer bell — fixed (matches `reportNameOf()` + sector).
- [ ] The Sep/Oct calendar shows sprayer bookings from Tue 29/09; booking slots before the spray window opens (Tue 14:00) only show a note, they are not blocked.

Found during Task 2 (08/10/2026):
- [ ] An approved second officer (e.g. Esther) lands on the officer dashboard that greets "Claudine" (`OFFICER_DATA.profile`); the topbar already uses the signed-in account. Same for a second cooperative leader, who sees Aline's cooperative.
- [ ] Settings shows Jean-Baptiste's farmer profile for every role (officer, cooperative, admin, researcher). Give non-farmer roles their own profile section.
- [ ] Saved permissions (`rolePermissions`) are recorded and audited but not enforced in the UI yet (e.g. hiding "Issue warning" when an officer loses it). Decide in Task 3.
- [ ] The floating role switcher signs in as the demo account without updating "Last sign-in", the audit log or login activity (only the real sign-in form does). Intentional so demo shortcuts don't flood the log.
- [ ] Imported farmers get `farmSizeHa: 0` (the CSV has no farm size column).

Found during Tasks 3–5 (08/10/2026):
- [ ] SMS inbox replies are seeded and read-only; a "1" reply does not yet set `acknowledged` on the member record (same gap as the farmer drawer's Acknowledge button).
- [ ] Data processing runs are simulated: "Run now" walks the stages and records a run, but does not change forecast numbers. The climate normal shown (13 mm/day) is still the undecided value.
- [ ] Message templates are stored and editable but the composers don't use them yet.
- [ ] Data retention and password policy settings are recorded only (no data is deleted, passwords are not re-checked).

Found during Task 6 (08/10/2026):
- [ ] Report-based validation is computed from the store: weather reports (rainfall, flood/damage) that reached an officer = 34, matched 33 (97%). The task spec said 38 / 33 / 87%; the seeded reports don't support that. Decide whether to change the seed data or keep the computed figure.
- [ ] Month and season accuracy (72%, 64%) are labelled "Illustrative" — the prototype holds no past seasons. Forecast vs observed covers Kinigi only (simulated gauge).
- [ ] A warning issued during the demo counts as "Not confirmed" in the hit rate until reports confirm it (no flow sets `confirmedByReports` yet).

Farmer dashboard — sources still missing (08/10/2026):
- [x] ~~Map: soil saturation (78%) and the other 29 districts are seeded values.~~ The map now shows only Musanze's 15 sectors, all computed (09/10/2026). `RWANDA_DISTRICTS` remains only for the sign-up district list.
- [ ] Map: the sector boundaries are the 2012 geoBoundaries release (Open Data Rwanda); only the Musanze sector names are used, simplified to ~20 m.
- [ ] Risk forecast page: the four horizon cards (excess rain, dry spell, temperature, season onset) and the season chart's monthly totals still come from `FORECAST_HORIZONS`; only the 10-day and month charts read `rainForecasts`.
- [ ] Dry spell, temperature and late blight rules now have numbers and drive the crop risk matrix, but not the sector forecast risk (only rain does). Humidity per forecast day is the same template for every sector, and the temperature "normal" is the sector's 30-day average high (simulated).
- [x] ~~Forecast temperature per day reused the seeded template series.~~ `rainForecasts` now holds day high/low per sector and the forecast upload can replace them (10/10/2026). Humidity per forecast day is still the seeded template (not shown on the farmer card).
- [ ] Mobile frames (M1/M2) still show the old rain-only "Rainfall Outlook" card with its "vs normal" figures; move them to the weather forecast card layout in Task 9.
- [x] Officer dashboard sector table: farmers and reports columns still came from `OFFICER_DATA` — fixed (sector register + reports store).
- [ ] Greeting is always "Good afternoon" (NOW is 14:00).
- [ ] ~~Rainfall chart peak dot~~ (fixed 10/10/2026: the forecast card colours a day only by the level its rain reaches) and the "require action" KPI text use orange regardless of level (rule 4) — Task 9.
- [x] ~~Seasonal calendar card unchanged.~~ Window and phase status, progress and the footer are computed from NOW and the farmer's crop phases (12/10/2026).
- [ ] Crop calendar month cards (`MUSANZE_SEASON_CALENDAR_MONTHS`: activity, crops, moisture, advice) are still typed text; build them from the crop growth model, `rainForecasts` and plan-ahead items in Task 7.


Officer dashboard computed (09/10/2026):
- [ ] Officer bell count is still `OFFICER_DATA.profile.bellCount` (3); compute it from reports under review and attention items.
- [x] ~~Risk forecast page, officer cell drawer: hard-coded growers and acknowledgement.~~ The drawer now reads the crop risk model cell and the linked warning's delivery totals (12/10/2026).
- [ ] Reports page engagement figures (active farmers 2,890, weekly 1,980 · 2,310 · 2,640 · 2,890, 70%) and "196 reports this season" have no source in the store.
- [ ] Nothing moves `acknowledged` on a delivery record yet (farmer Acknowledge button, SMS "1" reply). Wire both to `warningDeliveries` with the member-record fix above.
- [ ] The issue-warning form keeps the last sectors and risk type between opens; reset it on open.
- [ ] Sector register changes only affect warnings issued afterwards (delivery records keep what was sent). Intentional.
- [ ] One field report was dated 20/09 although every report is meant to be within the last 7 days (21–28/09); moved to 21/09 so the computed count stays 52.

Found with the timeframe picker (11/10/2026):
- [ ] Crop advice "When" (officer) is still free text ("Before Tue 14:00") — a single deadline, not a range. Could become a date + time pill.
- [ ] Scheduled report frequency ("Every Monday 07:00") is still free text — a recurrence, not a range.
- [ ] Seeded warnings have timeframe text only (no `startsAt`/`endsAt`); they get values when an officer clicks "Change dates" in Edit.

Farmer observations (12/10/2026):
- [ ] Mobile report sheet: "Use my location" and its default sector/cell are still Kinigi · Bisoke (desktop modal now uses the farmer's own sector and cell).
- [ ] A report's "matched the forecast" flag (`isConsistent`) is seeded; new reports never get one, so they count as used but not matched.

Settings and report types (13/10/2026):
- [ ] Settings for officer, cooperative leader, researcher and administrator still read the farmer's `userSettings` (Jean-Baptiste's details); give each role its own profile from `accounts`.
- [ ] Added crops (e.g. Sorghum) have no crop growth model or risk-matrix profile, so Crop phases shows "No growth model" for them.
