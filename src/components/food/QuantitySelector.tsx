import { Minus, Plus } from 'lucide-react'
import { Button } from '../ui/button'

export function QuantitySelector({ value, unit, onChange }: { value: number; unit: string; onChange: (value: number) => void }) {
  const update = (next: number) => onChange(Math.max(0, Number(next.toFixed(2))))
  return <div className="flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white p-1"><Button type="button" size="icon-sm" variant="ghost" aria-label={`Decrease quantity in ${unit}`} onClick={() => update(value - 1)}><Minus size={16} /></Button><span className="min-w-16 text-center text-sm font-bold" aria-live="polite">{value} {unit}</span><Button type="button" size="icon-sm" variant="ghost" aria-label={`Increase quantity in ${unit}`} onClick={() => update(value + 1)}><Plus size={16} /></Button></div>
}
