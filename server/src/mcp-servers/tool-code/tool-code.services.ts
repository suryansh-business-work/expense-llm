import { ToolCodeModel } from "./tool-code.models";

/**
 * Create or update tool
 */
export const createTool = async (toolId: string | undefined, toolCode: string, createdBy: string) => {
  const id = toolId; // Generate ID if not provided
  
  const existingTool = await ToolCodeModel.findOne({ toolId: id });
  const isNew = !existingTool;
  
  const tool = await ToolCodeModel.findOneAndUpdate(
    { toolId: id },
    { toolId: id, toolCode, createdBy },
    { upsert: true, new: true }
  );
  
  return { ...tool.toObject(), isNew };
};

/**
 * Get tool by ID
 */
export const getTool = async (toolId: string) => 
  ToolCodeModel.findOne({ toolId });

/**
 * Delete tool by ID
 */
export const deleteTool = async (toolId: string) => 
  ToolCodeModel.deleteOne({ toolId });