/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const CHAIN_CONFIG = {
  BASE: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  BASE_SEPOLIA: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const;

export const CONTRACTS = {
  BASE: {
    VIRTUAL_TOKEN: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    AGENT_FACTORY: '0x0000000000000000000000000000000000000000', // Placeholder
    REVENUE_SHARE: '0x0000000000000000000000000000000000000000', // Placeholder
    DEX_ROUTER: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86', // Aerodrome Router
    WETH: '0x4200000000000000000000000000000000000006',
  },
  BASE_SEPOLIA: {
    VIRTUAL_TOKEN: '0x0000000000000000000000000000000000000000', // Testnet placeholder
    AGENT_FACTORY: '0x0000000000000000000000000000000000000000',
    REVENUE_SHARE: '0x0000000000000000000000000000000000000000',
    DEX_ROUTER: '0x0000000000000000000000000000000000000000',
    WETH: '0x4200000000000000000000000000000000000006',
  },
} as const;

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const ROUTER_ABI = [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
];

export const AGENT_TOKEN_ABI = [
  ...ERC20_ABI,
  'function agentId() view returns (bytes32)',
  'function creator() view returns (address)',
  'function launchTime() view returns (uint256)',
  'function isActive() view returns (bool)',
  'function pause() external',
  'function unpause() external',
];

export const TOKEN_DECIMALS = 18;
export const VIRTUAL_DECIMALS = 18;

export const GAS_LIMITS = {
  TRANSFER: 65000,
  APPROVE: 55000,
  SWAP: 350000,
  CLAIM_REVENUE: 150000,
} as const;
