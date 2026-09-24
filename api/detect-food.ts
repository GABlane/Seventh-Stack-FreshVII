import { GoogleGenAI } from '@google/genai'

const prompt = `
Identify the main food item in this image.

Return ONLY JSON in this shape:

{
  "foodName": "string",
  "category": "Produce | Dairy & eggs | Meat | Grains | Pantry",
  "subcategory": "string",
  "condition": "string",
  "suggestedStorage": "fridge | freezer | pantry",
  "confidence": 0.0
}

Do not estimate an exact expiry date. If the image is not clearly food, use a low confidence score.
`

function parseJson(text: string) {
  const json = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  return JSON.parse(json) as Record<string, unknown>
}

export default async function detectFood(request: Request) {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: 'Food scanning is not configured yet.' }, { status: 503 })

  try {
    const body = await request.json() as { imageBase64?: unknown; mimeType?: unknown }
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.replace(/^data:[^;]+;base64,/, '') : ''
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg'

    if (!imageBase64 || !mimeType.startsWith('image/')) return Response.json({ error: 'Provide a valid food image.' }, { status: 400 })
    if (imageBase64.length > 10_000_000) return Response.json({ error: 'Choose an image smaller than 7 MB.' }, { status: 413 })

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
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
