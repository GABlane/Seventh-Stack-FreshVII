import { ArrowRight, ChefHat, Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../ui/button'

type Recipe = { id: string; title: string; description: string; time: number; match: number; ingredients: string[]; rescue: string; rescuedIngredients?: string[] }

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const rescued = recipe.rescuedIngredients ?? []
  const missing = recipe.ingredients.filter((ingredient) => !rescued.includes(ingredient))
  return <article className="flex flex-col rounded-[2rem] border border-[var(--color-border)] bg-white p-5 shadow-[0_8px_24px_rgba(70,67,52,0.05)]"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-1 rounded-full bg-[#dce9de] px-2.5 py-1 text-xs font-black text-[var(--color-primary)]"><Sparkles size={13} /> {recipe.match}% match</span><span className="flex items-center gap-1 text-xs font-bold text-stone-500"><Clock3 size={14} /> {recipe.time} min</span></div><h2 className="mt-7 text-2xl font-black">{recipe.title}</h2><p className="mt-3 text-sm leading-6 text-stone-500">{recipe.description}</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#b84f49]">{recipe.rescue}</p><div className="mt-5 flex flex-1 flex-wrap content-start gap-2">{recipe.ingredients.map((ingredient) => <span key={ingredient} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${rescued.includes(ingredient) ? 'bg-[#dce9de] text-[#426a5a]' : 'bg-[#f6f1e5] text-stone-600'}`}>{ingredient}</span>)}</div>{rescued.length > 0 && <p className="mt-4 text-xs font-semibold text-[#426a5a]">Rescues: {rescued.join(', ')}</p>}{missing.length > 0 && <p className="mt-2 text-xs text-stone-500">Still needed: {missing.join(', ')}</p>}<Button asChild className="mt-7 w-full bg-[var(--color-primary)] text-white hover:bg-[#355747]"><Link to={`/app/consumption?recipe=${encodeURIComponent(recipe.title)}`} onClick={(event) => { if (!window.confirm(`Start cooking ${recipe.title}?`)) event.preventDefault() }}><ChefHat size={16} /> Cook this <ArrowRight size={16} /></Link></Button></article>
}
