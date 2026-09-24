import { Box, Snowflake, Utensils } from 'lucide-react'
import type { StorageLocation } from '../../data/mockData'

const locations: Array<{ id: StorageLocation; label: string; Icon: typeof Box }> = [
  { id: 'fridge', label: 'Fridge', Icon: Box },
  { id: 'freezer', label: 'Freezer', Icon: Snowflake },
  { id: 'pantry', label: 'Pantry', Icon: Utensils },
]

export function StorageTabs({ value, onChange }: { value: StorageLocation; onChange: (value: StorageLocation) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[#dce9de] p-1.5" role="tablist" aria-label="Storage location">
      {locations.map(({ id, label, Icon }) => {
        const active = value === id
        return <button key={id} type="button" role="tab" aria-selected={active} onClick={() => onChange(id)} className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-xl px-1 text-xs font-bold transition-colors sm:gap-2 sm:px-3 sm:text-sm ${active ? 'bg-white text-[#426a5a] shadow-sm' : 'text-[#657861] hover:bg-white/70'}`}><Icon size={16} className="shrink-0" />{label}</button>
      })}
    </div>
  )
}
