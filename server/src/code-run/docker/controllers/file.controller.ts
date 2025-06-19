import { Request, Response } from 'express';
import { fileManagementService } from '../services/file.services';
import { logger } from '../utils/logger';
import { containerService } from '../services/container.services';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import multer from 'multer';

// Extend Express Request type to include 'file' property for multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Configure multer for file uploads
const upload = multer({ dest: os.tmpdir() });

export class FileController {
  /**
   * List files in a directory
   */
  public async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path = '/' } = req.query;
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      const files = await fileManagementService.listFiles(id, path as string);
      res.json(files);
    } catch (error: any) {
      this.handleError(error, res, 'Failed to list files');
    }
  }
  
  /**
   * Get file content
   */
  public async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path } = req.query;
      
      if (!path) {
        res.status(400).json({ error: 'File path is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      const content = await fileManagementService.getFileContent(id, path as string);
      res.send(content);
    } catch (error: any) {
      this.handleError(error, res, 'Failed to get file content');
    }
  }
  
  /**
   * Write file content
   */
  public async writeFileContent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path } = req.query;
      const { content } = req.body;
      
      if (!path) {
        res.status(400).json({ error: 'File path is required' });
        return;
      }
      
      if (content === undefined) {
        res.status(400).json({ error: 'File content is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      await fileManagementService.writeFileContent(id, path as string, content);
      res.json({ message: 'File content updated successfully' });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to write file content');
    }
  }
  
  /**
   * Create directory
   */
  public async createDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path } = req.body;
      
      if (!path) {
        res.status(400).json({ error: 'Directory path is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      await fileManagementService.createDirectory(id, path);
      res.json({ message: 'Directory created successfully' });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to create directory');
    }
  }
  
  /**
   * Delete file or directory
   */
  public async deleteFileOrDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path, recursive = false } = req.body;
      
      if (!path) {
        res.status(400).json({ error: 'File/directory path is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      await fileManagementService.deleteFileOrDirectory(id, path, recursive);
      res.json({ message: 'File/directory deleted successfully' });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to delete file/directory');
    }
  }
  
  /**
   * Rename/move file or directory
   */
  public async moveFileOrDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { oldPath, newPath } = req.body;
      
      if (!oldPath || !newPath) {
        res.status(400).json({ error: 'Both old and new paths are required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      await fileManagementService.moveFileOrDirectory(id, oldPath, newPath);
      res.json({ message: 'File/directory moved successfully' });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to move file/directory');
    }
  }
  
  /**
   * Copy file or directory
   */
  public async copyFileOrDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sourcePath, destinationPath } = req.body;
      
      if (!sourcePath || !destinationPath) {
        res.status(400).json({ error: 'Both source and destination paths are required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      await fileManagementService.copyFileOrDirectory(id, sourcePath, destinationPath);
      res.json({ message: 'File/directory copied successfully' });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to copy file/directory');
    }
  }
  
  /**
   * Get file info
   */
  public async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path } = req.query;
      
      if (!path) {
        res.status(400).json({ error: 'File path is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      const fileInfo = await fileManagementService.getFileInfo(id, path as string);
      res.json(fileInfo);
    } catch (error: any) {
      this.handleError(error, res, 'Failed to get file info');
    }
  }
  
  /**
   * Search files
   */
  public async searchFiles(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { directory = '/', pattern } = req.query;
      
      if (!pattern) {
        res.status(400).json({ error: 'Search pattern is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      const files = await fileManagementService.searchFiles(id, directory as string, pattern as string);
      res.json(files);
    } catch (error: any) {
      this.handleError(error, res, 'Failed to search files');
    }
  }
  
  /**
   * Upload file to container
   */
  public async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { destination } = req.body;
      const file = req.file;
      
      logger.info(`Upload request received for container ${id} to path ${destination}`);
      
      if (!file) {
        logger.warn('No file provided in upload request');
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      
      if (!destination) {
        logger.warn('No destination path provided in upload request');
        res.status(400).json({ error: 'Destination path is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      // Ensure destination directory exists
      logger.info(`Creating destination directory ${destination} if it doesn't exist`);
      await fileManagementService.createDirectory(id, destination);
      
      // Copy file to container
      const containerPath = path.posix.join(destination, file.originalname);
      logger.info(`Copying file ${file.path} to container ${id} at ${containerPath}`);
      await fileManagementService.copyFileToContainer(id, file.path, containerPath);
      
      // Clean up temp file
      fs.unlinkSync(file.path);
      
      logger.info(`File uploaded successfully to container ${id}`);
      res.json({ 
        message: 'File uploaded successfully',
        path: containerPath
      });
    } catch (error: any) {
      // Clean up temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      logger.error(`File upload error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      this.handleError(error, res, 'Failed to upload file');
    }
  }
  
  /**
   * Download file from container
   */
  public async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { path: filePath } = req.query;
      
      if (!filePath) {
        res.status(400).json({ error: 'File path is required' });
        return;
      }
      
      // Check if container exists
      await this.checkContainerExists(id);
      
      // Get file info to check if it exists and get the filename
      const fileInfo = await fileManagementService.getFileInfo(id, filePath as string);
      
      // Create temp file to store the downloaded content
      const tempFile = path.join(os.tmpdir(), `download-${Date.now()}-${path.basename(filePath as string)}`);
      
      // Download file from container
      await fileManagementService.getFileFromContainer(id, filePath as string, tempFile);
      
      // Send file as download
      res.download(tempFile, path.basename(filePath as string), (err) => {
        // Clean up temp file after sending
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (err && !res.headersSent) {
          this.handleError(err, res, 'Failed to download file');
        }
      });
    } catch (error: any) {
      this.handleError(error, res, 'Failed to download file');
    }
  }
  
  /**
   * Check if a container exists
   */
  private async checkContainerExists(containerId: string): Promise<boolean> {
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
   * Helper for consistent error handling
   */
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
export const fileController = new FileController();