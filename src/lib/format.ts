/** Formats a token or ETH amount with precision that follows its size. */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  const abs = Math.abs(value);
  let digits: number;
  if (abs >= 1000) digits = 0;
  else if (abs >= 1) digits = 4;
  else if (abs >= 0.001) digits = 6;
  else digits = 8;
  return value.toLocaleString('en-US', { maximumFractionDigits: digits });
}

/** Formats a US dollar price. Small prices keep enough digits to read. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '$0';
  const abs = Math.abs(value);
  const digits = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** Formats a signed percentage with one decimal. */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/** Formats a clock time for the "updated" line. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** Keeps only digits and one decimal point from typed input. */
export function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const [head, ...rest] = cleaned.split('.');
  return rest.length ? `${head}.${rest.join('')}` : head;
}
