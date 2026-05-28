import { z } from 'zod';
import { InputSchema, type SkillInput } from './schema.js';

export type SkillResult = { success: boolean; data?: unknown; error?: string };

async function executeInternal(params: SkillInput): Promise<Record<string, unknown>> {
  const action = (params as Record<string, unknown>).action as string ?? 'search';
  const query = (params as Record<string, unknown>).query as string ?? '';
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  const serpapiKey = process.env.SERPAPI_KEY;

  if (action === 'search') {
    if (braveKey) {
      try {
        const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
          headers: { 'Accept': 'application/json', 'X-Subscription-Token': braveKey },
          signal: AbortSignal.timeout(8000),
        });
        const json = await res.json() as { web?: { results?: Array<{ title: string; url: string; description: string }> } };
        const results = json.web?.results?.map((r) => ({ title: r.title, url: r.url, snippet: r.description })) ?? [];
        return { query, results, source: 'brave', total: results.length };
      } catch { /* fall through */ }
    }
    if (serpapiKey) {
      try {
        const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpapiKey}&num=5`, { signal: AbortSignal.timeout(8000) });
        const json = await res.json() as { organic_results?: Array<{ title: string; link: string; snippet: string }> };
        const results = json.organic_results?.map((r) => ({ title: r.title, url: r.link, snippet: r.snippet })) ?? [];
        return { query, results, source: 'serpapi', total: results.length };
      } catch { /* fall through */ }
    }
    return { query, results: [], source: 'none', note: 'Set BRAVE_SEARCH_API_KEY or SERPAPI_KEY for real web search.' };
  }

  if (action === 'news') {
    return { query, articles: [], note: 'Set BRAVE_SEARCH_API_KEY for real news search.' };
  }

  if (action === 'image-search') {
    return { query, images: [], note: 'Set BRAVE_SEARCH_API_KEY for real image search.' };
  }

  return { action, note: 'Supported actions: search, news, image-search.' };
}

export async function execute(params: SkillInput): Promise<SkillResult> {
  try {
    const validated = InputSchema.parse(params);
    const result = await executeInternal(validated);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError
        ? `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
        : error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
