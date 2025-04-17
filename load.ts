// Detect environment
const isBun = typeof process !== 'undefined' && process.versions && process.versions.bun;

// Import bun-specific modules conditionally
let file, generateHeapSnapshot, heapStats;
if (isBun) {
  const bunImports = await import('bun');
  file = bunImports.file;
  generateHeapSnapshot = bunImports.generateHeapSnapshot;
  const jscImports = await import('bun:jsc');
  heapStats = jscImports.heapStats;
}

const usage = `
USAGE: ${isBun ? 'bun' : 'node'} load.ts <version> <filepath> [--heap]
  version: 2 or 3 (for automerge2 or automerge3)
  filepath: path to the .tnd file to load
  --heap: optional flag to generate heap snapshot (bun only)
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

// Load file using appropriate method for environment
let fileData, fileSize;
const startLoad = performance.now();

if (isBun) {
  // Bun implementation
  const f = file(filepath);
  fileSize = await f.size;
  fileData = await f.arrayBuffer();
} else {
  // Node implementation
  const fs = await import('fs/promises');
  const stats = await fs.stat(filepath);
  fileSize = stats.size;
  fileData = await fs.readFile(filepath);
}

const loadTime = performance.now() - startLoad
console.log(`File size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)

console.log(`File read time: ${loadTime.toFixed(2)} ms`)

// Parse the document
const startParse = performance.now()
const doc = Automerge.load(new Uint8Array(fileData))
const parseTime = performance.now() - startParse

console.log(`\nAutomerge${version} load time: ${parseTime.toFixed(2)} ms`)

// Report heap usage if available
if (isBun) {
  const heap = heapStats();
  console.log(`\nHeap stats:`)
  console.log(`  Size: ${(heap.heapSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  Objects: ${heap.objectCount.toLocaleString()}`)
} else {
  console.log(`\nHeap stats not available in Node.js`)
}

// Generate and save heap snapshot if flag is set (Bun only)
if (generateHeapDump) {
  if (isBun) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `heap-snapshot-${version}-${filepath.split('/').pop()}-${timestamp}.json`
    const snapshot = generateHeapSnapshot()
    await Bun.write(filename, JSON.stringify(snapshot, null, 2))
    console.log(`\nHeap snapshot saved to: ${filename}`)
  } else {
    console.log(`\nHeap snapshot generation is only available in Bun`)
  }
}
