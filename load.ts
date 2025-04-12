import { file, generateHeapSnapshot } from 'bun'
import { heapStats } from 'bun:jsc'

const usage = `
USAGE: bun load.ts <version> <filepath> [--heap]
  version: 2 or 3 (for automerge2 or automerge3)
  filepath: path to the .tnd file to load
  --heap: optional flag to generate heap snapshot
`

// Parse arguments
const args = process.argv.slice(2)
if (args.length < 2) {
  console.error(usage)
  process.exit(1)
}

const version = args[0]
const filepath = args[1]
const generateHeapDump = args.includes('--heap')

if (version !== '2' && version !== '3') {
  console.error('Version must be 2 or 3')
  console.error(usage)
  process.exit(1)
}

const Automerge = version === '2'
  ? await import('automerge2')
  : await import('automerge3')

const f = file(filepath)
const fileSize = await f.size
console.log(`File size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)

const startLoad = performance.now()
const fileData = await f.arrayBuffer()
const loadTime = performance.now() - startLoad

console.log(`File read time: ${loadTime.toFixed(2)} ms`)

// Parse the document
const startParse = performance.now()
const doc = Automerge.load(new Uint8Array(fileData))
const parseTime = performance.now() - startParse

console.log(`\nAutomerge${version} load time: ${parseTime.toFixed(2)} ms`)

// Report heap usage
const heap = heapStats()
console.log(`\nHeap stats:`)
console.log(`  Size: ${(heap.heapSize / 1024 / 1024).toFixed(2)} MB`)
console.log(`  Objects: ${heap.objectCount.toLocaleString()}`)

// Generate and save heap snapshot if flag is set
if (generateHeapDump) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `heap-snapshot-${version}-${filepath.split('/').pop()}-${timestamp}.json`
  const snapshot = generateHeapSnapshot()
  await Bun.write(filename, JSON.stringify(snapshot, null, 2))
  console.log(`\nHeap snapshot saved to: ${filename}`)
}
