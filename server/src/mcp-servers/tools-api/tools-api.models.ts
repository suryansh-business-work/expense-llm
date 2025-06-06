import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const paramSchema = new Schema({
  paramName: { type: String, required: true },
  paramType: { type: String, required: true }
}, { _id: false });

const toolSchema = new Schema({
  toolId: { type: String, default: uuidv4, unique: true },
  mcpServerId: { type: String, required: true },
  toolName: { type: String, required: true },
  toolDescription: { type: String, default: '' },
  toolParams: [paramSchema],
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

// Index for faster lookups by mcpServerId
toolSchema.index({ mcpServerId: 1 });

export const ToolModel = model('Tool', toolSchema);