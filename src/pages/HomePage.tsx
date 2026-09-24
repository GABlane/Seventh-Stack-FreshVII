import { ArrowRight, ChefHat, QrCode, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Fridge } from '../components/fridge/Fridge'
import { StorageTabs } from '../components/fridge/StorageTabs'
import { useFoodContext } from '../context/FoodContext'
import type { StorageLocation } from '../data/mockData'
import { auth } from '../firebase/config'

export function HomePage() {
  const { items, loading, displayName } = useFoodContext()
  const [location, setLocation] = useState<StorageLocation>('fridge')
  const [query, setQuery] = useState('')
  const fullGreetingName = displayName?.trim() || auth.currentUser?.displayName?.trim() || auth.currentUser?.email?.split('@')[0] || 'there'
  const greetingName = fullGreetingName.split(/\s+/)[0] || 'there'

  const visibleItems = items.filter((item) => item.location === location && item.name.toLowerCase().includes(query.toLowerCase()))
  const atRisk = items.filter((item) => item.freshness === 'rescue-today' || item.freshness === 'use-soon').length
  const expired = items.filter((item) => item.freshness === 'expired').length
  const dinnerIdea = items.find((item) => item.freshness === 'rescue-today' || item.freshness === 'use-soon') ?? items[0]
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())

  return (
    <div className="home-surface -mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-4 bg-[#eaf8fa] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:space-y-6 sm:px-8 sm:py-8">
      <section className="pt-1">
        <div>
          <p className="text-xs font-bold text-[#193b5a]">{today}</p>
          <h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#193b5a] sm:text-4xl">
            Good afternoon, {greetingName}
          </h1>
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-[#c6dde5] bg-white p-4 shadow-[0_8px_22px_rgba(70,67,52,0.06)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-black leading-tight text-[#193b5a]">{items.length} items in your<br className="sm:hidden" /> kitchen</p>
            <p className="mt-1 text-xs font-semibold text-[#193b5a]">{atRisk} need attention</p>
          </div>
          <Link to="/app/rescue" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#e6b65f] bg-[#fff9ed] px-3 text-xs font-bold text-[#8a641e]">
            Rescue <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#e6f0e8]">
          <span className="w-[8%] bg-[#ee5c63]" />
          <span className="w-[12%] bg-[#ff9d3d]" />
          <span className="w-[20%] bg-[#ffd34e]" />
          <span className="flex-1 bg-[#62c877]" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-[#6f8b95]">
          <span><i className="mr-1 inline-block size-2 rounded-full bg-[#ee5c63]" />{expired} Expired</span>
          <span><i className="mr-1 inline-block size-2 rounded-full bg-[#ff9d3d]" />{items.filter((item) => item.freshness === 'rescue-today').length} Today</span>
          <span><i className="mr-1 inline-block size-2 rounded-full bg-[#ffd34e]" />{items.filter((item) => item.freshness === 'use-soon').length} Soon</span>
          <span><i className="mr-1 inline-block size-2 rounded-full bg-[#62c877]" />{items.filter((item) => item.freshness === 'fresh').length} Fresh</span>
        </div>
      </section>

      <section className="flex gap-2">
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[#b8d4df] bg-white px-4 text-[#6f7760]">
          <Search size={19} />
          <span className="sr-only">Search food</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search milk, chicken, rice..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#193b5a] outline-none placeholder:text-[#9a9a85]"
          />
        </label>
        <Link to="/app/add-food" aria-label="Scan food" title="Scan food" className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#e6b65f] bg-[#fff9ed] text-[#8a641e]">
          <QrCode size={21} />
        </Link>
      </section>

      {dinnerIdea && (
        <section className="flex items-center gap-3 rounded-[1.25rem] bg-[#193b5a] p-3 text-white shadow-[0_10px_20px_rgba(66,106,90,0.18)]">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ffe167] text-[#193b5a]">
            <ChefHat size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#ffe167]">Dinner idea</p>
            <p className="mt-1 text-sm font-bold leading-5">Use your {dinnerIdea.name} before {dinnerIdea.expires.toLowerCase()}. Make a quick rescue meal.</p>
          </div>
          <Link to="/app/recipes" className="hidden shrink-0 rounded-xl bg-[#ffe167] px-3 py-2 text-xs font-black text-[#193b5a] sm:block">View recipes</Link>
        </section>
      )}

      <section className="space-y-3">
        <StorageTabs value={location} onChange={setLocation} />
        {loading ? (
          <div className="rounded-3xl border border-[#c6dde5] bg-white p-10 text-center text-[#6f7760]">Loading your kitchen...</div>
        ) : visibleItems.length ? (
          <Fridge items={visibleItems} location={location} />
        ) : (
          <div className="rounded-3xl border border-dashed border-[#b8d4df] bg-white p-10 text-center text-[#6f7760]">
            {query ? `No items matching "${query}".` : 'Nothing here yet. Add your first food item.'}
          </div>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2" aria-label="Kitchen impact">
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-black text-[#193b5a]">{atRisk}</p>
          <p className="mt-1 text-[10px] font-bold text-[#6f8b95]">At risk</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-black text-[#193b5a]">{items.length}</p>
          <p className="mt-1 text-[10px] font-bold text-[#6f8b95]">In kitchen</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-black text-[#193b5a]">{expired}</p>
          <p className="mt-1 text-[10px] font-bold text-[#6f8b95]">Expired</p>
        </div>
      </section>
    </div>
  )
}
