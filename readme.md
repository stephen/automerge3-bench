# Automerge 3 vs Automerge 2 bench

```bash
npm install
npm start
```

or

```bash
bun benchmark.ts
```

## Results
I saw roughly the same order of magnitude between bun and node, testing on bun v1.2.2 and node v23.3.0.

```
=== Document Sizes ===
Small doc: 172.90 KB
Large doc: 1818.15 KB

=== Small Document Load Performance ===
Automerge 2 Load:
  Average: 58.264ms
  Min: 54.924ms
  Max: 83.241ms
Automerge 3 Load:
  Average: 155.982ms
  Min: 151.401ms
  Max: 186.694ms

=== Large Document Load Performance ===
Automerge 2 Load:
  Average: 644.206ms
  Min: 637.339ms
  Max: 652.644ms
Automerge 3 Load:
  Average: 1788.380ms
  Min: 1767.410ms
  Max: 1806.310ms
```
