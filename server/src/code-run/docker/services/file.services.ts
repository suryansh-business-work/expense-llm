import Docker from 'dockerode';
import { logger } from '../utils/logger';
import { containerService } from './container.services';
import * as stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar-stream';

export class FileManagementService {
  private docker: Docker;

  constructor() {
    this.docker = containerService.docker;
  }

  /**
   * List files in a directory
   */
  public async listFiles(containerId: string, directory: string = "/"): Promise<any[]> {
    try {
      // Use ls -la to get detailed file information
      const command = `ls -la ${directory} | tail -n +2`;
      const result = await this.execCommand(containerId, command);
      
      // Parse the output into structured data
      const lines = result.output.split('\n').filter(line => line.trim() !== '');
      
      return lines.map(line => {
        // Parse ls -la output format
        const match = line.match(/^([drwx-]{10})\s+(\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\S+\s+\d+\s+[\d:]+)\s+(.+)$/);
        
        if (!match) return null;
        
        const isDirectory = match[1].charAt(0) === 'd';
        const name = match[7];
        
        // Skip . and .. entries
        if (name === '.' || name === '..') return null;
        
        return {
          name,
          isDirectory,
          permissions: match[1],
          owner: match[3],
          group: match[4],
          size: parseInt(match[5]),
          modified: match[6],
          path: path.posix.join(directory, name)
        };
      }).filter(Boolean);
    } catch (error) {
      logger.error(`Error listing files in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Get file content
   */
  public async getFileContent(containerId: string, filePath: string): Promise<string> {
    try {
      const command = `cat ${filePath}`;
      const result = await this.execCommand(containerId, command);
      return result.output;
    } catch (error) {
      logger.error(`Error reading file ${filePath} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Write content to a file
   */
  public async writeFileContent(containerId: string, filePath: string, content: string): Promise<void> {
    try {
      // Create temp file with content
      const tmpFile = path.join(os.tmpdir(), `container-${containerId}-${Date.now()}.tmp`);
      fs.writeFileSync(tmpFile, content);
      
      // Copy file into container
      await this.copyFileToContainer(containerId, tmpFile, filePath);
      
      // Clean up temp file
      fs.unlinkSync(tmpFile);
    } catch (error) {
      logger.error(`Error writing to file ${filePath} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new directory
   */
  public async createDirectory(containerId: string, dirPath: string): Promise<void> {
    try {
      const command = `mkdir -p ${dirPath}`;
      await this.execCommand(containerId, command);
    } catch (error) {
      logger.error(`Error creating directory ${dirPath} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file or directory
   */
  public async deleteFileOrDirectory(containerId: string, path: string, recursive: boolean = false): Promise<void> {
    try {
      const command = recursive ? `rm -rf ${path}` : `rm -f ${path}`;
      await this.execCommand(containerId, command);
    } catch (error) {
      logger.error(`Error deleting ${path} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Rename/move a file or directory
   */
  public async moveFileOrDirectory(containerId: string, oldPath: string, newPath: string): Promise<void> {
    try {
      const command = `mv ${oldPath} ${newPath}`;
      await this.execCommand(containerId, command);
    } catch (error) {
      logger.error(`Error moving ${oldPath} to ${newPath} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Copy a file or directory
   */
  public async copyFileOrDirectory(containerId: string, sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const command = `cp -a ${sourcePath} ${destinationPath}`;
      await this.execCommand(containerId, command);
    } catch (error) {
      logger.error(`Error copying ${sourcePath} to ${destinationPath} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Get file info (stat)
   */
  public async getFileInfo(containerId: string, filePath: string): Promise<any> {
    try {
      const command = `stat -c '%A %U %G %s %Y %n' ${filePath}`;
      const result = await this.execCommand(containerId, command);
      
      const [permissions, owner, group, size, modTime, name] = result.output.trim().split(' ');
      
      return {
        name: path.basename(name),
        path: filePath,
        size: parseInt(size),
        owner,
        group,
        permissions,
        modified: new Date(parseInt(modTime) * 1000).toISOString(),
        isDirectory: permissions.charAt(0) === 'd'
      };
    } catch (error) {
      logger.error(`Error getting file info for ${filePath} in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Search files
   */
  public async searchFiles(containerId: string, directory: string, pattern: string): Promise<string[]> {
    try {
      const command = `find ${directory} -name "${pattern}" -type f`;
      const result = await this.execCommand(containerId, command);
      return result.output.trim().split('\n').filter(Boolean);
    } catch (error) {
      logger.error(`Error searching files in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Upload a file to the container
   */
  public async copyFileToContainer(containerId: string, localFilePath: string, containerFilePath: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Prepare the tar archive options
      const dirName = path.dirname(containerFilePath);
      const fileName = path.basename(containerFilePath);
      
      // Create a tar stream from the local file
      const tarStream = await this.createTarStream(localFilePath, fileName);
      
      // Copy the tar stream to the container
      await container.putArchive(tarStream, { path: dirName });
      
      logger.info(`File uploaded to container ${containerId}: ${containerFilePath}`);
    } catch (error) {
      logger.error(`Error uploading file to container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Download a file from the container
   */
  public async getFileFromContainer(containerId: string, containerFilePath: string, localFilePath: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Get the directory containing the file
      const dirName = path.dirname(containerFilePath);
      const fileName = path.basename(containerFilePath);
      
      // Create a tar stream from the container directory
      const tarStream = await container.getArchive({ path: containerFilePath });
      
      // Extract the file from the tar stream
      await this.extractFileFromTarStream(tarStream, localFilePath);
      
      logger.info(`File downloaded from container ${containerId}: ${containerFilePath}`);
    } catch (error) {
      logger.error(`Error downloading file from container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to execute a command in a container
   */
  private async execCommand(containerId: string, command: string): Promise<{ exitCode: number, output: string }> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Create exec instance
      const exec = await container.exec({
        Cmd: ['sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true
      });
      
      // Start the exec instance
      const stream = await exec.start({});
      
      // Collect the output
      let output = '';
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString();
        });
        
        stream.on('end', async () => {
          try {
            const execInfo = await exec.inspect();
            resolve({
              exitCode: execInfo.ExitCode ?? 0,
              output: output
            });
          } catch (err) {
            reject(err);
          }
        });
        
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error(`Error executing command in container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Helper to create a tar stream from a file
   */
  private async createTarStream(filePath: string, filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const pack = tar.pack();
        const fileContent = fs.readFileSync(filePath);
        
        // Add the file to the tar stream
        pack.entry({ name: filename, size: fileContent.length }, fileContent);
        pack.finalize();
        
        // Collect the tar stream into a buffer
        const chunks: Buffer[] = [];
        pack.on('data', (chunk: Buffer) => chunks.push(chunk));
        pack.on('error', reject);
        pack.on('end', () => resolve(Buffer.concat(chunks)));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Helper to extract a file from a tar stream
   */
  private async extractFileFromTarStream(tarStream: NodeJS.ReadableStream, destPath: string): Promise<void> {
    // This is a simplified example - in a real implementation,
    // you would use a library like tar-stream to extract from a tar file
    // For now, this is a placeholder
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(destPath);
      tarStream.pipe(fileStream);
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  }
}

// Export singleton instance
export const fileManagementService = new FileManagementService();