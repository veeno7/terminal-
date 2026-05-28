# Business Operations (`biz-ops`)

**Category:** biz-ops
**Description:** CRM, e-commerce, payments, and accounting operations

## Usage

```typescript
import { execute } from './skills/biz-ops/biz-ops';

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
