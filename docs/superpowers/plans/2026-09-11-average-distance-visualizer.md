# Average Distance Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fluid, accessible GitHub Pages experience that demonstrates a million-sample Monte Carlo estimate of the average distance between two random points in a configurable rectangle.

**Architecture:** A Vite React application owns a five-state experience flow. Pure seeded math utilities feed both a Web Worker simulation and deterministic visual samples; Motion animates DOM scenes and Canvas renders the dense experiment field.

**Tech Stack:** React 19, TypeScript, Vite, Motion, Vitest, Canvas 2D, Web Workers, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-09-11-average-distance-visualizer-design.md`

## Global Constraints

- Simulate exactly `1,000,000` point pairs per completed run.
- Rectangle sides are independently clamped to `0.5–3.0`, defaulting to `1.0`.
- The analytical answer is reference data; the animated estimate comes from sampled distances.
- Use Canvas for the repeated experiment field and semantic DOM controls for interaction.
- Preserve keyboard access, WCAG AA contrast, responsive layouts, and `prefers-reduced-motion` behavior.
- Support deployment under a non-root GitHub Pages repository path.
- Do not add accounts, analytics, external APIs, sound, 3D, history, or selectable sample counts.

---

### Task 1: Project foundation and deterministic mathematics

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`
- Create: `src/math/simulation.ts`
- Create: `src/math/simulation.test.ts`

**Interfaces:**
- Produces: `Point`, `PointPair`, `mulberry32(seed)`, `createPointPair(a, b, rng)`, `distance(pair)`, `analyticalMean(a, b)`, and `simulateBatch(options)`.

- [ ] **Step 1: Scaffold the Vite/TypeScript configuration and install React, Motion, Vite, TypeScript, and Vitest.**
- [ ] **Step 2: Write failing tests asserting seeded reproducibility, known distances, the unit-square analytical value `0.521405433...`, symmetry under swapping sides, and exact aggregation counts.**
- [ ] **Step 3: Run `npm.cmd test -- --run src/math/simulation.test.ts` and verify the missing math module causes failure.**
- [ ] **Step 4: Implement the pure math API, using a compensated running sum and the analytical rectangle formula from the spec.**
- [ ] **Step 5: Run the focused tests and `npm.cmd run typecheck`; verify both pass.**
- [ ] **Step 6: Commit with `feat: add deterministic distance simulation math`.**

### Task 2: Worker simulation and resilient runner

**Files:**
- Create: `src/simulation/protocol.ts`
- Create: `src/simulation/simulation.worker.ts`
- Create: `src/simulation/runSimulation.ts`
- Create: `src/simulation/runSimulation.test.ts`

**Interfaces:**
- Consumes: `simulateBatch`, `mulberry32`.
- Produces: `SimulationProgress { completed, total, mean }`, `SimulationResult`, and `runSimulation({ a, b, seed, total, onProgress, workerFactory? }): { promise, cancel }`.

- [ ] **Step 1: Write failing tests for monotonic progress, exact completion count, cancellation, and worker/fallback result equivalence on deterministic small runs.**
- [ ] **Step 2: Run `npm.cmd test -- --run src/simulation/runSimulation.test.ts`; verify it fails because the runner is absent.**
- [ ] **Step 3: Implement typed worker messages, batched execution, throttled progress, cancellation, and scheduled main-thread fallback.**
- [ ] **Step 4: Run the worker-runner tests and the complete test suite; verify they pass.**
- [ ] **Step 5: Commit with `feat: add non-blocking million-sample runner`.**

### Task 3: Experience flow and accessible controls

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/types.ts`
- Create: `src/components/IntroScene.tsx`, `SetupScene.tsx`, `ExperimentScene.tsx`, `SimulationScene.tsx`, `ResultScene.tsx`
- Create: `src/components/DimensionControl.tsx`, `src/components/PrimaryButton.tsx`
- Create: `src/App.test.tsx`, `src/test/setup.ts`

**Interfaces:**
- Consumes: math and runner APIs from Tasks 1–2.
- Produces: the five-state `Scene` experience and user actions for start, configure, simulate, replay, retry, and reset.

- [ ] **Step 1: Add Testing Library and write failing interaction tests for intro-to-setup navigation, dimension changes, simulation start, result actions, and accessible slider labels.**
- [ ] **Step 2: Run `npm.cmd test -- --run src/App.test.tsx`; verify it fails because the UI is absent.**
- [ ] **Step 3: Implement the scene state machine and semantic controls, keeping canvas visuals behind textual equivalents and throttling live-region progress announcements.**
- [ ] **Step 4: Run the interaction tests and typecheck; verify both pass.**
- [ ] **Step 5: Commit with `feat: build average distance experience flow`.**

### Task 4: Visual system, camera transitions, and experiment field

**Files:**
- Create: `src/styles.css`
- Create: `src/components/RectangleStage.tsx`
- Create: `src/components/ExperimentField.tsx`
- Create: `src/hooks/useReducedMotionPreference.ts`

**Interfaces:**
- Consumes: `PointPair`, rectangle dimensions, seeded RNG, scene state, and simulation progress.
- Produces: shared rectangle geometry, SVG featured-pair drawing, responsive Canvas field, and reduced-motion-safe transitions.

- [ ] **Step 1: Implement the off-white/cobalt design tokens, typography, responsive layout, focus styling, sliders, result typography, and noise/coordinate-line atmosphere.**
- [ ] **Step 2: Implement the shared rectangle stage with animated aspect ratio, two points, segment drawing, question-mark reveal, and formula annotation.**
- [ ] **Step 3: Implement a device-pixel-ratio-aware Canvas field whose deterministic representative cells animate in with progress.**
- [ ] **Step 4: Connect Motion transitions using transform/opacity and replace camera movement with short crossfades under reduced-motion preference.**
- [ ] **Step 5: Run tests, typecheck, and production build; verify no regressions or asset errors.**
- [ ] **Step 6: Commit with `feat: add cinematic simulation visuals`.**

### Task 5: GitHub Pages delivery and final verification

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: the completed application.
- Produces: a Pages-compatible static build and concise local/deployment instructions.

- [ ] **Step 1: Configure Vite's relative asset base and a GitHub Pages build/deploy workflow using the official Pages actions.**
- [ ] **Step 2: Document local development, test/build commands, and repository Pages activation.**
- [ ] **Step 3: Run `npm.cmd test -- --run`, `npm.cmd run typecheck`, and `npm.cmd run build`; verify all pass.**
- [ ] **Step 4: Preview the production build and inspect intro, setup extremes, full simulation, replay/reset, mobile sizing, keyboard focus, and reduced motion in a browser.**
- [ ] **Step 5: Inspect `dist/index.html` and emitted asset paths to confirm repository-subpath compatibility.**
- [ ] **Step 6: Commit with `chore: prepare GitHub Pages deployment`.**
