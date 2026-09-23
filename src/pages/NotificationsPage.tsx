import { AlertTriangle, ArrowLeft, Bell, BellRing, Clock3, Snowflake, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { FreshnessBadge } from '../components/food/FreshnessBadge'
import { useFoodItems } from '../hooks/useFoodItems'
import { useImpactEvents } from '../hooks/useImpactEvents'

const eventLabels = {
  'product-added': { title: 'New food added', Icon: Utensils },
  'food-consumed': { title: 'Food consumed', Icon: Utensils },
  'moved-to-freezer': { title: 'Food moved to freezer', Icon: Snowflake },
  'food-opened': { title: 'Food opened', Icon: Utensils },
} as const

export function NotificationsPage() {
  const { items, isLoading, error } = useFoodItems()
  const { events, error: eventsError } = useImpactEvents()
  const [permission, setPermission] = useState<NotificationPermission>(() => typeof Notification === 'undefined' ? 'denied' : Notification.permission)
  const urgent = items.filter((item) => item.quantity > 0 && (item.freshness === 'rescue-today' || item.freshness === 'use-soon')).sort((a, b) => b.rescueScore - a.rescueScore)
  const lifecycleEvents = events.filter((event) => event.type in eventLabels)
  const notifications = [...lifecycleEvents.map((event) => ({ id: event.id, title: eventLabels[event.type as keyof typeof eventLabels].title, body: event.label ?? 'Your kitchen was updated.', createdAt: event.createdAt, Icon: eventLabels[event.type as keyof typeof eventLabels].Icon, href: '/app' })), ...urgent.map((item) => ({ id: `expiry-${item.id}`, title: `Use ${item.name} soon`, body: `${item.quantity} ${item.unit} remaining - ${item.expires}.`, createdAt: new Date().toISOString(), Icon: AlertTriangle, href: `/app/food/${item.id}`, item }))].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  async function enableNotifications() {
    if (!('Notification' in window)) return
    const nextPermission = await Notification.requestPermission()
    setPermission(nextPermission)
    if (nextPermission === 'granted' && urgent[0]) new Notification(`Use ${urgent[0].name} soon`, { body: `${urgent[0].quantity} ${urgent[0].unit} remaining - ${urgent[0].expires}.` })
  }

  return <div className="w-full max-w-3xl space-y-8">
    <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
    <div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]"><Bell size={16} /> Notifications</p><h1 className="mt-2 text-4xl font-black tracking-tight">Kitchen alerts</h1><p className="mt-3 text-stone-600">New food, consumption, freezer, and near-expiry updates in one place.</p></div>
    <section className="flex flex-col gap-4 rounded-3xl bg-[#dce9de] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">Get browser reminders</p><p className="mt-1 text-sm leading-6 text-[#426a5a]">Allow notifications for an alert when food is approaching its estimated expiry.</p></div><button type="button" onClick={enableNotifications} disabled={permission === 'granted'} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#426a5a] px-4 text-sm font-bold text-white transition-colors hover:bg-[#355747] disabled:cursor-not-allowed disabled:opacity-60"><BellRing size={17} /> {permission === 'granted' ? 'Notifications on' : permission === 'denied' ? 'Permission blocked' : 'Enable notifications'}</button></section>
    {(error || eventsError) && <p role="alert" className="rounded-2xl bg-[#f9ddd9] p-4 text-sm text-[#7c3733]">Some notifications are temporarily unavailable.</p>}
    {isLoading ? <div className="rounded-3xl border border-[#e5e1d5] bg-white p-10 text-center text-stone-500">Checking your kitchen...</div> : notifications.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8d1c0] bg-white p-10 text-center"><Bell size={24} className="mx-auto text-[#426a5a]" /><p className="mt-4 font-bold text-stone-800">You are all caught up.</p><p className="mt-2 text-sm text-stone-500">New updates will appear here when your kitchen changes.</p></div> : <section className="space-y-3"><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-stone-500"><Clock3 size={16} className="text-[#b84f49]" /> {notifications.length} notification{notifications.length === 1 ? '' : 's'}</div>{notifications.map((notification) => <Link key={notification.id} to={notification.href} className="flex items-center gap-4 rounded-3xl border border-[#e5e1d5] bg-white p-4 transition-transform hover:-translate-y-0.5"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f9ddd9] text-[#b84f49]"><notification.Icon size={20} /></div><div className="min-w-0 flex-1"><h2 className="font-bold">{notification.title}</h2><p className="mt-1 text-sm text-stone-500">{notification.body}</p>{'item' in notification && notification.item && <div className="mt-2"><FreshnessBadge state={notification.item.freshness} /></div>}</div></Link>)}</section>}
  </div>
}
