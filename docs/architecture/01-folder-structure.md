# 01 - Folder & Project Structure

The CortexForge project follows a highly modular, service-oriented architecture designed for scalability, maintainability, and clear separation of concerns.

## Directory Structure

```text
/home/team/shared/cortexforge/
├── src/
│   ├── core/                   # The "Brain" - Cognitive Subsystems
│   │   ├── loop/               # Cognition Loop (Perception, Reasoning, Reflection)
│   │   ├── memory/             # Multi-tier Memory Systems
│   │   │   ├── working.ts      # Short-term context and active state
│   │   │   ├── episodic.ts     # Time-indexed experience storage
│   │   │   ├── semantic.ts     # Fact and knowledge graph
│   │   │   └── procedural.ts   # Skill execution logic and experience
│   │   ├── planner/            # Goal decomposition and task orchestration
│   │   ├── state/              # Internal State Manager (Identity, Goals, Emotions)
│   │   └── executor/           # Skill integration and execution environment
│   ├── skills/                 # Skill Modules (40+ Categories)
│   │   ├── external-integrations/ # Slack, GitHub, Jira, AWS, GCP
│   │   ├── devops/             # Docker, K8s, CI/CD, Terraform
│   │   ├── security/           # Pentesting, Scanning, Privacy Networks
│   │   ├── document-ops/       # PDF, Office, LaTeX, OCR
│   │   ├── communication/      # TTS, STT, Translation, Email
│   │   ├── ai-ml/              # Model Fine-tuning, RAG, Data Science
│   │   ├── data-engineering/   # ETL, SQL/NoSQL, Spark
│   │   ├── blockchain-web3/    # Smart Contracts, Wallets, DeFi
│   │   ├── iot/                # MQTT, Sensor Integration
│   │   ├── media/              # Image/Video Generation, Editing
│   │   ├── legal-factory/      # Entity Formation, Contracts, Compliance
│   │   └── research/           # Web Search, Arxiv, Academic Scraping
│   ├── api/                    # Backend API for Web Interface
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── web/                    # Web Interface (Frontend)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── store/
│   │   └── index.html
│   ├── shared/                 # Shared Types, Constants, and Utilities
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants.ts
│   └── index.ts                # Main Entry Point
├── data/                       # Persistent Data Storage
│   ├── db/                     # SQLite / PostgreSQL data files
│   ├── vector/                 # Vector Database (Chroma/Pinecone) storage
│   └── logs/                   # System and Cognition logs
├── config/                     # Configuration and Environment
│   ├── default.yaml
│   └── profiles/               # Specialized agent profiles
├── docs/                       # Project Documentation
│   ├── architecture/           # Design specifications
│   ├── api/                    # API docs
│   └── skills/                 # Skill-specific documentation
├── tests/                      # Unit, Integration, and E2E Tests
│   ├── unit/
│   ├── integration/
│   └── cognitive/              # Tests for reasoning and memory
├── scripts/                    # Deployment, Setup, and Maintenance scripts
├── package.json
├── tsconfig.json
└── README.md
```

## Key Rationale

1.  **Core Isolation**: The cognitive logic (the "Brain") is isolated from the skills (the "Hands") and the UI (the "Face"). This allows for swapping reasoning models or UI frameworks without affecting core logic.
2.  **Modular Skills**: Skills are designed as plug-and-play modules. Each skill folder contains its own logic, types, and optionally its own tests.
3.  **Unified Shared Layer**: Types and utilities used by both the core and the API are centralized in `src/shared` to ensure type safety across the entire stack.
4.  **Data Persistence**: A dedicated `data/` directory ensures that SQLite files and vector stores are easily backup-able and separated from code.
5.  **Cognitive Testing**: A unique `tests/cognitive/` directory is established to test the agent's ability to reason, remember, and reflect, moving beyond traditional software testing.
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
