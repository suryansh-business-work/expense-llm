import axios from 'axios';

const API_BASE_URL = 'http://localhost:3500/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Container APIs
export const getContainers = async (): Promise<Container[]> => {
  const response = await api.get('/containers');
  return response.data;
};

export const getContainer = async (id: string): Promise<Container> => {
  const response = await api.get(`/containers/${id}`);
  return response.data;
};

export const createContainer = async (config: ContainerConfig): Promise<{ id: string }> => {
  const response = await api.post('/containers', config);
  return response.data;
};

export const deleteContainer = async (id: string): Promise<void> => {
  await api.delete(`/containers/${id}`);
};

export const startContainer = async (id: string): Promise<void> => {
  await api.post(`/containers/${id}/start`);
};

export const stopContainer = async (id: string): Promise<void> => {
  await api.post(`/containers/${id}/stop`);
};

export const restartContainer = async (id: string): Promise<void> => {
  await api.post(`/containers/${id}/restart`);
};

export const installDependencies = async (id: string, dependencies: string[]): Promise<void> => {
  await api.post(`/containers/${id}/dependencies`, { dependencies });
};

// Terminal API
export const executeCommand = async (id: string, command: string): Promise<CommandResult> => {
  const response = await api.post(`/containers/${id}/terminal/execute`, { command });
  return response.data;
};

// Docker status
export const checkDockerStatus = async (): Promise<boolean> => {
  try {
    const response = await api.get('/status');
    return response.data.status === 'connected';
  } catch (error) {
    console.error('Error checking Docker status:', error);
    return false;
  }
};