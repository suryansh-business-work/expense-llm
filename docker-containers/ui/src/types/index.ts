export interface Container {
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

export interface ContainerConfig {
  name?: string;
  baseImage: string;
  ports?: string[];
  env?: Record<string, string>;
  volumes?: string[];
  memory?: string;
  cpu?: number;
  dependencies?: string[];
  command?: string[];
  restartPolicy?: "no" | "always" | "on-failure" | "unless-stopped";
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

export interface TerminalEvent {
  type: 'output' | 'error' | 'finished' | 'container-selected' | 'shell-started' | 'shell-closed';
  data?: string | any;
}