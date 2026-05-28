export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'send';
    if (action === 'send' && params.url) {
      const res = await fetch(params.url as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(params.headers as Record<string, string> ?? {}) },
        body: JSON.stringify(params.payload ?? {}),
      });
      return { success: res.ok, data: { url: params.url, status: res.status, sent: res.ok } };
    }
    return { success: true, data: { action, note: 'Provide url and payload to send a webhook.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
