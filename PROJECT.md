# Bamboo mobile app — independent working repository

This repository is exclusively for the Bamboo humanities hackathon mobile application. It is not Aksharam and has no dependency on that application's runtime or repository.

## Run

`npm run dev` (or `python3 -m http.server 5187 --bind 127.0.0.1`). Open http://127.0.0.1:5187/ . No dependency installation is required for the UI. Use a mobile viewport first.

`npm run check` validates JavaScript syntax. Asset regeneration needs Python + Pillow.

## Structure

- `index.html`, `ui.css`, `ui.js`: mobile-first interactive UI.
- `assets/`: generated artwork, PNG day states, animation frames, GIFs, locally bundled OFL-licensed DM Sans font.
- `preview.html`: animation study.
- `scripts/`: deterministic asset export scripts.
- `TEAM-2H.md`, `API-CONTRACT.md`: private working task plan and proposed backend contract.
- `RESEARCH.md`, `UI-RESEARCH.md`, `docs/`: design rationale, earlier UX and research context.

## Repository boundaries

Local Git repository with its own history. No GitHub remote has been created or configured. A local repository does not have a GitHub public/private visibility setting; nothing has been uploaded. `package.json` is marked private to prevent accidental npm publishing.

Keep working commits and planning here. When the team explicitly requests a public release, export the agreed source/assets into a NEW repository, without copying this `.git` history. Review which documents to include at that time. Do not rewrite or erase this working history automatically.

## Demo boundaries

Current UI stores fictional posts and preferences in localStorage. Transactions, streak, map and messaging are simulated. Not a native iOS/Android application yet; this is the mobile-first web UI layer. Backend integration belongs to the two teammate workstreams. Apple Widget assets are prepared, but no native Widget extension is implemented.
