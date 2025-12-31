/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { GameGoal } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to manage goals for',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['createGoal', 'getGoals'],
      },
    },
  },
  {
    displayName: 'Goal Name',
    name: 'goalName',
    type: 'string',
    required: true,
    default: '',
    description: 'The name of the goal',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['createGoal'],
      },
    },
  },
  {
    displayName: 'Goal Description',
    name: 'goalDescription',
    type: 'string',
    typeOptions: {
      rows: 3,
    },
    required: true,
    default: '',
    description: 'Detailed description of what the goal should achieve',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['createGoal'],
      },
    },
  },
  {
    displayName: 'Priority',
    name: 'priority',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 10,
    },
    default: 5,
    description: 'Goal priority (1-10, where 10 is highest)',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['createGoal'],
      },
    },
  },
  {
    displayName: 'Goal Options',
    name: 'goalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['createGoal'],
      },
    },
    options: [
      {
        displayName: 'Success Criteria',
        name: 'successCriteria',
        type: 'string',
        typeOptions: {
          rows: 2,
        },
        default: '',
        description: 'Criteria to determine if the goal is achieved',
      },
      {
        displayName: 'Deadline',
        name: 'deadline',
        type: 'dateTime',
        default: '',
        description: 'Optional deadline for the goal',
      },
      {
        displayName: 'Auto-Start',
        name: 'autoStart',
        type: 'boolean',
        default: true,
        description: 'Whether to automatically start working on the goal',
      },
    ],
  },
  {
    displayName: 'Filter Status',
    name: 'filterStatus',
    type: 'options',
    options: [
      { name: 'All', value: '' },
      { name: 'Pending', value: 'pending' },
      { name: 'Active', value: 'active' },
      { name: 'Completed', value: 'completed' },
      { name: 'Failed', value: 'failed' },
    ],
    default: '',
    description: 'Filter goals by status',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['getGoals'],
      },
    },
  },
];

export async function executeCreateGoal(
  this: IExecuteFunctions,
  index: number,
): Promise<GameGoal> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const name = this.getNodeParameter('goalName', index) as string;
  const description = this.getNodeParameter('goalDescription', index) as string;
  const priority = this.getNodeParameter('priority', index) as number;
  const goalOptions = this.getNodeParameter('goalOptions', index, {}) as {
    successCriteria?: string;
    deadline?: string;
    autoStart?: boolean;
  };

  const body: Record<string, unknown> = {
    name,
    description,
    priority,
  };

  if (goalOptions.successCriteria) {
    body.successCriteria = goalOptions.successCriteria;
  }
  if (goalOptions.deadline) {
    body.deadline = goalOptions.deadline;
  }
  if (goalOptions.autoStart !== undefined) {
    body.autoStart = goalOptions.autoStart;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_GOALS, { agentId });
  const response = await client.post<GameGoal>(endpoint, body);

  return response.data;
}

export async function executeGetGoals(
  this: IExecuteFunctions,
  index: number,
): Promise<GameGoal[]> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const filterStatus = this.getNodeParameter('filterStatus', index) as string;

  const params: Record<string, unknown> = {};
  if (filterStatus) {
    params.status = filterStatus;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_GOALS, { agentId });
  const response = await client.get<GameGoal[]>(endpoint, params);

  return response.data;
}
