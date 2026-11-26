# Premium experience design

How the redesigned twin is meant to be experienced, and the rules the interface follows. Screenshots: [`screenshots/after/`](screenshots/after/).

## Three layers, one simulation

| Layer | What the visitor does | How the interface responds |
|---|---|---|
| **Experience** | Watches. | Explore mode: the guided sequence advances on engineering events (vehicle parked, phase reached), not on a timer. Stage card, four instruments, captions. Nothing else. |
| **Understand** | Selects a part, or opens Learn mode. | The camera frames the part from its own bounds; the inspector opens at level one (*What is it? What does it do? What is happening now?*). Learn mode adds the stage's explanation and the Science panel (concept, equation, models, lesson link). |
| **Research** | Opens Engineer or Research mode. | The inputs drawer (station inputs and fault injection) and the Data panel (sequence, power and losses, coupling, battery, telemetry) appear. The full laboratories (Physics, Simulation, Circuit, IoT, Research, Workshop, Assurance) stay one click away in the section bar. |

Switching mode, section, view or environment never resets a simulation. Only *Restart* does.

## Page

1. **Cinematic opening** — a poster rendered from the twin's own 3D scene (not stock imagery), behind minimal copy: brand, title, tagline, the four descriptors, programme, attribution, *Enter Research Laboratory* and *Watch Technology Demonstration*. A caption on the poster says it is rendered from the twin and that values are simulated.
2. **Laboratory** — toolbar, section bar, then the laboratory shell.
3. **Long-form content** — research question, five environments (Smart Parking shown as planned), energy chain, model registry, programme, PoC, assurance, Research & Project Leadership (unchanged), FAQ.

## Laboratory layout

```
┌ Toolbar: EV.ENGINEER™ · Digital Twin Laboratory · [02 Station] │ Explore Learn Engineer Research │ Demonstration · Quality · Full screen
├ Sections: Overview  Digital Twin  Physics & Mathematics  …  Engineering Assurance            (mode description)
├──────┬──────────────────────────────────────────────────────────────┬───────────────────┐
│ Rail │ [Stage card]                                [Instruments]    │ Inspector          │
│ 01 P │                                                              │ (only when wanted) │
│ 02 ⚡ │                       3D scene                               │ Component │Science │
│ 03   │                                                              │ │ Data             │
│ 04   │ [Inputs drawer — Engineer/Research]          [Legend]        │                    │
│ 05   │                     [Caption]                                │                    │
│ Inputs│ [◀ ▶ ❚❚ ▷| ↺ │ 5/12 Stage title ▬▬▬▬▬▬▭▭▭ │ time · speed · camera · view · narration · captions · sound] │
└──────┴──────────────────────────────────────────────────────────────┴───────────────────┘
```

- The scene covers **79 %** of a 1440 × 900 desktop and **85 %** in full screen (measured). It was 42 % and 36 % on desktop and laptop before.
- The rail lists all five environments; Smart Parking is disabled with a *Planned* badge.
- The inspector takes a column on desktop, a side sheet on tablets and a bottom sheet on phones.
- The timeline's stage strip is the scrubber: each segment is a stage, filled as the stage progresses; clicking one opens it.
- Accelerated time is always labelled (*Accelerated ×60*) in amber next to the simulation clock.
- The camera button turns amber when the visitor has taken the camera; clicking it returns to the guided camera.

## Phones and tablets

Phones get a stacked toolbar, a horizontally scrolling environment rail, a two-row timeline, a scrolling instrument strip above it, no captions over the scene (the stage card carries the objective) and the inspector as a bottom sheet. Quality and speed selectors are hidden on phones (Auto quality and the stage's own speed apply). Rendering on phones uses the same adaptive pixel ratio as desktop.

## Visual language

- **Colour:** EV.ENGINEER™ green (`#4ca930`) for actions and the active choice; restrained cyan (`#7fd8ff`) for scientific data, equations and overlays; amber for accelerated time, caution and the visitor's own camera; warning orange for faults. Copper for windings, neutral metals for hardware.
- **Glass layers:** dark, slightly translucent panels with a fine border and blur, never neon outlines or glows. The selected component is tinted cyan at low intensity and breathes slowly (still under reduced motion).
- **Labels:** every number says what it is — `INPUT`, `CALCULATED` or a data mode (`SIMULATED`); nothing is labelled `LIVE`.
- **Lighting:** a blue-hour studio sky generated in the browser for reflections, one cool key light with soft shadows, a warm fill, canopy downlights; AgX tone mapping; bloom only above a high threshold.
- **Inspection views** close the fog into a dark studio around the subject and fade the city; the canopy fades whenever it stands between a close camera and its subject.

## Interaction modes

| Mode | Panels | Guided sequence |
|---|---|---|
| Explore | Stage card (objective), four instruments, captions | Auto-advances until the visitor interacts |
| Learn | + stage explanation, Science panel | Manual (Continue tour) |
| Engineer | + inputs drawer with fault injection, Data panel, all instruments | Manual |
| Research | As Engineer; Research-only details appear in the laboratories (solver steps, sweeps, verification) | Manual |

## Accessibility

Keyboard: every control is a native button, select or range input; Esc leaves the demonstration, then the selection, then overlay full screen; F toggles full screen. Radio groups and tabs carry roles and names. Captions are on by default and can be turned off; narration and sound are off until chosen. Reduced motion makes camera moves cuts and view changes instant. The server sends a readable page without script; the 3D chunk loads only on the client.
