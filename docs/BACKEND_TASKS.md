# **FRESHVII - Backend Tasks**

_Seventh Stack | AppCon Hackathon_

## **Phase 1 - Food domain & data model**

### **Food Item**

- [X] [BE] Define Food DTO

- [X] [BE] Define supported measurement units

- [X] [BE] Define storage locations: Fridge, Freezer, Pantry

- [X] [BE] Track date_added

- [X] [BE] Track quantity + unit

- [X] [BE] Track frozen_at

- - [X] [BE] Freshness calculation must work without sensor data

- - [ ] [BE] Support optional environmental/sensor inputs

- - [X] [BE] Define confidence/estimate handling

### **MVP freshness estimation**

- [X] [BE] Create baseline shelf-life dataset

- [X] [BE] Calculate estimated expiry from food type + storage date

- [X] [BE] Adjust freshness when item is opened

- [X] [BE] Adjust freshness when item moves to freezer

- [X] [BE] Adjust freshness when storage location changes

- [X] [BE] Generate freshness percentage

FRESHVII | Seventh Stack | AppCon Hackathon

- [X] [BE] Generate freshness status

- [X] [BE] Generate estimated remaining days

- [X] [BE] Ensure system communicates estimates rather than guaranteed spoilage dates

### **Rescue Score**

- [X] [BE] Define Rescue Score calculation

- [X] [BE] Increase score as estimated expiry approaches

- [X] [BE] Consider opened state

- [X] [BE] Consider storage location

- [X] [BE] Consider remaining quantity

- [X] [BE] Sort inventory by urgency

## **Phase 2 - Firebase & Firestore setup**

### **Configuration**

- [X] [BE] Configure environment variables

- [X] [BE] Initialize Firebase app

- [X] [BE] Connect Firestore and Auth

- [ ] [BE] Create firebase.json at project root

- [ ] [BE] Create .firebaserc and bind to Firebase project ID

### **Security rules**

- [ ] [BE] Write firestore.rules

- - [ ] [BE] Enforce request.auth.uid ownership on profiles/{uid}/**

- - [ ] [BE] Enforce request.auth.uid ownership on users/{uid}

- - [ ] [BE] Deny all unauthenticated reads and writes

### **Indexes**

- [ ] [BE] Write firestore.indexes.json

- - [ ] [BE] Add composite index for profiles/{uid}/items filtered by status ordered by updatedAt

### **Data path alignment**

- [-] [BE] Reconcile Firestore path used by auth.service vs food.service

- - [ ] [BE] auth.service.ts currently writes to users/{uid}

- - [ ] [BE] food.service.ts reads/writes profiles/{uid}/items

- - [ ] [BE] BLUEPRINT.md defines users/{userId}/foodItems/{foodId}

- - [ ] [BE] Pick one path and apply consistently across both services, seed scripts, and rules

- - [ ] [BE] Update BLUEPRINT.md to reflect the chosen path

FRESHVII | Seventh Stack | AppCon Hackathon

## **Phase 3 - Food lifecycle actions**

### **Firestore service**

- [X] [BE] Endpoint/action for Add food item

- [X] [BE] Endpoint/action for Mark Opened

- [X] [BE] Endpoint/action for Move to Freezer

- [X] [BE] Endpoint/action for Unfreeze

- [X] [BE] Endpoint/action for Consumed

- [X] [BE] Endpoint/action for Discarded

- [X] [BE] Store opened_at

- [X] [BE] Store frozen_at

- [X] [BE] Recalculate estimated freshness after opening

- [X] [BE] Recalculate freshness estimate after freezing

- [X] [BE] Update storage location

- [X] [BE] Deduct used amount

- [X] [BE] Preserve remaining quantity

- [X] [BE] Create leftover FoodItem

- [X] [BE] Reset freshness timer using leftover food rules

### **Event logging**

- [X] [BE] Log event on item added

- [X] [BE] Log event on item opened

- [X] [BE] Log event on item frozen

- [X] [BE] Log event on item unfrozen

- [X] [BE] Log event on item consumed

- [X] [BE] Log event on item discarded

- [X] [BE] Log event on leftover created

FRESHVII | Seventh Stack | AppCon Hackathon

## **Phase 4 - Rescue engine**

### **Recipe service**

- [ ] [BE] Create recipe.service.ts

- - [ ] [BE] fetchRecipes() — reads from recipes collection in Firestore

- - [ ] [BE] subscribeToRecipes() — real-time listener variant

### **Rescue domain service**

- [ ] [BE] Create src/domain/rescue.ts

- - [ ] [BE] Match active inventory against recipes using subcategory_id

- - [ ] [BE] Return matched ingredients per recipe

- - [ ] [BE] Return missing ingredients per recipe

- - [ ] [BE] Return estimated preparation time

- - [ ] [BE] Prioritize recipes that rescue the highest urgency items first

- - [ ] [BE] Sort by rescue-today > use-soon > fresh

- [ ] [BE] Connect RecipesPage to rescue engine instead of hardcoded mockData

## **Phase 5 - Impact metrics**

### **Fix broken import**

- [ ] [BE] Define and export ImpactEvent type from food.service.ts

- - [ ] [BE] useImpactEvents.ts imports ImpactEvent but the type does not exist — causes compile error

### **Activity query**

- [ ] [BE] Add fetchActivityEvents(uid, limit?) to food.service.ts

- - [ ] [BE] Reads from activity subcollection ordered by createdAt descending

### **Aggregate metrics domain service**

- [ ] [BE] Create src/domain/impact.ts

- - [ ] [BE] ingredientsRescued — count consumed events

- - [ ] [BE] mealsCooked — count cooking sessions

- - [ ] [BE] estimatedFoodSaved — sum quantity from consumed events

- - [ ] [BE] estimatedMoneySaved — optional, uses purchase_price from seed data

- [ ] [BE] Implement useImpactEvents hook with real data instead of empty stub

FRESHVII | Seventh Stack | AppCon Hackathon

## **Phase 6 - Seed & demo data**

### **Reference data**

- [X] [BE] Seed food categories into Firestore

- [X] [BE] Seed subcategories with shelf-life values

- [X] [BE] Seed recipes into Firestore

- [X] [BE] Seed recipe ingredients into Firestore

### **Demo inventory**

- [X] [BE] demo_items.csv — Chicken Breast 500g Fridge Opened

- [X] [BE] demo_items.csv — Leftover Rice 400g Fridge Opened

- [X] [BE] demo_items.csv — Tomatoes 3 pcs Fridge Unopened

- [X] [BE] demo_items.csv — Milk 700ml Fridge Opened

- [X] [BE] demo_items.csv — Eggs 6 pcs Fridge Unopened

- [X] [BE] demo_items.csv — Beef 500g Freezer Frozen

- [ ] [BE] Prepare seed/demo data — verify scripts run without error

- - [ ] [BE] Requires .env.seed at project root with DEMO_EMAIL and DEMO_PASSWORD

- - [ ] [BE] Run: npx tsx scripts/seed/run-all.ts

- [ ] [BE] Confirm seeded demo inventory produces correct freshness states on load

- - [ ] [BE] Chicken Breast → Rescue Today

- - [ ] [BE] Leftover Rice → Rescue Today

- - [ ] [BE] Tomatoes → Use Soon

- - [ ] [BE] Milk → Use Soon

- - [ ] [BE] Eggs → Fresh

- - [ ] [BE] Beef → Fresh

FRESHVII | Seventh Stack | AppCon Hackathon

## **Phase 7 - Post-MVP**

Do not work on these until the core demo is stable.

- [ ] [BE] Support optional environmental/sensor inputs in freshness calculation

- [ ] [BE] Cloud Function — identify foods requiring attention daily

- [ ] [BE] Cloud Function — push FCM notification for rescue-today items

- [ ] [BE] Aggregate impact metrics — production backend

- [ ] [BE] Configure production database

- [ ] [BE] Ensure demo APIs are reliable for judging
