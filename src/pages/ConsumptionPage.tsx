import { ArrowLeft, Check, CircleCheck, Clock3, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useFoodContext } from '../context/FoodContext'
import { recipes } from '../data/mockData'

type Decision = { used: number; leftover: number }
const wholeUnits = new Set(['piece', 'bag'])

export function ConsumptionPage() {
  const { items, loading, consumeItem, createLeftoverItem } = useFoodContext()
  const [searchParams] = useSearchParams()
  const recipeTitle = searchParams.get('recipe')
  const recipe = recipes.find((entry) => entry.title === recipeTitle)
  const cookingItems = items.filter((item) => item.quantity > 0 && (!recipe || recipe.ingredients.some((ingredient) => item.name.toLowerCase().includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(item.name.toLowerCase()))))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [someAmount, setSomeAmount] = useState('')
  const [choice, setChoice] = useState<'all' | 'some' | 'none' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const currentItem = cookingItems[currentIndex]
  const step = currentItem && wholeUnits.has(currentItem.unit) ? 1 : 0.1

  function moveNext(decision: Decision) {
    if (!currentItem) return
    const nextDecisions = { ...decisions, [currentItem.id]: decision }
    setDecisions(nextDecisions)
    setChoice(null)
    setSomeAmount('')
    if (currentIndex + 1 >= cookingItems.length) void finishCooking(nextDecisions)
    else setCurrentIndex((index) => index + 1)
  }

  function chooseAll() { if (currentItem) moveNext({ used: currentItem.quantity, leftover: 0 }) }
  function chooseNone() { moveNext({ used: 0, leftover: 0 }) }
  function chooseSome() {
    if (!currentItem) return
    setChoice('some')
    setSomeAmount(String(Math.max(step, Number((currentItem.quantity / 2).toFixed(2)))))
  }
  function continueSome() {
    if (!currentItem) return
    const amount = Number(someAmount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > currentItem.quantity) {
      setSaveError(`Enter an amount between ${step} and ${currentItem.quantity} ${currentItem.unit}.`)
      return
    }
    moveNext({ used: wholeUnits.has(currentItem.unit) ? Math.round(amount) : Number(amount.toFixed(2)), leftover: amount })
  }

  async function finishCooking(finalDecisions: Record<string, Decision>) {
    setIsSaving(true)
    setSaveError('')
    try {
      for (const item of cookingItems) {
        const decision = finalDecisions[item.id]
        if (!decision || decision.used <= 0) continue
        await consumeItem(item.id, decision.used)
        if (decision.leftover > 0) await createLeftoverItem(item.id, decision.leftover)
      }
      setIsComplete(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to update your kitchen.')
      setIsSaving(false)
    }
  }

  if (loading) return <div className="w-full max-w-3xl rounded-3xl border border-[#cde6ed] bg-white p-10 text-center text-[#5e7f8b]">Loading your ingredients...</div>
  if (!cookingItems.length) return <div className="w-full max-w-3xl space-y-4"><Link to="/app" className="inline-flex items-center gap-2 font-bold text-[#145d72]"><ArrowLeft size={16} /> Back to kitchen</Link><p className="rounded-3xl border border-dashed border-[#b9dce7] bg-white p-10 text-center text-[#5e7f8b]">There are no active ingredients to cook with.</p></div>
  if (isComplete) return <div className="flex min-h-[70vh] w-full items-center justify-center bg-[#eefafd] px-4"><div className="w-full max-w-md rounded-[1.5rem] border border-[#cde6ed] bg-white p-8 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#d9f5f8] text-[#145d72]"><Check size={28} /></span><h1 className="mt-5 text-2xl font-black text-[#173d4e]">Cooking updated</h1><p className="mt-2 text-sm text-[#6f8b95]">Your kitchen inventory and leftovers are up to date.</p><Link to="/app" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#20bed0] font-black text-[#063e4d]">Back to kitchen</Link></div></div>
  if (!currentItem) return <div className="flex min-h-[70vh] w-full items-center justify-center bg-[#eefafd] px-4"><div className="w-full max-w-md rounded-[1.5rem] border border-[#cde6ed] bg-white p-8 text-center text-sm font-bold text-[#477d8d]">Updating your kitchen...</div></div>

  return <div className="-mx-5 -my-8 min-h-[calc(100vh-5rem)] w-[calc(100%+2.5rem)] bg-[#eefafd] px-4 py-5 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:px-8 sm:py-8"><div className="mx-auto w-full max-w-md space-y-4"><header><div className="flex items-start justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145d72]">Cooking</p><h1 className="text-lg font-black text-[#173d4e]">{recipeTitle ?? 'Kitchen update'}</h1></div><Link to="/app/recipes" aria-label="Close cooking flow" className="text-[#145d72]"><X size={22} /></Link></div><div className="mt-3 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#d9eef3]"><div className="h-full rounded-full bg-[#20bed0]" style={{ width: `${currentIndex / cookingItems.length * 100}%` }} /></div><span className="text-[11px] font-bold text-[#173d4e]">Ingredient {currentIndex + 1} of {cookingItems.length}</span></div></header><div className="rounded-2xl border border-[#cde6ed] bg-white p-3"><div className="flex items-center gap-3"><div className="flex size-14 items-center justify-center rounded-xl bg-[#e8f7fa] text-[#4f8ca3]"><CircleCheck size={26} /></div><div><h2 className="font-black text-[#173d4e]">{currentItem.name}</h2><p className="text-sm font-semibold text-[#477d8d]">{currentItem.quantity} {currentItem.unit} available</p><p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#fff8d8] px-2 py-0.5 text-[10px] font-bold text-[#9b7800]"><Clock3 size={11} /> Expires {currentItem.expires.toLowerCase()}</p></div></div></div><h2 className="text-xl font-black leading-6 text-[#173d4e]">{choice === 'some' ? 'How much did you use?' : `Did you use all ${currentItem.quantity} ${currentItem.unit} of ${currentItem.name}, or do you have leftovers?`}</h2>{saveError && <p role="alert" className="rounded-xl bg-[#fff0ef] px-4 py-3 text-sm text-[#ad4147]">{saveError}</p>}{choice !== 'some' ? <div className="space-y-2"><button type="button" onClick={chooseAll} disabled={isSaving} className="flex w-full items-center gap-3 rounded-2xl border border-[#cde6ed] bg-[#f0fafb] p-4 text-left"><Check size={18} className="text-[#145d72]" /><span><strong className="block text-sm text-[#173d4e]">Used all</strong><span className="text-xs text-[#6f8b95]">Mark {currentItem.quantity} {currentItem.unit} as consumed</span></span></button><button type="button" onClick={chooseSome} disabled={isSaving} className="flex w-full items-center gap-3 rounded-2xl border border-[#cde6ed] bg-[#f0fafb] p-4 text-left"><CircleCheck size={18} className="text-[#145d72]" /><span><strong className="block text-sm text-[#173d4e]">Used some</strong><span className="text-xs text-[#6f8b95]">I have some left over</span></span></button><button type="button" onClick={chooseNone} disabled={isSaving} className="flex w-full items-center gap-3 rounded-2xl border border-[#cde6ed] bg-white p-4 text-left"><X size={18} className="text-[#6f8b95]" /><span><strong className="block text-sm text-[#173d4e]">Did not use it</strong><span className="text-xs text-[#6f8b95]">Leave it in inventory as is</span></span></button></div> : <div className="space-y-3"><input value={someAmount} onChange={(event) => setSomeAmount(event.target.value)} type="number" min={step} max={currentItem.quantity} step={step} className="h-12 w-full rounded-xl border border-[#b8d7de] bg-white px-4 text-[#173d4e]" /><button type="button" onClick={continueSome} disabled={isSaving} className="h-11 w-full rounded-xl bg-[#20bed0] font-black text-[#063e4d]">Continue</button></div>}</div></div>
}
