export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'read';
    switch (action) {
      case 'read': return { success: true, data: { deviceId: params.deviceId, sensor: params.sensor, value: null, timestamp: new Date().toISOString(), note: 'Configure MQTT_BROKER_URL for real sensor data.' } };
      case 'control': return { success: true, data: { deviceId: params.deviceId, command: params.command, sent: false, note: 'Configure MQTT_BROKER_URL to send commands.' } };
      case 'list': return { success: true, data: { devices: [], total: 0 } };
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
