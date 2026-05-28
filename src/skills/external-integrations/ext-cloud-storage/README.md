# Cloud Storage Integration (`ext-cloud-storage`)

**Category:** external-integrations
**Description:** Upload, download, list, and manage files on Google Drive, Dropbox, and S3

## Usage

```typescript
import { execute } from './skills/external-integrations/ext-cloud-storage';

const result = await execute({
  // params here
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

- `network:outbound` - Requires network access for API calls

## Notes

This is a mock implementation. Actual API keys and service integrations should be configured via environment variables.
