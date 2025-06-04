import { Schema, model, models, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Bot model (actual bot data)
const botSchema = new Schema({
  botId: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  category: {
    value: { type: String, required: true },
    label: { type: String, required: true }
  },
}, { timestamps: true });

export const BotModel = models.Bot || model('Bot', botSchema);

const userBotMappingSchema = new Schema({
  userId: { type: String, required: true },
  botId: { type: String, required: true, ref: 'Bot' },
  ownerId: { type: String },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  sharedVia: { type: String, enum: ['email', null], default: null },
  sharedIdentifier: { type: String, default: null },
}, { timestamps: true });

export const UserBotMappingModel = models.UserBotMapping || model('UserBotMapping', userBotMappingSchema);
