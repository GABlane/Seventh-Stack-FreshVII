import { parse } from 'csv-parse/sync'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { writeBatch, doc, collection } from 'firebase/firestore'
import { db, auth, signInAsDemo } from '../firebase-admin.js'

const CSV = (name: string) =>
  readFileSync(resolve(import.meta.dirname, 'csv', name), 'utf8')

type CategoryRow = {
  id: string
  label: string
  default_shelf: string
  requires_chill: string
}

type SubcategoryRow = {
  category_id: string
  id: string
  label: string
  days_closed: string
  days_opened: string
}

type RecipeRow = {
  id: string
  title: string
  minutes: string
  diet_tags: string
  equipment: string
}

type IngredientRow = {
  recipe_id: string
  subcategory_id: string
  name: string
  qty: string
  unit: string
}

export async function seedReferenceData() {
  console.log('\n--- Seeding reference data ---')
  await signInAsDemo()

  const categories = parse(CSV('categories.csv'), { columns: true, skip_empty_lines: true }) as CategoryRow[]
  const subcategories = parse(CSV('subcategories.csv'), { columns: true, skip_empty_lines: true }) as SubcategoryRow[]
  const recipes = parse(CSV('recipes.csv'), { columns: true, skip_empty_lines: true }) as RecipeRow[]
  const ingredients = parse(CSV('recipe_ingredients.csv'), { columns: true, skip_empty_lines: true }) as IngredientRow[]

  // Group subcategories by category_id
  const subsByCategory = subcategories.reduce<Record<string, SubcategoryRow[]>>((acc, row) => {
    ;(acc[row.category_id] ??= []).push(row)
    return acc
  }, {})

  // Write food_categories
  const catBatch = writeBatch(db)
  for (const cat of categories) {
    const subs = (subsByCategory[cat.id] ?? []).map((s) => ({
      id: s.id,
      label: s.label,
      daysClosed: Number(s.days_closed),
      daysOpened: Number(s.days_opened),
    }))
    catBatch.set(doc(collection(db, 'food_categories'), cat.id), {
      id: cat.id,
      label: cat.label,
      default_shelf: cat.default_shelf,
      requires_chill: cat.requires_chill === 'true',
      subcategories: subs,
    })
    console.log(`  category: ${cat.id} (${subs.length} subcategories)`)
  }
  await catBatch.commit()
  console.log(`food_categories: ${categories.length} documents written`)

  // Group ingredients by recipe_id
  const ingsByRecipe = ingredients.reduce<Record<string, IngredientRow[]>>((acc, row) => {
    ;(acc[row.recipe_id] ??= []).push(row)
    return acc
  }, {})

  // Write recipes
  const recipeBatch = writeBatch(db)
  for (const recipe of recipes) {
    const ings = (ingsByRecipe[recipe.id] ?? []).map((i) => ({
      subcategoryId: i.subcategory_id,
      name: i.name,
      qty: Number(i.qty),
      unit: i.unit,
    }))
    recipeBatch.set(doc(collection(db, 'recipes'), recipe.id), {
      id: recipe.id,
      title: recipe.title,
      minutes: Number(recipe.minutes),
      diet_tags: recipe.diet_tags ? recipe.diet_tags.split('|') : [],
      equipment: recipe.equipment ? recipe.equipment.split('|') : [],
      ingredients: ings,
    })
    console.log(`  recipe: ${recipe.id} (${ings.length} ingredients)`)
  }
  await recipeBatch.commit()
  console.log(`recipes: ${recipes.length} documents written`)

  await auth.signOut()
}

// Allow running directly
if (process.argv[1] === import.meta.filename) {
  seedReferenceData()
    .then(() => {
      console.log('\nReference data seeding complete.')
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
