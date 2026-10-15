# Waq's Copy Trade Dashboard

Copy trade what Waq is trading from a single page. Four Uniswap-like trading
windows, one each for IMD, TIBBIR, PNKSTR and RPL, in a synthwave style.

Each window shows the live price and 24 hour change from DexScreener, takes an
amount, estimates what the trade returns, and opens Uniswap with the trade
filled in. The swap itself is confirmed on Uniswap with the visitor's own
wallet, so this page holds no wallet code, keys or backend.

## Tokens

| Window | Token | Chain | Contract |
| --- | --- | --- | --- |
| IMD | Identity.md | Ethereum | `0xD34a99Bc0f67aE1bbd63C660e6d0b0dd03E263B7` |
| TIBBIR | Ribbita by Virtuals | Base | `0xA4A2E2ca3fBfE21aed83471D28b6f65A233C6e00` |
| PNKSTR | PunkStrategy | Ethereum | `0xc50673EDb3A7b94E8CAD8a7d4E0cD68864E33eDF` |
| RPL | Rocket Pool | Ethereum | `0xD33526068D116cE69F19A9ee46F0bd304F21A51f` |

The RPL address came from the brief. It was checked against DexScreener on
2026-10-15: the address is "Rocket Pool Protocol" (RPL), the current RPL token,
behind the deepest RPL/WETH Uniswap pool on Ethereum. The older RPL token at
`0xB4EFd85c19999D84251304bDA99E90B92300Bd93` is not used. The other three
addresses were taken from DexScreener's token search the same day, each being
the contract behind the deepest pool for that symbol. All four live in
`src/config/tokens.ts`.

## Install, preview, rebuild

Node 22 and npm are enough.

```sh
npm install          # installs React, Vite and TypeScript
npm run dev          # dev server with hot reload
npm run typecheck    # tsc --noEmit
npm run build        # typecheck, then production build into dist/
npm run preview      # serves the built dist/ locally
```

`dist/` is committed. It is the static export the publisher serves, built with
Vite's `base: './'` so every asset URL is relative and the site works from an
IPFS gateway subpath or an ENS name. Rebuild and commit `dist/` after any
source change.

## How it works

- `src/config/tokens.ts` lists the four tokens, their chains and the Uniswap
  chain name. Add or change a window here.
- `src/lib/dexscreener.ts` fetches a token's pools from DexScreener's public
  API, picks the deepest ETH-quoted pool on the token's chain and returns its
  ETH price, dollar price, 24 hour change and liquidity. Prices refresh every
  minute while the tab is visible and on the "Refresh prices" control.
- `src/lib/uniswap.ts` builds the Uniswap app link for the chosen side and
  amount (`chain`, `inputCurrency`, `outputCurrency`, `value`, `field`).
- `src/components/SwapWindow.tsx` is one trading window: Buy/Sell, "You pay",
  the flip control, "You receive", the pool rate, the swap link and the
  contract address.
- `src/styles.css` holds the design tokens and all component styles. The
  design is documented in `DESIGN.md`.

The estimate is DexScreener's pool price applied to the amount, before fees,
slippage and routing. Uniswap quotes the final rate when the trade opens there.
If DexScreener cannot be reached the window says so and offers "Reload price";
the swap link keeps working without a price.

## Validation

Commands run on the final source, from the repository root, on 2026-10-15.
The full record with findings is in `artifacts/validation.md`.

| Check | Command | Result |
| --- | --- | --- |
| Typecheck and production build | `npm run build` | Passed: `tsc --noEmit` clean, Vite wrote `dist/` (index.html, one CSS, one JS, fonts, favicon, og.png) |
| Interaction checks, fixture data | `IMD_PLAYWRIGHT=~/.imd-taste/node_modules/playwright/index.mjs node test/scratch/interactions.mjs` | 42/42 passed |
| Interaction checks, live DexScreener | same with `--live` | 35/35 passed |
| Design probe taste@1 | `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste` | 16/16 passed at 320, 390 and 1440 |

The interaction script serves `dist/` under a `/preview/` subpath, drives it
with headless Chromium at 320, 390, 700 and 1440 wide and checks: four windows
in order; favicon, og:image and fonts resolve relative to the subpath; the
first window and its swap action on the first screen at 390 and 1440; amount
entry, estimate, Buy/Sell and flip; the Uniswap link's chain, pair and amount
for IMD (Ethereum) and TIBBIR (Base); the pool choice; the error state and
"Reload price"; the "Refresh prices" control; Tab order and visible focus
rings; no horizontal scroll; no console errors; and that no animation runs
under reduced motion. `test/scratch/` is working space and is not part of the
delivery; the script is reproduced in `artifacts/validation.md`.

Limitations: the checks ran in headless Chromium only, not WebKit or Firefox,
and not on a physical phone. No wallet was connected and no swap was sent;
the Uniswap link was checked by its URL, not by loading Uniswap. Screen-reader
behavior and browser-native 200% zoom were not tested. Screenshots of the
first screen at 390 and 1440 are in `artifacts/screenshots/`.
