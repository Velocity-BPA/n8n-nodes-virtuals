/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { MessageResponse } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to send a message to',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['sendMessage', 'getResponse'],
      },
    },
  },
  {
    displayName: 'Message',
    name: 'message',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    required: true,
    default: '',
    description: 'The message to send to the agent',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['sendMessage'],
      },
    },
  },
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    default: '',
    description: 'Optional user ID for conversation context',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['sendMessage'],
      },
    },
  },
  {
    displayName: 'Message Options',
    name: 'messageOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['sendMessage'],
      },
    },
    options: [
      {
        displayName: 'Context',
        name: 'context',
        type: 'json',
        default: '{}',
        description: 'Additional context for the message (JSON format)',
      },
      {
        displayName: 'Stream Response',
        name: 'stream',
        type: 'boolean',
        default: false,
        description: 'Whether to stream the response',
      },
      {
        displayName: 'Max Tokens',
        name: 'maxTokens',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 4096,
        },
        default: 1024,
        description: 'Maximum tokens in response',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberPrecision: 1,
        },
        default: 0.7,
        description: 'Response creativity (0-2)',
      },
    ],
  },
  {
    displayName: 'Response ID',
    name: 'responseId',
    type: 'string',
    required: true,
    default: '',
    description: 'The response ID to retrieve',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['getResponse'],
      },
    },
  },
];

export async function executeSendMessage(
  this: IExecuteFunctions,
  index: number,
): Promise<MessageResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const message = this.getNodeParameter('message', index) as string;
  const userId = this.getNodeParameter('userId', index) as string;
  const messageOptions = this.getNodeParameter('messageOptions', index, {}) as {
    context?: string;
    stream?: boolean;
    maxTokens?: number;
    temperature?: number;
  };

  const body: Record<string, unknown> = {
    message,
  };

  if (userId) {
    body.userId = userId;
  }

  if (messageOptions.context) {
    try {
      body.context = JSON.parse(messageOptions.context);
    } catch {
      body.context = {};
    }
  }

  if (messageOptions.stream !== undefined) {
    body.stream = messageOptions.stream;
  }
  if (messageOptions.maxTokens) {
    body.maxTokens = messageOptions.maxTokens;
  }
  if (messageOptions.temperature !== undefined) {
    body.temperature = messageOptions.temperature;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.CONVERSATION_SEND, { agentId });
  const response = await client.post<MessageResponse>(endpoint, body);

  return response.data;
}

export async function executeGetResponse(
  this: IExecuteFunctions,
  index: number,
): Promise<MessageResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const responseId = this.getNodeParameter('responseId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.CONVERSATION_RESPONSE, { agentId });
  const response = await client.get<MessageResponse>(endpoint, { responseId });

  return response.data;
}
