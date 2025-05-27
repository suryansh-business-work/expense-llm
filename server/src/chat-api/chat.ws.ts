import { WebSocketServer } from "ws";
import { getChatGptResponse } from "./chatgpt";
import { scrapeEmailsFromWebsite, scrapePhonesFromWebsite } from "./website-scraper/website-scraper";
import { getBotPrompt } from "./chat-lab-apis/prompt/prompt.service";
import * as service from "../chat-api/chat-messages-api/message.service";
import { createUsage } from "./subscription-api/subscription-usage.service";
import { encode } from "gpt-tokenizer";

let wss: WebSocketServer | null = null;

export function startWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ port: 8081 });

    wss.on("connection", (ws) => {
      ws.on("message", async (message) => {
        try {
          const clientData = JSON.parse(message.toString());
          const { firstLoadConnect, chatBotId, userInput, role, userContext } = clientData;

          // On initial connect, send chat history
          if (firstLoadConnect) {
            const result = await service.getMessages(chatBotId);
            ws.send(JSON.stringify(result));
            return;
          }

          // Save user message
          if (userInput && role === "user") {
            await service.createMessage({
              botId: chatBotId,
              role: "user",
              content: userInput,
              userContext: userContext
            });
          }

          // Get prompt for the bot (if needed for context)
          let promptString = "";
          try {
            const promptDoc = await getBotPrompt(chatBotId);
            if (promptDoc && Array.isArray(promptDoc.prompt) && promptDoc.prompt.length > 0) {
              // Only use prompts where isUseForChat is true
              promptString = promptDoc.prompt
                .filter((p: any) => p.isUseForChat)
                .map((p: any) => {
                  // Combine prompt, output example, and userInput
                  return `${p.prompt} ${p.output ? "\nExample Output: " + p.output : ""}\nUser Input: ${userInput}`;
                })
                .join("\n\n");
            }
          } catch (e) {
            console.error("Failed to fetch prompt for bot:", chatBotId, e);
          }
          await createUsage({
            botId: chatBotId,
            botOwnerUserId: userContext.userId,
            promptTokenSize: encode(promptString).length,
            prompt: promptString,
            userContext: userContext
          });
          // Get bot response (with prompt context if needed)
          const botResponseRaw = await getChatGptResponse(promptString);
          let botContent = botResponseRaw;
          try {
            // Try to parse if it's JSON
            const parsed = typeof botResponseRaw === "string" ? JSON.parse(botResponseRaw) : botResponseRaw;
            if (parsed && parsed.message) botContent = parsed.message;
          } catch {
            // If not JSON, keep as is
          }

          // Save bot message
          const botResObject = {
            botId: chatBotId,
            role: "bot",
            content: botContent,
            userContext: userContext
          };
          await service.createMessage(botResObject);

          // Send bot message to client as array for consistency
          ws.send(JSON.stringify([botResObject]));
        } catch (err) {
          console.error("WebSocket message error:", err);
          ws.send(JSON.stringify({ error: "Internal server error." }));
        }
      });
    });

    console.log("WebSocket chat server running on ws://localhost:8080");
  }
}
