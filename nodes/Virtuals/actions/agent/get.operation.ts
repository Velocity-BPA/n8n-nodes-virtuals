/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import type { Agent, AgentMetrics, AgentWallet } from '../../utils/types';

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
        operation: ['get', 'getStatus', 'getMetrics', 'getWallet'],
      },
    },
  },
];

export async function executeGet(
  this: IExecuteFunctions,
  index: number,
): Promise<Agent> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_BY_ID, { id: agentId });
  const response = await client.get<Agent>(endpoint);

  return response.data;
}

export async function executeGetStatus(
  this: IExecuteFunctions,
  index: number,
): Promise<{ agentId: string; status: string; lastUpdated: string }> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_STATUS, { id: agentId });
  const response = await client.get<{
    agentId: string;
    status: string;
    lastUpdated: string;
  }>(endpoint);

  return response.data;
}

export async function executeGetMetrics(
  this: IExecuteFunctions,
  index: number,
): Promise<AgentMetrics> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_METRICS, { id: agentId });
  const response = await client.get<AgentMetrics>(endpoint);

  return response.data;
}

export async function executeGetWallet(
  this: IExecuteFunctions,
  index: number,
): Promise<AgentWallet> {
  const client = createApiClient(this);
  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.AGENT_WALLET, { id: agentId });
  const response = await client.get<AgentWallet>(endpoint);

  return response.data;
}
