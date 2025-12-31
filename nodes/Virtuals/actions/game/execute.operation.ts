/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { ExecutionResult, GameState } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to execute tasks for',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['executeTask', 'getExecutionHistory', 'getAgentState', 'updatePersonality'],
      },
    },
  },
  {
    displayName: 'Worker ID',
    name: 'workerId',
    type: 'string',
    default: '',
    description: 'Optional worker ID to execute the task (leave empty for auto-selection)',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['executeTask'],
      },
    },
  },
  {
    displayName: 'Function ID',
    name: 'functionId',
    type: 'string',
    default: '',
    description: 'Optional function ID to execute',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['executeTask'],
      },
    },
  },
  {
    displayName: 'Input Data',
    name: 'inputData',
    type: 'json',
    default: '{}',
    description: 'Input data for the task (JSON format)',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['executeTask'],
      },
    },
  },
  {
    displayName: 'Priority',
    name: 'taskPriority',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 10,
    },
    default: 5,
    description: 'Task priority (1-10)',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['executeTask'],
      },
    },
  },
  {
    displayName: 'Wait for Completion',
    name: 'waitForCompletion',
    type: 'boolean',
    default: false,
    description: 'Whether to wait for the task to complete before returning',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['executeTask'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'historyLimit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 20,
    description: 'Maximum number of history entries to return',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['getExecutionHistory'],
      },
    },
  },
  {
    displayName: 'Personality Traits',
    name: 'personalityTraits',
    type: 'string',
    default: '',
    description: 'Comma-separated personality traits',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['updatePersonality'],
      },
    },
  },
  {
    displayName: 'Custom Prompt',
    name: 'customPrompt',
    type: 'string',
    typeOptions: {
      rows: 5,
    },
    default: '',
    description: 'Custom system prompt for the agent personality',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['updatePersonality'],
      },
    },
  },
];

export async function executeTask(
  this: IExecuteFunctions,
  index: number,
): Promise<ExecutionResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const workerId = this.getNodeParameter('workerId', index) as string;
  const functionId = this.getNodeParameter('functionId', index) as string;
  const inputData = this.getNodeParameter('inputData', index) as string;
  const priority = this.getNodeParameter('taskPriority', index) as number;
  const waitForCompletion = this.getNodeParameter('waitForCompletion', index) as boolean;

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(inputData);
  } catch {
    throw new Error('Invalid JSON in input data');
  }

  const body: Record<string, unknown> = {
    input,
    priority,
    waitForCompletion,
  };

  if (workerId) {
    body.workerId = workerId;
  }
  if (functionId) {
    body.functionId = functionId;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_EXECUTE, { agentId });
  const response = await client.post<ExecutionResult>(endpoint, body);

  return response.data;
}

export async function getExecutionHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<ExecutionResult[]> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const limit = this.getNodeParameter('historyLimit', index) as number;

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_HISTORY, { agentId });
  const response = await client.get<ExecutionResult[]>(endpoint, { limit });

  return response.data;
}

export async function getAgentState(
  this: IExecuteFunctions,
  index: number,
): Promise<GameState> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_STATE, { agentId });
  const response = await client.get<GameState>(endpoint);

  return response.data;
}

export async function updatePersonality(
  this: IExecuteFunctions,
  index: number,
): Promise<{ success: boolean; message: string }> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const personalityTraits = this.getNodeParameter('personalityTraits', index) as string;
  const customPrompt = this.getNodeParameter('customPrompt', index) as string;

  const body: Record<string, unknown> = {};

  if (personalityTraits) {
    body.traits = personalityTraits.split(',').map((t) => t.trim());
  }
  if (customPrompt) {
    body.customPrompt = customPrompt;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_PERSONALITY, { agentId });
  const response = await client.put<{ success: boolean; message: string }>(endpoint, body);

  return response.data;
}
