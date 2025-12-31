/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { API_ENDPOINTS, buildEndpoint } from '../../nodes/Virtuals/constants/endpoints';
import { CHAIN_CONFIG, CONTRACTS } from '../../nodes/Virtuals/constants/contracts';
import { SOCIAL_PLATFORMS, DEFAULT_PERSONALITIES, GAME_WORKER_TYPES } from '../../nodes/Virtuals/constants/platforms';

describe('API Endpoints', () => {
  describe('buildEndpoint', () => {
    it('should build endpoints with parameters', () => {
      const result = buildEndpoint('/v1/agents/:id', { id: '123' });
      expect(result).toBe('/v1/agents/123');
    });

    it('should handle multiple parameters', () => {
      const result = buildEndpoint('/v1/agents/:agentId/goals/:goalId', { agentId: '123', goalId: '456' });
      expect(result).toBe('/v1/agents/123/goals/456');
    });

    it('should return endpoint as-is without matching parameters', () => {
      const result = buildEndpoint(API_ENDPOINTS.AGENTS, {});
      expect(result).toBe('/v1/agents');
    });
  });

  describe('Endpoint definitions', () => {
    it('should have all required agent endpoints', () => {
      expect(API_ENDPOINTS.AGENTS).toBe('/v1/agents');
      expect(API_ENDPOINTS.AGENT_BY_ID).toBe('/v1/agents/:id');
      expect(API_ENDPOINTS.AGENT_STATUS).toBe('/v1/agents/:id/status');
      expect(API_ENDPOINTS.AGENT_METRICS).toBe('/v1/agents/:id/metrics');
      expect(API_ENDPOINTS.AGENT_WALLET).toBe('/v1/agents/:id/wallet');
    });

    it('should have all required G.A.M.E. endpoints', () => {
      expect(API_ENDPOINTS.GAME_GOALS).toBe('/v1/game/agents/:agentId/goals');
      expect(API_ENDPOINTS.GAME_WORKERS).toBe('/v1/game/agents/:agentId/workers');
      expect(API_ENDPOINTS.GAME_FUNCTIONS).toBe('/v1/game/agents/:agentId/functions');
      expect(API_ENDPOINTS.GAME_EXECUTE).toBe('/v1/game/agents/:agentId/execute');
    });

    it('should have all required token endpoints', () => {
      expect(API_ENDPOINTS.TOKEN_PRICE).toBe('/v1/tokens/:address/price');
      expect(API_ENDPOINTS.TOKEN_HOLDERS).toBe('/v1/tokens/:address/holders');
    });

    it('should have all required conversation endpoints', () => {
      expect(API_ENDPOINTS.CONVERSATION_SEND).toBe('/v1/conversation/agents/:agentId/message');
      expect(API_ENDPOINTS.CONVERSATION_HISTORY).toBe('/v1/conversation/agents/:agentId/history');
    });

    it('should have all required revenue endpoints', () => {
      expect(API_ENDPOINTS.REVENUE_STATS).toBe('/v1/revenue/agents/:agentId/stats');
      expect(API_ENDPOINTS.REVENUE_CLAIM).toBe('/v1/revenue/agents/:agentId/claim');
    });

    it('should have all required social endpoints', () => {
      expect(API_ENDPOINTS.SOCIAL_CONNECT_TWITTER).toBe('/v1/social/agents/:agentId/twitter/connect');
      expect(API_ENDPOINTS.SOCIAL_POST).toBe('/v1/social/agents/:agentId/post');
    });
  });
});

describe('Chain Configuration', () => {
  describe('Base Mainnet', () => {
    it('should have correct chain ID', () => {
      expect(CHAIN_CONFIG.BASE.chainId).toBe(8453);
    });

    it('should have valid RPC URL', () => {
      expect(CHAIN_CONFIG.BASE.rpcUrl).toContain('base');
    });

    it('should have block explorer URL', () => {
      expect(CHAIN_CONFIG.BASE.blockExplorer).toBe('https://basescan.org');
    });
  });

  describe('Base Sepolia Testnet', () => {
    it('should have correct chain ID', () => {
      expect(CHAIN_CONFIG.BASE_SEPOLIA.chainId).toBe(84532);
    });

    it('should have valid RPC URL', () => {
      expect(CHAIN_CONFIG.BASE_SEPOLIA.rpcUrl).toContain('sepolia');
    });
  });
});

describe('Contract Addresses', () => {
  describe('Base Contracts', () => {
    it('should have valid VIRTUAL token address', () => {
      expect(CONTRACTS.BASE.VIRTUAL_TOKEN).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have valid agent factory address', () => {
      expect(CONTRACTS.BASE.AGENT_FACTORY).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have valid revenue share address', () => {
      expect(CONTRACTS.BASE.REVENUE_SHARE).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have valid DEX router address', () => {
      expect(CONTRACTS.BASE.DEX_ROUTER).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});

describe('Social Platforms', () => {
  it('should define Twitter platform', () => {
    expect(SOCIAL_PLATFORMS.TWITTER).toBeDefined();
    expect(SOCIAL_PLATFORMS.TWITTER.id).toBe('twitter');
    expect(SOCIAL_PLATFORMS.TWITTER.maxMessageLength).toBe(280);
  });

  it('should define Telegram platform', () => {
    expect(SOCIAL_PLATFORMS.TELEGRAM).toBeDefined();
    expect(SOCIAL_PLATFORMS.TELEGRAM.id).toBe('telegram');
    expect(SOCIAL_PLATFORMS.TELEGRAM.maxMessageLength).toBe(4096);
  });

  it('should define Discord platform', () => {
    expect(SOCIAL_PLATFORMS.DISCORD).toBeDefined();
    expect(SOCIAL_PLATFORMS.DISCORD.id).toBe('discord');
    expect(SOCIAL_PLATFORMS.DISCORD.maxMessageLength).toBe(2000);
  });
});

describe('Default Personalities', () => {
  it('should have friendly personality', () => {
    expect(DEFAULT_PERSONALITIES.FRIENDLY).toBeDefined();
    expect(DEFAULT_PERSONALITIES.FRIENDLY.id).toBe('friendly');
    expect(DEFAULT_PERSONALITIES.FRIENDLY.traits).toContain('helpful');
  });

  it('should have professional personality', () => {
    expect(DEFAULT_PERSONALITIES.PROFESSIONAL).toBeDefined();
    expect(DEFAULT_PERSONALITIES.PROFESSIONAL.id).toBe('professional');
  });

  it('should have creative personality', () => {
    expect(DEFAULT_PERSONALITIES.CREATIVE).toBeDefined();
    expect(DEFAULT_PERSONALITIES.CREATIVE.id).toBe('creative');
  });

  it('should have trader personality', () => {
    expect(DEFAULT_PERSONALITIES.TRADER).toBeDefined();
    expect(DEFAULT_PERSONALITIES.TRADER.id).toBe('trader');
  });
});

describe('G.A.M.E. Worker Types', () => {
  it('should define analyst worker type', () => {
    expect(GAME_WORKER_TYPES.ANALYST).toBeDefined();
    expect(GAME_WORKER_TYPES.ANALYST.id).toBe('analyst');
    expect(GAME_WORKER_TYPES.ANALYST.capabilities).toBeInstanceOf(Array);
  });

  it('should define trader worker type', () => {
    expect(GAME_WORKER_TYPES.TRADER).toBeDefined();
    expect(GAME_WORKER_TYPES.TRADER.id).toBe('trader');
  });

  it('should define social worker type', () => {
    expect(GAME_WORKER_TYPES.SOCIAL).toBeDefined();
    expect(GAME_WORKER_TYPES.SOCIAL.id).toBe('social');
  });

  it('should define researcher worker type', () => {
    expect(GAME_WORKER_TYPES.RESEARCHER).toBeDefined();
    expect(GAME_WORKER_TYPES.RESEARCHER.id).toBe('researcher');
  });

  it('should define executor worker type', () => {
    expect(GAME_WORKER_TYPES.EXECUTOR).toBeDefined();
    expect(GAME_WORKER_TYPES.EXECUTOR.id).toBe('executor');
  });
});
