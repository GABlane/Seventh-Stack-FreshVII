import { ArrowRight, ChefHat, QrCode, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Fridge } from '../components/fridge/Fridge'
import { StorageTabs } from '../components/fridge/StorageTabs'
import type { StorageLocation } from '../data/mockData'
import { useFoodItems } from '../hooks/useFoodItems'
import { useImpactEvents } from '../hooks/useImpactEvents'

export function HomePage() {
  const [location, setLocation] = useState<StorageLocation>('fridge')
  const [query, setQuery] = useState('')
  const { items, isLoading, error } = useFoodItems()
  const { events: impactEvents, error: impactError } = useImpactEvents()
  const visibleItems = items.filter((item) => item.location === location && item.name.toLowerCase().includes(query.toLowerCase()))
  const atRisk = items.filter((item) => item.freshness === 'rescue-today' || item.freshness === 'use-soon').length
  const expired = items.filter((item) => item.freshness === 'expired').length
  const rescuedEvents = impactEvents.filter((event) => event.type === 'ingredient-rescued')
  const mealsPrepared = impactEvents.filter((event) => event.type === 'meal-prepared').length
  const dinnerIdea = items.find((item) => item.freshness === 'rescue-today' || item.freshness === 'use-soon') ?? items[0]
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())

  return <div className="home-surface -mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-4 bg-[#eefafd] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:space-y-6 sm:px-8 sm:py-8">
    <section className="pt-1">
      <div><p className="text-xs font-bold text-[#4f8ca3]">{today} · 4:30 PM</p><h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#14384a] sm:text-4xl">Good afternoon, Alex</h1></div>
    </section>

    <section className="rounded-[1.35rem] border border-[#d7e4e8] bg-white p-4 shadow-[0_8px_22px_rgba(31,78,93,0.06)] sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xl font-black leading-tight text-[#173d4e]">{items.length} items in your<br className="sm:hidden" /> kitchen</p><p className="mt-1 text-xs font-semibold text-[#4f8ca3]">{atRisk} need attention · approx. food at risk</p></div><Link to="/app/rescue" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#19b9d0] px-3 text-xs font-bold text-[#087c91]">Rescue <ArrowRight size={14} /></Link></div><div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#e6f0e8]"><span className="w-[8%] bg-[#ee5c63]" /><span className="w-[12%] bg-[#ff9d3d]" /><span className="w-[20%] bg-[#ffd34e]" /><span className="flex-1 bg-[#62c877]" /></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-[#607b86]"><span><i className="mr-1 inline-block size-2 rounded-full bg-[#ee5c63]" />{expired} Expired</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#ff9d3d]" />{items.filter((item) => item.freshness === 'rescue-today').length} Today</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#ffd34e]" />{items.filter((item) => item.freshness === 'use-soon').length} Soon</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#62c877]" />{items.filter((item) => item.freshness === 'fresh').length} Fresh</span></div></section>

    <section className="flex gap-2"><label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[#b9dce7] bg-[#f7fdfe] px-4 text-[#477d8d]"><Search size={19} /><span className="sr-only">Search food</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search milk, chicken, rice..." className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#173d4e] outline-none placeholder:text-[#78a2ad]" /></label><button type="button" aria-label="Scan food" title="Scan food" className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#24bfd1] bg-[#e9fbfd] text-[#087c91]"><QrCode size={21} /></button></section>

    {dinnerIdea && <section className="flex items-center gap-3 rounded-[1.25rem] bg-[#20bed0] p-3 text-white shadow-[0_10px_20px_rgba(32,190,208,0.18)]"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/90 text-[#087c91]"><ChefHat size={24} /></div><div className="min-w-0 flex-1"><p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#d7fbff]">4:30 PM · Dinner idea</p><p className="mt-1 text-sm font-bold leading-5">Use your {dinnerIdea.name} before {dinnerIdea.expires.toLowerCase()}. Make a quick rescue meal.</p></div><Link to="/app/recipes" className="hidden shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#087c91] sm:block">View recipes</Link></section>}

    <section className="space-y-3"><StorageTabs value={location} onChange={setLocation} />{error && <p role="alert" className="rounded-2xl bg-[#fff0ef] p-4 text-sm text-[#ad4147]">{error}</p>}{isLoading ? <div className="rounded-3xl border border-[#d7e4e8] bg-white p-10 text-center text-[#5e7f8b]">Loading your kitchen...</div> : visibleItems.length ? <Fridge items={visibleItems} location={location} /> : <div className="rounded-3xl border border-dashed border-[#b9dce7] bg-white p-10 text-center text-[#5e7f8b]">Nothing here yet. Add your first food item.</div>}</section>

    <section className="grid grid-cols-3 gap-2" aria-label="Kitchen impact"><div className="rounded-2xl bg-white p-3 text-center shadow-sm"><p className="text-xl font-black text-[#14384a]">{rescuedEvents.length}</p><p className="mt-1 text-[10px] font-bold text-[#6f8b95]">Rescued</p></div><div className="rounded-2xl bg-white p-3 text-center shadow-sm"><p className="text-xl font-black text-[#14384a]">{atRisk}</p><p className="mt-1 text-[10px] font-bold text-[#6f8b95]">At risk</p></div><div className="rounded-2xl bg-white p-3 text-center shadow-sm"><p className="text-xl font-black text-[#14384a]">{mealsPrepared}</p><p className="mt-1 text-[10px] font-bold text-[#6f8b95]">Meals made</p></div></section>{impactError && <p role="alert" className="text-xs text-[#6f8b95]">Impact metrics are temporarily unavailable.</p>}
  </div>
}
