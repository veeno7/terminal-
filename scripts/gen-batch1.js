const fs = require('fs');
const path = require('path');

const SKILLS_DIR = '/home/team/shared/cortexforge/src/skills';

const categories = {
  'external-integrations': ['ext-email', 'ext-calendar', 'ext-slack-discord', 'ext-cloud-storage', 'ext-notion-airtable'],
  'devops': ['dev-cicd', 'dev-containers', 'dev-cloud-deploy', 'dev-db-admin', 'dev-api-gateway'],
  'security-monitoring': ['sec-vuln-scan', 'sec-metrics', 'sec-log-analysis', 'sec-alerting', 'sec-compliance'],
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

const skillDefs = {
  'ext-email': {
    name: 'ext-email',
    description: 'Send and receive emails via SMTP/Gmail API with attachments and threading',
    displayName: 'Email Integration',
    permissions: '"network:outbound"',
    inputSchema: `z.object({
  action: z.enum(['send', 'read', 'list', 'search']).describe('Email action to perform'),
  to: z.array(z.string().email()).optional().describe('Recipient email addresses'),
  subject: z.string().optional().describe('Email subject line'),
  body: z.string().optional().describe('Email body content (plain text or HTML)'),
  from: z.string().email().optional().describe('Sender email address'),
  cc: z.array(z.string().email()).optional().describe('CC recipients'),
  bcc: z.array(z.string().email()).optional().describe('BCC recipients'),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    encoding: z.string().optional()
  })).optional().describe('Email attachments'),
  folder: z.string().optional().describe('Folder to read from (inbox, sent, spam)'),
  maxResults: z.number().int().positive().default(10).describe('Max results for list/search'),
  query: z.string().optional().describe('Search query for searching emails')
})`,
    outputSchema: `z.object({
  messageId: z.string().optional(),
  sent: z.boolean().default(false),
  emails: z.array(z.object({
    id: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    subject: z.string(),
    body: z.string(),
    date: z.string(),
    read: z.boolean()
  })).optional(),
  totalCount: z.number().int().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  // Mock implementation - real SMTP/Gmail API integration
  switch (params.action) {
    case 'send':
      return {
        messageId: \`msg_\${Date.now()}\`,
        sent: true,
        to: params.to,
        subject: params.subject,
        timestamp: new Date().toISOString()
      };
    case 'read':
      return {
        emails: Array.from({ length: Math.min(params.maxResults || 10, 10) }, (_, i) => ({
          id: \`email_\${i}_\${Date.now()}\`,
          from: \`sender\${i}@example.com\`,
          to: ['recipient@example.com'],
          subject: \`Sample Email Subject \${i + 1}\`,
          body: \`This is the body of email \${i + 1}.\`,
          date: new Date(Date.now() - i * 3600000).toISOString(),
          read: i < 3
        })),
        totalCount: 42
      };
    case 'list':
      return {
        emails: [],
        totalCount: 0
      };
    case 'search':
      return {
        emails: [],
        totalCount: 0,
        query: params.query
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'ext-calendar': {
    name: 'ext-calendar',
    description: 'Create, read, update, and delete calendar events via Google Calendar/Outlook APIs',
    displayName: 'Calendar Integration',
    permissions: '"network:outbound"',
    inputSchema: `z.object({
  action: z.enum(['create', 'list', 'update', 'delete', 'find-free']).describe('Calendar action'),
  title: z.string().optional().describe('Event title'),
  description: z.string().optional().describe('Event description'),
  startTime: z.string().datetime().optional().describe('Start time (ISO 8601)'),
  endTime: z.string().datetime().optional().describe('End time (ISO 8601)'),
  attendees: z.array(z.string().email()).optional().describe('Attendee emails'),
  location: z.string().optional().describe('Event location'),
  calendarId: z.string().optional().describe('Calendar ID (default: primary)'),
  eventId: z.string().optional().describe('Event ID (for update/delete)'),
  timeMin: z.string().datetime().optional().describe('Start of search range'),
  timeMax: z.string().datetime().optional().describe('End of search range'),
  maxResults: z.number().int().positive().default(10).describe('Max events to return')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    htmlLink: z.string().optional()
  }).optional(),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string()
  })).optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'create':
      return {
        success: true,
        event: {
          id: \`evt_\${Date.now()}\`,
          title: params.title || 'Untitled Event',
          startTime: params.startTime || new Date().toISOString(),
          endTime: params.endTime || new Date(Date.now() + 3600000).toISOString(),
          description: params.description,
          location: params.location,
          attendees: params.attendees,
          htmlLink: \`https://calendar.google.com/event?eid=\${Date.now()}\`
        }
      };
    case 'list':
      return {
        success: true,
        events: Array.from({ length: Math.min(params.maxResults || 10, 10) }, (_, i) => ({
          id: \`evt_\${i}_\${Date.now()}\`,
          title: \`Event \${i + 1}\`,
          startTime: new Date(Date.now() + i * 86400000).toISOString(),
          endTime: new Date(Date.now() + i * 86400000 + 3600000).toISOString()
        }))
      };
    case 'update':
      return {
        success: true,
        event: {
          id: params.eventId || \`evt_\${Date.now()}\`,
          title: params.title || 'Updated Event',
          startTime: params.startTime || new Date().toISOString(),
          endTime: params.endTime || new Date(Date.now() + 3600000).toISOString()
        }
      };
    case 'delete':
      return { success: true };
    case 'find-free':
      return {
        success: true,
        freeSlots: [
          { start: new Date().toISOString(), end: new Date(Date.now() + 7200000).toISOString() }
        ]
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'ext-slack-discord': {
    name: 'ext-slack-discord',
    description: 'Send messages, read channels, and manage webhooks for Slack and Discord',
    displayName: 'Slack & Discord Integration',
    permissions: '"network:outbound"',
    inputSchema: `z.object({
  platform: z.enum(['slack', 'discord']).describe('Messaging platform'),
  action: z.enum(['send-message', 'read-channel', 'list-channels', 'create-webhook', 'add-reaction']).describe('Action to perform'),
  channel: z.string().describe('Channel ID or name'),
  message: z.string().optional().describe('Message text content'),
  threadTs: z.string().optional().describe('Thread timestamp (Slack)'),
  attachments: z.array(z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    color: z.string().optional()
  })).optional().describe('Rich message attachments'),
  webhookUrl: z.string().url().optional().describe('Webhook URL for incoming webhooks'),
  reaction: z.string().optional().describe('Emoji reaction to add'),
  limit: z.number().int().positive().default(50).describe('Max messages to fetch')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  timestamp: z.string().optional(),
  messages: z.array(z.object({
    id: z.string(),
    user: z.string(),
    text: z.string(),
    timestamp: z.string(),
    attachments: z.array(z.any()).optional()
  })).optional(),
  channels: z.array(z.object({
    id: z.string(),
    name: z.string(),
    topic: z.string().optional(),
    memberCount: z.number().int().optional()
  })).optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'send-message':
      return {
        success: true,
        messageId: \`msg_\${params.platform}_\${Date.now()}\`,
        timestamp: new Date().toISOString()
      };
    case 'read-channel':
      return {
        success: true,
        messages: Array.from({ length: Math.min(params.limit || 50, 10) }, (_, i) => ({
          id: \`msg_\${i}_\${Date.now()}\`,
          user: \`user\${i}\`,
          text: \`Sample message \${i + 1} from \${params.platform}\`,
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        }))
      };
    case 'list-channels':
      return {
        success: true,
        channels: [
          { id: 'general', name: 'general', topic: 'General discussion', memberCount: 42 },
          { id: 'random', name: 'random', topic: 'Random stuff', memberCount: 38 },
          { id: 'dev', name: 'development', topic: 'Dev chat', memberCount: 15 }
        ]
      };
    case 'create-webhook':
      return {
        success: true,
        webhookUrl: \`https://hooks.\${params.platform}.com/services/\${Date.now()}\`
      };
    case 'add-reaction':
      return {
        success: true,
        reaction: params.reaction,
        channel: params.channel
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'ext-cloud-storage': {
    name: 'ext-cloud-storage',
    description: 'Upload, download, list, and manage files on Google Drive, Dropbox, and S3',
    displayName: 'Cloud Storage Integration',
    permissions: '"network:outbound", "filesystem:read", "filesystem:write"',
    inputSchema: `z.object({
  provider: z.enum(['gdrive', 'dropbox', 's3']).describe('Cloud storage provider'),
  action: z.enum(['upload', 'download', 'list', 'delete', 'share', 'search']).describe('Storage action'),
  filePath: z.string().optional().describe('Local file path for upload/download'),
  remotePath: z.string().optional().describe('Remote path in cloud storage'),
  fileName: z.string().optional().describe('File name'),
  mimeType: z.string().optional().describe('MIME type of the file'),
  folder: z.string().default('/').describe('Cloud folder path'),
  maxResults: z.number().int().positive().default(20).describe('Max files to list'),
  query: z.string().optional().describe('Search query'),
  shareWith: z.string().email().optional().describe('Email to share with'),
  permission: z.enum(['reader', 'commenter', 'writer']).optional().describe('Sharing permission level')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  fileId: z.string().optional(),
  downloadUrl: z.string().optional(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    mimeType: z.string(),
    size: z.number().int(),
    modifiedAt: z.string(),
    path: z.string()
  })).optional(),
  totalSize: z.number().int().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'upload':
      return {
        success: true,
        fileId: \`file_\${params.provider}_\${Date.now()}\`,
        downloadUrl: \`https://\${params.provider}.com/file/\${Date.now()}\`
      };
    case 'download':
      return {
        success: true,
        fileId: \`file_\${Date.now()}\`,
        downloadUrl: \`https://\${params.provider}.com/dl/\${Date.now()}\`
      };
    case 'list':
      return {
        success: true,
        files: Array.from({ length: Math.min(params.maxResults || 20, 10) }, (_, i) => ({
          id: \`f_\${i}_\${Date.now()}\`,
          name: \`file_\${i + 1}.\${['txt', 'pdf', 'jpg', 'png', 'docx'][i % 5]}\`,
          mimeType: \`application/\${['octet-stream', 'pdf', 'jpeg', 'png', 'vnd.openxmlformats-officedocument.wordprocessingml.document'][i % 5]}\`,
          size: (i + 1) * 1024 * 10,
          modifiedAt: new Date(Date.now() - i * 86400000).toISOString(),
          path: \`\${params.folder}/file_\${i + 1}\`
        }))
      };
    case 'delete':
      return { success: true };
    case 'share':
      return {
        success: true,
        fileId: \`file_\${Date.now()}\`,
        sharedWith: params.shareWith,
        permission: params.permission || 'reader'
      };
    case 'search':
      return {
        success: true,
        files: []
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'ext-notion-airtable': {
    name: 'ext-notion-airtable',
    description: 'Query and manipulate databases in Notion and Airtable - CRUD on records',
    displayName: 'Notion & Airtable Integration',
    permissions: '"network:outbound"',
    inputSchema: `z.object({
  platform: z.enum(['notion', 'airtable']).describe('No-code platform'),
  action: z.enum(['query', 'create', 'update', 'delete', 'list-databases']).describe('Database action'),
  databaseId: z.string().optional().describe('Database/Base ID'),
  tableName: z.string().optional().describe('Table name (Airtable)'),
  recordId: z.string().optional().describe('Record ID for update/delete'),
  fields: z.record(z.any()).optional().describe('Fields/columns to create or update'),
  filter: z.string().optional().describe('Filter formula (Airtable) or Notion filter JSON'),
  sorts: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional().describe('Sort specifications'),
  maxResults: z.number().int().positive().default(100).describe('Max records to return')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  records: z.array(z.object({
    id: z.string(),
    fields: z.record(z.any()),
    createdTime: z.string().optional(),
    url: z.string().optional()
  })).optional(),
  record: z.object({
    id: z.string(),
    fields: z.record(z.any())
  }).optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'query':
      return {
        success: true,
        records: Array.from({ length: Math.min(params.maxResults || 100, 5) }, (_, i) => ({
          id: \`rec_\${i}_\${Date.now()}\`,
          fields: {
            Name: \`Record \${i + 1}\`,
            Status: ['Active', 'Pending', 'Completed'][i % 3],
            Created: new Date(Date.now() - i * 86400000).toISOString()
          },
          createdTime: new Date(Date.now() - i * 86400000).toISOString(),
          url: \`https://\${params.platform}.com/\${params.databaseId || 'db'}/\${i}\`
        }))
      };
    case 'create':
      return {
        success: true,
        record: {
          id: \`rec_\${Date.now()}\`,
          fields: params.fields || {}
        }
      };
    case 'update':
      return {
        success: true,
        record: {
          id: params.recordId || \`rec_\${Date.now()}\`,
          fields: params.fields || {}
        }
      };
    case 'delete':
      return { success: true };
    case 'list-databases':
      return {
        success: true,
        records: [
          { id: 'db1', fields: { Name: 'Projects', Type: 'Database' } },
          { id: 'db2', fields: { Name: 'Tasks', Type: 'Database' } }
        ]
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'dev-cicd': {
    name: 'dev-cicd',
    description: 'Create, trigger, and monitor CI/CD pipelines for GitHub Actions and GitLab CI',
    displayName: 'CI/CD Pipeline Management',
    permissions: '"network:outbound", "process:execute"',
    inputSchema: `z.object({
  platform: z.enum(['github-actions', 'gitlab-ci']).describe('CI/CD platform'),
  action: z.enum(['trigger', 'status', 'list', 'cancel', 'create-workflow', 'get-logs']).describe('Pipeline action'),
  repo: z.string().describe('Repository (owner/name)'),
  workflowId: z.string().optional().describe('Workflow file name or ID'),
  branch: z.string().default('main').describe('Branch to run on'),
  ref: z.string().optional().describe('Git ref (commit SHA, tag)'),
  inputs: z.record(z.string()).optional().describe('Workflow dispatch inputs'),
  runId: z.number().int().optional().describe('Specific run ID for status/logs')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  runId: z.number().int().optional(),
  status: z.string().optional(),
  conclusion: z.string().optional(),
  htmlUrl: z.string().optional(),
  workflows: z.array(z.object({
    id: z.number().int(),
    name: z.string(),
    status: z.string(),
    branch: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })).optional(),
  logs: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'trigger':
      return {
        success: true,
        runId: Math.floor(Math.random() * 1000000),
        status: 'queued',
        htmlUrl: \`https://\${params.platform === 'github-actions' ? 'github.com' : 'gitlab.com'}/\${params.repo}/actions/runs/\${Date.now()}\`
      };
    case 'status':
      return {
        success: true,
        runId: params.runId || Math.floor(Math.random() * 1000000),
        status: 'completed',
        conclusion: 'success',
        htmlUrl: \`https://github.com/\${params.repo}/actions/runs/\${params.runId || Date.now()}\`
      };
    case 'list':
      return {
        success: true,
        workflows: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: [\`CI \${params.repo}\`, 'Deploy', 'Lint', 'Test', 'Release'][i],
          status: ['completed', 'completed', 'completed', 'failed', 'running'][i],
          branch: ['main', 'main', 'develop', 'feature/test', 'main'][i],
          createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - i * 3600000).toISOString()
        }))
      };
    case 'cancel':
      return { success: true, runId: params.runId || 0, status: 'cancelled' };
    case 'create-workflow':
      return {
        success: true,
        workflowId: params.workflowId || 'custom.yml',
        htmlUrl: \`https://github.com/\${params.repo}/blob/main/.github/workflows/\${params.workflowId || 'custom.yml'}\`
      };
    case 'get-logs':
      return {
        success: true,
        logs: '[2024-01-01T00:00:00Z] Starting job...\\n[2024-01-01T00:00:05Z] Checkout complete\\n[2024-01-01T00:00:10Z] Build complete\\n[2024-01-01T00:00:15Z] Tests passed\\n[2024-01-01T00:00:20Z] Deployment successful'
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'dev-containers': {
    name: 'dev-containers',
    description: 'Manage Docker containers, images, compose stacks, and Kubernetes resources',
    displayName: 'Container & Kubernetes Management',
    permissions: '"process:execute", "filesystem:read", "filesystem:write"',
    inputSchema: `z.object({
  platform: z.enum(['docker', 'kubernetes']).describe('Container platform'),
  action: z.enum(['list-containers', 'start', 'stop', 'exec', 'build', 'push', 'list-images', 'compose-up', 'compose-down', 'k8s-apply', 'k8s-get', 'k8s-logs']).describe('Container action'),
  containerId: z.string().optional().describe('Container or pod ID'),
  imageName: z.string().optional().describe('Docker image name'),
  imageTag: z.string().default('latest').describe('Image tag'),
  command: z.string().optional().describe('Command to execute'),
  dockerfilePath: z.string().optional().describe('Path to Dockerfile'),
  composeFile: z.string().optional().describe('Path to docker-compose file'),
  serviceName: z.string().optional().describe('Service name (compose)'),
  k8sManifest: z.string().optional().describe('K8s YAML manifest content'),
  k8sResourceType: z.string().optional().describe('K8s resource type (pod, deployment, svc)'),
  k8sNamespace: z.string().default('default').describe('K8s namespace'),
  env: z.record(z.string()).optional().describe('Environment variables'),
  ports: z.array(z.string()).optional().describe('Port mappings (e.g. ["8080:80"])')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  containerId: z.string().optional(),
  status: z.string().optional(),
  containers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    status: z.string(),
    ports: z.string().optional(),
    created: z.string()
  })).optional(),
  images: z.array(z.object({
    id: z.string(),
    repository: z.string(),
    tag: z.string(),
    size: z.string()
  })).optional(),
  logs: z.string().optional(),
  output: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'list-containers':
      return {
        success: true,
        containers: [
          { id: 'abc123', name: 'web-app', image: 'nginx:latest', status: 'running', ports: '0.0.0.0:80->80/tcp', created: '2 days ago' },
          { id: 'def456', name: 'api-server', image: 'node:18', status: 'running', ports: '0.0.0.0:3000->3000/tcp', created: '5 days ago' },
          { id: 'ghi789', name: 'redis-cache', image: 'redis:7', status: 'exited', created: '1 week ago' }
        ]
      };
    case 'start':
    case 'stop':
      return { success: true, containerId: params.containerId || 'abc123', status: params.action === 'start' ? 'running' : 'exited' };
    case 'exec':
      return { success: true, output: \`\$ \${params.command}\\nOutput from container \${params.containerId}\` };
    case 'build':
      return { success: true, imageName: \`\${params.imageName || 'app'}:\${params.imageTag}\`, containerId: \'img_\' + Date.now() };
    case 'push':
      return { success: true, imageName: params.imageName, status: 'pushed' };
    case 'list-images':
      return {
        success: true,
        images: [
          { id: 'sha256:abc...', repository: 'nginx', tag: 'latest', size: '142MB' },
          { id: 'sha256:def...', repository: 'node', tag: '18-alpine', size: '125MB' }
        ]
      };
    case 'compose-up':
      return { success: true, status: 'started', services: [params.serviceName || 'all'] };
    case 'compose-down':
      return { success: true, status: 'stopped' };
    case 'k8s-apply':
      return { success: true, status: 'applied', resource: params.k8sResourceType || 'deployment' };
    case 'k8s-get':
      return {
        success: true,
        resources: [
          { name: 'web-deploy', ready: '3/3', status: 'Running', restarts: 0, age: '5d' },
          { name: 'api-deploy', ready: '2/2', status: 'Running', restarts: 1, age: '5d' }
        ]
      };
    case 'k8s-logs':
      return { success: true, logs: '[INFO] Server started on port 8080\\n[INFO] Connected to database' };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'dev-cloud-deploy': {
    name: 'dev-cloud-deploy',
    description: 'Provision and manage cloud resources on AWS, GCP, and Azure',
    displayName: 'Cloud Deployment',
    permissions: '"network:outbound", "process:execute"',
    inputSchema: `z.object({
  provider: z.enum(['aws', 'gcp', 'azure']).describe('Cloud provider'),
  action: z.enum(['list-instances', 'create-instance', 'stop-instance', 'terminate-instance', 'list-buckets', 'create-bucket', 'deploy-function', 'list-functions']).describe('Cloud action'),
  instanceName: z.string().optional().describe('Instance name'),
  instanceType: z.string().optional().describe('Instance type (e.g. t3.micro, e2-small)'),
  region: z.string().default('us-east-1').describe('Cloud region'),
  bucketName: z.string().optional().describe('Storage bucket name'),
  functionName: z.string().optional().describe('Function name (serverless)'),
  runtime: z.string().optional().describe('Runtime (nodejs18.x, python3.11)'),
  sourcePath: z.string().optional().describe('Path to deployment source code'),
  environment: z.record(z.string()).optional().describe('Environment variables'),
  tags: z.record(z.string()).optional().describe('Resource tags')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  instances: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    state: z.string(),
    publicIp: z.string().optional(),
    region: z.string(),
    launched: z.string()
  })).optional(),
  instanceId: z.string().optional(),
  bucketName: z.string().optional(),
  functionName: z.string().optional(),
  endpoint: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'list-instances':
      return {
        success: true,
        instances: [
          { id: 'i-abc123', name: 'web-server', type: 't3.medium', state: 'running', publicIp: '54.123.45.67', region: params.region, launched: '30 days ago' },
          { id: 'i-def456', name: 'db-server', type: 't3.large', state: 'stopped', region: params.region, launched: '60 days ago' }
        ]
      };
    case 'create-instance':
      return {
        success: true,
        instanceId: \`i-\${params.provider}_\${Date.now()}\`,
        publicIp: \`54.\${Math.floor(Math.random() * 255)}.\${Math.floor(Math.random() * 255)}.\${Math.floor(Math.random() * 255)}\`
      };
    case 'stop-instance':
      return { success: true, instanceId: params.instanceName || 'i-unknown', state: 'stopping' };
    case 'terminate-instance':
      return { success: true, instanceId: params.instanceName || 'i-unknown', state: 'terminated' };
    case 'list-buckets':
      return { success: true, buckets: [{ name: 'my-app-data', created: '2024-01-15' }, { name: 'logs-archive', created: '2024-03-01' }] };
    case 'create-bucket':
      return { success: true, bucketName: params.bucketName || \`bucket-\${Date.now()}\` };
    case 'deploy-function':
      return {
        success: true,
        functionName: params.functionName || 'my-function',
        endpoint: \`https://\${params.region}-project.cloudfunctions.net/\${params.functionName || 'my-function'}\`
      };
    case 'list-functions':
      return {
        success: true,
        functions: [{ name: 'process-orders', runtime: 'nodejs18', status: 'active' }, { name: 'send-emails', runtime: 'python311', status: 'active' }]
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'dev-db-admin': {
    name: 'dev-db-admin',
    description: 'Execute SQL queries, run migrations, manage backups, and administer databases',
    displayName: 'Database Administration',
    permissions: '"network:outbound", "filesystem:read", "filesystem:write"',
    inputSchema: `z.object({
  action: z.enum(['query', 'migrate', 'backup', 'restore', 'list-tables', 'describe-table', 'create-table', 'optimize']).describe('Database action'),
  databaseType: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb', 'redis']).default('sqlite').describe('Database type'),
  connectionString: z.string().optional().describe('Database connection string'),
  database: z.string().optional().describe('Database name'),
  query: z.string().optional().describe('SQL query to execute'),
  tableName: z.string().optional().describe('Table name'),
  schema: z.string().optional().describe('CREATE TABLE statement or migration SQL'),
  backupPath: z.string().optional().describe('Path for backup file'),
  restorePath: z.string().optional().describe('Path to backup file for restore')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  rows: z.array(z.record(z.any())).optional(),
  rowCount: z.number().int().optional(),
  columns: z.array(z.object({
    name: z.string(),
    type: z.string()
  })).optional(),
  tables: z.array(z.string()).optional(),
  backupFile: z.string().optional(),
  executionTime: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'query':
      return {
        success: true,
        rows: [
          { id: 1, name: 'Sample Record 1', created_at: '2024-01-01' },
          { id: 2, name: 'Sample Record 2', created_at: '2024-01-02' }
        ],
        rowCount: 2,
        executionTime: '12ms'
      };
    case 'migrate':
      return { success: true, executionTime: '150ms', migrationsRun: 3 };
    case 'backup':
      return { success: true, backupFile: params.backupPath || \`/tmp/db_backup_\${Date.now()}.sql\`, executionTime: '2.3s' };
    case 'restore':
      return { success: true, executionTime: '5.1s', tablesRestored: 12 };
    case 'list-tables':
      return { success: true, tables: ['users', 'orders', 'products', 'categories', 'settings'] };
    case 'describe-table':
      return {
        success: true,
        columns: [
          { name: 'id', type: 'INTEGER' },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      };
    case 'create-table':
      return { success: true, tableName: params.tableName || 'new_table', executionTime: '45ms' };
    case 'optimize':
      return { success: true, executionTime: '3.2s', indexesRecreated: 5 };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'dev-api-gateway': {
    name: 'dev-api-gateway',
    description: 'Create, manage, and deploy API routes with rate limiting and auth',
    displayName: 'API Gateway Management',
    permissions: '"network:outbound"',
    inputSchema: `z.object({
  action: z.enum(['create-route', 'list-routes', 'delete-route', 'set-rate-limit', 'add-auth', 'deploy']).describe('Gateway action'),
  routePath: z.string().describe('API route path (e.g. /api/v1/users)'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY']).default('ANY').describe('HTTP method'),
  targetUrl: z.string().url().optional().describe('Upstream target URL'),
  rateLimit: z.object({
    requestsPerSecond: z.number().int().positive().optional(),
    burstSize: z.number().int().positive().optional()
  }).optional().describe('Rate limiting configuration'),
  authType: z.enum(['none', 'api-key', 'jwt', 'oauth2', 'basic']).optional().describe('Authentication type'),
  gatewayName: z.string().optional().describe('Gateway name'),
  cors: z.object({
    origins: z.array(z.string()).optional(),
    methods: z.array(z.string()).optional(),
    headers: z.array(z.string()).optional()
  }).optional().describe('CORS configuration'),
  plugin: z.string().optional().describe('Plugin name (e.g. "prometheus", "logging")')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  routeId: z.string().optional(),
  routes: z.array(z.object({
    id: z.string(),
    path: z.string(),
    method: z.string(),
    target: z.string(),
    auth: z.string(),
    rateLimit: z.string().optional()
  })).optional(),
  endpoint: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'create-route':
      return {
        success: true,
        routeId: \`route_\${Date.now()}\`,
        endpoint: \`https://gateway.local\${params.routePath}\`
      };
    case 'list-routes':
      return {
        success: true,
        routes: [
          { id: 'r1', path: '/api/v1/users', method: 'GET', target: 'http://users-service:3001', auth: 'jwt', rateLimit: '100/s' },
          { id: 'r2', path: '/api/v1/orders', method: 'POST', target: 'http://orders-service:3002', auth: 'jwt', rateLimit: '50/s' },
          { id: 'r3', path: '/api/v1/auth', method: 'POST', target: 'http://auth-service:3003', auth: 'none' }
        ]
      };
    case 'delete-route':
      return { success: true, routeId: params.routePath || 'unknown' };
    case 'set-rate-limit':
      return { success: true, routePath: params.routePath, config: params.rateLimit };
    case 'add-auth':
      return { success: true, routePath: params.routePath, authType: params.authType || 'jwt' };
    case 'deploy':
      return { success: true, endpoint: \`https://\${params.gatewayName || 'api'}.gateway.local\`, version: \`v1.0.0-\${Date.now()}\` };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'sec-vuln-scan': {
    name: 'sec-vuln-scan',
    description: 'Scan dependencies, check SSL/TLS, and detect known vulnerabilities',
    displayName: 'Vulnerability Scanner',
    permissions: '"network:outbound", "filesystem:read"',
    inputSchema: `z.object({
  scanType: z.enum(['dependency', 'ssl', 'port', 'full']).describe('Type of vulnerability scan'),
  target: z.string().describe('Target URL, hostname, or package.json path'),
  portRange: z.string().default('1-1024').describe('Port range for port scan'),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'all']).default('all').describe('Minimum severity to report'),
  timeout: z.number().int().positive().default(30000).describe('Timeout in milliseconds')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  summary: z.object({
    critical: z.number().int(),
    high: z.number().int(),
    medium: z.number().int(),
    low: z.number().int(),
    total: z.number().int()
  }),
  vulnerabilities: z.array(z.object({
    id: z.string(),
    title: z.string(),
    severity: z.string(),
    description: z.string(),
    affected: z.string(),
    remediation: z.string().optional(),
    cvssScore: z.number().optional()
  })),
  scanDuration: z.string()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  return {
    success: true,
    summary: { critical: 1, high: 2, medium: 4, low: 8, total: 15 },
    vulnerabilities: [
      { id: 'CVE-2024-0001', title: 'Prototype Pollution in lodash', severity: 'high', description: 'A prototype pollution vulnerability in lodash versions < 4.17.21', affected: 'lodash@4.17.20', remediation: 'Upgrade lodash to ^4.17.21', cvssScore: 7.5 },
      { id: 'CVE-2024-0002', title: 'SSRF in axios', severity: 'critical', description: 'Server-Side Request Forgery in axios', affected: 'axios@0.21.0', remediation: 'Upgrade axios to ^1.6.0', cvssScore: 9.1 },
      { id: 'CVE-2024-0003', title: 'Weak SSL Certificate', severity: 'medium', description: \`SSL certificate for \${params.target} uses SHA-1 signature\`, affected: params.target, remediation: 'Renew certificate with SHA-256', cvssScore: 5.0 }
    ],
    scanDuration: '12.4s'
  };
}`
  },
  'sec-metrics': {
    name: 'sec-metrics',
    description: 'Monitor CPU, memory, disk, network, and process metrics for system health',
    displayName: 'System Metrics & Monitoring',
    permissions: '"process:execute", "filesystem:read"',
    inputSchema: `z.object({
  metricType: z.enum(['cpu', 'memory', 'disk', 'network', 'processes', 'all']).default('all').describe('Type of metrics to collect'),
  interval: z.number().int().positive().default(1000).describe('Sampling interval in ms'),
  duration: z.number().int().positive().default(5000).describe('Collection duration in ms'),
  processFilter: z.string().optional().describe('Filter processes by name')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  timestamp: z.string(),
  cpu: z.object({
    percentUsed: z.number(),
    loadAverage: z.array(z.number()),
    cores: z.number().int()
  }).optional(),
  memory: z.object({
    totalGB: z.number(),
    usedGB: z.number(),
    percentUsed: z.number(),
    swapUsedGB: z.number().optional()
  }).optional(),
  disk: z.object({
    totalGB: z.number(),
    usedGB: z.number(),
    percentUsed: z.number()
  }).optional(),
  network: z.object({
    bytesIn: z.number(),
    bytesOut: z.number(),
    connections: z.number().int().optional()
  }).optional(),
  processes: z.array(z.object({
    pid: z.number().int(),
    name: z.string(),
    cpuPercent: z.number(),
    memoryMB: z.number(),
    status: z.string()
  })).optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    cpu: { percentUsed: 45.2, loadAverage: [2.1, 1.8, 1.5], cores: 8 },
    memory: { totalGB: 16, usedGB: 11.2, percentUsed: 70, swapUsedGB: 0.5 },
    disk: { totalGB: 256, usedGB: 143, percentUsed: 55.9 },
    network: { bytesIn: 1524300, bytesOut: 892100, connections: 42 },
    processes: [
      { pid: 1234, name: 'node', cpuPercent: 12.5, memoryMB: 256, status: 'running' },
      { pid: 5678, name: 'nginx', cpuPercent: 2.1, memoryMB: 64, status: 'running' },
      { pid: 9012, name: 'postgres', cpuPercent: 5.3, memoryMB: 512, status: 'sleeping' }
    ]
  };
}`
  },
  'sec-log-analysis': {
    name: 'sec-log-analysis',
    description: 'Parse logs, detect anomalies, and generate security insights from log data',
    displayName: 'Log Analysis & Anomaly Detection',
    permissions: '"filesystem:read"',
    inputSchema: `z.object({
  action: z.enum(['parse', 'analyze', 'search', 'anomalies', 'summarize']).describe('Log analysis action'),
  logSource: z.string().describe('Log file path or log content'),
  logFormat: z.enum(['json', 'apache', 'syslog', 'nginx', 'auto']).default('auto').describe('Log format'),
  filter: z.string().optional().describe('Filter pattern'),
  timeRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional().describe('Time range filter'),
  maxEntries: z.number().int().positive().default(100).describe('Max log entries to analyze')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  entries: z.array(z.object({
    timestamp: z.string(),
    level: z.string().optional(),
    message: z.string(),
    source: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })).optional(),
  summary: z.object({
    totalEntries: z.number().int(),
    errors: z.number().int(),
    warnings: z.number().int(),
    info: z.number().int(),
    timeRange: z.object({
      start: z.string(),
      end: z.string()
    })
  }).optional(),
  anomalies: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    description: z.string(),
    occurrences: z.number().int(),
    affectedEntries: z.array(z.string()).optional()
  })).optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'parse':
      return {
        success: true,
        entries: [
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Server started on port 8080', source: 'app-server' },
          { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'WARN', message: 'High memory usage detected', source: 'monitor' },
          { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'ERROR', message: 'Database connection timeout', source: 'database' }
        ]
      };
    case 'analyze':
    case 'summarize':
      return {
        success: true,
        summary: {
          totalEntries: 15234,
          errors: 23,
          warnings: 156,
          info: 15055,
          timeRange: {
            start: new Date(Date.now() - 86400000).toISOString(),
            end: new Date().toISOString()
          }
        },
        anomalies: [
          { type: 'error_spike', severity: 'high', description: 'Error rate increased 300% in last hour', occurrences: 12 },
          { type: 'auth_failure', severity: 'medium', description: 'Multiple authentication failures from IP 192.168.1.100', occurrences: 5 }
        ]
      };
    case 'search':
      return {
        success: true,
        entries: [
          { timestamp: new Date().toISOString(), level: 'ERROR', message: \`Search match for "\${params.filter}"\`, metadata: { filter: params.filter } }
        ]
      };
    case 'anomalies':
      return {
        success: true,
        anomalies: [
          { type: 'pattern_anomaly', severity: 'medium', description: 'Unusual request pattern detected', occurrences: 3 },
          { type: 'latency_spike', severity: 'high', description: 'Response time exceeded 5s threshold', occurrences: 7 }
        ]
      };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  },
  'sec-alerting': {
    name: 'sec-alerting',
    description: 'Send alerts via PagerDuty, webhooks, email, and SMS with escalation policies',
    displayName: 'Alerting & Incident Management',
    permissions: '"network:outbound"',
    inputSchema: `z.object({
  action: z.enum(['send-alert', 'acknowledge', 'resolve', 'list-alerts', 'create-incident', 'update-escalation']).describe('Alerting action'),
  provider: z.enum(['pagerduty', 'webhook', 'email', 'sms', 'slack']).default('webhook').describe('Alerting provider'),
  title: z.string().describe('Alert title'),
  message: z.string().describe('Alert message body'),
  severity: z.enum(['critical', 'warning', 'info']).default('warning').describe('Alert severity'),
  source: z.string().optional().describe('Alert source (service or system name)'),
  alertId: z.string().optional().describe('Alert ID for acknowledge/resolve'),
  webhookUrl: z.string().url().optional().describe('Custom webhook URL'),
  recipients: z.array(z.string()).optional().describe('Alert recipients'),
  escalationPolicy: z.object({
    levels: z.number().int().positive().optional(),
    intervals: z.array(z.number().int()).optional()
  }).optional().describe('Escalation policy config'),
  metadata: z.record(z.any()).optional().describe('Additional alert metadata')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  alertId: z.string(),
  status: z.string(),
  acknowledgedBy: z.string().optional(),
  createdAt: z.string(),
  deliveryStatus: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  return {
    success: true,
    alertId: \`alert_\${Date.now()}\`,
    status: params.action === 'resolve' ? 'resolved' : params.action === 'acknowledge' ? 'acknowledged' : 'triggered',
    acknowledgedBy: params.action === 'acknowledge' ? 'oncall-engineer' : undefined,
    createdAt: new Date().toISOString(),
    deliveryStatus: \`delivered via \${params.provider}\`
  };
}`
  },
  'sec-compliance': {
    name: 'sec-compliance',
    description: 'Run compliance checks, penetration tests, and gather threat intelligence',
    displayName: 'Compliance & PenTesting',
    permissions: '"network:outbound", "process:execute"',
    inputSchema: `z.object({
  action: z.enum(['compliance-check', 'pentest', 'threat-intel', 'audit-log', 'generate-report']).describe('Compliance action'),
  standard: z.enum(['soc2', 'hipaa', 'gdpr', 'pci-dss', 'iso27001', 'custom']).default('custom').describe('Compliance standard'),
  target: z.string().describe('Target system, URL, or scope'),
  tests: z.array(z.string()).optional().describe('Specific tests to run'),
  scope: z.string().optional().describe('Audit scope description'),
  reportFormat: z.enum(['json', 'html', 'pdf']).default('json').describe('Output report format'),
  threatActor: z.string().optional().describe('Threat actor to gather intel on')
})`,
    outputSchema: `z.object({
  success: z.boolean(),
  complianceStatus: z.enum(['pass', 'fail', 'partial']).optional(),
  score: z.number().optional(),
  checks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['pass', 'fail', 'warning', 'na']),
    description: z.string(),
    remediation: z.string().optional()
  })).optional(),
  vulnerabilities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    severity: z.string(),
    description: z.string()
  })).optional(),
  reportUrl: z.string().optional(),
  summary: z.string().optional()
})`,
    execBody: `async function executeInternal(params: SkillInput) {
  switch (params.action) {
    case 'compliance-check':
      return {
        success: true,
        complianceStatus: 'partial',
        score: 78,
        checks: [
          { id: 'C1', name: 'Encryption at Rest', status: 'pass', description: 'All data encrypted with AES-256' },
          { id: 'C2', name: 'Access Controls', status: 'pass', description: 'RBAC implemented' },
          { id: 'C3', name: 'Audit Logging', status: 'fail', description: 'Insufficient audit trail', remediation: 'Enable detailed audit logging for all data access' },
          { id: 'C4', name: 'Data Retention', status: 'warning', description: 'Some data exceeds retention policy' }
        ],
        summary: \`\${params.standard.toUpperCase()} compliance check: 2 pass, 1 fail, 1 warning\`
      };
    case 'pentest':
      return {
        success: true,
        vulnerabilities: [
          { id: 'P1', name: 'XSS in search endpoint', severity: 'high', description: 'Reflected XSS vulnerability in /search' },
          { id: 'P2', name: 'Missing CORS headers', severity: 'medium', description: 'API missing restrictive CORS headers' }
        ],
        summary: 'Penetration test completed: 2 vulnerabilities found (1 high, 1 medium)'
      };
    case 'threat-intel':
      return {
        success: true,
        summary: \`Threat intelligence gathered on \${params.threatActor || 'APT-41'}: Active since 2024, targets tech sector\`,
        threats: [
          { name: 'Phishing Campaign', severity: 'high', description: 'Targeted phishing against employees' },
          { name: 'Known C2 Infrastructure', severity: 'medium', description: 'C2 servers identified at 45.33.xx.xx' }
        ]
      };
    case 'audit-log':
      return { success: true, summary: 'Audit log generated for scope: ' + (params.scope || 'full system'), entries: 256 };
    case 'generate-report':
      return { success: true, reportUrl: \`/tmp/compliance_report_\${Date.now()}.pdf\`, summary: 'Report generated' };
    default:
      throw new Error(\`Unknown action: \${params.action}\`);
  }
}`
  }
};

// Generate all skill files
for (const [category, skills] of Object.entries(categories)) {
  for (const skill of skills) {
    const def = skillDefs[skill];
    if (!def) continue;
    
    const baseDir = path.join(SKILLS_DIR, category, skill);
    fs.mkdirSync(path.join(baseDir, 'test'), { recursive: true });
    
    // manifest.json
    const manifest = {
      name: skill,
      description: def.description,
      parameters: { type: 'object', properties: {}, required: [] },
      permissions: def.permissions.split(', ').map(p => p.replace(/"/g, '')),
      dependencies: [],
      category: category,
      version: '1.0.0'
    };
    fs.writeFileSync(path.join(baseDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    
    // schema.ts
    const schemaContent = `import { z } from 'zod';\n\nexport const InputSchema = ${def.inputSchema};\n\nexport const OutputSchema = ${def.outputSchema};\n\nexport type SkillInput = z.infer<typeof InputSchema>;\nexport type SkillOutput = z.infer<typeof OutputSchema>;\n`;
    fs.writeFileSync(path.join(baseDir, 'schema.ts'), schemaContent);
    
    // index.ts
    const indexContent = `import { z } from 'zod';\nimport { InputSchema, OutputSchema, type SkillInput, type SkillOutput } from './schema';\n\nexport { InputSchema, OutputSchema };\nexport type { SkillInput, SkillOutput };\n\nexport type SkillResult = {\n  success: boolean;\n  data?: any;\n  error?: string;\n};\n\n${def.execBody}\n\nexport async function execute(params: SkillInput): Promise<SkillResult> {\n  try {\n    const validated = InputSchema.parse(params);\n    const result = await executeInternal(validated);\n    return { success: true, data: result };\n  } catch (error: any) {\n    return {\n      success: false,\n      error: error instanceof z.ZodError\n        ? \`Validation error: \${error.errors.map(e => e.message).join(', ')}\`\n        : error.message || 'Unknown error occurred'\n    };\n  }\n}\n`;
    fs.writeFileSync(path.join(baseDir, 'index.ts'), indexContent);
    
    // test/index.test.ts
    const testContent = `import { describe, it, expect } from '@jest/globals';\nimport { execute, InputSchema, OutputSchema } from '../index';\nimport { z } from 'zod';\n\ndescribe('${skill}', () => {\n  it('should export valid schemas', () => {\n    expect(InputSchema).toBeDefined();\n    expect(OutputSchema).toBeDefined();\n  });\n\n  it('should execute successfully with valid params', async () => {\n    const result = await execute({ \n      ${skill.startsWith('ext-') ? `action: 'send', to: ['test@example.com'], subject: 'Test'` : 
        skill.startsWith('dev-') ? `action: '${skill === 'dev-cicd' ? 'trigger' : 'list-containers'}'` :
        skill.startsWith('sec-') ? `action: '${skill.includes('vuln') ? 'analyze' : 
          skill.includes('metrics') ? 'send-metrics' : 
          skill.includes('log') ? 'parse' :
          skill.includes('alert') ? 'send-alert' :
          'compliance-check'}'` :
        `action: 'list'`}\n    });\n    expect(result.success).toBe(true);\n    expect(result.data).toBeDefined();\n  });\n\n  it('should return error for invalid input', async () => {\n    const result = await execute({} as any);\n    expect(result.success).toBe(false);\n    expect(result.error).toBeDefined();\n  });\n});\n`;
    fs.writeFileSync(path.join(baseDir, 'test', 'index.test.ts'), testContent);
    
    // README.md
    const readmeContent = `# ${def.displayName} (\`${skill}\`)\n\n**Category:** ${category}\n**Description:** ${def.description}\n\n## Usage\n\n\`\`\`typescript\nimport { execute } from './skills/${category}/${skill}';\n\nconst result = await execute({\n  // params here\n});\n\nif (result.success) {\n  console.log('Success:', result.data);\n} else {\n  console.error('Error:', result.error);\n}\n\`\`\`\n\n## Input Schema\n\nSee \`schema.ts\` for full Zod schema definition.\n\n## Permissions\n\n- \`network:outbound\` - Requires network access for API calls\n\n## Notes\n\nThis is a mock implementation. Actual API keys and service integrations should be configured via environment variables.\n`;
    fs.writeFileSync(path.join(baseDir, 'README.md'), readmeContent);
    
    console.log(`Created: ${category}/${skill}`);
  }
}

console.log('\\nAll External Integrations and DevOps skills created!');
