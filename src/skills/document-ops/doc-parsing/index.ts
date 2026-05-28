import fs from 'fs';
export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const filePath = params.path as string;
    if (filePath && fs.existsSync(filePath) && filePath.endsWith('.txt')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: { text: content, wordCount: content.split(/\s+/).length, type: 'txt' } };
    }
    return { success: true, data: { text: params.content ?? '', wordCount: 0, tables: [], metadata: {}, note: 'Provide a .txt path or content. Install pdf-parse for PDF support.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
