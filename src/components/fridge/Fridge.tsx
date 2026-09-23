import type { FoodItem, StorageLocation } from '../../data/mockData'
import { Link } from 'react-router'
import { FridgeShelf } from './FridgeShelf'

const shelfLabels: Record<StorageLocation, string[]> = {
  fridge: ['Top shelf', 'Middle shelf', 'Bottom shelf'],
  freezer: ['Drawer 1', 'Drawer 2'],
  pantry: ['Dry goods', 'Everyday staples'],
}

export function Fridge({ items, location }: { items: FoodItem[]; location: StorageLocation }) {
  const shelves = shelfLabels[location]
  const atRiskCount = items.filter((item) => item.freshness === 'rescue-today' || item.freshness === 'use-soon').length
  const assignedShelves = new Set(shelves)
  const unshelvedItems = items.filter((item) => !assignedShelves.has(item.shelf))
  return <div className="overflow-hidden rounded-[2rem] border-8 border-[#d8d1c0] bg-[#e8e2d3] shadow-[0_14px_30px_rgba(70,67,52,0.08)]"><div className="flex flex-wrap items-center justify-between gap-3 bg-[#426a5a] px-5 py-4 text-white"><div><span className="text-sm font-black">{location === 'fridge' ? 'Freshness fridge' : location === 'freezer' ? 'Freezer storage' : 'Pantry shelf'}</span><p className="mt-1 text-xs text-[#dce9de]">{items.length} tracked · {atRiskCount} need{atRiskCount === 1 ? 's' : ''} attention</p></div>{atRiskCount > 0 && <Link to="/app/rescue" className="inline-flex items-center rounded-full bg-[#f2c57c] px-3 py-1.5 text-xs font-black text-[#4f422b] transition-colors hover:bg-[#f7d69d]">Open rescue list</Link>}</div>{shelves.map((label) => <FridgeShelf key={label} label={label} items={items.filter((item) => item.shelf === label)} />)}{unshelvedItems.length > 0 && <FridgeShelf label="Other items" items={unshelvedItems} />}</div>
}
