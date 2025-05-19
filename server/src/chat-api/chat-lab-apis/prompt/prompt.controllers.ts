import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePromptDTO } from './prompt.validator';
import { errorResponse, successResponse } from '../../../utils/response-object';
import * as service from './prompt.service';

export const updatePrompt = async (req: Request, res: Response) => {
  try {
    const { chatBotId } = req.params;
    // Transform plain body to DTO instance
    const dto = plainToInstance(UpdatePromptDTO, req.body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', data: errors, status: 'error', statusCode: 400 });
    }
    // Upsert: create if not exists, update if exists
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
    // If not found, create a new entry with empty prompt array
    if (!promptDoc) {
      promptDoc = await service.updateBotPrompt(chatBotId, [], true);
    }
    return successResponse(res, { prompt: promptDoc ? promptDoc.prompt : [] }, 'Prompt fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch prompt');
  }
};