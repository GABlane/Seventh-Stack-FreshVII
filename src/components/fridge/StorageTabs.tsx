import { Box, Snowflake, Utensils } from 'lucide-react'
import type { StorageLocation } from '../../data/mockData'

const locations: Array<{ id: StorageLocation; label: string; Icon: typeof Box }> = [
  { id: 'fridge', label: 'Fridge', Icon: Box },
  { id: 'freezer', label: 'Freezer', Icon: Snowflake },
  { id: 'pantry', label: 'Pantry', Icon: Utensils },
]

export function StorageTabs({ value, onChange }: { value: StorageLocation; onChange: (value: StorageLocation) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#d9eef3] p-1.5" role="tablist" aria-label="Storage location">
      {locations.map(({ id, label, Icon }) => {
        const active = value === id
        return <button key={id} type="button" role="tab" aria-selected={active} onClick={() => onChange(id)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${active ? 'bg-white text-[#145d72] shadow-sm' : 'text-[#477d8d] hover:bg-white/70'}`}><Icon size={17} />{label}</button>
      })}
    </div>
  )
}
