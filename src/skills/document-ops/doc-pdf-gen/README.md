# PDF Generation & Management (`doc-pdf-gen`)

**Category:** document-ops
**Description:** Generate, merge, split, sign, and convert PDF documents

## Usage

```typescript
import { execute } from './skills/document-ops/doc-pdf-gen';

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
- filesystem:write

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
