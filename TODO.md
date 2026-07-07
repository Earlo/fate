# Codebase TODO

## 1. Campaign sharing and public campaign reads

Campaigns are intended to be public/easy to share by link. The current read behavior should be treated as a product requirement, not a private-data bug. Still worth making this explicit in code and tests so future auth cleanup does not accidentally make campaign pages hard to share.

- Urgency: Medium
- Workload: Small
- Estimate: 0.5-1 day
- Notes:
  - Add tests documenting that campaign view links are publicly readable.
  - Clarify which actions require membership or ownership: edit, chat, event log, presence name updates, joining/leaving.
  - Consider renaming `requireCampaignRead` or documenting that "read" means "campaign exists and is viewable by link".

## 2. Sheet update fanout scans every campaign

Updating or deleting a sheet currently finds affected campaigns by loading all campaign `groups` JSON and recursively checking for that sheet id. One sheet is unlikely to be used in many campaigns, but this becomes expensive once the total campaign count is large.

- Urgency: Medium
- Workload: Medium
- Estimate: 1-3 days
- Notes:
  - Short-term option: keep JSON groups, but maintain a derived `campaign_sheet_refs` lookup table.
  - Longer-term option: normalize campaign group membership into relational tables.
  - Add a benchmark or integration test around `getCampaignIdsBySheetId` before changing it.

## 3. Campaign/group/character data model is over-denormalized

Campaign groups, character placement, visibility, layout, and membership are stored in nested JSON. This makes small edits rewrite a whole campaign and makes querying relationships harder.

- Urgency: Medium
- Workload: Large
- Estimate: 1-2 weeks
- Notes:
  - Needs planning before implementation.
  - Decide whether to normalize only campaign-to-sheet membership or also groups/layout/positions.
  - Plan migrations and compatibility for existing campaign JSON.
  - This should probably be split into an RFC/design note before code changes.

## 4. Database indexes for common access patterns

Owner lookups and visibility checks are frequent, but the Prisma schema does not define explicit indexes for campaign/sheet owners or visibility arrays.

- Urgency: Medium
- Workload: Medium
- Estimate: 1-2 days
- Notes:
  - Needs planning and verification against real Postgres query plans.
  - Likely candidates: btree indexes for `owner`, GIN indexes for `visible_to`, maybe partial indexes for public campaigns/sheets.
  - Confirm Prisma migration syntax for array indexes or use raw SQL migrations where needed.

## 5. Realtime implementation cleanup

Realtime/presence code is duplicated and overly stateful. Server-side campaign streams and client-side Ably handling both contain join/leave/name-change logic, and presence snapshots are fetched in several places.

- Urgency: High
- Workload: Medium to Large
- Estimate: 3-7 days
- Notes:
  - Unify realtime behavior behind a small adapter boundary for Ably vs local SSE.
  - Make one place responsible for join/leave/name-change event generation.
  - Add tests around presence label changes and duplicate tabs.
  - Audit whether guests, authenticated users, and campaign members should use the same path.

## 6. Realtime payloads trigger full refetches

Most update events only send an id and timestamp, then clients refetch the full sheet or campaign. This is simple but wasteful and contributes to slow behavior as campaign payloads grow.

- Urgency: Medium
- Workload: Medium
- Estimate: 2-5 days
- Notes:
  - Could be addressed together with realtime cleanup.
  - Consider richer patch-style events for focused updates.
  - Alternatively introduce a client cache/query layer and invalidate intentionally.
  - Keep full refetch as a fallback for conflict recovery.

## 7. Client state mutation needs clarification

Some client updates shallow-copy the campaign or sheet and then mutate nested arrays/objects. This may be okay in many current flows, but it can cause subtle bugs with optimistic updates, memoization, undo, or concurrent realtime refreshes.

- Urgency: Low to Medium
- Workload: Medium
- Estimate: 2-4 days
- Notes:
  - Needs clarification on expected editing behavior and conflict handling.
  - A reducer or small immutable update helper could make updates easier to reason about.
  - Do not refactor blindly; start with the campaign/group editing paths where nested mutation is most common.

## 8. Global `UserProvider` scope

`UserProvider` currently wraps the full app and subscribes/fetches user sheet data for authenticated pages. This may be acceptable, especially if most authenticated pages need sheet context.

- Urgency: Low
- Workload: Small to Medium
- Estimate: 0.5-2 days
- Notes:
  - Not clearly an issue yet.
  - Revisit only if profiling shows extra sheet-list requests or realtime subscriptions on pages that do not need them.
  - If needed, move the provider closer to dashboard/campaign editing surfaces.

## 9. Fix stale AI sheet-writing endpoint

The sheet AI completion path appears inconsistent with the client request format. The client sends a JSON string through `complete()`, while the `/api/writeSheet` route treats `body.prompt` like an object. AI features have not been touched in a while, so verify the whole flow before polishing.

- Urgency: Medium
- Workload: Small
- Estimate: 0.5-1 day
- Notes:
  - Align `/api/writeSheet` parsing with `/api/writeNote`.
  - Add a focused test for request parsing and prompt construction.
  - Keep this separate from broader AI cleanup so the broken path can be fixed quickly.

## 10. Harden image uploads and URL ingestion

Image uploads and URL-based imports currently buffer entire files/responses in memory and accept arbitrary URLs. This is probably fine for trusted small files, but it is a risky slow path if exposed to large files or unexpected URLs.

- Urgency: Medium
- Workload: Medium
- Estimate: 1-3 days
- Notes:
  - Add file size limits and accepted MIME/type checks.
  - Add fetch timeout and response size limits for URL imports.
  - Consider blocking private-network/localhost URLs for upload-from-url.
  - Prefer streaming to storage where practical, especially for Garage/S3.

## 11. Unify old AI/image generation code

AI-related routes use different client libraries, different model choices, duplicated sanitization, and leftover debug logging. Since this code is stale, it should be cleaned as one pass after confirming which AI features are still wanted.

- Urgency: Low to Medium
- Workload: Medium
- Estimate: 2-4 days
- Notes:
  - Standardize on one OpenAI/AI SDK wrapper.
  - Reuse `sanitizeForPrompt` everywhere.
  - Remove prompt/context `console.log` calls.
  - Centralize model names and feature flags.
  - Review whether image generation should still do text prompt generation plus image generation as two separate calls.

## 12. Simplify username/auth flow

The current auth form checks username existence on every username change, then decides whether submit means login or register. This adds needless requests, race conditions, and confusing behavior.

- Urgency: Low to Medium
- Workload: Small to Medium
- Estimate: 1-2 days
- Notes:
  - Remove the eager username existence check or debounce it if it stays.
  - Prefer explicit Login/Register modes or let submit return a clear "user exists" error.
  - Check username existence before password hashing in the registration route.
  - Add UI error state instead of throwing from submit.

## 13. Optimize skill option rendering

Skill dropdown rendering mutates the incoming `skillOptions` array by sorting it in place and repeatedly checks selected skills with array scans. This is a small performance issue and a larger readability/side-effect issue.

- Urgency: Low
- Workload: Small
- Estimate: 0.5-1 day
- Notes:
  - Copy before sorting: `[...skillOptions].sort(...)`.
  - Use a `Set` for selected skills.
  - Memoize computed dropdown options.
  - Consider memoizing dashboard `allSkills` and replacing the O(n²) uniqueness filter with a `Set`.

## 14. Fix landing-page dice animation loop

The landing-page dice background starts a `requestAnimationFrame` loop without cleanup and does repeated DOM style writes every frame. It is visually small, but it can waste work after unmounts or tab/page transitions.

- Urgency: Low
- Workload: Small
- Estimate: 0.5-1 day
- Notes:
  - Store the animation frame id and cancel it on unmount.
  - Avoid calling `updatePosition` twice per frame.
  - Prefer transform-only updates over `left`/`top` updates.
  - Consider replacing most of the JS animation with CSS if the behavior can stay simple.

## 15. Replace deep JSON dirty checks in group settings

Group settings currently uses `JSON.stringify(draftGroup) !== JSON.stringify(group)` to detect changes. This is easy but can become expensive for populated groups and can be brittle if object shape/order changes.

- Urgency: Low
- Workload: Small
- Estimate: 0.5-1 day
- Notes:
  - A simple dirty flag may be cheaper and clearer.
  - Field-specific comparison is another option if save enablement must stay precise.
  - Revisit only if this modal becomes sluggish with large groups.
