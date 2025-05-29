import mongoose, { Schema, model } from "mongoose";

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


const SubcriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  tokenCount: { type: Number, required: true, default: 0 }
},
{ timestamps: true }
);

export const SubcriptionModel = mongoose.model("Subcription", SubcriptionSchema);
export const SubscriptionUsageModel = model("SubscriptionUsage", subscriptionUsageSchema);