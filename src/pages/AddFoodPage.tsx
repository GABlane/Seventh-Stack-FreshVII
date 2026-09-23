import { ArrowLeft, Camera, Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/ui/button'
import { addFoodItem } from '../firebase/services/food.service'

const today = new Date().toISOString().slice(0, 10)
const wholeQuantityUnits = new Set(['piece', 'bag'])

export function AddFoodPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Produce')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('piece')
  const [location, setLocation] = useState<'fridge' | 'freezer' | 'pantry'>('fridge')
  const [dateAdded, setDateAdded] = useState(today)
  const [opened, setOpened] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const quantityIsWhole = wholeQuantityUnits.has(unit)

  useEffect(() => {
    const quantityInput = document.querySelector<HTMLInputElement>('input[type="number"]')
    quantityInput?.setAttribute('min', quantityIsWhole ? '1' : '0.01')
    quantityInput?.setAttribute('step', quantityIsWhole ? '1' : '0.01')
    if (quantityIsWhole && quantity.includes('.')) {
      setQuantity(String(Math.max(1, Math.round(Number(quantity)))))
    }
  }, [quantity, quantityIsWhole])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await addFoodItem({ name, category, quantity: Number(quantity), unit, location, dateAdded, opened, openedDate: opened ? dateAdded : undefined, shelf: location === 'freezer' ? 'Drawer 1' : location === 'pantry' ? 'Dry goods' : 'Middle shelf', accent: '#dce9de' })
      navigate('/app')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to add this food.')
    } finally {
      setIsSaving(false)
    }
  }

  return <div className="w-full max-w-3xl space-y-8"><Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]"><ArrowLeft size={16} /> Back to kitchen</Link><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]">New inventory</p><h1 className="mt-2 text-4xl font-black tracking-tight">Add food</h1><p className="mt-3 max-w-xl text-stone-600">Add an item to your kitchen. FRESHVII will estimate when it needs attention.</p></div><form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-[#e5e1d5] bg-white p-5 shadow-[0_8px_24px_rgba(70,67,52,0.05)] sm:p-8"><div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#f6f1e5] p-4 sm:flex-row sm:items-center"><div><p className="font-bold">Scan a label</p><p className="text-sm text-stone-500">Camera support can be added without blocking manual entry.</p></div><Button type="button" variant="outline"><Camera size={17} /> Scan item</Button></div><div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Food name</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Avocado" className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]" /></label><label><span className="mb-2 block text-sm font-bold">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4"><option>Produce</option><option>Dairy & eggs</option><option>Meat</option><option>Grains</option><option>Pantry</option></select></label><label><span className="mb-2 block text-sm font-bold">Quantity</span><input required type="number" min="0.01" step="0.1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]" /></label><label><span className="mb-2 block text-sm font-bold">Unit</span><select value={unit} onChange={(event) => setUnit(event.target.value)} className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4"><option>piece</option><option>bag</option><option>g</option><option>ml</option><option>pack</option></select></label><label><span className="mb-2 block text-sm font-bold">Storage location</span><select value={location} onChange={(event) => setLocation(event.target.value as typeof location)} className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4"><option value="fridge">Fridge</option><option value="freezer">Freezer</option><option value="pantry">Pantry</option></select></label><label><span className="mb-2 block text-sm font-bold">Date added</span><input required type="date" value={dateAdded} onChange={(event) => setDateAdded(event.target.value)} className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]" /></label></div><label className="flex items-center gap-3 rounded-xl border border-[#e5e1d5] p-4"><input type="checkbox" checked={opened} onChange={(event) => setOpened(event.target.checked)} className="size-5 accent-[#426a5a]" /><span><strong className="block">Already opened</strong><small className="text-stone-500">Use a shorter freshness estimate for this item.</small></span></label>{error && <p role="alert" className="rounded-xl bg-[#f9ddd9] px-4 py-3 text-sm text-[#7c3733]">{error}</p>}<Button type="submit" disabled={isSaving} className="h-12 w-full bg-[#426a5a] text-base text-white hover:bg-[#355747]"><Plus size={18} /> {isSaving ? 'Adding...' : 'Add to my kitchen'}</Button></form><p className="flex items-center gap-2 text-sm text-stone-500"><Check size={16} className="text-[#7fb685]" /> Added food will appear in your live visual fridge.</p></div>
}
