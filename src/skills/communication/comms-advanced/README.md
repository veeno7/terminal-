# Advanced Communication (SMS, Push, Video) (`comms-advanced`)

**Category:** communication
**Description:** Send SMS, push notifications, and manage video calls via Twilio/Vonage

## Usage

```typescript
import { execute } from './skills/communication/comms-advanced';

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

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
