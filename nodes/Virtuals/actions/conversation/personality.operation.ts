/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { getPersonalityOptions } from '../../utils/helpers';
import type { AgentPersonality } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to configure personality for',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['setPersonality', 'getPersonas'],
      },
    },
  },
  {
    displayName: 'Personality Template',
    name: 'personalityTemplate',
    type: 'options',
    options: getPersonalityOptions(),
    default: 'friendly',
    description: 'Base personality template to use',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['setPersonality'],
      },
    },
  },
  {
    displayName: 'Personality Settings',
    name: 'personalitySettings',
    type: 'collection',
    placeholder: 'Add Setting',
    default: {},
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['setPersonality'],
      },
    },
    options: [
      {
        displayName: 'Custom Prompt',
        name: 'customPrompt',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        default: '',
        description: 'Custom system prompt to override or extend the personality',
      },
      {
        displayName: 'Traits',
        name: 'traits',
        type: 'string',
        default: '',
        description: 'Comma-separated list of personality traits (e.g., "helpful, witty, concise")',
      },
      {
        displayName: 'Response Style',
        name: 'responseStyle',
        type: 'options',
        options: [
          { name: 'Formal', value: 'formal' },
          { name: 'Casual', value: 'casual' },
          { name: 'Technical', value: 'technical' },
          { name: 'Friendly', value: 'friendly' },
          { name: 'Professional', value: 'professional' },
        ],
        default: 'friendly',
        description: 'Overall style for responses',
      },
      {
        displayName: 'Response Length',
        name: 'responseLength',
        type: 'options',
        options: [
          { name: 'Concise', value: 'concise' },
          { name: 'Moderate', value: 'moderate' },
          { name: 'Detailed', value: 'detailed' },
        ],
        default: 'moderate',
        description: 'Preferred length of responses',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        default: 'en',
        description: 'Primary language for responses (ISO 639-1 code)',
      },
      {
        displayName: 'Emoji Usage',
        name: 'emojiUsage',
        type: 'options',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Minimal', value: 'minimal' },
          { name: 'Moderate', value: 'moderate' },
          { name: 'Frequent', value: 'frequent' },
        ],
        default: 'minimal',
        description: 'How frequently to use emojis in responses',
      },
    ],
  },
  {
    displayName: 'Include Defaults',
    name: 'includeDefaults',
    type: 'boolean',
    default: true,
    description: 'Whether to include default personas in the response',
    displayOptions: {
      show: {
        resource: ['conversation'],
        operation: ['getPersonas'],
      },
    },
  },
];

interface PersonaResponse {
  personas: AgentPersonality[];
  total: number;
}

export async function executeSetPersonality(
  this: IExecuteFunctions,
  index: number,
): Promise<AgentPersonality> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const personalityTemplate = this.getNodeParameter('personalityTemplate', index) as string;
  const personalitySettings = this.getNodeParameter('personalitySettings', index, {}) as {
    customPrompt?: string;
    traits?: string;
    responseStyle?: string;
    responseLength?: string;
    language?: string;
    emojiUsage?: string;
  };

  const body: Record<string, unknown> = {
    template: personalityTemplate,
  };

  if (personalitySettings.customPrompt) {
    body.customPrompt = personalitySettings.customPrompt;
  }

  if (personalitySettings.traits) {
    body.traits = personalitySettings.traits.split(',').map((t) => t.trim()).filter(Boolean);
  }

  if (personalitySettings.responseStyle) {
    body.communicationStyle = personalitySettings.responseStyle;
  }

  if (personalitySettings.responseLength) {
    body.responseLength = personalitySettings.responseLength;
  }

  if (personalitySettings.language) {
    body.language = personalitySettings.language;
  }

  if (personalitySettings.emojiUsage) {
    body.emojiUsage = personalitySettings.emojiUsage;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.CONVERSATION_PERSONALITY, { agentId });
  const response = await client.post<AgentPersonality>(endpoint, body);

  return response.data;
}

export async function executeGetPersonas(
  this: IExecuteFunctions,
  index: number,
): Promise<PersonaResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const includeDefaults = this.getNodeParameter('includeDefaults', index, true) as boolean;

  const endpoint = buildEndpoint(API_ENDPOINTS.CONVERSATION_PERSONAS, { agentId });
  const response = await client.get<PersonaResponse>(endpoint, { includeDefaults });

  return response.data;
}
