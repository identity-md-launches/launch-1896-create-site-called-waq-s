import { useCallback, useEffect, useState } from 'react';
import { SwapWindow } from './components/SwapWindow';
import { TOKENS, TRADER_NAME } from './config/tokens';
import { formatTime } from './lib/format';

/** How often the windows refetch prices, in milliseconds. */
const REFRESH_EVERY_MS = 60_000;

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const onLoaded = useCallback((at: Date) => setUpdatedAt(at), []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setRefreshKey((n) => n + 1);
    }, REFRESH_EVERY_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="page">
      <a className="skip" href="#windows">
        Skip to the trading windows
      </a>
      <div className="sky" aria-hidden="true">
        <div className="sun" />
        <div className="grid" />
      </div>

      <header className="top">
        <a className="brand" href="./">
          {TRADER_NAME}
        </a>
        <div className="top-tools">
          <span className="updated" role="status">
            {updatedAt ? `Prices updated ${formatTime(updatedAt)}` : 'Loading prices'}
          </span>
          <button type="button" className="btn-ghost" onClick={() => setRefreshKey((n) => n + 1)}>
            Refresh prices
          </button>
        </div>
      </header>

      <main className="main">
        <div className="intro">
          <h1 className="title">{TRADER_NAME}'s Copy Trade Dashboard</h1>
          <p className="lede">Copy trade what {TRADER_NAME} is trading from a single page.</p>
        </div>

        <section id="windows" className="windows" aria-label="Trading windows">
          {TOKENS.map((token) => (
            <SwapWindow key={token.address} token={token} refreshKey={refreshKey} onLoaded={onLoaded} />
          ))}
        </section>
      </main>

      <footer className="foot">
        <p>
          Prices come from DexScreener's deepest ETH pool for each token and refresh every minute. Swaps run on Uniswap
          with your own wallet. Nothing here is financial advice.
        </p>
      </footer>
    </div>
  );
}
