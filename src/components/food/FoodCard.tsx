import { ArrowRight, PackageOpen } from 'lucide-react'
import { Link } from 'react-router'
import type { FoodItem } from '../../data/mockData'
import { FreshnessBadge } from './FreshnessBadge'
import { FreshnessProgress } from './FreshnessProgress'

export function FoodCard({ item }: { item: FoodItem }) {
  return (
    <Link to={`/app/food/${item.id}`} className="group flex min-h-36 flex-col justify-between rounded-3xl border border-[#e5e1d5] bg-white p-4 shadow-[0_8px_24px_rgba(70,67,52,0.05)] transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl" style={{ backgroundColor: item.accent }}><PackageOpen size={21} className="text-stone-700" /></div>
        <FreshnessBadge state={item.freshness} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="w-full"><h3 className="font-bold text-stone-900">{item.name}</h3><p className="mt-1 text-sm text-stone-500">{item.quantity} {item.unit} · {item.expires}</p><div className="mt-3"><FreshnessProgress value={item.freshnessPercentage} state={item.freshness} /></div></div>
        <ArrowRight size={18} className="text-stone-400 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}