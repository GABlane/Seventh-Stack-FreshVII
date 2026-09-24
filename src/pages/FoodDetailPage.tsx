import { ArrowLeft, CalendarDays, Check, Snowflake, Trash2, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { FreshnessBadge } from '../components/food/FreshnessBadge'
import { FreshnessProgress } from '../components/food/FreshnessProgress'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'
import { storageZones, zoneForShelfKey } from '../lib/storage-zones'

const wholeUnits = new Set(['piece', 'bag', 'pack', 'tub'])

export function FoodDetailPage() {
  const { foodId } = useParams()
  const { items, rawItems, events, loading, openItem, freezeItem, consumeItem, discardItem, moveItem } = useFoodContext()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [amount, setAmount] = useState('')
  const [choosingAmount, setChoosingAmount] = useState(false)
  const [shelfKey, setShelfKey] = useState<string | null>(null)
  const item = items.find((food) => food.id === foodId)
  const archived = rawItems.find((food) => food.id === foodId && food.status !== 'active')

  async function run(action: () => Promise<void>) {
    setError(''); setSaving(true)
    try { await action() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update this food.') } finally { setSaving(false) }
  }

  async function confirmConsumption() {
    if (!item) return
    const used = Number(amount)
    if (!Number.isFinite(used) || used <= 0 || used > item.quantity) { setError(`Enter an amount between 0 and ${item.quantity} ${item.unit}.`); return }
    await run(async () => { await consumeItem(item.id, used); setChoosingAmount(false) })
  }

  if (loading) return <div className="w-full rounded-3xl border border-[#c6dde5] bg-white p-10 text-center text-stone-500">Loading food details...</div>
  if (!item && archived?.status === 'consumed') {
    const event = events.filter((entry) => entry.foodItemId === archived.id && entry.type === 'consumed').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    const used = Math.abs(Number(event?.quantityChange ?? archived.initialQuantity ?? archived.quantity))
    return <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-[2rem] border border-[#d9eef3] bg-white px-6 py-12 text-center shadow-[0_12px_30px_rgba(66,106,90,0.08)]"><span className="flex size-20 items-center justify-center rounded-full bg-[#d9eef3] text-[#193b5a]"><Check size={40} strokeWidth={3} /></span><p className="mt-6 text-xs font-black uppercase tracking-[0.15em] text-[#193b5a]">Kitchen updated</p><h1 className="mt-2 text-3xl font-black text-[#193b5a]">Consumed</h1><p className="mt-3 text-sm font-medium text-[#6f8b95]">You used {used} {archived.unit} of {archived.name}.</p><Link to="/app" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#193b5a] px-4 py-3 text-sm font-bold text-white"><ArrowLeft size={16} /> Back to kitchen</Link></div>
  }
  if (!item) return <div className="space-y-4"><h1 className="text-3xl font-black">Food item not found</h1><Link to="/app" className="text-sm font-bold text-[#193b5a]">Back to kitchen</Link></div>

  const targetShelf = shelfKey ?? item.shelfKey
  const target = zoneForShelfKey(targetShelf)
  return <div className="w-full max-w-4xl space-y-8"><Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#193b5a]"><ArrowLeft size={16} /> Back to kitchen</Link><section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="flex min-h-64 items-center justify-center rounded-[2rem]" style={{ backgroundColor: item.accent }}><Utensils size={80} className="text-[#193b5a]/70" /></div><div className="rounded-[2rem] border border-[#c6dde5] bg-white p-6 sm:p-8"><div className="flex justify-between gap-3"><p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">{item.category}</p><FreshnessBadge state={item.freshness} /></div><h1 className="mt-3 text-4xl font-black text-[#193b5a]">{item.name}</h1><p className="mt-3 text-stone-600">{item.quantity} {item.unit} · {item.shelf} · {item.opened ? 'Opened' : 'Sealed'}</p><div className="mt-6"><FreshnessProgress value={item.freshnessPercentage} state={item.freshness} /></div><div className="mt-8 grid grid-cols-2 gap-3"><Info icon={<CalendarDays size={18} />} label="Best used" value={item.expires} /><Info icon={<Snowflake size={18} />} label="Rescue score" value={`${item.rescueScore}/100`} /></div>{error && <p role="alert" className="mt-5 rounded-xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#d94444]">{error}</p>}<div className="mt-7 flex flex-wrap gap-3"><Button disabled={saving} onClick={() => { setAmount(String(item.quantity)); setChoosingAmount(true) }} className="bg-[#193b5a] text-white hover:bg-[#193b5a]"><Utensils size={17} /> Mark consumed</Button><Button disabled={saving || item.location === 'freezer'} onClick={() => void run(() => freezeItem(item.id))} variant="outline"><Snowflake size={17} /> {item.location === 'freezer' ? 'In freezer' : 'Freeze it'}</Button><Button disabled={saving} onClick={() => void run(() => discardItem(item.id))} variant="destructive"><Trash2 size={17} /> Discard</Button></div>{choosingAmount && <div className="mt-4 rounded-2xl border border-[#bdebf0] bg-[#eaf8fa] p-4"><p className="font-black text-[#193b5a]">How much did you consume?</p><div className="mt-3 flex gap-2"><input type="number" min={wholeUnits.has(item.unit) ? 1 : 0.01} max={item.quantity} step={wholeUnits.has(item.unit) ? 1 : 0.01} value={amount} onChange={(event) => setAmount(event.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-[#bdebf0] bg-white px-3 font-bold outline-none" /><span className="flex items-center text-sm font-bold text-[#5b7086]">{item.unit}</span><Button disabled={saving} onClick={() => void confirmConsumption()} className="bg-[#193b5a] text-white"><Check size={16} /> Confirm</Button></div></div>}{!item.opened && <Button disabled={saving} onClick={() => void run(() => openItem(item.id))} variant="outline" className="mt-3 w-full">Mark as opened</Button>}<div className="mt-6 rounded-2xl bg-[#d9eef3] p-4"><p className="font-black text-[#193b5a]">Move in your kitchen</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><select value={targetShelf} onChange={(event) => setShelfKey(event.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-[#bdebf0] bg-white px-3 text-sm font-bold text-[#193b5a]">{Object.entries(storageZones).map(([location, zones]) => <optgroup key={location} label={location}>{zones.map((zone) => <option key={zone.key} value={zone.key}>{zone.label}</option>)}</optgroup>)}</select><Button disabled={saving || (target?.location === item.location && targetShelf === item.shelfKey)} onClick={() => void run(() => moveItem(item.id, targetShelf))} className="bg-[#193b5a] text-white">Move item</Button></div></div></div></section></div>
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-[#eaf8fa] p-4 text-[#193b5a]"><span>{icon}</span><p className="mt-3 text-xs font-bold uppercase text-stone-500">{label}</p><p className="mt-1 font-bold text-[#193b5a]">{value}</p></div>
}
