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

// Add file management API calls

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  owner: string;
  group: string;
  permissions: string;
  modified: string;
  isDirectory: boolean;
}

// File management APIs
export const listFiles = async (containerId: string, directory: string = "/"): Promise<FileInfo[]> => {
  const response = await api.get(`/containers/${containerId}/files`, {
    params: { path: directory }
  });
  return response.data;
};

export const getFileContent = async (containerId: string, filePath: string): Promise<string> => {
  const response = await api.get(`/containers/${containerId}/files/content`, {
    params: { path: filePath }
  });
  return response.data;
};

export const writeFileContent = async (containerId: string, filePath: string, content: string): Promise<void> => {
  await api.post(`/containers/${containerId}/files/content`, { content }, {
    params: { path: filePath }
  });
};

export const createDirectory = async (containerId: string, dirPath: string): Promise<void> => {
  await api.post(`/containers/${containerId}/directories`, { path: dirPath });
};

export const deleteFileOrDirectory = async (containerId: string, path: string, recursive: boolean = false): Promise<void> => {
  await api.delete(`/containers/${containerId}/files`, {
    data: { path, recursive }
  });
};

export const moveFileOrDirectory = async (containerId: string, oldPath: string, newPath: string): Promise<void> => {
  await api.post(`/containers/${containerId}/files/move`, { oldPath, newPath });
};

export const copyFileOrDirectory = async (containerId: string, sourcePath: string, destinationPath: string): Promise<void> => {
  await api.post(`/containers/${containerId}/files/copy`, { sourcePath, destinationPath });
};

export const getFileInfo = async (containerId: string, filePath: string): Promise<FileInfo> => {
  const response = await api.get(`/containers/${containerId}/files/info`, {
    params: { path: filePath }
  });
  return response.data;
};

export const searchFiles = async (containerId: string, directory: string = "/", pattern: string): Promise<string[]> => {
  const response = await api.get(`/containers/${containerId}/files/search`, {
    params: { directory, pattern }
  });
  return response.data;
};

export const getFileDownloadUrl = (containerId: string, filePath: string): string => {
  return `${API_BASE_URL}/containers/${containerId}/files/download?path=${encodeURIComponent(filePath)}`;
};

export const uploadFile = async (containerId: string, file: File, destination: string): Promise<{ path: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('destination', destination);
  
  const response = await api.post(`/containers/${containerId}/files/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};