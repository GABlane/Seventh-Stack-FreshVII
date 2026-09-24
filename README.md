# FRESHVII (Freshly)

**Track what is in your kitchen, see what needs eating first, and cook it before it goes to waste.**

Live app: <https://seventh-stack-freshly.vercel.app>

## Table of contents

1. [Project overview](#project-overview)
2. [Problem statement](#problem-statement)
3. [Solution](#solution)
4. [Key features](#key-features)
5. [Architecture and tech stack](#architecture-and-tech-stack)
6. [Setup instructions](#setup-instructions)
7. [How the system works](#how-the-system-works)
8. [Sustainability KPIs](#sustainability-kpis)
9. [Gemini integration](#gemini-integration)
10. [Screenshots and demo flow](#screenshots-and-demo-flow)
11. [Known limitations](#known-limitations)
12. [Future improvements](#future-improvements)
13. [Deployments](#deployments) and [Firebase rules](#firebase-rules)

## Project overview

FRESHVII is a mobile-first web app (installable as a PWA) built for the Seventh Stack
AppCon project. Users sign in, record the food they buy, and see it laid out on virtual
fridge, freezer, and pantry shelves. The app estimates how fresh each item is, ranks what
should be used first, suggests recipes from what is already at home, and tracks what gets
eaten and what gets thrown away.

## Problem statement

Households routinely buy food they do not finish. Items get pushed to the back of the
fridge, opened food is forgotten, and nobody remembers what is in the pantry, so good food
is thrown away and money is wasted. The problem is one of visibility and timing: people
do not know what they have, what is about to expire, or what they could cook with it.

## Solution

FRESHVII keeps a live inventory of the kitchen and turns it into action:

- **See it:** food is shown on shelves in the fridge, freezer, and pantry.
- **Time it:** every item gets an estimated expiry and a freshness state, so the most urgent food rises to the top.
- **Use it:** a Rescue view and recipe suggestions are built from what is in the kitchen, urgent items first.
- **Measure it:** consumption and discards are logged, so the Insights page shows what is actually used and what is wasted.

## Key features

| Area | What works today |
| --- | --- |
| Accounts | Email and password sign-up and sign-in (Firebase Auth). Sign-up requires a password of 6+ characters with at least 1 number and 1 capital letter, with a live checklist. |
| Kitchen view | Home shows Fridge, Freezer, and Pantry tabs with illustrated shelves. Items sit on named shelves (top, middle, crisper, door, drawers, eye-level, lower) and link to their detail page. Food search is on the home screen. |
| Add food | Manual entry (name, category, quantity, unit, price paid, date added, opened, storage, shelf) or a **photo scan** using Gemini. One item pre-fills the form. A photo with several items opens a review list where each item can be edited, unticked, and then all added at once. |
| Freshness | Each item gets an estimated expiry, a freshness percentage, and one of four states: `fresh`, `use-soon`, `rescue-today`, `expired`. |
| Food actions | On the detail page: mark as opened, move to the freezer, move to another shelf, consume a quantity, or discard. Every change is logged as an activity event. |
| Rescue | Lists food to use today, food expiring within about 2 days, and food past its estimated expiry, with a suggested action for each and dinner ideas. |
| Recipes | Recipes are ranked by how much they use up urgent food. Each recipe shows which ingredients are matched from the kitchen and which are missing. |
| Cooking flow | "Cook this" walks through the recipe's matched ingredients one at a time (all / some / none used), reduces stock, and can record a leftover item. |
| Insights | Food wasted and saved (kg), money wasted, items discarded, a most-wasted-categories chart, a weekly recap with a pre-grocery checklist, and most consumed, most purchased, and often forgotten foods. |
| Notifications | In-app alerts for new food, consumption, freezer moves, and near-expiry items, plus optional browser reminders. |
| PWA | Installable, with an app manifest and an auto-updating service worker. |

## Architecture and tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS 4, Radix UI, lucide-react icons |
| PWA | `vite-plugin-pwa` (auto-update service worker and manifest) |
| Auth and data | Firebase Authentication and Cloud Firestore (real-time listeners) |
| AI | Google Gemini through `@google/genai`, called only from a server-side function |
| Serverless API | One Vercel Function, `api/detect-food.ts` |
| Hosting and CI/CD | Vercel, deployed by a GitHub Actions workflow (`.github/workflows/vercel.yml`) |

```text
Pages and route layouts            src/pages, src/components
        |
Context providers (state)          src/context  (FoodContext, RecipeContext)
        |
Domain logic (pure functions)      src/domain   (freshness, rescue matching, lifecycle, impact)
        |
Firebase services                  src/firebase/services  (auth, food, recipe)
        |
Firebase Auth + Cloud Firestore

Browser  --POST /api/detect-food-->  Vercel Function  -->  Gemini API
```

**Firestore layout**

```text
profiles/{uid}/items/{itemId}        a user's food items (status: active | consumed | discarded)
profiles/{uid}/activity/{eventId}    append-only log: added, opened, frozen, moved, consumed, discarded, leftover-created
users/{uid}                          account profile
recipes/{recipeId}                   shared recipe catalogue (ingredients matched by subcategory or name)
```

Security rules (`firestore.rules`) let each signed-in user read and write only their own
data. Activity events cannot be edited or deleted. More detail is in `docs/` and `erd.md`.

## Setup instructions

**Requirements:** Node.js 22+ and a Firebase project with Authentication (Email/Password)
and Cloud Firestore enabled.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   | Variable | Purpose |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Firebase web-app config (public, bundled into the client) |
   | `GEMINI_API_KEY` | Gemini key for photo scanning. Server-side only: never prefix it with `VITE_`. |

3. Start the development server:

   ```bash
   npm run dev
   ```

   `npm run dev` runs only Vite, so **`/api/detect-food` is not served locally** and photo
   scanning will not work. To test scanning locally, run the app with the Vercel CLI
   (`vercel dev`), or test on a deployment.

4. (Optional) Seed reference and demo data. Copy `.env.seed.example` to `.env.seed` and add the
   email and password for the demo account (the scripts sign in as that user, creating the
   account first if it does not exist, and reuse the `VITE_FIREBASE_*` values from `.env`), then run:

   ```bash
   npm run seed:all      # reference data (categories, subcategories, recipes) + demo items
   npm run seed:reset    # wipe and re-seed the demo items
   ```

5. Deploy Firestore rules once (see [Firebase rules](#firebase-rules)).

**Checks**

```bash
npm run build
npm run lint
```

## How the system works

1. **Sign in.** Firebase Auth identifies the user. `FoodContext` subscribes to that user's
   `items` and `activity` collections, so the UI updates live.
2. **Add food.** The user enters details or scans a photo (see [Gemini integration](#gemini-integration)).
   The item is saved to `profiles/{uid}/items` and an `added` event is logged.
3. **Estimate freshness.** Expiry is estimated from the food category, where it is stored, and
   whether it is opened, using these shelf-life rules (in days):

   | Category | Closed | Opened | Frozen |
   | --- | --- | --- | --- |
   | Produce | 7 | 3 | 90 |
   | Dairy & eggs | 14 | 5 | 60 |
   | Meat | 3 | 2 | 90 |
   | Grains | 180 | 60 | 365 |
   | Pantry | 180 | 60 | 365 |

   Days remaining decide the state: 0 or less is `expired`, 1 is `rescue-today`, 2 to 3 is
   `use-soon`, and anything longer is `fresh`. All expiry dates are estimates and are labelled as such.
4. **Rescue score.** Each item also gets a 0-100 score from urgency (weighted most), quantity,
   whether it is opened, and whether it is frozen (frozen food scores lower). This orders the Rescue list.
5. **Match recipes.** For each recipe ingredient the app looks for a kitchen item by subcategory
   first, then by name. Recipes are ranked by match and by how urgent the matched food is.
   Only items matched to a recipe appear in that recipe's cooking flow.
6. **Cook and log.** Consuming or discarding updates the item (partial use reduces quantity;
   fully used items become `consumed`) and writes an activity event. Insights and notifications
   are computed from those events.

## Sustainability KPIs

What the Insights page measures today:

| KPI | How it is computed |
| --- | --- |
| Food wasted (kg) | Estimated weight of discarded food. |
| Money wasted | Price paid multiplied by the share of the item discarded, summed over discard events. Shown in PHP. |
| Items discarded | Count of `discarded` events. |
| Food saved (kg) | Estimated weight of food that was consumed instead of thrown away. |
| Most wasted categories | Horizontal bar chart of discarded weight per food category. |
| Weekly recap (last 7 days) | Items saved (distinct items consumed), items that expired (not eaten, estimated expiry in the window), food wasted (kg), and estimated value wasted. Followed by "Before your next grocery run, check these items", which lists the most urgent items in the kitchen. |
| Most consumed | Total quantity used per food, from `consumed` events. |
| Most purchased | Foods added most often. Leftover portions are not counted as purchases. |
| Often forgotten | Items in the kitchen with the least logged use. |
| Items needing action | Number of items in `rescue-today`, `use-soon`, or `expired` state (header, Home, Rescue). |

**Weights are estimates.** Items are logged in mixed units. `g`, `kg`, `ml`, and `l` convert
directly (1 ml is treated as 1 g). Counted units use a typical weight: a piece is 150 g for
produce, 100 g for dairy and grains, 250 g for meat, and 150 g for pantry food; a bag is 500 g,
a pack 400 g, a serving 250 g, and a tub 500 g. The calculations live in `src/domain/insights.ts`.

`src/domain/impact.ts` also defines *ingredients rescued* and *meals cooked*, which are
calculated but not shown in the UI.

Money wasted only counts items where a price was entered. Nothing is estimated about
CO2 or other environmental impact.

## Gemini integration

Photo scanning is the app's AI feature. On **Add food**, the user picks or takes a photo of an item.

1. **In the browser:** the photo is always resized to at most 1024 px on its longest edge and
   re-encoded as JPEG (quality 0.8). This keeps the upload small and fast while leaving enough
   detail to tell several items apart. If a photo cannot be decoded (for example some HEIC
   files) and is under 3 MB, it is sent as-is.
2. **`POST /api/detect-food`:** a Vercel Function validates the image (must be an image, under
   about 4.2 MB of base64) and calls Gemini through the Interactions API in `@google/genai`.
3. **Model and settings:** `gemini-3.5-flash-lite` with `thinking_level: 'minimal'`, and a
   JSON schema (`response_format`) so the reply is always valid, typed JSON.
4. **Result:** a list of up to 12 items. Identical items are grouped (three apples become one
   entry with quantity 3). Each item has `foodName`, `category` (Produce, Dairy & eggs, Meat,
   Grains, Pantry), `subcategory`, `condition`, `suggestedStorage` (fridge, freezer, pantry),
   `quantity`, `unit` (piece, bag, pack, g, ml), and `confidence`. The server drops items with
   confidence below 0.3 and duplicate names, and forces every field into the allowed values.
5. **In the app:** one item pre-fills the normal Add food form. Two or more items open a review
   list where each row is editable, can be unticked, and flags low-confidence guesses. One tap
   adds every ticked item. If some fail to save, only those stay on screen to retry. If no food
   is found, the user is told and can add the item manually.
6. **Safety:** the API key stays in a server-side environment variable and is never sent to the
   browser. The model is told not to estimate an exact expiry date.

**Performance notes** (measured during development, one small test image): a live scan takes
about 3.5 s with `gemini-3.5-flash-lite`. `gemini-3.8-flash` took 11 to 38 s and rejects the
`minimal` thinking level. If accuracy on real photos is not good enough, change `model` in
`api/detect-food.ts` and pick a `thinking_level` that model supports.

## Screenshots and demo flow

No screenshots are committed yet. Add them under `docs/screenshots/` and link them here.

**Suggested demo flow**

1. Open the live app and **create an account** (watch the password checklist turn green).
2. On **Home**, browse the Fridge, Freezer, and Pantry tabs and see the food on its shelves.
3. Tap **Add food**, scan a photo of an item, review the pre-filled details, and save. Try one
   item in the fridge and one in the pantry.
4. Open an item to **mark it opened**, **move it to the freezer**, or **consume** part of it.
   Watch its freshness state and expiry label change.
5. Go to **Rescue** to see what should be used today.
6. Open **Recipes**, pick a recipe, and tap cook. Step through the matched ingredients,
   record what was used, and add a leftover.
7. Check **Insights** for most consumed, rarely eaten, and waste cost, and **Notifications**
   for the activity feed.

## Known limitations

- **Expiry dates are estimates** from category-based rules, not from the printed label. Edge cases
  (a very ripe fruit, a long-life dairy product) can be off.
- **Scan accuracy is unmeasured.** Scanning has been tested for speed and for correct handling of a
  non-food image, but not against a set of real food photos, so multi-item detection (missed items,
  wrong counts, mixed-up categories) is unproven. Items are always shown for review before saving.
  Only five categories are used, and at most 12 items are returned per photo.
- **Gemini free tier:** the current key is limited to 5 requests per minute, so quick repeated
  scans can be rate limited or slow.
- **`/api` is not available under `npm run dev`** (see [Setup instructions](#setup-instructions)).
- **Password rules are enforced in the browser only.** Enforcing them in Firebase itself would need
  Identity Platform password policies.
- **Recipe catalogue is small** and seeded from CSV files. There is no way to add or edit recipes in the app.
- **Single user, single kitchen.** No household sharing.
- **Browser reminders** only fire while the app is open. There is no background push notification.
- **Ad blockers** can block Firestore's connection (`ERR_BLOCKED_BY_CLIENT`), which can leave the food
  list empty for those users.
- **Weights are estimates** (see [Sustainability KPIs](#sustainability-kpis)), and money is shown in PHP only.
- **No automated tests.** Verification is `npm run build` and `npm run lint`.
- **Development route:** `/dev/food-test` is still routed in the app and should be removed or gated for production.
- **Deploy configuration:** the GitHub Actions workflow needs the `VERCEL_ORG_ID` and
  `VERCEL_PROJECT_ID` secrets to target the right Vercel project reliably (see [Deployments](#deployments)).

## Future improvements

- Barcode scanning (the data model already has room for barcodes) and reading printed expiry dates from photos.
- Score scan accuracy against a labelled set of food photos, and let a scan mark items as already opened.
- Show the impact metrics in the UI: ingredients rescued, meals cooked, food saved, plus weekly and monthly trends.
- Estimate environmental impact (for example CO2 avoided) from food weight.
- Household sharing, so several people manage one kitchen.
- Background push notifications for items about to expire.
- A shopping list generated from missing recipe ingredients.
- More recipes, dietary filters using the existing `diet_tags` field, and user-added recipes.
- Optional food photos using the prepared Storage rules.
- Automated tests for freshness, rescue matching, and lifecycle logic, plus end-to-end tests for the main flows.
- Server-enforced password policy, and a paid Gemini tier or caching for scan rate limits.

## Deployments

GitHub Actions deploys every pushed branch to a Vercel preview URL and deploys
`main` to production. The workflow builds on GitHub and uploads only Vercel's
prebuilt output.

One-time setup:

1. Install the Vercel CLI, log in, and run `vercel link` from the project root
   to create or select the Vercel project. (If it is already connected to
   GitHub, the committed configuration disables Vercel's duplicate automatic
   deployments; GitHub Actions is the deployment owner.)
2. In Vercel, add the six `VITE_FIREBASE_*` values from `.env.example` to both
   the Preview and Production environments.
   Add `GEMINI_API_KEY` to those same environments to enable food-photo detection.
   Do not prefix it with `VITE_`: it is used only by the `/api/detect-food` server
   function and must never be exposed to the browser.
3. In the GitHub repository, add these Actions secrets:
   - `VERCEL_TOKEN` — a Vercel access token
   - `VERCEL_ORG_ID` — the Vercel team or personal-account ID
   - `VERCEL_PROJECT_ID` — the imported Vercel project ID

   The organization and project IDs are shown in the `.vercel/project.json`
   file after running `vercel link` locally, or in the Vercel project settings.

The SPA rewrite in `vercel.json` ensures that opening an app route directly,
such as `/app/food/:foodId`, serves the React application rather than a 404.

## Firebase rules

`firestore.rules` and `storage.rules` restrict user-owned data and future food
photos to the signed-in owner. Deploy them after logging into the Firebase CLI:

```bash
npx firebase-tools deploy --only firestore:rules,storage
```

Food photos are optional. The data model already supports an `imageUrl`; store
future uploads at `users/{uid}/food-images/{foodId}/{fileName}` to match the
Storage rules. Keep any Gemini API key in a server-side Vercel environment
variable and call it only from a Vercel Function—not from this Vite client.
