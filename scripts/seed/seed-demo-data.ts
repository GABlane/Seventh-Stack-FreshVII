import { parse } from 'csv-parse/sync'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore'
import { auth, db, signInAsDemo } from '../firebase-admin.js'

const CSV = (name: string) => readFileSync(resolve(import.meta.dirname, 'csv', name), 'utf8')

type DemoItemRow = {
  id: string
  name: string
  category_id: string
  subcategory_id: string
  quantity: string
  unit: string
  storage: 'fridge' | 'freezer' | 'pantry'
  days_added: string
  days_opened: string
  days_frozen: string
  is_leftover: string
  purchase_price: string
}

const categoryNames: Record<string, string> = {
  produce: 'Produce', dairy: 'Dairy & eggs', meat: 'Meat', grains: 'Grains', pantry: 'Pantry',
}

const consumedAmounts: Record<string, number> = {
  'demo-tomatoes': 3, 'demo-milk': 300, 'demo-eggs': 6,
}

function isoDaysAgo(now: Date, days: number) {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function shelfFor(storage: DemoItemRow['storage']) {
  if (storage === 'freezer') return 'freezer-top'
  if (storage === 'pantry') return 'pantry-eye-level'
  return 'fridge-middle'
}

function appUnit(unit: string) {
  return unit === 'pcs' ? 'piece' : unit
}

async function deleteCollection(uid: string, name: 'items' | 'activity') {
  const snapshot = await getDocs(collection(db, `profiles/${uid}/${name}`))
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((document) => batch.delete(document.ref))
  await batch.commit()
  console.log(`  Deleted ${snapshot.size} existing ${name}`)
}

export async function seedDemoData(reset = false) {
  console.log('\n--- Seeding Freshly demo data ---')
  const uid = await signInAsDemo()
  console.log(`  Signed in as uid: ${uid}`)

  if (reset) {
    await deleteCollection(uid, 'items')
    await deleteCollection(uid, 'activity')
  }

  const now = new Date()
  const rows = parse(CSV('demo_items.csv'), { columns: true, skip_empty_lines: true }) as DemoItemRow[]
  const batch = writeBatch(db)
  batch.set(doc(db, `profiles/${uid}`), { id: uid, updatedAt: now.toISOString() }, { merge: true })

  for (const row of rows) {
    const quantity = Number(row.quantity)
    const previouslyConsumed = consumedAmounts[row.id] ?? 0
    const dateAdded = isoDaysAgo(now, Number(row.days_added))
    const openedDate = row.days_opened ? isoDaysAgo(now, Number(row.days_opened)) : undefined
    const frozenDate = row.days_frozen ? isoDaysAgo(now, Number(row.days_frozen)) : undefined
    const item = {
      id: row.id,
      name: row.name,
      category: categoryNames[row.category_id] ?? 'Pantry',
      subcategory_id: row.subcategory_id,
      quantity,
      initialQuantity: quantity + previouslyConsumed,
      unit: appUnit(row.unit),
      storageLocation: row.storage,
      shelfKey: shelfFor(row.storage),
      opened: Boolean(openedDate),
      dateAdded,
      openedDate,
      frozenDate,
      pricePaid: Number(row.purchase_price),
      status: 'active' as const,
      notes: row.is_leftover === 'true' ? 'Created from a leftover portion.' : undefined,
      createdAt: dateAdded,
      updatedAt: now.toISOString(),
    }

    batch.set(doc(db, `profiles/${uid}/items/${row.id}`), Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)))
    batch.set(doc(db, `profiles/${uid}/activity/${row.id}-added`), {
      id: `${row.id}-added`, foodItemId: row.id, type: 'added', quantityAfter: item.initialQuantity, createdAt: dateAdded,
    })

    if (previouslyConsumed) {
      batch.set(doc(db, `profiles/${uid}/activity/${row.id}-consumed`), {
        id: `${row.id}-consumed`, foodItemId: row.id, type: 'consumed', quantityBefore: item.initialQuantity, quantityChange: -previouslyConsumed, quantityAfter: quantity, createdAt: isoDaysAgo(now, 1),
      })
    }
  }

  const discardedItems = [
    { id: 'demo-wasted-spinach', name: 'Baby Spinach', category: 'Produce', quantity: 1, unit: 'bag', pricePaid: 65, daysAdded: 9, daysDiscarded: 2 },
    { id: 'demo-wasted-bread', name: 'Whole Wheat Bread', category: 'Grains', quantity: 1, unit: 'pack', pricePaid: 85, daysAdded: 12, daysDiscarded: 4 },
  ]

  for (const item of discardedItems) {
    const dateAdded = isoDaysAgo(now, item.daysAdded)
    const discardedAt = isoDaysAgo(now, item.daysDiscarded)
    batch.set(doc(db, `profiles/${uid}/items/${item.id}`), {
      ...item, initialQuantity: item.quantity, storageLocation: 'fridge', shelfKey: 'fridge-crisper', opened: false,
      dateAdded, status: 'discarded', createdAt: dateAdded, updatedAt: discardedAt, archivedAt: discardedAt,
    })
    batch.set(doc(db, `profiles/${uid}/activity/${item.id}-added`), {
      id: `${item.id}-added`, foodItemId: item.id, type: 'added', quantityAfter: item.quantity, createdAt: dateAdded,
    })
    batch.set(doc(db, `profiles/${uid}/activity/${item.id}-discarded`), {
      id: `${item.id}-discarded`, foodItemId: item.id, type: 'discarded', quantityBefore: item.quantity, quantityAfter: 0, metadata: { estimatedWasteCost: item.pricePaid }, createdAt: discardedAt,
    })
  }

  await batch.commit()
  console.log(`  Wrote ${rows.length} active items, ${discardedItems.length} discarded items, and activity history.`)
  await auth.signOut()
}

if (process.argv[1] === import.meta.filename) {
  const reset = process.argv.includes('--reset')
  seedDemoData(reset)
    .then(() => { console.log('\nDemo data seeding complete.') })
    .catch((error) => { console.error(error); process.exitCode = 1 })
}
