# 03 - Memory Architecture

CortexForge employs a multi-tiered, biologically-inspired memory system. This architecture allows the agent to maintain immediate context, recall past experiences, manage factual knowledge, and refine its skills over time.

## The Four Memory Tiers

### 1. Working Memory (Short-Term Focus)
*   **Purpose**: Stores the current context, active goals, intermediate reasoning, and immediate sensor/perception data.
*   **Storage**: In-memory (RAM) data structures (e.g., a "Cognitive Context" object). Redis can be used for persistence across quick restarts.
*   **Capacity**: Highly limited (constrained by model context window and attention).
*   **Retrieval**: Direct access via the core loop.

### 2. Episodic Memory (Experience Log)
*   **Purpose**: Records "what happened and when." A chronological log of every loop cycle, task outcome, and user interaction.
*   **Storage**: 
    *   **Relational**: SQLite/PostgreSQL for structured event logs (timestamp, task_id, status).
    *   **Vector**: Embeddings of event summaries in a vector database (e.g., ChromaDB, Qdrant) for similarity-based recall.
*   **Retrieval**: "What did I do last time I encountered this error?"
*   **Consolidation**: At the end of a goal, relevant episodes are summarized and tagged.

### 3. Semantic Memory (Knowledge Base)
*   **Purpose**: Stores structured facts, concepts, and relationships (e.g., "User prefers TypeScript over Python," "Project X depends on Library Y").
*   **Storage**: 
    *   **Knowledge Graph**: A graph-based structure (using specialized SQLite tables or a dedicated Graph DB like Memgraph).
    *   **Vector**: Concepts and fact descriptions embedded for fuzzy lookup.
*   **Retrieval**: Spreading activation or direct query (e.g., "What are the dependencies of this project?").

### 4. Procedural Memory (Skill & Strategy)
*   **Purpose**: Stores the "how-to." Not just raw code, but the *experience* of using tools—successful parameter combinations, common pitfalls, and optimized workflows.
*   **Storage**: Structured JSON/YAML files containing skill metadata, usage examples, and "learned" tips.
*   **Retrieval**: Automatically indexed when the planner considers using a specific skill.
*   **Learning**: When a task succeeds via a novel approach, that approach is "compiled" into procedural memory.

---

## Memory Processes

### Consolidation (Moving from Episodic to Semantic/Procedural)
Memory does not stay static. The agent periodically runs a **Consolidation Job**:
1.  **Summarization**: Grouping related episodes into a single "Experience Summary."
2.  **Fact Extraction**: Identifying new facts from episodes and adding them to Semantic Memory.
3.  **Optimization**: Refining Procedural Memory based on repeated successes or failures.

### Retrieval (The Context Builder)
When a new perception enters the loop, the **Memory Manager** performs a "Global Recall":
1.  **Semantic Search**: Querying the Vector DB for similar past episodes.
2.  **Fact Lookup**: Querying the Knowledge Graph for entities mentioned in the current context.
3.  **Context Assembly**: Injecting the most relevant results into the model's prompt (Working Memory).

### Forgetting & Pruning
To prevent "Context Bloat" and maintain performance:
- **Decay**: Memories have an importance score that decays over time unless reinforced.
- **Pruning**: Low-importance, old memories are moved to "Cold Storage" (compressed archives) or deleted.
- **Abstraction**: Detailed episodes are replaced by high-level summaries.
