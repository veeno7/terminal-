export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'send';
    const webhookUrl = process.env.SLACK_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
    if (action === 'send' && webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: params.message ?? params.text, text: params.message ?? params.text }),
      });
      return { success: res.ok, data: { sent: res.ok, status: res.status, channel: params.channel } };
    }
    return { success: true, data: { action, channel: params.channel, message: params.message, note: 'Set SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL to enable real sending.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
