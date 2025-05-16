import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import ExpenseBotReplyMsgModel from "../../../db/models/expenseBotReplyMsgModel";
import {
  extractExpenseDataWithGPT,
  createExpenseHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
  listExpensesByDateHandler,
  listAllExpensesHandler,
} from "./expense-bot.handlers";

const wss = new WebSocket.Server({ port: 8081 });

wss.on("listening", () => {
  console.log("🟢 WebSocket server is running on ws://localhost:8081");
});
wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});
wss.on("connection", (ws, req) => {
  const userId = req.headers["x-user-id"] as string || "demo-user";

  ws.on("message", async (message: string) => {
    let userMessage: string;
    let msgId = uuidv4();
    try {
      const parsed = JSON.parse(message);
      userMessage = parsed.userMessage;
    } catch (err) {
      ws.send(JSON.stringify({ error: "Invalid JSON format or missing chatId in message." }));
      return;
    }


    // Use ChatGPT to classify and extract in one call
    let data;
    try {
      data = await extractExpenseDataWithGPT(userMessage);
    } catch (err) {
      ws.send(JSON.stringify({ error: "Failed to process message with GPT." }));
      return;
    }

    let response;
    switch (data.type) {
      case "create-expense":
        response = await createExpenseHandler(userId, userMessage);
        break;
      case "update-expense":
        response = await updateExpenseHandler(userId, userMessage);
        break;
      case "delete-expense":
        response = await deleteExpenseHandler(userId, userMessage);
        break;
      case "list-expense-by-date":
        response = await listExpensesByDateHandler(userId, userMessage);
        break;
      case "list-all-expenses": {
        response = await listExpensesByDateHandler(userId, userMessage);
        break;
      }
      default:
        response = { message: "Unknown command.", data: {} };
    }

    // Save bot message (except for list-all-expenses, which is just a fetch)
    if (data.type !== "list-all-expenses") {
      await ExpenseBotReplyMsgModel.create({
        userId,
        botMsg: response.message,
        msgId,
        createdAt: new Date(),
        ...response.data,
      });
    }

    ws.send(JSON.stringify({ botMessage: response }));
  });
});

export default wss;
