import type { ChainId } from '../config/tokens';

/** The slice of a DexScreener pair this page reads. */
export interface Quote {
  /** Token price in ETH, from the deepest ETH-quoted pool. */
  priceEth: number;
  /** Token price in US dollars. */
  priceUsd: number;
  /** 24 hour change in percent, when DexScreener reports one. */
  change24h: number | null;
  /** Pool liquidity in US dollars. */
  liquidityUsd: number;
  /** Which DEX the pool lives on, as DexScreener names it. */
  dexId: string;
  /** DexScreener page for the pool. */
  url: string;
}

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  baseToken: { address: string; symbol: string };
  quoteToken: { address: string; symbol: string };
  priceNative: string;
  priceUsd?: string;
  priceChange?: { h24?: number };
  liquidity?: { usd?: number };
}

interface DexResponse {
  pairs: DexPair[] | null;
}

const API = 'https://api.dexscreener.com/latest/dex/tokens';
const ETH_SYMBOLS = new Set(['ETH', 'WETH']);

/** Builds the request URL, exported so tests can intercept it. */
export function quoteUrl(address: string): string {
  return `${API}/${address}`;
}

/**
 * Picks the pool the estimate uses: the deepest ETH-quoted pool for the token
 * on its chain, on any DEX. Depth matters more than venue for a price
 * estimate; Uniswap routes the actual swap itself. Exported so the choice can
 * be tested without a network.
 */
export function pickPool(pairs: DexPair[], chain: ChainId, address: string): DexPair | undefined {
  const wanted = address.toLowerCase();
  const ethPools = pairs.filter(
    (p) =>
      p.chainId === chain &&
      p.baseToken.address.toLowerCase() === wanted &&
      ETH_SYMBOLS.has(p.quoteToken.symbol.toUpperCase()),
  );
  const byLiquidity = (a: DexPair, b: DexPair) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0);
  return ethPools.sort(byLiquidity)[0];
}

/** Fetches the token's pools from DexScreener and returns the chosen pool's prices. */
export async function fetchQuote(chain: ChainId, address: string, signal?: AbortSignal): Promise<Quote> {
  const res = await fetch(quoteUrl(address), { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`DexScreener answered ${res.status}`);
  const body = (await res.json()) as DexResponse;
  const pairs = Array.isArray(body?.pairs) ? body.pairs : [];

  const best = pickPool(pairs, chain, address);
  if (!best) throw new Error('No ETH pool found for this token');

  const priceEth = Number(best.priceNative);
  const priceUsd = Number(best.priceUsd ?? 'NaN');
  if (!Number.isFinite(priceEth) || priceEth <= 0) throw new Error('DexScreener returned no ETH price');

  return {
    priceEth,
    priceUsd: Number.isFinite(priceUsd) ? priceUsd : 0,
    change24h: typeof best.priceChange?.h24 === 'number' ? best.priceChange.h24 : null,
    liquidityUsd: best.liquidity?.usd ?? 0,
    dexId: best.dexId,
    url: best.url,
  };
}
