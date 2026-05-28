import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['geocode', 'reverse-geocode', 'search-places', 'optimize-route', 'distance-matrix', 'geofence-check']).describe('Maps action'),
  address: z.string().optional().describe('Address to geocode'),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional().describe('Coordinates for reverse geocode'),
  query: z.string().optional().describe('Place search query'),
  origins: z.array(z.object({ lat: z.number(), lng: z.number() })).optional().describe('Route origins'),
  destinations: z.array(z.object({ lat: z.number(), lng: z.number() })).optional().describe('Route destinations'),
  waypoints: z.array(z.object({ lat: z.number(), lng: z.number() })).optional().describe('Route waypoints'),
  mode: z.enum(['driving', 'walking', 'bicycling', 'transit']).default('driving').describe('Travel mode'),
  geofence: z.object({ center: z.object({ lat: z.number(), lng: z.number() }), radius: z.number().positive() }).optional().describe('Geofence definition'),
  point: z.object({ lat: z.number(), lng: z.number() }).optional().describe('Point to check against geofence')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  results: z.array(z.object({
    formattedAddress: z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
    placeId: z.string().optional()
  })).optional(),
  routes: z.array(z.object({
    distance: z.string(),
    duration: z.string(),
    polyline: z.string().optional()
  })).optional(),
  matrix: z.array(z.array(z.object({ distance: z.string(), duration: z.string() }))).optional(),
  insideGeofence: z.boolean().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
