import express from 'express';
import path from 'path';
import fs from 'fs';
import { containerController } from '../controllers/container.controller';
import { terminalController } from '../controllers/terminal.controller';

export const apiRouter = express.Router();

// Container routes
apiRouter.post('/containers', containerController.createContainer.bind(containerController));
apiRouter.get('/containers', containerController.listContainers.bind(containerController));
apiRouter.get('/containers/:id', containerController.getContainer.bind(containerController));
apiRouter.delete('/containers/:id', containerController.removeContainer.bind(containerController));
apiRouter.post('/containers/:id/dependencies', containerController.installDependencies.bind(containerController));

// Container state management routes
apiRouter.post('/containers/:id/start', containerController.startContainer.bind(containerController));
apiRouter.post('/containers/:id/stop', containerController.stopContainer.bind(containerController));
apiRouter.post('/containers/:id/restart', containerController.restartContainer.bind(containerController));
apiRouter.patch('/containers/:id', containerController.updateContainer.bind(containerController));

// Terminal routes
apiRouter.post('/containers/:id/terminal/execute', terminalController.executeCommand.bind(terminalController));

// Docker status route
apiRouter.get('/status', async (req, res) => {
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
apiRouter.get('/containers/:id/terminal/client', async (req, res) => {
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