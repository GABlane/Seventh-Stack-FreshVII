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
  const urgent = items.filter((item) => item.quantity > 0 && ['rescue-today', 'use-soon', 'expired'].includes(item.freshness)).sort((a, b) => b.rescueScore - a.rescueScore)
  const lifecycleEvents = events.filter((event) => event.type in eventLabels)
  const notifications = [...lifecycleEvents.map((event) => ({ id: event.id, title: eventLabels[event.type as keyof typeof eventLabels].title, body: event.label ?? 'Your kitchen was updated.', createdAt: event.createdAt, Icon: eventLabels[event.type as keyof typeof eventLabels].Icon, href: '/app' })), ...urgent.map((item) => ({
    id: `expiry-${item.id}`,
    title: item.freshness === 'expired' ? `Expired: ${item.name}` : `Use ${item.name} soon`,
    body: `${item.quantity} ${item.unit} remaining - ${item.expires}.`,
    createdAt: new Date().toISOString(),
    Icon: AlertTriangle,
    href: `/app/food/${item.id}`,
    item,
  }))].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  async function enableNotifications() {
    if (!('Notification' in window)) return
    const nextPermission = await Notification.requestPermission()
    setPermission(nextPermission)
    if (nextPermission === 'granted' && urgent[0]) {
      const urgentTitle = urgent[0].freshness === 'expired' ? `Expired: ${urgent[0].name}` : `Use ${urgent[0].name} soon`
      new Notification(urgentTitle, { body: `${urgent[0].quantity} ${urgent[0].unit} remaining - ${urgent[0].expires}.` })
    }
  }

  return <div className="w-full max-w-3xl space-y-8">
    <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#145d72]"><ArrowLeft size={16} /> Back to kitchen</Link>
    <div>
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#4f8ca3]"><Bell size={16} /> Notifications</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-[#173d4e]">Kitchen alerts</h1>
      <p className="mt-3 text-[#477d8d]">New food, consumption, freezer, and near-expiry updates in one place.</p>
    </div>
    <section className="flex flex-col gap-4 rounded-3xl bg-[#eaf9fc] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold text-[#173d4e]">Get browser reminders</p>
        <p className="mt-1 text-sm leading-6 text-[#477d8d]">Allow notifications for an alert when food is approaching its estimated expiry.</p>
      </div>
      <button type="button" onClick={enableNotifications} disabled={permission === 'granted'} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#20bed0] px-4 text-sm font-bold text-[#063e4d] transition-colors hover:bg-[#0db3c8] disabled:cursor-not-allowed disabled:opacity-60"><BellRing size={17} /> {permission === 'granted' ? 'Notifications on' : permission === 'denied' ? 'Permission blocked' : 'Enable notifications'}</button>
    </section>
    {(error || eventsError) && <p role="alert" className="rounded-2xl bg-[#fff0ef] p-4 text-sm text-[#ad4147]">Some notifications are temporarily unavailable.</p>}
    {isLoading ? <div className="rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-[#6f8b95]">Checking your kitchen...</div> : notifications.length === 0 ? <div className="rounded-3xl border border-dashed border-[#cde6ed] bg-white p-10 text-center"><Bell size={24} className="mx-auto text-[#20bed0]" /><p className="mt-4 font-bold text-[#173d4e]">You are all caught up.</p><p className="mt-2 text-sm text-[#6f8b95]">New updates will appear here when your kitchen changes.</p></div> : <section className="space-y-3"><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#6f8b95]"><Clock3 size={16} className="text-[#20bed0]" /> {notifications.length} notification{notifications.length === 1 ? '' : 's'}</div>{notifications.map((notification) => <Link key={notification.id} to={notification.href} className="flex items-center gap-4 rounded-3xl border border-[#cde6ed] bg-white p-4 shadow-[0_4px_12px_rgba(20,93,114,0.04)] transition-transform hover:-translate-y-0.5"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf9fc] text-[#20bed0]"><notification.Icon size={20} /></div><div className="min-w-0 flex-1"><h2 className="font-bold text-[#173d4e]">{notification.title}</h2><p className="mt-1 text-sm text-[#6f8b95]">{notification.body}</p>{'item' in notification && notification.item && <div className="mt-2"><FreshnessBadge state={notification.item.freshness} /></div>}</div></Link>)}</section>}
  </div>
}
