import { Request, Response } from 'express';
import { validate } from 'class-validator';
import {
  CreateChildBotDTO,
  UpdateChildBotDTO,
  ShareChildBotDTO,
} from './childbot.validators';
import * as service from './childbot.services';
import { errorResponse, successResponse } from '../../utils/response-object';

export const createChildBot = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new CreateChildBotDTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const userId = (req as any).userId;
    const bot = await service.createChildBot(userId, dto);
    return successResponse(res, { bot }, 'Bot created');
  } catch (err) {
    return errorResponse(res, err, 'Failed to create bot');
  }
};

export const updateChildBot = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new UpdateChildBotDTO(), req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const botId = req.params.id;
    const bot = await service.updateChildBot(botId, dto);
    if (!bot) return errorResponse(res, null, 'Bot not found');
    return successResponse(res, { bot }, 'Bot updated');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update bot');
  }
};

export const deleteChildBot = async (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    const userId = (req as any).userId;
    await service.deleteChildBot(botId, userId);
    return successResponse(res, null, 'Bot deleted');
  } catch (err) {
    return errorResponse(res, err, 'Failed to delete bot');
  }
};

export const listChildBotsByType = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type } = req.body;
    if (!type) return errorResponse(res, null, 'Type is required');
    const bots = await service.listChildBotsForUserByType(userId, type);
    return successResponse(res, { bots }, 'Bots fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch bots');
  }
};
