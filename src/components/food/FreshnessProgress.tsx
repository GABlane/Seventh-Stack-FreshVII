import type { FreshnessState } from '../../data/mockData'

const colors: Record<FreshnessState, string> = {
  fresh: 'bg-[#6bcb77]',
  'use-soon': 'bg-[#d99c42]',
  'rescue-today': 'bg-[#ff6b6b]',
  expired: 'bg-stone-400',
}

export function FreshnessProgress({ value, state }: { value: number; state: FreshnessState }) {
  const percentage = Math.max(0, Math.min(100, value))
  return <div className="space-y-1.5"><div className="flex items-center justify-between text-xs font-bold text-stone-500"><span>Estimated freshness</span><span>{percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-label="Estimated freshness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><div className={`h-full rounded-full transition-[width] duration-500 ${colors[state]}`} style={{ width: `${percentage}%` }} /></div></div>
}
