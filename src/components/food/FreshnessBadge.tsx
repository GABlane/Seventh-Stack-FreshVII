import { AlertTriangle, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import type { FreshnessState } from '../../data/mockData'

const states: Record<FreshnessState, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  fresh: { label: 'Fresh', className: 'bg-[#dce9de] text-[#426a5a]', Icon: CheckCircle2 },
  'use-soon': { label: 'Use soon', className: 'bg-[#f6e8c9] text-[#9b6c22]', Icon: Clock3 },
  'rescue-today': { label: 'Rescue today', className: 'bg-[#f9ddd9] text-[#b84f49]', Icon: AlertTriangle },
  expired: { label: 'Expired', className: 'bg-stone-200 text-stone-600', Icon: XCircle },
}

export function FreshnessBadge({ state }: { state: FreshnessState }) {
  const { label, className, Icon } = states[state]
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}><Icon size={13} />{label}</span>
}