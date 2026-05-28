import { describe, it, expect } from '@jest/globals';
import { execute, InputSchema, OutputSchema } from '../index';
import { z } from 'zod';

describe('sec-alerting', () => {
  it('should export valid schemas', () => {
    expect(InputSchema).toBeDefined();
    expect(OutputSchema).toBeDefined();
  });

  it('should execute successfully with valid params', async () => {
    const result = await execute({ 
      action: 'send-alert'
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return error for invalid input', async () => {
    const result = await execute({} as any);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
