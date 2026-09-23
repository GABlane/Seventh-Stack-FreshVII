import { PackageOpen } from 'lucide-react'
import { Link } from 'react-router'
import type { FoodItem as FoodRecord } from '../../data/mockData'
import { FreshnessBadge } from '../food/FreshnessBadge'

export function FoodItem({ item }: { item: FoodRecord }) {
  return <Link to={`/app/food/${item.id}`} className="group flex min-h-28 items-center gap-3 rounded-2xl border border-[#d8d1c0] bg-white/90 p-3 shadow-[0_5px_14px_rgba(70,67,52,0.06)] transition-transform hover:-translate-y-0.5"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: item.accent }}><PackageOpen size={18} className="text-stone-700" /></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-stone-900">{item.name}</h3><p className="mt-1 text-xs text-stone-500">{item.quantity} {item.unit} · {item.expires}</p><FreshnessBadge state={item.freshness} /></div></Link>
}
