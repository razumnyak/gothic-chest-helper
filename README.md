# Lockpicking Solver

Static GitHub Pages calculator for a plate lock puzzle.

## Use

Open the published GitHub Pages URL and configure:

- plate count
- initial plate positions
- shift effects

Click `Calculate` to find a solution. Use the Solution controls to step through
the result or play the animation.

## Sharing Codes

The `Code` field stores the full calculator state as a short string:

- plate count
- initial positions
- shift effects

To report a puzzle setup, open an Issue and include:

```text
Preset:
Code:
Expected:
Actual:
```

## Presets

Presets live in `index.html` in `PRESET_TEMPLATE_LINES`.

Format:

```text
Preset name|Code
```

Example:

```js
const PRESET_TEMPLATE_LINES = `
Custom preset|EDDDDDCBBBBBCBBBBBCBBBBBCBBBBBC
Old Cave - Ulbert #1|FABFBDFCCBBABACBABCBBCBBBBABCACBBCBCBBBBBCC
`;
```

This repository is intended to stay minimal for GitHub Pages:

- `index.html`
- `README.md`
- `src/plate.png`
