# UI verification — 2026-11-07

- `npm run check`: JavaScript syntax passed.
- Local server `/`: HTTP 200.
- Browser mobile layout inspected at 320px and 390px; 320px document width equals viewport width, with no horizontal page overflow. Visible images loaded.
- Simulated $0.10 donation: giving streak changed 14 → 15; pool showed $200.10 received / $50 delivered / $150.10 available.
- “Keep it private for now” closes the invitation without automatically joining the wall.
- Published a fictional local recipe post: it appeared in the feed; giving streak stayed 15.
- Like on Maria's post changed to the unlike state.
- Screenshot: `mobile-ui-preview.jpg`.

These checks cover the local UI demo. They do not validate real payments, backend authorization, real map locations, actual message delivery or native mobile packaging.
