# FRESHVII System Blueprint

## Architecture

FRESHVII is a React + TypeScript + Vite client backed by Firebase Authentication and Cloud Firestore. The UI reads application state through repositories and domain services instead of calling Firebase directly from components.

```text
Pages and route layouts
        |
Shared UI components and view models
        |
Domain services: freshness, rescue score, recipes, lifecycle actions
        |
Repositories: food, events, recipes, user profile
        |
Firebase Auth + Firestore (+ Storage for optional food photos)
```

## Suggested Source Structure

```text
src/
  components/
    food/
    fridge/
    recipes/
    shared/
  domain/
    freshness/
    recipes/
    foodLifecycle/
  pages/
  repositories/
  firebase/
    config.ts
    services/
  types/
  lib/
```

## Data Model

All dates should be stored as Firestore `Timestamp` values. The client may expose ISO strings or `Date` objects through a repository adapter, but pages should not depend on Firestore-specific types.

### `users/{userId}`

```ts
type UserProfile = {
  id: string
  displayName?: string
  timezone: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `users/{userId}/foodItems/{foodId}`

```ts
type FoodItem = {
  id: string
  name: string
  category?: string
  quantity: number
  unit: string
  storageLocation: 'fridge' | 'freezer' | 'pantry'
  shelfKey?: string
  opened: boolean
  dateAdded: Timestamp
  openedDate?: Timestamp
  frozenDate?: Timestamp
  estimatedExpiry: Timestamp
  freshnessScore: number
  freshnessState: 'fresh' | 'use-soon' | 'rescue-today' | 'expired'
  status: 'active' | 'consumed' | 'discarded'
  photoUrl?: string
  barcode?: string
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  archivedAt?: Timestamp
}
```

The model intentionally keeps `unit` as a string so the product can support pieces, grams, kilograms, milliliters, liters, packs, servings, and user-defined units without a migration. `quantity` must be non-negative and should support decimals.

### `users/{userId}/foodEvents/{eventId}`

```ts
type FoodEvent = {
  id: string
  foodItemId: string
  type: 'added' | 'opened' | 'frozen' | 'unfrozen' | 'consumed' | 'discarded' | 'edited'
  quantityBefore?: number
  quantityChange?: number
  quantityAfter?: number
  metadata?: Record<string, string | number | boolean>
  createdAt: Timestamp
}
```

Events provide an audit trail and support future insights without making the active food item difficult to query.

### Recipe Shape

Recipes can start as static seed data and later move to Firestore or a trusted external source.

```ts
type Recipe = {
  id: string
  title: string
  description?: string
  ingredients: Array<{ name: string; quantity?: number; unit?: string; optional?: boolean }>
  preparationMinutes: number
  instructions: string[]
  imageUrl?: string
}
```

## Domain Rules

1. `estimatedExpiry` is the primary deadline for the current item state.
2. Opening an item records `openedDate` and may recalculate expiry using category rules.
3. Freezing records `frozenDate`, changes storage location to `freezer`, and must use an explicit freezer shelf-life policy.
4. Partial consumption changes quantity and records an event; it does not silently delete history.
5. Quantity reaching zero changes status to `consumed` and sets `archivedAt`.
6. Discarding changes status to `discarded` and remains visible in event history.
7. Freshness calculations must use the user's timezone for date presentation and a consistent server/client instant for comparison.

## Firebase Responsibilities

- Authentication: user identity and session state.
- Firestore: active inventory, event history, user preferences, and optionally curated recipes.
- Cloud Storage: optional food photos, protected by user ownership rules.
- Cloud Functions: optional later layer for scheduled notifications, recipe indexing, or server-owned recalculation.

## Security and Consistency

- Every user-owned document must be nested below the authenticated user's UID or carry an equivalent ownership check.
- Firestore rules must reject reads and writes when `request.auth.uid` does not match the owner.
- Client actions that update quantity and status should use transactions or batched writes.
- Firestore is the source of truth; local optimistic state must reconcile with the next snapshot.
- Never put Firebase service-account credentials in the client or repository.