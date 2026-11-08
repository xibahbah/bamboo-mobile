# Bamboo mobile integration check — November 7, 2026

## Run the same version in every window

Project: `/Users/keith/Documents/ChatGPT/gift/bamboo`

Run `npm run preview`, then open `http://127.0.0.1:5188/phone.html`.
The preview server anchors its document root to this repository and uses `Cache-Control: no-store`. The phone shell renders the application at 390 × 844 CSS pixels and scales the frame to fit the desktop window.

Tap the Bamboo icon to open the application. The URL deliberately omits `view=home`, which bypasses the opening. Launch sequence: morph → daily reflection → Home. Reload latest returns to the phone launcher. Existing application tabs must be reloaded after edits; GitHub Pages is a separate deployment and does not mirror uncommitted local files.

## Integration

Pulled commit `7b70da7` (three revised posts and photographs). Resolved the shared post-renderer conflict by retaining incoming photo metadata plus local Give, Like, Save, and messaging actions. Preserved local Community wallpaper, settings, grove, widget, and transaction-history work.

## Verification

68 automated tests passed, including navigation/history, filters, stories/recipes/culture, escaping, save/unsave, profile editing, post removal/undo, form validation, demo payment failure and idempotency, daily growth, environment preferences, six-bamboo geometry, intro and reduced motion, quote transitions, widget synchronization, community eligibility/consent/empty states, and phone launch/reload.

Browser checks at phone dimensions covered recipient gifts, two receipts with no extra same-day growth, Transaction History, replay-only grove, environment selection, messages, profile save, recipe/culture tabs, save/unsave, city selection, empty community, new generated portraits, and the teammate's photo post. The opening animation was observed in the phone shell. A browser-injected MutationObserver error appeared in the preview logs; no matching MutationObserver exists in project code, so its origin was not established.

## Changes made during QA

- Growth advances at most once per San Diego calendar day, regardless of gift count or amount. Earned growth is retained across streak breaks.
- Default grove heart sends a floating heart without donating or replaying growth. Growth animation occurs only on the first grove visit per local day. Recipient giving retains explicit amount and demo labels.
- Account Settings includes Transaction History; receipts retain amount, recipient, and new receipt timestamps.
- Widget giving link opens the community feed instead of a replay-only grove.
- Community replaces Map, with a faint decorative map, direct city selector, equal-size portraits, and optional local visibility.
- Phone launch/reload no longer bypasses the intro or lands on Community.

## Limits

This is a browser phone simulation, not native iOS/Android testing. No real payment processing, message delivery, GPS, server-side verification, or installed native widget is implemented. All member eligibility and transactions are local demo data. Ports 5187 and 5188 have separate browser storage, so their demo counts may differ. Generated portraits and new city populations are fictional. A real device, payment backend, cross-tab payment concurrency, and server-enforced consent require separate testing.

Home-screen widget preview slider validated at days 1, 7, 28, 84, and 90. It does not write to localStorage. The launch icon and widget both open the full intro; Reload latest returns to the phone launcher.
