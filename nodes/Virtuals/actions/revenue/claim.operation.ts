/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { createBaseClient } from '../../transport/baseClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { isValidAddress } from '../../utils/helpers';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to claim revenue from',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['claimRevenue', 'getHistory'],
      },
    },
  },
  {
    displayName: 'Claim Type',
    name: 'claimType',
    type: 'options',
    options: [
      { name: 'Creator Earnings', value: 'creator' },
      { name: 'Holder Earnings', value: 'holder' },
      { name: 'All Available', value: 'all' },
    ],
    default: 'all',
    description: 'Type of earnings to claim',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['claimRevenue'],
      },
    },
  },
  {
    displayName: 'Recipient Address',
    name: 'recipientAddress',
    type: 'string',
    default: '',
    description: 'Address to receive claimed funds (defaults to connected wallet)',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['claimRevenue'],
      },
    },
  },
  {
    displayName: 'Confirm Claim',
    name: 'confirmClaim',
    type: 'boolean',
    required: true,
    default: false,
    description: 'Confirm that you want to execute this on-chain claim transaction',
    displayOptions: {
      show: {
        resource: ['revenue'],
        operation: ['claimRevenue'],
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
        resource: ['revenue'],
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
        description: 'Maximum number of history entries to retrieve',
      },
      {
        displayName: 'Type Filter',
        name: 'typeFilter',
        type: 'options',
        options: [
          { name: 'All', value: 'all' },
          { name: 'Claims', value: 'claims' },
          { name: 'Distributions', value: 'distributions' },
          { name: 'Accruals', value: 'accruals' },
        ],
        default: 'all',
        description: 'Filter history by type',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Start date for history range',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'End date for history range',
      },
    ],
  },
];

interface ClaimResult {
  success: boolean;
  transactionHash?: string;
  claimedAmount: string;
  claimType: string;
  recipient: string;
  timestamp: string;
}

interface ClaimPrepareResponse {
  available: string;
  contractAddress: string;
  functionSignature: string;
  callData: string;
}

interface HistoryEntry {
  id: string;
  type: string;
  amount: string;
  transactionHash?: string;
  timestamp: string;
  status: string;
  details?: Record<string, unknown>;
}

interface HistoryResponse {
  entries: HistoryEntry[];
  total: number;
  hasMore: boolean;
}

export async function executeClaimRevenue(
  this: IExecuteFunctions,
  index: number,
): Promise<ClaimResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const claimType = this.getNodeParameter('claimType', index) as string;
  const recipientAddress = this.getNodeParameter('recipientAddress', index, '') as string;
  const confirmClaim = this.getNodeParameter('confirmClaim', index) as boolean;

  if (!confirmClaim) {
    return {
      success: false,
      claimedAmount: '0',
      claimType,
      recipient: '',
      timestamp: new Date().toISOString(),
    };
  }

  // Validate recipient address if provided
  if (recipientAddress && !isValidAddress(recipientAddress)) {
    throw new NodeOperationError(
      this.getNode(),
      `Invalid recipient address: ${recipientAddress}`,
    );
  }

  // Get claim preparation data from API
  const prepareEndpoint = buildEndpoint(API_ENDPOINTS.REVENUE_CLAIM_PREPARE, { agentId });
  const prepareResponse = await client.post<ClaimPrepareResponse>(prepareEndpoint, {
    claimType,
    recipient: recipientAddress || undefined,
  });

  const prepareData = prepareResponse.data;

  if (prepareData.available === '0') {
    return {
      success: false,
      claimedAmount: '0',
      claimType,
      recipient: recipientAddress || '',
      timestamp: new Date().toISOString(),
    };
  }

  // Execute on-chain transaction
  const chainClient = createBaseClient(this);
  const wallet = await chainClient.getWalletAddress();
  const recipient = recipientAddress || wallet;

  // For on-chain claims, we use the contract interaction
  // The exact implementation depends on the Virtuals revenue contract
  const claimEndpoint = buildEndpoint(API_ENDPOINTS.REVENUE_CLAIM, { agentId });
  const claimResponse = await client.post<ClaimResult>(claimEndpoint, {
    claimType,
    recipient,
    signedTransaction: true, // Indicates on-chain execution
  });

  return {
    success: true,
    transactionHash: claimResponse.data.transactionHash,
    claimedAmount: prepareData.available,
    claimType,
    recipient,
    timestamp: new Date().toISOString(),
  };
}

export async function executeGetHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<HistoryResponse> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const historyOptions = this.getNodeParameter('historyOptions', index, {}) as {
    limit?: number;
    typeFilter?: string;
    startDate?: string;
    endDate?: string;
  };

  const params: Record<string, unknown> = {};

  if (historyOptions.limit) {
    params.limit = historyOptions.limit;
  }
  if (historyOptions.typeFilter && historyOptions.typeFilter !== 'all') {
    params.type = historyOptions.typeFilter;
  }
  if (historyOptions.startDate) {
    params.startDate = historyOptions.startDate;
  }
  if (historyOptions.endDate) {
    params.endDate = historyOptions.endDate;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.REVENUE_HISTORY, { agentId });
  const response = await client.get<HistoryResponse>(endpoint, params);

  return response.data;
}
