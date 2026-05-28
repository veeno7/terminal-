# Analytics & Business Intelligence (`analytics-bi`)

**Category:** analytics-bi
**Description:** Web analytics, A/B testing, conversion funnels, and business intelligence

## Usage

```typescript
import { execute } from './skills/analytics-bi/analytics-bi';

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
- filesystem:read

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
