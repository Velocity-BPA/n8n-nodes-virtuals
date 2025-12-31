/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  IDataObject,
} from 'n8n-workflow';
import { VirtualsWebSocketClient, type WebSocketMessage } from './transport/websocket';

// Emit licensing notice once on module load
const emitLicenseNotice = (() => {
  let emitted = false;
  return () => {
    if (!emitted) {
      console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
      emitted = true;
    }
  };
})();

export class VirtualsTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Virtuals Trigger',
    name: 'virtualsTrigger',
    icon: 'file:virtuals.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Listen for real-time events from Virtuals Protocol',
    defaults: {
      name: 'Virtuals Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'virtualsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event Category',
        name: 'eventCategory',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Agent Events',
            value: 'agent',
            description: 'Events related to agent lifecycle and activity',
          },
          {
            name: 'Revenue Events',
            value: 'revenue',
            description: 'Events related to revenue and claims',
          },
          {
            name: 'Token Events',
            value: 'token',
            description: 'Events related to token price and trading',
          },
        ],
        default: 'agent',
      },
      // Agent Events
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            eventCategory: ['agent'],
          },
        },
        options: [
          {
            name: 'Agent Created',
            value: 'agent.created',
            description: 'When a new agent is created',
          },
          {
            name: 'Agent Message Received',
            value: 'agent.message',
            description: 'When an agent receives a message',
          },
          {
            name: 'Agent Status Changed',
            value: 'agent.status',
            description: 'When an agent status changes',
          },
          {
            name: 'Agent Task Completed',
            value: 'agent.task.completed',
            description: 'When an agent completes a task',
          },
        ],
        default: 'agent.status',
      },
      // Token Events
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            eventCategory: ['token'],
          },
        },
        options: [
          {
            name: 'Large Trade Alert',
            value: 'token.large_trade',
            description: 'When a large trade occurs',
          },
          {
            name: 'Liquidity Changed',
            value: 'token.liquidity',
            description: 'When liquidity pool changes significantly',
          },
          {
            name: 'New Holder',
            value: 'token.new_holder',
            description: 'When a new holder acquires tokens',
          },
          {
            name: 'Token Price Changed',
            value: 'token.price',
            description: 'When token price changes significantly',
          },
        ],
        default: 'token.price',
      },
      // Revenue Events
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            eventCategory: ['revenue'],
          },
        },
        options: [
          {
            name: 'Claim Available',
            value: 'revenue.claim_available',
            description: 'When new revenue is available to claim',
          },
          {
            name: 'Revenue Generated',
            value: 'revenue.generated',
            description: 'When new revenue is generated',
          },
        ],
        default: 'revenue.generated',
      },
      // Agent ID filter
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        default: '',
        description:
          'Filter events to a specific agent (leave empty for all agents)',
      },
      // Price change threshold
      {
        displayName: 'Price Change Threshold (%)',
        name: 'priceThreshold',
        type: 'number',
        default: 5,
        description: 'Minimum price change percentage to trigger',
        displayOptions: {
          show: {
            event: ['token.price'],
          },
        },
      },
      // Trade size threshold
      {
        displayName: 'Trade Size Threshold (USD)',
        name: 'tradeThreshold',
        type: 'number',
        default: 10000,
        description: 'Minimum trade size in USD to trigger',
        displayOptions: {
          show: {
            event: ['token.large_trade'],
          },
        },
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    // Emit license notice on first trigger
    emitLicenseNotice();

    const event = this.getNodeParameter('event') as string;
    const agentId = this.getNodeParameter('agentId', '') as string;

    // Get optional thresholds
    let priceThreshold: number | undefined;
    let tradeThreshold: number | undefined;

    if (event === 'token.price') {
      priceThreshold = this.getNodeParameter('priceThreshold', 5) as number;
    }
    if (event === 'token.large_trade') {
      tradeThreshold = this.getNodeParameter('tradeThreshold', 10000) as number;
    }

    // Create WebSocket client
    const client = new VirtualsWebSocketClient(this);

    // Build channel name
    let channel = event;
    if (agentId) {
      channel = `${event}:${agentId}`;
    }

    // Handle incoming messages
    client.onMessage((message: WebSocketMessage) => {
      const data = message.data;

      // Filter based on thresholds
      if (event === 'token.price' && priceThreshold) {
        const changePercent = Math.abs((data.changePercent as number) || 0);
        if (changePercent < priceThreshold) {
          return; // Skip events below threshold
        }
      }

      if (event === 'token.large_trade' && tradeThreshold) {
        const tradeValue = (data.valueUsd as number) || 0;
        if (tradeValue < tradeThreshold) {
          return; // Skip trades below threshold
        }
      }

      // Emit the event with proper IDataObject conversion
      const outputData = {
        event: message.event,
        type: message.type,
        timestamp: message.timestamp,
        ...data,
      } as IDataObject;

      this.emit([this.helpers.returnJsonArray([outputData])]);
    });

    // Handle errors
    client.onError((error: Error) => {
      console.error('Virtuals WebSocket error:', error.message);
    });

    // Build WebSocket config
    const wsConfig = {
      endpoint: '/ws/events',
      subscriptions: [channel],
      filters: agentId ? { agentId } : undefined,
    };

    // Connect with config
    await client.connect(wsConfig);

    // Cleanup function
    const closeFunction = async () => {
      client.unsubscribe([channel]);
      client.close();
    };

    // Return manual trigger response
    return {
      closeFunction,
    };
  }
}
