import type { FoodItem } from '../../data/mockData'
import { FoodItem as FoodItemCard } from './FoodItem'

export function FridgeShelf({ label, items }: { label: string; items: FoodItem[] }) {
  return <section className="space-y-3">{label && <div className="flex items-center justify-between px-1"><h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#4f8ca3]">{label}</h3><span className="text-xs font-bold text-[#78a2ad]">{items.length} item{items.length === 1 ? '' : 's'}</span></div>}{items.length ? <div className="space-y-3">{items.map((item) => <FoodItemCard key={item.id} item={item} />)}</div> : <p className="rounded-2xl border border-dashed border-[#b9dce7] bg-white/60 py-8 text-center text-sm text-[#5e7f8b]">This space is clear.</p>}</section>
}
