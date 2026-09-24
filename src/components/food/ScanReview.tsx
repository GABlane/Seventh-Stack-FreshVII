import { Plus, TriangleAlert } from 'lucide-react'
import type { StorageLocation } from '../../data/mockData'
import { Button } from '../ui/button'

export type ScanRow = {
  id: string
  include: boolean
  name: string
  category: string
  quantity: string
  unit: string
  location: StorageLocation
  pricePaid: string
  confidence: number
}

const categories = ['Produce', 'Dairy & eggs', 'Meat', 'Grains', 'Pantry']
const units = ['piece', 'bag', 'g', 'ml', 'pack']
const locations: StorageLocation[] = ['fridge', 'freezer', 'pantry']
const lowConfidence = 0.6
// Whole-number units. The step is counted from `min`, so `min` must be 1 (not 0.01) or 11 fails validation.
const wholeUnits = new Set(['piece', 'bag'])

const fieldClass = 'h-11 w-full rounded-xl border border-[#b8d4df] bg-white px-3 text-sm outline-none focus:border-[#193b5a]'

type ScanReviewProps = {
  rows: ScanRow[]
  dateAdded: string
  error: string
  isSaving: boolean
  onRowChange: (id: string, changes: Partial<ScanRow>) => void
  onDateChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ScanReview({ rows, dateAdded, error, isSaving, onRowChange, onDateChange, onSubmit, onCancel }: ScanReviewProps) {
  const selected = rows.filter((row) => row.include).length

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit() }} className="space-y-5">
      <div className="rounded-2xl border border-[#bdebf0] bg-[#d9eef3] p-4 text-sm text-[#193b5a]">
        <p className="font-black">We found {rows.length} items</p>
        <p className="mt-1 font-semibold text-[#5b7086]">Check each one, untick anything you do not want, then add them all at once.</p>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className={`rounded-2xl border p-4 ${row.include ? 'border-[#c6dde5] bg-white' : 'border-dashed border-[#c6dde5] bg-[#f6fcfd] opacity-60'}`}>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={row.include} onChange={(event) => onRowChange(row.id, { include: event.target.checked })} aria-label={`Include ${row.name || 'item'}`} className="size-5 shrink-0 accent-[#193b5a]" />
              <input value={row.name} onChange={(event) => onRowChange(row.id, { name: event.target.value })} aria-label="Food name" placeholder="Food name" className={`${fieldClass} font-bold`} />
            </div>
            {row.confidence < lowConfidence && row.include && <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#a76f00]"><TriangleAlert size={14} /> Not sure about this one. Please check it.</p>}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <label className="text-xs font-bold text-[#5b7086]">Quantity
                <input type="number" min={wholeUnits.has(row.unit) ? '1' : '0.01'} step={wholeUnits.has(row.unit) ? '1' : '0.01'} value={row.quantity} onChange={(event) => onRowChange(row.id, { quantity: event.target.value })} className={`${fieldClass} mt-1`} />
              </label>
              <label className="text-xs font-bold text-[#5b7086]">Unit
                <select value={row.unit} onChange={(event) => onRowChange(row.id, { unit: event.target.value })} className={`${fieldClass} mt-1`}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select>
              </label>
              <label className="text-xs font-bold text-[#5b7086]">Category
                <select value={row.category} onChange={(event) => onRowChange(row.id, { category: event.target.value })} className={`${fieldClass} mt-1`}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
              </label>
              <label className="text-xs font-bold text-[#5b7086]">Storage
                <select value={row.location} onChange={(event) => onRowChange(row.id, { location: event.target.value as StorageLocation })} className={`${fieldClass} mt-1 capitalize`}>{locations.map((location) => <option key={location} value={location}>{location[0].toUpperCase() + location.slice(1)}</option>)}</select>
              </label>
              <label className="col-span-2 text-xs font-bold text-[#5b7086] sm:col-span-1">Price (₱)
                <input type="number" min="0" step="0.01" value={row.pricePaid} onChange={(event) => onRowChange(row.id, { pricePaid: event.target.value })} placeholder="Optional" className={`${fieldClass} mt-1`} />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <label className="block sm:max-w-xs">
        <span className="mb-2 block text-sm font-bold">Date added (all items)</span>
        <input required type="date" value={dateAdded} onChange={(event) => onDateChange(event.target.value)} className="h-12 w-full rounded-xl border border-[#b8d4df] px-4 outline-none focus:border-[#193b5a]" />
      </label>

      {error && <p role="alert" className="rounded-xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#d94444]">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSaving || selected === 0} className="h-12 flex-1 bg-[#193b5a] text-base text-white hover:bg-[#193b5a]">
          <Plus size={18} /> {isSaving ? 'Adding...' : selected === 1 ? 'Add 1 item to my kitchen' : `Add ${selected} items to my kitchen`}
        </Button>
        <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel} className="h-12">Add one item by hand instead</Button>
      </div>
    </form>
  )
}
