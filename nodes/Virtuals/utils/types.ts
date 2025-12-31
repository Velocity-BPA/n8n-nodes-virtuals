/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  tokenAddress: string;
  creatorAddress: string;
  createdAt: string;
  updatedAt: string;
  personality: AgentPersonality;
  socialConnections: SocialConnection[];
  metrics: AgentMetrics;
}

export type AgentStatus =
  | 'inactive'
  | 'starting'
  | 'active'
  | 'paused'
  | 'stopping'
  | 'error';

export interface AgentPersonality {
  id: string;
  name: string;
  description: string;
  traits: string[];
  communicationStyle: string;
  responseLength: string;
  customPrompt?: string;
}

export interface AgentMetrics {
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  activeUsers: number;
  revenue: string;
  tokenPrice: string;
  marketCap: string;
}

export interface AgentWallet {
  address: string;
  balanceETH: string;
  balanceVIRTUAL: string;
  balanceAgentToken: string;
}

export interface CreateAgentParams {
  name: string;
  description: string;
  personality?: string;
  customPrompt?: string;
  tokenSymbol?: string;
  initialSupply?: string;
}

export interface ConfigureAgentParams {
  personality?: string;
  customPrompt?: string;
  responseLength?: 'short' | 'medium' | 'long';
  communicationStyle?: string;
  traits?: string[];
}

// G.A.M.E. types
export interface GameGoal {
  id: string;
  agentId: string;
  name: string;
  description: string;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: Record<string, unknown>;
}

export interface GameWorker {
  id: string;
  agentId: string;
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'error';
  currentTask?: string;
}

export interface GameFunction {
  id: string;
  agentId: string;
  name: string;
  description: string;
  category: string;
  parameters: FunctionParameter[];
  isEnabled: boolean;
}

export interface FunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: unknown;
}

export interface GameState {
  agentId: string;
  memory: Record<string, unknown>;
  context: Record<string, unknown>;
  lastUpdated: string;
}

export interface ExecuteTaskParams {
  workerId?: string;
  functionId?: string;
  input: Record<string, unknown>;
  priority?: number;
}

export interface ExecutionResult {
  id: string;
  agentId: string;
  workerId: string;
  functionId?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: 'success' | 'error';
  startedAt: string;
  completedAt: string;
  duration: number;
  error?: string;
}

// Token types
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  agentId?: string;
  creatorAddress?: string;
  launchTime?: string;
}

export interface TokenPrice {
  address: string;
  priceUSD: string;
  priceETH: string;
  priceVIRTUAL: string;
  change24h: number;
  change7d: number;
  lastUpdated: string;
}

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
}

export interface TokenMarketData {
  address: string;
  marketCap: string;
  volume24h: string;
  liquidity: string;
  holders: number;
}

export interface TradeParams {
  tokenAddress: string;
  action: 'buy' | 'sell';
  amount: string;
  slippage: number;
  deadline?: number;
}

export interface TradeResult {
  txHash: string;
  action: 'buy' | 'sell';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  gasUsed: string;
  status: 'success' | 'failed';
}

// Conversation types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationHistory {
  agentId: string;
  userId: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageParams {
  agentId: string;
  message: string;
  userId?: string;
  context?: Record<string, unknown>;
}

export interface MessageResponse {
  id: string;
  content: string;
  timestamp: string;
  tokensUsed: number;
  latency: number;
}

// Revenue types
export interface RevenueStats {
  agentId: string;
  totalRevenue: string;
  creatorEarnings: string;
  holderEarnings: string;
  unclaimedRevenue: string;
  revenueByType: Record<string, string>;
  lastUpdated: string;
}

export interface RevenueHistory {
  id: string;
  agentId: string;
  type: string;
  amount: string;
  timestamp: string;
  source: string;
  txHash?: string;
}

export interface ClaimResult {
  txHash: string;
  amount: string;
  recipient: string;
  timestamp: string;
  status: 'success' | 'failed';
}

// Social types
export interface SocialConnection {
  platform: string;
  connected: boolean;
  username?: string;
  connectedAt?: string;
  followers?: number;
}

export interface SocialStats {
  agentId: string;
  platforms: SocialConnection[];
  totalFollowers: number;
  totalPosts: number;
  totalEngagement: number;
  lastUpdated: string;
}

export interface SocialPost {
  id: string;
  agentId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  postedAt: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface ConnectSocialParams {
  platform: 'twitter' | 'telegram' | 'discord';
  authToken?: string;
  webhookUrl?: string;
  channelId?: string;
}

export interface PostParams {
  platform: 'twitter' | 'telegram' | 'discord';
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}

// Webhook/Trigger types
export interface WebhookEvent {
  type: string;
  event: string;
  agentId?: string;
  tokenAddress?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export type AgentEventType =
  | 'agent.created'
  | 'agent.status_changed'
  | 'agent.message_received'
  | 'agent.task_completed';

export type TokenEventType =
  | 'token.price_changed'
  | 'token.large_trade'
  | 'token.new_holder'
  | 'token.liquidity_changed';

export type RevenueEventType = 'revenue.generated' | 'revenue.claim_available';

export type AllEventTypes = AgentEventType | TokenEventType | RevenueEventType;
