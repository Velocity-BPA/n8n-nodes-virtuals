/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ITriggerFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import WebSocket from 'ws';
import { API_ENDPOINTS } from '../constants/endpoints';

export interface WebSocketMessage {
  type: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface WebSocketConfig {
  endpoint: string;
  subscriptions: string[];
  filters?: Record<string, unknown>;
}

export type MessageHandler = (message: WebSocketMessage) => void;
export type ErrorHandler = (error: Error) => void;
export type CloseHandler = (code: number, reason: string) => void;

export class VirtualsWebSocketClient {
  private context: ITriggerFunctions;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isClosing = false;
  private messageHandler: MessageHandler | null = null;
  private errorHandler: ErrorHandler | null = null;
  private closeHandler: CloseHandler | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(context: ITriggerFunctions) {
    this.context = context;
  }

  async connect(config: WebSocketConfig): Promise<void> {
    const credentials = await this.context.getCredentials('virtualsApi');
    const baseUrl = (credentials.baseUrl as string) || API_ENDPOINTS.PRODUCTION;

    // Convert HTTP(S) to WS(S)
    const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    const fullUrl = `${wsUrl}${config.endpoint}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(fullUrl, {
        headers: {
          'X-API-Key': credentials.apiKey as string,
          'X-API-Secret': credentials.apiSecret as string,
        },
      });

      this.ws.on('open', () => {
        this.reconnectAttempts = 0;

        // Subscribe to events
        if (config.subscriptions.length > 0) {
          this.send({
            type: 'subscribe',
            channels: config.subscriptions,
            filters: config.filters,
          });
        }

        // Start ping interval to keep connection alive
        this.startPingInterval();

        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;

          if (message.type === 'pong') {
            return; // Ignore pong responses
          }

          if (this.messageHandler) {
            this.messageHandler(message);
          }
        } catch (error) {
          if (this.errorHandler) {
            this.errorHandler(new Error(`Failed to parse message: ${error}`));
          }
        }
      });

      this.ws.on('error', (error: Error) => {
        if (this.errorHandler) {
          this.errorHandler(error);
        }

        if (this.reconnectAttempts === 0) {
          reject(error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        this.stopPingInterval();

        if (this.closeHandler) {
          this.closeHandler(code, reason.toString());
        }

        if (!this.isClosing && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(config);
        }
      });
    });
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(config: WebSocketConfig): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect(config).catch((error) => {
        if (this.errorHandler) {
          this.errorHandler(error);
        }
      });
    }, delay);
  }

  send(data: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      throw new NodeOperationError(
        this.context.getNode(),
        'WebSocket is not connected',
      );
    }
  }

  subscribe(channels: string[], filters?: Record<string, unknown>): void {
    this.send({
      type: 'subscribe',
      channels,
      filters,
    });
  }

  unsubscribe(channels: string[]): void {
    this.send({
      type: 'unsubscribe',
      channels,
    });
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  onClose(handler: CloseHandler): void {
    this.closeHandler = handler;
  }

  close(): void {
    this.isClosing = true;
    this.stopPingInterval();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export function createWebSocketClient(
  context: ITriggerFunctions,
): VirtualsWebSocketClient {
  return new VirtualsWebSocketClient(context);
}
