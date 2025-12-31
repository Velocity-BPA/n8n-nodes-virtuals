/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ethers, Contract, Wallet, Provider, JsonRpcProvider } from 'ethers';
import {
  CHAIN_CONFIG,
  CONTRACTS,
  ERC20_ABI,
  ROUTER_ABI,
  GAS_LIMITS,
} from '../constants/contracts';

export interface WalletCredentials {
  privateKey: string;
  network: 'base' | 'base-sepolia';
  rpcUrl: string;
  gasLimit: number;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: boolean;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippage: number;
  deadline?: number;
}

export class BaseChainClient {
  private context: IExecuteFunctions;
  private provider: Provider | null = null;
  private wallet: Wallet | null = null;
  private network: 'base' | 'base-sepolia' = 'base';

  constructor(context: IExecuteFunctions) {
    this.context = context;
  }

  async initialize(): Promise<void> {
    const credentials = await this.getWalletCredentials();
    this.network = credentials.network;

    const chainConfig =
      this.network === 'base' ? CHAIN_CONFIG.BASE : CHAIN_CONFIG.BASE_SEPOLIA;

    this.provider = new JsonRpcProvider(
      credentials.rpcUrl || chainConfig.rpcUrl,
    );

    if (credentials.privateKey) {
      this.wallet = new Wallet(credentials.privateKey, this.provider);
    }
  }

  private async getWalletCredentials(): Promise<WalletCredentials> {
    const credentials = await this.context.getCredentials('virtualsWallet');
    return {
      privateKey: credentials.privateKey as string,
      network: (credentials.network as 'base' | 'base-sepolia') || 'base',
      rpcUrl: credentials.rpcUrl as string,
      gasLimit: (credentials.gasLimit as number) || 0,
    };
  }

  private getContracts() {
    return this.network === 'base' ? CONTRACTS.BASE : CONTRACTS.BASE_SEPOLIA;
  }

  private ensureProvider(): Provider {
    if (!this.provider) {
      throw new NodeOperationError(
        this.context.getNode(),
        'Provider not initialized. Call initialize() first.',
      );
    }
    return this.provider;
  }

  private ensureWallet(): Wallet {
    if (!this.wallet) {
      throw new NodeOperationError(
        this.context.getNode(),
        'Wallet not initialized. Ensure private key is provided.',
      );
    }
    return this.wallet;
  }

  async getBalance(address?: string): Promise<string> {
    const provider = this.ensureProvider();
    const targetAddress = address || this.ensureWallet().address;
    const balance = await provider.getBalance(targetAddress);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(
    tokenAddress: string,
    walletAddress?: string,
  ): Promise<string> {
    const provider = this.ensureProvider();
    const address = walletAddress || this.ensureWallet().address;

    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();

    return ethers.formatUnits(balance, decimals);
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const provider = this.ensureProvider();
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
    };
  }

  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
  ): Promise<TransactionResult> {
    const wallet = this.ensureWallet();
    const contract = new Contract(tokenAddress, ERC20_ABI, wallet);

    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    const tx = await contract.approve(spenderAddress, amountWei, {
      gasLimit: GAS_LIMITS.APPROVE,
    });

    const receipt = await tx.wait();

    return this.formatReceipt(receipt);
  }

  async transferToken(
    tokenAddress: string,
    toAddress: string,
    amount: string,
  ): Promise<TransactionResult> {
    const wallet = this.ensureWallet();
    const contract = new Contract(tokenAddress, ERC20_ABI, wallet);

    const decimals = await contract.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    const tx = await contract.transfer(toAddress, amountWei, {
      gasLimit: GAS_LIMITS.TRANSFER,
    });

    const receipt = await tx.wait();

    return this.formatReceipt(receipt);
  }

  async swap(params: SwapParams): Promise<TransactionResult> {
    const wallet = this.ensureWallet();
    const contracts = this.getContracts();

    const router = new Contract(contracts.DEX_ROUTER, ROUTER_ABI, wallet);

    // Get token decimals
    const tokenInContract = new Contract(params.tokenIn, ERC20_ABI, wallet);
    const decimals = await tokenInContract.decimals();
    const amountIn = ethers.parseUnits(params.amountIn, decimals);

    // Calculate minimum output with slippage
    const path = [params.tokenIn, params.tokenOut];
    const amounts = await router.getAmountsOut(amountIn, path);
    const amountOutMin =
      (amounts[1] * BigInt(100 - params.slippage * 100)) / BigInt(100);

    // Approve router to spend tokens
    const allowance = await tokenInContract.allowance(
      wallet.address,
      contracts.DEX_ROUTER,
    );

    if (allowance < amountIn) {
      const approveTx = await tokenInContract.approve(
        contracts.DEX_ROUTER,
        amountIn,
      );
      await approveTx.wait();
    }

    // Execute swap
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 1800;

    const tx = await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      wallet.address,
      deadline,
      { gasLimit: GAS_LIMITS.SWAP },
    );

    const receipt = await tx.wait();

    return this.formatReceipt(receipt);
  }

  async getWalletAddress(): Promise<string> {
    return this.ensureWallet().address;
  }

  async getChainId(): Promise<number> {
    const provider = this.ensureProvider();
    const network = await provider.getNetwork();
    return Number(network.chainId);
  }

  private formatReceipt(receipt: ethers.TransactionReceipt): TransactionResult {
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to || '',
      value: '0',
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1,
    };
  }
}

export function createBaseClient(context: IExecuteFunctions): BaseChainClient {
  return new BaseChainClient(context);
}
