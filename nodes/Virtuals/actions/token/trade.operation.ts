/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBaseClient } from '../../transport/baseClient';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { CONTRACTS } from '../../constants/contracts';
import type { TradeResult } from '../../utils/types';
import { isValidAddress } from '../../utils/helpers';

export const description: INodeProperties[] = [
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The agent token contract address',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['trade'],
      },
    },
  },
  {
    displayName: 'Action',
    name: 'tradeAction',
    type: 'options',
    options: [
      { name: 'Buy', value: 'buy' },
      { name: 'Sell', value: 'sell' },
    ],
    required: true,
    default: 'buy',
    description: 'Whether to buy or sell the token',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['trade'],
      },
    },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    description:
      'Amount to trade. For buy: amount in VIRTUAL token. For sell: amount in agent token.',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['trade'],
      },
    },
  },
  {
    displayName: 'Slippage (%)',
    name: 'slippage',
    type: 'number',
    typeOptions: {
      minValue: 0.1,
      maxValue: 50,
      numberPrecision: 1,
    },
    required: true,
    default: 1,
    description: 'Maximum allowed slippage percentage',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['trade'],
      },
    },
  },
  {
    displayName: 'Trade Options',
    name: 'tradeOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['trade'],
      },
    },
    options: [
      {
        displayName: 'Deadline (Minutes)',
        name: 'deadlineMinutes',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 60,
        },
        default: 20,
        description: 'Transaction deadline in minutes',
      },
      {
        displayName: 'Use VIRTUAL Token',
        name: 'useVirtual',
        type: 'boolean',
        default: true,
        description: 'Whether to use VIRTUAL token for trading (vs ETH)',
      },
      {
        displayName: 'Simulate Only',
        name: 'simulateOnly',
        type: 'boolean',
        default: false,
        description: 'Simulate the trade without executing',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<TradeResult> {
  const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
  const action = this.getNodeParameter('tradeAction', index) as 'buy' | 'sell';
  const amount = this.getNodeParameter('amount', index) as string;
  const slippage = this.getNodeParameter('slippage', index) as number;
  const tradeOptions = this.getNodeParameter('tradeOptions', index, {}) as {
    deadlineMinutes?: number;
    useVirtual?: boolean;
    simulateOnly?: boolean;
  };

  // Validate token address
  if (!isValidAddress(tokenAddress)) {
    throw new NodeOperationError(
      this.getNode(),
      'Invalid token address format',
    );
  }

  // Validate amount
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    throw new NodeOperationError(
      this.getNode(),
      'Amount must be a positive number',
    );
  }

  const useVirtual = tradeOptions.useVirtual !== false;
  const simulateOnly = tradeOptions.simulateOnly === true;
  const deadlineMinutes = tradeOptions.deadlineMinutes || 20;

  if (simulateOnly) {
    // Use API to simulate trade
    const client = createApiClient(this);
    const endpoint = buildEndpoint(API_ENDPOINTS.TOKEN_TRADE, {
      address: tokenAddress,
    });

    const response = await client.post<TradeResult>(endpoint, {
      action,
      amount,
      slippage,
      simulate: true,
      useVirtual,
    });

    return {
      ...response.data,
      status: 'success',
    };
  }

  // Execute actual trade on-chain
  const baseClient = createBaseClient(this);
  await baseClient.initialize();

  const virtualToken = CONTRACTS.BASE.VIRTUAL_TOKEN;
  const deadline = Math.floor(Date.now() / 1000) + deadlineMinutes * 60;

  let tokenIn: string;
  let tokenOut: string;

  if (action === 'buy') {
    tokenIn = useVirtual ? virtualToken : CONTRACTS.BASE.WETH;
    tokenOut = tokenAddress;
  } else {
    tokenIn = tokenAddress;
    tokenOut = useVirtual ? virtualToken : CONTRACTS.BASE.WETH;
  }

  const result = await baseClient.swap({
    tokenIn,
    tokenOut,
    amountIn: amount,
    slippage,
    deadline,
  });

  return {
    txHash: result.hash,
    action,
    tokenIn,
    tokenOut,
    amountIn: amount,
    amountOut: '0', // Will be filled from events
    priceImpact: 0,
    gasUsed: result.gasUsed,
    status: result.status ? 'success' : 'failed',
  };
}
