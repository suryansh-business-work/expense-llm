import { ToolModel } from "./tools-api.models";
import type { CreateToolDTO, UpdateToolDTO } from "./tools-api.validators";

export const createTool = async (dto: CreateToolDTO) => ToolModel.create(dto);

export const listToolsByServer = async (mcpServerId: string) => 
  ToolModel.find({ mcpServerId }).sort({ createdAt: -1 });

export const getTool = async (toolId: string) =>
  ToolModel.findOne({ toolId });

export const updateTool = async (toolId: string, dto: UpdateToolDTO) =>
  ToolModel.findOneAndUpdate({ toolId }, dto, { new: true });

export const deleteTool = async (toolId: string, userId: string) =>
  ToolModel.findOneAndDelete(
    { toolId, createdBy: userId }
  );

export const getToolCount = async (mcpServerId: string) =>
  ToolModel.countDocuments({ mcpServerId, active: true });

// Physical delete - use with caution, soft delete recommended for most cases
export const permanentDeleteTool = async (toolId: string, userId: string) =>
  ToolModel.findOneAndDelete({ toolId, createdBy: userId });