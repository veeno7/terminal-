export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const channel = params.channel as string ?? 'webhook';
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (channel === 'webhook' && webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: params.message, severity: params.severity ?? 'info', timestamp: new Date().toISOString() }),
      });
      return { success: res.ok, data: { sent: res.ok, channel, message: params.message } };
    }
    return { success: true, data: { alertId: `alert_${Date.now()}`, channel, message: params.message, severity: params.severity ?? 'info', sent: false, note: 'Set ALERT_WEBHOOK_URL to enable real alerts.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
