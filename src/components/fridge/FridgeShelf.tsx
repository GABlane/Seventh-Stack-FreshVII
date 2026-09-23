import type { FoodItem } from '../../data/mockData'
import { FoodItem as FoodItemCard } from './FoodItem'

export function FridgeShelf({ label, items }: { label: string; items: FoodItem[] }) {
  return <section className="border-b-8 border-[#d8d1c0] bg-[#f2eee2] p-4 last:border-b-0"><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">{label}</h3><span className="text-xs font-bold text-stone-400">{items.length} item{items.length === 1 ? '' : 's'}</span></div>{items.length ? <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <FoodItemCard key={item.id} item={item} />)}</div> : <p className="py-5 text-center text-sm text-stone-400">This shelf is clear.</p>}</section>
}
