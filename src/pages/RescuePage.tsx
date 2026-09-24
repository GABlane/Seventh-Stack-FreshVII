import { ArrowRight, ChefHat, Clock3, Flame, XCircle } from 'lucide-react'
import { Link } from 'react-router'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { useFoodContext } from '../context/FoodContext'
import { useAIRecommendations } from '../hooks/useAIRecommendations'
import type { FoodItem } from '../data/mockData'

const stateCopy = {
  'rescue-today': { title: 'Rescue Today', hint: 'Use these today', color: 'bg-[#fff1d7] text-[#a76f00]', dot: 'bg-[#ff9d3d]', Icon: Flame },
  'use-soon': { title: 'Use Soon', hint: 'Expiring in the next 2 days', color: 'bg-[#eaf8fa] text-[#a76f00]', dot: 'bg-[#ffd34e]', Icon: Clock3 },
  expired: { title: 'Expired', hint: 'Past the tracked expiration date', color: 'bg-[#ffe3e3] text-[#d94444]', dot: 'bg-[#ee5c63]', Icon: XCircle },
}

function RescueItemCard({ item }: { item: FoodItem }) {
  const copy = stateCopy[item.freshness as keyof typeof stateCopy]
  const Icon = copy.Icon
  return <article className="rounded-[1.15rem] border border-[#c6dde5] bg-white p-3 shadow-[0_5px_14px_rgba(70,67,52,0.05)] sm:p-4"><div className="flex items-start gap-3"><div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d9eef3] text-[#193b5a]"><span className={`absolute left-1 top-1 size-2.5 rounded-full ${copy.dot}`} /><ChefHat size={23} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="truncate text-sm font-black text-[#193b5a]">{item.name}</h3><p className="mt-1 text-xs font-semibold text-[#6f8b95]">{item.quantity} {item.unit} · {item.location === 'fridge' ? 'Fridge' : item.location}</p></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${copy.color}`}><Icon size={11} /> {item.freshness === 'rescue-today' ? 'Rescue Today' : item.freshness === 'use-soon' ? 'Use Soon' : 'Expired'}</span></div><p className="mt-2 text-xs font-bold text-[#a76f00]">{item.expires}</p></div></div><p className="mt-3 rounded-lg bg-[#eaf8fa] px-3 py-2 text-xs font-semibold text-[#477d8d]">{item.freshness === 'expired' ? 'Check it before using. Discard if it smells or looks off.' : item.freshness === 'rescue-today' ? 'Use it in a quick recipe or eat it today.' : 'Cook it today or freeze it to pause the timer.'}</p><div className="mt-3 grid grid-cols-2 gap-2"><Link to="/app/recipes" className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-[#193b5a] px-3 text-xs font-black text-white"><ChefHat size={14} /> {item.freshness === 'expired' ? 'Find recipe' : 'Cook this'}</Link><Link to={`/app/food/${item.id}`} className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-[#b8d4df] bg-[#f6fcfd] px-3 text-xs font-bold text-[#193b5a]">{item.freshness === 'expired' ? 'Still good' : item.location === 'freezer' ? 'In freezer' : 'View food'} <ArrowRight size={13} /></Link></div></article>
}

export function RescuePage() {
  const { items, rawItems, loading } = useFoodContext()
  const { recommendations: allRecommendations } = useAIRecommendations(rawItems)
  const recommendations = allRecommendations.slice(0, 3)

  const urgent = items.filter((item) => item.quantity > 0 && (item.freshness === 'rescue-today' || item.freshness === 'use-soon')).sort((a, b) => b.rescueScore - a.rescueScore)
  const rescueToday = items.filter((item) => item.quantity > 0 && item.freshness === 'rescue-today')
  const useSoon = items.filter((item) => item.quantity > 0 && item.freshness === 'use-soon')
  const expired = items.filter((item) => item.quantity > 0 && item.freshness === 'expired')

  function group(title: keyof typeof stateCopy, data: FoodItem[]) {
    const copy = stateCopy[title]
    const Icon = copy.Icon
    if (!data.length) return null
    return <section className="space-y-3"><div className="flex items-center gap-2 px-1"><span className={`flex size-7 items-center justify-center rounded-lg ${copy.color}`}><Icon size={15} /></span><div><h2 className="text-base font-black text-[#193b5a]">{copy.title} ({data.length})</h2><p className="text-[11px] font-semibold text-[#6f8b95]">{copy.hint}</p></div></div><div className="space-y-3">{data.map((item) => <RescueItemCard key={item.id} item={item} />)}</div></section>
  }

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-6 bg-[#eaf8fa] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:px-8 sm:py-8"><header><p className="text-xs font-bold text-[#193b5a]">Food rescue</p><h1 className="mt-1 text-[2rem] font-black leading-none text-[#193b5a]">Rescue my food</h1><p className="mt-3 text-sm font-semibold text-[#6f8b95]">{urgent.length} items need attention · help prevent waste</p></header>{loading ? <div className="rounded-3xl border border-[#c6dde5] bg-white p-10 text-center text-[#6f8b95]">Checking your kitchen...</div> : <>{recommendations.length > 0 && <section className="space-y-3"><div className="flex items-center justify-between px-1"><div><p className="text-xs font-black uppercase tracking-[0.1em] text-[#193b5a]">Cook before it goes to waste</p><h2 className="mt-1 text-lg font-black text-[#193b5a]">Dinner ideas</h2></div><Link to="/app/recipes" className="text-xs font-black text-[#087c91]">See all</Link></div><div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">{recommendations.map((recipe) => <div key={recipe.id} className="w-[18rem] shrink-0 snap-start"><RecipeCard recipe={recipe} compact /></div>)}</div></section>}{group('rescue-today', rescueToday)}{group('use-soon', useSoon)}{group('expired', expired)}{urgent.length === 0 && expired.length === 0 && <div className="rounded-3xl border border-dashed border-[#b8d4df] bg-white p-10 text-center text-[#6f8b95]">Nothing needs rescuing yet.</div>}</>}</div>
}
