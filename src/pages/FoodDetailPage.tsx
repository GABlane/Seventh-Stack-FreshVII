import { ArrowLeft, CalendarDays, Check, Snowflake, Trash2, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { FreshnessBadge } from '../components/food/FreshnessBadge'
import { FreshnessProgress } from '../components/food/FreshnessProgress'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'

export function FoodDetailPage() {
  const { foodId } = useParams()
  const { items, loading, openItem, freezeItem, consumeItem, discardItem } = useFoodContext()
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
    void runAction(() => consumeItem(item.id, Number(entered)))
  }

  function consumeAll() {
    if (!item) return
    void runAction(() => consumeItem(item.id, item.quantity))
  }

  if (loading) return <div className="w-full max-w-4xl rounded-3xl border border-[#e5e1d5] bg-white p-10 text-center text-stone-500">Loading food details...</div>
  if (!item) return (
    <div className="w-full max-w-4xl space-y-4">
      <h1 className="text-3xl font-black">Food item not found</h1>
      <p className="text-stone-600">This item may have been consumed or discarded.</p>
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
    </div>
  )

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex min-h-64 items-center justify-center rounded-[2rem]" style={{ backgroundColor: item.accent }}>
          <Utensils size={80} className="text-stone-700/60" />
        </div>
        <div className="rounded-[2rem] border border-[#e5e1d5] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">{item.category}</p>
            <FreshnessBadge state={item.freshness} />
          </div>
          <h1 className="mt-3 text-4xl font-black">{item.name}</h1>
          <p className="mt-3 text-stone-600">{item.quantity} {item.unit} · {item.location} · {item.opened ? 'Opened' : 'Sealed'}</p>
          <div className="mt-6"><FreshnessProgress value={item.freshnessPercentage} state={item.freshness} /></div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f6f1e5] p-4">
              <CalendarDays size={18} className="text-[#426a5a]" />
              <p className="mt-3 text-xs font-bold uppercase text-stone-500">Best used</p>
              <p className="mt-1 font-bold">{item.expires}</p>
            </div>
            <div className="rounded-2xl bg-[#f6f1e5] p-4">
              <Snowflake size={18} className="text-[#426a5a]" />
              <p className="mt-3 text-xs font-bold uppercase text-stone-500">Rescue score</p>
              <p className="mt-1 font-bold">{item.rescueScore}/100</p>
            </div>
          </div>
          {actionError && <p role="alert" className="mt-6 rounded-xl bg-[#f9ddd9] px-4 py-3 text-sm text-[#7c3733]">{actionError}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button disabled={isSaving} onClick={useSome} className="bg-[#426a5a] text-white hover:bg-[#355747]"><Utensils size={17} /> Use some</Button>
            <Button disabled={isSaving || item.location === 'freezer'} onClick={() => runAction(() => freezeItem(item.id))} variant="outline">
              <Snowflake size={17} /> {item.location === 'freezer' ? 'In freezer' : 'Freeze it'}
            </Button>
            <Button disabled={isSaving} onClick={() => runAction(() => discardItem(item.id))} variant="destructive"><Trash2 size={17} /> Discard</Button>
          </div>
          <Button disabled={isSaving} onClick={consumeAll} variant="outline" className="mt-3 w-full"><Check size={17} /> Mark consumed</Button>
          {!item.opened && (
            <Button disabled={isSaving} onClick={() => runAction(() => openItem(item.id))} variant="outline" className="mt-2 w-full">
              Mark as opened
            </Button>
          )}
        </div>
      </section>
      <section className="rounded-[2rem] border border-[#e5e1d5] bg-white p-6">
        <h2 className="text-xl font-black">Freshness timeline</h2>
        <div className="mt-6 space-y-5 border-l-2 border-[#dce9de] pl-5 text-sm">
          <div>
            <p className="font-bold">Added to your kitchen</p>
            <p className="text-stone-500">Stored in the {item.location}</p>
          </div>
          <div>
            <p className="font-bold">{item.opened ? 'Opened and freshness recalculated' : 'Still sealed'}</p>
            <p className="text-stone-500">Current state is based on storage and estimated expiry.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
