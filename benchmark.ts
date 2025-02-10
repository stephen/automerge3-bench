import * as Automerge2 from 'automerge2'
import * as Automerge3 from 'automerge3'
import * as fs from 'node:fs'
import { performance } from 'node:perf_hooks'

// Read the documents
const smallDoc = fs.readFileSync('data/42pW7cz4u4Yi81uU4hBp74-1738620695537-demo-docv3.tnd')
const largeDoc = fs.readFileSync('data/5wxCCUYVTVv6GfjUKaNwSh-1739211904060-dev-docv4.tnd')

// Function to run a benchmark multiple times and get average
function runBenchmark(name: string, fn: () => void, iterations: number = 10) {
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }

  const average = times.reduce((a, b) => a + b) / times.length
  const min = Math.min(...times)
  const max = Math.max(...times)

  console.log(`${name}:`)
  console.log(`  Average: ${average.toFixed(3)}ms`)
  console.log(`  Min: ${min.toFixed(3)}ms`)
  console.log(`  Max: ${max.toFixed(3)}ms`)
}

// Print file sizes for context
console.log('\n=== Document Sizes ===')
console.log(`Small doc: ${(smallDoc.length / 1024).toFixed(2)} KB`)
console.log(`Large doc: ${(largeDoc.length / 1024).toFixed(2)} KB`)

console.log('\n=== Small Document Load Performance ===')

// Benchmark Automerge 2 load (small)
runBenchmark('Automerge 2 Load', () => {
  Automerge2.load(smallDoc)
})

// Benchmark Automerge 3 load (small)
runBenchmark('Automerge 3 Load', () => {
  Automerge3.load(smallDoc)
})

console.log('\n=== Large Document Load Performance ===')

// Benchmark Automerge 2 load (large)
runBenchmark('Automerge 2 Load', () => {
  Automerge2.load(largeDoc)
})

// Benchmark Automerge 3 load (large)
runBenchmark('Automerge 3 Load', () => {
  Automerge3.load(largeDoc)
})