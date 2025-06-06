import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const mcpServerSchema = new Schema({
  mcpServerId: { type: String, default: uuidv4, unique: true },
  mcpServerCreatorId: { type: String, required: true },
  userId: { type: String, required: true },
  mcpServerName: { type: String, required: true },
}, { timestamps: true });

const mcpServerDetailsSchema = new Schema({
  mcpServerId: { type: String, required: true, unique: true },
  mcpServerOverview: { type: String, default: '' },
  mcpServerTags: [{ type: Schema.Types.Mixed }],
  mcpServerCategory: { type: String, default: '' },
  mcpServerPrivacy: { type: String, default: '' },
  mcpServerPricingId: { type: String, default: '' },
  mcpServerIcon: { type: String, default: '' },
  mcpServerImages: [{ type: Schema.Types.Mixed }],
  mcpServerSupport: { type: String, default: '' },
}, { timestamps: true });

const mcpServerPricingSchema = new Schema({
  mcpServerId: { type: String, required: true, unique: true },
  mcpServerPrice: { type: Number, required: true },
  mcpServerPerRequest: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
}, { timestamps: true });

const commentSchema = new Schema({
  comment: { type: String, required: true },
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  userContext: { type: String, required: true },
});

const mcpServerReviewSchema = new Schema({
  mcpServerId: { type: String, required: true },
  userContext: { type: String, required: true },
  mcpServerRatingGivenByUser: { type: Number, min: 1, max: 5, required: true },
  mcpServerComments: [commentSchema],
}, { timestamps: true });

export const McpServerModel = model('McpServer', mcpServerSchema);
export const McpServerDetailsModel = model('McpServerDetails', mcpServerDetailsSchema);
export const McpServerPricingModel = model('McpServerPricing', mcpServerPricingSchema);
export const McpServerReviewModel = model('McpServerReview', mcpServerReviewSchema);