import { ArrowLeft, Check, CircleCheck, History, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'

const wholeUnits = new Set(['piece', 'bag'])

export function ConsumptionPage() {
  const { items, loading, consumeItem, createLeftoverItem } = useFoodContext()
  const [searchParams] = useSearchParams()
  const recipeTitle = searchParams.get('recipe')
  const [used, setUsed] = useState<Record<string, number>>({})
  const [saveLeftovers, setSaveLeftovers] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const activeItems = items.filter((item) => item.quantity > 0).sort((a, b) => b.rescueScore - a.rescueScore)

  function stepFor(unit: string) {
    return wholeUnits.has(unit) ? 1 : 0.1
  }

  function setUsedAmount(id: string, amount: number, unit: string) {
    setUsed((current) => ({
      ...current,
      [id]: wholeUnits.has(unit) ? Math.round(amount) : Number(amount.toFixed(2)),
    }))
  }

  function changeUsed(id: string, amount: number, maximum: number, unit: string) {
    const next = Math.max(0, Math.min(maximum, Number(((used[id] ?? 0) + amount).toFixed(2))))
    setUsedAmount(id, next, unit)
  }

  async function confirmConsumption() {
    const selected = activeItems.filter((item) => (used[item.id] ?? 0) > 0)
    if (!selected.length) return
    setIsSaving(true)
    setSaveError('')
    try {
      for (const item of selected) {
        const amountUsed = used[item.id]
        await consumeItem(item.id, amountUsed)
        if (saveLeftovers) {
          const entered = window.prompt(`How many ${item.unit} of ${item.name} are leftovers?`, String(amountUsed))
          if (entered !== null && Number(entered) > 0) await createLeftoverItem(item.id, Number(entered))
        }
      }
      if (recipeTitle) console.log('Meal prepared:', recipeTitle)
      setUsed({})
      setSaveLeftovers(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to update your kitchen.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
      <div>
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]"><History size={16} /> Consumption</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">How much did you use?</h1>
        <p className="mt-3 text-stone-600">Choose a shortcut or adjust a custom amount before updating your kitchen.</p>
      </div>
      {saveError && <p role="alert" className="rounded-2xl bg-[#f9ddd9] p-4 text-sm text-[#7c3733]">{saveError}</p>}
      {loading ? (
        <div className="rounded-3xl border border-[#e5e1d5] bg-white p-10 text-center text-stone-500">Loading your inventory...</div>
      ) : activeItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8d1c0] bg-white p-10 text-center text-stone-500">There is no active food to consume yet.</div>
      ) : (
        <section className="space-y-3">
          {activeItems.map((item) => {
            const selected = used[item.id] ?? 0
            const step = stepFor(item.unit)
            const half = wholeUnits.has(item.unit)
              ? Math.max(1, Math.round(item.quantity / 2))
              : Number((item.quantity / 2).toFixed(2))
            return (
              <div key={item.id} className="rounded-3xl border border-[#e5e1d5] bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: item.accent }}>
                    <CircleCheck size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold">{item.name}</h2>
                    <p className="text-sm text-stone-500">Available: {item.quantity} {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" disabled={selected <= 0} aria-label={`Use less ${item.name}`} onClick={() => changeUsed(item.id, -step, item.quantity, item.unit)}><Minus size={16} /></Button>
                    <span className="w-12 text-center text-sm font-bold">{selected} {item.unit}</span>
                    <Button size="icon" variant="outline" disabled={selected >= item.quantity} aria-label={`Use more ${item.name}`} onClick={() => changeUsed(item.id, step, item.quantity, item.unit)}><Plus size={16} /></Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setUsedAmount(item.id, half, item.unit)}>Use half</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setUsedAmount(item.id, item.quantity, item.unit)}>Use all</Button>
                </div>
              </div>
            )
          })}
        </section>
      )}
      <label className="flex items-center gap-3 rounded-3xl bg-[#f6f1e5] p-5 text-sm font-semibold">
        <input type="checkbox" checked={saveLeftovers} onChange={(event) => setSaveLeftovers(event.target.checked)} className="size-5 accent-[#426a5a]" />
        I have leftovers to save as a new food item
      </label>
      <Button
        disabled={isSaving || !Object.values(used).some((amount) => amount > 0)}
        onClick={confirmConsumption}
        className="h-12 w-full bg-[#426a5a] text-base text-white hover:bg-[#355747]"
      >
        <Check size={18} /> {isSaving ? 'Updating kitchen...' : 'Confirm consumption'}
      </Button>
    </div>
  )
}
