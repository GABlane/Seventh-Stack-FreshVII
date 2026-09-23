import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { seedReferenceData } from './seed-reference-data.js'
import { seedDemoData } from './seed-demo-data.js'

// Load .env.seed
try {
  const env = readFileSync(resolve(process.cwd(), '.env.seed'), 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key?.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch {
  // .env.seed is optional if DEMO_UID is already in the environment
}

const reset = process.argv.includes('--reset')

seedReferenceData()
  .then(() => seedDemoData(reset))
  .then(() => {
    console.log('\nAll seed data written successfully.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
