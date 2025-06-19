import express from 'express';
import path from 'path';
import fs from 'fs';
import { containerController } from '../controllers/container.controller';
import { terminalController } from '../controllers/terminal.controller';
import multer from 'multer';
import * as os from 'os';

// Add the file controller import
import { fileController } from '../controllers/file.controller';

// Import Dockerode directly for version/status
import Docker from 'dockerode';

// Set up multer for file uploads
const upload = multer({ dest: os.tmpdir() });

export const dockerContainerRoutes = express.Router();

// Container routes
dockerContainerRoutes.post('/docker-status', containerController.createContainer.bind(containerController));
dockerContainerRoutes.post('/containers', containerController.createContainer.bind(containerController));
dockerContainerRoutes.get('/containers', containerController.listContainers.bind(containerController));
dockerContainerRoutes.get('/containers/:id', containerController.getContainer.bind(containerController));
dockerContainerRoutes.delete('/containers/:id', containerController.removeContainer.bind(containerController));
dockerContainerRoutes.post('/containers/:id/dependencies', containerController.installDependencies.bind(containerController));

// Container state management routes
dockerContainerRoutes.post('/containers/:id/start', containerController.startContainer.bind(containerController));
dockerContainerRoutes.post('/containers/:id/stop', containerController.stopContainer.bind(containerController));
dockerContainerRoutes.post('/containers/:id/restart', containerController.restartContainer.bind(containerController));
dockerContainerRoutes.patch('/containers/:id', containerController.updateContainer.bind(containerController));
dockerContainerRoutes.post('/containers/:id/setup-node-server', containerController.setupNodeServer.bind(containerController));

// Terminal routes
dockerContainerRoutes.post('/containers/:id/terminal/execute', terminalController.executeCommand.bind(terminalController));

// Docker status route
dockerContainerRoutes.get('/status', async (req, res) => {
  try {
    const { containerService } = await import('../services/container.services');
    const status = await containerService.checkDockerStatus();
    if (status) {
      res.json({ status: 'connected' });
    } else {
      res.status(500).json({ status: 'disconnected' });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Terminal client endpoint
dockerContainerRoutes.get('/containers/:id/terminal/client', async (req, res) => {
  const containerId = req.params.id;
  
  try {
    // Check if container exists
    await containerController.checkContainerExists(containerId);
    
    // Read the terminal client HTML file
    const templatePath = path.join(__dirname, '../../templates/terminal-client.html');
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholder with actual container ID
    html = html.replace('{{containerId}}', containerId);
    
    // Send the HTML with proper content type
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).send(`<h1>Container not found: ${containerId}</h1>`);
    } else {
      res.status(500).send(`<h1>Error loading terminal client</h1><p>${error.message}</p>`);
    }
  }
});

// File management routes
dockerContainerRoutes.get('/containers/:id/files', fileController.listFiles.bind(fileController));
dockerContainerRoutes.get('/containers/:id/files/content', fileController.getFileContent.bind(fileController));
dockerContainerRoutes.post('/containers/:id/files/content', fileController.writeFileContent.bind(fileController));
dockerContainerRoutes.post('/containers/:id/directories', fileController.createDirectory.bind(fileController));
dockerContainerRoutes.delete('/containers/:id/files', fileController.deleteFileOrDirectory.bind(fileController));
dockerContainerRoutes.post('/containers/:id/files/move', fileController.moveFileOrDirectory.bind(fileController));
dockerContainerRoutes.post('/containers/:id/files/copy', fileController.copyFileOrDirectory.bind(fileController));
dockerContainerRoutes.get('/containers/:id/files/info', fileController.getFileInfo.bind(fileController));
dockerContainerRoutes.get('/containers/:id/files/search', fileController.searchFiles.bind(fileController));
dockerContainerRoutes.post('/containers/:id/files/upload', upload.single('file'), fileController.uploadFile.bind(fileController));
dockerContainerRoutes.get('/containers/:id/files/download', fileController.downloadFile.bind(fileController));

// New route: Docker version and running status
dockerContainerRoutes.get('/docker-info', async (req, res) => {
  try {
    const docker = new Docker({
      socketPath: process.platform === 'win32'
        ? '//./pipe/docker_engine'
        : '/var/run/docker.sock'
    });

    // Try to get Docker info and version
    const [info, version] = await Promise.all([
      docker.info(),
      docker.version()
    ]);

    res.json({
      status: 'running',
      version: version.Version,
      apiVersion: version.ApiVersion,
      serverVersion: info.ServerVersion,
      operatingSystem: info.OperatingSystem,
      containers: info.Containers,
      images: info.Images,
      info
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'not running',
      error: error.message
    });
  }
});
