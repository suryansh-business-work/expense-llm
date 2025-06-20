import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/v1/api/code-run';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const DEFAULT_NODEJS_CONFIG: ContainerConfig = {
  name: "container-name",
  baseImage: "ubuntu:22.04",
  ports: [
    "3006:3006/tcp",
    "27017:27017/tcp",
    "1337:1337/tcp",
  ],
  volumes: [
    "./data:/data",
    "/logs:/var/log"
  ],
  env: {
    NODE_ENV: "development",
    DB_HOST: "localhost"
  },
  memory: "512m",
  cpu: 0.5,
  dependencies: [
    "sudo",
    "gnupg",
    "mongodb-org",
    "nodejs:22",
    "mongodb:8.0",
    "npm",
    "git",
    "curl",
    "lsof",
    "netstat"
  ],
  restartPolicy: "unless-stopped"
};

export const createContainer = async (name: string): Promise<{ name: string }> => {
  const response = await api.post('/containers', { ...DEFAULT_NODEJS_CONFIG, name: name });
  return response.data;
};
