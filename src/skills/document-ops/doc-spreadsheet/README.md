# Spreadsheet Operations (`doc-spreadsheet`)

**Category:** document-ops
**Description:** Read, write, and manipulate Excel and Google Sheets - CRUD on cells, rows, formulas

## Usage

```typescript
import { execute } from './skills/document-ops/doc-spreadsheet';

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
- network:outbound

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
