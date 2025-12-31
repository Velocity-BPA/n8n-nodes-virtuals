/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { TokenPrice, TokenInfo } from '../../utils/types';

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
        operation: ['getPrice', 'getInfo'],
      },
    },
  },
  {
    displayName: 'Include History',
    name: 'includeHistory',
    type: 'boolean',
    default: false,
    description: 'Whether to include price history data',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getPrice'],
      },
    },
  },
  {
    displayName: 'History Period',
    name: 'historyPeriod',
    type: 'options',
    options: [
      { name: '24 Hours', value: '24h' },
      { name: '7 Days', value: '7d' },
      { name: '30 Days', value: '30d' },
      { name: '1 Year', value: '1y' },
    ],
    default: '24h',
    description: 'Time period for price history',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getPrice'],
        includeHistory: [true],
      },
    },
  },
];

export async function executeGetPrice(
  this: IExecuteFunctions,
  index: number,
): Promise<TokenPrice & { history?: Array<{ timestamp: string; price: string }> }> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
  const includeHistory = this.getNodeParameter('includeHistory', index) as boolean;

  const params: Record<string, unknown> = {};

  if (includeHistory) {
    const historyPeriod = this.getNodeParameter('historyPeriod', index) as string;
    params.includeHistory = true;
    params.period = historyPeriod;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_PRICE, {
    address: tokenAddress,
  });
  const response = await client.get<
    TokenPrice & { history?: Array<{ timestamp: string; price: string }> }
  >(endpoint, params);

  return response.data;
}

export async function executeGetInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<TokenInfo> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_INFO, {
    address: tokenAddress,
  });
  const response = await client.get<TokenInfo>(endpoint);

  return response.data;
}
