import { z } from 'zod';

export const InputSchema = z.object({
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
});

export const OutputSchema = z.object({
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
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
