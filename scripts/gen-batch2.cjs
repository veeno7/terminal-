const fs = require('fs');
const path = require('path');

const SKILLS_DIR = '/home/team/shared/cortexforge/src/skills';

const categories = {
  'document-ops': ['doc-pdf-gen', 'doc-parsing', 'doc-spreadsheet'],
  'communication': ['comms-tts', 'comms-stt', 'comms-translation', 'comms-advanced'],
  'ai-ml': ['ai-training', 'ai-embeddings', 'ai-sentiment'],
  'data-engineering': ['data-etl', 'data-webhooks', 'data-queues', 'data-advanced'],
  'analytics-bi': ['analytics-bi'],
  'biz-ops': ['biz-ops'],
  'location-maps': ['loc-maps'],
  'search-discovery': ['search-discovery'],
  'media': ['media-advanced'],
  'blockchain-web3': ['blockchain-web3'],
  'iot-hardware': ['iot-hardware'],
  'math-science': ['math-science'],
  'privacy-networks': ['privacy-networks'],
  'legal-entity-factory': ['legal-entity-factory'],
};

const defs = require('./skill-defs.json');

function genManifest(category, skill, def) {
  return JSON.stringify({
    name: skill,
    description: def.description,
    parameters: { type: 'object', properties: {}, required: [] },
    permissions: def.permissions,
    dependencies: [],
    category,
    version: '1.0.0'
  }, null, 2) + '\n';
}

function genSchema(def) {
  return 'import { z } from \'zod\';\n\nexport const InputSchema = ' + def.inputSchema + ';\n\nexport const OutputSchema = ' + def.outputSchema + ';\n\nexport type SkillInput = z.infer<typeof InputSchema>;\nexport type SkillOutput = z.infer<typeof OutputSchema>;\n';
}

function genIndex(skill) {
  return 'import { z } from \'zod\';\nimport { InputSchema, OutputSchema, type SkillInput, type SkillOutput } from \'./schema\';\n\nexport { InputSchema, OutputSchema };\nexport type { SkillInput, SkillOutput };\n\nexport type SkillResult = {\n  success: boolean;\n  data?: any;\n  error?: string;\n};\n\nasync function executeInternal(params: SkillInput): Promise<SkillOutput> {\n  const { action, ...rest } = params as any;\n  return {\n    success: true,\n    message: action + \' action executed for ' + skill + '\',\n    params: rest\n  } as any;\n}\n\nexport async function execute(params: SkillInput): Promise<SkillResult> {\n  try {\n    const validated = InputSchema.parse(params);\n    const result = await executeInternal(validated);\n    return { success: true, data: result };\n  } catch (error: any) {\n    return {\n      success: false,\n      error: error instanceof z.ZodError\n        ? \'Validation error: \' + error.errors.map(e => e.message).join(\', \')\n        : error.message || \'Unknown error occurred\'\n    };\n  }\n}\n';
}

function genTest(skill) {
  return 'import { describe, it, expect } from \'@jest/globals\';\nimport { execute, InputSchema, OutputSchema } from \'../index\';\nimport { z } from \'zod\';\n\ndescribe(\'' + skill + '\', () => {\n  it(\'should export valid schemas\', () => {\n    expect(InputSchema).toBeDefined();\n    expect(OutputSchema).toBeDefined();\n  });\n\n  it(\'should execute successfully with valid params\', async () => {\n    const result = await execute({ action: \'list\' } as any);\n    expect(result.success).toBe(true);\n    expect(result.data).toBeDefined();\n  });\n\n  it(\'should return error for invalid input\', async () => {\n    const result = await execute({} as any);\n    expect(result.success).toBe(false);\n    expect(result.error).toBeDefined();\n  });\n});\n';
}

function genReadme(displayName, skill, category, desc, perms) {
  return '# ' + displayName + ' (`' + skill + '`)\n\n' +
    '**Category:** ' + category + '\n' +
    '**Description:** ' + desc + '\n\n' +
    '## Usage\n\n```typescript\n' +
    "import { execute } from './skills/" + category + "/" + skill + "';\n\n" +
    'const result = await execute({\n  action: \'list\',\n});\n\n' +
    'if (result.success) {\n  console.log(\'Success:\', result.data);\n} else {\n  console.error(\'Error:\', result.error);\n}\n```\n\n' +
    '## Input Schema\n\nSee `schema.ts` for full Zod schema definition.\n\n' +
    '## Permissions\n\n' + perms.map(p => '- ' + p).join('\n') + '\n\n' +
    '## Notes\n\nThis is a mock implementation. Actual service integrations should be configured via environment variables.\n';
}

// Generate all files
let count = 0;
for (const [category, skills] of Object.entries(categories)) {
  for (const skill of skills) {
    const def = defs[skill];
    if (!def) {
      console.log('SKIP: ' + skill + ' - no definition');
      continue;
    }
    
    const baseDir = path.join(SKILLS_DIR, category, skill);
    fs.mkdirSync(path.join(baseDir, 'test'), { recursive: true });
    
    fs.writeFileSync(path.join(baseDir, 'manifest.json'), genManifest(category, skill, def));
    fs.writeFileSync(path.join(baseDir, 'schema.ts'), genSchema(def));
    fs.writeFileSync(path.join(baseDir, 'index.ts'), genIndex(skill));
    fs.writeFileSync(path.join(baseDir, 'test', 'index.test.ts'), genTest(skill));
    fs.writeFileSync(path.join(baseDir, 'README.md'), genReadme(def.displayName, skill, category, def.description, def.permissions));
    
    console.log('Created: ' + category + '/' + skill);
    count++;
  }
}

console.log('\nDone! Created ' + count + ' skill modules.');
