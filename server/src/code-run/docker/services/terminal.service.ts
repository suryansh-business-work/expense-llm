import Docker from 'dockerode';
import { logger } from '../utils/logger';
import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';

export class TerminalService {
  private docker: Docker;
  private io: SocketServer | null = null;

  constructor() {
    // Check if we're on Windows or Unix
    const socketPath = process.platform === 'win32'
      ? '//./pipe/docker_engine'
      : '/var/run/docker.sock';
    
    this.docker = new Docker({ socketPath });
  }

  /**
   * Initialize WebSocket server
   */
  public initializeWebSocket(server: Server): void {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*', // In production, restrict this to your frontend domain
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`New terminal connection: ${socket.id}`);
      
      // Handle container selection
      socket.on('select-container', async (containerId: string) => {
        try {
          const container = this.docker.getContainer(containerId);
          await container.inspect(); // Check if container exists
          
          socket.data.containerId = containerId;
          socket.emit('container-selected', { success: true, containerId });
          logger.info(`Socket ${socket.id} selected container ${containerId}`);
        } catch (error: any) {
          socket.emit('error', { message: `Container not found: ${error.message}` });
        }
      });
      
      // Handle command execution
      socket.on('execute', async (command: string) => {
        const containerId = socket.data.containerId;
        
        if (!containerId) {
          socket.emit('error', { message: 'No container selected. Use select-container first.' });
          return;
        }
        
        try {
          await this.executeCommand(containerId, command, socket);
        } catch (error: any) {
          socket.emit('error', { message: `Command execution error: ${error.message}` });
        }
      });
      
      // Handle interactive shell
      socket.on('start-shell', async () => {
        const containerId = socket.data.containerId;
        
        if (!containerId) {
          socket.emit('error', { message: 'No container selected. Use select-container first.' });
          return;
        }
        
        try {
          await this.startInteractiveShell(containerId, socket);
        } catch (error: any) {
          socket.emit('error', { message: `Failed to start shell: ${error.message}` });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`Terminal connection closed: ${socket.id}`);
      });
    });
  }

  /**
   * Execute a command in container and stream output
   */
  private async executeCommand(containerId: string, command: string, socket: any): Promise<void> {
    logger.info(`Executing command in container ${containerId}: ${command}`);
    
    const container = this.docker.getContainer(containerId);
    
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true
    });
    
    const stream = await exec.start({});
    
    // Stream output back to the client
    stream.on('data', (chunk) => {
      socket.emit('output', chunk.toString());
    });
    
    // Handle stream end
    stream.on('end', async () => {
      const execInfo = await exec.inspect();
      socket.emit('finished', { 
        exitCode: execInfo.ExitCode,
        command
      });
    });
    
    // Handle stream errors
    stream.on('error', (err) => {
      logger.error(`Stream error: ${err.message}`);
      socket.emit('error', { message: `Stream error: ${err.message}` });
    });
  }

  /**
   * Start an interactive shell in the container
   */
  private async startInteractiveShell(containerId: string, socket: any): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Create exec instance
      const exec = await container.exec({
        Cmd: ['/bin/bash'],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true
      });
      
      // Start exec instance
      const stream = await exec.start({
        hijack: true,
        stdin: true
      });
      
      // Handle data from container
      stream.on('data', (chunk) => {
        socket.emit('output', chunk.toString());
      });
      
      // Handle input from client
      socket.on('input', (data: string) => {
        stream.write(data);
      });
      
      // Handle stream end
      stream.on('end', () => {
        socket.emit('shell-closed');
      });
      
      // Handle client disconnect - clean up the stream
      socket.on('disconnect', () => {
        if (stream) {
          try {
            stream.end();
          } catch (error) {
            logger.error(`Error closing stream: ${error}`);
          }
        }
      });
      
      socket.emit('shell-started');
    } catch (error: any) {
      logger.error(`Failed to start shell: ${error.message}`);
      socket.emit('error', { message: `Failed to start shell: ${error.message}` });
    }
  }
}

export const terminalService = new TerminalService();
