# 06 - Skill System Architecture

The Skill System is the "interface" between the cognitive core and the external world. Skills are modular, standardized, and discoverable components that allow CortexForge to perform actions, manipulate data, and interact with services.

## Skill Structure

Each skill is a self-contained module residing in `src/skills/`. A standardized skill directory looks like this:

```text
src/skills/category/skill-name/
├── manifest.json       # Metadata: name, description, parameters, requirements
├── index.ts           # Execution logic (TypeScript)
├── schema.ts          # Input/Output validation schemas (Zod)
├── test/              # Unit tests for the skill
└── README.md          # Usage instructions and examples
```

### The Manifest (`manifest.json`)
Defines how the **Planner** and **Executor** interact with the skill:
- **`name`**: Unique identifier.
- **`description`**: Semantic description used by the LLM to understand when to use the skill.
- **`parameters`**: JSON Schema defining required inputs.
- **`permissions`**: Required access (e.g., "filesystem:read", "network:outbound").
- **`dependencies`**: Other skills or system binaries required.

---

## Skill Execution Flow

1.  **Selection**: The Planner identifies a skill based on the `description` in the manifest that matches the sub-goal.
2.  **Parameter Generation**: The LLM generates the arguments for the skill call based on the `parameters` schema.
3.  **Validation**: The **Executor** validates the generated arguments against the `schema.ts`.
4.  **Security Check**: The Executor verifies that the agent has the necessary `permissions`.
5.  **Execution**: The `index.ts` is executed in a controlled environment.
6.  **Observation**: The output (stdout, return value, or error) is captured and formatted as an "Observation" for the next cognition loop.

---

## Skill Categories

Skills are grouped into logical categories to simplify discovery:
- **`system`**: Filesystem ops, shell commands, process management.
- **`communication`**: Messaging (Slack, Discord), Email, notifications.
- **`research`**: Web browsing, documentation scraping, API querying.
- **`coding`**: Git, linting, testing, deployment.
- **`ai-ml`**: Data processing, local model inference, vector operations.

---

## Learning & Optimization

The Skill System is not static. It incorporates a feedback loop:
- **Success Logging**: Each time a skill is used, the result and the parameters used are logged to **Episodic Memory**.
- **Procedural Refinement**: If a skill fails due to poor parameters, the agent records the error. In future attempts, the **Procedural Memory** provides a "best practices" hint to the Planner.
- **Skill Creation**: Advanced versions of CortexForge can "author" new skills by writing code to a new skill directory and registering the manifest, allowing for autonomous capability expansion.
