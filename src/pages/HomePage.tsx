import { ArrowUpRight, Refrigerator, Search, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { FoodCard } from '../components/food/FoodCard'
import { Button } from '../components/ui/button'
import { foodItems, type StorageLocation } from '../data/mockData'

const locations: Array<{ id: StorageLocation; label: string }> = [
  { id: 'fridge', label: 'Fridge' },
  { id: 'freezer', label: 'Freezer' },
  { id: 'pantry', label: 'Pantry' },
]

export function HomePage() {
  const [location, setLocation] = useState<StorageLocation>('fridge')
  const [query, setQuery] = useState('')
  const visibleItems = foodItems.filter((item) => item.location === location && item.name.toLowerCase().includes(query.toLowerCase()))
  const atRisk = foodItems.filter((item) => item.freshness === 'rescue-today' || item.freshness === 'use-soon').length

  return (
    <div className="w-full space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#426a5a]">Good morning, Alex</p>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">A fresher kitchen starts with knowing what to use next.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">Your kitchen has <strong className="text-stone-900">{foodItems.length} items</strong> in rotation. Let&apos;s rescue the good stuff before it gets forgotten.</p>
        </div>
        <div className="rounded-[2rem] bg-[#426a5a] p-6 text-white shadow-[0_12px_32px_rgba(66,106,90,0.2)]">
          <div className="flex items-start justify-between"><TriangleAlert size={22} /><span className="text-sm font-bold text-[#dce9de]">Needs attention</span></div>
          <p className="mt-7 text-5xl font-black">{atRisk}</p>
          <p className="mt-1 text-sm text-[#dce9de]">items are approaching their best</p>
          <a href="/rescue" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-[#f2c57c] decoration-2 underline-offset-4">Open rescue list <ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">Your kitchen</p><h2 className="mt-1 text-2xl font-black">Visual fridge</h2></div>
          <label className="flex h-11 items-center gap-2 rounded-2xl border border-[#e5e1d5] bg-white px-3 text-stone-400"><Search size={17} /><span className="sr-only">Search food</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your food" className="w-36 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400" /></label>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-[#e5e1d5] pb-3">
          {locations.map((item) => <Button key={item.id} variant={location === item.id ? 'default' : 'ghost'} className={location === item.id ? 'bg-[#426a5a] text-white hover:bg-[#355747]' : 'text-stone-500'} onClick={() => setLocation(item.id)}><Refrigerator size={16} />{item.label}</Button>)}
        </div>
        {visibleItems.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleItems.map((item) => <FoodCard key={item.id} item={item} />)}</div> : <div className="rounded-3xl border border-dashed border-[#d8d1c0] bg-white p-10 text-center text-stone-500">Nothing here yet. Add your first food item to start the visual fridge.</div>}
      </section>
    </div>
  )
}
