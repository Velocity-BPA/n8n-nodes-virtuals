/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  isValidAddress,
  isValidTxHash,
  formatTokenAmount,
  parseTokenAmount,
  truncateAddress,
  calculateSlippageAmount,
  formatTimestamp,
  sanitizeInput,
  validatePagination,
  retry,
  sleep,
} from '../../nodes/Virtuals/utils/helpers';

describe('Helper Functions', () => {
  describe('isValidAddress', () => {
    it('should return true for valid Ethereum addresses', () => {
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidAddress('0xABCDEF1234567890123456789012345678901234')).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('1234567890123456789012345678901234567890')).toBe(false);
      expect(isValidAddress('0xGHIJKL1234567890123456789012345678901234')).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should return true for valid transaction hashes', () => {
      const validHash = '0x' + 'a'.repeat(64);
      expect(isValidTxHash(validHash)).toBe(true);
    });

    it('should return false for invalid transaction hashes', () => {
      expect(isValidTxHash('')).toBe(false);
      expect(isValidTxHash('0x123')).toBe(false);
      expect(isValidTxHash('a'.repeat(64))).toBe(false);
    });
  });

  describe('formatTokenAmount', () => {
    it('should format token amounts with correct decimals', () => {
      expect(formatTokenAmount('1000000000000000000', 18)).toBe('1');
      expect(formatTokenAmount('1500000000000000000', 18)).toBe('1.5');
      expect(formatTokenAmount('1000000', 6)).toBe('1');
    });

    it('should handle zero', () => {
      expect(formatTokenAmount('0', 18)).toBe('0');
    });
  });

  describe('parseTokenAmount', () => {
    it('should parse token amounts to raw units (bigint)', () => {
      expect(parseTokenAmount('1', 18)).toBe(BigInt('1000000000000000000'));
      expect(parseTokenAmount('1.5', 18)).toBe(BigInt('1500000000000000000'));
      expect(parseTokenAmount('1', 6)).toBe(BigInt('1000000'));
    });

    it('should handle zero', () => {
      expect(parseTokenAmount('0', 18)).toBe(BigInt('0'));
    });
  });

  describe('truncateAddress', () => {
    it('should truncate addresses correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(truncateAddress(address)).toBe('0x1234...7890');
      expect(truncateAddress(address, 6)).toBe('0x123456...567890');
    });

    it('should handle short addresses', () => {
      expect(truncateAddress('0x12')).toBe('0x12');
      expect(truncateAddress('0x1234567890')).toBe('0x1234567890');
    });

    it('should handle empty strings', () => {
      expect(truncateAddress('')).toBe('');
    });
  });

  describe('calculateSlippageAmount', () => {
    it('should calculate slippage amounts correctly', () => {
      // 10000 with 1% slippage = 9900 minimum
      expect(calculateSlippageAmount(BigInt(10000), 1)).toBe(BigInt(9900));
      // 10000 with 0.5% slippage = 9950 minimum
      expect(calculateSlippageAmount(BigInt(10000), 0.5)).toBe(BigInt(9950));
    });
  });

  describe('formatTimestamp', () => {
    it('should format unix timestamps to ISO strings', () => {
      const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC (unix seconds)
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toContain('2024');
    });

    it('should handle string timestamps', () => {
      const timestamp = '1704067200';
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toContain('2024');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should remove potentially dangerous characters', () => {
      expect(sanitizeInput('hello<script>')).toBe('helloscript');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('validatePagination', () => {
    it('should return valid pagination for positive numbers', () => {
      expect(validatePagination(1, 10)).toEqual({ page: 1, pageSize: 10 });
    });

    it('should enforce minimum values', () => {
      expect(validatePagination(0, 0)).toEqual({ page: 1, pageSize: 1 });
      expect(validatePagination(-1, -5)).toEqual({ page: 1, pageSize: 1 });
    });

    it('should enforce maximum page size', () => {
      expect(validatePagination(1, 1000)).toEqual({ page: 1, pageSize: 100 });
    });
  });

  describe('sleep', () => {
    it('should wait for the specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('retry', () => {
    it('should succeed on first try', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retry(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const result = await retry(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));
      await expect(retry(fn, 3, 10)).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
