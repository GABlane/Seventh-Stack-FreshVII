/**
 * Shared Firebase client for seed scripts.
 * Uses the same firebase package already installed in the project.
 * Auth credentials are read from .env.seed at the project root.
 */
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(path: string): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.startsWith('#'))
        .map((l) => {
          const [k, ...rest] = l.split('=')
          return [k.trim(), rest.join('=').trim()]
        })
    )
  } catch {
    return {}
  }
}

// Load .env (project Firebase config) and .env.seed (demo user credentials)
const projectEnv = loadEnvFile(resolve(process.cwd(), '.env'))
const seedEnv = loadEnvFile(resolve(process.cwd(), '.env.seed'))
Object.assign(process.env, projectEnv, seedEnv)

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key} — check your .env file`)
}

if (!getApps().length) {
  initializeApp({
    apiKey:            process.env.VITE_FIREBASE_API_KEY,
    authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.VITE_FIREBASE_APP_ID,
  })
}

export const db = getFirestore()
export const auth = getAuth()

export async function signInAsDemo(): Promise<string> {
  const email = process.env.DEMO_EMAIL
  const password = process.env.DEMO_PASSWORD
  if (!email || !password) {
    throw new Error(
      'Missing DEMO_EMAIL or DEMO_PASSWORD in .env.seed\n' +
      'Create .env.seed with:\n  DEMO_EMAIL=you@example.com\n  DEMO_PASSWORD=yourpassword'
    )
  }
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user.uid
}
