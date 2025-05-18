import { Request, Response } from 'express';
import { validate } from 'class-validator';
import * as service from './bot.settings.service';
import { errorResponse, successResponse } from '../../utils/response-object';
import { CreateChatSettingDTO, UpdateChatSettingDTO } from './bot.settings.validator';

export const createChatSetting = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new CreateChatSettingDTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const setting = await service.createChatSetting(dto);
    return successResponse(res, { setting }, 'Chat setting created');
  } catch (err) {
    return errorResponse(res, err, 'Failed to create chat setting');
  }
};

export const getChatSetting = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const setting = await service.getChatSetting(botId);
    if (!setting) return errorResponse(res, null, 'Setting not found');
    return successResponse(res, { setting }, 'Chat setting fetched');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch chat setting');
  }
};

export const updateChatSetting = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const dto = Object.assign(new UpdateChatSettingDTO(), req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const setting = await service.updateChatSetting(botId, dto);
    return successResponse(res, { setting }, 'Chat setting updated');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update chat setting');
  }
};

export const deleteChatSetting = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    await service.deleteChatSetting(botId);
    return successResponse(res, null, 'Chat setting deleted');
  } catch (err) {
    return errorResponse(res, err, 'Failed to delete chat setting');
  }
};

export const patchChatSetting = async (req: Request, res: Response) => {
  try {
    const { chatBotId } = req.params;
    const update = req.body;
    const updated = await service.updateChatSetting(chatBotId, update);
    if (!updated) return res.status(404).json({ message: 'Setting not found' });
    res.json({ setting: updated });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ message: errorMessage });
  }
};
