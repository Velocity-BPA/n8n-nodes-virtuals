/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { TokenHolder } from '../../utils/types';

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
        operation: ['getHolders', 'getHistory'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'holdersLimit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 1000,
    },
    default: 100,
    description: 'Maximum number of holders to return',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getHolders'],
      },
    },
  },
  {
    displayName: 'Sort By',
    name: 'sortBy',
    type: 'options',
    options: [
      { name: 'Balance (High to Low)', value: 'balance_desc' },
      { name: 'Balance (Low to High)', value: 'balance_asc' },
      { name: 'First Acquired', value: 'first_acquired' },
      { name: 'Last Acquired', value: 'last_acquired' },
    ],
    default: 'balance_desc',
    description: 'How to sort the holders list',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getHolders'],
      },
    },
  },
  {
    displayName: 'Event Types',
    name: 'eventTypes',
    type: 'multiOptions',
    options: [
      { name: 'All', value: 'all' },
      { name: 'Buys', value: 'buy' },
      { name: 'Sells', value: 'sell' },
      { name: 'Transfers', value: 'transfer' },
    ],
    default: ['all'],
    description: 'Types of events to include in history',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getHistory'],
      },
    },
  },
  {
    displayName: 'Time Range',
    name: 'timeRange',
    type: 'options',
    options: [
      { name: '1 Hour', value: '1h' },
      { name: '24 Hours', value: '24h' },
      { name: '7 Days', value: '7d' },
      { name: '30 Days', value: '30d' },
      { name: 'All Time', value: 'all' },
    ],
    default: '24h',
    description: 'Time range for history',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['getHistory'],
      },
    },
  },
];

export async function executeGetHolders(
  this: IExecuteFunctions,
  index: number,
): Promise<TokenHolder[]> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
  const limit = this.getNodeParameter('holdersLimit', index) as number;
  const sortBy = this.getNodeParameter('sortBy', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_HOLDERS, {
    address: tokenAddress,
  });
  const response = await client.get<TokenHolder[]>(endpoint, {
    limit,
    sortBy,
  });

  return response.data;
}

export interface TokenHistoryEvent {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  from: string;
  to: string;
  amount: string;
  price?: string;
  txHash: string;
  timestamp: string;
  blockNumber: number;
}

export async function executeGetHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<TokenHistoryEvent[]> {
  const client = createApiClient(this);

  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
  const eventTypes = this.getNodeParameter('eventTypes', index) as string[];
  const timeRange = this.getNodeParameter('timeRange', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_HISTORY, {
    address: tokenAddress,
  });

  const params: Record<string, unknown> = {
    timeRange,
  };

  if (!eventTypes.includes('all')) {
    params.eventTypes = eventTypes.join(',');
  }

  const response = await client.get<TokenHistoryEvent[]>(endpoint, params);

  return response.data;
}
