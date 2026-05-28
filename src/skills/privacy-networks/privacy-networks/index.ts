import { z } from 'zod';
import { InputSchema, type SkillInput } from './schema.js';

export type SkillResult = { success: boolean; data?: unknown; error?: string };

async function executeInternal(params: SkillInput): Promise<Record<string, unknown>> {
  const action = (params as Record<string, unknown>).action as string ?? 'status';
  switch (action) {
    case 'tor-check': {
      try {
        const res = await fetch('https://check.torproject.org/api/ip', { signal: AbortSignal.timeout(5000) });
        const json = await res.json() as { IsTor?: boolean; IP?: string };
        return { isTor: json.IsTor ?? false, ip: json.IP ?? 'unknown' };
      } catch {
        return { isTor: false, ip: 'unknown', note: 'Could not reach Tor check API.' };
      }
    }
    case 'ip-info': {
      try {
        const target = (params as Record<string, unknown>).ip as string ?? '';
        const res = await fetch(`https://ipapi.co/${target}/json/`, { signal: AbortSignal.timeout(5000) });
        const json = await res.json() as Record<string, unknown>;
        return { ip: json['ip'], country: json['country_name'], city: json['city'], org: json['org'], vpn: false };
      } catch {
        return { ip: (params as Record<string, unknown>).ip, note: 'Could not fetch IP info.' };
      }
    }
    case 'dns-lookup': {
      try {
        const host = (params as Record<string, unknown>).host as string ?? '';
        const res = await fetch(`https://dns.google/resolve?name=${host}&type=A`, { signal: AbortSignal.timeout(5000) });
        const json = await res.json() as { Answer?: Array<{ data: string }> };
        return { host, records: json.Answer?.map((a) => a.data) ?? [] };
      } catch {
        return { host: (params as Record<string, unknown>).host, records: [], note: 'DNS lookup failed.' };
      }
    }
    case 'proxy-check':
      return { action: 'proxy-check', target: (params as Record<string, unknown>).target, isProxy: false, note: 'Configure a proxy detection API for real checks.' };
    default:
      return { action, note: 'Supported actions: tor-check, ip-info, dns-lookup, proxy-check.' };
  }
}

export async function execute(params: SkillInput): Promise<SkillResult> {
  try {
    const validated = InputSchema.parse(params);
    const result = await executeInternal(validated);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError
        ? `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        : error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
