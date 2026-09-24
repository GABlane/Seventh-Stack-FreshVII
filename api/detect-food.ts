import { GoogleGenAI } from '@google/genai'

const categories = ['Produce', 'Dairy & eggs', 'Meat', 'Grains', 'Pantry'] as const
const storages = ['fridge', 'freezer', 'pantry'] as const
const units = ['piece', 'bag', 'g', 'ml', 'pack'] as const
const maxItems = 12
const minConfidence = 0.3

const prompt = `
Identify every distinct food or grocery item visible in this image.

- List each different item once. If the same item appears several times (for example three apples),
  return one entry with the count as its quantity.
- quantity is how many you can see, using "piece" for loose items, "bag" for bags, "pack" for packs,
  or "g" / "ml" only when a weight or volume is printed on the package.
- Ignore people, hands, containers, appliances, and anything that is not food.
- List at most ${maxItems} items, the most prominent first.
- Do not estimate an exact expiry date. Use a low confidence score for anything you are unsure about.
- If the image contains no food, return an empty list.
`

const detectionSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          foodName: { type: 'string' },
          category: { type: 'string', enum: [...categories] },
          subcategory: { type: 'string' },
          condition: { type: 'string' },
          suggestedStorage: { type: 'string', enum: [...storages] },
          quantity: { type: 'number' },
          unit: { type: 'string', enum: [...units] },
          confidence: { type: 'number' },
        },
        required: ['foodName', 'category', 'subcategory', 'condition', 'suggestedStorage', 'quantity', 'unit', 'confidence'],
      },
    },
  },
  required: ['items'],
}

type Detection = {
  foodName: string
  category: (typeof categories)[number]
  subcategory: string
  condition: string
  suggestedStorage: (typeof storages)[number]
  quantity: number
  unit: (typeof units)[number]
  confidence: number
}

function parseJson(text: string) {
  const json = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  return JSON.parse(json) as { items?: unknown }
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback
}

// The model output is untrusted: coerce every field into the shape the client expects.
function cleanDetections(raw: unknown): Detection[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const cleaned: Detection[] = []
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue
    const item = entry as Record<string, unknown>
    const foodName = typeof item.foodName === 'string' ? item.foodName.trim().slice(0, 80) : ''
    const confidence = Math.min(1, Math.max(0, Number(item.confidence) || 0))
    const key = foodName.toLowerCase()
    if (!foodName || confidence < minConfidence || seen.has(key)) continue
    seen.add(key)
    const unit = pick(item.unit, units, 'piece')
    const rawQuantity = Number(item.quantity)
    const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? Math.min(999, rawQuantity) : 1
    cleaned.push({
      foodName,
      category: pick(item.category, categories, 'Pantry'),
      subcategory: typeof item.subcategory === 'string' ? item.subcategory.trim().slice(0, 80) : '',
      condition: typeof item.condition === 'string' ? item.condition.trim().slice(0, 120) : '',
      suggestedStorage: pick(item.suggestedStorage, storages, 'fridge'),
      quantity: unit === 'piece' || unit === 'bag' || unit === 'pack' ? Math.max(1, Math.round(quantity)) : quantity,
      unit,
      confidence,
    })
    if (cleaned.length >= maxItems) break
  }
  return cleaned
}

// Named method export (Web-standard handler). A plain default export is treated
// as a legacy Node (req, res) handler, so a returned Response is never sent.
export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: 'Food scanning is not configured yet.' }, { status: 503 })

  try {
    const body = await request.json() as { imageBase64?: unknown; mimeType?: unknown }
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.replace(/^data:[^;]+;base64,/, '') : ''
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg'

    if (!imageBase64 || !mimeType.startsWith('image/')) return Response.json({ error: 'Provide a valid food image.' }, { status: 400 })
    if (imageBase64.length > 4_200_000) return Response.json({ error: 'Choose a smaller image to scan.' }, { status: 413 })

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash-lite',
      generation_config: { thinking_level: 'minimal' },
      response_format: { type: 'text', mime_type: 'application/json', schema: detectionSchema },
      input: [
        { type: 'text', text: prompt },
        { type: 'image', data: imageBase64, mime_type: mimeType },
      ],
    })
    if (!interaction.output_text) throw new Error('The food detector returned no result.')
    const detections = cleanDetections(parseJson(interaction.output_text).items)
    // `detection` (first item) keeps older cached clients working.
    return Response.json({ detections, detection: detections[0] ?? null })
  } catch (error) {
    console.error('Food detection failed', error)
    return Response.json({ error: 'We could not identify that food. Please try another photo or add it manually.' }, { status: 502 })
  }
}
