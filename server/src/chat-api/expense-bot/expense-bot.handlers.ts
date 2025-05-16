import dayjs from "dayjs";
import { ExpenseModel } from "./expense-bot.model";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

export async function extractExpenseDataWithGPT(userMessage: string) {
  const prompt = `
Extract the following fields from this expense message:
- category (e.g. food, travel, shopping)
- amount (number)
- currency (e.g. USD, INR, EUR)
- from (e.g. credit-card, cash, wallet)
- time (natural language, e.g. yesterday, today, last week)

Return a JSON object with these fields. If a field is missing, use null.

User message: "${userMessage}"
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that extracts structured data from expense messages." },
      { role: "user", content: prompt },
    ],
    temperature: 0,
    max_tokens: 200,
  });

  // Try to parse the JSON from the response
  const text = completion.choices[0].message?.content || "{}";
  try {
    return JSON.parse(text);
  } catch {
    // fallback: try to extract JSON substring
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {};
  }
}

// 1. Create Expense
export async function createExpenseHandler(userId: string, userMessage: string) {
  const data = await extractExpenseDataWithGPT(userMessage);
  // Convert time to Date if possible
  if (data.time) {
    data.time = dayjs(data.time, ["YYYY-MM-DD", "MMMM D, YYYY", "MMM D, YYYY", "dddd", "YYYY/MM/DD", "YYYY.MM.DD", "YYYY-MM-DDTHH:mm:ssZ", "YYYY-MM-DDTHH:mm:ss.SSSZ"]).isValid()
      ? dayjs(data.time).toDate()
      : dayjs().toDate();
  } else {
    data.time = dayjs().toDate();
  }
  const expense = await ExpenseModel.create({ ...data, userId });
  return {
    message: "I have saved your expense.",
    data: expense,
  };
}

// 2. Update Expense
export async function updateExpenseHandler(userId: string, userMessage: string) {
  const data = await extractExpenseDataWithGPT(userMessage);
  if (data.time) {
    data.time = dayjs(data.time).isValid() ? dayjs(data.time).toDate() : dayjs().toDate();
  }
  const expense = await ExpenseModel.findOneAndUpdate(
    { userId, category: data.category },
    data,
    { new: true }
  );
  return {
    message: "I have updated your expense.",
    data: expense,
  };
}

// 3. Delete Expense
export async function deleteExpenseHandler(userId: string, userMessage: string) {
  const data = await extractExpenseDataWithGPT(userMessage);
  const expense = await ExpenseModel.findOneAndDelete({ userId, category: data.category });
  return {
    message: "I have deleted your expense.",
    data: expense,
  };
}

// 4. List Expenses by Date
export async function listExpensesByDateHandler(userId: string, userMessage: string) {
  // Use GPT to extract date if present
  const data = await extractExpenseDataWithGPT(userMessage);
  let date = dayjs();
  if (data.time) {
    date = dayjs(data.time);
  }
  const start = date.startOf("day").toDate();
  const end = date.endOf("day").toDate();
  const expenses = await ExpenseModel.find({
    userId,
    time: { $gte: start, $lte: end },
  });
  return {
    message: `Here are your expenses for ${date.format("YYYY-MM-DD")}:`,
    data: expenses,
  };
}

// 5. List All Expenses
export async function listAllExpensesHandler(userId: string) {
  const expenses = await ExpenseModel.find({ userId });
  return {
    message: "Here are all your expenses:",
    data: expenses,
  };
}
