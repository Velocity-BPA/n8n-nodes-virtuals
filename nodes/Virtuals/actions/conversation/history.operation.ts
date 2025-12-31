/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { ConversationMessage } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to get conversation history for',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['getHistory', 'clearContext'],
      },
    },
  },
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    default: '',
    description: 'Optional user ID to filter conversation history',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['getHistory', 'clearContext'],
      },
    },
  },
  {
    displayName: 'History Options',
    name: 'historyOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['getHistory'],
      },
    },
    options: [
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        default: 50,
        description: 'Maximum number of messages to retrieve',
      },
      {
        displayName: 'Before',
        name: 'before',
        type: 'dateTime',
        default: '',
        description: 'Get messages before this timestamp',
      },
      {
        displayName: 'After',
        name: 'after',
        type: 'dateTime',
        default: '',
        description: 'Get messages after this timestamp',
      },
      {
        displayName: 'Include Metadata',
        name: 'includeMetadata',
        type: 'boolean',
        default: true,
        description: 'Whether to include message metadata',
      },
    ],
  },
  {
    displayName: 'Confirm Clear',
    name: 'confirmClear',
    type: 'boolean',
    required: true,
    default: false,
    description: 'Confirm that you want to clear the conversation context (this cannot be undone)',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['clearContext'],
      },
    },
  },
];

interface HistoryResponse {
  messages: ConversationMessage[];
  total: number;
  hasMore: boolean;
}

export async function executeGetHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<HistoryResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const userId = this.getNodeParameter('userId', index, '') as string;
  const historyOptions = this.getNodeParameter('historyOptions', index, {}) as {
    limit?: number;
    before?: string;
    after?: string;
    includeMetadata?: boolean;
  };

  const params: Record<string, unknown> = {};

  if (userId) {
    params.userId = userId;
  }
  if (historyOptions.limit) {
    params.limit = historyOptions.limit;
  }
  if (historyOptions.before) {
    params.before = historyOptions.before;
  }
  if (historyOptions.after) {
    params.after = historyOptions.after;
  }
  if (historyOptions.includeMetadata !== undefined) {
    params.includeMetadata = historyOptions.includeMetadata;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.CONVERSATION_HISTORY, { agentId });
  const response = await client.get<HistoryResponse>(endpoint, params);

  return response.data;
}

export async function executeClearContext(
  this: IExecuteFunctions,
  index: number,
): Promise<{ success: boolean; message: string }> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const userId = this.getNodeParameter('userId', index, '') as string;
  const confirmClear = this.getNodeParameter('confirmClear', index) as boolean;

  if (!confirmClear) {
    return {
      success: false,
      message: 'Clear context was not confirmed. Set "Confirm Clear" to true to proceed.',
    };
  }

  const body: Record<string, unknown> = {};
  if (userId) {
    body.userId = userId;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.CONVERSATION_CONTEXT, { agentId });
  await client.delete(endpoint, body);

  return {
    success: true,
    message: `Conversation context cleared for agent ${agentId}${userId ? ` and user ${userId}` : ''}`,
  };
}
