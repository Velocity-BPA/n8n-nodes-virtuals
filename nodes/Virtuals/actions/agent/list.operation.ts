/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS } from '../../constants/endpoints';
import type { Agent } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Active', value: 'active' },
          { name: 'Inactive', value: 'inactive' },
          { name: 'Paused', value: 'paused' },
          { name: 'Error', value: 'error' },
        ],
        default: '',
        description: 'Filter agents by status',
      },
      {
        displayName: 'Creator Address',
        name: 'creatorAddress',
        type: 'string',
        default: '',
        description: 'Filter agents by creator wallet address',
      },
      {
        displayName: 'Sort By',
        name: 'sortBy',
        type: 'options',
        options: [
          { name: 'Created At', value: 'createdAt' },
          { name: 'Name', value: 'name' },
          { name: 'Market Cap', value: 'marketCap' },
          { name: 'Volume', value: 'volume' },
        ],
        default: 'createdAt',
        description: 'Field to sort results by',
      },
      {
        displayName: 'Sort Order',
        name: 'sortOrder',
        type: 'options',
        options: [
          { name: 'Ascending', value: 'asc' },
          { name: 'Descending', value: 'desc' },
        ],
        default: 'desc',
        description: 'Order to sort results',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<Agent[]> {
  const client = createApiClient(this);
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as {
    status?: string;
    creatorAddress?: string;
    sortBy?: string;
    sortOrder?: string;
  };

  const params: Record<string, unknown> = {};

  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.creatorAddress) {
    params.creatorAddress = filters.creatorAddress;
  }
  if (filters.sortBy) {
    params.sortBy = filters.sortBy;
  }
  if (filters.sortOrder) {
    params.sortOrder = filters.sortOrder;
  }

  if (returnAll) {
    const allAgents: Agent[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await client.get<Agent[]>(API_ENDPOINTS.AGENTS, {
        ...params,
        page,
        pageSize: 100,
      });

      allAgents.push(...response.data);

      hasMore = response.pagination?.hasMore || false;
      page++;
    }

    return allAgents;
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const response = await client.get<Agent[]>(API_ENDPOINTS.AGENTS, {
      ...params,
      page: 1,
      pageSize: limit,
    });

    return response.data;
  }
}
