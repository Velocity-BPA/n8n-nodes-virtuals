/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const API_ENDPOINTS = {
  // Base URLs
  PRODUCTION: 'https://api.virtuals.io',
  TESTNET: 'https://testnet-api.virtuals.io',

  // Agent endpoints
  AGENTS: '/v1/agents',
  AGENT_BY_ID: '/v1/agents/:id',
  AGENT_STATUS: '/v1/agents/:id/status',
  AGENT_METRICS: '/v1/agents/:id/metrics',
  AGENT_WALLET: '/v1/agents/:id/wallet',
  AGENT_START: '/v1/agents/:id/start',
  AGENT_STOP: '/v1/agents/:id/stop',
  AGENT_CONFIGURE: '/v1/agents/:id/configure',

  // G.A.M.E. endpoints
  GAME_GOALS: '/v1/game/agents/:agentId/goals',
  GAME_GOAL_BY_ID: '/v1/game/goals/:id',
  GAME_WORKERS: '/v1/game/agents/:agentId/workers',
  GAME_WORKER_BY_ID: '/v1/game/workers/:id',
  GAME_FUNCTIONS: '/v1/game/agents/:agentId/functions',
  GAME_FUNCTION_BY_ID: '/v1/game/functions/:id',
  GAME_EXECUTE: '/v1/game/agents/:agentId/execute',
  GAME_HISTORY: '/v1/game/agents/:agentId/history',
  GAME_STATE: '/v1/game/agents/:agentId/state',
  GAME_PERSONALITY: '/v1/game/agents/:agentId/personality',

  // Token endpoints
  TOKEN_PRICE: '/v1/tokens/:address/price',
  TOKEN_INFO: '/v1/tokens/:address',
  TOKEN_HOLDERS: '/v1/tokens/:address/holders',
  TOKEN_MARKET_CAP: '/v1/tokens/:address/market-cap',
  TOKEN_VOLUME: '/v1/tokens/:address/volume',
  TOKEN_TRADE: '/v1/tokens/:address/trade',
  TOKEN_HISTORY: '/v1/tokens/:address/history',
  TOKEN_LIQUIDITY: '/v1/tokens/:address/liquidity',

  // Conversation endpoints
  CONVERSATION_SEND: '/v1/conversation/agents/:agentId/message',
  CONVERSATION_RESPONSE: '/v1/conversation/agents/:agentId/response',
  CONVERSATION_HISTORY: '/v1/conversation/agents/:agentId/history',
  CONVERSATION_CLEAR: '/v1/conversation/agents/:agentId/clear',
  CONVERSATION_PERSONALITY: '/v1/conversation/agents/:agentId/personality',
  CONVERSATION_PERSONAS: '/v1/conversation/personas',

  // Revenue endpoints
  REVENUE_STATS: '/v1/revenue/agents/:agentId/stats',
  REVENUE_CREATOR: '/v1/revenue/agents/:agentId/creator',
  REVENUE_HOLDER: '/v1/revenue/agents/:agentId/holder',
  REVENUE_HOLDERS: '/v1/revenue/agents/:agentId/holders',
  REVENUE_CLAIM: '/v1/revenue/agents/:agentId/claim',
  REVENUE_CLAIM_PREPARE: '/v1/revenue/agents/:agentId/claim/prepare',
  REVENUE_HISTORY: '/v1/revenue/agents/:agentId/history',

  // Conversation additional endpoints
  CONVERSATION_CONTEXT: '/v1/conversation/agents/:agentId/context',

  // Social endpoints
  SOCIAL_CONNECT: '/v1/social/agents/:agentId/:platform/connect',
  SOCIAL_CONNECT_TWITTER: '/v1/social/agents/:agentId/twitter/connect',
  SOCIAL_CONNECT_TELEGRAM: '/v1/social/agents/:agentId/telegram/connect',
  SOCIAL_CONNECT_DISCORD: '/v1/social/agents/:agentId/discord/connect',
  SOCIAL_DISCONNECT: '/v1/social/agents/:agentId/:platform/disconnect',
  SOCIAL_STATUS: '/v1/social/agents/:agentId/:platform/status',
  SOCIAL_STATS: '/v1/social/agents/:agentId/stats',
  SOCIAL_POST: '/v1/social/agents/:agentId/post',
  SOCIAL_HISTORY: '/v1/social/agents/:agentId/history',

  // WebSocket endpoints
  WS_AGENTS: '/ws/v1/agents',
  WS_TOKENS: '/ws/v1/tokens',
  WS_REVENUE: '/ws/v1/revenue',

  // Auth endpoints
  AUTH_VERIFY: '/v1/auth/verify',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];

export function buildEndpoint(
  endpoint: string,
  params: Record<string, string>,
): string {
  let result = endpoint;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(value));
  }
  return result;
}
