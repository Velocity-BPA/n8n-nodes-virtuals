/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class VirtualsWallet implements ICredentialType {
  name = 'virtualsWallet';
  displayName = 'Virtuals Wallet';
  documentationUrl = 'https://docs.virtuals.io/wallet';

  properties: INodeProperties[] = [
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your wallet private key for signing transactions (never share this)',
    },
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Base Mainnet',
          value: 'base',
        },
        {
          name: 'Base Sepolia (Testnet)',
          value: 'base-sepolia',
        },
      ],
      default: 'base',
      description: 'The blockchain network to use',
    },
    {
      displayName: 'RPC URL',
      name: 'rpcUrl',
      type: 'string',
      default: 'https://mainnet.base.org',
      description: 'The RPC endpoint URL for the Base network',
    },
    {
      displayName: 'Gas Limit Override',
      name: 'gasLimit',
      type: 'number',
      default: 0,
      description: 'Optional gas limit override (0 = automatic)',
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.rpcUrl}}',
      url: '/',
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };
}
