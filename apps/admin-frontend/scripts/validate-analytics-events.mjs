#!/usr/bin/env node
/**
 * Ensures src/utils/analytics.ts GAEvents string values match src/analytics/events.json (DE-01).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const manifestPath = join(root, 'src/analytics/events.json')
const analyticsPath = join(root, 'src/utils/analytics.ts')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const allowed = new Set(manifest.events)
const src = readFileSync(analyticsPath, 'utf8')

const block = src.match(/export const GAEvents = \{([\s\S]*?)\} as const/)
if (!block) {
  console.error('validate-analytics-events: could not find GAEvents block')
  process.exit(1)
}

const re = /\b[A-Z0-9_]+\s*:\s*'([^']*)'/g
const fromTs = []
let m
while ((m = re.exec(block[1])) !== null) {
  fromTs.push(m[1])
}

const missingInJson = fromTs.filter((e) => !allowed.has(e))
if (missingInJson.length) {
  console.error('validate-analytics-events: GAEvents values missing from events.json:', missingInJson)
  process.exit(1)
}

const inTs = new Set(fromTs)
const orphanInJson = [...allowed].filter((e) => !inTs.has(e))
const builtins = new Set(['page_view', 'timing_complete'])
const unexpectedOrphans = orphanInJson.filter((e) => !builtins.has(e))
if (unexpectedOrphans.length) {
  console.error(
    'validate-analytics-events: events.json entries not present in GAEvents:',
    unexpectedOrphans
  )
  process.exit(1)
}

console.log('validate-analytics-events: OK (%d registered events)', allowed.size)
