export type SkillResult = { success: boolean; data?: unknown; error?: string };

const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  length: { m: 1, km: 1000, mi: 1609.34, ft: 0.3048, cm: 0.01, inch: 0.0254 },
  weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 },
  temp: {},
};

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'calculate';
    switch (action) {
      case 'calculate': {
        const expr = params.expression as string ?? '';
        try {
          // Safe eval for math expressions
          const result = Function(`"use strict"; return (${expr.replace(/[^0-9+\-*/().%\s]/g, '')})`)() as number;
          return { success: true, data: { expression: expr, result, type: typeof result } };
        } catch { return { success: false, error: 'Invalid math expression.' }; }
      }
      case 'convert': {
        const { value, from, to, category } = params as { value: number; from: string; to: string; category: string };
        if (category === 'temp') {
          let celsius = from === 'F' ? (value - 32) * 5/9 : from === 'K' ? value - 273.15 : value;
          const result = to === 'F' ? celsius * 9/5 + 32 : to === 'K' ? celsius + 273.15 : celsius;
          return { success: true, data: { value, from, to, result: Number(result.toFixed(4)) } };
        }
        const table = UNIT_CONVERSIONS[category];
        if (table && table[from] && table[to]) {
          const result = (value * table[from]) / table[to];
          return { success: true, data: { value, from, to, result: Number(result.toFixed(6)) } };
        }
        return { success: false, error: `Unknown conversion: ${from} → ${to} in ${category}` };
      }
      case 'stats': {
        const nums = params.numbers as number[] ?? [];
        if (!nums.length) return { success: false, error: 'No numbers provided.' };
        const sorted = [...nums].sort((a, b) => a - b);
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = sorted.length % 2 === 0 ? (sorted[sorted.length/2-1] + sorted[sorted.length/2]) / 2 : sorted[Math.floor(sorted.length/2)];
        const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
        return { success: true, data: { count: nums.length, mean: Number(mean.toFixed(4)), median, min: sorted[0], max: sorted[sorted.length-1], stddev: Number(Math.sqrt(variance).toFixed(4)) } };
      }
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
