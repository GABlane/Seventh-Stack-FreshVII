import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config'
import { calculateFreshness, calculateRescueScore } from '../../domain/freshness'
import type { FoodItem, StorageLocation } from '../../data/mockData'

export type ImpactEvent = {
  id: string
  type: 'ingredient-rescued' | 'leftover-created' | 'meal-prepared' | 'product-added' | 'food-consumed' | 'moved-to-freezer' | 'food-opened'
  quantity: number
  label?: string
  createdAt: string
}

export type FoodDraft = {
  name: string
  category: string
  quantity: number
  unit: string
  location: StorageLocation
  dateAdded: string
  opened: boolean
  openedDate?: string
  estimatedExpiry?: string
  shelf: string
  accent: string
}

function requireUser() {
  const user = auth.currentUser
  if (!user || !db) throw new Error('You must be signed in to manage food.')
  return { user, db }
}

function asDate(value: unknown): Date | undefined {
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  return undefined
}

function toIso(value: unknown, fallback: string): string {
  return asDate(value)?.toISOString() ?? fallback
}

function mapFoodItem(id: string, data: Record<string, unknown>): FoodItem {
  const dateAdded = toIso(data.dateAdded, new Date().toISOString())
  const openedDate = asDate(data.openedDate)?.toISOString()
  const frozenDate = asDate(data.frozenDate)?.toISOString()
  const location = (data.location as StorageLocation | undefined) ?? 'fridge'
  const quantity = typeof data.quantity === 'number' ? data.quantity : 0
  const freshness = calculateFreshness({ category: String(data.category ?? 'Pantry'), quantity, location, dateAdded, openedDate, frozenDate, estimatedExpiry: asDate(data.estimatedExpiry) }, new Date())
  const rescue = calculateRescueScore({ category: String(data.category ?? 'Pantry'), quantity, location, dateAdded, openedDate, frozenDate, estimatedExpiry: freshness.estimatedExpiry }, new Date())

  return {
    id,
    name: String(data.name ?? 'Unnamed food'),
    category: String(data.category ?? 'Pantry'),
    quantity,
    unit: String(data.unit ?? 'piece'),
    location,
    shelf: String(data.shelf ?? 'Middle shelf'),
    opened: data.opened === true,
    dateAdded,
    openedDate,
    frozenDate,
    freshness: freshness.freshness,
    freshnessPercentage: freshness.freshnessPercentage,
    expires: freshness.expiresLabel,
    rescueScore: rescue.score,
    rescueReasons: rescue.reasons,
    accent: String(data.accent ?? '#dce9de'),
  }
}

export function subscribeFoodItems(onChange: (items: FoodItem[]) => void, onError: (error: Error) => void): () => void {
  const { user, db: firestore } = requireUser()
  const itemsQuery = query(collection(firestore, 'users', user.uid, 'foodItems'), orderBy('createdAt', 'desc'))
  return onSnapshot(itemsQuery, (snapshot) => onChange(snapshot.docs.map((document) => mapFoodItem(document.id, document.data()))), onError)
}

export function subscribeImpactEvents(onChange: (events: ImpactEvent[]) => void, onError: (error: Error) => void): () => void {
  const { user, db: firestore } = requireUser()
  const eventsQuery = query(collection(firestore, 'users', user.uid, 'impactEvents'), orderBy('createdAt', 'desc'))
  return onSnapshot(eventsQuery, (snapshot) => onChange(snapshot.docs.map((document) => {
    const data = document.data()
    return { id: document.id, type: String(data.type) as ImpactEvent['type'], quantity: typeof data.quantity === 'number' ? data.quantity : 0, label: typeof data.label === 'string' ? data.label : undefined, createdAt: toIso(data.createdAt, new Date().toISOString()) }
  })), onError)
}

async function recordImpactEvent(type: ImpactEvent['type'], quantity: number, label?: string): Promise<void> {
  const { user, db: firestore } = requireUser()
  await addDoc(collection(firestore, 'users', user.uid, 'impactEvents'), { type, quantity, label: label ?? null, createdAt: serverTimestamp() })
}

export async function addFoodItem(draft: FoodDraft): Promise<string> {
  const { user, db: firestore } = requireUser()
  const quantity = Number(draft.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than zero.')
  if (['piece', 'bag'].includes(draft.unit) && !Number.isInteger(quantity)) throw new Error(`${draft.unit} quantities must be whole numbers.`)
  const item = {
    ...draft,
    quantity,
    dateAdded: Timestamp.fromDate(new Date(draft.dateAdded)),
    openedDate: draft.openedDate ? Timestamp.fromDate(new Date(draft.openedDate)) : null,
    estimatedExpiry: draft.estimatedExpiry ? Timestamp.fromDate(new Date(draft.estimatedExpiry)) : null,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const document = await addDoc(collection(firestore, 'users', user.uid, 'foodItems'), item)
  await recordImpactEvent('product-added', quantity, draft.name)
  return document.id
}

export async function markFoodOpened(foodId: string): Promise<void> {
  const { user, db: firestore } = requireUser()
  const openedAt = Timestamp.fromDate(new Date())
  await updateDoc(doc(firestore, 'users', user.uid, 'foodItems', foodId), { opened: true, openedDate: openedAt, updatedAt: serverTimestamp() })
  await recordImpactEvent('food-opened', 1, foodId)
}

export async function freezeFoodItem(foodId: string, foodName?: string): Promise<void> {
  const { user, db: firestore } = requireUser()
  const frozenAt = Timestamp.fromDate(new Date())
  await updateDoc(doc(firestore, 'users', user.uid, 'foodItems', foodId), { location: 'freezer', shelf: 'Drawer 1', frozenDate: frozenAt, updatedAt: serverTimestamp() })
  await recordImpactEvent('moved-to-freezer', 1, foodName ?? foodId)
}

export async function consumeFoodItem(foodId: string, quantityUsed: number, currentQuantity: number): Promise<void> {
  const { user, db: firestore } = requireUser()
  if (!Number.isFinite(quantityUsed) || quantityUsed <= 0 || quantityUsed > currentQuantity) throw new Error('Enter a valid amount to use.')
  const remaining = Number((currentQuantity - quantityUsed).toFixed(2))
  await updateDoc(doc(firestore, 'users', user.uid, 'foodItems', foodId), { quantity: remaining, status: remaining === 0 ? 'consumed' : 'active', updatedAt: serverTimestamp() })
  await recordImpactEvent('ingredient-rescued', quantityUsed)
  await recordImpactEvent('food-consumed', quantityUsed, foodId)
}

export async function discardFoodItem(foodId: string): Promise<void> {
  const { user, db: firestore } = requireUser()
  await deleteDoc(doc(firestore, 'users', user.uid, 'foodItems', foodId))
}

export async function createLeftoverItem(source: FoodItem, quantity: number): Promise<string> {
  const { user, db: firestore } = requireUser()
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Leftover quantity must be greater than zero.')
  const now = new Date()
  const item = {
    name: `${source.name} leftovers`,
    category: source.category,
    quantity,
    unit: source.unit,
    location: 'fridge' as const,
    shelf: 'Middle shelf',
    opened: true,
    dateAdded: Timestamp.fromDate(now),
    openedDate: Timestamp.fromDate(now),
    frozenDate: null,
    estimatedExpiry: null,
    accent: source.accent,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    sourceFoodId: source.id,
  }
  const document = await addDoc(collection(firestore, 'users', user.uid, 'foodItems'), item)
  await recordImpactEvent('leftover-created', quantity, source.name)
  return document.id
}

export async function recordMealPrepared(label?: string): Promise<void> {
  await recordImpactEvent('meal-prepared', 1, label)
}
