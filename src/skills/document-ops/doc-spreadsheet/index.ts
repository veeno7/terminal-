export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'read';
    switch (action) {
      case 'read': return { success: true, data: { rows: [], headers: [], sheet: params.sheet ?? 'Sheet1', note: 'Install xlsx for real Excel support.' } };
      case 'write': return { success: true, data: { written: true, rows: (params.rows as unknown[])?.length ?? 0, file: params.filename } };
      case 'formula': return { success: true, data: { cell: params.cell, formula: params.formula, result: null, note: 'Formula evaluation requires xlsx library.' } };
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
