import { WebSocketServer } from "ws";
import { getChatGptResponse } from "./chatgpt";
import { webScrapperPrompt } from "./website-scraper/prompt";
import { scrapeEmailsFromWebsite, scrapePhonesFromWebsite } from "./website-scraper/website-scraper";

let wss: WebSocketServer | null = null;


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

        // Use the helper function to get the response
        const botMessageRaw = await getChatGptResponse(`${webScrapperPrompt} User Input: ${userInput}`);
        if (botMessageRaw === undefined) {
          ws.send(JSON.stringify({ error: "Failed to get a response from the AI." }));  
        } else {
          let botMessage: any;
          try {
            botMessage = typeof botMessageRaw === "string" ? JSON.parse(botMessageRaw) : botMessageRaw;
          } catch {
            botMessage = { message: botMessageRaw };
          }
          console.log("Bot message:", botMessage);
          if (botMessage?.functionName === 'scrapeEmailsFromWebsite') {
            const response = await scrapeEmailsFromWebsite(botMessage?.functionParams?.url);
            ws.send(JSON.stringify(response));
          } else if (botMessage?.functionName === 'scrapePhonesFromWebsite') {
            const response = await scrapePhonesFromWebsite(botMessage?.functionParams?.url);
            ws.send(JSON.stringify(response));
          } else {
            ws.send(await getChatGptResponse(userInput));
          }
        }
      });
    });

    console.log("WebSocket chat server running on ws://localhost:8080");
  }
}
