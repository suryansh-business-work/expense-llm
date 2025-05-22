// src/server.ts
import express from 'express';
import cors from 'cors';
import { connectDB } from '../db/db';

import bodyParser from 'body-parser';
// Models Import
import dayjs from 'dayjs';
import authRoutes from './auth/auth.routes';
import childBotsRoutes from './bots-api/childbot.routes';
import childBotSettingRoutes from './chat-api/chat-settings-api/bot.settings.routes';
import childBotLabPromptRoutes from './chat-api/chat-lab-apis/prompt/prompt.routes';
import { startWebSocketServer } from './chat-api/chat.ws';
import getChatGptResponseRoutes from './chat-api/chatgpt';
import imageKitUploadRoutes from './upload/upload.routes';
import fileUpload from 'express-fileupload'
import subscriptionRoutes from './chat-api/subscription-api/subscription-usage.routes';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
  fileUpload({
    limits: { fileSize: 999 * 1024 * 1024 }
    // safeFileNames: true,
    // preserveExtension: true,
    // useTempFiles : false,
    // tempFileDir : 'uploads/'
  })
)

app.use('/auth', authRoutes);
app.use('/bot', childBotsRoutes);
app.use('/bot', childBotLabPromptRoutes);
app.use('/bot', childBotSettingRoutes);
app.use('/chat-gpt', getChatGptResponseRoutes);
app.use('/v1/api', imageKitUploadRoutes);
app.use('/v1/api/subscription-usage', subscriptionRoutes);

// Chat bot lab APIs
app.use('/bot', authRoutes);

// Routes
app.get('/healthcheck', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Adding a root route handler
app.get('/', (_req, res) => {
  res.status(200).send('Server is running');
});

app.get('/data-and-time', (_req, res) => {
  const formattedTime = dayjs().format('DD MMM YYYY hh:mm A');
  res.status(200).send(`Current time: ${formattedTime}`);
});

// Start server after DB connects
const startServer = async () => {
  await connectDB(); // ✅ Connect to MongoDB first

  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    startWebSocketServer(); // Start WebSocket server only after DB is connected
  });
};

startServer();

export default app;
