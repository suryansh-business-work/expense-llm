import { WebSocketServer } from "ws";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

let wss: WebSocketServer | null = null;

// Get OpenAI API key from .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Initializes the WebSocket server.
 * Call this only after the database connection is established.
 */
export function startWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ port: 8080 });

    wss.on("connection", (ws) => {
      ws.on("message", async (message) => {
        let userInput = "";
        try {
          const parsed = JSON.parse(message.toString());
          userInput = parsed.userInput || message.toString();
        } catch {
          userInput = message.toString();
        }

        // Use OpenAI npm package for streaming response
        try {
          const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userInput }],
            stream: true,
            max_tokens: 256,
          });

          let fullResponse = "";
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
            }
          }
          ws.send(fullResponse);
        } catch (err) {
          ws.send("Error contacting ChatGPT API.");
        }
      });
    });

    console.log("WebSocket chat server running on ws://localhost:8080");
  }
}
