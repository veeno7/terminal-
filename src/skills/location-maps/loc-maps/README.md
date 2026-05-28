# Location & Maps (`loc-maps`)

**Category:** location-maps
**Description:** Geocoding, reverse geocoding, route optimization, and geofencing

## Usage

```typescript
import { execute } from './skills/location-maps/loc-maps';

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
