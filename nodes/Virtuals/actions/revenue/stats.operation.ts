/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { RevenueStats } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to get revenue stats for',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['getStats', 'getCreatorEarnings', 'getHolderEarnings'],
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
      { name: '90 Days', value: '90d' },
      { name: '1 Year', value: '1y' },
      { name: 'All Time', value: 'all' },
    ],
    default: '30d',
    description: 'Time period for revenue statistics',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['getStats', 'getCreatorEarnings', 'getHolderEarnings'],
      },
    },
  },
  {
    displayName: 'Stats Options',
    name: 'statsOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['getStats'],
      },
    },
    options: [
      {
        displayName: 'Include Breakdown',
        name: 'includeBreakdown',
        type: 'boolean',
        default: true,
        description: 'Whether to include revenue breakdown by source',
      },
      {
        displayName: 'Include Projections',
        name: 'includeProjections',
        type: 'boolean',
        default: false,
        description: 'Whether to include revenue projections',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'options',
        options: [
          { name: 'USD', value: 'USD' },
          { name: 'ETH', value: 'ETH' },
          { name: 'VIRTUAL', value: 'VIRTUAL' },
        ],
        default: 'USD',
        description: 'Currency for revenue display',
      },
    ],
  },
  {
    displayName: 'Wallet Address',
    name: 'walletAddress',
    type: 'string',
    default: '',
    description: 'Optional wallet address to filter earnings for',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['getHolderEarnings'],
      },
    },
  },
];

interface RevenueBreakdown {
  source: string;
  amount: string;
  percentage: number;
}

interface RevenueStatsResponse extends RevenueStats {
  breakdown?: RevenueBreakdown[];
  projections?: {
    daily: string;
    weekly: string;
    monthly: string;
  };
}

interface EarningsResponse {
  totalEarnings: string;
  pendingEarnings: string;
  claimedEarnings: string;
  lastClaim?: string;
  earningsHistory: Array<{
    date: string;
    amount: string;
    type: string;
  }>;
}

export async function executeGetStats(
  this: IExecuteFunctions,
  index: number,
): Promise<RevenueStatsResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const timePeriod = this.getNodeParameter('timePeriod', index) as string;
  const statsOptions = this.getNodeParameter('statsOptions', index, {}) as {
    includeBreakdown?: boolean;
    includeProjections?: boolean;
    currency?: string;
  };

  const params: Record<string, unknown> = {
    period: timePeriod,
  };

  if (statsOptions.includeBreakdown !== undefined) {
    params.includeBreakdown = statsOptions.includeBreakdown;
  }
  if (statsOptions.includeProjections !== undefined) {
    params.includeProjections = statsOptions.includeProjections;
  }
  if (statsOptions.currency) {
    params.currency = statsOptions.currency;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.REVENUE_STATS, { agentId });
  const response = await client.get<RevenueStatsResponse>(endpoint, params);

  return response.data;
}

export async function executeGetCreatorEarnings(
  this: IExecuteFunctions,
  index: number,
): Promise<EarningsResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const timePeriod = this.getNodeParameter('timePeriod', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.REVENUE_CREATOR, { agentId });
  const response = await client.get<EarningsResponse>(endpoint, { period: timePeriod });

  return response.data;
}

export async function executeGetHolderEarnings(
  this: IExecuteFunctions,
  index: number,
): Promise<EarningsResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const timePeriod = this.getNodeParameter('timePeriod', index) as string;
  const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;

  const params: Record<string, unknown> = {
    period: timePeriod,
  };

  if (walletAddress) {
    params.walletAddress = walletAddress;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.REVENUE_HOLDERS, { agentId });
  const response = await client.get<EarningsResponse>(endpoint, params);

  return response.data;
}
