import * as Automerge2 from 'automerge2';
import * as Automerge3 from 'automerge3';
import * as fs from 'node:fs';

// import { heapStats } from 'bun:jsc';

console.log("automerge", Automerge2 !== undefined, Automerge3 !== undefined)

// Use performance API that works in both Node and Bun
const now = typeof performance !== 'undefined'
  ? () => performance.now()
  : () => Date.now()

const smallDoc = fs.readFileSync('data/42pW7cz4u4Yi81uU4hBp74-1738620695537-demo-docv3.tnd')
const largeDoc = fs.readFileSync('data/5wxCCUYVTVv6GfjUKaNwSh-1739211904060-dev-docv4.tnd')

function runBenchmark(name: string, fn: () => void, iterations: number = 20, previousResults?: { average: number, p50: number, p95: number, p99: number }) {
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = now()
    fn()
    const end = now()
    times.push(end - start)
  }

  times.sort((a, b) => a - b)

  const average = times.reduce((a, b) => a + b) / times.length
  const p50 = times[Math.floor(times.length * 0.5)]
  const p95 = times[Math.floor(times.length * 0.95)]
  const p99 = times[Math.floor(times.length * 0.99)]

  console.log(`${name}:`)
  console.log(`  Average: ${average.toFixed(3)}ms${previousResults ? ` (${calcChange(average, previousResults.average)})` : ''}`)
  console.log(`  p50: ${p50.toFixed(3)}ms${previousResults ? ` (${calcChange(p50, previousResults.p50)})` : ''}`)
  console.log(`  p95: ${p95.toFixed(3)}ms${previousResults ? ` (${calcChange(p95, previousResults.p95)})` : ''}`)
  console.log(`  p99: ${p99.toFixed(3)}ms${previousResults ? ` (${calcChange(p99, previousResults.p99)})` : ''}`)

  function calcChange(current: number, previous: number) {
    const percentChange = ((current - previous) / previous) * 100
    const changeSymbol = percentChange > 0 ? '+' : ''
    return `${changeSymbol}${percentChange.toFixed(2)}%`
  }

  return { average, p50, p95, p99 }
}

console.log('\n=== Document Sizes ===')
console.log(`Small doc: ${(smallDoc.length / 1024).toFixed(2)} KB`)
console.log(`Large doc: ${(largeDoc.length / 1024).toFixed(2)} KB`)

console.log('\n=== Small Document Load Performance ===')

const smallAm2Results = runBenchmark('Automerge 2 Load', () => {
  Automerge2.load(smallDoc)
})

runBenchmark('Automerge 3 Load', () => {
  Automerge3.load(smallDoc)
}, 20, smallAm2Results)

console.log('\n=== Large Document Load Performance ===')

const largeAm2Results = runBenchmark('Automerge 2 Load', () => {
  Automerge2.load(largeDoc)
})

runBenchmark('Automerge 3 Load', () => {
  Automerge3.load(largeDoc)
}, 20, largeAm2Results)

// const stats = heapStats();
// console.log("Heap: size:", stats.heapSize, "objects:", stats.objectCount);
