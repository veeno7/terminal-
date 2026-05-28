# 07 - Stack Recommendation

For CortexForge to be robust, performant, and deployable on services like Render, a unified and efficient technology stack is required.

## Core Language: TypeScript (Node.js)

While the team uses various languages, the **Core Brain** and **Orchestrator** should be written in **TypeScript**.

### Rationale:
- **Type Safety**: Essential for managing the complex state and data structures of a cognitive architecture.
- **Asynchronous First**: Node.js's event loop is ideal for managing multiple concurrent skill executions and long-running cognition cycles.
- **Unified Ecosystem**: Can run both the Backend API and the Core Logic in the same process, simplifying deployment.
- **LLM Tooling**: The most robust libraries for LLM orchestration (e.g., LangChain, Vercel AI SDK) have first-class TypeScript support.

---

## Infrastructure & Middleware

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Main Database** | **SQLite (via Turso)** | Lightweight, serverless, and supports syncing—perfect for agent persistence and state. |
| **Vector Database** | **ChromaDB / Qdrant** | Necessary for Semantic and Episodic memory lookup. Can be run as a sidecar or managed service. |
| **Caching** | **Redis** | Used for Working Memory and session persistence. |
| **Message Broker** | **BullMQ** | For managing the Task Orchestration queue and background skill execution. |

---

## The Frontend (Web UI)

- **Framework**: **React** (with Vite).
- **Styling**: **Tailwind CSS**.
- **State Management**: **Zustand** (lightweight and efficient).
- **Visualization**: **React Flow** (for visualizing the Task Dependency Graph / DAG).

---

## Skill Execution Environment

While the core is TypeScript, skills may require different environments.
- **Standard Skills**: Executed as child processes or via dynamic imports within the Node.js runtime.
- **ML/Python Skills**: Invoked via a bridge (e.g., `python-shell` or a dedicated FastAPI microservice) to leverage the Python ecosystem for data science and specialized ML tasks.

---

## Deployment Strategy (Render)

Render is the target for deployment. The architecture supports this through:
1.  **Monorepo Structure**: Core, API, and Web can live in one repo but deploy as separate services or a unified "Web Service."
2.  **Stateless Core / Persistent DB**: By using Turso and a managed Vector DB, the application remains lightweight on the compute side.
3.  **Background Workers**: Utilizing Render's "Background Worker" service type for the persistent Cognition Loop, while the "Web Service" handles the UI and API.

## Summary Recommendation
**"The Render-Native Autonomous Stack"**
- **Backend**: Node.js / Express / TypeScript
- **Cognition Engine**: Custom Loop + OpenAI SDK (Reasoning) + Groq SDK (Speed)
- **Primary Database**: PostgreSQL (with **pgvector**) - Native to Render, perfect for all memory tiers.
- **Cache/Working Memory**: Redis (Render-native managed service).
- **Task Queue**: BullMQ (running on Redis).
- **Frontend**: React + Vite + Tailwind + React Flow.
- **Deployment**: Render Monorepo (Web Service for API/UI + Background Worker for Cognition Loop).
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
