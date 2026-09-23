import type { FoodItem, StorageLocation } from '../../data/mockData'
import { FridgeShelf } from './FridgeShelf'

const shelfLabels: Record<StorageLocation, string[]> = {
  fridge: ['Top shelf', 'Middle shelf', 'Bottom shelf'],
  freezer: ['Drawer 1', 'Drawer 2'],
  pantry: ['Dry goods', 'Everyday staples'],
}

export function Fridge({ items, location }: { items: FoodItem[]; location: StorageLocation }) {
  const shelves = shelfLabels[location]
  return <div className="overflow-hidden rounded-[2rem] border-8 border-[#d8d1c0] bg-[#e8e2d3] shadow-[0_14px_30px_rgba(70,67,52,0.08)]"><div className="flex items-center justify-between bg-[#426a5a] px-5 py-4 text-white"><span className="text-sm font-black">{location === 'fridge' ? 'Freshness fridge' : location === 'freezer' ? 'Freezer storage' : 'Pantry shelf'}</span><span className="text-xs font-bold text-[#dce9de]">{items.length} tracked</span></div>{shelves.map((label) => <FridgeShelf key={label} label={label} items={items.filter((item) => item.shelf === label)} />)}</div>
}
