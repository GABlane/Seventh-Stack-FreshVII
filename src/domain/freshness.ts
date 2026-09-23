import type { FreshnessState, StorageLocation } from '../data/mockData'

export type FreshnessInput = {
  category: string
  quantity: number
  location: StorageLocation
  dateAdded: Date | string
  openedDate?: Date | string
  frozenDate?: Date | string
  estimatedExpiry?: Date | string
}

export type FreshnessResult = {
  estimatedExpiry: Date
  freshness: FreshnessState
  freshnessPercentage: number
  remainingDays: number
  expiresLabel: string
  isEstimate: true
}

export type RescueResult = {
  score: number
  reasons: string[]
}

const shelfLifeDays: Record<string, number> = {
  produce: 7,
  'dairy & eggs': 14,
  meat: 3,
  grains: 180,
  pantry: 180,
}

const openedShelfLifeDays: Record<string, number> = {
  produce: 3,
  'dairy & eggs': 5,
  meat: 2,
  grains: 60,
  pantry: 60,
}

const freezerShelfLifeDays: Record<string, number> = {
  produce: 90,
  'dairy & eggs': 60,
  meat: 90,
  grains: 365,
  pantry: 365,
}

function asDate(value: Date | string): Date {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid freshness date: ${String(value)}`)
  }
  return date
}

function categoryKey(category: string): string {
  return category.trim().toLowerCase()
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function formatExpiryLabel(remainingDays: number): string {
  if (remainingDays < 0) return 'Expired'
  if (remainingDays === 0) return 'Today'
  if (remainingDays === 1) return 'Tomorrow'
  if (remainingDays < 30) return `in ${remainingDays} days`
  const months = Math.round(remainingDays / 30)
  return `in ${months} month${months === 1 ? '' : 's'}`
}

export function estimateExpiry(item: FreshnessInput): Date {
  if (item.estimatedExpiry) return asDate(item.estimatedExpiry)

  const key = categoryKey(item.category)
  if (item.location === 'freezer') {
    return addDays(asDate(item.frozenDate ?? item.dateAdded), freezerShelfLifeDays[key] ?? 90)
  }

  const startDate = item.openedDate ?? item.dateAdded
  const days = item.openedDate
    ? openedShelfLifeDays[key] ?? 3
    : shelfLifeDays[key] ?? 7

  return addDays(asDate(startDate), days)
}

export function calculateFreshness(item: FreshnessInput, now = new Date()): FreshnessResult {
  const estimatedExpiry = estimateExpiry(item)
  const currentDay = startOfDay(now)
  const expiryDay = startOfDay(estimatedExpiry)
  const addedDay = startOfDay(asDate(item.dateAdded))
  const remainingMilliseconds = expiryDay.getTime() - currentDay.getTime()
  const remainingDays = Math.ceil(remainingMilliseconds / 86_400_000)
  const totalDays = Math.max(1, Math.ceil((expiryDay.getTime() - addedDay.getTime()) / 86_400_000))
  const freshnessPercentage = Math.max(0, Math.min(100, Math.round((remainingDays / totalDays) * 100)))

  let freshness: FreshnessState = 'fresh'
  if (remainingDays <= 0) freshness = 'expired'
  else if (remainingDays <= 1) freshness = 'rescue-today'
  else if (remainingDays <= 3) freshness = 'use-soon'

  return {
    estimatedExpiry,
    freshness,
    freshnessPercentage,
    remainingDays,
    expiresLabel: formatExpiryLabel(remainingDays),
    isEstimate: true,
  }
}

export function calculateRescueScore(item: FreshnessInput, now = new Date()): RescueResult {
  const freshness = calculateFreshness(item, now)
  const urgency = freshness.freshness === 'expired'
    ? 100
    : freshness.freshness === 'rescue-today'
      ? 90
      : freshness.freshness === 'use-soon'
        ? 65
        : Math.max(5, 45 - freshness.remainingDays)
  const quantityFactor = item.quantity > 0 ? Math.min(15, Math.max(3, item.quantity > 5 ? 8 : 15)) : 0
  const openedFactor = item.openedDate ? 8 : 0
  const freezerFactor = item.location === 'freezer' ? -8 : 0
  const score = Math.max(0, Math.min(100, Math.round(urgency * 0.7 + quantityFactor + openedFactor + freezerFactor)))
  const reasons: string[] = []

  if (freshness.remainingDays <= 1) reasons.push('Estimated expiry is today')
  else if (freshness.remainingDays <= 3) reasons.push(`${freshness.remainingDays} days left in its estimate`)
  if (item.openedDate) reasons.push('Opened items use a shorter shelf-life estimate')
  if (item.quantity > 0) reasons.push(`${item.quantity} unit${item.quantity === 1 ? '' : 's'} still available`)

  return { score, reasons }
}
