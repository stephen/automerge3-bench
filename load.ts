import { resolve } from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import { heapStats } from 'bun:jsc'

const usage = `
USAGE: bun load.ts <version> <filepath>
  version: 2 or 3 (for automerge2 or automerge3)
  filepath: path to the .tnd file to load
`

// Parse arguments
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error(usage)
  process.exit(1)
}

const version = args[0]
const filepath = resolve(args[1])

// Validate arguments
if (version !== '2' && version !== '3') {
  console.error('Version must be 2 or 3')
  console.error(usage)
  process.exit(1)
}

// Import the correct automerge version
const Automerge = version === '2' 
  ? await import('automerge2')
  : await import('automerge3')

// Load the file
try {
  const stats = statSync(filepath)
  const fileSize = stats.size
  console.log(`File size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)

  const startLoad = performance.now()
  const file = readFileSync(filepath)
  const loadTime = performance.now() - startLoad
  
  console.log(`File read time: ${loadTime.toFixed(2)} ms`)

  // Parse the document
  const startParse = performance.now()
  const doc = Automerge.load(file)
  const parseTime = performance.now() - startParse
  
  console.log(`\nAutomerge${version} load time: ${parseTime.toFixed(2)} ms`)
  
  // Report heap usage
  const heap = heapStats()
  console.log(`\nHeap stats:`)
  console.log(`  Size: ${(heap.heapSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  Objects: ${heap.objectCount.toLocaleString()}`)
  
} catch (error) {
  console.error(`Error loading file: ${error.message}`)
  process.exit(1)
}