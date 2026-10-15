import { useEffect, useId, useState } from 'react';
import type { TokenConfig } from '../config/tokens';
import { fetchQuote, type Quote } from '../lib/dexscreener';
import { uniswapSwapUrl, type Side } from '../lib/uniswap';
import { formatAmount, formatPercent, formatUsd, sanitizeAmount } from '../lib/format';

interface Props {
  token: TokenConfig;
  /** Bumped by the page's "Refresh prices" control to refetch. */
  refreshKey: number;
  onLoaded?: (at: Date) => void;
}

type QuoteState =
  | { status: 'loading'; quote: Quote | null }
  | { status: 'ready'; quote: Quote }
  | { status: 'error'; quote: Quote | null; message: string };

export function SwapWindow({ token, refreshKey, onLoaded }: Props) {
  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('');
  const [state, setState] = useState<QuoteState>({ status: 'loading', quote: null });
  const [retry, setRetry] = useState(0);
  const inputId = useId();
  const outputId = useId();
  const rateId = useId();

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ status: 'loading', quote: s.quote }));
    fetchQuote(token.chain, token.address, controller.signal)
      .then((quote) => {
        setState({ status: 'ready', quote });
        onLoaded?.(new Date());
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Unable to load the price';
        setState((s) => ({ status: 'error', quote: s.quote, message }));
      });
    return () => controller.abort();
  }, [token.chain, token.address, refreshKey, retry, onLoaded]);

  const quote = state.quote;
  const amountNumber = Number(amount);
  const hasAmount = amount.trim() !== '' && Number.isFinite(amountNumber) && amountNumber > 0;
  const payLabel = side === 'buy' ? 'ETH' : token.symbol;
  const receiveLabel = side === 'buy' ? token.symbol : 'ETH';
  const received = quote && hasAmount ? (side === 'buy' ? amountNumber / quote.priceEth : amountNumber * quote.priceEth) : 0;
  const swapUrl = uniswapSwapUrl(token, side, amount);
  const actionLabel = side === 'buy' ? `Buy ${token.symbol} on Uniswap` : `Sell ${token.symbol} on Uniswap`;

  return (
    <article className="window" aria-labelledby={`${inputId}-title`}>
      <header className="window-head">
        <div>
          <h2 id={`${inputId}-title`} className="window-title">
            {token.symbol}
          </h2>
          <p className="window-sub">
            {token.name} on {token.chainLabel}
          </p>
        </div>
        <div className="price" aria-live="polite">
          {quote ? (
            <>
              <span className="price-usd">{formatUsd(quote.priceUsd)}</span>
              {quote.change24h !== null && (
                <span
                  className={`price-change ${quote.change24h < 0 ? 'is-down' : 'is-up'}`}
                  title="Change over the last 24 hours"
                >
                  {formatPercent(quote.change24h)} 24h
                </span>
              )}
            </>
          ) : state.status === 'loading' ? (
            <span className="price-note">Loading price</span>
          ) : (
            <span className="price-note">Price unavailable</span>
          )}
        </div>
      </header>

      <div className="side" role="group" aria-label={`Trade direction for ${token.symbol}`}>
        <button type="button" className="side-btn" aria-pressed={side === 'buy'} onClick={() => setSide('buy')}>
          Buy
        </button>
        <button type="button" className="side-btn" aria-pressed={side === 'sell'} onClick={() => setSide('sell')}>
          Sell
        </button>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={inputId}>
          You pay
        </label>
        <div className="field-row">
          <input
            id={inputId}
            className="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
            aria-describedby={rateId}
          />
          <span className="chip">{payLabel}</span>
        </div>
      </div>

      <div className="flip-row">
        <button
          type="button"
          className="flip"
          onClick={() => setSide(side === 'buy' ? 'sell' : 'buy')}
          aria-label={`Switch to ${side === 'buy' ? 'sell' : 'buy'} ${token.symbol}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 4v16M6 14l6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="field">
        <span className="field-label" id={`${outputId}-label`}>
          You receive
        </span>
        <div className="field-row">
          <output className="amount amount-out" htmlFor={inputId} aria-labelledby={`${outputId}-label`}>
            {hasAmount && quote ? formatAmount(received) : '0.0'}
          </output>
          <span className="chip">{receiveLabel}</span>
        </div>
      </div>

      <p className="rate" id={rateId}>
        {quote
          ? side === 'buy'
            ? `1 ETH is about ${formatAmount(1 / quote.priceEth)} ${token.symbol}. Estimate before fees and slippage.`
            : `1 ${token.symbol} is about ${formatAmount(quote.priceEth)} ETH. Estimate before fees and slippage.`
          : state.status === 'loading'
            ? 'Loading the pool rate.'
            : 'The estimate needs a price. Reload to try again.'}
      </p>

      {state.status === 'error' && (
        <div className="notice" role="alert">
          <span>Unable to load the price from DexScreener.</span>
          <button type="button" className="btn-ghost" onClick={() => setRetry((n) => n + 1)}>
            Reload price
          </button>
        </div>
      )}

      <a className="btn-primary" href={swapUrl} target="_blank" rel="noopener noreferrer">
        {actionLabel}
      </a>
      <p className="hint">Opens Uniswap with this trade filled in. You confirm it there with your wallet.</p>

      <dl className="meta">
        <div>
          <dt>Contract</dt>
          <dd>
            <code className="addr">{token.address}</code>
          </dd>
        </div>
        {quote && (
          <div>
            <dt>Pool</dt>
            <dd>
              <a href={quote.url} target="_blank" rel="noopener noreferrer">
                {formatUsd(quote.liquidityUsd)} liquidity on DexScreener
              </a>
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
