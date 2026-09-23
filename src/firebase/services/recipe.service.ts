import { collection, getDocs, onSnapshot, type Unsubscribe, type QuerySnapshot, type DocumentData } from 'firebase/firestore'
import { db } from '../config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecipeIngredient = {
  subcategoryId: string
  name: string
  qty: number
  unit: string
}

export type FirestoreRecipe = {
  id: string
  title: string
  minutes: number
  diet_tags: string[]
  equipment: string[]
  ingredients: RecipeIngredient[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function docToRecipe(data: DocumentData, id: string): FirestoreRecipe {
  return { id, ...data } as FirestoreRecipe
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchRecipes(): Promise<FirestoreRecipe[]> {
  const snapshot = await getDocs(collection(db, 'recipes'))
  return snapshot.docs.map((d) => docToRecipe(d.data(), d.id))
}

export function subscribeToRecipes(
  callback: (recipes: FirestoreRecipe[]) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'recipes'),
    (snapshot: QuerySnapshot<DocumentData>) => {
      callback(snapshot.docs.map((d) => docToRecipe(d.data(), d.id)))
    },
  )
}
