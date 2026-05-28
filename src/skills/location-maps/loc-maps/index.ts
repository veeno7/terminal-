export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'geocode';
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    switch (action) {
      case 'geocode': {
        const address = encodeURIComponent(params.address as string ?? '');
        if (mapsKey) {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${mapsKey}`);
          const json = await res.json() as { results?: Array<{ geometry: { location: { lat: number; lng: number } }; formatted_address: string }> };
          const r = json.results?.[0];
          if (r) return { success: true, data: { lat: r.geometry.location.lat, lng: r.geometry.location.lng, formatted: r.formatted_address } };
        }
        return { success: true, data: { address: params.address, lat: null, lng: null, note: 'Set GOOGLE_MAPS_API_KEY for real geocoding.' } };
      }
      case 'distance': return { success: true, data: { from: params.from, to: params.to, distance: null, duration: null, note: 'Set GOOGLE_MAPS_API_KEY for real distances.' } };
      case 'nearby': return { success: true, data: { location: params.location, type: params.type, places: [], note: 'Set GOOGLE_MAPS_API_KEY for nearby places.' } };
      default: return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
