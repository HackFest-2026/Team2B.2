---
name: apple-design
description: Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible transitions, translucent materials and depth, typography (optical sizing, tracking, leading), reduced-motion, or the design foundations (feedback, spatial consistency, restraint) behind Apple-style interfaces.
---

# Apple Design: Principles for Web Interfaces

How Apple builds interfaces that stop feeling like a computer and start feeling like an extension of you. Distilled from Apple's WWDC design talks — chiefly *Designing Fluid Interfaces* (WWDC 2018) — and translated to the modern web platform.

The core through-line: **an interface feels alive when motion starts from the current on-screen value, responds instantly to touch, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant.** Springs make this natural because they are inherently interruptible and velocity-aware.

## 1. Response — Kill Latency
* **Respond on pointer-down, not on release.** Highlight buttons, cards, and interactive rows the instant they are pressed.
* **Continuous feedback during interactions.** Sliders, tabs, drawers, and modal transitions update smoothly with the pointer.
* **Micro-press scale feedback:**
```css
.interactive-card:active {
  transform: scale(0.985);
  transition: transform 120ms cubic-bezier(0.2, 0, 0, 1);
}
```

## 2. Direct Manipulation & Spatial Consistency
* Touch and content move together.
* **Anchor interactions to their source.** Menus, inspectors, and popovers originate spatially from the trigger button that summoned them (`transform-origin`).
* **Symmetric entry and exit paths.** If an evidence slide-over opens from the right, it dismisses back to the right. Never enter from the right and vanish downward.

## 3. Interruptibility & Fluid Springs
* Animations must never lock out user input.
* Transitions should be critically damped (smooth settle without jarring or comical oscillations) unless reflecting momentum.
* Damping ratio `1.0` for navigation, sheets, and inspections.
* Dynamic response values: ~`0.35s` for drawers and panels, ~`0.15s` for toggles and buttons.

## 4. Visual Restraint & Material Hierarchy
* Clean off-white surface canvases (`#F8FAFC`).
* Crisp, hairline border framing (`border border-slate-200/80`).
* Purposeful translucency (`backdrop-blur-md bg-white/80`).
* High-contrast technical typography: Bold sans-serif titles paired with clean tabular numbers and uppercase tracked status tags (`tracking-wider text-xs font-mono`).
* Electric blue active accents (`#2563EB`) with disciplined restraint—color communicates state, not decoration.
