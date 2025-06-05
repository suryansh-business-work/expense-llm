import { Request, Response } from 'express';
import { validate } from 'class-validator';
import {
  CreateBotDTO,
  UpdateBotDTO
} from './bots.validators';
import * as service from './bots.services';
import { successResponse, errorResponse } from '../utils/response-object';

export const createBot = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new CreateBotDTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const userId = (req as any).userId;
    const bot = await service.createBot(userId, dto);
    return successResponse(res, { bot }, 'Bot created');
  } catch (err) {
    return errorResponse(res, err, 'Failed to create bot');
  }
};

export const updateBot = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new UpdateBotDTO(), req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const botId = req.params.id;
    const bot = await service.updateBot(botId, dto);
    if (!bot) return errorResponse(res, null, 'Bot not found');
    return successResponse(res, { bot }, 'Bot updated');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update bot');
  }
};

export const deleteBot = async (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    const userId = (req as any).userId;
    await service.deleteBot(botId, userId);
    return successResponse(res, null, 'Bot deleted');
  } catch (err) {
    return errorResponse(res, err, 'Failed to delete bot');
  }
};

export const listBotsByCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bots = await service.listBotsForUserByCategory(userId);
    return successResponse(res, { bots }, 'Bots fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch bots');
  }
};

export const getBotById = async (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    const bot = await service.getBotById(botId);
    if (!bot) return errorResponse(res, null, 'Bot not found');
    return successResponse(res, { bot }, 'Bot details fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch bot details');
  }
};
