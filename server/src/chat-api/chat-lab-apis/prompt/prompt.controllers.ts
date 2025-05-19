import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePromptDTO } from './prompt.validator';
import { errorResponse, successResponse } from '../../../utils/response-object';
import * as service from './prompt.service';

export const updatePrompt = async (req: Request, res: Response) => {
  try {
    const { chatBotId } = req.params;
    const dto = plainToInstance(UpdatePromptDTO, req.body);

    // Validate DTO
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', data: errors, status: 'error', statusCode: 400 });
    }

    // Validate output is valid JSON for each prompt
    for (const p of dto.prompt) {
      if (p.output && p.output.trim()) {
        try {
          JSON.parse(p.output);
        } catch {
          return res.status(400).json({ message: `Output for prompt "${p.name}" is not valid JSON`, status: 'error', statusCode: 400 });
        }
      }
    }

    // Ensure only one isUseForChat is true
    if (dto.prompt.filter(p => p.isUseForChat).length > 1) {
      return res.status(400).json({ message: "Only one prompt can have isUseForChat=true", status: 'error', statusCode: 400 });
    }

    const updated = await service.updateBotPrompt(chatBotId, dto.prompt, true);
    if (!updated) return errorResponse(res, null, 'Bot not found');
    return successResponse(res, { prompt: updated.prompt }, 'Prompt updated');
  } catch (err: any) {
    return res.status(500).json({ message: err.message, status: 'error', statusCode: 500 });
  }
};

export const getPrompt = async (req: Request, res: Response) => {
  try {
    const { chatBotId } = req.params;
    let promptDoc = await service.getBotPrompt(chatBotId);
    if (!promptDoc) {
      promptDoc = await service.updateBotPrompt(chatBotId, [], true);
    }
    return successResponse(res, { prompt: promptDoc ? promptDoc.prompt : [] }, 'Prompt fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch prompt');
  }
};
