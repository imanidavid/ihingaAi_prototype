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
- [ ] The floating role switcher signs in as the demo account without updating "Last sign-in" or the audit log (only the real sign-in form does). Intentional for now; revisit in Task 3.
- [ ] Imported farmers get `farmSizeHa: 0` (the CSV has no farm size column).

