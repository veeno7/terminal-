# Cloud Deployment (`dev-cloud-deploy`)

**Category:** devops
**Description:** Provision and manage cloud resources on AWS, GCP, and Azure

## Usage

```typescript
import { execute } from './skills/devops/dev-cloud-deploy';

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
