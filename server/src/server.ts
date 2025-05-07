// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from '../db/db'; // ✅ Import Mongo connection
import { parseExpense } from './parser';
import { v4 as uuidv4 } from 'uuid';

// Models Import
import ExpenseBotReplyMsgModel from '../db/models/expenseBotReplyMsgModel';
import ExpenseUserMsgModel from '../db/models/ExpenseUserMsgModel';
import dayjs from 'dayjs';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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


// POST /parse-expense route where chatId is added
app.post('/create/expense', async (req: Request, res: Response): Promise<any> => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  const generatedMsgId = uuidv4()
  const { userMsg, chatId } = req.body;
  if (!userMsg || typeof userMsg !== 'string') {
    return res.status(400).json({ error: 'User message is required and must be a string' });
  }

  try {
    const result = parseExpense(userMsg);
    if (typeof result.amount !== 'number') {
      return res.status(400).json({ errorType: 'parsing-error', error: 'Parsing error: Amount must be a valid number' });
    }
    console.log(chatId, 'chatId')
    const userMsgSave = new ExpenseUserMsgModel({
      chatId: chatId,
      userMsg: userMsg,
      msgId: generatedMsgId,
    });

    const botMsgSave = new ExpenseBotReplyMsgModel({
      chatId: chatId,
      expenseCategory: result.expenseCategory,
      amount: result.amount,
      expenseFrom: result.expenseFrom,
      msgId: generatedMsgId
    });

    const savedUserExpense = await userMsgSave.save();
    const savedBotExpense = await botMsgSave.save();
    return res.status(200).json({
      user: savedUserExpense.toObject(),
      bot: savedBotExpense.toObject()
    });
  } catch (error) {
    return res.status(500).json({  errorType: 'parsing-error', error: 'An error occurred during parsing' });
  }
});



app.get('/list/expenses', async (req: Request, res: Response): Promise<any> => {
  const { chatId, limit = '20' } = req.query;

  if (!chatId || typeof chatId !== 'string') {
    return res.status(400).json({ error: 'chatId is required and must be a string' });
  }

  const parsedLimit = parseInt(limit as string, 10);
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res.status(400).json({ error: 'limit must be a positive number' });
  }

  try {
    const query: any = { chatId };
    const sortOrder = 1;
    const expenseBotReplyMsgRes = await ExpenseBotReplyMsgModel.find(query)
      .sort({ _id: sortOrder })
      .limit(parsedLimit);
    const expenseUserMsgRes = await ExpenseUserMsgModel.find(query)
      .sort({ _id: sortOrder })
      .limit(parsedLimit);
    return res.status(200).json({ expenseBotReplyMsgRes, expenseUserMsgRes });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Error fetching expenses' });
  }
});

app.delete('/delete/expenses', async (req: Request, res: Response): Promise<any> => {
  const { chatId, msgIds } = req.body;

  if (!chatId || typeof chatId !== 'string') {
    return res.status(400).json({ error: 'Chat ID is required and must be a string' });
  }

  if (!Array.isArray(msgIds) || msgIds.length === 0) {
    return res.status(400).json({ error: 'Message IDs are required and must be a non-empty array' });
  }

  try {
    const botDeleteRes = await ExpenseBotReplyMsgModel.deleteMany({
      chatId: chatId,
      msgId: { $in: msgIds }
    });

    const userDeleteRes = await ExpenseUserMsgModel.deleteMany({
      chatId: chatId,
      msgId: { $in: msgIds }
    });

    const totalDeleted = botDeleteRes.deletedCount + userDeleteRes.deletedCount;

    if (totalDeleted === 0) {
      return res.status(404).json({ error: 'No messages found for deletion' });
    }

    return res.status(200).json({ message: 'Expenses deleted successfully', deletedCount: totalDeleted });
  } catch (error) {
    console.error('Error deleting expenses:', error);
    return res.status(500).json({ error: 'An error occurred while deleting expenses' });
  }
});

// Start server after DB connects
const startServer = async () => {
  await connectDB(); // ✅ Connect to MongoDB first

  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
  });
};

startServer();
