// Core & Third-party Imports
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import dayjs from 'dayjs';
import 'reflect-metadata';

// Swagger/OpenAPI
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Database
import { connectDB } from '../db/db';

// Auth & User APIs
import authRoutes from './auth/auth.routes';

// Bot APIs
import childBotsRoutes from './bots-api/child-bots/childbot.routes';
import botsRoutes from './bots-api/bots.routes';
import childBotSettingRoutes from './chat-api/chat-settings-api/bot.settings.routes';
import childBotLabPromptRoutes from './chat-api/chat-lab-apis/prompt/prompt.routes';
import { startWebSocketServer } from './chat-api/chat.ws';
import getChatGptResponseRoutes from './chat-api/chatgpt';

// Upload & Subscription APIs
import imageKitUploadRoutes from './upload/upload.routes';
import subscriptionRoutes from './chat-api/subscription-api/subscription-usage.routes';

// Design System APIs
import { themeRoutes } from './design-system/theme/theme.routes';
import propertyRoutes from './design-system/property/property.routes';

// Express App Initialization
const app = express();

// =====================
// Swagger Documentation
// =====================
const swaggerDocument = YAML.load(
  path.join(__dirname, './design-system/design-system.swagger.yaml')
);
app.use('/api-docs/design-system', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========
// Middleware
// ==========
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    limits: { fileSize: 999 * 1024 * 1024 }
  })
);

// ===================
// API Route Handlers
// ===================

// Auth & User
app.use('/auth', authRoutes);

// Bot APIs
app.use('/bot', botsRoutes); // Main bot routes
app.use('/bot', childBotsRoutes);
app.use('/bot', childBotLabPromptRoutes);
app.use('/bot', childBotSettingRoutes);
app.use('/bot', authRoutes); // (If needed for bot-specific auth)
app.use('/chat-gpt', getChatGptResponseRoutes);

// Upload & Subscription
app.use('/v1/api', imageKitUploadRoutes);
app.use('/v1/api/subscription-usage', subscriptionRoutes);

// Design System
app.use('/design-system', themeRoutes);
app.use('/design-system', propertyRoutes);

// ===============
// Utility Routes
// ===============
app.get('/healthcheck', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.status(200).send('Server is running');
});

app.get('/data-and-time', (_req, res) => {
  const formattedTime = dayjs().format('DD MMM YYYY hh:mm A');
  res.status(200).send(`Current time: ${formattedTime}`);
});

// ===================
// Start Server
// ===================
const startServer = async () => {
  await connectDB(); // Connect to MongoDB first

  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    startWebSocketServer(); // Start WebSocket server only after DB is connected
  });
};

startServer();

export default app;
