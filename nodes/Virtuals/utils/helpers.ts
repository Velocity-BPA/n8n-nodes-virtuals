/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodePropertyOptions } from 'n8n-workflow';
import {
  SOCIAL_PLATFORMS,
  DEFAULT_PERSONALITIES,
  GAME_WORKER_TYPES,
  AGENT_STATUS,
} from '../constants/platforms';

/**
 * Validates an Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Formats a token amount with proper decimals
 */
export function formatTokenAmount(
  amount: string | number | bigint,
  decimals: number = 18,
): string {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Parses a token amount to wei
 */
export function parseTokenAmount(
  amount: string | number,
  decimals: number = 18,
): bigint {
  const [integerPart, fractionalPart = ''] = String(amount).split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integerPart + paddedFractional);
}

/**
 * Truncates an address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  // If address is shorter than the truncation would produce, return as-is
  if (address.length <= (chars + 2) * 2 + 3) {
    return address;
  }
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Gets social platform options for n8n dropdowns
 */
export function getSocialPlatformOptions(): INodePropertyOptions[] {
  return Object.values(SOCIAL_PLATFORMS).map((platform) => ({
    name: `${platform.icon} ${platform.name}`,
    value: platform.id,
  }));
}

/**
 * Gets personality options for n8n dropdowns
 */
export function getPersonalityOptions(): INodePropertyOptions[] {
  return Object.values(DEFAULT_PERSONALITIES).map((personality) => ({
    name: personality.name,
    value: personality.id,
    description: personality.description,
  }));
}

/**
 * Gets worker type options for n8n dropdowns
 */
export function getWorkerTypeOptions(): INodePropertyOptions[] {
  return Object.values(GAME_WORKER_TYPES).map((worker) => ({
    name: worker.name,
    value: worker.id,
    description: worker.description,
  }));
}

/**
 * Gets agent status options for n8n dropdowns
 */
export function getAgentStatusOptions(): INodePropertyOptions[] {
  return Object.values(AGENT_STATUS).map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: status,
  }));
}

/**
 * Calculates slippage-adjusted amount
 */
export function calculateSlippageAmount(
  amount: bigint,
  slippagePercent: number,
): bigint {
  const slippageBps = BigInt(Math.floor(slippagePercent * 100));
  return (amount * (BigInt(10000) - slippageBps)) / BigInt(10000);
}

/**
 * Formats a Unix timestamp to ISO string
 */
export function formatTimestamp(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  return new Date(ts * 1000).toISOString();
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry utility with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Sanitizes user input for safe API usage
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validates pagination parameters
 */
export function validatePagination(
  page: number,
  pageSize: number,
): { page: number; pageSize: number } {
  return {
    page: Math.max(1, Math.floor(page)),
    pageSize: Math.min(100, Math.max(1, Math.floor(pageSize))),
  };
}
