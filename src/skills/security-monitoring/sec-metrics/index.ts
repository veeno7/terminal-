import os from 'os';
export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const metric = params.metric as string ?? 'all';
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();
    const metrics = {
      cpu: { cores: cpus.length, model: cpus[0]?.model ?? 'unknown', loadAvg: os.loadavg() },
      memory: { total: totalMem, free: freeMem, used: totalMem - freeMem, usedPercent: (((totalMem - freeMem) / totalMem) * 100).toFixed(1) + '%' },
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
    };
    if (metric === 'cpu') return { success: true, data: metrics.cpu };
    if (metric === 'memory') return { success: true, data: metrics.memory };
    return { success: true, data: metrics };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
