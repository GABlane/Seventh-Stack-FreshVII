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

Enum storageLocation {
  fridge
  freezer
  pantry
}

Enum status {
  active
  consumed
  discarded
}

Enum eventType {
  added
  opened
  frozen
  unfrozen
  consumed
  discarded
  edited
  "leftover-created"
}

Enum unit {
  piece
  g
  kg
  ml
  l
  bag
  pack
  serving
  tub
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

  createdAt timestamp
}


// --------------------------------------------------
// profiles/{uid}/items/{itemId}
// --------------------------------------------------

Table items {

  id string [
    pk
  ]

  name string

  category string [
    note: 'Display name: Produce, Dairy & eggs, Meat, Grains, Pantry'
  ]

  subcategory_id string [
    null,
    note: 'ID of embedded food subcategory, e.g. chicken, rice, eggs'
  ]

  quantity number

  unit unit

  storageLocation storageLocation

  shelfKey string [
    null
  ]

  opened boolean

  dateAdded timestamp

  openedDate timestamp [
    null
  ]

  frozenDate timestamp [
    null
  ]

  estimatedExpiry timestamp [
    null,
    note: 'Computed expiry based on category + storage + opened state'
  ]

  freshnessState string [
    null,
    note: 'fresh | use-soon | rescue-today | expired'
  ]

  status status

  notes string [
    null
  ]

  createdAt timestamp

  updatedAt timestamp

  archivedAt timestamp [
    null
  ]
}


// --------------------------------------------------
// profiles/{uid}/activity/{activityId}
// --------------------------------------------------

Table activity {

  id string [
    pk,
    note: '{itemId}-{eventType}-{timestamp}'
  ]

  foodItemId string [
    ref: > items.id
  ]

  type eventType

  quantityBefore number [
    null
  ]

  quantityChange number [
    null
  ]

  quantityAfter number [
    null
  ]

  metadata "object" [
    null,
    note: 'Freeform key-value pairs, e.g. { leftoverId, sourceFoodItemId }'
  ]

  createdAt timestamp
}


// --------------------------------------------------
// food_categories/{categoryId}
// --------------------------------------------------

Table food_categories {

  id string [
    pk,
    note: 'Example: meat, dairy, produce, grains, pantry'
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
    note: 'Barcode value used as Firestore document ID'
  ]

  name string

  category string [
    note: 'Display name matching items.category'
  ]

  subcategory_id string [
    note: 'Reference to embedded subcategory ID'
  ]

  default_qty number

  unit unit
}
