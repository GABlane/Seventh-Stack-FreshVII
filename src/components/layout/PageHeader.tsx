import { AlertTriangle, Bell, LogOut, Settings, Snowflake, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTheme } from '../../hooks/useTheme'
import { logout } from '../../firebase/services/auth.service'
import { useFoodItems } from '../../hooks/useFoodItems'
import { useImpactEvents } from '../../hooks/useImpactEvents'
import freshlyLogo from '../../assets/freshly-light-background.png'

export function PageHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()
  const { palette: selectedPalette } = useTheme()
  const { items } = useFoodItems()
  const { events } = useImpactEvents()
  const expiryItems = items.filter((item) => item.quantity > 0 && ['rescue-today', 'use-soon', 'expired'].includes(item.freshness)).slice(0, 5)
  const lifecycleEvents = events.filter((event) => ['product-added', 'food-consumed', 'moved-to-freezer', 'food-opened'].includes(event.type)).slice(0, 5)
  const alertCount = items.filter((item) => item.quantity > 0 && ['rescue-today', 'use-soon', 'expired'].includes(item.freshness)).length + lifecycleEvents.length
  function eventTitle(type: string) {
    if (type === 'product-added') return 'New food added'
    if (type === 'food-consumed') return 'Food consumed'
    if (type === 'moved-to-freezer') return 'Moved to freezer'
    return 'Food opened'
  }

  function eventIcon(type: string) {
    return type === 'moved-to-freezer' ? Snowflake : type === 'product-added' || type === 'food-opened' ? Utensils : Bell
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  return <header className="border-b-2" style={{ backgroundColor: selectedPalette.header, borderBottom: `3px solid ${selectedPalette.border}` }}>
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <img src={freshlyLogo} alt="Freshly" className="h-7 w-auto max-w-[8rem] object-contain sm:h-8" />
      <div className="flex items-center gap-2">
        <div className="relative">
          <button type="button" aria-label={`Notifications${alertCount ? `, ${alertCount} active` : ''}`} title="Notifications" aria-expanded={isOpen} onClick={() => { setIsOpen((open) => !open); setIsSettingsOpen(false) }} className="relative flex size-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-white" style={{ color: selectedPalette.accent }}><Bell size={19} />{alertCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-[#d94444] px-1 text-[10px] font-black leading-4 text-white">{alertCount > 9 ? '9+' : alertCount}</span>}</button>
          {isOpen && <div className="absolute right-0 top-12 z-20 w-80 overflow-hidden rounded-2xl border border-[#c6dde5] bg-white shadow-[0_14px_35px_rgba(70,67,52,0.16)]">
            <div className="flex items-center justify-between border-b border-[#eeeade] px-4 py-3"><p className="font-bold">Notifications</p><span className="text-xs font-semibold text-stone-400">{alertCount} active</span></div>
            <div className="max-h-80 overflow-y-auto">
              {expiryItems.map((item) => {
                const message = item.freshness === 'expired' ? `Expired: ${item.name}` : `Use ${item.name} soon`
                return (
                  <Link key={`expiry-${item.id}`} to={`/app/food/${item.id}`} onClick={() => setIsOpen(false)} className="flex gap-3 border-b border-[#f1efe6] px-4 py-3 hover:bg-[#eaf8fa]">
                    <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#d94444]" />
                    <span className="min-w-0">
                      <strong className="block truncate text-sm">{message}</strong>
                      <span className="block text-xs text-stone-500">{item.quantity} {item.unit} remaining - {item.expires}</span>
                    </span>
                  </Link>
                )
              })}
              {lifecycleEvents.map((event) => { const Icon = eventIcon(event.type); return <Link key={event.id} to="/app/notifications" onClick={() => setIsOpen(false)} className="flex gap-3 border-b border-[#f1efe6] px-4 py-3 hover:bg-[#eaf8fa]"><Icon size={17} className="mt-0.5 shrink-0 text-[#193b5a]" /><span className="min-w-0"><strong className="block truncate text-sm">{eventTitle(event.type)}</strong><span className="block truncate text-xs text-stone-500">{event.label ?? 'Your kitchen was updated.'}</span></span></Link> })}
              {alertCount === 0 && <p className="px-4 py-8 text-center text-sm text-stone-500">You are all caught up.</p>}
            </div>
            <Link to="/app/notifications" onClick={() => setIsOpen(false)} className="block border-t border-[#eeeade] px-4 py-3 text-center text-sm font-bold text-[#193b5a] hover:bg-[#eaf8fa]">View all notifications</Link>
          </div>}
        </div>
        <div className="relative">
          <button type="button" aria-label="Settings" title="Settings" aria-haspopup="menu" aria-expanded={isSettingsOpen} onClick={() => { setIsSettingsOpen((open) => !open); setIsOpen(false) }} className="flex size-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-white" style={{ color: selectedPalette.accent }}><Settings size={19} /></button>
          {isSettingsOpen && <div role="menu" aria-label="Settings menu" className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-2xl border border-[#c6dde5] bg-white shadow-[0_14px_35px_rgba(70,67,52,0.16)]">
            <div className="border-b border-[#eeeade] px-4 py-3"><p className="font-bold text-stone-800">Preferences</p><p className="mt-1 text-xs text-stone-500">Personalize your Freshly experience.</p></div>
            <Link to="/app/settings" onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#193b5a] hover:bg-[#eaf8fa]"><Settings size={16} /> Account settings</Link>
            <button type="button" disabled={isSigningOut} onClick={handleSignOut} className="flex w-full items-center gap-2 border-t border-[#eeeade] px-4 py-3 text-left text-sm font-bold text-[#b84f49] hover:bg-[#fff0ef] disabled:cursor-wait disabled:opacity-60"><LogOut size={16} /> {isSigningOut ? 'Signing out...' : 'Log out'}</button>
          </div>}
        </div>
      </div>
    </div>
  </header>
}
