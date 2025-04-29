// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from '../db/db'; // ✅ Import Mongo connection
import { parseExpense } from './parser';
import categories from '../models/categoryModel';
import cards from '../models/cardModel';
import Expense from '../db/models/expenseModel';

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

// POST /parse-expense route where chatId is added
app.post('/parse-expense', async (req: Request, res: Response): Promise<any> => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { sentence, chatId } = req.body;  // Destructure chatId from the request body

  // Validate that chatId is provided
  if (!chatId || typeof chatId !== 'string') {
    return res.status(400).json({ error: 'chatId is required and must be a string' });
  }

  if (!sentence || typeof sentence !== 'string') {
    return res.status(400).json({ error: 'No valid sentence provided. Please provide a sentence as a string.' });
  }

  try {
    const result = parseExpense(sentence);

    if (typeof result.amount !== 'number') {
      return res.status(400).json({ error: 'Parsing error: Amount must be a valid number' });
    }

    // Create a new expense document with chatId included
    const newExpense = new Expense({
      expense_category: result.expense_category,
      amount: result.amount,
      expense_from: result.expense_from,
      chatId,  // Add chatId to the expense document
    });

    const savedExpense = await newExpense.save();

    return res.status(200).json({
      ...savedExpense.toObject(),
      storedInDB: true,
      available_categories: categories,
      available_cards: cards,
    });
  } catch (error) {
    console.error('Parsing error:', error);
    return res.status(500).json({ error: 'An error occurred during parsing' });
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
