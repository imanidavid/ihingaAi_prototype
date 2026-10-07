# IHINGA AI — Routing Alignment, Crop Record Integration & Recommendations Page

Comprehensive plan to implement the requested DESIGN SYSTEM v3 fixes, single-source CROP RECORD integration across all pages, enhanced Report Observation modal, Crop Calendar refinements, and the new Module 7 Recommendations (Decision Support) page.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions from Phase 1 clarifications and user brief are locked:

- **Confirmed Decision 1 (Global Routing)**: `[View Forecast]` routes to **Risk Forecast**; `[Get Recommendations]` routes to **Recommendations**. Hero action buttons, Sidebar items, Topbar profile link, and Mobile tab buttons all point to identical destinations.
- **Confirmed Decision 2 (Early Warnings Text)**: Change card trigger text from *"Tap to review field actions"* to exact wording: `"Review field actions"`.
- **Confirmed Decision 3 (Floating Elements & Edge Cleanliness)**: Inspect and remove any stray floating sparkle/water-drop buttons on the right edge. Ensure only the approved floating device preview switcher exists.
- **Confirmed Decision 4 (Report Observation Modal)**:
  - Custom pill dropdowns for District, Sector, and Cell (identical to Settings styling). Cell options dynamically depend on selected Sector.
  - Secondary pill button `"Use my location"` positioned above dropdowns; clicking it displays tint chip `"GPS: Kinigi, Musanze"` and pre-fills Musanze > Kinigi > Bisoke.
  - Date input: custom pill style, `DD/MM/YYYY` format display, future dates disabled (`max={today}`).
  - All form labels: 13px, sentence case, muted `#5B665E`.
- **Confirmed Decision 5 (Single Source of Truth CROP RECORD)**:
  - **Irish Potato**: Planted 05/09/2026 · Now early vegetative (day 23) · Tuber initiation mid-Oct · Bulking Nov · Harvest early Jan (20% elapsed).
  - **Climbing Beans**: Planted 12/09/2026 · Now vegetative · Staking early Oct · Flowering & podding Nov · Harvest mid-Dec to early Jan (22% elapsed).
  - **Maize**: Planted 20/09/2026 · Now emergence · Top-dress late Oct · Harvest Feb (6% elapsed).
- **Confirmed Decision 6 (Crop Calendar View)**:
  - Retain 6 month cards (Sep–Feb, Sep highlighted).
  - Month stage text follows CROP RECORD (Sep = *"Planting & emergence"*).
  - Remove *"Favorable days"*; keep moisture line.
  - Restore **Crop phases** section below cards: one row per crop with crop name, current stage chip, one-line next action, and progress bar showing % of season elapsed (Potato 20%, Beans 22%, Maize 6%).
- **Confirmed Decision 7 (New Page: Recommendations — Module 7)**:
  - Header: `"Recommendations"` + subtitle `"For your farm in Kinigi, Musanze · based on this week's forecast"`. Right side: secondary pill `[Download all (PDF)]` triggering toast `"PDF downloaded"`.
  - Thin delivery card: `"You receive advice by: SMS · Kinyarwanda"` + `[Change]` link navigating to Settings > Notifications. Directly reflects Settings state: if SMS alerts are off, displays `"In-app only"` with Watch-amber dot.
  - Controls row: Crop filter chips `[All]` `[Irish Potato]` `[Climbing Beans]` `[Maize]` + segmented control `[For you]` `[Saved]`.
  - Section 1 — *"Act this week"*: The 3 photo cards from Crop Advisories band (reused component, *"Spray window opens Tue 14:00"*, progress bar `"Opens in 18h"`).
  - Section 2 — *"Plan ahead"*: List card with category icon, title, one-line rationale, timing chip, and circular arrow button:
    1. *Risk mitigation*: "Clear terrace drainage channels before Tuesday's rain" — Before Tue (All crops)
    2. *Fertilizer & inputs*: "Top-dress maize with urea once soil drains" — Late Oct (Maize)
    3. *Planting window*: "Last maize planting window in Kinigi closes" — 05/10/2026 (Maize)
    4. *Crop variety*: "Choose a late-blight tolerant certified potato variety recommended by RAB for Season B" — Season B (Irish Potato) [Pre-saved]
    5. *Harvest timing*: "Potato harvest expected early January; plan for dry days" — Early Jan (Irish Potato)
  - Filtering applies across both sections with clean fallback message: *"No [crop] items in this section this week."*
  - Pre-saved: Item #4 (*"Choose a late-blight tolerant certified potato variety..."*).
  - Empty state for `[Saved]`: Leaf icon + *"No saved advice yet"*.
  - Full interaction: Clicking row/card opens Advisory drawer; clicking `[Save]` toggles saved state and displays `"Saved"` toast.
  - Strict scope: No AI chat, no expert booking, no market prices, no yield/profit numbers.

---

## 1. System Architecture & Routing Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Topbar: Search | Musanze Chip | Bell (2) | JB Avatar ─────────────────────────┐                  │
├───────────────────────────────────────────────────────────────────────────────┼──────────────────┤
│ Sidebar (220px)                     │ Main Content View                       │ Navigation Map:  │
│ • Dashboard                         │ ┌─────────────────────────────────────┐ │ • Hero Buttons   │
│ • Risk Forecast ◄───────────────────┼─┼─► Risk Forecast View                │ │   [View Forecast]│
│ • Early Warnings                    │ │ • 4 KPIs + 15-Sector Grid           │ │   -> /forecast   │
│ • Recommendations ◄─────────────────┼─┼─► Recommendations View (NEW)        │ │   [Get Recs]     │
│ • Crop Calendar                     │ │ • Delivery Card (SMS/In-app sync)   │ │   -> /recs       │
│ • Observations (Placeholder)        │ │ • [All][Potato][Beans][Maize]       │ │ • Sidebar Nav    │
│ • Settings                          │ │ • Act this week (3 photo cards)     │ │   Consistent IDs │
│ ─────────────────────────────────── │ │ • Plan ahead (5 Category rows)      │ │ • Mobile Tabs    │
│ Pinned Promo Card                   │ │ • [Saved] Tab (Pre-saved RAB item)  │ │   Home/Forecast/ │
│ [Report Observation Arrow] ─────────┼─┼─► Modal (GPS, Pill Dropdowns, Date) │ │   Warnings/Advice│
└─────────────────────────────────────┴─┴─────────────────────────────────────┴─┴──────────────────┘
```

---

## 2. Component Implementation Plan

### 2.1 CROP RECORD & Shared Data (`mockData.ts`)
- Define `CROP_RECORD` single source of truth:
  ```ts
  export const CROP_RECORD = {
    potato: {
      crop: 'Irish Potato',
      plantedDate: '05/09/2026',
      currentStage: 'Early vegetative (day 23)',
      nextAction: 'Tuber initiation scouting in mid-October',
      seasonProgress: 20,
      milestones: ['Planted 05/09', 'Tuber initiation mid-Oct', 'Bulking Nov', 'Harvest early Jan']
    },
    beans: {
      crop: 'Climbing Beans',
      plantedDate: '12/09/2026',
      currentStage: 'Vegetative',
      nextAction: 'Reinforce hillside trellising and staking in early October',
      seasonProgress: 22,
      milestones: ['Planted 12/09', 'Staking early Oct', 'Flowering & podding Nov', 'Harvest mid-Dec–Jan']
    },
    maize: {
      crop: 'Highland Maize',
      plantedDate: '20/09/2026',
      currentStage: 'Emergence',
      nextAction: 'Top-dress with urea once volcanic soil drains in late October',
      seasonProgress: 6,
      milestones: ['Planted 20/09', 'Top-dress late Oct', 'Harvest Feb']
    }
  };
  ```
- Update `MUSANZE_SEASON_CALENDAR_MONTHS` stage text:
  - September: Activity Title = `"Planting & emergence"` (following CROP RECORD).
  - Remove `favorableDays`. Retain `moistureStatus`.
- Define Plan Ahead recommendations items array with category icons, titles, one-line rationales, timing chips, and crop tags.

### 2.2 Report Observation Modal (`ReportObservationModal.tsx`)
- Add `"Use my location"` secondary pill button above dropdowns.
- When clicked, display tint chip `"GPS: Kinigi, Musanze"` and set district to "Musanze", sector to "Kinigi", and cell to "Bisoke".
- Custom pill dropdowns for District, Sector, and Cell matching Settings (`h-11 px-4 rounded-full bg-white border border-[rgba(31,74,52,0.16)] appearance-none`).
- Cell dropdown dynamically populates from selected sector.
- Date input styled in full pill, DD/MM/YYYY format, with `max={new Date().toISOString().split('T')[0]}` to prevent future dates.
- Sentence-case 13px muted `#5B665E` labels throughout.

### 2.3 Early Warnings Card Fix (`EarlyWarningsView.tsx`)
- Update footer text from `"Tap to review field actions"` to exact wording `"Review field actions"`.

### 2.4 Crop Calendar View (`CropCalendarView.tsx`)
- 6 Month cards (Sep–Feb, Sep highlighted with deep forest border).
- Stage text in Sep card reflects `"Planting & emergence"`.
- Remove `"Favorable days"` field from month cards; keep moisture status.
- Add **Crop phases** section below:
  - Table / Card rows for Irish Potato, Climbing Beans, Highland Maize.
  - Columns: Crop name, Current stage badge (`#E4ECDB`), one-line next action, and progress bar with exact % of season elapsed (Potato 20%, Beans 22%, Maize 6%).

### 2.5 New Page: Recommendations View (`RecommendationsView.tsx`)
- Full page layout conforming to DESIGN SYSTEM v3.
- **Header**: Title `"Recommendations"` + subtitle `"For your farm in Kinigi, Musanze · based on this week's forecast"`.
  - Secondary pill button `[Download all (PDF)]` triggering small toast `"PDF downloaded"`.
- **Delivery Card**:
  - Thin, full-width cream card (`#FBFCF8`, 1px border `rgba(31,74,52,0.10)`).
  - Displays: `"You receive advice by: SMS · Kinyarwanda"` (or `"In-app only"` with Watch-amber dot if SMS alerts are off in Settings).
  - `[Change]` text link immediately navigating to `Settings > Notifications`.
- **Controls Row**:
  - Filter chips: `[All]` `[Irish Potato]` `[Climbing Beans]` `[Maize]`.
  - Segmented control: `[For you]` `[Saved]`.
- **Tab: For you**:
  - **Section 1: Act this week**:
    - Reuses the 3 photo cards (`Don't spray until Tuesday 14:00`, `Reinforce hillside trellising`, `Clear volcanic furrow channels`).
    - Filtered by chosen crop chip. If empty, displays muted fallback: `"No [crop] items in this section this week."`.
  - **Section 2: Plan ahead**:
    - List card with 5 category items.
    - Category icons: ShieldAlert (Risk mitigation), Sprout (Fertilizer), Calendar (Planting window), Sparkles (Crop variety), Clock (Harvest timing).
    - Timing chip on right + 32px circular arrow button opening Advisory drawer.
    - Filtered by chosen crop chip (Drainage item has tag `'all'`, visible under all filters).
- **Tab: Saved**:
  - Pre-populated with 1 item: *"Choose a late-blight tolerant certified potato variety recommended by RAB for Season B"*.
  - When empty: Displays leaf icon + *"No saved advice yet"*.
- **Drawer Integration**:
  - Opening any card or row shows the full Advisory drawer.
  - Clicking `[Save]` toggles item in `savedAdviceIds` state and triggers `"Saved"` toast.

### 2.6 Routing & Navigation Synchronization (`App.tsx`)
- Route `currentView === 'recommendations'` directly to `RecommendationsView`.
- Connect Hero banner `[Get Recommendations]` and `[View Forecast]` buttons.
- Connect MobileFrame tabs: `Advice` tab opens Recommendations / Advisory.
- Ensure only `observations` remains as a PlaceholderView.

---

## 3. Verification & Testing

1. Check routing: clicking `[View Forecast]` in Hero Banner opens Risk Forecast; clicking `[Get Recommendations]` opens Recommendations; sidebar items and mobile tab bar match.
2. In Early Warnings, verify trigger reads `"Review field actions"`.
3. In Report Observation modal, test `"Use my location"` GPS pill, verify District/Sector/Cell custom pill dropdowns, and verify date picker enforces DD/MM/YYYY with disabled future dates.
4. Verify Crop Calendar shows 6 cards with September as `"Planting & emergence"`, no favorable days, and the 3 crop phase rows with 20%, 22%, 6% progress bars.
5. In Recommendations page:
   - Test `[Download all (PDF)]` toast.
   - Verify delivery card reflects Settings SMS state (SMS · Kinyarwanda vs In-app only).
   - Test crop filtering across both sections.
   - Verify Plan ahead rows open Advisory drawer.
   - Test saving an item, switching to `[Saved]` tab, and checking the pre-saved RAB variety recommendation.
6. Verify no floating blue water-drop or sparkle buttons exist.
7. Run `compile_applet` and `lint_applet` to verify clean build.
