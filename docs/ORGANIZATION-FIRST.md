# Organization-first version

This version replaces individual fundraising with organization-led programs.

- Preserved version: `archive/individual-giving-v1` at commit `389fdaa`.
- Working branch: `codex/organization-first`.
- Only organizations own public posts and accept demo donations.
- Eight fictional organizations are grouped into seven service categories.
- Shared Roots remains the language and cultural belonging organization.
- Public posts describe programs and aggregate outcomes, without beneficiary names, photos, personal profiles, or donor-to-beneficiary messaging.
- Donor profiles support friendship requests and conversations. They cannot receive donations.
- Reposts retain the original organization as author. Sending shares an organization post with another donor.
- Successful gifts remain on the current screen. The heart arc and bamboo arrival animation are unchanged.
- The organization adapter rejects individual and unknown destinations and records the canonical organization name.
- This version uses `bamboo-org-*` storage keys. Existing individual-version records remain intact and are not displayed here.
- Opening, daily reflection, home widget, daily growth, community wall consent, settings, receipts, and scene controls remain.

## Prototype boundary

All organizations, donor profiles, gifts, friendship requests, and messages are demo data stored in the browser. Organization publishing is seeded content, not an implemented admin authentication system. Real deployment needs verified organizations, authenticated publishing, server-side organization-only payment validation, accounting, consent controls, moderation, and private support intake. Public anonymity does not mean that an organization can deliver assistance without any private information.

## Test changes

Removed tests for intentionally removed personal publishing, recipient profiles, and the old pool checkout. Added organization ownership, category browsing, donor-only friendships, adapter rejection, canonical receipts, failed gifts, repeated taps, and legacy-data isolation tests. Existing launch, morph, widget, scene, finance, consent, and navigation tests remain.
