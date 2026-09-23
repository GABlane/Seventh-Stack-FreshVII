# FRESHVII Workplan

## Product Goal

Build a real-time food expiry tracker that helps people see what is in their fridge, understand what needs attention, rescue food before it expires, and record consumption without losing inventory accuracy.

## Phase 0: Project Foundation

- [ ] Confirm Firebase project, web app credentials, Authentication providers, and Firestore database.
- [ ] Add environment variables from `.env.example` and verify local Firebase initialization.
- [ ] Confirm Tailwind CSS v4 and shadcn/ui configuration in `components.json`.
- [ ] Add the shared `cn` utility and required shadcn primitives.
- [ ] Configure routing for Home, Add Food, Food Detail, Rescue My Food, Recipes, and Consumption.
- [ ] Add a mock repository so UI work can proceed without a live Firebase project.
- [ ] Establish lint, typecheck, build, and test commands in the contribution workflow.

## Phase 1: Data and Domain Logic

- [ ] Define TypeScript models for users, food items, storage locations, freshness, recipes, and food events.
- [ ] Implement freshness calculation from estimated expiry, opened date, frozen date, and current time.
- [ ] Implement the states `fresh`, `use-soon`, `rescue-today`, and `expired`.
- [ ] Implement a 0-100 rescue score with explainable factors: urgency, quantity, and usefulness in recipes.
- [ ] Define food lifecycle events for added, opened, frozen, partially consumed, fully consumed, and discarded.
- [ ] Add unit tests for date boundaries, timezone handling, frozen items, opened items, and partial quantities.

## Phase 2: Firebase and Real-Time Repository

- [ ] Create Firestore collections and security rules for user-owned inventory and events.
- [ ] Implement authenticated user session handling.
- [ ] Implement real-time food item subscription with `onSnapshot`.
- [ ] Implement create, update, archive, consume, discard, freeze, and unfreeze repository methods.
- [ ] Use batched writes or transactions when an action updates both an item and its event history.
- [ ] Add loading, empty, offline, permission, and error states.
- [ ] Add indexes only when query requirements are confirmed by the running app.

## Phase 3: Shared UI Components

- [ ] Build `Fridge` for visual storage sections and item placement.
- [ ] Build `FridgeShelf` for shelf-level grouping and responsive layout.
- [ ] Build `FoodItem` as the compact visual representation of an inventory item.
- [ ] Build `FreshnessBadge` with color, icon, label, and accessible text.
- [ ] Build `StorageTabs` for fridge, freezer, and pantry views.
- [ ] Build `FoodCard` with quantity, unit, opened state, expiry, and quick actions.
- [ ] Build `QuantitySelector` with decimal-safe increment, decrement, and validation behavior.
- [ ] Build `RecipeCard` with match score, prep time, and required ingredients.
- [ ] Build `QuickActionMenu` and swipe actions for consume, freeze, and discard.
- [ ] Add keyboard, screen-reader, touch, and reduced-motion support to interactive components.

## Phase 4: Screens and User Flows

### Home / Visual Fridge

- [ ] Show freshness summary, items at risk, and value or quantity at risk.
- [ ] Render `StorageTabs`, `Fridge`, `FridgeShelf`, and `FoodCard` from the live repository.
- [ ] Support filtering by freshness and searching by food name.
- [ ] Make changes appear immediately after a Firebase update.

### Add Food

- [ ] Build manual entry for name, quantity, unit, storage location, and opened state.
- [ ] Capture date added, opened date, frozen date, and estimated expiry when applicable.
- [ ] Add optional barcode, photo, and category fields without making them required for the MVP.
- [ ] Validate and preview the item before saving.

### Food Detail

- [ ] Show the complete item timeline and current freshness explanation.
- [ ] Allow editing quantity, location, opened state, expiry, and notes.
- [ ] Provide consume, freeze, unfreeze, and discard actions with confirmation where destructive.

### Rescue My Food

- [ ] Rank urgent items by rescue score.
- [ ] Explain why each item is urgent and show the remaining quantity.
- [ ] Link selected ingredients to recipe recommendations.

### Recipe Recommendation

- [ ] Match available ingredients to recipe requirements.
- [ ] Prioritize recipes that use rescue items first.
- [ ] Show missing ingredients separately from ingredients already available.
- [ ] Support a clear `Cook This` action that opens the consumption flow.

### Consumption / Partial Use

- [ ] Ask how much of each selected item was used.
- [ ] Decrease quantity for partial use and archive the item at zero quantity.
- [ ] Record a consumption event and optional leftover details.
- [ ] Allow leftovers to receive a new opened date and estimated expiry.
- [ ] Update Home, Rescue, Recipes, and history views from the same source of truth.

## Phase 5: Quality and Release

- [ ] Test the primary flows on mobile and desktop breakpoints.
- [ ] Verify Firestore rules for authenticated ownership and unauthorized access.
- [ ] Verify real-time updates in two browser sessions.
- [ ] Test offline recovery and duplicate action prevention.
- [ ] Run `npm run lint` and `npm run build` before every release candidate.
- [ ] Document Firebase setup, seed data, known limitations, and deployment steps.

## MVP Completion Criteria

The MVP is complete when an authenticated user can add food, see it in the visual fridge, receive freshness status, open its detail view, partially consume or discard it, find urgent items in Rescue My Food, and receive recipe recommendations using live Firestore data.# FRESHVII Project Implementation Tasks

## Phase 1: Project Initialization & Infrastructure
- [ ] Initialize a new project using React, TypeScript, and Vite[cite: 1].
- [ ] Configure Tailwind CSS for styling[cite: 1].
- [ ] Install and set up shadcn/ui components[cite: 1].
- [ ] Configure the application as a Progressive Web App (PWA) with mobile camera support[cite: 1].
- [ ] Set up TanStack Query for state management[cite: 1].
- [ ] Define the backend Data Transfer Objects (DTOs) and food-state structure[cite: 1].
- [ ] Implement mock data for the frontend to run independently[cite: 1].

## Phase 2: Design System & UI Components
- [ ] Configure the Tailwind color palette: Primary (#426A5A), Highlight (#F2C57C), Borders (#DDAE7E), Success (#7FB685), and Waste accent (#EF6F6C)[cite: 4].
- [ ] Build the food items using the shadcn/ui Card component[cite: 4].
- [ ] Build freshness state markers using the shadcn/ui Badge component[cite: 4].
- [ ] Build bottom menus and details using the shadcn/ui Sheet component[cite: 4].
- [ ] Build confirmation dialogs using the shadcn/ui AlertDialog component[cite: 4].
- [ ] Build toast notifications using the shadcn/ui Sonner component[cite: 4].
- [ ] Build storage location switchers using the shadcn/ui Tabs component[cite: 4].
- [ ] Build the opened/unopened toggle using the shadcn/ui Switch component[cite: 4].
- [ ] Build shelf-life meters using the shadcn/ui Progress component[cite: 4].
- [ ] Implement freshness visual guidelines combining color, icon, and text[cite: 1, 4].

## Phase 3: Core Logic & Data Modeling
- [ ] Define the four freshness states: Fresh, Use Soon, Rescue Today, and Expired[cite: 1].
- [ ] Write the freshness estimation logic calculating time based on category, storage date, shelf life, location, and opened/frozen status[cite: 1].
- [ ] Write the Rescue Score algorithm to rank food urgency on a 0-100 scale[cite: 1].

## Phase 4: Screen 1 – Home / Visual Fridge
- [ ] Create the main dashboard showing total items and financial value at risk[cite: 2].
- [ ] Build the visual fridge with Fridge, Freezer, and Pantry tabs[cite: 1].
- [ ] Create food cards displaying item name, quantity, unit, location, opened status, and freshness badge[cite: 4].
- [ ] Build the bottom navigation bar with Home, Rescue, Add Food, Recipes, and Insights icons[cite: 2].
- [ ] Implement left-swipe gesture on food cards for Consumed, Froze It, and Discarded quick actions[cite: 4].

## Phase 5: Screen 2 – Add Food
- [ ] Integrate Camera APIs for barcode and photo scanning[cite: 1].
- [ ] Build the manual data entry form capturing name, quantity, unit, storage, and opened status[cite: 1].
- [ ] Build the user confirmation screen for verifying details before saving to inventory[cite: 1, 3].

## Phase 6: Screen 3 – Food Details & Lifecycle Adaptability
- [ ] Build the detailed food view showing quantity, current freshness, time left, storage, and opened status[cite: 1].
- [ ] Write state transition logic to start a shorter shelf-life clock when a sealed item is marked "Opened"[cite: 1, 3].
- [ ] Write state transition logic to pause or extend the expiration timeline when an item is moved to the freezer[cite: 1, 5].

## Phase 7: Screens 4 & 5 – Rescue My Food & Recipes
- [ ] Build the "Rescue My Food" screen to aggregate high-risk ingredients based on Rescue Scores[cite: 1].
- [ ] Build the meal recommendation engine to suggest recipes using urgent ingredients[cite: 1].
- [ ] Build the Recipe view showing required ingredients, preparation time, and a "Cook This" button[cite: 1].

## Phase 8: Screen 6 – Consumption & Leftovers
- [ ] Build the consumption confirmation flow asking "How much did you use?"[cite: 1].
- [ ] Write partial usage logic to create a new "Leftover" inventory item with a new fresh timer[cite: 1].
- [ ] Connect all actions (consuming, cooking, discarding) to update Home, Rescue, Recipes, and Insights tabs instantly[cite: 3].