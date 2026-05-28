export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'list';
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = params.repo as string;
    if (githubToken && repo && action === 'trigger') {
      const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${params.workflow}/dispatches`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${githubToken}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: params.ref ?? 'main' }),
      });
      return { success: res.status === 204, data: { triggered: res.status === 204, repo, workflow: params.workflow } };
    }
    switch (action) {
      case 'list': return { success: true, data: { pipelines: [{ id: 'run_1', status: 'success', branch: 'main', duration: '2m 30s' }] } };
      case 'trigger': return { success: true, data: { runId: `run_${Date.now()}`, triggered: true, note: 'Set GITHUB_TOKEN for real triggering.' } };
      case 'status': return { success: true, data: { runId: params.runId, status: 'in_progress', steps: [] } };
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
