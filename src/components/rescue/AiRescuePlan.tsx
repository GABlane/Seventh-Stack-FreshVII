import { Clock3, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import type { FoodItem } from '../../data/mockData'

type Suggestion = {
  title: string
  action: 'cook' | 'eat' | 'freeze' | 'preserve' | 'check'
  usesItems: string[]
  minutes: number
  steps: string[]
  tip: string
}

export type Plan = { summary: string; suggestions: Suggestion[]; basedOn: string }

const actionLabel: Record<Suggestion['action'], string> = {
  cook: 'Cook it',
  eat: 'Eat it',
  freeze: 'Freeze it',
  preserve: 'Preserve it',
  check: 'Check first',
}

// Identifies the set of items a plan was made for, so a stale plan can be flagged.
const signature = (items: FoodItem[]) => items.map((item) => `${item.id}:${item.freshness}`).sort().join('|')

export function AiRescuePlan({ items }: { items: FoodItem[] }) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const current = signature(items)
  const isStale = plan !== null && plan.basedOn !== current

  async function getSuggestions() {
    setError('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/rescue-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.slice(0, 15).map((item) => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            location: item.location,
            freshness: item.freshness,
            expires: item.expires,
            opened: item.opened,
          })),
        }),
      })
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) throw new Error('AI suggestions are unavailable right now. Please try again after the latest deployment.')
      const payload = await response.json() as { summary?: string; suggestions?: Suggestion[]; error?: string }
      if (!response.ok) throw new Error(payload.error ?? 'We could not get suggestions right now.')
      if (!payload.suggestions?.length) throw new Error('No suggestions this time. Please try again.')
      setPlan({ summary: payload.summary ?? '', suggestions: payload.suggestions, basedOn: current })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not get suggestions right now.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section aria-label="AI rescue plan" className="space-y-3 rounded-[1.5rem] border border-[#c6dde5] bg-white p-4 shadow-[0_5px_14px_rgba(70,67,52,0.05)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#d9eef3] text-[#193b5a]"><Sparkles size={20} /></span>
          <div>
            <h2 className="text-base font-black text-[#193b5a]">AI rescue plan</h2>
            <p className="text-[11px] font-semibold text-[#6f8b95]">Ideas for the {items.length} item{items.length === 1 ? '' : 's'} that {items.length === 1 ? 'needs' : 'need'} attention.</p>
          </div>
        </div>
        <Button type="button" variant="outline" disabled={isLoading} onClick={getSuggestions} className="shrink-0">
          {plan ? <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> : <Sparkles size={16} />}
          {isLoading ? 'Thinking...' : plan ? 'Refresh' : 'Get suggestions'}
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#d94444]">{error}</p>}
      {isStale && !isLoading && <p className="rounded-xl bg-[#fff1d7] px-4 py-2 text-xs font-bold text-[#a76f00]">Your kitchen has changed since these ideas were made. Refresh for new ones.</p>}

      {plan && <PlanResult plan={plan} />}
    </section>
  )
}

export function PlanResult({ plan }: { plan: Plan }) {
  return (
    <div className="space-y-3">
      {plan.summary && <p className="text-sm font-semibold text-[#193b5a]">{plan.summary}</p>}
      <ul className="space-y-3">
        {plan.suggestions.map((suggestion) => (
          <li key={suggestion.title} className="rounded-2xl border border-[#c6dde5] bg-[#f6fcfd] p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-black text-[#193b5a]">{suggestion.title}</h3>
              <span className="shrink-0 rounded-full bg-[#d9eef3] px-2.5 py-1 text-[11px] font-black text-[#193b5a]">{actionLabel[suggestion.action]}</span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#6f8b95]"><Clock3 size={12} /> About {suggestion.minutes} min</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestion.usesItems.map((name) => <span key={name} className="rounded-full border border-[#c6dde5] bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#193b5a]">{name}</span>)}
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[#193b5a]">
              {suggestion.steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
            {suggestion.tip && <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#6f8b95]">Tip: {suggestion.tip}</p>}
          </li>
        ))}
      </ul>
      <p className="text-[11px] font-semibold text-[#6f8b95]">AI suggestions can be wrong. Always check that food looks and smells safe before eating it.</p>
    </div>
  )
}
