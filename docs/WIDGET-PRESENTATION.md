# Widget presentation

Open https://xibahbah.github.io/bamboo-mobile/presentation.html on the projector.

1. Start on Day 1: “Every amount counts. We make repeated care visible.”
2. Click **Play growth**. The actual widget cycles through 1, 7, 15 and 30 days, then stops. You can pause or pick any milestone.
3. Click the bamboo widget. It opens the app's bamboo morph, daily reflection and community feed.
4. In the app, choose **You → Streak widget** to show the saved demo streak. The separate presentation milestones never overwrite saved giving.

Fallback: open widget.html and select the day buttons manually. For a local presentation, run `npm ci` then `npm run dev` and open http://127.0.0.1:5187/presentation.html.

This is an interactive web prototype of a home-screen widget, not a WidgetKit extension installed on iOS. No actual payments occur. Native OS refresh and installation have not been tested.

## Verification — 2026-11-07

Four widget regressions cover distinct milestone artwork without saved-data changes; a pending versus missed preview day; live count restoration and cross-tab update beyond 30; and RTL/language switching without streak loss. Browser verified autoplay reaching day 30 and widget → opening → daily reflection → home.

The release snapshot (existing committed app plus this presentation and four new tests) passes 57 tests. The separate in-progress working tree passed 62/63, with one failure in the concurrently modified giving queue test; those uncommitted giving changes are not included in this release. Presentation controls reuse widget.html rather than a separate imitation of its rendering.
