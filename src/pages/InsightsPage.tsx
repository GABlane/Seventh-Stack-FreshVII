import { CircleDollarSign, Lightbulb, PackageOpen, ShoppingBasket, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useFoodItems } from '../hooks/useFoodItems'
import { useImpactEvents } from '../hooks/useImpactEvents'

const chartValues = [1.4, 1.2, 1.3, 0.9, 1, 0.8]
const chartLabels = ['Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14', 'This wk']
const fallbackForgotten = [
  { name: 'Lettuce', detail: 'approx. P260 lost - buy half heads', badge: 'Expired 4 x', accent: 'bg-[#d9f5d8]' },
  { name: 'Bread', detail: 'approx. P216 lost - freeze half the loaf', badge: 'Expired 3 x', accent: 'bg-[#fff0dc]' },
  { name: 'Greek Yogurt', detail: 'approx. P225 lost - buy smaller cups', badge: 'Expired 3 x', accent: 'bg-[#f4e8fa]' },
]
const fallbackPurchased = [
  { name: 'Milk', count: 9, icon: 'bg-[#e8f7fa]' },
  { name: 'Eggs', count: 7, icon: 'bg-[#fff8d8]' },
  { name: 'Chicken Breast', count: 6, icon: 'bg-[#ffe9e8]' },
  { name: 'Rice', count: 4, icon: 'bg-[#fff0dc]' },
]

export function InsightsPage() {
  const { items, isLoading: foodLoading, error: foodError } = useFoodItems()
  const { events, isLoading: eventsLoading, error: eventsError } = useImpactEvents()
  const expiredItems = items.filter((item) => item.freshness === 'expired')
  const savedCount = events.filter((event) => event.type === 'ingredient-rescued' || event.type === 'meal-prepared').length
  const wastedCount = expiredItems.length
  const foodWasted = expiredItems.reduce((total, item) => total + item.quantity, 0)
  const moneyWasted = Math.round(foodWasted * 120)
  const forgottenItems = expiredItems.length > 0 ? expiredItems.slice(0, 3).map((item) => ({ name: item.name, detail: 'Review this item before your next grocery run', badge: 'Expired', accent: 'bg-[#e8f7fa]' })) : fallbackForgotten
  const purchasedItems = fallbackPurchased
  const loading = foodLoading || eventsLoading
  const error = foodError || eventsError

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-4 bg-[#eefafd] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:space-y-6 sm:px-8 sm:py-8">
    <header className="flex items-start justify-between gap-3">
      <div><h1 className="text-[2rem] font-black leading-none tracking-[-0.04em] text-[#14384a]">Insights</h1><p className="mt-2 text-sm font-semibold text-[#477d8d]">Sep 21 - 27 · this week</p></div>
      <div className="flex overflow-hidden rounded-xl border border-[#cde6ed] bg-white text-xs font-black text-[#145d72] shadow-sm"><button type="button" className="bg-[#e8f7fa] px-3 py-2">Week</button><button type="button" className="px-3 py-2">Month</button></div>
    </header>
    {error && <p role="alert" className="rounded-2xl bg-[#fff0ef] p-4 text-sm text-[#ad4147]">{error}</p>}
    {loading ? <div className="rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-[#5e7f8b]">Building your insights...</div> : <>
      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="Food wasted" value={`${foodWasted.toFixed(1)} kg`} note="down 0.2 kg vs last week" icon={<Trash2 size={14} />} />
        <MetricCard label="Money wasted" value={`P${moneyWasted}`} note="up P30 vs last week" icon={<CircleDollarSign size={14} />} />
        <MetricCard label="Items discarded" value={String(wastedCount)} note="down 1 vs last week" icon={<PackageOpen size={14} />} />
        <MetricCard label="Food saved" value={`${(savedCount || 3.3).toFixed(1)} kg`} note="up 0.4 kg vs last week" icon={<ShoppingBasket size={14} />} />
      </section>
      <section className="rounded-2xl border border-[#d7e4e8] bg-white p-4 shadow-[0_5px_14px_rgba(31,78,93,0.05)]"><div className="flex items-center justify-between"><h2 className="font-black text-[#173d4e]">Food wasted (kg)</h2><p className="text-xs font-bold text-[#145d72]">down 0.2 kg vs last week</p></div><div className="mt-5 flex h-40 items-end gap-2 border-b border-[#d7e4e8] px-1 sm:gap-4">{chartValues.map((value, index) => <div key={chartLabels[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="text-[10px] font-bold text-[#173d4e]">{value}</div><div className={`w-full max-w-8 rounded-t-md ${index === chartValues.length - 1 ? 'bg-[#20bed0]' : 'bg-[#9fe4eb]'}`} style={{ height: `${value / 1.4 * 72}%` }} /><span className="whitespace-nowrap text-[9px] text-[#477d8d]">{chartLabels[index]}</span></div>)}</div></section>
      <section className="rounded-2xl bg-[#d9f5f8] p-4"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-[#173d4e]">This week</h2><span className="text-xs font-black text-[#145d72]">Weekly recap</span></div><ul className="mt-3 space-y-2 text-sm font-semibold text-[#145d72]"><li>● &nbsp;{savedCount || 5} items were saved from expiring.</li><li>● &nbsp;{wastedCount || 2} items expired.</li><li>● &nbsp;{foodWasted.toFixed(1)} kg of food was wasted.</li><li>● &nbsp;P{moneyWasted || 120} estimated value wasted.</li></ul><div className="mt-4 rounded-2xl bg-white p-3"><p className="text-xs font-black text-[#173d4e]">Before your next grocery run, check these items:</p><div className="mt-3 flex flex-wrap gap-2">{forgottenItems.slice(0, 4).map((item) => <span key={item.name} className="rounded-full bg-[#e8f7fa] px-2.5 py-1 text-xs font-bold text-[#145d72]">{item.name}</span>)}</div><Link to="/app/rescue" className="mt-3 inline-flex h-9 items-center rounded-xl bg-[#20bed0] px-3 text-xs font-black text-[#063e4d]">Review food</Link></div></section>
      <section className="rounded-2xl border border-[#d7e4e8] bg-white p-4 shadow-[0_5px_14px_rgba(31,78,93,0.05)]"><div className="flex items-center justify-between"><h2 className="font-black text-[#173d4e]">Often forgotten</h2><span className="text-xs font-bold text-[#6f8b95]">expired before eaten</span></div><div className="mt-3 space-y-3">{forgottenItems.map((item) => <div key={item.name} className="flex items-center gap-3"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.accent}`}><Lightbulb size={18} className="text-[#4f8ca3]" /></span><div className="min-w-0 flex-1"><p className="font-black text-[#173d4e]">{item.name}</p><p className="text-xs leading-4 text-[#477d8d]">{item.detail}</p></div><span className="shrink-0 rounded-full bg-[#ffd9d8] px-2.5 py-1 text-[10px] font-black text-[#c52e31]">{item.badge}</span></div>)}</div></section>
      <section className="rounded-2xl border border-[#d7e4e8] bg-white p-4 shadow-[0_5px_14px_rgba(31,78,93,0.05)]"><div className="flex items-center justify-between"><h2 className="font-black text-[#173d4e]">Most purchased</h2><span className="text-xs font-bold text-[#6f8b95]">last 30 days</span></div><div className="mt-3 space-y-3">{purchasedItems.map((item, index) => <div key={item.name} className="flex items-center gap-2"><span className="w-4 text-xs font-bold text-[#173d4e]">{index + 1}</span><span className={`flex size-8 items-center justify-center rounded-lg ${item.icon}`}><ShoppingBasket size={16} className="text-[#4f8ca3]" /></span><div className="min-w-0 flex-1"><div className="flex justify-between text-xs font-black text-[#173d4e]"><span>{item.name}</span><span>{item.count}x</span></div><div className="mt-1 h-1.5 rounded-full bg-[#d9eef3]"><div className="h-full rounded-full bg-[#20bed0]" style={{ width: `${item.count / 9 * 100}%` }} /></div></div></div>)}</div></section>
    </>}
  </div>
}

function MetricCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: ReactNode }) {
  return <article className="rounded-2xl border border-[#d7e4e8] bg-white p-3 shadow-[0_5px_14px_rgba(31,78,93,0.05)]"><div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#173d4e]"><span className="text-[#20bed0]">{icon}</span>{label}</div><p className="mt-1 text-2xl font-black leading-none text-[#173d4e]">{value}</p><p className="mt-2 text-[10px] font-semibold text-[#173d4e]">{note}</p></article>
}
