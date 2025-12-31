/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { GAME_FUNCTION_CATEGORIES } from '../../constants/platforms';
import type { GameFunction } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to manage functions for',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['addFunction', 'getFunctions'],
      },
    },
  },
  {
    displayName: 'Function Name',
    name: 'functionName',
    type: 'string',
    required: true,
    default: '',
    description: 'The name of the function',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['addFunction'],
      },
    },
  },
  {
    displayName: 'Function Description',
    name: 'functionDescription',
    type: 'string',
    typeOptions: {
      rows: 2,
    },
    required: true,
    default: '',
    description: 'Description of what this function does',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['addFunction'],
      },
    },
  },
  {
    displayName: 'Category',
    name: 'category',
    type: 'options',
    options: Object.entries(GAME_FUNCTION_CATEGORIES).map(([key, value]) => ({
      name: key.charAt(0) + key.slice(1).toLowerCase(),
      value,
    })),
    required: true,
    default: 'utility',
    description: 'The category of the function',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['addFunction'],
      },
    },
  },
  {
    displayName: 'Parameters',
    name: 'parameters',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Parameter',
    default: {},
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['addFunction'],
      },
    },
    options: [
      {
        name: 'parameter',
        displayName: 'Parameter',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'Parameter name',
          },
          {
            displayName: 'Type',
            name: 'type',
            type: 'options',
            options: [
              { name: 'String', value: 'string' },
              { name: 'Number', value: 'number' },
              { name: 'Boolean', value: 'boolean' },
              { name: 'Object', value: 'object' },
              { name: 'Array', value: 'array' },
            ],
            default: 'string',
            description: 'Parameter type',
          },
          {
            displayName: 'Required',
            name: 'required',
            type: 'boolean',
            default: true,
            description: 'Whether this parameter is required',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
            description: 'Parameter description',
          },
          {
            displayName: 'Default Value',
            name: 'default',
            type: 'string',
            default: '',
            description: 'Default value (as JSON string for objects/arrays)',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Enable Function',
    name: 'isEnabled',
    type: 'boolean',
    default: true,
    description: 'Whether to enable this function immediately',
    displayOptions: {
      show: {
        resource: ['game'],
        operation: ['addFunction'],
      },
    },
  },
];

export async function executeAddFunction(
  this: IExecuteFunctions,
  index: number,
): Promise<GameFunction> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const name = this.getNodeParameter('functionName', index) as string;
  const description = this.getNodeParameter('functionDescription', index) as string;
  const category = this.getNodeParameter('category', index) as string;
  const parametersData = this.getNodeParameter('parameters', index, {}) as {
    parameter?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
      default?: string;
    }>;
  };
  const isEnabled = this.getNodeParameter('isEnabled', index) as boolean;

  const parameters = (parametersData.parameter || []).map((p) => ({
    name: p.name,
    type: p.type,
    required: p.required,
    description: p.description,
    default: p.default ? JSON.parse(p.default) : undefined,
  }));

  const body: Record<string, unknown> = {
    name,
    description,
    category,
    parameters,
    isEnabled,
  };

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_FUNCTIONS, { agentId });
  const response = await client.post<GameFunction>(endpoint, body);

  return response.data;
}

export async function executeGetFunctions(
  this: IExecuteFunctions,
  index: number,
): Promise<GameFunction[]> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.GAME_FUNCTIONS, { agentId });
  const response = await client.get<GameFunction[]>(endpoint);

  return response.data;
}
