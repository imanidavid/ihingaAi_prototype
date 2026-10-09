# Remaining work (do in this order, one task per session)

Review target date: ~28/10/2026. Each task: follow the `ihinga-new-page` skill, then commit.

## Progress
- [x] Farmer role (dashboard, risk forecast, early warnings, recommendations, crop calendar, observations, settings, mobile M1/M2)
- [x] Officer role (dashboard, warnings, observations review, reports)
- [x] Sign-in, two-step verification, session timeout, sign-up, verification, forgot password
- [x] Cooperative leader — part 1 (dashboard, message composer, cross-role messages)
- [x] Task A — Data integrity fixes (Jean-Baptiste single record, cooperative warning levels computed, rainfall normal in data, composer groups from data, sentence-case sidebar, staff id MUS-AO-4401, media manifest) — 07/10/2026
- [ ] Task B — PillSelect + DatePicker, replace 17 native selects (folded into Task 9). The two components now exist (built in Task 1); only the replacement is left.
- [x] Task 1 — Cooperative leader part 2 (Module 11 + Module 8 sharing): Members & groups (Members · Groups · Performance · Directory), Meetings (shared calendar, schedule meeting → farmer crop calendar + bell), Training (materials, shared sprayer bookings with double booking blocked), dashboard fixes, `PillSelect` + `DatePicker` — 08/10/2026
- [x] Task 2 — Admin: shell, dashboard, Users & access (Module 13, Module 2): Grace's account (two-step), admin sidebar, dashboard, Users · Access requests · Permission matrix · Bulk import, approval lets the account sign in, one set of role names, `auditEvents` store — 08/10/2026
- [x] Task 3 — Admin: Security & audit (Module 14): audit log (filters, CSV, user timeline), login activity + failed sign-in alert, data access & export tracking, live security settings — 08/10/2026
- [x] Task 4 — Admin: Data sources + Data processing (Modules 3, 4): source cards, missing-data alerts, connection wizard, manual CSV upload; pipeline with Run now / Reprocess, run history, quality metrics, settings — 08/10/2026
- [x] Task 5 — Admin: Notifications, SMS & voice (Module 10): message history + delivery by channel, templates (EN/RW, 160-char counters), voice settings, opt-outs (Jean-Baptiste joins when he stops SMS), SMS inbox, scheduled messages, broadcast composer — 08/10/2026
- [ ] Task 6 — Researcher role (Module 5 model performance, Module 12 research reports)
- [ ] Task 7 — Crop calendar gaps (Module 8)
- [ ] Task 8 — Fix-in-code-later list (`docs/fix-in-code-later.md`)
- [ ] Task 9 — Consistency pass across all roles + mobile (design self-check on every page)

---

## Task 1 — Cooperative leader part 2
Fixes on the cooperative dashboard:
- Remove the invented "reduces fungicide cost by 32%" claim. Use: "A shared spraying schedule
  means members don't spray before rain and the cooperative's sprayers are used in turn."
- ~~"Under active warnings" KPI value in text primary colour, not amber.~~ Done in Task A
  (the KPI and the hero are now computed from the warnings state).

Members & groups page — tabs Members · Groups · Performance · Directory
- Members: table of all 186 members (10/page): name, group, masked phone, role, crops,
  latest warning acknowledged (Yes/No neutral chip), last active, actions (Message, Change role,
  Remove with confirm). Roles: Leader (Aline Uwimana), Secretary, Treasurer, Group lead (one per
  group), Member (Jean-Baptiste = Member, Kinigi growers). Filters: group, role, "Not acknowledged
  latest warning"; search. [+ Add member]: search registered Musanze farmers → choose group.
  Not-acknowledged counts computed and equal to the dashboard group drawer.
- Groups: card per group (members, lead, active warnings, reports 7d, [Open]). Drawer: members,
  aggregated member field reports (counts by type + latest 3, same records the officer sees),
  [Message group]. [+ Create group]: name, lead, members.
- Performance (computed where possible): active members 30 days (141 of 186, 76%), average
  acknowledgement (164 of 268 deliveries, 61%), member reports this season (42), messages sent
  (from store). Line chart weekly active members W1 102 · W2 118 · W3 133 · W4 141.
  Acknowledgement by group bars ("Low response" chip under 50%).
- Directory (cooperatives in Musanze): Musanze Potato Growers Cooperative (186, "Your
  cooperative") · Kinigi Bean Farmers Union (124) · Busogo Maize Cooperative (97) · Muhoza
  Vegetable Growers (76) · Remera Wheat & Potato Cooperative (88) · Nyange Pyrethrum Growers (64).

Meetings page: month calendar (Sep/Oct 2026) with meetings, equipment bookings and crop windows
(spray window opens Tue 29/09 14:00) + upcoming list:
Thu 01/10 14:00 Blight plan for Season A · Kinigi sector office · Kinigi growers;
Mon 05/10 09:00 Seed orders for Season B · Cooperative store · All members;
Sat 10/10 08:30 Field day: recognising late blight · Member plot, Bisoke · All members.
[+ Schedule meeting]: title, date picker, time, place, groups, "Send SMS invitation" toggle.
Cross-role: meetings appear on Jean-Baptiste's Crop Calendar under "Cooperative events" (only
for groups he belongs to) and as a bell notification.

Training page — tabs Materials · Shared equipment
- Materials (note "Sample materials for the prototype"): Recognising late blight early (Audio,
  Kinyarwanda, 4 min) · Staking climbing beans (Video, Kinyarwanda, 6 min) · Clearing drainage
  channels on terraces (Guide, English, 3 pages) · Safe use of fungicides (Audio, Kinyarwanda,
  5 min). [Preview] and [Share with members] (composer prefilled). Thumbnails via media manifest.
- Shared equipment: Sprayer 1–3 with booking list; existing bookings start Tue 29/09 14:00.
  [+ Book] (equipment, date, slot, group/member); double booking blocked inline; bookings show
  on the Meetings calendar.
Reset demo removes demo-created meetings, groups, members, bookings.
Checks: Kinigi meeting reaches Jean-Baptiste, Busogo-only meeting does not; double booking blocked.

## Task 2 — Admin: shell, dashboard, Users & access
- Admin demo account: Grace Ingabire · grace.i@ihinga.demo · demo1234 (two-step code 246810).
  Add to sign-in demo accounts and floating switcher. Desktop only.
- Sidebar: Dashboard · Users & access · Security & audit · Data sources · Data processing ·
  Notifications · Reports (reuse officer reports, system-wide) · Settings.
- Dashboard: KPIs — users by role (computed), pending access requests (store `accessRequests`
  + 2 seeded), data sources healthy (4 of 5), last processing run; cards — pending approvals
  (approve/reject inline), data source health, latest 5 audit events.
- Users & access: user table (name, role, scope district/sector/cooperative, status, last
  sign-in, two-step on/off), filters, suspend/reactivate, change role, geographic scope editor;
  Access requests tab: approve/reject with reason. Cross-role: approving an officer/researcher/
  cooperative sign-up lets that account sign in (the "Waiting for approval" screen disappears).
  Permission matrix tab: roles × permissions checkboxes (view forecasts, issue warnings,
  verify reports, message members, manage users, export data…), save with confirm.
  Bulk import tab: upload CSV of cooperative members → preview table with validation errors →
  import valid rows.

## Task 3 — Admin: Security & audit
- Audit log built from REAL store events (sign-ins, warnings issued/ended, reports verified,
  messages sent, exports, role changes): time, user, role, action, target, filters by user/action/
  date, export CSV. User action timeline in a drawer per user.
- Login activity (successful/failed, device, location), anomaly alerts (e.g. 5 failed sign-ins).
- Farmer data access tracking (who opened which farmer's reports), export tracking.
- Security settings: two-step required for officers/admins, session timeouts (officer 15 min,
  farmer 60 min), password policy, data retention period, encryption status indicators
  ("Data encrypted at rest — simulated").

## Task 4 — Admin: Data sources + Data processing
- Data sources (each labelled "Simulated feed"): Weather station network, Satellite rainfall,
  Vegetation index, Seasonal forecast, Manual upload. Cards: status (Healthy/Delayed/Error,
  neutral chips + icon), last sync, records today, completeness %, refresh schedule.
  Connection wizard modal (type → endpoint → credentials masked → schedule → test → save).
  Missing-data alerts. Manual CSV upload with validation preview.
- Data processing: pipeline stages Ingest → Clean → Fill gaps → Check outliers → Aggregate
  (daily/dekadal/monthly) → Climate normals → Ready for forecast, with status per stage;
  schedule "every 6 hours" (matches the warning rules note); run history table; quality metrics;
  [Run now] / [Reprocess] with progress; settings (gap filling method, outlier threshold, spatial
  interpolation, aggregation). The 13 mm/day normal shown on rainfall charts comes from here.

## Task 5 — Admin: Notifications, SMS & voice
- Templates (warning, advisory, cooperative, meeting) in English + Kinyarwanda with 160-char
  counters; voice message settings.
- Message history: every message in the store (warnings + cooperative messages + meeting
  invitations) with delivery by channel; delivery analytics chart.
- Opt-outs: farmers who stopped SMS (cross-role: if Jean-Baptiste stops SMS in Settings, he
  appears here).
- Two-way SMS inbox: farmer replies ("1" = acknowledged) — explains how acknowledgements are
  recorded. Scheduled messages list. Broadcast composer (reuse).

## Task 6 — Researcher role
- Demo account: Dr. Diane Uwase · diane.u@ihinga.demo · demo1234. Desktop only.
- Sidebar: Risk Forecast (reuse) · Model performance · Field data · Reports (reuse, research
  report types) · Settings.
- Model performance: forecast vs observed rainfall chart, accuracy by horizon (10 days / month /
  season), warning hit rate (4 of 5 confirmed by reports), report-based validation
  (38 used, 33 matched, 87%), all labelled as prototype/simulated results.
- Field data: anonymised reports table + [Export CSV] (no farmer names).

## Task 7 — Crop calendar gaps
Crop selector, risk overlay on the calendar (warning windows), previous-season comparison row,
export/print (print stylesheet), "SMS reminders" toggle per activity, cooperative events
(from Task 1).
