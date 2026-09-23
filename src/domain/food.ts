import type { FreshnessState, StorageLocation } from '../data/mockData'
import { calculateFreshness } from './freshness'

export const foodCategories = ['Produce', 'Dairy & eggs', 'Meat', 'Grains', 'Pantry'] as const
export type FoodCategory = (typeof foodCategories)[number] | (string & {})

export const measurementUnits = ['piece', 'g', 'kg', 'ml', 'l', 'bag', 'pack', 'serving', 'tub'] as const
export type MeasurementUnit = (typeof measurementUnits)[number] | (string & {})

export type FoodStatus = 'active' | 'consumed' | 'discarded'
export type FoodEventType = 'added' | 'opened' | 'frozen' | 'unfrozen' | 'consumed' | 'discarded' | 'edited' | 'leftover-created'

export type FoodItemRecord = {
  id: string
  name: string
  category: FoodCategory
  quantity: number
  unit: MeasurementUnit
  storageLocation: StorageLocation
  shelfKey?: string
  opened: boolean
  dateAdded: string
  openedDate?: string
  frozenDate?: string
  estimatedExpiry?: string
  freshnessState?: FreshnessState
  status: FoodStatus
  notes?: string
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

export type FoodEvent = {
  id: string
  foodItemId: string
  type: FoodEventType
  quantityBefore?: number
  quantityChange?: number
  quantityAfter?: number
  metadata?: Record<string, string | number | boolean>
  createdAt: string
}

export type LifecycleResult = {
  item: FoodItemRecord
  event: FoodEvent
}

export type ConsumptionResult = LifecycleResult & {
  leftover?: FoodItemRecord
  leftoverEvent?: FoodEvent
}

function assertQuantity(quantity: number, label = 'Quantity'): void {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error(`${label} must be a non-negative number.`)
  }
}

function assertActive(item: FoodItemRecord): void {
  if (item.status !== 'active') {
    throw new Error(`Cannot update a ${item.status} food item.`)
  }
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid lifecycle date: ${String(value)}`)
  return date.toISOString()
}

function eventId(itemId: string, type: FoodEventType, at: string): string {
  return `${itemId}-${type}-${new Date(at).getTime()}`
}

function eventFor(item: FoodItemRecord, type: FoodEventType, at: string, details: Omit<FoodEvent, 'id' | 'foodItemId' | 'type' | 'createdAt'> = {}): FoodEvent {
  return { id: eventId(item.id, type, at), foodItemId: item.id, type, createdAt: at, ...details }
}

export function createFoodItem(input: Omit<FoodItemRecord, 'status' | 'createdAt' | 'updatedAt'> & { addedAt?: Date | string }): LifecycleResult {
  assertQuantity(input.quantity)
  const at = iso(input.addedAt ?? input.dateAdded)
  const item: FoodItemRecord = { ...input, dateAdded: iso(input.dateAdded), status: 'active', createdAt: at, updatedAt: at }
  return { item, event: eventFor(item, 'added', at, { quantityAfter: item.quantity }) }
}

export function openFood(item: FoodItemRecord, at: Date | string): LifecycleResult {
  assertActive(item)
  if (item.opened) return { item, event: eventFor(item, 'opened', iso(at), { metadata: { alreadyOpened: true } }) }
  const openedAt = iso(at)
  const updated: FoodItemRecord = { ...item, opened: true, openedDate: openedAt, estimatedExpiry: undefined, updatedAt: openedAt }
  return { item: updated, event: eventFor(item, 'opened', openedAt, { metadata: { previousOpened: false } }) }
}

export function freezeFood(item: FoodItemRecord, at: Date | string): LifecycleResult {
  assertActive(item)
  const frozenAt = iso(at)
  const updated: FoodItemRecord = { ...item, storageLocation: 'freezer', frozenDate: frozenAt, estimatedExpiry: undefined, updatedAt: frozenAt }
  return { item: updated, event: eventFor(item, 'frozen', frozenAt, { metadata: { previousLocation: item.storageLocation } }) }
}

export function unfreezeFood(item: FoodItemRecord, at: Date | string, location: Exclude<StorageLocation, 'freezer'> = 'fridge'): LifecycleResult {
  assertActive(item)
  const unfrozenAt = iso(at)
  const updated: FoodItemRecord = { ...item, storageLocation: location, frozenDate: undefined, estimatedExpiry: undefined, updatedAt: unfrozenAt }
  return { item: updated, event: eventFor(item, 'unfrozen', unfrozenAt, { metadata: { nextLocation: location } }) }
}

export function consumeFood(item: FoodItemRecord, quantityUsed: number, at: Date | string): ConsumptionResult {
  assertActive(item)
  assertQuantity(quantityUsed, 'Consumed quantity')
  if (quantityUsed > item.quantity) throw new Error('Consumed quantity cannot exceed available quantity.')
  const consumedAt = iso(at)
  const remaining = Number((item.quantity - quantityUsed).toFixed(2))
  const updated: FoodItemRecord = { ...item, quantity: remaining, status: remaining === 0 ? 'consumed' : 'active', updatedAt: consumedAt, archivedAt: remaining === 0 ? consumedAt : undefined }
  return { item: updated, event: eventFor(item, 'consumed', consumedAt, { quantityBefore: item.quantity, quantityChange: -quantityUsed, quantityAfter: remaining }) }
}

export function discardFood(item: FoodItemRecord, at: Date | string): LifecycleResult {
  assertActive(item)
  const discardedAt = iso(at)
  const updated: FoodItemRecord = { ...item, status: 'discarded', updatedAt: discardedAt, archivedAt: discardedAt }
  return { item: updated, event: eventFor(item, 'discarded', discardedAt, { quantityBefore: item.quantity, quantityAfter: 0 }) }
}

export function createLeftover(item: FoodItemRecord, quantity: number, at: Date | string): ConsumptionResult {
  assertActive(item)
  assertQuantity(quantity, 'Leftover quantity')
  if (quantity > item.quantity) throw new Error('Leftover quantity cannot exceed available quantity.')
  const leftoverAt = iso(at)
  const leftoverId = `${item.id}-leftover-${new Date(leftoverAt).getTime()}`
  const leftover: FoodItemRecord = {
    ...item,
    id: leftoverId,
    name: `${item.name} leftovers`,
    quantity,
    storageLocation: 'fridge',
    shelfKey: undefined,
    opened: true,
    openedDate: leftoverAt,
    frozenDate: undefined,
    estimatedExpiry: undefined,
    status: 'active',
    notes: 'Created from a leftover portion.',
    createdAt: leftoverAt,
    updatedAt: leftoverAt,
    archivedAt: undefined,
  }
  const freshness = calculateFreshness({ category: leftover.category, quantity: leftover.quantity, location: leftover.storageLocation, dateAdded: leftover.dateAdded, openedDate: leftover.openedDate }, new Date(leftoverAt))
  leftover.estimatedExpiry = freshness.estimatedExpiry.toISOString()
  const event = eventFor(item, 'leftover-created', leftoverAt, { quantityAfter: quantity, metadata: { leftoverId } })
  return { item, event, leftover, leftoverEvent: eventFor(leftover, 'added', leftoverAt, { quantityAfter: quantity, metadata: { sourceFoodItemId: item.id } }) }
}
