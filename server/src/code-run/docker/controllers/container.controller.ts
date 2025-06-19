import { Request, Response } from 'express';
import { containerService } from '../services/container.services';
import { ContainerConfig } from '../models/container.model';
import { validateContainerConfig } from '../utils/validation';
import { logger } from '../utils/logger';

export class ContainerController {
  /**
   * Create a new container with the provided configuration
   */
  public async createContainer(req: Request, res: Response): Promise<void> {
    try {
      const config: ContainerConfig = req.body;
      
      // Validate configuration
      const { error } = validateContainerConfig(config);
      if (error) {
        res.status(400).json({ error: 'Invalid configuration', details: error.details });
        return;
      }
      
      // Create the container (replace dockerService with containerService)
      const containerId = await containerService.createContainer(config);
      
      // Get container details (replace dockerService with containerService)
      const containerInfo = await containerService.getContainer(containerId);
      
      res.status(201).json({
        id: containerId,
        name: containerInfo.Name.replace('/', ''),
        status: containerInfo.State.Status
      });
    } catch (error: any) {
      logger.error('Error creating container:', error);
      res.status(500).json({ error: 'Failed to create container', message: error.message });
    }
  }

  /**
   * Get details of a specific container
   */
  public async getContainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const containerInfo = await containerService.getContainer(id);
      
      res.json({
        id: containerInfo.Id,
        name: containerInfo.Name.replace('/', ''),
        image: containerInfo.Config.Image,
        created: containerInfo.Created,
        status: containerInfo.State.Status,
        ports: this.formatPorts(containerInfo),
        memory: containerInfo.HostConfig.Memory,
        cpu: containerInfo.HostConfig.NanoCpus ? containerInfo.HostConfig.NanoCpus / 1000000000 : null,
        env: containerInfo.Config.Env,
        volumes: containerInfo.HostConfig.Binds
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ error: 'Container not found' });
      } else {
        logger.error(`Error getting container details: ${error.message}`);
        res.status(500).json({ error: 'Failed to get container details', message: error.message });
      }
    }
  }

  /**
   * List all containers
   */
  public async listContainers(req: Request, res: Response): Promise<void> {
    try {
      const all = req.query.all === 'true';
      const containers = await containerService.listContainers(all);
      
      res.json(containers.map(container => ({
        id: container.Id,
        name: container.Names[0].replace('/', ''),
        image: container.Image,
        status: container.State,
        created: container.Created,
        ports: container.Ports.map(port => ({
          privatePort: port.PrivatePort,
          publicPort: port.PublicPort,
          type: port.Type
        }))
      })));
    } catch (error: any) {
      logger.error('Error listing containers:', error);
      res.status(500).json({ error: 'Failed to list containers', message: error.message });
    }
  }

  /**
   * Remove a container
   */
  public async removeContainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const force = req.query.force === 'true';
      
      await containerService.removeContainer(id, force);
      
      res.json({ message: `Container ${id} removed successfully` });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ error: 'Container not found' });
      } else {
        logger.error(`Error removing container: ${error.message}`);
        res.status(500).json({ error: 'Failed to remove container', message: error.message });
      }
    }
  }

  /**
   * Install dependencies in an existing container
   */
  public async installDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { dependencies } = req.body;
      
      if (!Array.isArray(dependencies) || dependencies.length === 0) {
        res.status(400).json({ error: 'Dependencies must be a non-empty array' });
        return;
      }
      
      // Check if container exists
      await containerService.getContainer(id);
      
      // Install dependencies
      // Note: We'll add the implementation in dockerService
      res.json({ message: `Dependencies installation started in container ${id}` });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ error: 'Container not found' });
      } else {
        logger.error(`Error installing dependencies: ${error.message}`);
        res.status(500).json({ error: 'Failed to install dependencies', message: error.message });
      }
    }
  }

  /**
   * Start a container
   */
  public async startContainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await containerService.startContainer(id);
      res.json({ message: `Container ${id} started successfully` });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to start container');
    }
  }

  /**
   * Stop a container
   */
  public async stopContainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await containerService.stopContainer(id);
      res.json({ message: `Container ${id} stopped successfully` });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to stop container');
    }
  }

  /**
   * Restart a container
   */
  public async restartContainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await containerService.restartContainer(id);
      res.json({ message: `Container ${id} restarted successfully` });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to restart container');
    }
  }

  /**
   * Update container configuration
   */
  public async updateContainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const config = req.body;
      
      // Validate configuration
      // Add appropriate validation for update parameters
      
      await containerService.updateContainer(id, config);
      
      res.json({ message: `Container ${id} updated successfully` });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to update container');
    }
  }

  /**
   * Ensure a container keeps running by adding a background process
   */
  public async keepAlive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Get the container
      const container = containerService.docker.getContainer(id);
      
      // Create exec to run the keep-alive process
      const exec = await container.exec({
        Cmd: ['sh', '-c', 'nohup sh -c "while true; do sleep 300; done" > /dev/null 2>&1 &'],
        AttachStdout: true,
        AttachStderr: true
      });
      
      // Start the exec instance
      await exec.start({});
      
      res.json({ message: `Keep-alive process started in container ${id}` });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to start keep-alive process');
    }
  }

  /**
   * Clone GitHub repo and run Node.js server in a container
   */
  public async setupNodeServer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      // Clone repo and start server
      await containerService.cloneAndRunServer(id);
      
      res.json({ 
        message: `Node.js server setup completed in container ${id}`,
        details: "Repository cloned and server started" 
      });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to set up Node.js server');
    }
  }

  /**
   * Check if a container exists
   */
  public async checkContainerExists(containerId: string): Promise<boolean> {
    try {
      await containerService.getContainer(containerId);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw error; // Re-throw 404 error
      }
      throw new Error(`Failed to check container: ${error.message}`);
    }
  }

  /**
   * Format port mapping information from container details
   */
  private formatPorts(containerInfo: any): any[] {
    const ports: any[] = [];
    const exposedPorts = containerInfo.Config.ExposedPorts || {};
    const portBindings = containerInfo.HostConfig.PortBindings || {};
    
    Object.keys(exposedPorts).forEach(port => {
      const [containerPort, protocol] = port.split('/');
      
      if (portBindings[port]) {
        portBindings[port].forEach((binding: any) => {
          ports.push({
            containerPort: parseInt(containerPort),
            hostPort: binding.HostPort ? parseInt(binding.HostPort) : null,
            hostIp: binding.HostIp || '0.0.0.0',
            protocol
          });
        });
      } else {
        ports.push({
          containerPort: parseInt(containerPort),
          hostPort: null,
          hostIp: null,
          protocol
        });
      }
    });
    
    return ports;
  }

  // Helper function for error handling
  private handleError(error: any, res: Response, message: string): void {
    logger.error(`${message}: ${error.message}`);
    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Container not found' });
    } else {
      res.status(500).json({ error: message, message: error.message });
    }
  }
}

// Export singleton instance
export const containerController = new ContainerController();