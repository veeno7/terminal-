#!/bin/bash
# Generate all 39 skill modules for CortexForge
set -e

SKILLS_DIR="/home/team/shared/cortexforge/src/skills"

declare -A SKILL_CATEGORIES
SKILL_CATEGORIES=(
  ["external-integrations"]="ext-email ext-calendar ext-slack-discord ext-cloud-storage ext-notion-airtable"
  ["devops"]="dev-cicd dev-containers dev-cloud-deploy dev-db-admin dev-api-gateway"
  ["security-monitoring"]="sec-vuln-scan sec-metrics sec-log-analysis sec-alerting sec-compliance"
  ["document-ops"]="doc-pdf-gen doc-parsing doc-spreadsheet"
  ["communication"]="comms-tts comms-stt comms-translation comms-advanced"
  ["ai-ml"]="ai-training ai-embeddings ai-sentiment"
  ["data-engineering"]="data-etl data-webhooks data-queues data-advanced"
  ["analytics-bi"]="analytics-bi"
  ["biz-ops"]="biz-ops"
  ["location-maps"]="loc-maps"
  ["search-discovery"]="search-discovery"
  ["media"]="media-advanced"
  ["blockchain-web3"]="blockchain-web3"
  ["iot-hardware"]="iot-hardware"
  ["math-science"]="math-science"
  ["privacy-networks"]="privacy-networks"
  ["legal-entity-factory"]="legal-entity-factory"
)

generate_manifest() {
  local CATEGORY=$1
  local SKILL=$2
  local NAME=$3
  local DESCRIPTION=$4
  local PERMISSIONS=$5

  cat > "${CATEGORY}/${SKILL}/manifest.json" << MANIFESTEOF
{
  "name": "${SKILL}",
  "description": "${DESCRIPTION}",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "permissions": [${PERMISSIONS}],
  "dependencies": [],
  "category": "${CATEGORY}",
  "version": "1.0.0"
}
MANIFESTEOF
}

generate_schema() {
  local CATEGORY=$1
  local SKILL=$2
  local INPUT_DEF=$3
  local OUTPUT_DEF=$4
  
  cat > "${CATEGORY}/${SKILL}/schema.ts" << SCHEMAEOF
import { z } from 'zod';

export const InputSchema = ${INPUT_DEF};

export const OutputSchema = ${OUTPUT_DEF};

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
SCHEMAEOF
}

generate_index() {
  local CATEGORY=$1
  local SKILL=$2
  local EXECUTION_BODY=$3
  
  cat > "${CATEGORY}/${SKILL}/index.ts" << INDEXEOF
import { z } from 'zod';
import { InputSchema, OutputSchema, type SkillInput, type SkillOutput } from './schema';

export { InputSchema, OutputSchema };
export type { SkillInput, SkillOutput };

export type SkillResult = {
  success: boolean;
  data?: any;
  error?: string;
};

${EXECUTION_BODY}

export async function execute(params: SkillInput): Promise<SkillResult> {
  try {
    const validated = InputSchema.parse(params);
    const result = await executeInternal(validated);
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof z.ZodError 
        ? \`Validation error: \${error.errors.map(e => e.message).join(', ')}\`
        : error.message || 'Unknown error occurred'
    };
  }
}
INDEXEOF
}

generate_test() {
  local CATEGORY=$1
  local SKILL=$2
  local TEST_BODY=$3
  
  mkdir -p "${CATEGORY}/${SKILL}/test"
  
  cat > "${CATEGORY}/${SKILL}/test/index.test.ts" << TESTEOF
import { describe, it, expect } from '@jest/globals';
import { execute, InputSchema, OutputSchema } from '../index';
import { z } from 'zod';

describe('${SKILL}', () => {
  it('should export valid schemas', () => {
    expect(InputSchema).toBeDefined();
    expect(OutputSchema).toBeDefined();
  });

  ${TEST_BODY}

  it('should return error for invalid input', async () => {
    const result = await execute({} as any);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
TESTEOF
}

generate_readme() {
  local CATEGORY=$1
  local SKILL=$2
  local NAME=$3
  local DESCRIPTION=$4
  
  cat > "${CATEGORY}/${SKILL}/README.md" << READMEEOF
# ${NAME} (\`${SKILL}\`)

**Category:** ${CATEGORY}  
**Description:** ${DESCRIPTION}

## Usage

\`\`\`typescript
import { execute } from './skills/${CATEGORY}/${SKILL}';

const result = await execute({
  // params here
});

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}
\`\`\`

## Input Schema

See \`schema.ts\` for full Zod schema definition.

## Permissions

- \`network:outbound\` - Requires network access for API calls

## Notes

This is a mock implementation. Actual API keys and service integrations should be configured via environment variables.
READMEEOF
}

echo "Generating all skill modules..."

for CATEGORY in "${!SKILL_CATEGORIES[@]}"; do
  echo "Creating category: ${CATEGORY}"
  mkdir -p "${SKILLS_DIR}/${CATEGORY}"
  
  for SKILL in ${SKILL_CATEGORIES[$CATEGORY]}; do
    echo "  Skill: ${SKILL}"
    mkdir -p "${SKILLS_DIR}/${CATEGORY}/${SKILL}/test"
  done
done

echo "Category directories created. Now generating individual skill files..."