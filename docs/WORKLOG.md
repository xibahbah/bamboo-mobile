# Working log

## 2026-11-07

- Agreed on pooled community giving, equal-size opt-in kindness wall, daily giving streak, no daily donation reminders.
- Unified donor and recipient roles in one community app; added public stories, cultural sharing, recipes, likes and profiles.
- Chose five bottom tabs: Home, Map, Giving, Inbox, You. Admin work remains separate.
- Generated 30 daily bamboo growth states, animations, bank illustration, milestone groves and static Widget assets.
- Created three-person/two-hour plan and proposed backend API contract.
- Researched official Duolingo art, tab redesign and streak design; implemented soft mobile-first UI using original Bamboo assets.
- Created a separate local Git repository for Bamboo. No GitHub remote and no public upload. Aksharam remains a separate project.

This file records project decisions, not raw private conversation transcripts or credentials.

## Quiet UI and private collaboration repository

- Created private GitHub repository `xibahbah/bamboo-mobile`; no collaborators invited automatically.
- Simplified the feed, reduced growth to a compact row, removed competing color blocks and paused motion.
- Added three muted background choices in Settings.
- Added saved-post access, own-post removal/undo, draft preservation and payment failure recovery.
- Added 23 automated UX checks plus mobile browser inspection.
- Created BACKEND-HANDOFF.md with ownership, routes, data constraints and acceptance tests for the two backend teammates.

## Public collaboration — user decision

On 2026-11-07 the owner explicitly requested making the existing working repository public, including its existing history. This supersedes the earlier plan to use a separate public repository. GitHub Pages is being enabled for a shareable interactive demo. Collaborators are invited separately by the owner.

## 2026-11-07 · Mixed feed and morph endpoints

Keith clarified that individuals may still publish. Implemented a mixed organization/personal feed, personal Stories / Recipes / Culture tabs, centered wordmark, top-right streak, and left navigation drawer. Restored and restricted the personal composer to personal content types. Kept pooled giving and voluntary wall consent.

Delivered original minimal green SVG first/last frames and a still-frame opening mockup. Full animated morph is deferred until visual feedback, per the latest request. Added a separate morph-preview.html comparison. No Aksharam files were modified.

Updated backend handoff with organization authority and feed/profile query separation. Automated local UX regression: 28 passed. Browser QA covers endpoint switching, entry to home, story filtering, profile tabs, sidebar, mobile layout. Existing public repository and GitHub Pages workflow retained.

Keith refined the intro: replaced the shoot with a bamboo coin bank and a suspended coin; retained the approved grove endpoint. Removed taglines and moved the wordmark to the bottom. Added the daily reflection step after the opening, with 30 date-stable entries (26 originals, 4 sourced quotations), a skip path, and a San Diego timezone boundary test. Final local regression: 30/30 passed. Full morph still awaits endpoint feedback.

## 2026-11-07 · Approved 1.8s morph

Implemented the requested automatic animation and enlarged the artwork by 25%. Reused the earlier signed-distance boundary technique, with height normalization and a fixed root for the growing stalk, coin occlusion at the slot, and staggered culm/leaf growth. Production now flows directly from animation to daily reflection. Added replay/scrubbing to the public preview page.

Validation: 36 local tests passed, including the 1800ms deadline, skip/replay cancellation, reduced motion, unchanged money/streak, valid SVG geometry and the approved endpoint. Browser verified 750/1050/1350ms geometry, automatic daily quote and home handoff, and 320px overflow constraints. No files in Aksharam were modified.

## 2026-11-07 · Attached rim and animated Karma card

Fixed the detached fading rim reported in Keith’s screenshot. Replaced the top ellipse with an inset cut surface that folds geometrically and remains clipped to the current morph boundary. Added a 520ms Karma card entrance with leaf/text stagger, persistent bottom wordmark, reduced-motion handling and cancellation on dismissal/replay. The primary preview now points to the full opening → Karma → home flow, with a separate direct Karma link.

Validation: 40 tests passed. Browser checked the formerly detached-rim moment at 583ms, full automatic handoff, card display and entering the home feed.

## 2026-11-07 · Continuous morph and minimal daily reflection

Replaced quantized SVG frame replacement with a persistent SVG scene and continuous, matching-edge geometry. A single height curve joins contraction and growth, preserving the 1800ms opening. The inset rim stays clipped to the live body. Karma now contains only an original sentence and Enter Community: 720ms text float/clarity reveal and a slightly delayed button entrance. Updated the preview and generated samples.

Validation: JavaScript syntax checks passed; the combined working tree passed all 51 tests, including concurrent giving-page integration. The isolated release snapshot also passed all 41 UX tests against the existing published app shell; unrelated giving-page work remains separate. New regression coverage checks persistent SVG nodes, position/velocity continuity at former phase boundaries, clipping, animation cancellation, reduced motion and the direct Karma route. Browser verified opening → sentence → home, 390px presentation and a 320px viewport with no horizontal overflow. Screenshot: docs/mobile-quiet-quote.jpg. This change does not implement real payments or alter donation accounting.
