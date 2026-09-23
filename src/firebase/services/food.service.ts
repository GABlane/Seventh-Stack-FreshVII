import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  query,
  where,
  Timestamp,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../config'
import {
  createFoodItem,
  openFood,
  freezeFood,
  unfreezeFood,
  consumeFood,
  discardFood,
  createLeftover,
  type FoodItemRecord,
  type FoodEvent,
  type FoodStatus,
} from '../../domain/food'
import type { StorageLocation } from '../../data/mockData'

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const itemsCol = (uid: string) =>
  collection(db, `profiles/${uid}/items`)

const itemDoc = (uid: string, itemId: string) =>
  doc(db, `profiles/${uid}/items/${itemId}`)

const activityDoc = (uid: string, eventId: string) =>
  doc(db, `profiles/${uid}/activity/${eventId}`)

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  throw new Error(`Cannot convert Firestore value to ISO string: ${String(value)}`)
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

function docToRecord(data: DocumentData): FoodItemRecord {
  return {
    ...data,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  } as FoodItemRecord
}

async function logEvent(uid: string, event: FoodEvent): Promise<void> {
  await setDoc(activityDoc(uid, event.id), { ...event })
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function addItem(
  uid: string,
  input: Omit<FoodItemRecord, 'status' | 'createdAt' | 'updatedAt'> & { addedAt?: Date | string },
): Promise<FoodItemRecord> {
  const { item, event } = createFoodItem(input)

  await setDoc(itemDoc(uid, item.id), {
    ...stripUndefined(item),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await logEvent(uid, event)
  return item
}

// ---------------------------------------------------------------------------
// Lifecycle updates
// ---------------------------------------------------------------------------

export async function markOpened(
  uid: string,
  item: FoodItemRecord,
  at: Date | string = new Date(),
): Promise<FoodItemRecord> {
  const { item: updated, event } = openFood(item, at)

  await updateDoc(itemDoc(uid, item.id), {
    opened: updated.opened,
    openedDate: updated.openedDate ?? null,
    estimatedExpiry: updated.estimatedExpiry ?? null,
    updatedAt: updated.updatedAt,
  })

  await logEvent(uid, event)
  return updated
}

export async function moveToFreezer(
  uid: string,
  item: FoodItemRecord,
  at: Date | string = new Date(),
): Promise<FoodItemRecord> {
  const { item: updated, event } = freezeFood(item, at)

  await updateDoc(itemDoc(uid, item.id), {
    storageLocation: updated.storageLocation,
    frozenDate: updated.frozenDate,
    estimatedExpiry: updated.estimatedExpiry ?? null,
    updatedAt: updated.updatedAt,
  })

  await logEvent(uid, event)
  return updated
}

export async function unfreezeItem(
  uid: string,
  item: FoodItemRecord,
  location: Exclude<StorageLocation, 'freezer'> = 'fridge',
  at: Date | string = new Date(),
): Promise<FoodItemRecord> {
  const { item: updated, event } = unfreezeFood(item, at, location)

  await updateDoc(itemDoc(uid, item.id), {
    storageLocation: updated.storageLocation,
    frozenDate: updated.frozenDate ?? null,
    estimatedExpiry: updated.estimatedExpiry ?? null,
    updatedAt: updated.updatedAt,
  })

  await logEvent(uid, event)
  return updated
}

export async function consumeItem(
  uid: string,
  item: FoodItemRecord,
  quantityUsed: number,
  at: Date | string = new Date(),
): Promise<FoodItemRecord> {
  const { item: updated, event } = consumeFood(item, quantityUsed, at)

  await updateDoc(itemDoc(uid, item.id), {
    quantity: updated.quantity,
    status: updated.status,
    updatedAt: updated.updatedAt,
    ...(updated.archivedAt ? { archivedAt: updated.archivedAt } : {}),
  })

  await logEvent(uid, event)
  return updated
}

export async function discardItem(
  uid: string,
  item: FoodItemRecord,
  at: Date | string = new Date(),
): Promise<FoodItemRecord> {
  const { item: updated, event } = discardFood(item, at)

  await updateDoc(itemDoc(uid, item.id), {
    status: updated.status,
    updatedAt: updated.updatedAt,
    archivedAt: updated.archivedAt,
  })

  await logEvent(uid, event)
  return updated
}

// ---------------------------------------------------------------------------
// Leftover (atomic batch)
// ---------------------------------------------------------------------------

export async function createLeftoverItem(
  uid: string,
  item: FoodItemRecord,
  quantity: number,
  at: Date | string = new Date(),
): Promise<{ original: FoodItemRecord; leftover: FoodItemRecord }> {
  const { item: original, event, leftover, leftoverEvent } = createLeftover(item, quantity, at)

  if (!leftover || !leftoverEvent) {
    throw new Error('createLeftover did not return leftover item and event')
  }

  const batch = writeBatch(db)

  // New leftover document
  batch.set(itemDoc(uid, leftover.id), {
    ...stripUndefined(leftover),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Leftover 'added' activity event
  batch.set(activityDoc(uid, leftoverEvent.id), { ...leftoverEvent })

  // Original item — touch updatedAt to reflect the leftover-created event
  batch.update(itemDoc(uid, original.id), {
    updatedAt: original.updatedAt,
  })

  // Original 'leftover-created' activity event
  batch.set(activityDoc(uid, event.id), { ...event })

  await batch.commit()

  return { original, leftover }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function subscribeToItems(
  uid: string,
  callback: (items: FoodItemRecord[]) => void,
): Unsubscribe {
  const q = query(itemsCol(uid))

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const items = snapshot.docs.map((d) => docToRecord(d.data()))
    callback(items)
  })
}

export async function fetchItems(
  uid: string,
  filterStatus: FoodStatus | 'all' = 'active',
): Promise<FoodItemRecord[]> {
  const col = itemsCol(uid)
  const q =
    filterStatus === 'all'
      ? query(col)
      : query(col, where('status', '==', filterStatus))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToRecord(d.data()))
}
