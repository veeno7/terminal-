import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['list-devices', 'read-sensor', 'send-command', 'configure-device', 'get-telemetry', 'register-device', 'firmware-update']).describe('IoT action'),
  protocol: z.enum(['mqtt', 'http', 'coap', 'zigbee', 'ble', 'modbus']).default('mqtt').describe('Communication protocol'),
  deviceId: z.string().optional().describe('Device identifier'),
  deviceType: z.string().optional().describe('Device type (sensor, actuator, gateway)'),
  sensorType: z.enum(['temperature', 'humidity', 'pressure', 'motion', 'light', 'gps', 'accelerometer']).optional().describe('Sensor type'),
  command: z.string().optional().describe('Command to send to device'),
  commandParams: z.record(z.any()).optional().describe('Command parameters'),
  mqttTopic: z.string().optional().describe('MQTT topic'),
  mqttMessage: z.string().optional().describe('MQTT message payload'),
  telemetryRange: z.object({ start: z.string().datetime().optional(), end: z.string().datetime().optional() }).optional().describe('Telemetry time range'),
  firmwareUrl: z.string().url().optional().describe('Firmware update URL'),
  config: z.record(z.any()).optional().describe('Device configuration')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  devices: z.array(z.object({
    id: z.string(), name: z.string(), type: z.string(), status: z.enum(['online', 'offline', 'error']),
    lastSeen: z.string(), battery: z.number().optional()
  })).optional(),
  sensorReading: z.object({
    type: z.string(), value: z.number(), unit: z.string(), timestamp: z.string()
  }).optional(),
  telemetry: z.array(z.object({ timestamp: z.string(), metrics: z.record(z.number()) })).optional(),
  commandResponse: z.any().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
