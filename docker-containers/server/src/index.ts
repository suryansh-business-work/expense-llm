import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { logger } from './utils/logger';
import { apiRouter } from './routes/api.routes';
import { terminalService } from './services/terminal.service';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3500;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket for terminal
terminalService.initializeWebSocket(server);

// Set up security headers with CSP configured for socket.io
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:3500", "wss://localhost:3500", "http://localhost:3500"],
      scriptSrc: ["'self'", "https://cdn.socket.io", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRouter);

// Serve static files
app.use('/static', express.static(path.join(__dirname, '../templates')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Service is running' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});