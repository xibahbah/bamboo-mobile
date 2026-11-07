# UI verification — 2026-11-07

## Quiet UI revision

- Automated UX regression suite: 23 tests, run with `npm test` (Node test runner + jsdom). Covers navigation, draft/type retention, escaped post content, empty input errors, reversible likes, saved-post discovery, removal/undo, filters, profiles, map selection, chat drafts, theme persistence, donation presets, amount validation, retry/cancel, successful payment accounting, explicit wall consent/removal, support access, recipe detail and browser history.
- Fixed preset and cancel buttons unintentionally submitting parent forms by setting explicit `type="button"`.
- Fixed profile initial updates, preserved donation amount on edit/retry, added failed-payment path, and made saved posts reachable.
- Browser: checked quiet mobile UI at 390px and 320px; 320px document width matches viewport. Checked theme switching and own-post removal. Screenshot: `mobile-quiet-preview.jpg`.
- Motion/hover transitions disabled in `quiet.css`, pending later design work.
- Internal ux-heuristics review: provisional 9/10. Remaining severity-2 issue: no text search across a growing feed; add search when the dataset grows beyond the current small demo. This is a design self-check, not a human usability-study score.
- Real backend, payment provider behavior, authorization, actual message delivery and native iOS remain unimplemented and unverified. See `BACKEND-HANDOFF.md` for required acceptance tests.

## Earlier baseline

- `npm run check`: JavaScript syntax passed.
- Local server `/`: HTTP 200.
- Browser mobile layout inspected at 320px and 390px; 320px document width equals viewport width, with no horizontal page overflow. Visible images loaded.
- Simulated $0.10 donation: giving streak changed 14 → 15; pool showed $200.10 received / $50 delivered / $150.10 available.
- “Keep it private for now” closes the invitation without automatically joining the wall.
- Published a fictional local recipe post: it appeared in the feed; giving streak stayed 15.
- Like on Maria's post changed to the unlike state.
- Screenshot: `mobile-ui-preview.jpg`.

These checks cover the local UI demo. They do not validate real payments, backend authorization, real map locations, actual message delivery or native mobile packaging.
