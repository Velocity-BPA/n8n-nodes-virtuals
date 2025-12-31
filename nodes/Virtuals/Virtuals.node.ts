/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as agent from './actions/agent';
import * as game from './actions/game';
import * as token from './actions/token';
import * as conversation from './actions/conversation';
import * as revenue from './actions/revenue';
import * as social from './actions/social';

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

// Helper functions for operation execution
async function executeAgentOperation(
  context: IExecuteFunctions,
  operation: string,
  index: number,
): Promise<unknown> {
  switch (operation) {
    case 'list':
      return agent.list.execute.call(context, index);
    case 'get':
      return agent.get.executeGet.call(context, index);
    case 'getStatus':
      return agent.get.executeGetStatus.call(context, index);
    case 'getMetrics':
      return agent.get.executeGetMetrics.call(context, index);
    case 'getWallet':
      return agent.get.executeGetWallet.call(context, index);
    case 'create':
      return agent.create.execute.call(context, index);
    case 'configure':
      return agent.configure.execute.call(context, index);
    case 'start':
      return agent.control.executeStart.call(context, index);
    case 'stop':
      return agent.control.executeStop.call(context, index);
    case 'delete':
      return agent.control.executeDelete.call(context, index);
    default:
      throw new NodeOperationError(
        context.getNode(),
        `Unknown agent operation: ${operation}`,
        { itemIndex: index },
      );
  }
}

async function executeGameOperation(
  context: IExecuteFunctions,
  operation: string,
  index: number,
): Promise<unknown> {
  switch (operation) {
    case 'createGoal':
      return game.goal.executeCreateGoal.call(context, index);
    case 'getGoals':
      return game.goal.executeGetGoals.call(context, index);
    case 'configureWorker':
      return game.worker.executeConfigureWorker.call(context, index);
    case 'getWorkers':
      return game.worker.executeGetWorkers.call(context, index);
    case 'addFunction':
      return game.func.executeAddFunction.call(context, index);
    case 'getFunctions':
      return game.func.executeGetFunctions.call(context, index);
    case 'executeTask':
      return game.execute.executeTask.call(context, index);
    case 'getExecutionHistory':
      return game.execute.getExecutionHistory.call(context, index);
    case 'getAgentState':
      return game.execute.getAgentState.call(context, index);
    case 'updatePersonality':
      return game.execute.updatePersonality.call(context, index);
    default:
      throw new NodeOperationError(
        context.getNode(),
        `Unknown G.A.M.E. operation: ${operation}`,
        { itemIndex: index },
      );
  }
}

async function executeTokenOperation(
  context: IExecuteFunctions,
  operation: string,
  index: number,
): Promise<unknown> {
  switch (operation) {
    case 'getPrice':
      return token.price.executeGetPrice.call(context, index);
    case 'getInfo':
      return token.price.executeGetInfo.call(context, index);
    case 'getMarketCap':
      return token.info.executeGetMarketCap.call(context, index);
    case 'getVolume':
      return token.info.executeGetVolume.call(context, index);
    case 'getLiquidity':
      return token.info.executeGetLiquidity.call(context, index);
    case 'trade':
      return token.trade.execute.call(context, index);
    case 'getHolders':
      return token.holders.executeGetHolders.call(context, index);
    case 'getHistory':
      return token.holders.executeGetHistory.call(context, index);
    default:
      throw new NodeOperationError(
        context.getNode(),
        `Unknown token operation: ${operation}`,
        { itemIndex: index },
      );
  }
}

async function executeConversationOperation(
  context: IExecuteFunctions,
  operation: string,
  index: number,
): Promise<unknown> {
  switch (operation) {
    case 'sendMessage':
      return conversation.send.executeSendMessage.call(context, index);
    case 'getResponse':
      return conversation.send.executeGetResponse.call(context, index);
    case 'getHistory':
      return conversation.history.executeGetHistory.call(context, index);
    case 'clearContext':
      return conversation.history.executeClearContext.call(context, index);
    case 'setPersonality':
      return conversation.personality.executeSetPersonality.call(context, index);
    case 'getPersonas':
      return conversation.personality.executeGetPersonas.call(context, index);
    default:
      throw new NodeOperationError(
        context.getNode(),
        `Unknown conversation operation: ${operation}`,
        { itemIndex: index },
      );
  }
}

async function executeRevenueOperation(
  context: IExecuteFunctions,
  operation: string,
  index: number,
): Promise<unknown> {
  switch (operation) {
    case 'getStats':
      return revenue.stats.executeGetStats.call(context, index);
    case 'getCreatorEarnings':
      return revenue.stats.executeGetCreatorEarnings.call(context, index);
    case 'getHolderEarnings':
      return revenue.stats.executeGetHolderEarnings.call(context, index);
    case 'claimRevenue':
      return revenue.claim.executeClaimRevenue.call(context, index);
    case 'getRevenueHistory':
      return revenue.claim.executeGetHistory.call(context, index);
    default:
      throw new NodeOperationError(
        context.getNode(),
        `Unknown revenue operation: ${operation}`,
        { itemIndex: index },
      );
  }
}

async function executeSocialOperation(
  context: IExecuteFunctions,
  operation: string,
  index: number,
): Promise<unknown> {
  switch (operation) {
    case 'connectTwitter':
      return social.connect.executeConnectTwitter.call(context, index);
    case 'connectTelegram':
      return social.connect.executeConnectTelegram.call(context, index);
    case 'connectDiscord':
      return social.connect.executeConnectDiscord.call(context, index);
    case 'postAsAgent':
      return social.post.executePost.call(context, index);
    case 'getSocialStats':
      return social.post.executeGetStats.call(context, index);
    case 'getSocialHistory':
      return social.post.executeGetHistory.call(context, index);
    default:
      throw new NodeOperationError(
        context.getNode(),
        `Unknown social operation: ${operation}`,
        { itemIndex: index },
      );
  }
}

export class Virtuals implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Virtuals',
    name: 'virtuals',
    icon: 'file:virtuals.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with Virtuals Protocol AI agents, G.A.M.E. framework, token operations, and social integrations',
    defaults: {
      name: 'Virtuals',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'virtualsApi',
        required: true,
      },
      {
        name: 'virtualsWallet',
        required: false,
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['trade'],
          },
        },
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Agent',
            value: 'agent',
            description: 'Manage AI agents',
          },
          {
            name: 'Conversation',
            value: 'conversation',
            description: 'Handle agent conversations',
          },
          {
            name: 'G.A.M.E.',
            value: 'game',
            description:
              'Generative Autonomous Multimodal Entities framework',
          },
          {
            name: 'Revenue',
            value: 'revenue',
            description: 'Track and claim revenue',
          },
          {
            name: 'Social',
            value: 'social',
            description: 'Manage social media integrations',
          },
          {
            name: 'Token',
            value: 'token',
            description: 'Token operations and trading',
          },
        ],
        default: 'agent',
      },
      // Agent Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['agent'],
          },
        },
        options: [
          {
            name: 'Configure',
            value: 'configure',
            description: 'Update agent configuration',
            action: 'Configure an agent',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new agent',
            action: 'Create an agent',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete an agent',
            action: 'Delete an agent',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get agent details',
            action: 'Get an agent',
          },
          {
            name: 'Get Metrics',
            value: 'getMetrics',
            description: 'Get agent performance metrics',
            action: 'Get agent metrics',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get agent status',
            action: 'Get agent status',
          },
          {
            name: 'Get Wallet',
            value: 'getWallet',
            description: 'Get agent wallet info',
            action: 'Get agent wallet',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all agents',
            action: 'List agents',
          },
          {
            name: 'Start',
            value: 'start',
            description: 'Start an agent',
            action: 'Start an agent',
          },
          {
            name: 'Stop',
            value: 'stop',
            description: 'Stop an agent',
            action: 'Stop an agent',
          },
        ],
        default: 'list',
      },
      // G.A.M.E. Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['game'],
          },
        },
        options: [
          {
            name: 'Add Function',
            value: 'addFunction',
            description: 'Add a function to an agent',
            action: 'Add a function',
          },
          {
            name: 'Configure Worker',
            value: 'configureWorker',
            description: 'Configure a G.A.M.E. worker',
            action: 'Configure a worker',
          },
          {
            name: 'Create Goal',
            value: 'createGoal',
            description: 'Create a new goal',
            action: 'Create a goal',
          },
          {
            name: 'Execute Task',
            value: 'executeTask',
            description: 'Execute a task',
            action: 'Execute a task',
          },
          {
            name: 'Get Agent State',
            value: 'getAgentState',
            description: 'Get agent memory and context state',
            action: 'Get agent state',
          },
          {
            name: 'Get Execution History',
            value: 'getExecutionHistory',
            description: 'Get task execution history',
            action: 'Get execution history',
          },
          {
            name: 'Get Functions',
            value: 'getFunctions',
            description: 'List available functions',
            action: 'Get functions',
          },
          {
            name: 'Get Goals',
            value: 'getGoals',
            description: 'List goals',
            action: 'Get goals',
          },
          {
            name: 'Get Workers',
            value: 'getWorkers',
            description: 'List workers',
            action: 'Get workers',
          },
          {
            name: 'Update Personality',
            value: 'updatePersonality',
            description: 'Update agent personality',
            action: 'Update personality',
          },
        ],
        default: 'getGoals',
      },
      // Token Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['token'],
          },
        },
        options: [
          {
            name: 'Get History',
            value: 'getHistory',
            description: 'Get token transaction history',
            action: 'Get token history',
          },
          {
            name: 'Get Holders',
            value: 'getHolders',
            description: 'Get token holders list',
            action: 'Get token holders',
          },
          {
            name: 'Get Info',
            value: 'getInfo',
            description: 'Get token information',
            action: 'Get token info',
          },
          {
            name: 'Get Liquidity',
            value: 'getLiquidity',
            description: 'Get liquidity pool info',
            action: 'Get liquidity info',
          },
          {
            name: 'Get Market Cap',
            value: 'getMarketCap',
            description: 'Get token market capitalization',
            action: 'Get market cap',
          },
          {
            name: 'Get Price',
            value: 'getPrice',
            description: 'Get current token price',
            action: 'Get token price',
          },
          {
            name: 'Get Volume',
            value: 'getVolume',
            description: 'Get trading volume',
            action: 'Get trading volume',
          },
          {
            name: 'Trade',
            value: 'trade',
            description: 'Buy or sell tokens',
            action: 'Trade tokens',
          },
        ],
        default: 'getPrice',
      },
      // Conversation Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['conversation'],
          },
        },
        options: [
          {
            name: 'Clear Context',
            value: 'clearContext',
            description: 'Clear conversation context',
            action: 'Clear context',
          },
          {
            name: 'Get Available Personas',
            value: 'getPersonas',
            description: 'Get available personality personas',
            action: 'Get personas',
          },
          {
            name: 'Get History',
            value: 'getHistory',
            description: 'Get conversation history',
            action: 'Get conversation history',
          },
          {
            name: 'Get Response',
            value: 'getResponse',
            description: 'Get a specific response',
            action: 'Get response',
          },
          {
            name: 'Send Message',
            value: 'sendMessage',
            description: 'Send a message to an agent',
            action: 'Send message',
          },
          {
            name: 'Set Personality',
            value: 'setPersonality',
            description: 'Set conversation personality',
            action: 'Set personality',
          },
        ],
        default: 'sendMessage',
      },
      // Revenue Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['revenue'],
          },
        },
        options: [
          {
            name: 'Claim Revenue',
            value: 'claimRevenue',
            description: 'Claim available revenue',
            action: 'Claim revenue',
          },
          {
            name: 'Get Creator Earnings',
            value: 'getCreatorEarnings',
            description: 'Get earnings as creator',
            action: 'Get creator earnings',
          },
          {
            name: 'Get Holder Earnings',
            value: 'getHolderEarnings',
            description: 'Get earnings as token holder',
            action: 'Get holder earnings',
          },
          {
            name: 'Get Revenue History',
            value: 'getRevenueHistory',
            description: 'Get revenue claim history',
            action: 'Get revenue history',
          },
          {
            name: 'Get Stats',
            value: 'getStats',
            description: 'Get revenue statistics',
            action: 'Get revenue stats',
          },
        ],
        default: 'getStats',
      },
      // Social Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['social'],
          },
        },
        options: [
          {
            name: 'Connect Discord',
            value: 'connectDiscord',
            description: 'Connect Discord account',
            action: 'Connect Discord',
          },
          {
            name: 'Connect Telegram',
            value: 'connectTelegram',
            description: 'Connect Telegram account',
            action: 'Connect Telegram',
          },
          {
            name: 'Connect Twitter',
            value: 'connectTwitter',
            description: 'Connect Twitter/X account',
            action: 'Connect Twitter',
          },
          {
            name: 'Get Social History',
            value: 'getSocialHistory',
            description: 'Get social posting history',
            action: 'Get social history',
          },
          {
            name: 'Get Social Stats',
            value: 'getSocialStats',
            description: 'Get social media statistics',
            action: 'Get social stats',
          },
          {
            name: 'Post as Agent',
            value: 'postAsAgent',
            description: 'Post content as the agent',
            action: 'Post as agent',
          },
        ],
        default: 'getSocialStats',
      },
      // Common Agent ID field
      {
        displayName: 'Agent ID',
        name: 'agentId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the agent',
        displayOptions: {
          show: {
            resource: ['agent', 'game', 'token', 'conversation', 'revenue', 'social'],
          },
          hide: {
            operation: ['list', 'create'],
          },
        },
      },
      // Include all operation-specific properties
      ...agent.list.description,
      ...agent.get.description,
      ...agent.create.description,
      ...agent.configure.description,
      ...agent.control.description,
      ...game.goal.description,
      ...game.worker.description,
      ...game.func.description,
      ...game.execute.description,
      ...token.price.description,
      ...token.info.description,
      ...token.trade.description,
      ...token.holders.description,
      ...conversation.send.description,
      ...conversation.history.description,
      ...conversation.personality.description,
      ...revenue.stats.description,
      ...revenue.claim.description,
      ...social.connect.description,
      ...social.post.description,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Emit license notice on first execution
    emitLicenseNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: unknown;

        switch (resource) {
          case 'agent':
            result = await executeAgentOperation(this, operation, i);
            break;
          case 'game':
            result = await executeGameOperation(this, operation, i);
            break;
          case 'token':
            result = await executeTokenOperation(this, operation, i);
            break;
          case 'conversation':
            result = await executeConversationOperation(this, operation, i);
            break;
          case 'revenue':
            result = await executeRevenueOperation(this, operation, i);
            break;
          case 'social':
            result = await executeSocialOperation(this, operation, i);
            break;
          default:
            throw new NodeOperationError(
              this.getNode(),
              `Unknown resource: ${resource}`,
              { itemIndex: i },
            );
        }

        if (Array.isArray(result)) {
          returnData.push(
            ...result.map((item) => ({
              json: item as IDataObject,
            })),
          );
        } else {
          returnData.push({ json: result as IDataObject });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
