import { Request, Response } from "express";
import { validate } from "class-validator";
import * as service from "./mcp-servers.services";
import {
  CreateMcpServerDTO, UpdateMcpServerDTO,
  CreateMcpServerDetailsDTO, UpdateMcpServerDetailsDTO,
  CreateMcpServerPricingDTO, UpdateMcpServerPricingDTO
} from "./mcp-servers.validators";

import {
  successResponse,
  errorResponse,
  noContentResponse,
} from '../utils/response-object'; // adjust path as needed

const handleValidation = async (dto: any, res: Response) => {
  const errors = await validate(dto, { skipMissingProperties: true });
  if (errors.length) {
    errorResponse(res, errors, "Validation failed");
    return false;
  }
  return true;
};

export const createMcpServer = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new CreateMcpServerDTO(), req.body);
    if (!(await handleValidation(dto, res))) return;
    const server = await service.createMcpServer(dto);
    successResponse(res, server, "MCP Server created successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to create MCP Server");
  }
};

export const updateMcpServer = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new UpdateMcpServerDTO(), req.body);
    if (!(await handleValidation(dto, res))) return;
    const server = await service.updateMcpServer(req.params.id, dto);
    if (!server) return noContentResponse(res, null, "MCP Server not found");
    successResponse(res, server, "MCP Server updated successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to update MCP Server");
  }
};

export const deleteMcpServer = async (req: any, res: Response) => {
  try {
    const userId = req?.userId;
    const deleted = await service.deleteMcpServer(req.params.id, userId);
    if (!deleted) return noContentResponse(res, null, "MCP Server not found");
    successResponse(res, deleted, "MCP Server deleted successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to delete MCP Server");
  }
};

export const getMcpServerDetails = async (req: Request, res: Response) => {
  try {
    const details = await service.getMcpServerDetails(req.params.id);
    if (!details || !details.length) return noContentResponse(res, null, "No MCP Server details found");
    successResponse(res, details[0], "MCP Server details fetched successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to fetch MCP Server details");
  }
};

export const createMcpServerDetails = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new CreateMcpServerDetailsDTO(), req.body);
    if (!(await handleValidation(dto, res))) return;
    const details = await service.createMcpServerDetails(dto);
    successResponse(res, details, "MCP Server details created successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to create MCP Server details");
  }
};

export const updateMcpServerDetails = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new UpdateMcpServerDetailsDTO(), req.body);
    if (!(await handleValidation(dto, res))) return;
    const details = await service.updateMcpServerDetails(req.params.id, dto);
    if (!details) return noContentResponse(res, null, "MCP Server details not found");
    successResponse(res, details, "MCP Server details updated successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to update MCP Server details");
  }
};

export const createMcpServerPricing = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new CreateMcpServerPricingDTO(), req.body);
    if (!(await handleValidation(dto, res))) return;
    const pricing = await service.createMcpServerPricing(dto);
    successResponse(res, pricing, "MCP Server pricing created successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to create MCP Server pricing");
  }
};

export const updateMcpServerPricing = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new UpdateMcpServerPricingDTO(), req.body);
    if (!(await handleValidation(dto, res))) return;
    const pricing = await service.updateMcpServerPricing(req.params.id, dto);
    if (!pricing) return noContentResponse(res, null, "MCP Server pricing not found");
    successResponse(res, pricing, "MCP Server pricing updated successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to update MCP Server pricing");
  }
};

export const listMcpServersByUser = async (req: any, res: any) => {
  try {
    // userId should be set by authenticateJWT middleware, e.g. req.user.userId
    const userId = req?.userId;
    if (!userId) return errorResponse(res, null, "Unauthorized");
    const servers = await service.listMcpServersByUser(userId);
    if (!servers || !servers.length) return noContentResponse(res, [], "No MCP Servers found");
    successResponse(res, servers, "MCP Servers fetched successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to fetch MCP Servers");
  }
};
