import { errorResponse, successResponse } from "../../utils/response-object";
import * as service from "./subscription-usage.service";
import { Request, Response } from "express";

export const createUsage = async (req: Request, res: Response) => {
  try {
    const usage = await service.createUsage(req.body);
    return successResponse(res, { usage }, "Usage recorded");
  } catch (err) {
    return errorResponse(res, err, "Failed to record usage");
  }
};

export const getUsageByUser = async (req: Request, res: Response) => {
  try {
    const { botOwnerUserId } = req.params;
    const usage = await service.getUsageByUser(botOwnerUserId);
    return successResponse(res, { usage }, "Usage fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch usage");
  }
};

export const getUsageByBot = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const usage = await service.getUsageByBot(botId);
    return successResponse(res, { usage }, "Usage fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch usage");
  }
};

export const getUsageByDateRange = async (req: Request, res: any) => {
  try {
    const { botOwnerUserId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required in DDMMYYYY format" });
    }
    const result = await service.getUsageByDateRange(
      botOwnerUserId,
      String(startDate),
      String(endDate)
    );
    return res.json({ ...result, status: "success" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch usage", error: err });
  }
};