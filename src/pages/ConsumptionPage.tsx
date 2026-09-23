import { ArrowLeft, Check, CircleCheck, History, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'

export function ConsumptionPage() {
  const { items, consumeItem } = useFoodContext()
  const navigate = useNavigate()

  // Show urgent items first, then all active
  const sortedItems = [...items].sort((a, b) => b.rescueScore - a.rescueScore)

  // Track how much of each item was consumed: Record<itemId, qty>
  const [consumed, setConsumed] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  function getStep(item: (typeof items)[0]): number {
    return item.unit === 'g' || item.unit === 'ml' ? 50 : 1
  }

  function increment(item: (typeof items)[0]) {
    const step = getStep(item)
    setConsumed((prev) => ({
      ...prev,
      [item.id]: Math.min(item.quantity, (prev[item.id] ?? 0) + step),
    }))
  }

  function decrement(item: (typeof items)[0]) {
    const step = getStep(item)
    setConsumed((prev) => ({
      ...prev,
      [item.id]: Math.max(0, (prev[item.id] ?? 0) - step),
    }))
  }

  async function handleConfirm() {
    const entries = Object.entries(consumed).filter(([, qty]) => qty > 0)
    if (entries.length === 0) return
    setSaving(true)
    try {
      await Promise.all(entries.map(([id, qty]) => consumeItem(id, qty)))
      navigate('/app')
    } finally {
      setSaving(false)
    }
  }

  const anyConsumed = Object.values(consumed).some((q) => q > 0)

  return (
    <div className="w-full max-w-3xl space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]">
        <ArrowLeft size={16} /> Back to kitchen
      </Link>
      <div>
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-[#426a5a]">
          <History size={16} /> Consumption
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">How much did you use?</h1>
        <p className="mt-3 text-stone-600">Update quantities as you cook and your kitchen will stay honest.</p>
      </div>

      {sortedItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8d1c0] bg-white p-10 text-center text-stone-500">
          No items in your kitchen yet.
        </div>
      ) : (
        <section className="space-y-3">
          {sortedItems.map((item) => {
            const usedQty = consumed[item.id] ?? 0
            const step = getStep(item)
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-3xl border border-[#e5e1d5] bg-white p-4"
              >
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: item.accent }}
                >
                  <CircleCheck size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{item.name}</h2>
                  <p className="text-sm text-stone-500">
                    Available: {item.quantity} {item.unit}
                    {usedQty > 0 && (
                      <span className="ml-2 font-semibold text-[#426a5a]">
                        − {usedQty} {item.unit}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={usedQty <= 0}
                    onClick={() => decrement(item)}
                    aria-label={`Use less ${item.name}`}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-10 text-center font-bold">{usedQty}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={usedQty >= item.quantity}
                    onClick={() => increment(item)}
                    aria-label={`Use more ${item.name}`}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            )
          })}
        </section>
      )}

      <div className="rounded-3xl bg-[#f6f1e5] p-5">
        <p className="font-bold">Leftovers?</p>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Save remaining portions as a new item with a fresh opened date and a shorter timer.
        </p>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" className="size-5 accent-[#426a5a]" /> Save leftovers to inventory
        </label>
      </div>

      <Button
        className="h-12 w-full bg-[#426a5a] text-base text-white hover:bg-[#355747]"
        disabled={!anyConsumed || saving}
        onClick={handleConfirm}
      >
        <Check size={18} /> {saving ? 'Saving…' : 'Confirm consumption'}
      </Button>
    </div>
  )
}
