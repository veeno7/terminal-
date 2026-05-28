# Neural Translation (`comms-translation`)

**Category:** communication
**Description:** Translate text between languages with batch processing and language detection

## Usage

```typescript
import { execute } from './skills/communication/comms-translation';

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
