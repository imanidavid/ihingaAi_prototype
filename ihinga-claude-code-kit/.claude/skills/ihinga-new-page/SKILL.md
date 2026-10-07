---
name: ihinga-new-page
description: Step-by-step procedure for building or rebuilding a page, tab, drawer or modal in the IHINGA AI prototype so it follows the module requirements, the shared data store and the cross-role rules. Use this skill whenever the task is to build a new screen, finish a placeholder, add a role (Researcher, Administrator), extend a module, or implement anything listed in docs/remaining-work.md.
---

# Building a page in IHINGA AI

## 1. Read before writing
1. `CLAUDE.md` golden rules.
2. The task in `docs/remaining-work.md`.
3. The matching module in `docs/requirements.md` — list its **UI elements**. Every UI element
   listed must appear somewhere on the page (or be explicitly assigned to another role's page).
4. The `ihinga-design-system` skill.

## 2. Plan (write it in your reply before coding)
- Which module UI elements map to which section of the page.
- Which store fields the page reads and which it changes. If new data is needed, add it to
  `src/data/musanzeData.ts` / the store — never inside the component.
- Which other roles see the effect of actions on this page (cross-role), and how.
- What `Reset demo` must restore.

## 3. Build rules
- Reuse existing components (shell, hero, KPI card, chart card, list card, drawer, modal,
  segmented control, pill dropdown, date picker, toast, empty state).
- Every number computed from the store. Totals must add up (channel splits = farmers reached,
  per-sector counts = district totals).
- Role scoping: farmers see their area; cooperative leaders see their cooperative;
  officers see Musanze district; admins see the system.
- New role: add its demo account to the sign-in "Demo accounts" panel and to the floating
  role switcher; sidebar items must open real pages or a placeholder that says
  "Screen designed in next iteration."
- Images/video: use the `ihinga-media-prompts` skill. Never fetch or generate media.
- Prototype honesty: simulated external integrations are labelled "Simulated feed";
  illustrative numbers are labelled "Estimate".

## 4. Verify
1. `npm run build` passes with no type errors.
2. Walk the page: every button does something (navigate, open drawer/modal, toast, or state change).
3. Cross-check numbers against other pages showing the same data.
4. Run every flow in `docs/demo-script.md` — none may break.
5. `Reset demo` restores everything.
6. Design self-check from `ihinga-design-system`.

## 5. Finish
- Update the progress checklist in `docs/remaining-work.md`.
- Add anything deferred to `docs/fix-in-code-later.md`.
- Commit: `git add -A && git commit -m "<role>: <page> (<module>)"`.
- Summarise in ≤ 10 bullets: what was built, store fields changed, checks run, anything deferred.
