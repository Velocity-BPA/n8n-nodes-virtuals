/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const SOCIAL_PLATFORMS = {
  TWITTER: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    maxMessageLength: 280,
    supportsMedia: true,
    supportsThreads: true,
  },
  TELEGRAM: {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    maxMessageLength: 4096,
    supportsMedia: true,
    supportsThreads: true,
  },
  DISCORD: {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    maxMessageLength: 2000,
    supportsMedia: true,
    supportsThreads: true,
  },
} as const;

export type SocialPlatformId = keyof typeof SOCIAL_PLATFORMS;

export const DEFAULT_PERSONALITIES = {
  FRIENDLY: {
    id: 'friendly',
    name: 'Friendly Assistant',
    description: 'Warm, helpful, and approachable',
    traits: ['helpful', 'warm', 'patient', 'encouraging'],
    communicationStyle: 'casual',
    responseLength: 'medium',
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional Expert',
    description: 'Formal, knowledgeable, and precise',
    traits: ['precise', 'formal', 'knowledgeable', 'analytical'],
    communicationStyle: 'formal',
    responseLength: 'detailed',
  },
  CREATIVE: {
    id: 'creative',
    name: 'Creative Thinker',
    description: 'Imaginative, playful, and innovative',
    traits: ['creative', 'playful', 'innovative', 'curious'],
    communicationStyle: 'expressive',
    responseLength: 'variable',
  },
  TRADER: {
    id: 'trader',
    name: 'Crypto Trader',
    description: 'Market-focused, data-driven, and strategic',
    traits: ['analytical', 'strategic', 'risk-aware', 'data-driven'],
    communicationStyle: 'concise',
    responseLength: 'short',
  },
  EDUCATOR: {
    id: 'educator',
    name: 'Patient Educator',
    description: 'Teaching-focused, clear, and supportive',
    traits: ['patient', 'clear', 'supportive', 'thorough'],
    communicationStyle: 'explanatory',
    responseLength: 'long',
  },
} as const;

export type PersonalityId = keyof typeof DEFAULT_PERSONALITIES;

export const GAME_WORKER_TYPES = {
  ANALYST: {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Processes and analyzes data',
    capabilities: ['data-processing', 'pattern-recognition', 'reporting'],
  },
  TRADER: {
    id: 'trader',
    name: 'Trading Worker',
    description: 'Executes trading strategies',
    capabilities: ['market-analysis', 'order-execution', 'risk-management'],
  },
  SOCIAL: {
    id: 'social',
    name: 'Social Manager',
    description: 'Manages social media presence',
    capabilities: ['content-creation', 'engagement', 'community-management'],
  },
  RESEARCHER: {
    id: 'researcher',
    name: 'Research Worker',
    description: 'Conducts research and gathers information',
    capabilities: ['web-search', 'data-collection', 'summarization'],
  },
  EXECUTOR: {
    id: 'executor',
    name: 'Task Executor',
    description: 'Executes general tasks',
    capabilities: ['task-execution', 'automation', 'scheduling'],
  },
} as const;

export type WorkerType = keyof typeof GAME_WORKER_TYPES;

export const GAME_FUNCTION_CATEGORIES = {
  COGNITIVE: 'cognitive',
  SOCIAL: 'social',
  TRADING: 'trading',
  UTILITY: 'utility',
  CUSTOM: 'custom',
} as const;

export const AGENT_STATUS = {
  INACTIVE: 'inactive',
  STARTING: 'starting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  ERROR: 'error',
} as const;

export type AgentStatusType = (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS];

export const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
} as const;

export type TradeType = (typeof TRADE_TYPES)[keyof typeof TRADE_TYPES];

export const REVENUE_TYPES = {
  TRADING_FEE: 'trading_fee',
  CONVERSATION_FEE: 'conversation_fee',
  SOCIAL_ENGAGEMENT: 'social_engagement',
  STAKING_REWARD: 'staking_reward',
} as const;

export type RevenueType = (typeof REVENUE_TYPES)[keyof typeof REVENUE_TYPES];
