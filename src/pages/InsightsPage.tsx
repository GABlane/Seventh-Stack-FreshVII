import { CalendarDays, Clock3, Leaf, ShoppingBasket, Trash2, Utensils } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { useFoodContext } from '../context/FoodContext'
import type { FoodEvent, FoodItemRecord } from '../domain/food'
import { computeInsights } from '../domain/insights'
import { FoodIcon } from '../lib/food-icons'

const number = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)
const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
// Weights are estimated from mixed units, so they are shown as approximate.
const kg = (value: number) => value <= 0 ? '0 kg' : value < 0.1 ? '<0.1 kg' : `${value >= 10 ? Math.round(value) : value.toFixed(1)} kg`

type Quantity = { value: number; unit: string }

function eventQuantity(event: FoodEvent, item?: FoodItemRecord): Quantity {
  if (event.type === 'discarded') return { value: Math.abs(Number(event.quantityBefore ?? item?.quantity ?? 0)), unit: item?.unit ?? 'item' }
  if (event.type === 'consumed') return { value: Math.abs(Number(event.quantityChange ?? 0)), unit: item?.unit ?? 'item' }
  return { value: Math.abs(Number(event.quantityAfter ?? 0)), unit: item?.unit ?? 'item' }
}

function Metric({ label, value, detail, icon, tone = 'blue' }: { label: string; value: string; detail: string; icon: React.ReactNode; tone?: 'blue' | 'red' | 'green' }) {
  return <Card className="border-[#cde6ed] shadow-none"><CardContent className="p-3"><div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.16em] ${tone === 'red' ? 'text-[#ee5c63]' : tone === 'green' ? 'text-[#426a5a]' : 'text-[#145d72]'}`}>{icon}{label}</div><p className="mt-2 text-lg font-black text-[#173d4e]">{value}</p><p className="mt-1 text-[9px] text-[#6f8b95]">{detail}</p></CardContent></Card>
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-[#e8f7fa] px-3 py-2 text-xs font-semibold text-[#6f8b95]">{children}</div>
}

export function InsightsPage() {
  const { items, rawItems, events, loading } = useFoodContext()
  const byId = useMemo(() => new Map(rawItems.map((item) => [item.id, item])), [rawItems])
  const insights = useMemo(() => computeInsights(rawItems, events), [rawItems, events])
  const { week } = insights
  const consumedEvents = events.filter((event) => event.type === 'consumed')
  const discardedEvents = events.filter((event) => event.type === 'discarded')

  const consumed = new Map<string, Quantity & { id: string; name: string; category: string }>()
  consumedEvents.forEach((event) => {
    const item = byId.get(event.foodItemId); const quantity = eventQuantity(event, item); const previous = consumed.get(event.foodItemId)
    consumed.set(event.foodItemId, { id: event.foodItemId, name: item?.name ?? 'Unknown food', category: item?.category ?? 'Pantry', unit: quantity.unit, value: (previous?.value ?? 0) + quantity.value })
  })
  const mostConsumed = [...consumed.values()].sort((a, b) => b.value - a.value).slice(0, 4)
  const largestConsumed = mostConsumed[0]?.value ?? 1

  const mostPurchased = insights.mostPurchased
  const consumedIds = new Set(consumed.keys())
  const forgotten = items.filter((item) => !consumedIds.has(item.id)).sort((a, b) => a.dateAdded.localeCompare(b.dateAdded)).slice(0, 3)
  const discarded = discardedEvents.map((event) => ({ event, item: byId.get(event.foodItemId) })).filter(({ item }) => item).sort((a, b) => b.event.createdAt.localeCompare(a.event.createdAt)).slice(0, 3)
  const wastedCategories = insights.wasteByCategory.slice(0, 5)
  const largestWaste = wastedCategories[0]?.kg || 1
  const attentionItems = items.filter((item) => item.freshness === 'expired' || item.freshness === 'use-soon').slice(0, 3)

  if (loading) return <div className="w-full rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-sm font-semibold text-[#6f8b95]">Building your insights...</div>

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-4 bg-[#eefafd] px-5 py-5 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:space-y-5 sm:px-8 sm:py-8">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Metric label="Food wasted" value={kg(insights.wastedKg)} detail="estimated weight" icon={<Trash2 size={11} />} tone="red" />
      <Metric label="Money wasted" value={money(insights.wastedCost)} detail="price paid for discarded food" icon={<Trash2 size={11} />} tone="red" />
      <Metric label="Items discarded" value={String(insights.itemsDiscarded)} detail="thrown away" icon={<Trash2 size={11} />} tone="red" />
      <Metric label="Food saved" value={kg(insights.savedKg)} detail="eaten, estimated weight" icon={<Leaf size={11} />} tone="green" />
    </div>

    <section className="rounded-2xl border border-[#cde6ed] bg-white p-4 sm:p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-black text-[#173d4e]">Weekly recap</h2><p className="text-[10px] text-[#6f8b95]">The last 7 days.</p></div><CalendarDays size={16} className="text-[#145d72]" /></div><div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4"><MiniStat label="Items saved" value={String(week.itemsSaved)} /><MiniStat label="Items that expired" value={String(week.itemsExpired)} /><MiniStat label="Food wasted" value={kg(week.wastedKg)} /><MiniStat label="Est. value wasted" value={money(week.wastedCost)} /></div><p className="mt-3 text-[10px] font-bold text-[#173d4e]">Before your next grocery run, check these items:</p><div className="mt-2 space-y-1.5">{attentionItems.length ? attentionItems.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f7fcfd] px-3 py-2 text-[10px] font-bold text-[#173d4e]"><span className="flex items-center gap-2"><FoodIcon name={item.name} category={item.category} size={15} />{item.name}</span><span className="text-[9px] text-[#a76f00]">{item.freshness === 'expired' ? 'Expired' : item.expires}</span></div>) : <EmptyRow>Your kitchen is in good shape.</EmptyRow>}</div></section>

    <section className="rounded-2xl border border-[#cde6ed] bg-white p-4 sm:p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-black text-[#173d4e]">Most wasted categories</h2><p className="text-[10px] text-[#6f8b95]">Estimated weight of discarded food.</p></div><Trash2 size={16} className="text-[#ee5c63]" /></div><div className="mt-3 space-y-2">{wastedCategories.length ? wastedCategories.map((row) => <div key={row.category} className="flex items-center gap-3 text-[10px] font-bold text-[#173d4e]"><span className="w-20 shrink-0">{row.category}</span><div className="h-3 flex-1 rounded-sm bg-[#e8f7fa]"><div className="h-full rounded-sm bg-[#145d72]" style={{ width: `${Math.max(3, row.kg / largestWaste * 100)}%` }} /></div><span className="w-24 text-[9px] text-[#6f8b95]">{kg(row.kg)} · {row.items} item{row.items === 1 ? '' : 's'}</span></div>) : <EmptyRow>No discarded categories yet.</EmptyRow>}</div></section>

    <div className="grid gap-4 lg:grid-cols-2"><InsightList title="Most consumed" description="Based on logged consumption." icon={<Utensils size={16} />}>
      {mostConsumed.length ? mostConsumed.map((food) => <div key={food.id} className="flex items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#e8f7fa] text-[#145d72]"><FoodIcon name={food.name} category={food.category} size={14} /></span><div className="min-w-0 flex-1"><div className="flex justify-between gap-2 text-[10px] font-bold text-[#173d4e]"><span className="truncate">{food.name}</span><span>{number(food.value)} {food.unit}</span></div><Progress value={food.value / largestConsumed * 100} className="mt-1" /></div></div>) : <EmptyRow>No consumed food yet.</EmptyRow>}
    </InsightList><InsightList title="Most purchased" description="Foods you add to your kitchen most often." icon={<ShoppingBasket size={16} />}>
      {mostPurchased.length ? mostPurchased.map((food) => <div key={food.name} className="flex items-center justify-between rounded-xl bg-[#e8f7fa] px-3 py-2 text-[10px] font-bold text-[#173d4e]"><span className="flex items-center gap-2"><FoodIcon name={food.name} size={14} />{food.name}</span><span>{food.times} time{food.times === 1 ? '' : 's'}</span></div>) : <EmptyRow>No purchases recorded yet.</EmptyRow>}
    </InsightList></div>

    <div className="grid gap-4 lg:grid-cols-2"><InsightList title="Often forgotten" description="Food in your kitchen with the least use so far." icon={<Clock3 size={16} />}>
      {forgotten.length ? forgotten.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#e8f7fa] px-3 py-2 text-[10px] font-bold text-[#173d4e]"><span className="flex items-center gap-2"><FoodIcon name={item.name} category={item.category} size={14} />{item.name}</span><Leaf size={13} className="text-[#62c877]" /></div>) : <EmptyRow>Everything has been used recently.</EmptyRow>}
    </InsightList><InsightList title="Discarded food" description={`${discardedEvents.length} items thrown away, newest first.`} icon={<Trash2 size={16} />}>
      {discarded.length ? discarded.map(({ event, item }) => <div key={event.id} className="flex items-center gap-2 rounded-xl bg-[#e8f7fa] px-3 py-2 text-[10px] font-bold text-[#173d4e]"><FoodIcon name={item!.name} category={item!.category} size={14} />{item!.name}</div>) : <EmptyRow>No discarded food yet.</EmptyRow>}
    </InsightList></div>
  </div>
}

function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#e8f7fa] px-3 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#6f8b95]">{label}</p><p className="mt-1 text-sm font-black text-[#173d4e]">{value}</p></div> }

function InsightList({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#cde6ed] bg-white p-4 sm:p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-black text-[#173d4e]">{title}</h2><p className="text-[10px] text-[#6f8b95]">{description}</p></div><span className="text-[#145d72]">{icon}</span></div><div className="mt-3 space-y-2">{children}</div></section> }
