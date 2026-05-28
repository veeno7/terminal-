import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['stream-process', 'graph-query', 'vector-search', 'vector-upsert', 'create-stream', 'create-index']).describe('Advanced data action'),
  processor: z.enum(['kafka', 'flink', 'spark', 'neo4j', 'chroma', 'pinecone']).describe('Data processor'),
  topic: z.string().optional().describe('Stream topic'),
  query: z.string().optional().describe('Cypher/SQL query for graph DB'),
  vectors: z.array(z.object({ id: z.string(), values: z.array(z.number()), metadata: z.record(z.any()).optional() })).optional().describe('Vectors to upsert'),
  namespace: z.string().default('default').describe('Vector store namespace'),
  topK: z.number().int().positive().default(10).describe('Top K results'),
  filter: z.record(z.any()).optional().describe('Filter for vector search'),
  streamHandler: z.string().optional().describe('Stream processing function code')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  results: z.array(z.any()).optional(),
  streamId: z.string().optional(),
  vectorCount: z.number().int().optional(),
  executionTime: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
