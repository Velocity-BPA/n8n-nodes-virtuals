/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { GAME_WORKER_TYPES } from '../../constants/platforms';
import type { GameWorker } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to manage workers for',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['configureWorker', 'getWorkers'],
      },
    },
  },
  {
    displayName: 'Worker Type',
    name: 'workerType',
    type: 'options',
    options: Object.values(GAME_WORKER_TYPES).map((w) => ({
      name: w.name,
      value: w.id,
      description: w.description,
    })),
    required: true,
    default: 'executor',
    description: 'The type of worker to configure',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['configureWorker'],
      },
    },
  },
  {
    displayName: 'Worker Name',
    name: 'workerName',
    type: 'string',
    required: true,
    default: '',
    description: 'A custom name for the worker',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['configureWorker'],
      },
    },
  },
  {
    displayName: 'Worker Description',
    name: 'workerDescription',
    type: 'string',
    typeOptions: {
      rows: 2,
    },
    default: '',
    description: 'Description of what this worker does',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['configureWorker'],
      },
    },
  },
  {
    displayName: 'Capabilities',
    name: 'capabilities',
    type: 'string',
    default: '',
    description:
      'Comma-separated list of capabilities (e.g., "data-processing, reporting")',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['configureWorker'],
      },
    },
  },
  {
    displayName: 'Worker Options',
    name: 'workerOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['configureWorker'],
      },
    },
    options: [
      {
        displayName: 'Max Concurrent Tasks',
        name: 'maxConcurrentTasks',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 10,
        },
        default: 1,
        description: 'Maximum number of concurrent tasks',
      },
      {
        displayName: 'Timeout (Seconds)',
        name: 'timeout',
        type: 'number',
        typeOptions: {
          minValue: 10,
          maxValue: 3600,
        },
        default: 300,
        description: 'Task timeout in seconds',
      },
      {
        displayName: 'Retry Count',
        name: 'retryCount',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 5,
        },
        default: 2,
        description: 'Number of retries on failure',
      },
    ],
  },
];

export async function executeConfigureWorker(
  this: IExecuteFunctions,
  index: number,
): Promise<GameWorker> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const workerType = this.getNodeParameter('workerType', index) as string;
  const name = this.getNodeParameter('workerName', index) as string;
  const description = this.getNodeParameter('workerDescription', index) as string;
  const capabilities = this.getNodeParameter('capabilities', index) as string;
  const workerOptions = this.getNodeParameter('workerOptions', index, {}) as {
    maxConcurrentTasks?: number;
    timeout?: number;
    retryCount?: number;
  };

  const body: Record<string, unknown> = {
    type: workerType,
    name,
    description,
    capabilities: capabilities
      ? capabilities.split(',').map((c) => c.trim())
      : [],
  };

  if (workerOptions.maxConcurrentTasks) {
    body.maxConcurrentTasks = workerOptions.maxConcurrentTasks;
  }
  if (workerOptions.timeout) {
    body.timeout = workerOptions.timeout;
  }
  if (workerOptions.retryCount !== undefined) {
    body.retryCount = workerOptions.retryCount;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_WORKERS, { agentId });
  const response = await client.post<GameWorker>(endpoint, body);

  return response.data;
}

export async function executeGetWorkers(
  this: IExecuteFunctions,
  index: number,
): Promise<GameWorker[]> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_WORKERS, { agentId });
  const response = await client.get<GameWorker[]>(endpoint);

  return response.data;
}
