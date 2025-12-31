/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { DEFAULT_PERSONALITIES } from '../../constants/platforms';
import type { Agent } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    description: 'The name for your AI agent',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    typeOptions: {
      rows: 3,
    },
    required: true,
    default: '',
    description: 'A description of what your agent does',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Personality',
    name: 'personality',
    type: 'options',
    options: Object.values(DEFAULT_PERSONALITIES).map((p) => ({
      name: p.name,
      value: p.id,
      description: p.description,
    })),
    default: 'friendly',
    description: 'The personality template for your agent',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Custom Prompt',
        name: 'customPrompt',
        type: 'string',
        typeOptions: {
          rows: 5,
        },
        default: '',
        description: 'Custom system prompt for the agent',
      },
      {
        displayName: 'Token Symbol',
        name: 'tokenSymbol',
        type: 'string',
        default: '',
        description: 'Symbol for the agent token (e.g., MYAGENT)',
      },
      {
        displayName: 'Initial Supply',
        name: 'initialSupply',
        type: 'string',
        default: '1000000000',
        description: 'Initial token supply (in whole tokens)',
      },
      {
        displayName: 'Communication Style',
        name: 'communicationStyle',
        type: 'options',
        options: [
          { name: 'Casual', value: 'casual' },
          { name: 'Formal', value: 'formal' },
          { name: 'Technical', value: 'technical' },
          { name: 'Friendly', value: 'friendly' },
        ],
        default: 'casual',
        description: 'The communication style of the agent',
      },
      {
        displayName: 'Response Length',
        name: 'responseLength',
        type: 'options',
        options: [
          { name: 'Short', value: 'short' },
          { name: 'Medium', value: 'medium' },
          { name: 'Long', value: 'long' },
        ],
        default: 'medium',
        description: 'Preferred response length',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<Agent> {
  const client = createApiClient(this);

  const name = this.getNodeParameter('name', index) as string;
  const description = this.getNodeParameter('description', index) as string;
  const personality = this.getNodeParameter('personality', index) as string;
  const additionalOptions = this.getNodeParameter(
    'additionalOptions',
    index,
    {},
  ) as {
    customPrompt?: string;
    tokenSymbol?: string;
    initialSupply?: string;
    communicationStyle?: string;
    responseLength?: string;
  };

  const body: Record<string, unknown> = {
    name,
    description,
    personality,
  };

  if (additionalOptions.customPrompt) {
    body.customPrompt = additionalOptions.customPrompt;
  }
  if (additionalOptions.tokenSymbol) {
    body.tokenSymbol = additionalOptions.tokenSymbol;
  }
  if (additionalOptions.initialSupply) {
    body.initialSupply = additionalOptions.initialSupply;
  }
  if (additionalOptions.communicationStyle) {
    body.communicationStyle = additionalOptions.communicationStyle;
  }
  if (additionalOptions.responseLength) {
    body.responseLength = additionalOptions.responseLength;
  }

  const response = await client.post<Agent>(API_ENDPOINTS.AGENTS, body);

  return response.data;
}
