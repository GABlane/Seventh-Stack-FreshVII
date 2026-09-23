import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import {
  addItem,
  markOpened,
  moveToFreezer,
  consumeItem as serviceConsumeItem,
  discardItem as serviceDiscardItem,
  createLeftoverItem as serviceCreateLeftoverItem,
  subscribeToItems,
} from '../firebase/index'
import { calculateFreshness, calculateRescueScore } from '../domain/freshness'
import type { FoodItemRecord } from '../domain/food'
import type { FoodItem, StorageLocation } from '../data/mockData'

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const CATEGORY_ACCENT: Record<string, string> = {
  'Produce':     '#dce9de',
  'Dairy & eggs':'#f4e6c9',
  'Meat':        '#f0ddd2',
  'Grains':      '#eee9d9',
  'Pantry':      '#e8e4d9',
}

const DEFAULT_SHELF: Record<StorageLocation, string> = {
  fridge:  'Fridge',
  freezer: 'Drawer 1',
  pantry:  'Dry goods',
}

function toDisplayItem(record: FoodItemRecord): FoodItem {
  const input = {
    category:        record.category,
    quantity:        record.quantity,
    location:        record.storageLocation,
    dateAdded:       record.dateAdded,
    openedDate:      record.openedDate,
    frozenDate:      record.frozenDate,
    estimatedExpiry: record.estimatedExpiry,
  }
  const freshness = calculateFreshness(input)
  const rescue    = calculateRescueScore(input)

  return {
    id:                  record.id,
    name:                record.name,
    category:            record.category,
    quantity:            record.quantity,
    unit:                record.unit,
    location:            record.storageLocation,
    shelf:               record.shelfKey ?? DEFAULT_SHELF[record.storageLocation],
    opened:              record.opened,
    dateAdded:           record.dateAdded,
    openedDate:          record.openedDate,
    frozenDate:          record.frozenDate,
    freshness:           freshness.freshness,
    freshnessPercentage: freshness.freshnessPercentage,
    expires:             freshness.expiresLabel,
    rescueScore:         rescue.score,
    rescueReasons:       rescue.reasons,
    accent:              CATEGORY_ACCENT[record.category] ?? '#e8e4d9',
  }
}

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

export type AddItemInput = {
  name: string
  category: string
  quantity: number
  unit: string
  storageLocation: StorageLocation
  opened: boolean
  dateAdded: string
  estimatedExpiry?: string
}

type FoodContextValue = {
  uid: string | null
  displayName: string | null
  loading: boolean
  items: FoodItem[]
  rawItems: FoodItemRecord[]
  addNewItem:        (input: AddItemInput) => Promise<void>
  openItem:          (id: string) => Promise<void>
  freezeItem:        (id: string) => Promise<void>
  consumeItem:       (id: string, qty: number) => Promise<void>
  discardItem:       (id: string) => Promise<void>
  createLeftoverItem:(id: string, qty: number) => Promise<void>
}

const FoodContext = createContext<FoodContextValue | null>(null)

export function useFoodContext(): FoodContextValue {
  const ctx = useContext(FoodContext)
  if (!ctx) throw new Error('useFoodContext must be used inside FoodProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid]                 = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [rawItems, setRawItems]       = useState<FoodItemRecord[]>([])
  const [loading, setLoading]         = useState(true)

  // Auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null)
      setDisplayName(user?.displayName ?? null)
      if (!user) {
        setRawItems([])
        setLoading(false)
      }
    })
  }, [])

  // Firestore subscription
  useEffect(() => {
    if (!uid) return
    setLoading(true)
    const unsub = subscribeToItems(uid, (all) => {
      setRawItems(all.filter((i) => i.status === 'active'))
      setLoading(false)
    })
    return unsub
  }, [uid])

  // Derived display items
  const items: FoodItem[] = rawItems.map(toDisplayItem)

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function findRaw(id: string): FoodItemRecord {
    const record = rawItems.find((i) => i.id === id)
    if (!record) throw new Error(`Item ${id} not found in local state`)
    return record
  }

  async function addNewItem(input: AddItemInput): Promise<void> {
    if (!uid) throw new Error('Not signed in')
    await addItem(uid, { id: crypto.randomUUID(), ...input })
  }

  async function openItem(id: string): Promise<void> {
    if (!uid) return
    await markOpened(uid, findRaw(id))
  }

  async function freezeItem(id: string): Promise<void> {
    if (!uid) return
    await moveToFreezer(uid, findRaw(id))
  }

  async function consumeItem(id: string, qty: number): Promise<void> {
    if (!uid) return
    await serviceConsumeItem(uid, findRaw(id), qty)
  }

  async function discardItem(id: string): Promise<void> {
    if (!uid) return
    await serviceDiscardItem(uid, findRaw(id))
  }

  async function createLeftoverItem(id: string, qty: number): Promise<void> {
    if (!uid) return
    await serviceCreateLeftoverItem(uid, findRaw(id), qty)
  }

  return (
    <FoodContext.Provider value={{
      uid, displayName, loading, items, rawItems,
      addNewItem, openItem, freezeItem, consumeItem, discardItem, createLeftoverItem,
    }}>
      {children}
    </FoodContext.Provider>
  )
}
