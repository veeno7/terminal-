# Speech-to-Text (`comms-stt`)

**Category:** communication
**Description:** Transcribe speech to text with speaker identification and diarization

## Usage

```typescript
import { execute } from './skills/communication/comms-stt';

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

- filesystem:read
- network:outbound

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
