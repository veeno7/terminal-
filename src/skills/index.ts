import { Skill } from '../shared/types/index.js';

export const skillManifest: any[] = [
  {
    "name": "ext-email",
    "description": "Send and receive emails via SMTP/Gmail API with attachments and threading",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "external-integrations",
    "version": "1.0.0",
    "importPath": "./external-integrations/ext-email/index.js"
  },
  {
    "name": "ext-calendar",
    "description": "Create, read, update, and delete calendar events via Google Calendar/Outlook APIs",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "external-integrations",
    "version": "1.0.0",
    "importPath": "./external-integrations/ext-calendar/index.js"
  },
  {
    "name": "ext-slack-discord",
    "description": "Send messages, read channels, and manage webhooks for Slack and Discord",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "external-integrations",
    "version": "1.0.0",
    "importPath": "./external-integrations/ext-slack-discord/index.js"
  },
  {
    "name": "ext-cloud-storage",
    "description": "Upload, download, list, and manage files on Google Drive, Dropbox, and S3",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "external-integrations",
    "version": "1.0.0",
    "importPath": "./external-integrations/ext-cloud-storage/index.js"
  },
  {
    "name": "ext-notion-airtable",
    "description": "Query and manipulate databases in Notion and Airtable - CRUD on records",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "external-integrations",
    "version": "1.0.0",
    "importPath": "./external-integrations/ext-notion-airtable/index.js"
  },
  {
    "name": "dev-cicd",
    "description": "Create, trigger, and monitor CI/CD pipelines for GitHub Actions and GitLab CI",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "process:execute"
    ],
    "dependencies": [],
    "category": "devops",
    "version": "1.0.0",
    "importPath": "./devops/dev-cicd/index.js"
  },
  {
    "name": "dev-containers",
    "description": "Manage Docker containers, images, compose stacks, and Kubernetes resources",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "process:execute",
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "devops",
    "version": "1.0.0",
    "importPath": "./devops/dev-containers/index.js"
  },
  {
    "name": "dev-cloud-deploy",
    "description": "Provision and manage cloud resources on AWS, GCP, and Azure",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "process:execute"
    ],
    "dependencies": [],
    "category": "devops",
    "version": "1.0.0",
    "importPath": "./devops/dev-cloud-deploy/index.js"
  },
  {
    "name": "dev-db-admin",
    "description": "Execute SQL queries, run migrations, manage backups, and administer databases",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "devops",
    "version": "1.0.0",
    "importPath": "./devops/dev-db-admin/index.js"
  },
  {
    "name": "dev-api-gateway",
    "description": "Create, manage, and deploy API routes with rate limiting and auth",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "devops",
    "version": "1.0.0",
    "importPath": "./devops/dev-api-gateway/index.js"
  },
  {
    "name": "sec-vuln-scan",
    "description": "Scan dependencies, check SSL/TLS, and detect known vulnerabilities",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read"
    ],
    "dependencies": [],
    "category": "security-monitoring",
    "version": "1.0.0",
    "importPath": "./security-monitoring/sec-vuln-scan/index.js"
  },
  {
    "name": "sec-metrics",
    "description": "Monitor CPU, memory, disk, network, and process metrics for system health",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "process:execute",
      "filesystem:read"
    ],
    "dependencies": [],
    "category": "security-monitoring",
    "version": "1.0.0",
    "importPath": "./security-monitoring/sec-metrics/index.js"
  },
  {
    "name": "sec-log-analysis",
    "description": "Parse logs, detect anomalies, and generate security insights from log data",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:read"
    ],
    "dependencies": [],
    "category": "security-monitoring",
    "version": "1.0.0",
    "importPath": "./security-monitoring/sec-log-analysis/index.js"
  },
  {
    "name": "sec-alerting",
    "description": "Send alerts via PagerDuty, webhooks, email, and SMS with escalation policies",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "security-monitoring",
    "version": "1.0.0",
    "importPath": "./security-monitoring/sec-alerting/index.js"
  },
  {
    "name": "sec-compliance",
    "description": "Run compliance checks, penetration tests, and gather threat intelligence",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "process:execute"
    ],
    "dependencies": [],
    "category": "security-monitoring",
    "version": "1.0.0",
    "importPath": "./security-monitoring/sec-compliance/index.js"
  },
  {
    "name": "doc-pdf-gen",
    "description": "Generate, merge, split, sign, and convert PDF documents",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "document-ops",
    "version": "1.0.0",
    "importPath": "./document-ops/doc-pdf-gen/index.js"
  },
  {
    "name": "doc-parsing",
    "description": "Extract text, tables, and metadata from PDF, DOCX, and images (OCR)",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:read"
    ],
    "dependencies": [],
    "category": "document-ops",
    "version": "1.0.0",
    "importPath": "./document-ops/doc-parsing/index.js"
  },
  {
    "name": "doc-spreadsheet",
    "description": "Read, write, and manipulate Excel and Google Sheets - CRUD on cells, rows, formulas",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:read",
      "filesystem:write",
      "network:outbound"
    ],
    "dependencies": [],
    "category": "document-ops",
    "version": "1.0.0",
    "importPath": "./document-ops/doc-spreadsheet/index.js"
  },
  {
    "name": "comms-tts",
    "description": "Convert text to speech with voice cloning, accent conversion, and SSML support",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "communication",
    "version": "1.0.0",
    "importPath": "./communication/comms-tts/index.js"
  },
  {
    "name": "comms-stt",
    "description": "Transcribe speech to text with speaker identification and diarization",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:read",
      "network:outbound"
    ],
    "dependencies": [],
    "category": "communication",
    "version": "1.0.0",
    "importPath": "./communication/comms-stt/index.js"
  },
  {
    "name": "comms-translation",
    "description": "Translate text between languages with batch processing and language detection",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "communication",
    "version": "1.0.0",
    "importPath": "./communication/comms-translation/index.js"
  },
  {
    "name": "comms-advanced",
    "description": "Send SMS, push notifications, and manage video calls via Twilio/Vonage",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "communication",
    "version": "1.0.0",
    "importPath": "./communication/comms-advanced/index.js"
  },
  {
    "name": "ai-training",
    "description": "Train, fine-tune, and evaluate ML models with hyperparameter optimization",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write",
      "process:execute"
    ],
    "dependencies": [],
    "category": "ai-ml",
    "version": "1.0.0",
    "importPath": "./ai-ml/ai-training/index.js"
  },
  {
    "name": "ai-embeddings",
    "description": "Generate text and image embeddings for vector search and similarity",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "ai-ml",
    "version": "1.0.0",
    "importPath": "./ai-ml/ai-embeddings/index.js"
  },
  {
    "name": "ai-sentiment",
    "description": "Analyze sentiment, detect emotions, and extract entities from text",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "ai-ml",
    "version": "1.0.0",
    "importPath": "./ai-ml/ai-sentiment/index.js"
  },
  {
    "name": "data-etl",
    "description": "Extract, transform, and load data between sources with pipeline management",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "data-engineering",
    "version": "1.0.0",
    "importPath": "./data-engineering/data-etl/index.js"
  },
  {
    "name": "data-webhooks",
    "description": "Handle incoming webhooks with validation, filtering, and routing",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:inbound",
      "network:outbound"
    ],
    "dependencies": [],
    "category": "data-engineering",
    "version": "1.0.0",
    "importPath": "./data-engineering/data-webhooks/index.js"
  },
  {
    "name": "data-queues",
    "description": "Manage job queues with BullMQ/Redis - enqueue, process, schedule, retry",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "data-engineering",
    "version": "1.0.0",
    "importPath": "./data-engineering/data-queues/index.js"
  },
  {
    "name": "data-advanced",
    "description": "Stream processing with Kafka, graph database queries, vector store operations",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "data-engineering",
    "version": "1.0.0",
    "importPath": "./data-engineering/data-advanced/index.js"
  },
  {
    "name": "analytics-bi",
    "description": "Web analytics, A/B testing, conversion funnels, and business intelligence",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read"
    ],
    "dependencies": [],
    "category": "analytics-bi",
    "version": "1.0.0",
    "importPath": "./analytics-bi/analytics-bi/index.js"
  },
  {
    "name": "biz-ops",
    "description": "CRM, e-commerce, payments, and accounting operations",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "biz-ops",
    "version": "1.0.0",
    "importPath": "./biz-ops/biz-ops/index.js"
  },
  {
    "name": "loc-maps",
    "description": "Geocoding, reverse geocoding, route optimization, and geofencing",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "location-maps",
    "version": "1.0.0",
    "importPath": "./location-maps/loc-maps/index.js"
  },
  {
    "name": "search-discovery",
    "description": "Full-text and semantic search with Elasticsearch, vector search, and web scraping",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "search-discovery",
    "version": "1.0.0",
    "importPath": "./search-discovery/search-discovery/index.js"
  },
  {
    "name": "media-advanced",
    "description": "Computer vision, video processing, audio manipulation, and lip-sync generation",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "filesystem:read",
      "filesystem:write",
      "process:execute"
    ],
    "dependencies": [],
    "category": "media",
    "version": "1.0.0",
    "importPath": "./media/media-advanced/index.js"
  },
  {
    "name": "blockchain-web3",
    "description": "Manage wallets, deploy smart contracts, mint NFTs, and query on-chain data",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound"
    ],
    "dependencies": [],
    "category": "blockchain-web3",
    "version": "1.0.0",
    "importPath": "./blockchain-web3/blockchain-web3/index.js"
  },
  {
    "name": "iot-hardware",
    "description": "Manage IoT devices, read sensors, send commands, and interact with hardware",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "process:execute",
      "filesystem:read"
    ],
    "dependencies": [],
    "category": "iot-hardware",
    "version": "1.0.0",
    "importPath": "./iot-hardware/iot-hardware/index.js"
  },
  {
    "name": "math-science",
    "description": "Evaluate mathematical expressions, generate LaTeX, graph theory, statistics, molecule visualization",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "math-science",
    "version": "1.0.0",
    "importPath": "./math-science/math-science/index.js"
  },
  {
    "name": "privacy-networks",
    "description": "Route traffic through Tor, I2P, or VPN networks for anonymous access",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "network:outbound",
      "process:execute"
    ],
    "dependencies": [],
    "category": "privacy-networks",
    "version": "1.0.0",
    "importPath": "./privacy-networks/privacy-networks/index.js"
  },
  {
    "name": "legal-entity-factory",
    "description": "Generate formation documents for LLCs, corporations, and nonprofits; create EIN applications",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "permissions": [
      "filesystem:write"
    ],
    "dependencies": [],
    "category": "legal-entity-factory",
    "version": "1.0.0",
    "importPath": "./legal-entity-factory/legal-entity-factory/index.js"
  }
];

export function getSkillMetadata(name: string) {
  return skillManifest.find(s => s.name === name);
}
