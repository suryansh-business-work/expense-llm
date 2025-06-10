import { Request, Response } from "express";
import * as service from "./tool-code.services";
import {
  successResponse,
  errorResponse,
  noContentResponse,
} from '../../utils/response-object';

/**
 * Create or update tool
 * If toolId exists, updates the tool
 * If toolId doesn't exist, creates a new tool
 */
export const createTool = async (req: any, res: Response) => {
  try {
    const { toolId, toolCode } = req.body;
    
    if (!toolCode) {
      return errorResponse(res, null, "toolCode is required");
    }
    
    const createdBy = req.userId;
    const result = await service.createTool(toolId, toolCode, createdBy);
    
    successResponse(
      res, 
      result, 
      result.isNew ? "Tool created successfully" : "Tool updated successfully"
    );
  } catch (err) {
    errorResponse(res, err, "Failed to create/update tool");
  }
};

/**
 * Get tool by toolId
 */
export const getTool = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const tool = await service.getTool(toolId);
    
    if (!tool) {
      return noContentResponse(res, null, "Tool not found");
    }
    
    successResponse(res, tool, "Tool fetched successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to fetch tool");
  }
};

/**
 * Delete tool by toolId
 */
export const deleteTool = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const result = await service.deleteTool(toolId);
    
    if (result.deletedCount === 0) {
      return noContentResponse(res, null, "Tool not found");
    }
    
    successResponse(res, { success: true }, "Tool deleted successfully");
  } catch (err) {
    errorResponse(res, err, "Failed to delete tool");
  }
};