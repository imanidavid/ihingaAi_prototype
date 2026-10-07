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
- [ ] Farmer bell filters cooperative messages with a hard-coded `'kinigi'` (`App.tsx`) instead of Jean-Baptiste's group from `COOPERATIVE_DATA.groups`.
- [ ] Two sector→cell lists disagree: `MUSANZE_SECTORS_CELLS` (`musanzeData.ts`, used by Settings) and the list in `rwandaAdminData.ts` (used by sign-up). Merge when verifying cell names.
- [ ] Cooperative group drawer: when a warning issued in the demo becomes a group's latest, the named "not acknowledged" members are still the seeded names (count is correct). Task 1 member table replaces this.
