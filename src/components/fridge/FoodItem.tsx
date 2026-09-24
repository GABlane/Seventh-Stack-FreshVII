import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { FoodItem as FoodRecord } from '../../data/mockData'
import { FoodIcon } from '../../lib/food-icons'
import { FreshnessBadge } from '../food/FreshnessBadge'

const statusColors: Record<FoodRecord['freshness'], string> = {
  fresh: 'bg-[#62c877]',
  'use-soon': 'bg-[#ffd34e]',
  'rescue-today': 'bg-[#ff9d3d]',
  expired: 'bg-[#ee5c63]',
}

export function FoodItem({ item, compact = false, visual = false }: { item: FoodRecord; compact?: boolean; visual?: boolean }) {
  if (visual) {
    return <Link to={`/app/food/${item.id}`} aria-label={`${item.name}, ${item.quantity} ${item.unit}`} title={item.name} className="relative flex size-6 items-center justify-center rounded-full bg-white/92 text-[#426a5a] shadow-sm transition-transform hover:-translate-y-0.5 hover:scale-105 sm:size-8"><span className={`absolute right-0 top-0 size-1.5 rounded-full ring-1 ring-white ${statusColors[item.freshness]}`} /><FoodIcon name={item.name} category={item.category} className="size-3.5 sm:size-4" /></Link>
  }

  return <Link to={`/app/food/${item.id}`} className={`group flex items-center gap-3 rounded-[1.15rem] border border-[#e5e1d5] bg-white p-3 shadow-[0_5px_14px_rgba(70,67,52,0.05)] transition-transform hover:-translate-y-0.5 ${compact ? '' : 'sm:p-4'}`}><div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#dce9de] text-[#426a5a]"><span className={`absolute left-1 top-1 z-10 size-2.5 rounded-full ${statusColors[item.freshness]}`} />{item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <FoodIcon name={item.name} category={item.category} />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate text-sm font-black text-[#2d493d]">{item.name}</h3><ArrowRight size={17} className="shrink-0 text-[#a6a590] transition-transform group-hover:translate-x-0.5" /></div><p className="mt-1 text-xs font-semibold text-[#7d806e]">{item.quantity} {item.unit} · {item.opened ? 'Opened' : 'Sealed'}</p><div className="mt-2 flex items-center gap-2"><FreshnessBadge state={item.freshness} /><span className="text-[11px] font-bold text-[#7d806e]">{item.expires}</span></div></div></Link>
}
