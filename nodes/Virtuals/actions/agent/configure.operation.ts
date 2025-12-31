/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { DEFAULT_PERSONALITIES } from '../../constants/platforms';
import type { Agent } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The unique identifier of the agent to configure',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['configure'],
      },
    },
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['configure'],
      },
    },
    options: [
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
      },
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
      {
        displayName: 'Communication Style',
        name: 'communicationStyle',
        type: 'options',
        options: [
          { name: 'Casual', value: 'casual' },
          { name: 'Formal', value: 'formal' },
          { name: 'Technical', value: 'technical' },
          { name: 'Friendly', value: 'friendly' },
          { name: 'Expressive', value: 'expressive' },
        ],
        default: 'casual',
        description: 'The communication style of the agent',
      },
      {
        displayName: 'Traits',
        name: 'traits',
        type: 'string',
        default: '',
        description:
          'Comma-separated list of personality traits (e.g., "helpful, patient, curious")',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Updated description for the agent',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<Agent> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as {
    personality?: string;
    customPrompt?: string;
    responseLength?: string;
    communicationStyle?: string;
    traits?: string;
    description?: string;
  };

  const body: Record<string, unknown> = {};

  if (updateFields.personality) {
    body.personality = updateFields.personality;
  }
  if (updateFields.customPrompt) {
    body.customPrompt = updateFields.customPrompt;
  }
  if (updateFields.responseLength) {
    body.responseLength = updateFields.responseLength;
  }
  if (updateFields.communicationStyle) {
    body.communicationStyle = updateFields.communicationStyle;
  }
  if (updateFields.traits) {
    body.traits = updateFields.traits.split(',').map((t) => t.trim());
  }
  if (updateFields.description) {
    body.description = updateFields.description;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_CONFIGURE, { id: agentId });
  const response = await client.put<Agent>(endpoint, body);

  return response.data;
}
