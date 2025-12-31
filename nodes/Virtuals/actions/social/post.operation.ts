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
import { SOCIAL_PLATFORMS } from '../../constants/platforms';

export const description: INodeProperties[] = [
  {
    displayName: 'Agent ID',
    name: 'agentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The agent ID to post as',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['post', 'getStats', 'getHistory'],
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
    description: 'Social platform to post to',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['post', 'getStats', 'getHistory'],
      },
    },
  },
  {
    displayName: 'Message',
    name: 'message',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    required: true,
    default: '',
    description: 'Message content to post',
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['post'],
      },
    },
  },
  {
    displayName: 'Post Options',
    name: 'postOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['post'],
      },
    },
    options: [
      {
        displayName: 'Reply To',
        name: 'replyTo',
        type: 'string',
        default: '',
        description: 'ID of the post/message to reply to',
      },
      {
        displayName: 'Media URL',
        name: 'mediaUrl',
        type: 'string',
        default: '',
        description: 'URL of media to attach (image or video)',
      },
      {
        displayName: 'Schedule Time',
        name: 'scheduleTime',
        type: 'dateTime',
        default: '',
        description: 'Schedule the post for a specific time',
      },
      {
        displayName: 'Thread',
        name: 'thread',
        type: 'boolean',
        default: false,
        description: 'Whether this is part of a thread (Twitter)',
      },
      {
        displayName: 'AI Generated',
        name: 'aiGenerated',
        type: 'boolean',
        default: true,
        description: 'Whether to let the agent generate or modify the content',
      },
      {
        displayName: 'Generation Prompt',
        name: 'generationPrompt',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Prompt for AI-generated content (used if AI Generated is true)',
      },
    ],
  },
  // Platform-specific options
  {
    displayName: 'Telegram Options',
    name: 'telegramOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['post'],
        platform: ['telegram'],
      },
    },
    options: [
      {
        displayName: 'Chat ID',
        name: 'chatId',
        type: 'string',
        default: '',
        description: 'Telegram chat ID to post to',
      },
      {
        displayName: 'Parse Mode',
        name: 'parseMode',
        type: 'options',
        options: [
          { name: 'None', value: '' },
          { name: 'Markdown', value: 'Markdown' },
          { name: 'HTML', value: 'HTML' },
        ],
        default: 'Markdown',
        description: 'Parse mode for the message',
      },
      {
        displayName: 'Disable Notification',
        name: 'disableNotification',
        type: 'boolean',
        default: false,
        description: 'Whether to send silently',
      },
    ],
  },
  {
    displayName: 'Discord Options',
    name: 'discordOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['post'],
        platform: ['discord'],
      },
    },
    options: [
      {
        displayName: 'Channel ID',
        name: 'channelId',
        type: 'string',
        default: '',
        description: 'Discord channel ID to post to',
      },
      {
        displayName: 'Embed',
        name: 'embed',
        type: 'boolean',
        default: false,
        description: 'Whether to format the message as an embed',
      },
      {
        displayName: 'Embed Title',
        name: 'embedTitle',
        type: 'string',
        default: '',
        description: 'Title for the embed',
      },
      {
        displayName: 'Embed Color',
        name: 'embedColor',
        type: 'string',
        default: '#5865F2',
        description: 'Color for the embed (hex code)',
      },
    ],
  },
  {
    displayName: 'Stats Options',
    name: 'statsOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['social'],
        operation: ['getStats'],
      },
    },
    options: [
      {
        displayName: 'Time Period',
        name: 'timePeriod',
        type: 'options',
        options: [
          { name: '24 Hours', value: '24h' },
          { name: '7 Days', value: '7d' },
          { name: '30 Days', value: '30d' },
          { name: 'All Time', value: 'all' },
        ],
        default: '7d',
        description: 'Time period for statistics',
      },
      {
        displayName: 'Include Engagement',
        name: 'includeEngagement',
        type: 'boolean',
        default: true,
        description: 'Whether to include engagement metrics',
      },
    ],
  },
  {
    displayName: 'History Options',
    name: 'historyOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['social'],
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
        description: 'Maximum number of posts to retrieve',
      },
      {
        displayName: 'Include Replies',
        name: 'includeReplies',
        type: 'boolean',
        default: true,
        description: 'Whether to include replies in history',
      },
    ],
  },
];

interface PostResult {
  success: boolean;
  platform: string;
  postId?: string;
  url?: string;
  message: string;
  scheduled?: boolean;
  scheduledTime?: string;
}

interface SocialStats {
  platform: string;
  followers: number;
  following: number;
  postsCount: number;
  engagement: {
    likes: number;
    replies: number;
    reposts: number;
    impressions: number;
  };
  period: string;
}

interface PostHistory {
  posts: Array<{
    id: string;
    platform: string;
    content: string;
    timestamp: string;
    engagement: {
      likes: number;
      replies: number;
      reposts: number;
    };
    url?: string;
  }>;
  total: number;
  hasMore: boolean;
}

export async function executePost(
  this: IExecuteFunctions,
  index: number,
): Promise<PostResult> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const platform = this.getNodeParameter('platform', index) as string;
  const message = this.getNodeParameter('message', index) as string;
  const postOptions = this.getNodeParameter('postOptions', index, {}) as {
    replyTo?: string;
    mediaUrl?: string;
    scheduleTime?: string;
    thread?: boolean;
    aiGenerated?: boolean;
    generationPrompt?: string;
  };

  // Validate message length for platform
  const platformConfig = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];
  if (platformConfig && message.length > platformConfig.maxMessageLength) {
    throw new NodeOperationError(
      this.getNode(),
      `Message exceeds ${platform} character limit of ${platformConfig.maxMessageLength}`,
    );
  }

  const body: Record<string, unknown> = {
    platform,
    content: message,
  };

  if (postOptions.replyTo) {
    body.replyTo = postOptions.replyTo;
  }
  if (postOptions.mediaUrl) {
    body.mediaUrl = postOptions.mediaUrl;
  }
  if (postOptions.scheduleTime) {
    body.scheduleTime = postOptions.scheduleTime;
  }
  if (postOptions.thread !== undefined) {
    body.thread = postOptions.thread;
  }
  if (postOptions.aiGenerated !== undefined) {
    body.aiGenerated = postOptions.aiGenerated;
  }
  if (postOptions.generationPrompt) {
    body.generationPrompt = postOptions.generationPrompt;
  }

  // Platform-specific options
  if (platform === 'telegram') {
    const telegramOptions = this.getNodeParameter('telegramOptions', index, {}) as {
      chatId?: string;
      parseMode?: string;
      disableNotification?: boolean;
    };
    if (telegramOptions.chatId) {
      body.chatId = telegramOptions.chatId;
    }
    if (telegramOptions.parseMode) {
      body.parseMode = telegramOptions.parseMode;
    }
    if (telegramOptions.disableNotification !== undefined) {
      body.disableNotification = telegramOptions.disableNotification;
    }
  }

  if (platform === 'discord') {
    const discordOptions = this.getNodeParameter('discordOptions', index, {}) as {
      channelId?: string;
      embed?: boolean;
      embedTitle?: string;
      embedColor?: string;
    };
    if (discordOptions.channelId) {
      body.channelId = discordOptions.channelId;
    }
    if (discordOptions.embed) {
      body.embed = {
        enabled: true,
        title: discordOptions.embedTitle || '',
        color: discordOptions.embedColor || '#5865F2',
      };
    }
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_POST, { agentId });
  const response = await client.post<PostResult>(endpoint, body);

  return response.data;
}

export async function executeGetStats(
  this: IExecuteFunctions,
  index: number,
): Promise<SocialStats> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const platform = this.getNodeParameter('platform', index) as string;
  const statsOptions = this.getNodeParameter('statsOptions', index, {}) as {
    timePeriod?: string;
    includeEngagement?: boolean;
  };

  const params: Record<string, unknown> = {
    platform,
  };

  if (statsOptions.timePeriod) {
    params.period = statsOptions.timePeriod;
  }
  if (statsOptions.includeEngagement !== undefined) {
    params.includeEngagement = statsOptions.includeEngagement;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_STATS, { agentId });
  const response = await client.get<SocialStats>(endpoint, params);

  return response.data;
}

export async function executeGetHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<PostHistory> {
  const client = createApiClient(this);

  const agentId = this.getNodeParameter('agentId', index) as string;
  const platform = this.getNodeParameter('platform', index) as string;
  const historyOptions = this.getNodeParameter('historyOptions', index, {}) as {
    limit?: number;
    includeReplies?: boolean;
  };

  const params: Record<string, unknown> = {
    platform,
  };

  if (historyOptions.limit) {
    params.limit = historyOptions.limit;
  }
  if (historyOptions.includeReplies !== undefined) {
    params.includeReplies = historyOptions.includeReplies;
  }

  const endpoint = buildEndpoint(API_ENDPOINTS.SOCIAL_HISTORY, { agentId });
  const response = await client.get<PostHistory>(endpoint, params);

  return response.data;
}
