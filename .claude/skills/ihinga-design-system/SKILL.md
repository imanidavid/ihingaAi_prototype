---
name: ihinga-design-system
description: IHINGA AI Design System v3 — the only allowed colours, typography, shapes, components and copy rules for this project. Use this skill before writing or changing ANY UI in this repo (pages, cards, charts, modals, drawers, forms, buttons, mobile frames), and whenever a request mentions design, styling, colours, layout, consistency, "make it look better" or a new screen. Do not use generic design inspiration that introduces new aesthetics.
---

# IHINGA AI — Design System v3

This design is locked. Consistency is graded. Do not invent new colours, fonts, gradients,
radii, shadows or component styles. If something seems missing, extend an existing
component using these tokens and say so in your summary.

## Colours

| Token | Hex | Use |
|---|---|---|
| Forest | `#1F4A34` | Hero banners, primary buttons, dark circular arrow buttons, logo mark |
| Forest light | `#2C6343` | Hero gradient end (`#1F4A34` → `#2C6343`, left to right) |
| Mid green | `#3E8E55` | Chart lines, progress bars, positive deltas, active segment, risk Low |
| Tint | `#E4ECDB` | Active nav pill, icon circles, chips, light highlights |
| Background | `#F4F6EF` | Page background (content and sidebar) |
| Card | `#FBFCF8` | Card surfaces |
| Text primary | `#17271D` | Headings, body |
| Text muted | `#5B665E` | Captions, labels — never lighter |
| Risk Watch | `#D9A032` | Watch level only |
| Risk High | `#D9772F` | High level only |
| Risk Critical | `#C93B3B` | Critical level only |

- Card border: `1px solid rgba(31,74,52,0.10)` (mandatory). Shadow: `0 2px 12px rgba(31,74,52,0.05)`.
- Status chips (Verified, Draft, Sent, Not sent, Rejected, Low response…) are **neutral**:
  outline or tint styles with an icon. Never risk colours.
- Progress bars are mid green. Below-target values get an outline "Low response" chip, not red.

## Typography

- Inter only, tabular figures for numbers. No monospace, no serif.
- Hero heading 28px weight 400 (white). Section titles 16px weight 600.
  KPI values 22px weight 600. Card stats 14px weight 600. Labels 12–13px muted. Body ≥ 13px.
- Sentence case everywhere. Brand always "IHINGA AI".
- No truncation with "…" on KPI captions or titles — shorten copy or wrap to 2 lines.

## Shape and icons

- Cards 16px radius. Photos 12px (inside cards). Buttons, chips, inputs: full pill (44px tall inputs).
- Lucide icons, 1.5px stroke, inside 40px tint circles with 1px border.
- Primary button: forest fill, white text. Secondary: white fill, 1px green border, green text.
- Circular 32px forest arrow button = "open detail".

## Components (reuse; never re-create per page)

- **Shell**: 220px light sidebar (logo + labelled nav, active = tint pill, promo card pinned bottom),
  topbar (pill search, district chip, bell with computed badge + dropdown, avatar menu).
- **Hero banner**: ~190px, forest gradient, photo on right 40% fading into green, pill badge
  top-left, 28px/400 heading, up to 3 pill buttons. Only on role dashboards and auth screens.
  Max one dark element per screen.
- **KPI card**: icon circle left; label, value, one caption line right.
- **Chart card**: title + computed delta chip + segmented control; smooth single line, soft
  gradient fill, dotted gridlines, y-axis even steps (0,10,20…), x-axis dates, legend; muted axes ≥ 12px.
- **List card**: rows of dot/icon + title + meta + right-aligned value/chip + arrow.
- **Photo card**: inset photo, cream chip over photo, title + arrow, one muted line,
  two stats, tinted footer strip with label + progress bar.
- **Drawer** (right slide-over on desktop, full-height bottom sheet inside the phone on mobile),
  **modal**, **segmented control**, **custom pill dropdown**, **custom date picker (DD/MM/YYYY)**,
  **toast**, **empty state** (icon + one line + optional action).
- Tables: Inter tabular numbers, sentence-case headers, 10 rows per page, collapse to cards on mobile.

## Layout

- Content max-width ~1200px, 24px gaps, bands of cards (full / 2:1 / equal columns).
- Main area bottom padding ≥ 96px (floating demo control).

## Copy rules

- Farmer screens: plain language, actions ≤ 10 words, no jargon ("telemetry", "sporulation",
  "hydro-meteorological" are bugs).
- No module numbers, no invented statistics, no implied government affiliation.

## Self-check before finishing any UI task

1. Only the hex values above appear in new code.
2. No risk colour used for a non-risk meaning.
3. All text sentence case (brand excepted); nothing truncated.
4. Every number on screen is read or computed from the store.
5. Empty state exists for every list/table you added.
