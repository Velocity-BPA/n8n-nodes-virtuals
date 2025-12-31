/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Jest setup file
// Add any global test setup here

// Mock console.warn to suppress licensing notices during tests
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  // Suppress licensing notices in tests
  const message = args[0];
  if (typeof message === 'string' && message.includes('Velocity BPA Licensing Notice')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Set default timeout for all tests
jest.setTimeout(10000);

// Mock environment
process.env.NODE_ENV = 'test';
