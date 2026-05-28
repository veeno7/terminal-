# 05 - Internal State Manager

The Internal State Manager (ISM) is the repository for the agent's "sense of self." It maintains the persistent identity, preferences, and operational status of CortexForge across sessions.

## Core Components of State

### 1. Identity & Persona
- **Base Directive**: The core purpose of the agent (e.g., "An autonomous software engineer and researcher").
- **Tone & Style**: Parameters governing communication (e.g., "Professional, concise, uses technical terminology").
- **Constraints**: Hard rules the agent must never break (e.g., "Never delete files outside of the project directory").

### 2. Motivational State (The "Drives")
Unlike static systems, CortexForge uses dynamic motivational weights:
- **Curiosity**: High weight triggers more "Exploration" tasks and deep-dives.
- **Urgency**: High weight prioritizes speed and direct paths over perfection.
- **Focus**: Controls the "depth" of the task tree before checking for new inputs.

### 3. Vitals & Resource Awareness
The agent monitors its own operational constraints:
- **Token Budget**: Tracking daily LLM usage to prevent cost overruns.
- **API Health**: Status of connected integrations (Slack, GitHub, etc.).
- **Compute Load**: Awareness of the host system's performance.

### 4. Capabilities & Skill Map
- **Registered Skills**: A live inventory of what the agent *can* do.
- **Skill Proficiency**: Metadata reflecting how often a skill has been used successfully.
- **Tool Access**: Current credentials and permissions.

### 5. Preferences & User Model
- **Explicit Preferences**: Settings defined by the user (e.g., "Use React with Tailwind").
- **Learned Preferences**: Insights extracted from **Episodic Memory** (e.g., "The user usually asks for more tests after a PR").

---

## State Persistence & Synchronisation

### Persistence Layer
- The ISM backs up to a structured JSON store or SQLite database (`data/state.db`).
- Every change to a vital or preference is written immediately to ensure data integrity during a crash.

### State Introspection API
The ISM provides a read-only (and partially write-able) API for the Web UI:
- **Self-Dashboard**: Displays current goals, vitals, and "mood."
- **Configuration**: Allows the user to manually tune persona and constraints.
- **Log Stream**: A "stream of consciousness" showing internal state changes.

## Identity Consolidation
Periodically, the agent reflects on its own performance (via the **Reflection** stage of the loop).
- It compares its actions against its **Base Directive**.
- It identifies areas where its **Capabilities** are lacking and may suggest "learning" a new skill (e.g., asking the user to install a new integration).
