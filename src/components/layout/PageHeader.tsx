import { AlertTriangle, Bell, Settings, Snowflake, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useFoodItems } from '../../hooks/useFoodItems'
import { useImpactEvents } from '../../hooks/useImpactEvents'

export function PageHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useFoodItems()
  const { events } = useImpactEvents()
  const expiryItems = items.filter((item) => item.quantity > 0 && (item.freshness === 'rescue-today' || item.freshness === 'use-soon')).slice(0, 5)
  const lifecycleEvents = events.filter((event) => ['product-added', 'food-consumed', 'moved-to-freezer', 'food-opened'].includes(event.type)).slice(0, 5)
  const alertCount = items.filter((item) => item.quantity > 0 && (item.freshness === 'rescue-today' || item.freshness === 'use-soon')).length + lifecycleEvents.length

  function eventTitle(type: string) {
    if (type === 'product-added') return 'New food added'
    if (type === 'food-consumed') return 'Food consumed'
    if (type === 'moved-to-freezer') return 'Moved to freezer'
    return 'Food opened'
  }

  function eventIcon(type: string) {
    return type === 'moved-to-freezer' ? Snowflake : type === 'product-added' || type === 'food-opened' ? Utensils : Bell
  }

  return <header className="border-b border-[#e5e1d5] bg-[#f8f7f2]">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <span className="text-sm font-black tracking-[0.18em] text-[#426a5a]">FRESHVII</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button type="button" aria-label={`Notifications${alertCount ? `, ${alertCount} active` : ''}`} title="Notifications" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className="relative flex size-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-white hover:text-[#426a5a]"><Bell size={19} />{alertCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-[#b84f49] px-1 text-[10px] font-black leading-4 text-white">{alertCount > 9 ? '9+' : alertCount}</span>}</button>
          {isOpen && <div className="absolute right-0 top-12 z-20 w-80 overflow-hidden rounded-2xl border border-[#e5e1d5] bg-white shadow-[0_14px_35px_rgba(70,67,52,0.16)]">
            <div className="flex items-center justify-between border-b border-[#eeeade] px-4 py-3"><p className="font-bold">Notifications</p><span className="text-xs font-semibold text-stone-400">{alertCount} active</span></div>
            <div className="max-h-80 overflow-y-auto">
              {expiryItems.map((item) => <Link key={`expiry-${item.id}`} to={`/app/food/${item.id}`} onClick={() => setIsOpen(false)} className="flex gap-3 border-b border-[#f1efe6] px-4 py-3 hover:bg-[#f8f7f2]"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#b84f49]" /><span className="min-w-0"><strong className="block truncate text-sm">Use {item.name} soon</strong><span className="block text-xs text-stone-500">{item.quantity} {item.unit} remaining - {item.expires}</span></span></Link>)}
              {lifecycleEvents.map((event) => { const Icon = eventIcon(event.type); return <Link key={event.id} to="/app/notifications" onClick={() => setIsOpen(false)} className="flex gap-3 border-b border-[#f1efe6] px-4 py-3 hover:bg-[#f8f7f2]"><Icon size={17} className="mt-0.5 shrink-0 text-[#426a5a]" /><span className="min-w-0"><strong className="block truncate text-sm">{eventTitle(event.type)}</strong><span className="block truncate text-xs text-stone-500">{event.label ?? 'Your kitchen was updated.'}</span></span></Link> })}
              {alertCount === 0 && <p className="px-4 py-8 text-center text-sm text-stone-500">You are all caught up.</p>}
            </div>
            <Link to="/app/notifications" onClick={() => setIsOpen(false)} className="block border-t border-[#eeeade] px-4 py-3 text-center text-sm font-bold text-[#426a5a] hover:bg-[#f8f7f2]">View all notifications</Link>
          </div>}
        </div>
        <Link to="/app/settings" aria-label="Account settings" title="Account settings" className="flex size-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-white hover:text-[#426a5a]"><Settings size={19} /></Link>
      </div>
    </div>
  </header>
}
