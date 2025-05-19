import { OpenAI } from "openai";
import dotenv from "dotenv";
import { successResponse, errorResponse } from "../utils/response-object";
import { Router, Request, Response } from "express";
import { authenticateJWT } from "../auth/auth.middleware";
const router = Router();

dotenv.config();

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

/**
 * Express handler for ChatGPT API (non-streaming, for API usage).
 */
export async function getChatGptResponseAPI(req: Request, res: Response) {
  try {
    const userInput = req.body.userInput;
    if (!userInput) {
      return errorResponse(res, null, "userInput is required");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userInput }],
      max_tokens: 256,
    });

    return successResponse(res, { prompt: completion.choices?.[0]?.message?.content || "" }, 'Prompt fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch prompt');
  }
}

router.post('/prompt', authenticateJWT, getChatGptResponseAPI);

export default router;
