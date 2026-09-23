import { ArrowLeft, Camera, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'
import { foodCategories } from '../domain/food'
import { measurementUnits } from '../domain/food'
import type { StorageLocation } from '../data/mockData'

const LOCATION_OPTIONS: { label: string; value: StorageLocation }[] = [
  { label: 'Fridge',  value: 'fridge'  },
  { label: 'Freezer', value: 'freezer' },
  { label: 'Pantry',  value: 'pantry'  },
]

export function AddFoodPage() {
  const { addNewItem } = useFoodContext()
  const navigate = useNavigate()

  const [name,            setName]            = useState('')
  const [category,        setCategory]        = useState<string>(foodCategories[0])
  const [quantity,        setQuantity]        = useState('')
  const [unit,            setUnit]            = useState<string>(measurementUnits[0])
  const [storageLocation, setStorageLocation] = useState<StorageLocation>('fridge')
  const [estimatedExpiry, setEstimatedExpiry] = useState('')
  const [opened,          setOpened]          = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await addNewItem({
        name:            name.trim(),
        category,
        quantity:        Number(quantity) || 1,
        unit,
        storageLocation,
        opened,
        dateAdded:       new Date().toISOString(),
        estimatedExpiry: estimatedExpiry ? new Date(estimatedExpiry).toISOString() : undefined,
      })
      navigate('/app')
    } catch {
      setError('Could not save the item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]">
        <ArrowLeft size={16} /> Back to kitchen
      </Link>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]">New inventory</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Add food</h1>
        <p className="mt-3 max-w-xl text-stone-600">
          A few details help FRESHVII estimate the right moment to use it.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-[#e5e1d5] bg-white p-5 shadow-[0_8px_24px_rgba(70,67,52,0.05)] sm:p-8">
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#f6f1e5] p-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold">Scan a label</p>
            <p className="text-sm text-stone-500">Use your camera for a faster start.</p>
          </div>
          <Button type="button" variant="outline"><Camera size={17} /> Scan item</Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold">Food name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Avocado"
              className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4 outline-none focus:border-[#426a5a]"
            >
              {foodCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold">Storage location</span>
            <select
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value as StorageLocation)}
              className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4 outline-none focus:border-[#426a5a]"
            >
              {LOCATION_OPTIONS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold">Quantity</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold">Unit</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4 outline-none focus:border-[#426a5a]"
            >
              {measurementUnits.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold">Best before <span className="font-normal text-stone-400">(optional)</span></span>
            <input
              type="date"
              value={estimatedExpiry}
              onChange={(e) => setEstimatedExpiry(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-[#e5e1d5] p-4">
          <input
            type="checkbox"
            checked={opened}
            onChange={(e) => setOpened(e.target.checked)}
            className="size-5 accent-[#426a5a]"
          />
          <span>
            <strong className="block">Already opened</strong>
            <small className="text-stone-500">Use a shorter freshness window for this item.</small>
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-[#f9ddd9] px-4 py-3 text-sm font-bold text-[#7c3733]">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={saving}
          className="h-12 w-full bg-[#426a5a] text-base text-white hover:bg-[#355747]"
        >
          <Plus size={18} /> {saving ? 'Saving…' : 'Add to my kitchen'}
        </Button>
      </form>
    </div>
  )
}
