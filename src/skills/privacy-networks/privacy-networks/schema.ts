import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['route-traffic', 'check-status', 'new-circuit', 'get-ip', 'configure-proxy']).describe('Privacy action'),
  network: z.enum(['tor', 'i2p', 'vpn']).default('tor').describe('Privacy network'),
  targetUrl: z.string().optional().describe('URL to access through privacy network'),
  proxyPort: z.number().int().positive().default(9050).describe('SOCKS proxy port'),
  circuitLength: z.number().int().min(1).max(5).default(3).describe('Tor circuit length'),
  exitNode: z.string().optional().describe('Preferred exit node country'),
  streamIsolation: z.boolean().default(false).describe('Use separate circuit per request'),
  timeout: z.number().int().positive().default(30000).describe('Request timeout in ms'),
  vpnConfig: z.string().optional().describe('OpenVPN config file path')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  externalIp: z.string().optional(),
  country: z.string().optional(),
  circuitStatus: z.string().optional(),
  circuitId: z.string().optional(),
  latencyMs: z.number().int().optional(),
  responseBody: z.string().optional(),
  status: z.object({
    connected: z.boolean(),
    network: z.string(),
    bandwidth: z.string().optional(),
    uptime: z.string().optional()
  }).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
