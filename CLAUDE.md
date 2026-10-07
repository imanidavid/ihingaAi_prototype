# IHINGA AI — Climate Risk Prediction System (frontend prototype)

Final-year project prototype for smallholder farmers in Musanze District, Rwanda.
**Frontend only.** All data is simulated and lives in one shared store. There is no backend.
The project is graded against the teacher's 14-module requirements (`docs/requirements.md`)
and on visual consistency.

## Golden rules (never break these)

1. **One source of truth.** All data lives in `src/data/musanzeData.ts` and the shared store.
   Components never hard-code numbers, names, dates, risk levels or captions.
   Every count, percentage, comparison and total is **computed** from the store.
   Each data type exists exactly once in the store (one `warnings`, one `reports`, one `messages`, …).
2. **NOW = Monday 28/09/2026, 14:00.** Every countdown, "x ago" and date is computed from NOW.
3. **Design System v3 only.** Use the `ihinga-design-system` skill before writing any UI.
   No new colours, fonts, radii or shadows.
4. **Risk colours mean risk.** Amber/orange/red are only for Watch/High/Critical.
   Never for decoration, counts, status chips or progress bars.
5. **Risk scale is exactly:** Low · Watch · High · Critical. Nothing else ("Moderate", "Normal" are bugs).
6. **Sector climate risk** = the higher of (a) the sector's forecast risk and (b) active *weather*
   warnings covering it. Pest/disease warnings do not change climate risk.
   District risk = highest sector climate risk.
7. **Sentence case** for every label, heading and button. No ALL-CAPS text.
   Exception: the brand is always written **IHINGA AI**.
8. **Plain language** on farmer-facing screens: short sentences, max 10 words per action,
   no scientific names or technical terms.
9. **No module numbers in the UI.** Module numbers belong in documentation only.
10. **No invented statistics.** Any number without a source in the store is either removed
    or labelled "Estimate" / "Illustrative".
11. **No implied official affiliation.** Never present the prototype as endorsed by the
    Government of Rwanda, RAB, Meteo Rwanda or MINAGRI. External feeds are labelled "simulated".
12. **Dates DD/MM/YYYY.** Use the custom date picker, never the native date input.
    Use the custom pill dropdown, never a native `<select>`.
13. **The floating demo control never covers content** (main area has ≥ 96px bottom padding).
14. **Reset demo** must restore every store field to its initial value, including anything
    created during the demo (warnings, reports, messages, meetings, accounts, bookings).

## Roles (one shared store, desktop unless noted)

| Role | Demo account | Lands on |
|---|---|---|
| Farmer | Jean-Baptiste Ndayisaba · +250 788 000 012 · demo1234 | Farmer dashboard (desktop + mobile M1/M2) |
| Cooperative leader | Aline Uwimana · +250 788 000 034 · demo1234 | Cooperative dashboard |
| Agricultural officer | Claudine Mukamana · claudine.m@ihinga.demo · demo1234 (2-step code 246810) | Officer dashboard |
| Researcher | not built yet | see docs/remaining-work.md |
| Administrator | not built yet | see docs/remaining-work.md |

Jean-Baptiste: Kinigi sector, Bisoke cell, member of Musanze Potato Growers Cooperative
(Kinigi growers group), language Kinyarwanda, alerts by SMS.

## Key data (must stay consistent everywhere)

- District risk Watch. Watch sectors: Kinigi, Busogo, Remera, Muhoza (4 of 15). Farmers: 4,120.
- Active warnings: **Heavy Rain Influx** (Watch · Kinigi, Busogo, Remera · Tue 02:00–14:00, peak 48 mm ·
  issued 13:35) and **Late Blight Threat** (High · Irish Potato plots · Muhoza & Kinigi · next 48–72 h · issued 13:00).
- Acknowledged: Heavy Rain 1,061 of 1,640 (65%); Late Blight 402 of 690 (58%). Season average 62%.
- Weather: 22°C / 78%. Rain: 10-day ≈185 mm, 30-day 300 mm, normal 13 mm/day.
- Field reports: 52 in last 7 days (Kinigi 14).
- Potato advisory: "Don't spray until Tuesday 14:00" / "Heavy rain will wash the spray off your plants."

## Cross-role flows (the demo — must always work)

See `docs/demo-script.md`. Never break these when changing anything.

## How to work in this repo

- One page or one fix-list per task. Before starting, read `docs/remaining-work.md` and the
  relevant module in `docs/requirements.md`. For new pages use the `ihinga-new-page` skill.
- Images/video: never generate or download them. Use the `ihinga-media-prompts` skill:
  add an entry to `docs/media-manifest.md` and reference the file path with a fallback.
- After each task: run `npm run build` (must pass), run the checks listed for that task,
  update the progress section of `docs/remaining-work.md`, then commit with git.
- Keep `docs/fix-in-code-later.md` up to date when something is deferred.
