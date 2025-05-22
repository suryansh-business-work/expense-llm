import { Schema, model } from "mongoose";

const subscriptionUsageSchema = new Schema(
  {
    promptTokenSize: { type: Number, required: true },
    prompt: { type: String, required: true },
    userContext: { type: Object, required: true },
    botId: { type: String, required: true, index: true },
    botOwnerUserId: { type: String, required: true }
  },
  { timestamps: true }
);

export const SubscriptionUsageModel = model("SubscriptionUsage", subscriptionUsageSchema);