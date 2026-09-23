/**
 * Dev-only test page for the Firestore food service.
 * Route: /dev/food-test
 * Remove this file and its route before the demo.
 */
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { deleteDoc, doc } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'
import {
  addItem,
  consumeItem,
  createLeftoverItem,
  discardItem,
  fetchItems,
  markOpened,
  moveToFreezer,
  subscribeToItems,
  unfreezeItem,
} from '../../firebase/index'
import type { FoodItemRecord } from '../../domain/food'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TestStatus = 'idle' | 'running' | 'pass' | 'fail'

type TestResult = {
  name: string
  status: TestStatus
  detail?: string
}

// ---------------------------------------------------------------------------
// Test IDs — all prefixed so they're easy to spot and delete in Firestore
// ---------------------------------------------------------------------------

const IDS = {
  lifecycle: 'devtest-lifecycle-01',
  discard: 'devtest-discard-01',
  leftover: 'devtest-leftover-01',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

async function cleanup(uid: string) {
  await Promise.allSettled(
    Object.values(IDS).flatMap((id) => [
      deleteDoc(doc(db, `profiles/${uid}/items/${id}`)),
      deleteDoc(doc(db, `profiles/${uid}/items/${id}-leftover-` + '*')).catch(() => {}),
    ]),
  )

  // Also clean up any leftover child docs by fetching all items and deleting devtest ones
  const all = await fetchItems(uid, 'all')
  await Promise.allSettled(
    all
      .filter((i) => i.id.startsWith('devtest-'))
      .map((i) => deleteDoc(doc(db, `profiles/${uid}/items/${i.id}`))),
  )
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

async function runTests(
  uid: string,
  onUpdate: (results: TestResult[]) => void,
): Promise<void> {
  const results: TestResult[] = [
    { name: 'addItem — creates item in Firestore', status: 'idle' },
    { name: 'fetchItems — returns the created item', status: 'idle' },
    { name: 'markOpened — sets opened: true, clears estimatedExpiry', status: 'idle' },
    { name: 'moveToFreezer — sets storageLocation: freezer', status: 'idle' },
    { name: 'unfreezeItem — moves back to fridge', status: 'idle' },
    { name: 'consumeItem (partial) — reduces quantity, stays active', status: 'idle' },
    { name: 'consumeItem (full) — sets status: consumed', status: 'idle' },
    { name: 'discardItem — sets status: discarded', status: 'idle' },
    { name: 'createLeftoverItem — batch: new leftover doc + original update', status: 'idle' },
    { name: 'subscribeToItems — real-time listener fires', status: 'idle' },
  ]

  function set(index: number, status: TestStatus, detail?: string) {
    results[index] = { ...results[index], status, detail }
    onUpdate([...results])
  }

  function running(index: number) {
    set(index, 'running')
  }

  function pass(index: number, detail?: string) {
    set(index, 'pass', detail)
  }

  function fail(index: number, error: unknown) {
    set(index, 'fail', error instanceof Error ? error.message : String(error))
  }

  const now = new Date().toISOString()

  // Clean up any leftover data from a previous run
  await cleanup(uid)

  // ── 0. addItem ────────────────────────────────────────────────────────────
  let lifecycle: FoodItemRecord
  try {
    running(0)
    lifecycle = await addItem(uid, {
      id: IDS.lifecycle,
      name: '[devtest] Chicken Breast',
      category: 'Meat',
      quantity: 500,
      unit: 'g',
      storageLocation: 'fridge',
      opened: false,
      dateAdded: now,
    })
    assert(lifecycle.id === IDS.lifecycle, 'id mismatch')
    assert(lifecycle.status === 'active', 'status should be active')
    assert(lifecycle.quantity === 500, 'quantity should be 500')
    pass(0, `id: ${lifecycle.id}`)
  } catch (e) {
    fail(0, e)
    return
  }

  // ── 1. fetchItems ─────────────────────────────────────────────────────────
  try {
    running(1)
    const items = await fetchItems(uid, 'active')
    const found = items.find((i) => i.id === IDS.lifecycle)
    assert(!!found, `item ${IDS.lifecycle} not found in fetchItems result`)
    pass(1, `fetched ${items.length} active item(s)`)
  } catch (e) {
    fail(1, e)
  }

  // ── 2. markOpened ─────────────────────────────────────────────────────────
  try {
    running(2)
    lifecycle = await markOpened(uid, lifecycle)
    assert(lifecycle.opened === true, 'opened should be true')
    assert(!!lifecycle.openedDate, 'openedDate should be set')
    assert(lifecycle.estimatedExpiry === undefined, 'estimatedExpiry should be cleared')
    pass(2, `openedDate: ${lifecycle.openedDate}`)
  } catch (e) {
    fail(2, e)
  }

  // ── 3. moveToFreezer ──────────────────────────────────────────────────────
  try {
    running(3)
    lifecycle = await moveToFreezer(uid, lifecycle)
    assert(lifecycle.storageLocation === 'freezer', 'storageLocation should be freezer')
    assert(!!lifecycle.frozenDate, 'frozenDate should be set')
    pass(3, `frozenDate: ${lifecycle.frozenDate}`)
  } catch (e) {
    fail(3, e)
  }

  // ── 4. unfreezeItem ───────────────────────────────────────────────────────
  try {
    running(4)
    lifecycle = await unfreezeItem(uid, lifecycle, 'fridge')
    assert(lifecycle.storageLocation === 'fridge', 'storageLocation should be fridge')
    assert(lifecycle.frozenDate === undefined, 'frozenDate should be cleared')
    pass(4, `back in: ${lifecycle.storageLocation}`)
  } catch (e) {
    fail(4, e)
  }

  // ── 5. consumeItem partial ────────────────────────────────────────────────
  try {
    running(5)
    lifecycle = await consumeItem(uid, lifecycle, 200)
    assert(lifecycle.quantity === 300, `expected 300g remaining, got ${lifecycle.quantity}`)
    assert(lifecycle.status === 'active', 'status should still be active')
    pass(5, `remaining: ${lifecycle.quantity}g`)
  } catch (e) {
    fail(5, e)
  }

  // ── 6. consumeItem full ───────────────────────────────────────────────────
  try {
    running(6)
    lifecycle = await consumeItem(uid, lifecycle, 300)
    assert(lifecycle.quantity === 0, 'quantity should be 0')
    assert(lifecycle.status === 'consumed', 'status should be consumed')
    assert(!!lifecycle.archivedAt, 'archivedAt should be set')
    pass(6, `status: ${lifecycle.status}`)
  } catch (e) {
    fail(6, e)
  }

  // ── 7. discardItem ────────────────────────────────────────────────────────
  let discardTarget: FoodItemRecord
  try {
    running(7)
    discardTarget = await addItem(uid, {
      id: IDS.discard,
      name: '[devtest] Milk',
      category: 'Dairy & eggs',
      quantity: 1,
      unit: 'l',
      storageLocation: 'fridge',
      opened: false,
      dateAdded: now,
    })
    discardTarget = await discardItem(uid, discardTarget)
    assert(discardTarget.status === 'discarded', 'status should be discarded')
    assert(!!discardTarget.archivedAt, 'archivedAt should be set')
    pass(7, `status: ${discardTarget.status}`)
  } catch (e) {
    fail(7, e)
  }

  // ── 8. createLeftoverItem ─────────────────────────────────────────────────
  try {
    running(8)
    const leftoverSource = await addItem(uid, {
      id: IDS.leftover,
      name: '[devtest] Rice',
      category: 'Grains',
      quantity: 400,
      unit: 'g',
      storageLocation: 'fridge',
      opened: true,
      dateAdded: now,
      openedDate: now,
    })
    const { original, leftover } = await createLeftoverItem(uid, leftoverSource, 150)
    assert(leftover.name.includes('leftovers'), 'leftover name should include "leftovers"')
    assert(leftover.quantity === 150, `leftover quantity should be 150, got ${leftover.quantity}`)
    assert(leftover.storageLocation === 'fridge', 'leftover should be in fridge')
    assert(leftover.opened === true, 'leftover should be opened')
    assert(original.id === IDS.leftover, 'original id should be unchanged')
    pass(8, `leftover id: ${leftover.id} (${leftover.quantity}g)`)
  } catch (e) {
    fail(8, e)
  }

  // ── 9. subscribeToItems ───────────────────────────────────────────────────
  try {
    running(9)
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Listener did not fire within 5s')), 5000)
      const unsub = subscribeToItems(uid, (items) => {
        clearTimeout(timeout)
        unsub()
        try {
          assert(Array.isArray(items), 'callback should receive an array')
          pass(9, `listener fired with ${items.length} item(s)`)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  } catch (e) {
    fail(9, e)
  }

  // Final cleanup
  await cleanup(uid)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<TestStatus, string> = {
  idle:    'bg-stone-100 text-stone-400',
  running: 'bg-amber-100 text-amber-700 animate-pulse',
  pass:    'bg-[#dce9de] text-[#2d5a3d]',
  fail:    'bg-[#f9ddd9] text-[#7c3733]',
}

const STATUS_LABEL: Record<TestStatus, string> = {
  idle:    'IDLE',
  running: 'RUN',
  pass:    'PASS',
  fail:    'FAIL',
}

export function FoodServiceTestPage() {
  const [uid, setUid] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null)
      setAuthLoading(false)
    })
  }, [])

  async function handleRun() {
    if (!uid) return
    setRunning(true)
    setResults([])
    try {
      await runTests(uid, setResults)
    } finally {
      setRunning(false)
    }
  }

  const passed = results.filter((r) => r.status === 'pass').length
  const failed = results.filter((r) => r.status === 'fail').length
  const done = results.length > 0 && !running

  return (
    <main className="min-h-svh bg-[#f8f7f2] px-5 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#426a5a]">
          Dev tools
        </div>
        <h1 className="mb-1 text-2xl font-black tracking-tight">Food Service Tests</h1>
        <p className="mb-6 text-sm text-stone-500">
          Runs all food service operations against your real Firestore. Test items are cleaned up automatically.
        </p>

        {/* Auth state */}
        {authLoading ? (
          <p className="text-sm text-stone-400">Checking auth…</p>
        ) : !uid ? (
          <div className="rounded-2xl bg-[#f9ddd9] px-5 py-4 text-sm text-[#7c3733]">
            Not signed in. <a href="/login" className="font-bold underline">Sign in first</a>, then come back to this page.
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#dce9de] px-3 py-1.5 text-xs font-bold text-[#2d5a3d]">
                uid: {uid}
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                className="rounded-xl bg-[#426a5a] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-[#355747] transition-colors"
              >
                {running ? 'Running…' : results.length > 0 ? 'Run again' : 'Run tests'}
              </button>
            </div>

            {/* Summary */}
            {done && (
              <div className={`mb-5 rounded-2xl px-5 py-4 text-sm font-bold ${failed === 0 ? 'bg-[#dce9de] text-[#2d5a3d]' : 'bg-[#f9ddd9] text-[#7c3733]'}`}>
                {failed === 0
                  ? `All ${passed} tests passed.`
                  : `${passed} passed · ${failed} failed`}
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <ul className="space-y-2">
                {results.map((result, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-[#e5e1d5] bg-white px-4 py-3.5"
                  >
                    <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black tracking-widest ${STATUS_STYLES[result.status]}`}>
                      {STATUS_LABEL[result.status]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">{result.name}</p>
                      {result.detail && (
                        <p className="mt-0.5 truncate text-xs text-stone-400">{result.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
