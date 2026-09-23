import { parse } from 'csv-parse/sync'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  writeBatch,
  doc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db, auth, signInAsDemo } from '../firebase-admin.js'

const CSV = (name: string) =>
  readFileSync(resolve(import.meta.dirname, 'csv', name), 'utf8')

type DemoItemRow = {
  id: string
  name: string
  category_id: string
  subcategory_id: string
  quantity: string
  unit: string
  storage: string
  days_added: string
  days_opened: string
  days_frozen: string
  is_leftover: string
  purchase_price: string
}

function daysAgo(now: Date, days: number): Timestamp {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return Timestamp.fromDate(d)
}

function daysFromNow(now: Date, days: number): Timestamp {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return Timestamp.fromDate(d)
}

const SHELF_LIFE: Record<string, { closed: number; opened: number; freezer: number }> = {
  produce: { closed: 7,   opened: 3,  freezer: 90  },
  dairy:   { closed: 14,  opened: 5,  freezer: 60  },
  meat:    { closed: 3,   opened: 2,  freezer: 90  },
  grains:  { closed: 180, opened: 60, freezer: 365 },
  pantry:  { closed: 180, opened: 60, freezer: 365 },
}

function resolveUseBy(row: DemoItemRow, now: Date): Timestamp {
  // Leftover items expire today regardless of category shelf life
  if (row.is_leftover === 'true') return daysFromNow(now, 0)

  const life = SHELF_LIFE[row.category_id] ?? { closed: 7, opened: 3, freezer: 90 }

  if (row.days_frozen) {
    const frozenDate = new Date(now)
    frozenDate.setDate(frozenDate.getDate() - Number(row.days_frozen) + life.freezer)
    return Timestamp.fromDate(frozenDate)
  }

  if (row.days_opened) {
    const openedDate = new Date(now)
    openedDate.setDate(openedDate.getDate() - Number(row.days_opened) + life.opened)
    return Timestamp.fromDate(openedDate)
  }

  const addedDate = new Date(now)
  addedDate.setDate(addedDate.getDate() - Number(row.days_added) + life.closed)
  return Timestamp.fromDate(addedDate)
}

async function deleteExistingItems(uid: string) {
  const snap = await getDocs(collection(db, `profiles/${uid}/items`))
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  console.log(`  Deleted ${snap.size} existing items for ${uid}`)
}

export async function seedDemoData(reset = false) {
  console.log('\n--- Seeding demo data ---')
  const uid = await signInAsDemo()
  console.log(`  Signed in as uid: ${uid}`)

  const now = new Date()
  const rows = parse(CSV('demo_items.csv'), { columns: true, skip_empty_lines: true }) as DemoItemRow[]

  if (reset) await deleteExistingItems(uid)

  // Upsert profile
  const profileRef = doc(collection(db, 'profiles'), uid)
  const profileBatch = writeBatch(db)
  profileBatch.set(profileRef, { id: uid, name: 'Demo User', created_at: Timestamp.fromDate(now) }, { merge: true })
  await profileBatch.commit()
  console.log(`  profile: ${uid}`)

  // Build and batch-write items
  const batch = writeBatch(db)
  for (const row of rows) {
    const purchaseDate = daysAgo(now, Number(row.days_added))
    const openedAt = row.days_opened ? daysAgo(now, Number(row.days_opened)) : null
    const frozenAt = row.days_frozen ? daysAgo(now, Number(row.days_frozen)) : null
    const useBy = resolveUseBy(row, now)

    const itemDoc: Record<string, unknown> = {
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      subcategory_id: row.subcategory_id,
      quantity: Number(row.quantity),
      unit: row.unit,
      storage: row.storage,
      purchase_date: purchaseDate,
      use_by: useBy,
      status: 'active',
      is_leftover: row.is_leftover === 'true',
      purchase_price: Number(row.purchase_price),
      created_at: purchaseDate,
    }

    if (openedAt) itemDoc.opened_at = openedAt
    if (frozenAt) itemDoc.frozen_at = frozenAt

    batch.set(doc(collection(db, `profiles/${uid}/items`), row.id), itemDoc)
    console.log(`  item: ${row.id} (${row.name})`)
  }

  await batch.commit()
  console.log(`Demo items: ${rows.length} documents written to profiles/${uid}/items`)

  await auth.signOut()
}

// Allow running directly
if (process.argv[1] === import.meta.filename) {
  const reset = process.argv.includes('--reset')
  seedDemoData(reset)
    .then(() => {
      console.log('\nDemo data seeding complete.')
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
