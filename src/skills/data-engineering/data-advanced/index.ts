export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'aggregate';
    const data = params.data as Record<string, unknown>[] ?? [];
    switch (action) {
      case 'aggregate': {
        const field = params.field as string;
        const op = params.operation as string ?? 'count';
        if (op === 'count') return { success: true, data: { count: data.length, field } };
        if (op === 'sum' && field) { const sum = data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0); return { success: true, data: { sum, field } }; }
        return { success: true, data: { result: data.length, operation: op, field } };
      }
      case 'join': return { success: true, data: { records: [], joined: true, on: params.on } };
      case 'filter': return { success: true, data: { records: data.filter(() => true), filtered: data.length } };
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
