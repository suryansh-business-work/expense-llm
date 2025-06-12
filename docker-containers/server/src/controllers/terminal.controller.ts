import { Request, Response } from 'express';
import { containerService } from '../services/container.services';
import { logger } from '../utils/logger';

export class TerminalController {
  /**
   * Execute a single command in a container and return result
   * Used for simple REST API access to container terminal
   */
  public async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { command } = req.body;
      
      if (!command || typeof command !== 'string') {
        res.status(400).json({ error: 'Command is required and must be a string' });
        return;
      }
      
      // Check if container exists
      const containerInfo = await containerService.getContainer(id);
      const container = containerService.docker.getContainer(id);
      
      // Create exec instance
      const exec = await container.exec({
        Cmd: ['sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true
      });
      
      // Start exec instance
      const stream = await exec.start({});
      
      // Collect output
      let output = '';
      
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
      
      // Return result when done
      stream.on('end', async () => {
        const execInfo = await exec.inspect();
        
        res.json({
          exitCode: execInfo.ExitCode,
          output: output
        });
      });
      
      // Handle errors
      stream.on('error', (err) => {
        logger.error(`Stream error: ${err.message}`);
        res.status(500).json({ error: `Command execution error: ${err.message}` });
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ error: 'Container not found' });
      } else {
        logger.error(`Error executing command: ${error.message}`);
        res.status(500).json({ error: `Command execution error: ${error.message}` });
      }
    }
  }
}

export const terminalController = new TerminalController();