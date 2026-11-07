# Bamboo widget — design review and handoff

Open `widget.html` beside the existing `index.html`. It is a standalone interactive design specimen, with no new dependencies and no changes to the existing app state.

## Design review

The active visual system is defined by `quiet.css`, which overrides the brighter palette in `UI-RESEARCH.md`: warm stone #f3f1ec, paper #faf9f6, subdued greens, restrained borders, and no movement. The new widget follows that quieter direction, with a single flat bamboo stem rather than the detailed grove artwork. Its height increases daily through day 30; the numeric streak can continue beyond 30 while the illustration stays at full height. There is no donation ranking or amount-based growth.

Three gaps matter for implementation:

- `ui.js` derives every streak display from `state.paid ? 15 : 14`. A stored boolean has no date and cannot expire at midnight, detect missed days, or represent a new streak.
- The existing UI is a web demo. PNG widget assets do not constitute a native iOS WidgetKit extension or Android App Widget. A browser page cannot install a home-screen widget.
- App initialization replaces the URL fragment with `#home`; a native launch route needs explicit parsing before that step if it must open a particular screen.

The archive's planning documents were read as design context. This new concept follows the user's explicit decision that missing one day ends the streak.

## States and behavior

| State | Illustration | Message |
| --- | --- | --- |
| No streak / missed full day | Small shoot, 0 days | A fresh start is always here. |
| Today not completed, yesterday completed | Current bamboo and streak | A little room for kindness today. |
| Today completed | One daily growth step | A little good, done today. |
| 30+ days | Full-height single stem, actual day count | Same gentle completion message |

The slider previews days 0–30. “Next day” advances the demonstration clock: the first click makes today's giving pending; a second click without completing that day demonstrates the reset. Presets and slider are illustration controls, not actual giving records. They never modify the existing app's localStorage.

Tapping the entire widget opens the quote transition and then the existing app homepage. The five-second delay exists only to make this design specimen reviewable; “Continue” skips it, and “Back to widget” or Escape cancels it. Opening the source pauses automatic navigation. In production, show the quote inside the app while real initialization is pending and dismiss it as soon as the app is ready; do not impose a five-second wait. Keep native OS launch screens static and put the quote on the first app-controlled screen.

## Streak calculation for integration

Keep the existing **giving streak** meaning: count only successful, server-confirmed donations, regardless of amount. Opening the widget, posting, liking, pending payments, failed payments, and preview controls do not count. Multiple successful donations on one date count once.

Store unique completed date keys and a defined account timezone on the server. For today's date in that timezone, use today as the streak anchor if completed; otherwise use yesterday if completed; otherwise return zero. Count backward from the anchor through consecutive completed dates. A pending day does not erase yesterday's streak until the next midnight. After a missed full calendar date, the next successful donation starts at one.

Use calendar-date arithmetic in that timezone, not elapsed 24-hour intervals: daylight-saving transitions can produce 23- or 25-hour days. The backend must define timezone-change and offline-payment policies before launch. Preserve donation history when the current streak resets.

For iOS, add a WidgetKit target with an App Group snapshot, a midnight refresh entry, and a verified app/universal link. For Android, add an App Widget provider using the same server snapshot and an app-opening intent. Refresh the snapshot after confirmed giving and when the app becomes active. OS scheduling can delay widget refresh, so revalidate the streak on launch. The prototype links to `index.html`; it does not register a native deep-link scheme or implement these native targets.

## Quote

> 有心就有福，有願就有力。

Attributed to Master Cheng Yen / 證嚴法師, 靜思語. Source: [靜思人文 — 有心有福、有願有力](https://www.jingsi.org/master-cheng-yen/the-tzu-chi-path-and-jing-si-dharma-lineage?catid=56&id=978%3Astories025&view=article).

One sourced quote is used; a rotating library is not implemented. All translations are editorial drafts for this prototype, not official Tzu Chi quotations; fluent community reviewers should approve them before release.

## Language preference

Choose **Widget & quote language** under You → Settings, or use the language selector in the widget specimen. Both use `widget-locale.js` and the same localStorage key, `bamboo-language-v1`. The preference persists across visits and updates other open tabs through storage events. Storage failures leave the selection usable for the current visit and show that it was not saved.

Choices: English, Español (México), 繁體中文（國語）, 简体中文（普通话）, Filipino / Tagalog, Tiếng Việt, 한국어, العربية, فارسی, and Soomaali. This starting set follows [San Diego County's language-access planning](https://www.sandiegocounty.gov/content/dam/sdc/hhsa/programs/bhs/TRL/TRL%20Section%204/Cultural%20Competence%20Plan%20FY%202025-26.pdf), with separate Chinese writing systems and Mexican Spanish. Persian here is a Farsi draft; it does not claim a separate Dari translation.

Device language is the default. Explicit choice takes priority; otherwise the first supported device language is used, then English. Chinese script or Taiwan/Hong Kong/Macau region selects Traditional; other Chinese locales select Simplified. Spanish regional preferences use Mexican Spanish. Both quote and widget apply language tags; Arabic and Persian use right-to-left presentation. Dates and widget numerals use locale formatting. The design-study instructions and remaining main app UI are still English; this is not a claim of full app localization.

In the launch screen the chosen language is primary and the Chinese original appears underneath for reference. In Chinese, the original is not repeated. Quote attribution is localized and the original source link is retained. Native integration must copy the chosen locale into the shared widget snapshot as well as the streak; native widget preferences must not depend on browser localStorage.
