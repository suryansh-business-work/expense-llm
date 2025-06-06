import { Request, Response } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import * as service from "./tools-api.services";
import { CreateToolDTO, UpdateToolDTO } from "./tools-api.validators";
import {
  successResponse,
  errorResponse,
  noContentResponse,
} from '../../utils/response-object';

const handleValidation = async (dto: any, res: Response) => {
  const errors = await validate(dto, { skipMissingProperties: true });
  if (errors.length) {
    errorResponse(res, errors, "Validation failed");
    return false;
  }
  return true;
};

export const createTool = async (req: any, res: Response) => {
  try {
    // Add the authenticated user ID to the DTO
    req.body.createdBy = req.userId;
    
    const dto = plainToClass(CreateToolDTO, req.body);
    if (!(await handleValidation(dto, res))) return;
    
    const tool = await service.createTool(dto);
    successResponse(res, tool, "Tool created successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to create tool");
  }
};

export const listTools = async (req: Request, res: Response) => {
  try {
    const { mcpServerId } = req.params;
    if (!mcpServerId) {
      return errorResponse(res, null, "MCP Server ID is required");
    }
    
    const tools = await service.listToolsByServer(mcpServerId);
    if (!tools || tools.length === 0) {
      return noContentResponse(res, [], "No tools found for this server");
    }
    
    successResponse(res, tools, "Tools fetched successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to fetch tools");
  }
};

export const getTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await service.getTool(id);
    
    if (!tool) {
      return noContentResponse(res, null, "Tool not found");
    }
    
    successResponse(res, tool, "Tool fetched successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to fetch tool");
  }
};

export const updateTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToClass(UpdateToolDTO, req.body);
    
    if (!(await handleValidation(dto, res))) return;
    
    const tool = await service.updateTool(id, dto);
    if (!tool) {
      return noContentResponse(res, null, "Tool not found or you don't have permission");
    }
    
    successResponse(res, tool, "Tool updated successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to update tool");
  }
};

export const deleteTool = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const tool = await service.deleteTool(id, userId);
    if (!tool) {
      return noContentResponse(res, null, "Tool not found or you don't have permission");
    }
    
    successResponse(res, tool, "Tool deactivated successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to deactivate tool");
  }
};

export const getToolCount = async (req: Request, res: Response) => {
  try {
    const { mcpServerId } = req.params;
    const count = await service.getToolCount(mcpServerId);
    
    successResponse(res, { count }, "Tool count fetched successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to fetch tool count");
  }
};