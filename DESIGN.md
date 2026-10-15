# Design: Waq's Copy Trade Dashboard

Documents the design as implemented in the final source. Every token,
component and breakpoint below is read from `src/styles.css`,
`src/App.tsx` and `src/components/SwapWindow.tsx`. Rendered behavior was
confirmed in headless Chromium at 320, 390, 700 and 1440 wide (see
`artifacts/validation.md`); other widths and engines were not checked.

## Overview

A one-page trading dashboard for people who want to copy Waq's trades. The
audience arrives from a shared link, usually on a phone, and wants to get to a
swap in one or two taps. The visual character is synthwave: a near-black
violet page, one pink sun glow behind the title, a cyan grid floor at the
bottom, neon pink for the single primary action and cyan for titles, links and
focus. Everything else is restrained so the four windows read as tools, not
posters.

Hierarchy and density rules that hold for any page in this product:

- The product and its main action are on the first screen at 390 wide. There
  is no hero; the title and one plain sentence sit above the first window.
- One surface level: windows are cards on the page, and nothing is a card
  inside a card. Structure inside a window comes from spacing, one hairline
  divider and field fills.
- One filled action per window. Everything else is outlined or plain text.
- Numbers use tabular figures so prices and estimates do not shift the layout
  when they update.

The four-column arrangement and the backdrop are this page's arrangement; the
tokens, type scale, window component and controls are the system.

## Colors

Defined as CSS custom properties on `:root` in `src/styles.css`. Primitives are
named by hue and never used in a component; components use semantic tokens
only.

| Semantic token | Primitive | Value | Job |
| --- | --- | --- | --- |
| `--color-bg-page` | `--night-950` | `#0b0620` | Page background |
| `--color-bg-surface` | `--night-900` | `#140b2e` | Window card, flip button fill, skip link |
| `--color-bg-field` | `--night-800` | `#1c1140` | Amount input and output fill |
| `--color-bg-field-active` | `--night-700` | `#2a1d5c` | Pressed Buy/Sell, token chips |
| `--color-border` | `--night-600` | `#3d2c7d` | Card edge, outlined controls, the divider above contract facts |
| `--color-text-primary` | `--violet-100` | `#f4efff` | Body text, prices, amounts |
| `--color-text-secondary` | `--violet-300` | `#c3b4f0` | Labels, hints, the lede, footer |
| `--color-accent` | `--pink-500` | `#ff3bd4` | The one filled action per window and its glow; the sun |
| `--color-accent-hover` | `--pink-600` | `#d61fae` | Hover on the filled action |
| `--color-accent-text` | `--night-950` | `#0b0620` | Text on the filled action |
| `--color-signal` | `--cyan-400` | `#35e8ff` | Window titles, links, flip icon, pressed-state edge, grid lines |
| `--color-focus` | `--cyan-400` | `#35e8ff` | Focus ring |
| `--color-up` | `--mint-400` | `#5cf2a8` | Positive 24h change |
| `--color-down` | `--coral-400` | `#ff7a93` | Negative 24h change, error notice |

Contrast was computed from the declared token pairs with the WCAG 2 formula
and confirmed by the taste probe on the rendered page (no measured text under
4.5:1). Secondary text on the surface is 9.94:1, on the field 9.23:1, on the
page 10.47:1; cyan on the surface 12.66:1; action text on pink 6.43:1; mint
13.18:1 and coral 7.57:1 on the surface. Text sitting over the sun glow (the
title and lede) was not measured against the gradient; the glow is at 0.35
opacity over the page color and the text is near-white, so it was judged by
screenshot only.

There is one theme. Do not add a light theme or a second accent hue; the
pink/cyan pair is the identity. Cyan means "title, link or focus"; pink means
"the action". Status colors are only mint and coral, and each always sits
beside a signed number or a sentence, never alone.

Gradients: the sun (`.sun`, line 153) is a radial pink-to-orange glow at 0.35
opacity, blurred. The grid floor (`.grid`, line 166) is two repeating linear
gradients masked toward the top. Both live in the decorative `.sky` layer with
`pointer-events: none` and `aria-hidden`. There is no gradient text.

## Typography

Two bundled families and the system monospace stack, all self-hosted from
`public/fonts/` (latin subsets, woff2, preloaded in `index.html`):

- `--font-display`: Orbitron 700 (`orbitron-700-latin.woff2`). The brand mark,
  the page title and window titles. Only weight 700 is loaded; do not request
  other weights.
- `--font-body`: Space Grotesk variable 300 to 700
  (`space-grotesk-latin.woff2`). Everything else. Weights in use are 400
  (text) and 600 (labels on controls, prices, amounts); 700 only on the filled
  action.
- `ui-monospace` stack: contract addresses only (`.addr`).

Type scale, six sizes, declared once on `:root`:

| Token | Size | Used for | Line height |
| --- | --- | --- | --- |
| `--text-xs` | 13px | Hints under the action, contract facts, footer | 1.5 |
| `--text-sm` | 14px | Field labels, pool rate, 24h change, status line, error notice | 1.5 |
| `--text-md` | 16px | Body, Buy/Sell, chips, prices, the lede, buttons | 1.5 |
| `--text-lg` | 20px | Brand mark, window titles (`h2`) | 1.1 |
| `--text-xl` | 28px | Amount input and output, page title on phones | 1.2 / 1.1 |
| `--text-2xl` | 40px | Page title from 700px wide (`@media (min-width: 700px)`, line 267) | 1.1 |

Rules: the `h1` is the only element at `--text-2xl`; `h2` is `--text-lg` so
headings descend. The title uses `text-wrap: balance` and `-0.01em` tracking;
no other text is tracked. No uppercase transforms anywhere; token symbols are
written as their tickers. The lede caps at `40rem` and the footer at `60ch`.
`font-variant-numeric: tabular-nums` is on prices, amounts, the rate line and
the status line. Inputs are 28px, so iOS does not zoom on focus.

## Layout

Spacing is a 4px scale: `--space-1` 4px, `--space-2` 8px, `--space-3` 12px,
`--space-4` 16px, `--space-5` 24px, `--space-6` 32px, `--space-8` 48px. Within
a window the gap between blocks is `--space-3`; inside a field it is
`--space-1`; between windows `--space-4`; under the intro `--space-5`.

- Page frame `.page`: a flex column, `min-height: 100vh`, `overflow-x: clip`.
  Header, main and footer each carry `z-index: 1` above the `.sky` backdrop.
- Header `.top` (line 197): brand at the leading edge, tools at the trailing
  edge, `--space-3` by `--space-4` padding. The "Prices updated" status hides
  below 520px (`.updated`, line 222) so the refresh button keeps its room.
- Main `.main`: `max-width: 84rem`, centered, `--space-4` inline padding.
- Windows grid `.windows` (line 274): one column by default, two from 700px
  (line 280), four from 1200px (line 286). The breakpoints follow the window's
  content: a window needs about 300px, so two fit at 700 and four at 1200.
- Logical properties (`inset-inline-start`, `padding-block`) are used where
  direction matters; no RTL mirror was checked.

Observed: no horizontal scroll at 320, 390, 700 or 1440; the first window's
swap action ends at y=660 at 390x844 and y=618 at 1440x900, inside the first
screen. Long contract addresses wrap with `overflow-wrap: anywhere` rather
than clipping.

## Elevation and depth

Flat, with one exception. Windows and outlined controls use a 1px
`--color-border` edge and no shadow. The filled action carries a pink glow
(`box-shadow: 0 0 1.25rem rgba(255, 59, 212, 0.35)`, `.btn-primary`, line 490)
and no border, so no surface has both a border and a shadow. The title has a
pink `text-shadow` for the neon look. Tonal layering is page, then surface,
then field, then field-active, each one step lighter. The `.sky` layer sits at
`z-index: 0` behind everything and takes no pointer events.

## Shapes

- `--radius-sm` 8px: skip link.
- `--radius-md` 12px: inputs, output, chips, Buy/Sell, outlined and filled
  buttons.
- `--radius-lg` 20px: the window card. Chosen as inner radius plus the card's
  16px padding, rounded to the nearest token, so nested corners stay
  concentric.
- The flip control is a 44px circle.

Borders are 1px. Nothing clips text; the only `overflow: hidden` is on the
decorative `.sky` layer.

## Components

All styles are in `src/styles.css`; markup in the files named.

**Swap window** (`src/components/SwapWindow.tsx`, `.window` line 293). One
`<article>` per token, labelled by its `h2`. Props: `token` (from
`src/config/tokens.ts`), `refreshKey` (bump to refetch), `onLoaded`. Contains,
top to bottom: title and chain line with the price block at the trailing edge
(`.price`, reserved `min-height` so loading does not move the layout); the
Buy/Sell group; "You pay" input; flip; "You receive" output; rate line; error
notice when the price failed; the filled action; the hint; contract and pool
facts. States: loading ("Loading price"), ready, error (`role="alert"` notice
with "Reload price", the action still works), and the two sides. Reuse this
for any new token by adding an entry to `TOKENS`.

**Buy/Sell segmented control** (`.side`, `.side-btn` line 361). Two native
buttons in a `role="group"` with `aria-pressed`. Pressed state: field-active
fill and a cyan edge. 44px tall.

**Amount field** (`.field`, `.amount` line 404). A visible `<label>` bound to
the `<input inputmode="decimal">`; input text is sanitized to digits and one
decimal point. The output side is a `<output>` with the same look
(`.amount-out`, line 432) and an `aria-labelledby` label. Both are 46px tall
by design: under 48px keeps them reading as fields, not cards.

**Token chip** (`.chip`, line 436). Static label for ETH or the token; not a
control.

**Flip** (`.flip`, line 451). 44px round button with an arrow icon drawn in
`currentColor`; `aria-label` names the side it switches to; presses scale to
0.96.

**Primary action** (`.btn-primary`, line 490). An `<a target="_blank"
rel="noopener noreferrer">` to Uniswap, styled as the filled pink button, label
"Buy X on Uniswap" or "Sell X on Uniswap". One per window.

**Outlined button** (`.btn-ghost`, line 518). "Refresh prices" in the header
and "Reload price" in the notice. 44px tall, cyan edge on hover.

**Status line** (`.updated`, `role="status"` in `src/App.tsx`). "Prices updated
HH:MM" once any window loads.

**Skip link** (`.skip`, line 129). First focusable element; appears on focus
and jumps to `#windows`.

**Focus** (`:focus-visible`, line 108). 2px solid cyan outline, 2px offset, on
every control; the amount input swaps the outline for a cyan border.

**Motion**. Transitions name their properties (background-color, color,
border-color, scale) at 150ms with `cubic-bezier(0.2, 0, 0, 1)`. The only
animation is the grid drift, wrapped in
`@media (prefers-reduced-motion: no-preference)` (line 181), so it does not run
under reduced motion.

## Do's and don'ts

- Start a new page from `.page` with `.top`, `.main` and `.foot`; put content
  in `.main` and keep the backdrop in `.sky`.
- Use the semantic color tokens; never a primitive or a raw hex in a
  component. If a role is missing, add a semantic token.
- One filled `.btn-primary` per window or view. Secondary actions are
  `.btn-ghost`. Links are cyan and underlined.
- Keep the six sizes; pick from the scale instead of adding a size. Only `h1`
  uses `--text-2xl`.
- Keep text in natural case. No uppercase labels, no tracked kicker lines
  above headings.
- Do not nest a filled, rounded, padded block inside a window. Fields stay
  under 48px tall; anything larger reads as a card inside a card.
- Do not add a border to the filled action or a shadow to the windows.
- Wrap any new animation in the reduced-motion media query; keep transitions
  to named properties.
- Keep token symbols out of all-caps sentences; "Buy IMD on Uniswap" is the
  pattern.

Recipe for one more page: copy `src/App.tsx`'s frame, write the `h1` at
`.title` and one `.lede` sentence, then render `SwapWindow` instances inside a
`.windows` grid or compose a new block from `.field`, `.btn-primary` and
`.btn-ghost`. Add tokens to `src/config/tokens.ts`; the window handles
fetching, states and the Uniswap link.
