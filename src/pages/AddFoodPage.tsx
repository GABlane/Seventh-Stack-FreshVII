import { ArrowLeft, Camera, Check, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../components/ui/button'

export function AddFoodPage() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
      <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]">New inventory</p><h1 className="mt-2 text-4xl font-black tracking-tight">Add food</h1><p className="mt-3 max-w-xl text-stone-600">A few details help FRESHVII estimate the right moment to use it.</p></div>
      <form className="space-y-6 rounded-[2rem] border border-[#e5e1d5] bg-white p-5 shadow-[0_8px_24px_rgba(70,67,52,0.05)] sm:p-8">
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#f6f1e5] p-4 sm:flex-row sm:items-center"><div><p className="font-bold">Scan a label</p><p className="text-sm text-stone-500">Use your camera for a faster start.</p></div><Button type="button" variant="outline"><Camera size={17} /> Scan item</Button></div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Food name</span><input required placeholder="e.g. Avocado" className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]" /></label><label><span className="mb-2 block text-sm font-bold">Quantity</span><input type="number" min="0" step="0.1" placeholder="1" className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]" /></label><label><span className="mb-2 block text-sm font-bold">Unit</span><select className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4 outline-none focus:border-[#426a5a]"><option>piece</option><option>bag</option><option>g</option><option>ml</option><option>pack</option></select></label><label><span className="mb-2 block text-sm font-bold">Storage location</span><select className="h-12 w-full rounded-xl border border-[#d8d1c0] bg-white px-4 outline-none focus:border-[#426a5a]"><option>Fridge</option><option>Freezer</option><option>Pantry</option></select></label><label><span className="mb-2 block text-sm font-bold">Best before</span><input type="date" className="h-12 w-full rounded-xl border border-[#d8d1c0] px-4 outline-none focus:border-[#426a5a]" /></label></div>
        <label className="flex items-center gap-3 rounded-xl border border-[#e5e1d5] p-4"><input type="checkbox" className="size-5 accent-[#426a5a]" /><span><strong className="block">Already opened</strong><small className="text-stone-500">Use a shorter freshness window for this item.</small></span></label>
        <Button type="submit" className="h-12 w-full bg-[#426a5a] text-base text-white hover:bg-[#355747]"><Plus size={18} /> Add to my kitchen</Button>
      </form>
      <p className="flex items-center gap-2 text-sm text-stone-500"><Check size={16} className="text-[#7fb685]" /> You can edit these details any time.</p>
    </div>
  )
}
