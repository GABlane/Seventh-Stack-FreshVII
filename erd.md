// FRESHVII · Firebase (Firestore) schema
// SINGLE-USER VERSION
//
// Firestore structure:
//
// profiles/{uid}
// profiles/{uid}/items/{itemId}
// profiles/{uid}/activity/{activityId}
//
// food_categories/{categoryId}
// recipes/{recipeId}
// barcodes/{barcode}
//
// Notes:
// - Firebase Authentication handles uid, email, password, and authentication.
// - profiles/{uid} uses Firebase Auth uid as document ID.
// - Every user has their OWN items and activity.
// - No household/shared inventory logic.
// - subcategories are embedded inside food_categories.
// - ingredients and steps are embedded inside recipes.
// - food_categories, recipes, and barcodes are global/reference data.

Enum storage_type {
  fridge
  freezer
  pantry
}

Enum item_status {
  active
  consumed
  discarded
}

Enum activity_type {
  consumed
  discarded
  frozen
  thawed
  cooked
}

Enum unit_type {
  g
  ml
  pcs
  cups
  servings
}


// --------------------------------------------------
// profiles/{uid}
// --------------------------------------------------

Table profiles {

  id string [
    pk,
    note: 'Firebase Auth uid / document ID'
  ]

  name string

  fcm_tokens "string[]" [
    note: 'Device tokens para sa push notifications'
  ]

  dinner_on boolean [
    note: 'Stored as nudges.dinnerOn'
  ]

  dinner_time string [
    note: 'Stored as nudges.dinnerTime, e.g. 16:30'
  ]

  recap_on boolean [
    note: 'Stored as nudges.recapOn'
  ]

  recap_day string [
    note: 'Stored as nudges.recapDay: fri | sat | sun'
  ]

  diets "string[]" [
    note: 'halal, nut_allergy, ...'
  ]

  equipment "string[]" [
    note: 'stove, rice_cooker, ...'
  ]

  one_pan_only boolean

  created_at timestamp
}


// --------------------------------------------------
// profiles/{uid}/items/{itemId}
// --------------------------------------------------

Table items {

  id string [
    pk
  ]

  user_id string [
    ref: > profiles.id,
    note: 'Parent path: profiles/{uid}/items/{itemId}'
  ]

  name string

  category_id string [
    note: 'Reference to food category ID'
  ]

  category_name string [
    note: 'Denormalized category label for easier reads'
  ]

  subcategory_id string [
    note: 'ID of embedded food subcategory'
  ]

  subcategory_name string [
    note: 'Denormalized subcategory label'
  ]

  storage storage_type

  shelf string

  quantity number

  purchase_price number

  unit unit_type

  purchase_date timestamp

  label_expiry timestamp [
    null,
    note: 'Optional expiry date from product label'
  ]

  use_by timestamp [
    note: 'Earlier of label expiry or estimated expiry'
  ]

  opened_at timestamp [
    null
  ]

  frozen_at timestamp [
    null
  ]

  status item_status

  is_leftover boolean

  source_recipe_id string [
    null,
    note: 'Recipe document ID if item came from a recipe'
  ]

  created_at timestamp
}


// --------------------------------------------------
// profiles/{uid}/activity/{activityId}
// --------------------------------------------------

Table activity {

  id string [
    pk
  ]

  user_id string [
    ref: > profiles.id,
    note: 'Parent path: profiles/{uid}/activity/{activityId}'
  ]

  type activity_type

  item_id string [
    note: 'Original item ID'
  ]

  item_name string [
    note: 'Snapshot/denormalized item name'
  ]

  was_at_risk boolean [
    note: 'true = counted as rescued'
  ]

  recipe_id string [
    null
  ]

  created_at timestamp
}


// --------------------------------------------------
// food_categories/{categoryId}
// --------------------------------------------------

Table food_categories {

  id string [
    pk,
    note: 'Example: meat, seafood, dairy, vegetables'
  ]

  label string

  default_shelf string

  requires_chill boolean [
    note: 'true = cannot normally be stored in pantry'
  ]

  subcategories "object[]" [
    note: 'Embedded array: { id, label, daysClosed, daysOpened }'
  ]
}


// --------------------------------------------------
// recipes/{recipeId}
// --------------------------------------------------

Table recipes {

  id string [
    pk
  ]

  title string

  minutes number

  diet_tags "string[]"

  equipment "string[]"

  ingredients "object[]" [
    note: 'Embedded array: { subcategoryId, name, qty, unit }'
  ]

  steps "string[]"
}


// --------------------------------------------------
// barcodes/{barcode}
// --------------------------------------------------

Table barcodes {

  code string [
    pk,
    note: 'Barcode value can be used as Firestore document ID'
  ]

  name string

  category_id string [
    note: 'Reference to food category ID'
  ]

  category_name string [
    note: 'Denormalized category label'
  ]

  subcategory_id string [
    note: 'Reference to embedded subcategory ID'
  ]

  subcategory_name string [
    note: 'Denormalized subcategory label'
  ]

  default_qty number

  unit unit_type
}