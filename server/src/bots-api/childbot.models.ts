import { Schema, model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ChildBot model (actual bot data)
const childBotSchema = new Schema({
  botId: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. 'finance', 'professional'
  description: { type: String, default: '' },
  tags: [{ type: String }],
  category: { type: String, default: '' },
}, { timestamps: true });

export const ChildBotModel = model('ChildBot', childBotSchema);

// UserBotMapping model (user access/sharing)
const userBotMappingSchema = new Schema({
  userId: { type: String, required: true }, // was Types.ObjectId
  botId: { type: String, required: true, ref: 'ChildBot' },
  ownerId: { type: String }, // was Types.ObjectId
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  sharedVia: { type: String, enum: ['email', 'phone', null], default: null },
  sharedIdentifier: { type: String, default: null },
}, { timestamps: true });

export const UserBotMappingModel = model('UserBotMapping', userBotMappingSchema);