/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_ENDPOINTS, buildEndpoint } from '../constants/endpoints';

export interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class VirtualsApiClient {
  private client: AxiosInstance;
  private context: IExecuteFunctions | ILoadOptionsFunctions;

  constructor(
    context: IExecuteFunctions | ILoadOptionsFunctions,
    options: ApiClientOptions = {},
  ) {
    this.context = context;
    this.client = axios.create({
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          const errorData = error.response.data;
          throw new NodeApiError(this.context.getNode(), {
            message: errorData?.message || 'API request failed',
            description: `Error code: ${errorData?.code || error.response.status}`,
            httpCode: String(error.response.status),
          });
        } else if (error.request) {
          throw new NodeOperationError(
            this.context.getNode(),
            'No response received from Virtuals API',
          );
        } else {
          throw new NodeOperationError(
            this.context.getNode(),
            `Request setup error: ${error.message}`,
          );
        }
      },
    );
  }

  async getCredentials(): Promise<{
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
    environment: string;
  }> {
    const credentials = await this.context.getCredentials('virtualsApi');
    return {
      apiKey: credentials.apiKey as string,
      apiSecret: credentials.apiSecret as string,
      baseUrl: credentials.baseUrl as string || API_ENDPOINTS.PRODUCTION,
      environment: credentials.environment as string || 'production',
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { apiKey, apiSecret } = await this.getCredentials();
    return {
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret,
    };
  }

  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const credentials = await this.getCredentials();
    const authHeaders = await this.getAuthHeaders();

    const response = await this.client.request<ApiResponse<T>>({
      ...config,
      baseURL: credentials.baseUrl,
      headers: {
        ...config.headers,
        ...authHeaders,
      },
    });

    return response.data;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url: endpoint,
      params,
    });
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url: endpoint,
      data,
    });
  }

  async put<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url: endpoint,
      data,
    });
  }

  async delete<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url: endpoint,
      data,
    });
  }

  // Helper to build endpoints with parameters
  buildUrl(endpoint: string, params: Record<string, string>): string {
    return buildEndpoint(endpoint, params);
  }
}

export function createApiClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  options?: ApiClientOptions,
): VirtualsApiClient {
  return new VirtualsApiClient(context, options);
}
