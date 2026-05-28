# API Gateway Management (`dev-api-gateway`)

**Category:** devops
**Description:** Create, manage, and deploy API routes with rate limiting and auth

## Usage

```typescript
import { execute } from './skills/devops/dev-api-gateway';

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
