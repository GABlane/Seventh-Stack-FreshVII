import type { FoodItem } from '../../data/mockData'
import type { StorageZone } from '../../lib/storage-zones'
import { FoodItem as FoodItemCard } from './FoodItem'

export function FridgeShelf({ zone, items, overlayClassName }: { zone: StorageZone; items: FoodItem[]; overlayClassName?: string }) {
  if (overlayClassName) {
    return (
      <section className={`absolute ${overlayClassName}`}>
        {items.length ? <div className="flex flex-wrap items-center gap-1.5">{items.slice(0, 5).map((item) => <FoodItemCard key={item.id} item={item} visual />)}{items.length > 5 && <p className="flex size-8 items-center justify-center rounded-full bg-[#fffdf8]/90 text-center text-[8px] font-black text-[#193b5a] shadow-sm sm:size-10">+{items.length - 5}</p>}</div> : null}
      </section>
    )
  }

  return (
    <section className="rounded-[1.35rem] border border-[#c6dde5] bg-white/90 p-3 shadow-[inset_0_-7px_0_#b8d4df] sm:p-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#193b5a]">{zone.label}</h3>
          <p className="mt-1 text-[11px] font-semibold text-[#888b78]">{zone.description}</p>
        </div>
        <span className="rounded-full bg-[#d9eef3] px-2 py-1 text-[11px] font-black text-[#193b5a]">{items.length}</span>
      </div>
      {items.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{items.map((item) => <FoodItemCard key={item.id} item={item} compact />)}</div> : <p className="mt-3 rounded-xl border border-dashed border-[#ddd7c8] bg-[#f6fcfd] px-3 py-4 text-center text-xs font-semibold text-[#9a9a85]">This shelf is clear.</p>}
    </section>
  )
}
