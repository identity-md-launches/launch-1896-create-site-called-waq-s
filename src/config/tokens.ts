// The four tokens Waq trades. Addresses were checked against DexScreener's
// token search on 2026-10-15: each is the contract behind the deepest
// Uniswap pool for that symbol on its chain.
//
// chain: DexScreener chain id. uniswapChain: the `chain` query value the
// Uniswap web app accepts.

export type ChainId = 'ethereum' | 'base';

export interface TokenConfig {
  /** Ticker as shown on the window, without the dollar sign. */
  symbol: string;
  /** Project name shown under the ticker. */
  name: string;
  /** ERC-20 contract address, checksummed. */
  address: `0x${string}`;
  /** DexScreener chain id. */
  chain: ChainId;
  /** Human chain label. */
  chainLabel: string;
  /** Value for the Uniswap app's `chain` query parameter. */
  uniswapChain: 'mainnet' | 'base';
}

export const TOKENS: readonly TokenConfig[] = [
  {
    symbol: 'IMD',
    name: 'Identity.md',
    address: '0xD34a99Bc0f67aE1bbd63C660e6d0b0dd03E263B7',
    chain: 'ethereum',
    chainLabel: 'Ethereum',
    uniswapChain: 'mainnet',
  },
  {
    symbol: 'TIBBIR',
    name: 'Ribbita by Virtuals',
    address: '0xA4A2E2ca3fBfE21aed83471D28b6f65A233C6e00',
    chain: 'base',
    chainLabel: 'Base',
    uniswapChain: 'base',
  },
  {
    symbol: 'PNKSTR',
    name: 'PunkStrategy',
    address: '0xc50673EDb3A7b94E8CAD8a7d4E0cD68864E33eDF',
    chain: 'ethereum',
    chainLabel: 'Ethereum',
    uniswapChain: 'mainnet',
  },
  {
    // The brief gave this address and asked for it to be verified. DexScreener
    // lists it as "Rocket Pool Protocol" (RPL), the current RPL token, with the
    // deepest RPL/WETH Uniswap pool on Ethereum.
    symbol: 'RPL',
    name: 'Rocket Pool',
    address: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
    chain: 'ethereum',
    chainLabel: 'Ethereum',
    uniswapChain: 'mainnet',
  },
];

/** The site's trader. Shown in the title and the page heading. */
export const TRADER_NAME = 'Waq';
