import { McpServerModel, McpServerDetailsModel, McpServerPricingModel } from "./mcp-servers.models";
import type { CreateMcpServerDTO, UpdateMcpServerDTO, CreateMcpServerDetailsDTO, UpdateMcpServerDetailsDTO, CreateMcpServerPricingDTO, UpdateMcpServerPricingDTO } from "./mcp-servers.validators";

export const createMcpServer = async (dto: CreateMcpServerDTO) => McpServerModel.create(dto);
export const updateMcpServer = async (id: string, dto: UpdateMcpServerDTO) =>
  McpServerModel.findOneAndUpdate({ mcpServerId: id }, dto, { new: true });
export const deleteMcpServer = async (id: string, userId: string) =>
  McpServerModel.findOneAndDelete({ mcpServerId: id, userId });

export const createMcpServerDetails = async (dto: CreateMcpServerDetailsDTO) => McpServerDetailsModel.create(dto);
export const updateMcpServerDetails = async (id: string, dto: UpdateMcpServerDetailsDTO) =>
  McpServerDetailsModel.findOneAndUpdate({ mcpServerId: id }, dto, { new: true });

export const createMcpServerPricing = async (dto: CreateMcpServerPricingDTO) => McpServerPricingModel.create(dto);
export const updateMcpServerPricing = async (id: string, dto: UpdateMcpServerPricingDTO) =>
  McpServerPricingModel.findOneAndUpdate({ mcpServerId: id }, dto, { new: true });

export const getMcpServerDetails = async (id: string) => {
  return McpServerModel.aggregate([
    { $match: { mcpServerId: id } },
    {
      $lookup: {
        from: "mcpserverdetails",
        localField: "mcpServerId",
        foreignField: "mcpServerId",
        as: "details",
      },
    },
    { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "mcpserverpricings",
        localField: "mcpServerId",
        foreignField: "mcpServerId",
        as: "pricing",
      },
    },
    { $unwind: { path: "$pricing", preserveNullAndEmptyArrays: true } },
  ]);
};

export const listMcpServersByUser = async (userId: string) => {
  return McpServerModel.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: "mcpserverdetails",
        localField: "mcpServerId",
        foreignField: "mcpServerId",
        as: "details",
      },
    },
    { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "mcpserverpricings",
        localField: "mcpServerId",
        foreignField: "mcpServerId",
        as: "pricing",
      },
    },
    { $unwind: { path: "$pricing", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "mcpserverreviews",
        localField: "mcpServerId",
        foreignField: "mcpServerId",
        as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating: { $avg: "$reviews.mcpServerRatingGivenByUser" },
        totalReviews: { $size: "$reviews" },
      },
    },
  ]);
};