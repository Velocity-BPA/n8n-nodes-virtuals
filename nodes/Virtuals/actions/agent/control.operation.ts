/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The unique identifier of the agent',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['start', 'stop', 'delete'],
      },
    },
  },
  {
    displayName: 'Confirm Delete',
    name: 'confirmDelete',
    type: 'boolean',
    default: false,
    description: 'Confirm that you want to permanently delete this agent',
    displayOptions: {
      show: {
        resource: ['agent'],
        operation: ['delete'],
      },
    },
  },
];

export interface ControlResult {
  agentId: string;
  action: string;
  status: string;
  message: string;
  timestamp: string;
}

export async function executeStart(
  this: IExecuteFunctions,
  index: number,
): Promise<ControlResult> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_START, { id: agentId });
  const response = await client.post<ControlResult>(endpoint);

  return {
    ...response.data,
    action: 'start',
  };
}

export async function executeStop(
  this: IExecuteFunctions,
  index: number,
): Promise<ControlResult> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_STOP, { id: agentId });
  const response = await client.post<ControlResult>(endpoint);

  return {
    ...response.data,
    action: 'stop',
  };
}

export async function executeDelete(
  this: IExecuteFunctions,
  index: number,
): Promise<ControlResult> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;
  const confirmDelete = this.getNodeParameter('confirmDelete', index) as boolean;

  if (!confirmDelete) {
    throw new Error(
      'Delete operation not confirmed. Please check "Confirm Delete" to proceed.',
    );
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_BY_ID, { id: agentId });
  const response = await client.delete<ControlResult>(endpoint);

  return {
    ...response.data,
    action: 'delete',
  };
}
