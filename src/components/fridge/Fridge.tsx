import type { FoodItem, StorageLocation } from '../../data/mockData'
import fridgeIllustration from '../../assets/freshly-open-fridge-reference-blue.png'
import freezerIllustration from '../../assets/freshly-open-freezer-drawer-reference-blue.png'
import pantryIllustration from '../../assets/freshly-pantry-empty-reference-blue.png'
import { FridgeShelf } from './FridgeShelf'
import { storageZones } from '../../lib/storage-zones'

const fridgeShelfPositions: Record<string, string> = {
  'fridge-top': 'left-[10%] top-[17%] h-[19%] w-[42%]',
  'fridge-middle': 'left-[10%] top-[38%] h-[19%] w-[42%]',
  'fridge-crisper': 'left-[10%] top-[61%] h-[16%] w-[42%]',
  'fridge-door': 'left-[58%] top-[14%] h-[61%] w-[31%]',
}

const freezerShelfPositions: Record<string, string> = {
  'freezer-top': 'left-[25%] top-[18%] w-[50%]',
  'freezer-bottom': 'left-[25%] top-[34%] w-[50%]',
}

const pantryShelfPositions: Record<string, string> = {
  'pantry-eye-level': 'left-[18%] top-[39%] w-[64%]',
  'pantry-lower': 'left-[18%] top-[82%] w-[64%]',
}

export function Fridge({ items, location }: { items: FoodItem[]; location: StorageLocation }) {
  const zones = storageZones[location]

  if (location === 'fridge') {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-[#c6dde5] bg-[#eaf8fa] p-3 shadow-[0_18px_35px_rgba(70,67,52,0.12)] sm:p-5" aria-label="Your fridge">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#193b5a]">Freshly storage</p>
            <h2 className="mt-0.5 text-lg font-black text-[#193b5a]">Your fridge</h2>
          </div>
          <span className="rounded-full bg-[#d9eef3] px-3 py-1 text-xs font-bold text-[#193b5a]">{items.length} item{items.length === 1 ? '' : 's'}</span>
        </div>
        <div className="fridge-illustration-canvas relative left-1/2 w-[122%] max-w-[23rem] -translate-x-1/2 sm:w-full sm:max-w-[34rem] lg:max-w-[38rem]">
          <img src={fridgeIllustration} alt="Open Freshly refrigerator" className="absolute inset-0 size-full object-contain" />
          {zones.map((zone) => <FridgeShelf key={zone.key} zone={zone} items={items.filter((item) => item.shelfKey === zone.key)} overlayClassName={fridgeShelfPositions[zone.key]} />)}
        </div>
      </section>
    )
  }

  if (location === 'freezer') {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-[#c6dde5] bg-[#eaf8fa] p-3 shadow-[0_18px_35px_rgba(70,67,52,0.12)] sm:p-5" aria-label="Your freezer">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#193b5a]">Freshly storage</p>
            <h2 className="mt-0.5 text-lg font-black text-[#193b5a]">Your freezer</h2>
          </div>
          <span className="rounded-full bg-[#d9eef3] px-3 py-1 text-xs font-bold text-[#193b5a]">{items.length} item{items.length === 1 ? '' : 's'}</span>
        </div>
        <div className="relative left-1/2 aspect-square w-[122%] max-w-[23rem] -translate-x-1/2 sm:w-full sm:max-w-[34rem] lg:max-w-[38rem]">
          <img src={freezerIllustration} alt="Closed refrigerator with open Freshly freezer drawer" className="absolute inset-0 size-full object-contain" />
          {zones.map((zone) => <FridgeShelf key={zone.key} zone={zone} items={items.filter((item) => item.shelfKey === zone.key)} overlayClassName={freezerShelfPositions[zone.key]} visualLarge />)}
        </div>
      </section>
    )
  }

  if (location === 'pantry') {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-[#c6dde5] bg-[#eaf8fa] p-3 shadow-[0_18px_35px_rgba(70,67,52,0.12)] sm:p-5" aria-label="Your pantry">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#193b5a]">Freshly storage</p>
            <h2 className="mt-0.5 text-lg font-black text-[#193b5a]">Your pantry</h2>
          </div>
          <span className="rounded-full bg-[#d9eef3] px-3 py-1 text-xs font-bold text-[#193b5a]">{items.length} item{items.length === 1 ? '' : 's'}</span>
        </div>
        <div className="relative left-1/2 aspect-square w-[122%] max-w-[23rem] -translate-x-1/2 sm:w-full sm:max-w-[34rem] lg:max-w-[38rem]">
          <img src={pantryIllustration} alt="Freshly pantry shelves" className="absolute inset-0 size-full object-contain" />
          {zones.map((zone) => <FridgeShelf key={zone.key} zone={zone} items={items.filter((item) => item.shelfKey === zone.key)} overlayClassName={pantryShelfPositions[zone.key]} visualLarge />)}
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border-[7px] border-[#b8d4df] bg-[#eaf8fa] p-3 shadow-[0_18px_35px_rgba(70,67,52,0.12)] sm:p-5" aria-label={`Your ${location}`}>
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#193b5a] px-4 py-3 text-white">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ffe167]">Freshly storage</p>
          <h2 className="mt-0.5 text-lg font-black capitalize">{location}</h2>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{items.length} item{items.length === 1 ? '' : 's'}</span>
      </div>
      <div className="space-y-3">
        {zones.map((zone) => <FridgeShelf key={zone.key} zone={zone} items={items.filter((item) => item.shelfKey === zone.key)} />)}
      </div>
    </section>
  )
}
