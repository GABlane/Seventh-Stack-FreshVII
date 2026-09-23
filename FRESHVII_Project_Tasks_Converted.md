# FRESHVII — Project Tasks

*Seventh Stack | AppCon Hackathon*

Task backlog for FRESHVII, the food freshness and rescue PWA developed by Seventh Stack for AppCon.

**Legend:** [x] done · [ ] not started · [-] in progress

**Owners:** [LEAD] Leader/Pitcher · [UI] UI/UX · [FE] Frontend · [BE] Backend · [QA] QA/Product Critic

## Phase 0 - Project foundation

- [ ] [LEAD] Finalize MVP scope
- [ ] [LEAD] Finalize main demo flow
- [x] [LEAD] Create shared project documentation
- [x] [FE] Initialize React + TypeScript + Vite
- [x] [FE] Configure Tailwind CSS
- [ ] [FE] Configure shadcn/ui
- [x] [FE] Configure React Router
- [ ] [FE] Configure PWA manifest + service worker
- [ ] [FE] Configure API service layer
- [ ] [FE] Configure TanStack Query if needed
- [x] [BE] Initialize backend project
- [x] [BE] Configure database
- [x] [BE] Configure environment variables
- [ ] [BE] Prepare seed/demo data
- [ ] [UI] Finalize initial visual direction
- [ ] [QA] Define MVP acceptance criteria

## Phase 1 - Food domain & data model

## Food Item

- [ ] [BE] Define Food DTO
- [ ] [BE] Define Food entity/model
- [ ] [BE] Define food categories
- [ ] [BE] Define supported measurement units
- [ ] [BE] Define storage locations: Fridge, Freezer, Pantry
- [ ] [BE] Define freshness statuses: Fresh, Use Soon, Rescue Today, Expired

## Food lifecycle

> Added -> Stored -> Opened -> Partially Consumed -> Frozen / Moved -> Cooked -> Leftover -> Consumed / Discarded

- [ ] [BE] Track date_added
- [ ] [BE] Track quantity + unit
- [ ] [BE] Track storage location
- [ ] [BE] Track opened/unopened state
- [ ] [BE] Track opened_at
- [ ] [BE] Track frozen_at
- [ ] [BE] Track consumption state
- [ ] [BE] Track discarded state
- [ ] [BE] Support partial quantity updates
- [ ] [BE] Support leftover creation

## Phase 2 - Freshness engine

- \- [ ] [BE] Freshness calculation must work without sensor data
- \- [ ] [BE] Support optional environmental/sensor inputs
- \- [ ] [BE] Define confidence/estimate handling
- \- [ ] [FE] Clearly label freshness values as estimates
- \- [ ] [QA] Test freshness behavior when sensor data is unavailable
- \- [ ] [QA] Test unreliable/missing environmental readings

## MVP freshness estimation

- [ ] [BE] Create baseline shelf-life dataset
- [ ] [BE] Calculate estimated expiry from food type + storage date
- [ ] [BE] Adjust freshness when item is opened
- [ ] [BE] Adjust freshness when item moves to freezer
- [ ] [BE] Adjust freshness when storage location changes
- [ ] [BE] Generate freshness percentage
- [ ] [BE] Generate freshness status
- [ ] [BE] Generate estimated remaining days
- [ ] [BE] Ensure system communicates estimates rather than guaranteed spoilage dates

## Rescue Score

- [ ] [BE] Define Rescue Score calculation
- [ ] [BE] Increase score as estimated expiry approaches
- [ ] [BE] Consider opened state
- [ ] [BE] Consider storage location
- [ ] [BE] Consider remaining quantity
- [ ] [BE] Sort inventory by urgency
- [ ] [QA] Validate Rescue Score behavior using sample foods

| **Food**       | **Freshness** | **Rescue Score** |
|----------------|---------------|------------------|
| Chicken Breast | Rescue Today  | 95               |
| Leftover Rice  | Rescue Today  | 89               |
| Tomatoes       | Use Soon      | 78               |
| Milk           | Use Soon      | 61               |
| Eggs           | Fresh         | 20               |

## Phase 3 - UI/UX design

## Core visual direction

- [ ] [UI] Establish FRESHVII visual direction
- [ ] [UI] Define typography
- [ ] [UI] Define spacing system
- [ ] [UI] Define buttons
- [ ] [UI] Define cards
- [ ] [UI] Define freshness badges
- [ ] [UI] Define icons / visual cues
- [ ] [UI] Ensure freshness state does not rely only on color
- [ ] [UI] Define responsive/mobile-first behavior

## Core screens

- [ ] [UI] U1 - Home / Visual Fridge
- [ ] [UI] U2 - Add Food
- [ ] [UI] U3 - Food Detail
- [ ] [UI] U4 - Rescue My Food
- [ ] [UI] U5 - Recipe Recommendation
- [ ] [UI] U6 - Consumption Confirmation

## Visual fridge

- [ ] [UI] Design Fridge / Freezer / Pantry tabs
- [ ] [UI] Design fridge shelves
- [ ] [UI] Design food item appearance
- [ ] [UI] Design freshness indicators
- [ ] [UI] Design “Rescue Today” emphasis
- [ ] [UI] Design main Rescue My Food CTA
- [ ] [UI] Design empty fridge state
- [ ] [UI] Design stocked fridge state
- [ ] [UI] Design at-risk fridge state

## Interaction states

- [ ] [UI] Swipe / quick action - Consumed
- [ ] [UI] Swipe / quick action - Froze It
- [ ] [UI] Swipe / quick action - Discarded
- [ ] [UI] Opened / Unopened transition
- [ ] [UI] Move to Freezer flow
- [ ] [UI] Partial consumption flow
- [ ] [UI] Leftover creation flow
- [ ] [UI] Loading states
- [ ] [UI] Empty states
- [ ] [UI] Error states
- [ ] [UI] Success states

## Phase 4 - Frontend MVP

## Shared components

- [x] [FE] AppLayout
- [x] [FE] PageHeader
- [ ] [FE] StorageTabs
- [ ] [FE] Fridge
- [ ] [FE] FridgeShelf
- [ ] [FE] FoodItem
- [ ] [FE] FoodCard
- [ ] [FE] FreshnessBadge
- [ ] [FE] FreshnessProgress
- [ ] [FE] QuantitySelector
- [ ] [FE] QuickActionMenu
- [ ] [FE] RecipeCard
- [ ] [FE] EmptyState
- [ ] [FE] Shared Dialog / Drawer / Toast components

## U1 - Home / Visual Fridge

- [ ] [FE] Fridge / Freezer / Pantry tabs
- [ ] [FE] Visual fridge layout
- [ ] [FE] Display food items
- [ ] [FE] Display freshness status
- [ ] [FE] Display Rescue Today items
- [ ] [FE] At-risk food counter
- [ ] [FE] Rescue My Food CTA
- [ ] [FE] Quick food actions
- [ ] [FE] Empty fridge state
- [ ] [FE] Responsive mobile layout

## U2 - Add Food

- [ ] [FE] Food name input
- [ ] [FE] Quantity input
- [ ] [FE] Unit selector
- [ ] [FE] Storage location selector
- [ ] [FE] Date stored
- [ ] [FE] Opened / Unopened selector
- [ ] [FE] Camera capture UI
- [ ] [FE] Barcode option
- [ ] [FE] Manual entry fallback
- [ ] [FE] Confirmation before save
- [ ] [FE] Validation and error handling

## U3 - Food Detail

- [ ] [FE] Food image/icon
- [ ] [FE] Food name
- [ ] [FE] Quantity + unit
- [ ] [FE] Freshness percentage
- [ ] [FE] Freshness status
- [ ] [FE] Estimated remaining time
- [ ] [FE] Storage location
- [ ] [FE] Opened status
- [ ] [FE] Mark Consumed
- [ ] [FE] Mark Opened
- [ ] [FE] Move to Freezer
- [ ] [FE] Discard
- [ ] [FE] Edit item

## Phase 5 - Food actions & lifecycle

## Fast actions

- [ ] [FE] One-tap Consumed
- [ ] [FE] One-tap Froze It
- [ ] [FE] One-tap Discarded
- [ ] [BE] Endpoint/action for Consumed
- [ ] [BE] Endpoint/action for Frozen
- [ ] [BE] Endpoint/action for Discarded
- [ ] [QA] Test all state transitions

## Opened vs Unopened

- [ ] [FE] Quick “Mark as Opened” action
- [ ] [BE] Store opened_at
- [ ] [BE] Recalculate estimated freshness after opening
- [ ] [QA] Verify shorter freshness after opening

## Move to Freezer

- [ ] [FE] Move to Freezer control
- [ ] [BE] Update storage location
- [ ] [BE] Store frozen_at
- [ ] [BE] Recalculate freshness estimate
- [ ] [QA] Ensure old fridge expiry is not still shown

## Partial consumption

- [ ] [FE] “How much did you use?” prompt
- [ ] [FE] Used All option
- [ ] [FE] Used Half option
- [ ] [FE] Custom quantity option
- [ ] [BE] Deduct used amount
- [ ] [BE] Preserve remaining quantity
- [ ] [QA] Verify quantities never become invalid

## Leftovers

- [ ] [FE] Ask “Do you have leftovers?”
- [ ] [FE] Add leftover flow
- [ ] [BE] Create leftover FoodItem
- [ ] [BE] Reset freshness timer using leftover food rules
- [ ] [QA] Verify leftover item appears correctly

## Phase 6 - Rescue My Food

## Rescue engine

- [ ] [BE] Get highest-risk ingredients
- [ ] [BE] Rank ingredients using Rescue Score
- [ ] [BE] Match ingredients with possible recipes
- [ ] [BE] Prioritize recipes that rescue urgent ingredients
- [ ] [BE] Return ingredients rescued per recipe
- [ ] [BE] Return missing ingredients
- [ ] [BE] Return estimated preparation time

## Rescue UI

- [ ] [FE] High-risk ingredient section
- [ ] [FE] Rescue Score display
- [ ] [FE] Recommended recipe list
- [ ] [FE] Highlight rescued ingredients
- [ ] [FE] Show missing ingredients
- [ ] [FE] Show preparation time
- [ ] [FE] “Cook This” CTA

## Cook flow

- [ ] [FE] Cook confirmation
- [ ] [FE] Ingredient usage confirmation
- [ ] [FE] Partial-use prompt
- [ ] [FE] Leftover prompt
- [ ] [BE] Update inventory after cooking
- [ ] [QA] Test entire Rescue -> Cook -> Inventory flow

## Phase 7 - Camera & food input

## Hackathon MVP

- [ ] [FE] Browser camera permission
- [ ] [FE] Camera preview
- [ ] [FE] Capture image
- [ ] [FE] Manual fallback
- [ ] [FE] Confirmation/edit screen
- [ ] [QA] Test camera on mobile PWA

## Optional if time allows

- [ ] Barcode scanning
- [ ] OCR expiry-date recognition
- [ ] Food image recognition
- [ ] Auto-fill food name/category

These are optional because recognition must never block the basic Add Food flow.

## Phase 8 - Dashboard & impact

- [ ] [FE] Ingredients rescued metric
- [ ] [FE] Items at risk metric
- [ ] [FE] Meals prepared metric
- [ ] [FE] Estimated food saved
- [ ] [FE] Estimated money saved
- [ ] [BE] Aggregate impact metrics
- [ ] [QA] Check that metrics avoid fake precision

> THIS WEEK  
>   
> 4 Ingredients Rescued  
> ₱320 Estimated Food Saved  
> 3 Meals Suggested

## Phase 9 - Notifications

## MVP / optional depending on time

- [ ] [BE] Identify foods requiring attention
- [ ] [FE] Notification permission flow
- [ ] [FE] Local/PWA notification support
- [ ] [QA] Verify notification behavior

Example: “Your chicken breast and leftover rice should be used soon. Tap for a 20-minute meal suggestion.”

## Post-MVP notification ideas

- [ ] Dinner-time meal prompts
- [ ] Weekly food recap
- [ ] Weekend grocery reminder
- [ ] Expiring-food summary
- \- [ ] Temperature sensor integration
- \- [ ] Humidity sensor integration
- \- [ ] Smart packaging integration
- \- [ ] QR/NFC package metadata
- \- [ ] Smart refrigerator integration
- \- [ ] Sensor-assisted freshness recalculation
- 

## Phase 10 - Dietary preferences

Only if MVP is already stable.

- [ ] Vegetarian preference
- [ ] Halal preference
- [ ] Gluten-free preference
- [ ] Allergy exclusions
- [ ] Equipment restrictions
- [ ] Air fryer preference
- [ ] One-pan preference

Dietary filters must affect Rescue My Food recommendations.

## Phase 11 - PWA & responsive experience

- [ ] [FE] Installable PWA
- [ ] [FE] Web app manifest
- [ ] [FE] Service worker
- [ ] [FE] Mobile icons / splash assets
- [ ] [FE] Responsive fridge layout
- [ ] [FE] Camera works from installed PWA
- [ ] [QA] Test mobile installation
- [ ] [QA] Test desktop browser
- [ ] [QA] Test phone browser
- [ ] [QA] Verify HTTPS deployment

## Phase 12 - QA & product validation

## Product review

- [ ] [QA] Review full user flow
- [ ] [QA] Identify Top 5 MVP risks
- [ ] [QA] Identify confusing screens
- [ ] [QA] Identify unnecessary steps
- [ ] [QA] Review freshness assumptions
- [ ] [QA] Review Rescue Score behavior
- [ ] [QA] Review demo risks
- [ ] [QA] Prepare likely judge questions

## Required test scenarios

- [ ] Add food manually
- [ ] Add food to fridge
- [ ] Add food to freezer
- [ ] Move fridge item to freezer
- [ ] Mark unopened item as opened
- [ ] Partially consume an ingredient
- [ ] Fully consume an ingredient
- [ ] Discard an ingredient
- [ ] Cook using multiple ingredients
- [ ] Create leftover after cooking
- [ ] Verify freshness recalculation
- [ ] Verify Rescue Score updates
- [ ] Verify Rescue My Food prioritization
- [ ] Verify empty fridge behavior
- [ ] Verify API error state
- [ ] Verify camera permission denied state

## Phase 13 - Demo preparation

## Demo inventory

- [ ] Chicken Breast - 500g - Fridge - Opened - Rescue Today
- [ ] Leftover Rice - 400g - Fridge - Rescue Today
- [ ] Tomatoes - 3 pcs - Fridge - Use Soon
- [ ] Milk - 700ml - Fridge - Opened - Use Soon
- [ ] Eggs - 6 pcs - Fridge - Fresh
- [ ] Beef - 500g - Freezer - Fresh

## Required demo flow

> Open FRESHVII -> Show Visual Fridge -> Identify Rescue Today foods -> Open Rescue My Food -> Recommend meal -> Cook This -> Confirm quantity used -> Create / skip leftovers -> Inventory updates -> Show rescued-food impact

- [ ] [LEAD] Finalize demo script
- [ ] [QA] Try to break demo flow
- [ ] [FE] Ensure demo data loads reliably
- [ ] [BE] Ensure demo APIs are reliable
- [ ] [UI] Polish demo screens
- [ ] [LEAD] Prepare fallback screenshots/video if needed

## Phase 14 - Pitch & presentation

## Story

- [ ] [LEAD] Opening problem statement
- [ ] [LEAD] Explain why static expiration tracking is insufficient
- [ ] [LEAD] Introduce FRESHVII
- [ ] [LEAD] Explain food lifecycle concept
- [ ] [LEAD] Explain Rescue Score
- [ ] [LEAD] Transition into live demo
- [ ] [LEAD] Explain impact
- [ ] [LEAD] Explain sustainability
- [ ] [LEAD] Explain technological innovation
- [ ] [LEAD] Closing statement

**Key message:** “FRESHVII doesn’t just tell you what you can cook. It tells you what you should cook today so your food doesn’t become tomorrow’s waste.”

## Phase 15 - AppCon criteria alignment

## Product - 35%

### Relevance - 5%

- [ ] Demonstrate direct connection to food expiry and food waste

### Impact & Value - 10%

- [ ] Show ingredients rescued
- [ ] Show food saved
- [ ] Show estimated money saved
- [ ] Clearly explain household value

### UI/UX Design - 10%

- [ ] Visual refrigerator is understandable
- [ ] Mobile-first
- [ ] Rescue My Food is prominent
- [ ] Freshness states are immediately understandable
- [ ] Main flow requires minimal steps

### Sustainability - 10%

- [ ] Explain how earlier consumption reduces food waste
- [ ] Sustainability demonstrated through actual product behavior

## Technology - 30%

### Functionality - 15%

- [ ] Add food
- [ ] Store food
- [ ] Freshness calculation
- [ ] Open food
- [ ] Freeze food
- [ ] Consume food
- [ ] Rescue recommendation
- [ ] Cook
- [ ] Update inventory

### Technological Innovation - 15%

- [ ] Dynamic freshness estimation
- [ ] Food lifecycle state tracking
- [ ] Rescue Score
- [ ] Risk-prioritized recommendations
- [ ] Camera-enabled PWA
- [ ] Potential future sensor integration

## Creativity - 20%

### Originality - 10%

- [ ] Position FRESHVII as a food lifecycle + rescue system, not simply an expiration tracker

### Creative Innovation - 10%

- [ ] Interactive fridge
- [ ] Rescue Score
- [ ] State-aware freshness
- [ ] Rescue My Food

## Presentation

### Presentation preparation

- [ ] [LEAD] Clear story
- [ ] [LEAD] Rehearse pitch
- [ ] [LEAD] Rehearse transitions into demo
- [ ] [LEAD] Stay within allotted time
- [ ] [QA] Prepare judge Q&A
- [ ] [QA] Challenge unsupported claims
- [ ] [LEAD] Ensure all claims can be demonstrated or explained

## Phase 16 - Deployment & hardening

- [ ] [FE] Production frontend deployment
- [ ] [BE] Production backend deployment
- [ ] [BE] Configure production database
- [ ] [FE] Production environment variables
- [ ] [FE] Verify API URL
- [ ] [QA] Test deployed PWA
- [ ] [QA] Test mobile camera
- [ ] [QA] Test main flow on real phone
- [ ] [QA] Test weak/failed API responses
- [ ] [QA] Final smoke test
- [ ] [LEAD] Freeze code before judging

## Phase 17 - Post-MVP

Do not work on these until the core demo is stable.

- [ ] IoT refrigerator sensors
- [ ] Temperature monitoring
- [ ] Humidity monitoring
- [ ] Smarter spoilage prediction
- [ ] AI food image recognition
- [ ] OCR expiration recognition
- [ ] Grocery integration
- [ ] Shopping list generation
- [ ] Dietary/allergy profiles
- [ ] Weekly recap
- [ ] Smart dinner notifications
- [ ] Household sharing
- [ ] Multiple refrigerators
- [ ] Food waste analytics
- [ ] Smart refrigerator manufacturer integrations
- [ ] Business / restaurant version
- [ ] Grocery inventory version

## Suggested 3-Day Hackathon Schedule

| **Period**    | **Focus**              | **Target Outcome**                         |
|---------------|------------------------|--------------------------------------------|
| Day 1 - Early | Product + architecture | MVP locked, DTO defined, designs underway  |
| Day 1 - Late  | Foundation             | FE/BE projects running, core UI ready      |
| Day 2 - Early | Main functionality     | Add food + fridge + freshness working      |
| Day 2 - Late  | Rescue flow            | Rescue My Food + lifecycle actions working |
| Day 3 - Early | Integration            | Full end-to-end demo working               |
| Day 3 - Mid   | QA + polish            | Bugs fixed, UI polished, scope frozen      |
| Day 3 - Final | Pitch + demo           | Rehearsed presentation and reliable demo   |

## MVP Priority

## P0 - Must work

- [ ] Visual fridge
- [ ] Fridge / Freezer / Pantry
- [ ] Add food
- [ ] Quantity
- [ ] Opened / unopened
- [ ] Freshness estimate
- [ ] Freshness status
- [ ] Move to freezer
- [ ] Mark consumed
- [ ] Rescue Score
- [ ] Rescue My Food
- [ ] Recipe recommendation
- [ ] Cook / quantity deduction
- [ ] Inventory update

## P1 - Build if stable

- [ ] Camera capture
- [ ] Swipe actions
- [ ] Leftover creation
- [ ] Impact dashboard
- [ ] PWA installation
- [ ] Notifications

## P2 - Only if there is extra time

- [ ] Barcode
- [ ] OCR
- [ ] AI food recognition
- [ ] Dietary filters
- [ ] Weekly recap
- [ ] Advanced animations

## How to Claim Work

1.  Pick an unchecked task.

2.  Confirm with the team that nobody else owns it.

3.  Create a branch.

4.  Mark the task [-] while in progress.

5.  When merged and verified, mark [x].

6.  Send the PR to the team.

7.  QA verifies the feature.

8.  Only after QA verification should it be considered demo-ready.

> feature/visual-fridge  
> feature/freshness-engine  
> feature/rescue-flow  
> fix/partial-consumption

## Definition of Done

**A task is not finished because the code exists.**

> Design approved -> Implemented -> Connected to backend -> Correct data updates -> QA tested -> Works on mobile -> Works in deployed environment -> Can be demonstrated reliably

## FRESHVII Hackathon Rule

**Before adding another feature, ask:** Does the core demo already work from start to finish?

If no, fix the core product. If yes, ask whether the feature materially improves Product, Technology, Creativity, or Presentation scoring. If not, put it in Post-MVP.

**Primary target: Add -> Track -> Rescue -> Cook -> Update**
