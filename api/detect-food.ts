import { GoogleGenAI } from '@google/genai'

const prompt = `
Identify the main food item in this image.

Do not estimate an exact expiry date. If the image is not clearly food, use a low confidence score.
`

const detectionSchema = {
  type: 'object',
  properties: {
    foodName: { type: 'string' },
    category: { type: 'string', enum: ['Produce', 'Dairy & eggs', 'Meat', 'Grains', 'Pantry'] },
    subcategory: { type: 'string' },
    condition: { type: 'string' },
    suggestedStorage: { type: 'string', enum: ['fridge', 'freezer', 'pantry'] },
    confidence: { type: 'number' },
  },
  required: ['foodName', 'category', 'subcategory', 'condition', 'suggestedStorage', 'confidence'],
}

function parseJson(text: string) {
  const json = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  return JSON.parse(json) as Record<string, unknown>
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
    return Response.json({ detection: parseJson(interaction.output_text) })
  } catch (error) {
    console.error('Food detection failed', error)
    return Response.json({ error: 'We could not identify that food. Please try another photo or add it manually.' }, { status: 502 })
  }
}
