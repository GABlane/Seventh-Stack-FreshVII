import type { StorageLocation } from '../data/mockData'

export type StorageZone = {
  key: string
  label: string
  description: string
}

export const storageZones: Record<StorageLocation, StorageZone[]> = {
  fridge: [
    { key: 'fridge-top', label: 'Top shelf', description: 'Ready-to-eat food and dairy' },
    { key: 'fridge-middle', label: 'Middle shelf', description: 'Everyday ingredients' },
    { key: 'fridge-crisper', label: 'Crisper drawer', description: 'Fruit and vegetables' },
    { key: 'fridge-door', label: 'Door', description: 'Drinks, condiments, and jars' },
  ],
  freezer: [
    { key: 'freezer-top', label: 'Top drawer', description: 'Quick-access frozen food' },
    { key: 'freezer-bottom', label: 'Bottom drawer', description: 'Longer-term storage' },
  ],
  pantry: [
    { key: 'pantry-eye-level', label: 'Eye-level shelf', description: 'Daily staples' },
    { key: 'pantry-lower', label: 'Lower shelf', description: 'Bulk and dry goods' },
  ],
}

export function defaultShelfKey(location: StorageLocation): string {
  return storageZones[location][0].key
}

export function zoneForShelfKey(shelfKey: string): { location: StorageLocation; zone: StorageZone } | undefined {
  for (const [location, zones] of Object.entries(storageZones) as Array<[StorageLocation, StorageZone[]]>) {
    const zone = zones.find((candidate) => candidate.key === shelfKey)
    if (zone) return { location, zone }
  }
  return undefined
}

export function shelfLabel(shelfKey: string, location: StorageLocation): string {
  return zoneForShelfKey(shelfKey)?.zone.label ?? storageZones[location][0].label
}
