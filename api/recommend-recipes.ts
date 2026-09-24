import { GoogleGenAI } from '@google/genai'

const recommendationSchema = {
  type: 'object',
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          cookTimeMinutes: { type: 'number' },
          usedIngredients: { type: 'array', items: { type: 'string' } },
          otherIngredients: { type: 'array', items: { type: 'string' } },
          rescueLabel: { type: 'string' },
        },
        required: ['title', 'description', 'cookTimeMinutes', 'usedIngredients', 'otherIngredients', 'rescueLabel'],
      },
    },
  },
  required: ['recipes'],
}

type AIRecipe = {
  id: string
  title: string
  description: string
  cookTimeMinutes: number
  usedIngredients: string[]
  otherIngredients: string[]
  rescueLabel: string
}

type InventoryItem = {
  name: string
  quantity: number
  unit: string
  location: string
  freshnessState?: string
}

function buildPrompt(items: InventoryItem[]): string {
  const urgent = items.filter((i) => i.freshnessState === 'rescue-today' || i.freshnessState === 'use-soon')
  const rest = items.filter((i) => i.freshnessState !== 'rescue-today' && i.freshnessState !== 'use-soon')

  const format = (list: InventoryItem[]) =>
    list.map((i) => `- ${i.name} (${i.quantity} ${i.unit}, ${i.location}${i.freshnessState ? `, ${i.freshnessState}` : ''})`).join('\n')

  const urgentBlock = urgent.length > 0 ? `\nNeeds using soon (prioritize these):\n${format(urgent)}\n` : ''
  const restBlock = rest.length > 0 ? `\nOther available items:\n${format(rest)}\n` : ''

  return `You are a helpful recipe assistant for a food waste reduction app.

A user has the following items in their fridge, freezer, and pantry:
${urgentBlock}${restBlock}
Suggest 3 to 5 practical, realistic recipes they can cook using these ingredients.

Rules:
- Prioritize recipes that use items marked "rescue-today" or "use-soon" to prevent food waste.
- Each recipe should use at least one item from the inventory list.
- usedIngredients must only contain names that appear in the inventory list above (use the same spelling).
- otherIngredients are common pantry staples or additional items not in the inventory (oil, salt, garlic, etc.).
- rescueLabel should be a short, friendly sentence explaining what this recipe saves (e.g. "Uses your expiring chicken and leftover rice").
- cookTimeMinutes should be realistic (15–60 minutes for simple home cooking).
- Keep descriptions short and appetizing (1–2 sentences).
- Do not make up ingredients — only list what is plausible for the recipe.`
}

function cleanRecipes(raw: unknown): AIRecipe[] {
  if (!Array.isArray(raw)) return []
  const cleaned: AIRecipe[] = []
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i]
    if (typeof entry !== 'object' || entry === null) continue
    const r = entry as Record<string, unknown>

    const title = typeof r.title === 'string' ? r.title.trim().slice(0, 100) : ''
    if (!title) continue

    const description = typeof r.description === 'string' ? r.description.trim().slice(0, 200) : ''
    const rawTime = Number(r.cookTimeMinutes)
    const cookTimeMinutes = Number.isFinite(rawTime) && rawTime > 0 ? Math.min(300, Math.max(5, Math.round(rawTime))) : 30
    const usedIngredients = Array.isArray(r.usedIngredients)
      ? r.usedIngredients.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
      : []
    const otherIngredients = Array.isArray(r.otherIngredients)
      ? r.otherIngredients.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
      : []
    const rescueLabel = typeof r.rescueLabel === 'string' ? r.rescueLabel.trim().slice(0, 160) : ''

    cleaned.push({ id: `ai-${i}`, title, description, cookTimeMinutes, usedIngredients, otherIngredients, rescueLabel })
    if (cleaned.length >= 5) break
  }
  return cleaned
}

function parseJson(text: string) {
  const json = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  return JSON.parse(json) as { recipes?: unknown }
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: 'Recipe recommendations are not configured yet.' }, { status: 503 })
  }

  try {
    const body = await request.json() as { items?: unknown }
    const items: InventoryItem[] = Array.isArray(body.items)
      ? (body.items as InventoryItem[]).filter((i) => i && typeof i.name === 'string' && i.name.trim().length > 0)
      : []

    if (items.length === 0) {
      return Response.json({ error: 'No inventory items provided.' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash-lite',
      generation_config: { thinking_level: 'minimal' },
      response_format: { type: 'text', mime_type: 'application/json', schema: recommendationSchema },
      input: [{ type: 'text', text: buildPrompt(items) }],
    })

    if (!interaction.output_text) throw new Error('No output from recipe recommender.')

    const recipes = cleanRecipes(parseJson(interaction.output_text).recipes)
    return Response.json({ recipes })
  } catch (error) {
    console.error('Recipe recommendation failed', error)
    return Response.json({ error: 'Could not generate recipe recommendations.' }, { status: 502 })
  }
}
