import { ArrowLeft, Camera, Check, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/ui/button'
import { useFoodContext } from '../context/FoodContext'
import type { StorageLocation } from '../data/mockData'
import { defaultShelfKey, storageZones } from '../lib/storage-zones'

const today = new Date().toISOString().slice(0, 10)
const wholeQuantityUnits = new Set(['piece', 'bag'])
// Food recognition needs little detail, so scans are always downscaled: a small
// upload is much faster on mobile data and gives the model less to process.
const maxScanImageEdge = 768
const scanImageQuality = 0.8
// If a photo cannot be decoded in the browser (e.g. HEIC), it is sent as-is when
// small enough. 3 MB becomes roughly 4 MB in base64, below Vercel Functions'
// 4.5 MB request-body limit.
const maxRawScanImageBytes = 3 * 1024 * 1024

type FoodDetection = {
  foodName: string
  category: string
  subcategory: string
  condition: string
  suggestedStorage: StorageLocation
  confidence: number
}

function categoryFor(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('dairy') || normalized.includes('egg')) return 'Dairy & eggs'
  if (normalized.includes('meat') || normalized.includes('protein') || normalized.includes('seafood')) return 'Meat'
  if (normalized.includes('grain') || normalized.includes('bakery')) return 'Grains'
  if (normalized.includes('produce') || normalized.includes('fruit') || normalized.includes('vegetable')) return 'Produce'
  return 'Pantry'
}

function fileAsBase64(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read this image.'))
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.readAsDataURL(file)
  })
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = () => {
      reject(new Error('This image could not be prepared for scanning. Please choose another photo.'))
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('This image could not be read for scanning. Please choose another photo.'))
    reader.onload = () => {
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function canvasAsJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('This image could not be compressed.')), 'image/jpeg', quality)
  })
}

async function prepareScanImage(file: File) {
  try {
    const image = await loadImage(file)
    const ratio = Math.min(1, maxScanImageEdge / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.naturalWidth * ratio)
    canvas.height = Math.round(image.naturalHeight * ratio)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not compress this image.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return { file: await canvasAsJpeg(canvas, scanImageQuality), mimeType: 'image/jpeg' }
  } catch (error) {
    if (file.size <= maxRawScanImageBytes) return { file, mimeType: file.type }
    throw error
  }
}

export function AddFoodPage() {
  const { addNewItem } = useFoodContext()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Produce')
  const [quantity, setQuantity] = useState('1')
  const [pricePaid, setPricePaid] = useState('')
  const [unit, setUnit] = useState('piece')
  const [location, setLocation] = useState<StorageLocation>('fridge')
  const [shelfKey, setShelfKey] = useState(() => defaultShelfKey('fridge'))
  const [dateAdded, setDateAdded] = useState(today)
  const [opened, setOpened] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [detection, setDetection] = useState<FoodDetection | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const scanInputRef = useRef<HTMLInputElement>(null)
  const quantityIsWhole = wholeQuantityUnits.has(unit)

  useEffect(() => {
    const quantityInput = document.querySelector<HTMLInputElement>('input[type="number"]')
    quantityInput?.setAttribute('min', quantityIsWhole ? '1' : '0.01')
    quantityInput?.setAttribute('step', quantityIsWhole ? '1' : '0.01')
    if (quantityIsWhole && quantity.includes('.')) {
      setQuantity(String(Math.max(1, Math.round(Number(quantity)))))
    }
  }, [quantity, quantityIsWhole])

  async function scanFood(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file to scan.')
      return
    }
    setError('')
    setIsDetecting(true)
    try {
      const scanImage = await prepareScanImage(file)
      const response = await fetch('/api/detect-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: await fileAsBase64(scanImage.file), mimeType: scanImage.mimeType }),
      })
      const responseText = await response.text()
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        if (response.status === 413) throw new Error('This photo is still too large to scan. Please choose a smaller image.')
        throw new Error('Food scanning is unavailable right now. Please try again after the latest deployment, or add the item manually.')
      }
      let payload: { detection?: FoodDetection; error?: string } = {}
      try {
        payload = responseText ? JSON.parse(responseText) as typeof payload : {}
      } catch {
        throw new Error('Food scanning is unavailable right now. Please try again or add the item manually.')
      }
      if (!response.ok || !payload.detection) throw new Error(payload.error ?? 'Unable to identify that food.')

      const result = payload.detection
      const nextLocation: StorageLocation = ['fridge', 'freezer', 'pantry'].includes(result.suggestedStorage) ? result.suggestedStorage : 'fridge'
      setName(result.foodName)
      setCategory(categoryFor(result.category))
      setLocation(nextLocation)
      setShelfKey(defaultShelfKey(nextLocation))
      setDetection(result)
    } catch (scanError) {
      const message = scanError instanceof Error ? scanError.message : ''
      setError(message === 'The string did not match the expected pattern.' ? 'Your phone could not prepare that photo. Please take a new photo or choose a JPEG or PNG image.' : message || 'Unable to identify that food.')
    } finally {
      setIsDetecting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await addNewItem({
        name,
        category,
        quantity: Number(quantity),
        pricePaid: pricePaid === '' ? undefined : Number(pricePaid),
        unit,
        storageLocation: location,
        shelfKey,
        opened,
        dateAdded: new Date(dateAdded).toISOString(),
        estimatedExpiry: undefined,
      })
      navigate('/app')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to add this food.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm font-bold text-[#193b5a]"><ArrowLeft size={16} /> Back to kitchen</Link>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#193b5a]">New inventory</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#193b5a]">Add food</h1>
        <p className="mt-3 max-w-xl text-stone-600">Add an item to your kitchen. Freshly will estimate when it needs attention.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-[#c6dde5] bg-white p-5 shadow-[0_8px_24px_rgba(70,67,52,0.05)] sm:p-8">
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#eaf8fa] p-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold">Scan a label</p>
            <p className="text-sm text-stone-500">Take a photo or choose one; you can always edit the result before saving.</p>
          </div>
          <input ref={scanInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={scanFood} />
          <Button type="button" variant="outline" disabled={isDetecting} onClick={() => scanInputRef.current?.click()}><Camera size={17} /> {isDetecting ? 'Identifying...' : 'Scan item'}</Button>
        </div>
        {detection && <div className="rounded-2xl border border-[#bdebf0] bg-[#d9eef3] p-4 text-sm text-[#193b5a]"><p className="font-black">We found {detection.foodName}</p><p className="mt-1 font-semibold text-[#5b7086]">{detection.condition} · Suggested for the {detection.suggestedStorage} · {Math.round(detection.confidence * 100)}% confidence</p></div>}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold">Food name</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Avocado" className="h-12 w-full rounded-xl border border-[#b8d4df] px-4 outline-none focus:border-[#193b5a]" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-xl border border-[#b8d4df] bg-white px-4 outline-none focus:border-[#193b5a]">
              <option>Produce</option><option>Dairy & eggs</option><option>Meat</option><option>Grains</option><option>Pantry</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Quantity</span>
            <input required type="number" min="0.01" step="0.1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-12 w-full rounded-xl border border-[#b8d4df] px-4 outline-none focus:border-[#193b5a]" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Unit</span>
            <select value={unit} onChange={(event) => setUnit(event.target.value)} className="h-12 w-full rounded-xl border border-[#b8d4df] bg-white px-4 outline-none focus:border-[#193b5a]">
              <option>piece</option><option>bag</option><option>g</option><option>ml</option><option>pack</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Price paid (₱)</span>
            <input type="number" min="0" step="0.01" value={pricePaid} onChange={(event) => setPricePaid(event.target.value)} placeholder="Optional" className="h-12 w-full rounded-xl border border-[#b8d4df] px-4 outline-none focus:border-[#193b5a]" />
            <small className="mt-1 block text-stone-500">Used to calculate food-waste cost.</small>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Storage location</span>
            <select value={location} onChange={(event) => { const nextLocation = event.target.value as StorageLocation; setLocation(nextLocation); setShelfKey(defaultShelfKey(nextLocation)) }} className="h-12 w-full rounded-xl border border-[#b8d4df] bg-white px-4 outline-none focus:border-[#193b5a]">
              <option value="fridge">Fridge</option><option value="freezer">Freezer</option><option value="pantry">Pantry</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Shelf</span>
            <select value={shelfKey} onChange={(event) => setShelfKey(event.target.value)} className="h-12 w-full rounded-xl border border-[#b8d4df] bg-white px-4 outline-none focus:border-[#193b5a]">
              {storageZones[location].map((zone) => <option key={zone.key} value={zone.key}>{zone.label}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold">Date added</span>
            <input required type="date" value={dateAdded} onChange={(event) => setDateAdded(event.target.value)} className="h-12 w-full rounded-xl border border-[#b8d4df] px-4 outline-none focus:border-[#193b5a]" />
          </label>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-[#c6dde5] p-4">
          <input type="checkbox" checked={opened} onChange={(event) => setOpened(event.target.checked)} className="size-5 accent-[#193b5a]" />
          <span><strong className="block">Already opened</strong><small className="text-stone-500">Use a shorter freshness estimate for this item.</small></span>
        </label>
        {error && <p role="alert" className="rounded-xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#d94444]">{error}</p>}
        <Button type="submit" disabled={isSaving} className="h-12 w-full bg-[#193b5a] text-base text-white hover:bg-[#193b5a]">
          <Plus size={18} /> {isSaving ? 'Adding...' : 'Add to my kitchen'}
        </Button>
      </form>
      <p className="flex items-center gap-2 text-sm text-stone-500"><Check size={16} className="text-[#6bcb77]" /> Added food will appear in your live visual fridge.</p>
    </div>
  )
}
