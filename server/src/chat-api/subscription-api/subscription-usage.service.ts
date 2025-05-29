import { SubcriptionModel, SubscriptionUsageModel } from "./subscription-usage.model";

export const createUsage = async (data: any) => {
  return SubscriptionUsageModel.create(data);
};

export const getUsageByUser = async (botOwnerUserId: string) => {
  return SubscriptionUsageModel.find({ botOwnerUserId }).sort({ timestamp: -1 });
};

export const getUsageByBot = async (botId: string) => {
  return SubscriptionUsageModel.find({ botId }).sort({ timestamp: -1 });
};

export const getUsageByDateRange = async (
  botOwnerUserId: string,
  startDate: string,
  endDate: string
) => {
  const history = await SubscriptionUsageModel.find({
    botOwnerUserId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).sort({ createdAt: -1 });

  // Use findOne to get a single subscription entry for the user
  const userCurrentTokenCount = await SubcriptionModel.findOne({ userId: botOwnerUserId });

  const totalPromptTokenSize = history.reduce(
    (sum, item) => sum + (item.promptTokenSize || 0),
    0
  );

  return { totalPromptTokenSize, history, userCurrentTokenCount };
};
