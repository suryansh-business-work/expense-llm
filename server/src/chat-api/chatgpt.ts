import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Get OpenAI API key from .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Calls OpenAI ChatGPT and returns the response as a string.
 */
export async function getChatGptResponse(userInput: string): Promise<string> {
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
    return fullResponse;
  } catch (err) {
    return "Error contacting ChatGPT API.";
  }
}
