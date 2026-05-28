# Text-to-Speech (`comms-tts`)

**Category:** communication
**Description:** Convert text to speech with voice cloning, accent conversion, and SSML support

## Usage

```typescript
import { execute } from './skills/communication/comms-tts';

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
- filesystem:write

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
