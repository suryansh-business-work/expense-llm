import { WebSocketServer } from "ws";
import { getChatGptResponse } from "./chatgpt";
import { scrapeEmailsFromWebsite, scrapePhonesFromWebsite } from "./website-scraper/website-scraper";
import { getBotPrompt } from "./chat-lab-apis/prompt/prompt.service";

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
        let chatBotId = "";
        let userId = "";
        try {
          const parsed = JSON.parse(message.toString());
          userInput = parsed.userInput || message.toString();
          chatBotId = parsed.chatBotId || "";
          userId = parsed.userId || "";
        } catch {
          userInput = message.toString();
        }

        // Get prompt string using bot id
        let promptString = "";
        if (chatBotId) {
          try {
            const promptDoc = await getBotPrompt(chatBotId);
            // promptDoc.prompt is an array, you can join or pick as needed
            if (promptDoc && Array.isArray(promptDoc.prompt) && promptDoc.prompt.length > 0) {
              // Example: join all prompt strings with newlines
              promptString = promptDoc.prompt.map((p: any) => p.prompt).join("\n");
            }
          } catch (e) {
            console.error("Failed to fetch prompt for bot:", chatBotId, e);
          }
        }

        // You can now use chatBotId, userId, and promptString in your logic
        console.log("Received from client:", { chatBotId, userId, userInput, promptString });

        // Use the helper function to get the response, including the prompt string
        const botMessageRaw = await getChatGptResponse(`${promptString}\nUser Input: ${userInput}`);
        console.log("`${promptString}\nUser Input: ${userInput}`", `${promptString}\nUser Input: ${userInput}`);
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
