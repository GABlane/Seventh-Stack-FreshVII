# FRESHVII

FRESHVII is a React and Firebase foundation for the Seventh Stack AppCon project.
Only project setup is included at this stage; food-management features are not yet
implemented.

## Requirements

- Node.js 22+
- A Firebase project with Authentication and Cloud Firestore enabled

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the Firebase web-app values.

3. Start the development server:

   ```bash
   npm run dev
   ```

## Checks

```bash
npm run build
npm run lint
```

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
