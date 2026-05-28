# IoT & Hardware (`iot-hardware`)

**Category:** iot-hardware
**Description:** Manage IoT devices, read sensors, send commands, and interact with hardware

## Usage

```typescript
import { execute } from './skills/iot-hardware/iot-hardware';

const result = await execute({
  action: 'list',
});

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Input Schema

See `schema.ts` for full Zod schema definition.

## Permissions

- network:outbound
- process:execute
- filesystem:read

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
