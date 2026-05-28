import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['get-balance', 'send-transaction', 'deploy-contract', 'call-contract', 'mint-nft', 'get-nft', 'create-wallet', 'get-gas-price', 'list-transactions']).describe('Blockchain action'),
  network: z.enum(['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'solana']).default('ethereum').describe('Blockchain network'),
  chainId: z.number().int().optional().describe('Chain ID'),
  walletAddress: z.string().optional().describe('Wallet address'),
  privateKey: z.string().optional().describe('Private key (optional, for signing)'),
  toAddress: z.string().optional().describe('Recipient address'),
  amount: z.string().optional().describe('Amount in ETH/token units'),
  contractAbi: z.array(z.any()).optional().describe('Contract ABI JSON'),
  contractAddress: z.string().optional().describe('Contract address'),
  contractBytecode: z.string().optional().describe('Contract bytecode for deployment'),
  functionName: z.string().optional().describe('Contract function to call'),
  functionArgs: z.array(z.any()).optional().describe('Contract function arguments'),
  nftMetadata: z.object({ name: z.string(), description: z.string(), image: z.string(), attributes: z.array(z.object({ trait_type: z.string(), value: z.any() })).optional() }).optional().describe('NFT metadata'),
  nftRecipient: z.string().optional().describe('NFT recipient address'),
  gasLimit: z.string().optional().describe('Gas limit'),
  gasPrice: z.string().optional().describe('Gas price in gwei')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  transactionHash: z.string().optional(),
  walletAddress: z.string().optional(),
  balance: z.string().optional(),
  contractAddress: z.string().optional(),
  nftId: z.string().optional(),
  nftMetadata: z.any().optional(),
  transactions: z.array(z.object({ hash: z.string(), from: z.string(), to: z.string(), value: z.string(), timestamp: z.string() })).optional(),
  gasPrice: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
