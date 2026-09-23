import { ArrowRight, PackageOpen } from 'lucide-react'
import { Link } from 'react-router'
import type { FoodItem as FoodRecord } from '../../data/mockData'
import { FreshnessBadge } from '../food/FreshnessBadge'

const statusColors: Record<FoodRecord['freshness'], string> = {
  fresh: 'bg-[#62c877]',
  'use-soon': 'bg-[#ffd34e]',
  'rescue-today': 'bg-[#ff9d3d]',
  expired: 'bg-[#ee5c63]',
}

export function FoodItem({ item }: { item: FoodRecord }) {
  return <Link to={`/app/food/${item.id}`} className="group flex items-center gap-3 rounded-[1.15rem] border border-[#d7e4e8] bg-white p-3 shadow-[0_5px_14px_rgba(31,78,93,0.05)] transition-transform hover:-translate-y-0.5 sm:p-4"><div className="relative flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#e8f7fa] text-[#4f8ca3]"><span className={`absolute left-1 top-1 size-2.5 rounded-full ${statusColors[item.freshness]}`} /><PackageOpen size={25} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate text-sm font-black text-[#173d4e]">{item.name}</h3><ArrowRight size={17} className="shrink-0 text-[#8ab2bc] transition-transform group-hover:translate-x-0.5" /></div><p className="mt-1 text-xs font-semibold text-[#6f8b95]">{item.quantity} {item.unit} · {item.opened ? 'Opened' : 'Unopened'} · {item.location}</p><div className="mt-2 flex items-center gap-2"><FreshnessBadge state={item.freshness} /><span className="text-[11px] font-bold text-[#6f8b95]">{item.expires}</span></div></div></Link>
}
