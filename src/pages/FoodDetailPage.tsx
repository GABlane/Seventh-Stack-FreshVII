import { ArrowLeft, CalendarDays, CheckCircle, Minus, PackageOpen, Plus, Snowflake, Trash2, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { FreshnessBadge } from '../components/food/FreshnessBadge'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'

export function FoodDetailPage() {
  const { foodId } = useParams()
  const navigate = useNavigate()
  const { items, openItem, freezeItem, consumeItem, discardItem } = useFoodContext()

  const item = items.find((i) => i.id === foodId)

  // Local UI state
  const [consuming,        setConsuming]        = useState(false)
  const [consumeQty,       setConsumeQty]       = useState(1)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const [busy,             setBusy]             = useState(false)

  if (!item) {
    return (
      <div className="w-full max-w-4xl space-y-6">
        <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]">
          <ArrowLeft size={16} /> Back to kitchen
        </Link>
        <div className="rounded-[2rem] border border-[#e5e1d5] bg-white p-10 text-center">
          <p className="text-xl font-black">Item not found</p>
          <p className="mt-2 text-stone-500">It may have already been consumed or discarded.</p>
        </div>
      </div>
    )
  }

  async function handleOpen() {
    setBusy(true)
    try { await openItem(item!.id) } finally { setBusy(false) }
  }

  async function handleFreeze() {
    setBusy(true)
    try { await freezeItem(item!.id) } finally { setBusy(false) }
  }

  async function handleConsume() {
    setBusy(true)
    try {
      await consumeItem(item!.id, consumeQty)
      setConsuming(false)
      navigate('/app')
    } finally {
      setBusy(false)
    }
  }

  async function handleDiscard() {
    setBusy(true)
    try {
      await discardItem(item!.id)
      navigate('/app')
    } finally {
      setBusy(false)
    }
  }

  const maxQty = item.quantity
  const step   = item.unit === 'g' || item.unit === 'ml' ? 50 : 1

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#426a5a]">
        <ArrowLeft size={16} /> Back to kitchen
      </Link>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Food icon */}
        <div
          className="flex min-h-64 items-center justify-center rounded-[2rem]"
          style={{ backgroundColor: item.accent }}
        >
          <Utensils size={80} className="text-stone-700/60" />
        </div>

        {/* Details */}
        <div className="rounded-[2rem] border border-[#e5e1d5] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">{item.category}</p>
            <FreshnessBadge state={item.freshness} />
          </div>
          <h1 className="mt-3 text-4xl font-black">{item.name}</h1>
          <p className="mt-3 text-stone-600">
            {item.quantity} {item.unit} · {item.location} · {item.opened ? 'Opened' : 'Sealed'}
          </p>

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

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            {!item.opened && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={handleOpen}
              >
                <PackageOpen size={17} /> Mark opened
              </Button>
            )}
            {item.location !== 'freezer' && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={handleFreeze}
              >
                <Snowflake size={17} /> Freeze it
              </Button>
            )}
            <Button
              className="bg-[#426a5a] text-white hover:bg-[#355747]"
              disabled={busy}
              onClick={() => { setConsuming(true); setConsumeQty(step) }}
            >
              <Utensils size={17} /> Use some
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => setConfirmingDiscard(true)}
            >
              <Trash2 size={17} /> Discard
            </Button>
          </div>

          {/* Consume inline panel */}
          {consuming && (
            <div className="mt-5 rounded-2xl bg-[#f6f1e5] p-4 space-y-3">
              <p className="font-bold text-sm">How much are you using?</p>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setConsumeQty((q) => Math.max(step, q - step))}
                  disabled={consumeQty <= step}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-24 text-center font-bold">
                  {consumeQty} {item.unit}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setConsumeQty((q) => Math.min(maxQty, q + step))}
                  disabled={consumeQty >= maxQty}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-[#426a5a] text-white hover:bg-[#355747]"
                  disabled={busy}
                  onClick={handleConsume}
                >
                  <CheckCircle size={16} /> Confirm
                </Button>
                <Button variant="outline" onClick={() => setConsuming(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Discard confirmation */}
          {confirmingDiscard && (
            <div className="mt-5 rounded-2xl bg-[#f9ddd9] p-4 space-y-3">
              <p className="font-bold text-sm text-[#7c3733]">
                Discard {item.name}? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" disabled={busy} onClick={handleDiscard}>
                  Yes, discard
                </Button>
                <Button variant="outline" onClick={() => setConfirmingDiscard(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Freshness timeline */}
      <section className="rounded-[2rem] border border-[#e5e1d5] bg-white p-6">
        <h2 className="text-xl font-black">Freshness timeline</h2>
        <div className="mt-6 space-y-5 border-l-2 border-[#dce9de] pl-5 text-sm">
          <div>
            <p className="font-bold">Added to your kitchen</p>
            <p className="text-stone-500">
              {new Date(item.dateAdded).toLocaleDateString(undefined, { dateStyle: 'medium' })} · {item.location}
            </p>
          </div>
          {item.opened && item.openedDate && (
            <div>
              <p className="font-bold">Opened — freshness recalculated</p>
              <p className="text-stone-500">
                {new Date(item.openedDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
            </div>
          )}
          {!item.opened && (
            <div>
              <p className="font-bold">Still sealed</p>
              <p className="text-stone-500">Current estimate is based on category shelf life and storage.</p>
            </div>
          )}
          <div>
            <p className="font-bold">Estimated best by</p>
            <p className="text-stone-500">{item.expires}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
