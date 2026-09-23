import { ArrowLeft, CalendarDays, Check, Snowflake, Trash2, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { FreshnessBadge } from '../components/food/FreshnessBadge'
import { FreshnessProgress } from '../components/food/FreshnessProgress'
import { Button } from '../components/ui/button'
import { consumeFoodItem, discardFoodItem, freezeFoodItem, markFoodOpened } from '../firebase/services/food.service'
import { useFoodItems } from '../hooks/useFoodItems'

export function FoodDetailPage() {
  const { foodId } = useParams()
  const { items, isLoading, error } = useFoodItems()
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const item = items.find((food) => food.id === foodId)

  async function runAction(action: () => Promise<void>) {
    setActionError('')
    setIsSaving(true)
    try {
      await action()
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : 'Unable to update this food.')
    } finally {
      setIsSaving(false)
    }
  }

  function useSome() {
    if (!item) return
    const entered = window.prompt(`How much ${item.unit} did you use?`, String(item.quantity))
    if (entered === null) return
    runAction(() => consumeFoodItem(item.id, Number(entered), item.quantity))
  }

  function consumeAll() {
    if (!item) return
    void runAction(() => consumeFoodItem(item.id, item.quantity, item.quantity))
  }

  if (isLoading) return <div className="w-full max-w-4xl rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-[#6f8b95]">Loading food details...</div>
  if (error) return <p role="alert" className="rounded-2xl bg-[#fff0ef] p-4 text-sm text-[#ad4147]">{error}</p>
  if (!item) return <div className="w-full max-w-4xl space-y-4"><h1 className="text-3xl font-black text-[#173d4e]">Food item not found</h1><p className="text-[#6f8b95]">This item may have been removed from your kitchen.</p><Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#145d72]"><ArrowLeft size={16} /> Back to kitchen</Link></div>

  return <div className="w-full max-w-4xl space-y-8">
    <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#145d72]"><ArrowLeft size={16} /> Back to kitchen</Link>
    <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="flex min-h-64 items-center justify-center rounded-[2rem]" style={{ backgroundColor: item.accent }}><Utensils size={80} className="text-stone-700/60" /></div>
      <div className="rounded-[2rem] border border-[#cde6ed] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6f8b95]">{item.category}</p><FreshnessBadge state={item.freshness} /></div>
        <h1 className="mt-3 text-4xl font-black text-[#173d4e]">{item.name}</h1>
        <p className="mt-3 text-[#6f8b95]">{item.quantity} {item.unit} - {item.location} - {item.opened ? 'Opened' : 'Sealed'}</p>
        <div className="mt-6"><FreshnessProgress value={item.freshnessPercentage} state={item.freshness} /></div>
        <div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#e8f7fa] p-4"><CalendarDays size={18} className="text-[#145d72]" /><p className="mt-3 text-xs font-bold uppercase text-[#6f8b95]">Best used</p><p className="mt-1 font-bold text-[#173d4e]">{item.expires}</p></div><div className="rounded-2xl bg-[#e8f7fa] p-4"><Snowflake size={18} className="text-[#145d72]" /><p className="mt-3 text-xs font-bold uppercase text-[#6f8b95]">Rescue score</p><p className="mt-1 font-bold text-[#173d4e]">{item.rescueScore}/100</p></div></div>
        {actionError && <p role="alert" className="mt-6 rounded-xl bg-[#fff0ef] px-4 py-3 text-sm text-[#ad4147]">{actionError}</p>}
        <div className="mt-8 flex flex-wrap gap-3"><Button disabled={isSaving} onClick={useSome} className="bg-[#20bed0] text-[#063e4d] hover:bg-[#0db3c8]"><Utensils size={17} /> Use some</Button><Button disabled={isSaving || item.location === 'freezer'} onClick={() => runAction(() => freezeFoodItem(item.id, item.name))} variant="outline"><Snowflake size={17} /> {item.location === 'freezer' ? 'In freezer' : 'Freeze it'}</Button><Button disabled={isSaving} onClick={() => runAction(() => discardFoodItem(item.id))} variant="destructive"><Trash2 size={17} /> Discard</Button></div>
        <Button disabled={isSaving} onClick={consumeAll} variant="outline" className="mt-3"><Check size={17} /> Mark consumed</Button>
        {!item.opened && <Button disabled={isSaving} onClick={() => runAction(() => markFoodOpened(item.id))} variant="outline" className="mt-3">Mark as opened</Button>}
      </div>
    </section>
    <section className="rounded-[2rem] border border-[#cde6ed] bg-white p-6"><h2 className="text-xl font-black text-[#173d4e]">Freshness timeline</h2><div className="mt-6 space-y-5 border-l-2 border-[#d9eef3] pl-5 text-sm"><div><p className="font-bold text-[#173d4e]">Added to your kitchen</p><p className="text-[#6f8b95]">Stored in the {item.location}</p></div><div><p className="font-bold text-[#173d4e]">{item.opened ? 'Opened and freshness recalculated' : 'Still sealed'}</p><p className="text-[#6f8b95]">Current state is based on storage and estimated expiry.</p></div></div></section>
  </div>
}
