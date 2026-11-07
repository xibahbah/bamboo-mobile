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
