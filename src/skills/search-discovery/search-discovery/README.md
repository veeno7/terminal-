# Search & Discovery (`search-discovery`)

**Category:** search-discovery
**Description:** Full-text and semantic search with Elasticsearch, vector search, and web scraping

## Usage

```typescript
import { execute } from './skills/search-discovery/search-discovery';

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
- filesystem:write

## Notes

This is a mock implementation. Actual service integrations should be configured via environment variables.
