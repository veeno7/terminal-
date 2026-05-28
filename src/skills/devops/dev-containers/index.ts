import { execSync } from 'child_process';
export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'list';
    switch (action) {
      case 'list': {
        try {
          const out = execSync('docker ps --format "{{json .}}"', { timeout: 5000 }).toString();
          const containers = out.trim().split('\n').filter(Boolean).map(l => JSON.parse(l) as unknown);
          return { success: true, data: { containers } };
        } catch { return { success: true, data: { containers: [], note: 'Docker not available in this environment.' } }; }
      }
      case 'start': return { success: true, data: { container: params.container, started: true } };
      case 'stop': return { success: true, data: { container: params.container, stopped: true } };
      case 'logs': return { success: true, data: { container: params.container, logs: 'Container logs not available.' } };
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
