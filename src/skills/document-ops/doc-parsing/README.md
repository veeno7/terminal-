# Document Parsing & OCR (`doc-parsing`)

**Category:** document-ops
**Description:** Extract text, tables, and metadata from PDF, DOCX, and images (OCR)

## Usage

```typescript
import { execute } from './skills/document-ops/doc-parsing';

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

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
