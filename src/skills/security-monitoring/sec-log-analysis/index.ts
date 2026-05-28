import fs from 'fs';
export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'analyze';
    const logPath = params.path as string;
    if (action === 'analyze' && logPath && fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      const errors = lines.filter(l => /error|exception|critical/i.test(l));
      const warnings = lines.filter(l => /warn/i.test(l));
      return { success: true, data: { totalLines: lines.length, errors: errors.length, warnings: warnings.length, recentErrors: errors.slice(-5) } };
    }
    if (action === 'analyze' && params.content) {
      const lines = (params.content as string).split('\n').filter(Boolean);
      const errors = lines.filter(l => /error|exception|critical/i.test(l));
      const warnings = lines.filter(l => /warn/i.test(l));
      return { success: true, data: { totalLines: lines.length, errors: errors.length, warnings: warnings.length, recentErrors: errors.slice(-5) } };
    }
    return { success: true, data: { action, note: 'Provide path or content parameter.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
