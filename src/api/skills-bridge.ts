// ============================================================
// Skills Bridge — lightweight skill execution for chat
// ============================================================

import { SkillRegistry } from '../core/executor/SkillRegistry.js';
import { skillManifest } from '../skills/index.js';

let registry: SkillRegistry | null = null;

export async function getRegistry(): Promise<SkillRegistry> {
  if (!registry) {
    registry = new SkillRegistry();
    await registry.initialize();
  }
  return registry;
}

// Returns list of all skill names + descriptions for AI prompts
export function getSkillList(): string {
  return skillManifest
    .map((s) => `- ${s.name}: ${s.description}`)
    .join('\n');
}

// Execute a skill by name with params
export async function executeSkill(
  skillName: string,
  params: Record<string, unknown>
): Promise<{ success: boolean; result: string }> {
  try {
    const reg = await getRegistry();
    const skill = reg.getSkill(skillName);
    if (!skill) {
      return { success: false, result: `Skill "${skillName}" not found in registry` };
    }

    // Dynamically import and run skill
    const { pathToFileURL } = await import('url');
    const { default: path } = await import('path');
    const modulePath = path.isAbsolute(skill.path)
      ? pathToFileURL(skill.path).href
      : pathToFileURL(path.resolve(process.cwd(), skill.path)).href;

    const mod = await import(modulePath);
    if (typeof mod.execute !== 'function') {
      return { success: false, result: `Skill "${skillName}" has no execute() function yet` };
    }

    const output = await mod.execute(params);
    return {
      success: output.success ?? true,
      result: output.success
        ? JSON.stringify(output.data ?? output, null, 2)
        : output.error ?? 'Skill returned an error',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, result: `Skill execution error: ${msg}` };
  }
}

// Parse [SKILL:skill-name:{"key":"value"}] tags from AI responses
export interface SkillCall {
  skillName: string;
  params: Record<string, unknown>;
  raw: string;
}

export function parseSkillCalls(text: string): SkillCall[] {
  const regex = /\[SKILL:([a-zA-Z0-9_-]+):(\{.*?\})\]/gs;
  const calls: SkillCall[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const params = JSON.parse(match[2]) as Record<string, unknown>;
      calls.push({ skillName: match[1], params, raw: match[0] });
    } catch {
      // malformed JSON in skill call, skip
    }
  }
  return calls;
}
