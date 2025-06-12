import Docker from 'dockerode';
import { logger } from '../utils/logger';
import { ContainerConfig } from '../models/container.model';
import { v4 as uuidv4 } from 'uuid';

// Modify the class definition to expose the docker instance
export class ContainerService {
  public docker: Docker; // Change from private to public

  constructor() {
    // Check if we're on Windows or Unix
    const socketPath = process.platform === 'win32'
      ? '//./pipe/docker_engine'
      : '/var/run/docker.sock';
    
    this.docker = new Docker({ socketPath });
  }

  /**
   * Check if Docker is running and accessible
   */
  public async checkDockerStatus(): Promise<boolean> {
    try {
      const info = await this.docker.info();
      logger.info(`Connected to Docker. Engine version: ${info.ServerVersion}`);
      return true;
    } catch (error) {
      logger.error('Failed to connect to Docker:', error);
      return false;
    }
  }

  /**
   * Create a new container with the given configuration
   */
  public async createContainer(config: ContainerConfig): Promise<string> {
    try {
      // Ensure base image is available
      await this.pullImageIfNeeded(config.baseImage);
      
      // Generate a unique name if not provided
      const containerName = config.name || `container-${uuidv4().slice(0, 8)}`;
      
      // Create container configuration
      const containerConfig: Docker.ContainerCreateOptions = {
        Image: config.baseImage,
        name: containerName,
        Hostname: containerName,
        ExposedPorts: this.createExposedPorts(config.ports || []),
        Env: this.createEnvironmentVariables(config.env || {}),
        // Add a command that keeps the container running if none provided
        Cmd: config.command || ["/bin/bash", "-c", "while true; do sleep 1; done"],
        // Set the container to run in the background
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
        HostConfig: {
          PortBindings: this.createPortBindings(config.ports || []),
          Memory: config.memory ? this.parseMemoryString(config.memory) : undefined,
          NanoCpus: config.cpu ? Math.floor(config.cpu * 1000000000) : undefined,
          Binds: config.volumes || [],
          // Add restart policy to ensure container stays running
          RestartPolicy: {
            Name: config.restartPolicy || "unless-stopped"
          }
        }
      };
      
      // Create the container
      const container = await this.docker.createContainer(containerConfig);
      const containerId = container.id;
      
      // Start the container
      await container.start();
      
      // Install dependencies if specified
      if (config.dependencies && config.dependencies.length > 0) {
        await this.installDependencies(containerId, config.dependencies);
      }
      
      logger.info(`Container created and started: ${containerName} (${containerId})`);
      return containerId;
    } catch (error) {
      logger.error('Error creating container:', error);
      throw error;
    }
  }

  /**
   * Pull a Docker image if not already present
   */
  public async pullImageIfNeeded(imageName: string): Promise<void> {
    try {
      const images = await this.docker.listImages();
      const imageExists = images.some(img => 
        img.RepoTags && img.RepoTags.includes(imageName)
      );
      
      if (!imageExists) {
        logger.info(`Pulling image: ${imageName}`);
        
        const stream = await this.docker.pull(imageName);
        
        return new Promise((resolve, reject) => {
          this.docker.modem.followProgress(stream, (err: Error | null) => {
            if (err) {
              reject(err);
              return;
            }
            logger.info(`Successfully pulled image: ${imageName}`);
            resolve();
          });
        });
      } else {
        logger.info(`Image ${imageName} already exists`);
      }
    } catch (error) {
      logger.error(`Error pulling image ${imageName}:`, error);
      throw error;
    }
  }

  /**
   * Stop and remove a container
   */
  public async removeContainer(containerId: string, force: boolean = false): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Get container info
      const info = await container.inspect();
      
      // Stop the container if it's running
      if (info.State.Running) {
        logger.info(`Stopping container: ${containerId}`);
        await container.stop({ t: 10 });
      }
      
      // Remove the container
      await container.remove({ force });
      
      logger.info(`Container removed: ${containerId}`);
    } catch (error) {
      logger.error(`Error removing container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Get details about a container
   */
  public async getContainer(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();
      return info;
    } catch (error) {
      logger.error(`Error getting container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * List all containers
   */
  public async listContainers(all: boolean = true): Promise<Docker.ContainerInfo[]> {
    try {
      return await this.docker.listContainers({ all });
    } catch (error) {
      logger.error('Error listing containers:', error);
      throw error;
    }
  }

  /**
   * Start a stopped container
   */
  public async startContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
      logger.info(`Container started: ${containerId}`);
    } catch (error) {
      logger.error(`Error starting container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Stop a running container
   */
  public async stopContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop({ t: 10 }); // 10 seconds timeout
      logger.info(`Container stopped: ${containerId}`);
    } catch (error) {
      logger.error(`Error stopping container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a container
   */
  public async restartContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart({ t: 10 }); // 10 seconds timeout
      logger.info(`Container restarted: ${containerId}`);
    } catch (error) {
      logger.error(`Error restarting container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Update container configuration
   */
  public async updateContainer(containerId: string, config: Partial<ContainerConfig>): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Update container configuration
      await container.update({
        RestartPolicy: config.restartPolicy ? { Name: config.restartPolicy } : undefined,
        Memory: config.memory ? this.parseMemoryString(config.memory) : undefined,
        NanoCpus: config.cpu ? Math.floor(config.cpu * 1000000000) : undefined,
      });
      
      logger.info(`Container updated: ${containerId}`);
    } catch (error) {
      logger.error(`Error updating container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Install dependencies in a container
   */
  private async installDependencies(containerId: string, dependencies: string[]): Promise<void> {
    const container = this.docker.getContainer(containerId);
    
    for (const dependency of dependencies) {
      try {
        const [type, version] = dependency.split(':');
        const installScript = this.getDependencyInstallScript(type, version);
        
        if (!installScript) {
          logger.warn(`No installation script found for dependency: ${dependency}`);
          continue;
        }
        
        logger.info(`Installing ${dependency} in container ${containerId}`);
        
        const exec = await container.exec({
          Cmd: ['bash', '-c', installScript],
          AttachStdout: true,
          AttachStderr: true
        });
        
        const stream = await exec.start({});
        
        // Wait for installation to complete
        await new Promise<void>((resolve) => {
          container.modem.demuxStream(stream, process.stdout, process.stderr);
          stream.on('end', () => resolve());
        });
        
        logger.info(`Successfully installed ${dependency} in container ${containerId}`);
      } catch (error) {
        logger.error(`Error installing dependency ${dependency}:`, error);
        throw error;
      }
    }
  }

  /**
   * Get installation script for a dependency
   */
  private getDependencyInstallScript(type: string, version?: string): string | null {
    switch (type.toLowerCase()) {
      case 'nodejs':
        return this.getNodejsInstallScript(version || process.env.DEFAULT_NODEJS_VERSION || '18');
      case 'mongodb':
        return this.getMongoDBInstallScript(version || process.env.DEFAULT_MONGODB_VERSION || '6.0');
      case 'postgresql':
        return this.getPostgresInstallScript(version || process.env.DEFAULT_POSTGRESQL_VERSION || '15');
      default:
        return null;
    }
  }

  /**
   * Get NodeJS installation script
   */
  private getNodejsInstallScript(version: string): string {
    return `
      apt-get update
      apt-get install -y curl
      curl -fsSL https://deb.nodesource.com/setup_${version}.x | bash -
      apt-get install -y nodejs
      node --version
    `;
  }

  /**
   * Get MongoDB installation script
   */
  private getMongoDBInstallScript(version: string): string {
    return `
      apt-get update
      apt-get install -y gnupg curl
      curl -fsSL https://pgp.mongodb.com/server-${version}.asc | apt-key add -
      echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/${version} multiverse" | tee /etc/apt/sources.list.d/mongodb-org-${version}.list
      apt-get update
      apt-get install -y mongodb-org
      systemctl start mongod
      systemctl enable mongod
    `;
  }

  /**
   * Get PostgreSQL installation script
   */
  private getPostgresInstallScript(version: string): string {
    return `
      apt-get update
      apt-get install -y lsb-release gnupg curl
      curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
      echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list
      apt-get update
      apt-get install -y postgresql-${version}
      systemctl start postgresql
      systemctl enable postgresql
    `;
  }

  /**
   * Helper to create port mappings
   */
  private createExposedPorts(ports: string[]): Record<string, {}> {
    const exposedPorts: Record<string, {}> = {};
    
    ports.forEach(port => {
      const [containerPort, hostPort, protocol = 'tcp'] = port.split(':');
      exposedPorts[`${containerPort}/${protocol}`] = {};
    });
    
    return exposedPorts;
  }

  /**
   * Helper to create port bindings
   */
  private createPortBindings(ports: string[]): Record<string, Array<{ HostPort: string }>> {
    const portBindings: Record<string, Array<{ HostPort: string }>> = {};
    
    ports.forEach(port => {
      const parts = port.split(':');
      let containerPort, hostPort, protocol = 'tcp';
      
      if (parts.length === 1) {
        containerPort = parts[0];
        hostPort = parts[0];
      } else if (parts.length >= 2) {
        containerPort = parts[0];
        hostPort = parts[1];
      }
      
      // Check for protocol
      if (containerPort) {
        const portParts = containerPort.split('/');
        if (portParts.length > 1) {
          containerPort = portParts[0];
          protocol = portParts[1];
        }
      } else {
        throw new Error('containerPort is undefined while creating port bindings');
      }
      
      if (!hostPort) {
        throw new Error('hostPort is undefined while creating port bindings');
      }
      portBindings[`${containerPort}/${protocol}`] = [{ HostPort: String(hostPort) }];
    });
    
    return portBindings;
  }

  /**
   * Helper to create environment variables
   */
  private createEnvironmentVariables(env: Record<string, string>): string[] {
    return Object.entries(env).map(([key, value]) => `${key}=${value}`);
  }

  /**
   * Parse memory string to bytes
   */
  private parseMemoryString(memoryString: string): number {
    const match = memoryString.match(/^(\d+)([bkmgBKMG]?)$/);
    if (!match) {
      throw new Error(`Invalid memory format: ${memoryString}`);
    }
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'k':
        return value * 1024;
      case 'm':
        return value * 1024 * 1024;
      case 'g':
        return value * 1024 * 1024 * 1024;
      default: // bytes or no unit
        return value;
    }
  }
}

// Export singleton instance
export const containerService = new ContainerService();