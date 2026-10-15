import type { TokenConfig } from '../config/tokens';

export type Side = 'buy' | 'sell';

/**
 * Builds the Uniswap web app link for a trade. The app reads the pair, chain
 * and amount from the query string and shows the trade ready to confirm.
 * `value` and `field` are the current parameter names; `exactAmount` and
 * `exactField` are the older names, kept so older builds of the app still
 * prefill the amount.
 */
export function uniswapSwapUrl(token: TokenConfig, side: Side, amount: string): string {
  const params = new URLSearchParams();
  params.set('chain', token.uniswapChain);
  params.set('inputCurrency', side === 'buy' ? 'ETH' : token.address);
  params.set('outputCurrency', side === 'buy' ? token.address : 'ETH');
  const n = Number(amount);
  if (amount.trim() !== '' && Number.isFinite(n) && n > 0) {
    params.set('value', amount.trim());
    params.set('field', 'input');
    params.set('exactAmount', amount.trim());
    params.set('exactField', 'input');
  }
  return `https://app.uniswap.org/swap?${params.toString()}`;
}
