import { ArrowLeft, ChefHat, Clock3, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useFoodContext } from '../context/FoodContext'
import { useRecipeContext } from '../context/RecipeContext'
import { matchRecipes } from '../domain/rescue'

const FALLBACK_STEPS = [
  'Prepare the ingredients from your kitchen.',
  'Cook everything together until ready.',
  'Taste, plate, and enjoy.',
]

export function RecipeDetailPage() {
  const { recipeId } = useParams()
  const { rawItems } = useFoodContext()
  const { recipes } = useRecipeContext()

  const recipe = recipes.find((r) => r.id === recipeId)
  if (!recipe) return <div className="w-full max-w-3xl space-y-4"><h1 className="text-3xl font-black text-[#193b5a]">Recipe not found</h1><Link to="/app/recipes" className="inline-flex items-center gap-2 font-bold text-[#087c91]"><ArrowLeft size={16} /> Back to recipes</Link></div>

  const matchResult = matchRecipes(rawItems, [recipe])[0]
  const recipeSteps = recipe.steps ?? FALLBACK_STEPS

  return <div className="-mx-5 -my-8 min-h-full w-[calc(100%+2.5rem)] space-y-5 bg-[#eaf8fa] px-5 py-6 pb-8 sm:-mx-8 sm:-my-12 sm:w-[calc(100%+4rem)] sm:px-8 sm:py-8"><Link to="/app/recipes" className="inline-flex items-center gap-2 text-sm font-bold text-[#193b5a]"><ArrowLeft size={17} /> Back to recipes</Link><section className="overflow-hidden rounded-[1.5rem] border border-[#bdebf0] bg-white"><div className="flex h-56 items-center justify-center bg-[#e8f7fa] text-[#4f8ca3] sm:h-72"><ChefHat size={115} strokeWidth={1.1} /></div><div className="p-5 sm:p-8"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#d9eef3] px-3 py-1.5 text-xs font-black text-[#145d72]"><Clock3 size={13} className="mr-1 inline" /> {recipe.minutes} min</span><span className="rounded-full bg-[#d9eef3] px-3 py-1.5 text-xs font-black text-[#145d72]"><Sparkles size={13} className="mr-1 inline" /> {matchResult.rescueLabel}</span></div><h1 className="mt-4 text-3xl font-black text-[#193b5a] sm:text-5xl">{recipe.title}</h1><div className="mt-5 rounded-xl bg-[#d9eef3] px-4 py-3 text-sm font-bold text-[#145d72]">Rescues {matchResult.matchedIngredients.length} kitchen item{matchResult.matchedIngredients.length === 1 ? '' : 's'} that need attention</div></div></section><section className="space-y-3"><h2 className="text-lg font-black text-[#193b5a]">From your kitchen</h2>{recipe.ingredients.map((ingredient) => { const matched = matchResult.matchedIngredients.find((m) => m.ingredient === ingredient); const invItem = matched?.inventoryItem; return <div key={ingredient.name} className="flex items-center justify-between rounded-2xl border border-[#bdebf0] bg-white p-4"><div><p className="font-bold text-[#193b5a]">{ingredient.name}</p><p className="text-xs text-[#6f8b95]">{invItem ? `${invItem.quantity} ${invItem.unit} available` : 'Not tracked in your kitchen'}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${invItem ? 'bg-[#d9eef3] text-[#145d72]' : 'bg-[#f2f7f8] text-[#6f8b95]'}`}>{invItem ? 'In kitchen' : 'Missing'}</span></div> })}</section><section><h2 className="text-lg font-black text-[#193b5a]">Pantry basics</h2><p className="mt-2 text-sm text-[#6f8b95]">Salt, pepper, oil, and water are not tracked in your inventory.</p></section><section><h2 className="text-lg font-black text-[#193b5a]">Steps</h2><div className="mt-3 space-y-3">{recipeSteps.map((step, index) => <div key={step} className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#20c4d6] text-xs font-black text-[#063e4d]">{index + 1}</span><p className="pt-1 text-sm leading-5 text-[#477d8d]">{step}</p></div>)}</div></section><Link to={`/app/consumption?recipe=${encodeURIComponent(recipe.title)}`} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#20c4d6] font-black text-[#063e4d] hover:bg-[#0db3c8]"><ChefHat size={18} /> Cook This</Link><p className="text-center text-xs text-[#6f8b95]">You will confirm how much of each ingredient you used.</p></div>
}
