import type { FoodItem, StorageLocation } from '../../data/mockData'
import fridgeIllustration from '../../assets/freshly-open-fridge-blue.png'
import freezerIllustration from '../../assets/freshly-open-freezer-blue.png'
import { FridgeShelf } from './FridgeShelf'
import { storageZones } from '../../lib/storage-zones'

const fridgeShelfPositions: Record<string, string> = {
  'fridge-top': 'left-[11%] top-[15%] w-[39%]',
  'fridge-middle': 'left-[11%] top-[29%] w-[39%]',
  'fridge-crisper': 'left-[11%] top-[43%] w-[39%]',
  'fridge-door': 'left-[57%] top-[10%] w-[34%]',
}

const freezerShelfPositions: Record<string, string> = {
  'freezer-top': 'left-[29%] top-[55%] w-[42%]',
  'freezer-bottom': 'left-[29%] top-[65%] w-[42%]',
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
        <div className="relative left-1/2 aspect-square w-[122%] max-w-[23rem] -translate-x-1/2 sm:w-full sm:max-w-[34rem] lg:max-w-[38rem]">
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
          {zones.map((zone) => <FridgeShelf key={zone.key} zone={zone} items={items.filter((item) => item.shelfKey === zone.key)} overlayClassName={freezerShelfPositions[zone.key]} />)}
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
