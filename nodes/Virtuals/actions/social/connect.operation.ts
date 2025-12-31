/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createApiClient } from '../../transport/apiClient';
import { API_ENDPOINTS, buildEndpoint } from '../../constants/endpoints';
import { getSocialPlatformOptions } from '../../utils/helpers';
import type { SocialConnection } from '../../utils/types';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to connect social platform to',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTwitter', 'connectTelegram', 'connectDiscord', 'disconnect', 'getConnections'],
      },
    },
  },
  // Twitter connection settings
  {
    displayName: 'Twitter API Key',
    name: 'twitterApiKey',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Twitter API Key for the bot account',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTwitter'],
      },
    },
  },
  {
    displayName: 'Twitter API Secret',
    name: 'twitterApiSecret',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Twitter API Secret for the bot account',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTwitter'],
      },
    },
  },
  {
    displayName: 'Twitter Access Token',
    name: 'twitterAccessToken',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Twitter Access Token for the bot account',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTwitter'],
      },
    },
  },
  {
    displayName: 'Twitter Access Token Secret',
    name: 'twitterAccessTokenSecret',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Twitter Access Token Secret for the bot account',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTwitter'],
      },
    },
  },
  // Telegram connection settings
  {
    displayName: 'Telegram Bot Token',
    name: 'telegramBotToken',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Telegram Bot Token from BotFather',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTelegram'],
      },
    },
  },
  {
    displayName: 'Telegram Chat ID',
    name: 'telegramChatId',
    type: 'string',
    default: '',
    description: 'Optional default chat ID for the bot to post in',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTelegram'],
      },
    },
  },
  // Discord connection settings
  {
    displayName: 'Discord Bot Token',
    name: 'discordBotToken',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Discord Bot Token',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectDiscord'],
      },
    },
  },
  {
    displayName: 'Discord Guild ID',
    name: 'discordGuildId',
    type: 'string',
    default: '',
    description: 'Optional default Discord server (guild) ID',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectDiscord'],
      },
    },
  },
  {
    displayName: 'Discord Channel ID',
    name: 'discordChannelId',
    type: 'string',
    default: '',
    description: 'Optional default Discord channel ID',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectDiscord'],
      },
    },
  },
  // Common settings
  {
    displayName: 'Auto Reply',
    name: 'autoReply',
    type: 'boolean',
    default: false,
    description: 'Whether the agent should automatically reply to messages',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['connectTwitter', 'connectTelegram', 'connectDiscord'],
      },
    },
  },
  {
    displayName: 'Platform',
    name: 'platform',
    type: 'options',
    options: getSocialPlatformOptions(),
    required: true,
    default: 'twitter',
    description: 'Platform to disconnect',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['disconnect'],
      },
    },
  },
];

interface ConnectionResult {
  success: boolean;
  platform: string;
  connectionId?: string;
  message: string;
  connectedAt?: string;
}

export async function executeConnectTwitter(
  this: IExecuteFunctions,
  index: number,
): Promise<ConnectionResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const twitterApiKey = this.getNodeParameter('twitterApiKey', index) as string;
  const twitterApiSecret = this.getNodeParameter('twitterApiSecret', index) as string;
  const twitterAccessToken = this.getNodeParameter('twitterAccessToken', index) as string;
  const twitterAccessTokenSecret = this.getNodeParameter('twitterAccessTokenSecret', index) as string;
  const autoReply = this.getNodeParameter('autoReply', index, false) as boolean;

  if (!twitterApiKey || !twitterApiSecret || !twitterAccessToken || !twitterAccessTokenSecret) {
    throw new NodeOperationError(
      this.getNode(),
      'All Twitter API credentials are required',
    );
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_CONNECT, { agentId });
  const response = await client.post<ConnectionResult>(endpoint, {
    platform: 'twitter',
    credentials: {
      apiKey: twitterApiKey,
      apiSecret: twitterApiSecret,
      accessToken: twitterAccessToken,
      accessTokenSecret: twitterAccessTokenSecret,
    },
    settings: {
      autoReply,
    },
  });

  return response.data;
}

export async function executeConnectTelegram(
  this: IExecuteFunctions,
  index: number,
): Promise<ConnectionResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const telegramBotToken = this.getNodeParameter('telegramBotToken', index) as string;
  const telegramChatId = this.getNodeParameter('telegramChatId', index, '') as string;
  const autoReply = this.getNodeParameter('autoReply', index, false) as boolean;

  if (!telegramBotToken) {
    throw new NodeOperationError(
      this.getNode(),
      'Telegram Bot Token is required',
    );
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_CONNECT, { agentId });
  const response = await client.post<ConnectionResult>(endpoint, {
    platform: 'telegram',
    credentials: {
      botToken: telegramBotToken,
    },
    settings: {
      defaultChatId: telegramChatId || undefined,
      autoReply,
    },
  });

  return response.data;
}

export async function executeConnectDiscord(
  this: IExecuteFunctions,
  index: number,
): Promise<ConnectionResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const discordBotToken = this.getNodeParameter('discordBotToken', index) as string;
  const discordGuildId = this.getNodeParameter('discordGuildId', index, '') as string;
  const discordChannelId = this.getNodeParameter('discordChannelId', index, '') as string;
  const autoReply = this.getNodeParameter('autoReply', index, false) as boolean;

  if (!discordBotToken) {
    throw new NodeOperationError(
      this.getNode(),
      'Discord Bot Token is required',
    );
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_CONNECT, { agentId });
  const response = await client.post<ConnectionResult>(endpoint, {
    platform: 'discord',
    credentials: {
      botToken: discordBotToken,
    },
    settings: {
      defaultGuildId: discordGuildId || undefined,
      defaultChannelId: discordChannelId || undefined,
      autoReply,
    },
  });

  return response.data;
}

export async function executeDisconnect(
  this: IExecuteFunctions,
  index: number,
): Promise<ConnectionResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const platform = this.getNodeParameter('platform', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_DISCONNECT, { agentId });
  const response = await client.post<ConnectionResult>(endpoint, { platform });

  return response.data;
}

export async function executeGetConnections(
  this: IExecuteFunctions,
  index: number,
): Promise<{ connections: SocialConnection[] }> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_STATUS, { agentId });
  const response = await client.get<{ connections: SocialConnection[] }>(endpoint);

  return response.data;
}
