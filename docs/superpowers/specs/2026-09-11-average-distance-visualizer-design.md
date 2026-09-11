# Average Distance Visualizer — Design Specification

## Purpose

Build a polished, self-contained educational website that answers the question: “What is the average distance between two uniformly random points inside a rectangle?” The initial problem uses a unit square, while the interactive experience lets the visitor change the rectangle sides `a` and `b` and observe how the result changes.

The experience should make the Monte Carlo method understandable without turning into a textbook page. Motion, spatial continuity, and restraint are the primary presentation tools.

## User Journey

The application is a single full-viewport experience with five states. Transitions preserve spatial continuity so the visitor feels that one scene transforms into the next rather than navigating between pages.

1. **Introduction**
   - State the unit-square problem in one short sentence.
   - Show a minimal geometric motif and the primary action `Исследовать`.
   - Do not reveal the answer before the experiment.

2. **Rectangle setup**
   - Let the visitor set `a` and `b` independently from `0.5` to `3.0`.
   - Default both values to `1.0`.
   - Provide sliders plus keyboard-accessible numeric values.
   - Animate the displayed rectangle continuously as its aspect ratio changes.
   - Keep the drawing normalized to the available viewport; dimensions communicate proportions, not physical pixels.

3. **Single experiment**
   - Place two uniformly random points in the configured rectangle.
   - Draw the connecting segment from the first point to the second.
   - Reveal a question mark above the segment to establish the unknown distance.
   - Briefly reveal the coordinate differences and the distance expression without delaying the flow.

4. **Million-experiment simulation**
   - Pull the camera back until the first rectangle occupies the upper-left cell.
   - Fill the viewport with many small representations of further experiments.
   - Start a real Monte Carlo calculation of exactly `1,000,000` point pairs.
   - Show the processed-sample count and the converging running mean.
   - The visible grid is a representative visualization; it must not imply that every one of the million samples is drawn.

5. **Result**
   - Dissolve the simulation field into the final estimated mean.
   - Show the analytical value and absolute error alongside it.
   - For `a = b = 1`, the analytical value is approximately `0.521405433`.
   - Offer `Повторить` to run a new seeded experiment and `Изменить стороны` to return to setup.

## Visual Direction

The visual language is “mathematical OOBE”: calm, confident, spacious, and focused. It takes inspiration from the smooth pacing of a Windows first-run experience without copying its graphics.

- Warm off-white background rather than pure white.
- Near-black primary typography.
- A single saturated cobalt accent for points, progress, and primary controls.
- Fine coordinate lines and low-contrast construction marks.
- Geometric sans-serif display typography; monospace typography for coordinates, formulas, counters, and measurements.
- Generous negative space and no card grid, glass panels, decorative gradients, or unrelated illustrations.
- Responsive compositions should retain the same narrative hierarchy on desktop and mobile.

## Motion System

- Treat all scenes as positions of one virtual camera.
- Use transform and opacity for primary transitions.
- Target `700–1000 ms` for scene changes and `150–300 ms` for control feedback.
- Use restrained easing with a soft deceleration; avoid bounce effects.
- Keep the rectangle as a shared visual object between setup, single experiment, and zoom-out.
- Render the large experiment field on Canvas rather than creating hundreds of animated DOM nodes.
- Maintain a responsive interface while the calculation runs.
- Under `prefers-reduced-motion`, replace camera zooms and long drawing sequences with short crossfades while retaining all information and controls.

## Mathematical Model

For each sample, generate independent coordinates:

```text
x1, x2 ~ Uniform(0, a)
y1, y2 ~ Uniform(0, b)
d = sqrt((x1 - x2)^2 + (y1 - y2)^2)
```

The Monte Carlo estimate after `N = 1,000,000` samples is:

```text
mean = (d1 + d2 + ... + dN) / N
```

The analytical mean for positive rectangle sides `a` and `b`, with `r = sqrt(a^2 + b^2)`, is:

```text
E[d] = 1/15 * (
  a^3 / b^2
  + b^3 / a^2
  + r * (3 - a^2 / b^2 - b^2 / a^2)
  + 5/2 * (
      b^2 / a * ln((a + r) / b)
      + a^2 / b * ln((b + r) / a)
    )
)
```

This formula is used only as the reference on the result screen; the animated estimate must come from the actual sampled distances.

## Architecture

Use React, TypeScript, and Vite. The application is static and deployable to GitHub Pages.

The code is separated into four responsibilities:

- **Experience state:** controls the current scene, selected dimensions, seed, simulation status, and replay/reset actions.
- **Scene components:** render the introduction, setup, single experiment, simulation, and result views.
- **Simulation worker:** generates seeded random points and calculates one million distances in batches, posting progress snapshots to the UI.
- **Math utilities:** contain the deterministic pseudo-random generator, distance calculation, and analytical rectangle formula.

Motion handles scene and element transitions. Canvas handles the repeated experiment field. Semantic HTML controls remain in the DOM for accessibility.

## Simulation Data Flow

1. Entering the experiment creates a seed and derives the featured point pair from it.
2. The featured pair is passed to the single-experiment scene.
3. As the zoom-out begins, the UI starts the Worker with `a`, `b`, seed, and `1,000,000` samples.
4. The Worker calculates in batches and posts `{ completed, mean }` snapshots at a rate that does not flood the main thread.
5. The Canvas scene uses the same seeded sequence for representative cells, keeping the narrative visually consistent with the calculation.
6. On completion, the UI compares the estimate with the analytical value and transitions to the result.
7. Replay generates a new seed; changing dimensions cancels the active worker and returns to setup.

## Failure and Edge Handling

- Clamp dimensions to the supported `0.5–3.0` range.
- Prevent duplicate starts while a simulation is active.
- Terminate obsolete workers when replaying, navigating back, or unmounting.
- If Worker construction or execution fails, continue the same million-sample calculation in small scheduled batches on the main thread so controls and painting remain responsive.
- If the fallback also fails unexpectedly, show a concise recoverable error with actions to retry or return to setup.
- Preserve enough decimal precision internally to avoid rounding drift; round only for display.

## Accessibility

- Every action is keyboard reachable and has a visible focus state.
- Sliders expose labels, current values, minimum, maximum, and step.
- Progress is announced through a throttled accessible status region rather than on every batch.
- Canvas is decorative and has a textual equivalent in the surrounding interface.
- Text and controls meet WCAG AA contrast.
- The full experience remains understandable with reduced motion enabled.

## Verification

- Unit-test distance calculation, seeded reproducibility, analytical values, and the unit-square reference.
- Test simulation aggregation with small deterministic sample counts.
- Verify worker progress is monotonic and completion occurs at exactly `1,000,000` samples.
- Verify fallback calculation produces the same seeded result as the worker path.
- Run type checking, production build, and automated tests.
- Manually inspect desktop and mobile layouts, keyboard navigation, replay/reset flows, smoothness, and reduced-motion behavior.
- Confirm the built site works under a non-root GitHub Pages base path.

## Deployment

Provide a GitHub Actions workflow that builds and deploys the Vite output to GitHub Pages. Configure Vite so assets resolve correctly for a repository subpath. No backend, analytics, accounts, or external API is required.

## Explicit Non-Goals

- Drawing all one million samples individually.
- User-selectable sample counts.
- Multiple simultaneous distributions or geometric shapes.
- Saving or sharing experiment history.
- Sound, 3D graphics, scroll-driven sections, or explanatory textbook chapters.
