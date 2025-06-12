export interface ContainerConfig {
  name?: string;
  baseImage: string;
  ports?: string[];  // Format: "containerPort:hostPort/protocol" e.g. "27017:27017/tcp"
  env?: Record<string, string>;
  volumes?: string[]; // Format: "hostPath:containerPath" e.g. "/data:/data"
  memory?: string;    // Memory limit in MB
  cpu?: number;       // CPU limit (0.5 = half a CPU core)
  dependencies?: string[]; // Format: "type:version" e.g. "nodejs:18"
  command?: string[];  // Custom command to run in the container
  restartPolicy?: "no" | "always" | "on-failure" | "unless-stopped";  // Docker restart policy
}

export interface ContainerCreationResponse {
  id: string;
  name: string;
  status: string;
}

export interface ContainerListResponse {
  id: string;
  name: string;
  image: string;
  status: string;
  created: number;
  ports: Array<{
    privatePort: number;
    publicPort?: number;
    type: string;
  }>;
}