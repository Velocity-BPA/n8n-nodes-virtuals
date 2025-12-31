/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';

export const description: INodeProperties[] = [
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The token contract address',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getMarketCap', 'getVolume', 'getLiquidity'],
      },
    },
  },
  {
    displayName: 'Time Period',
    name: 'timePeriod',
    type: 'options',
    options: [
      { name: '24 Hours', value: '24h' },
      { name: '7 Days', value: '7d' },
      { name: '30 Days', value: '30d' },
    ],
    default: '24h',
    description: 'Time period for volume data',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getVolume'],
      },
    },
  },
];

export async function executeGetMarketCap(
  this: IExecuteFunctions,
  index: number,
): Promise<{ address: string; marketCap: string; rank: number; lastUpdated: string }> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_MARKET_CAP, {
    address: tokenAddress,
  });
  const response = await client.get<{
    address: string;
    marketCap: string;
    rank: number;
    lastUpdated: string;
  }>(endpoint);

  return response.data;
}

export async function executeGetVolume(
  this: IExecuteFunctions,
  index: number,
): Promise<{
  address: string;
  volume: string;
  volumeChange: number;
  trades: number;
  period: string;
}> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
  const timePeriod = this.getNodeParameter('timePeriod', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_VOLUME, {
    address: tokenAddress,
  });
  const response = await client.get<{
    address: string;
    volume: string;
    volumeChange: number;
    trades: number;
    period: string;
  }>(endpoint, { period: timePeriod });

  return response.data;
}

export async function executeGetLiquidity(
  this: IExecuteFunctions,
  index: number,
): Promise<{
  address: string;
  liquidity: string;
  liquidityUSD: string;
  pools: Array<{ name: string; liquidity: string; share: number }>;
}> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_LIQUIDITY, {
    address: tokenAddress,
  });
  const response = await client.get<{
    address: string;
    liquidity: string;
    liquidityUSD: string;
    pools: Array<{ name: string; liquidity: string; share: number }>;
  }>(endpoint);

  return response.data;
}
