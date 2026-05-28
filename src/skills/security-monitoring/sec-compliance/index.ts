export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const check = params.check as string ?? 'headers';
    if (check === 'headers' && params.url) {
      const res = await fetch(params.url as string, { signal: AbortSignal.timeout(5000) });
      const headers = Object.fromEntries(res.headers.entries());
      const missing = ['x-frame-options','x-content-type-options','strict-transport-security','content-security-policy'].filter(h => !headers[h]);
      return { success: true, data: { url: params.url, headers, missingSecurityHeaders: missing, score: `${((4 - missing.length) / 4 * 100).toFixed(0)}%` } };
    }
    return { success: true, data: { check, target: params.target, passed: [], failed: [], score: 'N/A', note: 'Provide url and check=headers for a real scan.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
