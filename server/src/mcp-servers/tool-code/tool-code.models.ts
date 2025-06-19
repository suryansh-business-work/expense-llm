import { Schema, model } from 'mongoose';

const toolCodeSchema = new Schema({
  toolId: { type: String, required: true, unique: true },
  toolCode: { type: String, required: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });  // Enable timestamps

export const ToolCodeModel = model('ToolCode', toolCodeSchema);
